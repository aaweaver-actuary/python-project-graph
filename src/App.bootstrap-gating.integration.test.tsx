// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { StrictMode, type ComponentProps } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

const { wu03LabelPrefixByKind } = vi.hoisted(() => ({
  wu03LabelPrefixByKind: {
    module: "[WU03-MODULE]",
    class: "[WU03-CLASS]",
    method: "[WU03-METHOD]",
    function: "[WU03-FUNCTION]",
    constant: "[WU03-CONSTANT]",
    import: "[WU03-IMPORT]",
    variable: "[WU03-VARIABLE]",
    package: "[WU03-PACKAGE]",
  } as const,
}));

vi.mock("./graph/styles", async () => {
  const actual =
    await vi.importActual<typeof import("./graph/styles")>("./graph/styles");

  return {
    ...actual,
    getNodeKindVisualSemantics: (kind: keyof typeof wu03LabelPrefixByKind) => ({
      ...actual.getNodeKindVisualSemantics(kind),
      iconToken: `mock-icon:${kind}`,
      labelPrefix: wu03LabelPrefixByKind[kind],
    }),
  };
});

import App from "./App";
import type { GraphBootstrapState } from "./graph/bootstrap.contracts";
import type { GraphPayload } from "./graph/contracts";
import { graphFixturePayload } from "./graph/fixture-data-source.adapter";
import { GraphCanvas } from "./graph/graph-canvas";
import type { DetailPanelProps, NodeDetails } from "./graph/node-details";

type AppBootstrapRunner = () => Promise<GraphBootstrapState>;

interface AppBootstrapProps {
  runBootstrap: AppBootstrapRunner;
}

interface GraphCanvasBoundaryProps {
  payload: GraphPayload;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  focusRequest?: {
    requestId: string | number;
    nodeId: string;
  };
}

interface NodeDetailsBoundaryProps {
  id: string;
  name: string;
  kind: GraphPayload["nodes"][number]["kind"];
  module: string;
  file_path: string;
  line_start?: number;
  line_end?: number;
  inboundCount: number;
  outboundCount: number;
}

interface DetailPanelBoundaryProps {
  details: NodeDetailsBoundaryProps | null;
}

const BOOTSTRAP_LOADING_VIEW_TEST_ID = "bootstrap-loading-view";
const BOOTSTRAP_READY_VIEW_TEST_ID = "bootstrap-ready-view";
const BOOTSTRAP_INVALID_VIEW_TEST_ID = "bootstrap-invalid-payload-view";
const READY_LAYOUT_TEST_ID = "ready-layout";
const DETAIL_PANEL_RAIL_TEST_ID = "detail-panel-rail";
const GRAPH_CANVAS_TEST_ID = "graph-canvas";
const GRAPH_NODE_TEST_ID = "graph-node";
const GRAPH_EDGE_TEST_ID = "graph-edge";
const DETAIL_PANEL_TEST_ID = "detail-panel";
const DETAIL_NAME_TEST_ID = "detail-name";
const DETAIL_KIND_TEST_ID = "detail-kind";
const DETAIL_MODULE_TEST_ID = "detail-module";
const DETAIL_FILE_PATH_TEST_ID = "detail-file-path";
const DETAIL_LINE_RANGE_TEST_ID = "detail-line-range";
const DETAIL_INBOUND_COUNT_TEST_ID = "detail-inbound-count";
const DETAIL_OUTBOUND_COUNT_TEST_ID = "detail-outbound-count";
const GRAPH_NODE_SELECTED_CLASS = "graph-node--selected";
const GRAPH_NODE_SELECTED_FONT_WEIGHT = "700";
const GRAPH_EDGE_HIGHLIGHTED_CLASS = "graph-edge--highlighted";
const GRID_TEMPLATE_COLUMNS_NONE_VALUE = "none";

const BOOTSTRAP_VIEW_TEST_IDS = [
  BOOTSTRAP_LOADING_VIEW_TEST_ID,
  BOOTSTRAP_READY_VIEW_TEST_ID,
  BOOTSTRAP_INVALID_VIEW_TEST_ID,
] as const;

type BootstrapViewTestId = (typeof BOOTSTRAP_VIEW_TEST_IDS)[number];

interface DeferredPromise<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

const createDeferredPromise = <T,>(): DeferredPromise<T> => {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return {
    promise,
    resolve,
    reject,
  };
};

const renderAppWithBootstrapRunner = (runBootstrap: AppBootstrapRunner) =>
  render(<App runBootstrap={runBootstrap} />);

const renderStrictModeAppWithBootstrapRunner = (
  runBootstrap: AppBootstrapRunner,
) =>
  render(
    <StrictMode>
      <App runBootstrap={runBootstrap} />
    </StrictMode>,
  );

const createReadyBootstrapRunner = (payload: GraphPayload) =>
  vi.fn<AppBootstrapRunner>().mockResolvedValue({
    state: "ready",
    payload,
  });

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getWu03DeterministicLabelPrefix = (
  node: GraphPayload["nodes"][number],
): string => wu03LabelPrefixByKind[node.kind];

const createPayloadWithCounts = (
  nodeCount: number,
  edgeCount: number,
): GraphPayload => {
  if (nodeCount < 1) {
    throw new Error("nodeCount must be greater than zero");
  }

  const nodes: GraphPayload["nodes"] = Array.from(
    { length: nodeCount },
    (_, index) => ({
      id: `module.node.${index}`,
      kind: "module",
      name: `node-${index}`,
      module: `module.node.${index}`,
      file_path: `src/module/node_${index}.py`,
    }),
  );

  const edges: GraphPayload["edges"] = Array.from(
    { length: edgeCount },
    (_, index) => ({
      source: nodes[index % nodeCount].id,
      target: nodes[(index + 1) % nodeCount].id,
      kind: "dependency",
    }),
  );

  return { nodes, edges };
};

const expectOnlyBootstrapViewVisible = (
  expectedViewTestId: BootstrapViewTestId,
): void => {
  const renderedViewTestIds = BOOTSTRAP_VIEW_TEST_IDS.filter(
    (testId) => screen.queryByTestId(testId) !== null,
  );

  expect(renderedViewTestIds).toEqual([expectedViewTestId]);
  expect(screen.getByTestId(expectedViewTestId)).toBeVisible();
};

const expectReadyViewPayloadCounts = (payload: GraphPayload): void => {
  expect(screen.getByText(`Nodes: ${payload.nodes.length}`)).toBeVisible();
  expect(screen.getByText(`Edges: ${payload.edges.length}`)).toBeVisible();
};

const expectInvalidPayloadErrorsVisible = (
  invalidPayloadView: HTMLElement,
  expectedErrors: readonly string[],
): void => {
  for (const errorMessage of expectedErrors) {
    expect(within(invalidPayloadView).getByText(errorMessage)).toBeVisible();
  }
};

const getGraphNodeElementById = (
  graphCanvas: HTMLElement,
  nodeId: string,
): HTMLElement => {
  const nodeElement = graphCanvas.querySelector(
    `[data-testid="${GRAPH_NODE_TEST_ID}"][data-node-id="${nodeId}"]`,
  );

  expect(nodeElement).not.toBeNull();

  return nodeElement as HTMLElement;
};

const getGraphEdgeBySourceTarget = (
  graphCanvas: HTMLElement,
  source: string,
  target: string,
): HTMLElement => {
  const edgeElement = graphCanvas.querySelector(
    `[data-testid="${GRAPH_EDGE_TEST_ID}"][data-edge-source="${source}"][data-edge-target="${target}"]`,
  );

  expect(edgeElement).not.toBeNull();

  return edgeElement as HTMLElement;
};

const expectGraphNodeSelectionVisualState = (
  nodeElement: HTMLElement,
  expectedSelected: boolean,
): void => {
  expect(nodeElement).toHaveAttribute(
    "data-selected",
    expectedSelected ? "true" : "false",
  );

  if (expectedSelected) {
    expect(nodeElement).toHaveStyle({
      fontWeight: GRAPH_NODE_SELECTED_FONT_WEIGHT,
    });

    expect(nodeElement).toHaveClass(GRAPH_NODE_SELECTED_CLASS);

    return;
  }

  expect(nodeElement).not.toHaveStyle({
    fontWeight: GRAPH_NODE_SELECTED_FONT_WEIGHT,
  });

  expect(nodeElement).not.toHaveClass(GRAPH_NODE_SELECTED_CLASS);
};

const expectEdgeHighlightedState = (
  edgeElement: HTMLElement,
  expectedHighlighted: boolean,
): void => {
  expect(edgeElement).toHaveAttribute(
    "data-highlighted",
    expectedHighlighted ? "true" : "false",
  );

  if (expectedHighlighted) {
    expect(edgeElement).toHaveClass(GRAPH_EDGE_HIGHLIGHTED_CLASS);

    return;
  }

  expect(edgeElement).not.toHaveClass(GRAPH_EDGE_HIGHLIGHTED_CLASS);
};

const expectSelectedNodeCount = (
  graphCanvas: HTMLElement,
  expectedCount: number,
): void => {
  const selectedNodes = within(graphCanvas)
    .getAllByTestId(GRAPH_NODE_TEST_ID)
    .filter(
      (nodeElement) => nodeElement.getAttribute("data-selected") === "true",
    );

  expect(selectedNodes).toHaveLength(expectedCount);
};

const expectOnlySelectedNode = (
  graphCanvas: HTMLElement,
  expectedSelectedNodeId: string | null,
): void => {
  for (const fixtureNode of graphFixturePayload.nodes) {
    const graphNode = getGraphNodeElementById(graphCanvas, fixtureNode.id);
    const expectedSelectedValue = fixtureNode.id === expectedSelectedNodeId;

    expectGraphNodeSelectionVisualState(graphNode, expectedSelectedValue);
  }

  expectSelectedNodeCount(graphCanvas, expectedSelectedNodeId === null ? 0 : 1);
};

const expectDetailFieldValue = (
  detailPanel: HTMLElement,
  fieldTestId: string,
  expectedValue: string,
): void => {
  expect(within(detailPanel).getByTestId(fieldTestId)).toHaveTextContent(
    expectedValue,
  );
};

const countTopLevelTrackSegments = (templateValue: string): number => {
  let segmentCount = 0;
  let parenthesisDepth = 0;
  let hasTokenContent = false;

  for (const character of templateValue.trim()) {
    if (character === "(") {
      parenthesisDepth += 1;
      hasTokenContent = true;
      continue;
    }

    if (character === ")") {
      parenthesisDepth = Math.max(parenthesisDepth - 1, 0);
      hasTokenContent = true;
      continue;
    }

    if (/\s/.test(character) && parenthesisDepth === 0) {
      if (hasTokenContent) {
        segmentCount += 1;
        hasTokenContent = false;
      }
      continue;
    }

    hasTokenContent = true;
  }

  if (hasTokenContent) {
    segmentCount += 1;
  }

  return segmentCount;
};

const parseExplicitRepeatTrackCount = (
  templateValue: string,
): number | null => {
  const repeatMatch = templateValue.trim().match(/^repeat\(\s*(\d+)\s*,/i);

  if (repeatMatch === null) {
    return null;
  }

  return Number(repeatMatch[1]);
};

const expectExplicitTwoColumnLayoutContract = (
  readyLayout: HTMLElement,
): void => {
  const readyLayoutStyle = window.getComputedStyle(readyLayout);
  const readyLayoutDisplay = readyLayoutStyle.display;

  expect(["grid", "flex"]).toContain(readyLayoutDisplay);

  if (readyLayoutDisplay === "grid") {
    const gridTemplateColumns = readyLayoutStyle.gridTemplateColumns.trim();

    expect(gridTemplateColumns).not.toBe("");
    expect(gridTemplateColumns).not.toBe(GRID_TEMPLATE_COLUMNS_NONE_VALUE);

    const explicitRepeatTrackCount =
      parseExplicitRepeatTrackCount(gridTemplateColumns);

    const resolvedTrackCount =
      explicitRepeatTrackCount ??
      countTopLevelTrackSegments(gridTemplateColumns);

    expect(resolvedTrackCount).toBeGreaterThanOrEqual(2);

    return;
  }

  expect(["row", "row-reverse"]).toContain(readyLayoutStyle.flexDirection);
};

describe("App bootstrap gating integration", () => {
  it("enforces the App bootstrap DI props contract at compile-time", () => {
    type AppProps = ComponentProps<typeof App>;

    expectTypeOf<AppProps>().toEqualTypeOf<AppBootstrapProps>();
  });

  it("enforces the GraphCanvas props contract at compile-time for the S1 boundary", () => {
    type GraphCanvasProps = ComponentProps<typeof GraphCanvas>;

    expectTypeOf<GraphCanvasProps>().toEqualTypeOf<GraphCanvasBoundaryProps>();
  });

  it("enforces the NodeDetails shape contract at compile-time for the S1 detail boundary", () => {
    expectTypeOf<NodeDetails>().toEqualTypeOf<NodeDetailsBoundaryProps>();
  });

  it("enforces the DetailPanel props contract at compile-time for the S1 detail boundary", () => {
    expectTypeOf<DetailPanelProps>().toEqualTypeOf<DetailPanelBoundaryProps>();
  });

  it("calls the injected bootstrap runner exactly once on mount", async () => {
    const readyState: GraphBootstrapState = {
      state: "ready",
      payload: createPayloadWithCounts(2, 1),
    };
    const runBootstrap = vi
      .fn<AppBootstrapRunner>()
      .mockResolvedValue(readyState);

    renderAppWithBootstrapRunner(runBootstrap);

    await waitFor(() => {
      expect(runBootstrap).toHaveBeenCalledTimes(1);
    });

    expect(runBootstrap).toHaveBeenCalledWith();
  });

  it("runs bootstrap effectively once under StrictMode replay and reaches ready", async () => {
    const readyPayload = createPayloadWithCounts(6, 4);
    const runBootstrap = createReadyBootstrapRunner(readyPayload);

    renderStrictModeAppWithBootstrapRunner(runBootstrap);

    await waitFor(() => {
      expect(screen.getByTestId(BOOTSTRAP_READY_VIEW_TEST_ID)).toBeVisible();
    });

    expect(runBootstrap).toHaveBeenCalledTimes(1);
    expectReadyViewPayloadCounts(readyPayload);
    expect(screen.queryByTestId(BOOTSTRAP_LOADING_VIEW_TEST_ID)).toBeNull();
    expect(screen.queryByTestId(BOOTSTRAP_INVALID_VIEW_TEST_ID)).toBeNull();
    expectOnlyBootstrapViewVisible(BOOTSTRAP_READY_VIEW_TEST_ID);
  });

  it("shows loading while bootstrap is pending and keeps ready/invalid views absent", async () => {
    const pendingBootstrap = createDeferredPromise<GraphBootstrapState>();
    const runBootstrap = vi
      .fn<AppBootstrapRunner>()
      .mockReturnValue(pendingBootstrap.promise);

    renderAppWithBootstrapRunner(runBootstrap);

    await waitFor(() => {
      expect(runBootstrap).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId(BOOTSTRAP_LOADING_VIEW_TEST_ID)).toBeVisible();
    expect(screen.queryByTestId(BOOTSTRAP_READY_VIEW_TEST_ID)).toBeNull();
    expect(screen.queryByTestId(BOOTSTRAP_INVALID_VIEW_TEST_ID)).toBeNull();
    expectOnlyBootstrapViewVisible(BOOTSTRAP_LOADING_VIEW_TEST_ID);

    pendingBootstrap.resolve({
      state: "invalid-payload",
      errors: ["teardown"],
    });
  });

  it("transitions from loading to ready when pending bootstrap resolves later", async () => {
    const pendingBootstrap = createDeferredPromise<GraphBootstrapState>();
    const readyPayload = createPayloadWithCounts(5, 3);
    const runBootstrap = vi
      .fn<AppBootstrapRunner>()
      .mockReturnValue(pendingBootstrap.promise);

    renderAppWithBootstrapRunner(runBootstrap);

    await waitFor(() => {
      expect(screen.getByTestId(BOOTSTRAP_LOADING_VIEW_TEST_ID)).toBeVisible();
    });

    expectOnlyBootstrapViewVisible(BOOTSTRAP_LOADING_VIEW_TEST_ID);

    pendingBootstrap.resolve({
      state: "ready",
      payload: readyPayload,
    });

    await waitFor(() => {
      expect(screen.getByTestId(BOOTSTRAP_READY_VIEW_TEST_ID)).toBeVisible();
    });

    expectReadyViewPayloadCounts(readyPayload);
    expect(screen.queryByTestId(BOOTSTRAP_LOADING_VIEW_TEST_ID)).toBeNull();
    expect(screen.queryByTestId(BOOTSTRAP_INVALID_VIEW_TEST_ID)).toBeNull();
    expectOnlyBootstrapViewVisible(BOOTSTRAP_READY_VIEW_TEST_ID);
  });

  it("renders one node and directed edge per 4/4 fixture entry with stable identity", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);

    const renderedNodes =
      within(graphCanvas).getAllByTestId(GRAPH_NODE_TEST_ID);
    expect(renderedNodes).toHaveLength(graphFixturePayload.nodes.length);

    const renderedNodeIds = renderedNodes.map((nodeElement) => {
      const nodeId = nodeElement.getAttribute("data-node-id");

      expect(nodeId).not.toBeNull();

      return nodeId as string;
    });

    for (const fixtureNode of graphFixturePayload.nodes) {
      const renderedCountForId = renderedNodeIds.filter(
        (renderedNodeId) => renderedNodeId === fixtureNode.id,
      ).length;

      expect(renderedCountForId).toBe(1);
    }

    const renderedEdges =
      within(graphCanvas).getAllByTestId(GRAPH_EDGE_TEST_ID);
    expect(renderedEdges).toHaveLength(graphFixturePayload.edges.length);

    const renderedEdgePairs = renderedEdges.map((edgeElement) => {
      const source = edgeElement.getAttribute("data-edge-source");
      const target = edgeElement.getAttribute("data-edge-target");

      expect(source).not.toBeNull();
      expect(target).not.toBeNull();

      return `${source as string}->${target as string}`;
    });

    for (const fixtureEdge of graphFixturePayload.edges) {
      const expectedPair = `${fixtureEdge.source}->${fixtureEdge.target}`;
      const renderedCountForPair = renderedEdgePairs.filter(
        (renderedPair) => renderedPair === expectedPair,
      ).length;

      expect(renderedCountForPair).toBe(1);
    }
  });

  describe("WU03-A prefixed label rendering", () => {
    it("renders labels including deterministic prefix+name for each 4/4 fixture node", async () => {
      const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

      renderAppWithBootstrapRunner(runBootstrap);

      const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
      const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);

      for (const fixtureNode of graphFixturePayload.nodes) {
        const expectedPrefix = getWu03DeterministicLabelPrefix(fixtureNode);
        const expectedLabelPattern = new RegExp(
          `${escapeRegExp(expectedPrefix)}.*${escapeRegExp(fixtureNode.name)}`,
        );

        expect(within(graphCanvas).getByText(expectedLabelPattern)).toBeVisible();
      }
    });
  });

  it("renders a visible direction label for each 4/4 fixture edge", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);

    for (const fixtureEdge of graphFixturePayload.edges) {
      expect(
        within(graphCanvas).getByText(
          `${fixtureEdge.source} -> ${fixtureEdge.target}`,
        ),
      ).toBeVisible();
    }
  });

  it("starts ready with no selected node and unselected visual markers", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);

    expect(within(graphCanvas).getAllByTestId(GRAPH_NODE_TEST_ID)).toHaveLength(
      graphFixturePayload.nodes.length,
    );

    expectOnlySelectedNode(graphCanvas, null);
  });

  it("keeps detail panel absent in ready state when no node is selected", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);

    expect(within(graphCanvas).getAllByTestId(GRAPH_NODE_TEST_ID)).toHaveLength(
      graphFixturePayload.nodes.length,
    );
    expect(screen.queryByTestId(DETAIL_PANEL_TEST_ID)).toBeNull();
  });

  it("enforces ready-state right-rail layout contract when detail panel is shown", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const readyLayout = within(readyView).getByTestId(READY_LAYOUT_TEST_ID);

    expect(within(readyLayout).getByTestId(GRAPH_CANVAS_TEST_ID)).toBeVisible();
    expect(within(readyLayout).queryByTestId(DETAIL_PANEL_TEST_ID)).toBeNull();
    expectExplicitTwoColumnLayoutContract(readyLayout);

    const parseConfigNode = getGraphNodeElementById(
      within(readyLayout).getByTestId(GRAPH_CANVAS_TEST_ID),
      "module.utils.parse_config",
    );

    fireEvent.click(parseConfigNode);

    const detailPanelRail = await within(readyLayout).findByTestId(
      DETAIL_PANEL_RAIL_TEST_ID,
    );

    const detailPanel =
      await within(detailPanelRail).findByTestId(DETAIL_PANEL_TEST_ID);

    expect(detailPanel).toBeVisible();
  });

  it("shows parse_config detail fields and updates detail panel when module.utils is selected", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);

    const parseConfigNode = getGraphNodeElementById(
      graphCanvas,
      "module.utils.parse_config",
    );
    const moduleUtilsNode = getGraphNodeElementById(
      graphCanvas,
      "module.utils",
    );

    expect(screen.queryByTestId(DETAIL_PANEL_TEST_ID)).toBeNull();

    fireEvent.click(parseConfigNode);

    const detailPanel = await screen.findByTestId(DETAIL_PANEL_TEST_ID);

    expectDetailFieldValue(detailPanel, DETAIL_NAME_TEST_ID, "parse_config");
    expectDetailFieldValue(detailPanel, DETAIL_KIND_TEST_ID, "function");
    expectDetailFieldValue(detailPanel, DETAIL_MODULE_TEST_ID, "module.utils");
    expectDetailFieldValue(
      detailPanel,
      DETAIL_FILE_PATH_TEST_ID,
      "src/module/utils.py",
    );
    expectDetailFieldValue(detailPanel, DETAIL_LINE_RANGE_TEST_ID, "42-68");
    expectDetailFieldValue(detailPanel, DETAIL_INBOUND_COUNT_TEST_ID, "1");
    expectDetailFieldValue(detailPanel, DETAIL_OUTBOUND_COUNT_TEST_ID, "1");

    fireEvent.click(moduleUtilsNode);

    const updatedDetailPanel = await screen.findByTestId(DETAIL_PANEL_TEST_ID);

    expectDetailFieldValue(updatedDetailPanel, DETAIL_NAME_TEST_ID, "utils");
    expectDetailFieldValue(updatedDetailPanel, DETAIL_KIND_TEST_ID, "module");
    expectDetailFieldValue(
      updatedDetailPanel,
      DETAIL_MODULE_TEST_ID,
      "module.utils",
    );
    expectDetailFieldValue(
      updatedDetailPanel,
      DETAIL_FILE_PATH_TEST_ID,
      "src/module/utils.py",
    );
    expect(
      within(updatedDetailPanel).queryByTestId(DETAIL_LINE_RANGE_TEST_ID),
    ).toBeNull();
    expectDetailFieldValue(
      updatedDetailPanel,
      DETAIL_INBOUND_COUNT_TEST_ID,
      "0",
    );
    expectDetailFieldValue(
      updatedDetailPanel,
      DETAIL_OUTBOUND_COUNT_TEST_ID,
      "2",
    );
  });

  it("renders partial line metadata as start-? when selected node has line_start without line_end", async () => {
    const payloadWithPartialLineRange: GraphPayload = {
      nodes: [
        {
          id: "module.partial",
          kind: "module",
          name: "partial",
          module: "module.partial",
          file_path: "src/module/partial.py",
        },
        {
          id: "module.partial.fn",
          kind: "function",
          name: "partial_fn",
          module: "module.partial",
          file_path: "src/module/partial.py",
          line_start: 10,
        },
      ],
      edges: [
        {
          source: "module.partial",
          target: "module.partial.fn",
          kind: "contains",
        },
      ],
    };
    const runBootstrap = createReadyBootstrapRunner(
      payloadWithPartialLineRange,
    );

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);
    const nodeWithPartialLineRange = getGraphNodeElementById(
      graphCanvas,
      "module.partial.fn",
    );

    expect(screen.queryByTestId(DETAIL_PANEL_TEST_ID)).toBeNull();

    fireEvent.click(nodeWithPartialLineRange);

    const detailPanel = await screen.findByTestId(DETAIL_PANEL_TEST_ID);

    expectDetailFieldValue(detailPanel, DETAIL_LINE_RANGE_TEST_ID, "10-?");
  });

  it("keeps exactly one selected node when selection moves none -> A -> B", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);

    const nodeAId = graphFixturePayload.nodes[0].id;
    const nodeBId = graphFixturePayload.nodes[1].id;
    const nodeA = getGraphNodeElementById(graphCanvas, nodeAId);
    const nodeB = getGraphNodeElementById(graphCanvas, nodeBId);

    expectOnlySelectedNode(graphCanvas, null);

    fireEvent.click(nodeA);

    expectOnlySelectedNode(graphCanvas, nodeAId);

    fireEvent.click(nodeB);

    expectOnlySelectedNode(graphCanvas, nodeBId);
  });

  it("transitions from loading to invalid-payload when pending bootstrap resolves later", async () => {
    const pendingBootstrap = createDeferredPromise<GraphBootstrapState>();
    const propagatedErrors = [
      "Duplicate node id: module.delayed.duplicate",
      "Missing target node reference: module.delayed.missing_target",
    ];
    const runBootstrap = vi
      .fn<AppBootstrapRunner>()
      .mockReturnValue(pendingBootstrap.promise);

    renderAppWithBootstrapRunner(runBootstrap);

    await waitFor(() => {
      expect(screen.getByTestId(BOOTSTRAP_LOADING_VIEW_TEST_ID)).toBeVisible();
    });

    expectOnlyBootstrapViewVisible(BOOTSTRAP_LOADING_VIEW_TEST_ID);

    pendingBootstrap.resolve({
      state: "invalid-payload",
      errors: propagatedErrors,
    });

    const invalidPayloadView = await screen.findByTestId(
      BOOTSTRAP_INVALID_VIEW_TEST_ID,
    );

    expectInvalidPayloadErrorsVisible(invalidPayloadView, propagatedErrors);

    expect(screen.queryByTestId(BOOTSTRAP_LOADING_VIEW_TEST_ID)).toBeNull();
    expect(screen.queryByTestId(BOOTSTRAP_READY_VIEW_TEST_ID)).toBeNull();
    expectOnlyBootstrapViewVisible(BOOTSTRAP_INVALID_VIEW_TEST_ID);
  });

  it("shows ready view payload-derived counts using a non-4/4 payload", async () => {
    const readyPayload = createPayloadWithCounts(3, 2);
    const runBootstrap = createReadyBootstrapRunner(readyPayload);

    renderAppWithBootstrapRunner(runBootstrap);

    await waitFor(() => {
      expect(screen.getByTestId(BOOTSTRAP_READY_VIEW_TEST_ID)).toBeVisible();
    });

    expectReadyViewPayloadCounts(readyPayload);
    expect(screen.queryByTestId(BOOTSTRAP_INVALID_VIEW_TEST_ID)).toBeNull();
    expectOnlyBootstrapViewVisible(BOOTSTRAP_READY_VIEW_TEST_ID);
  });

  it("shows invalid-payload view with all propagated errors and hides ready view", async () => {
    const propagatedErrors = [
      "Duplicate node id: module.utils.parse_config",
      "Missing source node reference: module.utils.missing_source",
      "Missing target node reference: module.pipeline.missing_target",
    ];

    const runBootstrap = vi.fn<AppBootstrapRunner>().mockResolvedValue({
      state: "invalid-payload",
      errors: propagatedErrors,
    });

    renderAppWithBootstrapRunner(runBootstrap);

    const invalidPayloadView = await screen.findByTestId(
      BOOTSTRAP_INVALID_VIEW_TEST_ID,
    );

    expectInvalidPayloadErrorsVisible(invalidPayloadView, propagatedErrors);

    expect(screen.queryByTestId(BOOTSTRAP_READY_VIEW_TEST_ID)).toBeNull();
    expect(screen.queryByTestId(GRAPH_CANVAS_TEST_ID)).toBeNull();
    expectOnlyBootstrapViewVisible(BOOTSTRAP_INVALID_VIEW_TEST_ID);
  });

  it("keeps graph canvas absent while bootstrap is loading", async () => {
    const pendingBootstrap = createDeferredPromise<GraphBootstrapState>();
    const runBootstrap = vi
      .fn<AppBootstrapRunner>()
      .mockReturnValue(pendingBootstrap.promise);

    renderAppWithBootstrapRunner(runBootstrap);

    await waitFor(() => {
      expect(screen.getByTestId(BOOTSTRAP_LOADING_VIEW_TEST_ID)).toBeVisible();
    });

    expect(screen.queryByTestId(GRAPH_CANVAS_TEST_ID)).toBeNull();

    pendingBootstrap.resolve({
      state: "invalid-payload",
      errors: ["teardown"],
    });
  });

  it("transitions rejected bootstrap runs into invalid-payload with normalized non-empty errors", async () => {
    const suppressUnhandledRejection = (event: PromiseRejectionEvent): void => {
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", suppressUnhandledRejection);

    try {
      const runBootstrap = vi
        .fn<AppBootstrapRunner>()
        .mockRejectedValue(new Error("fixture bootstrap failed"));

      renderAppWithBootstrapRunner(runBootstrap);

      const invalidPayloadView = await screen.findByTestId(
        BOOTSTRAP_INVALID_VIEW_TEST_ID,
      );

      const normalizedErrorMessages = Array.from(
        invalidPayloadView.querySelectorAll("p"),
      ).map((errorNode) => errorNode.textContent?.trim() ?? "");

      expect(normalizedErrorMessages.length).toBeGreaterThan(0);
      expect(
        normalizedErrorMessages.every((message) => message.length > 0),
      ).toBe(true);
      expect(screen.queryByTestId(BOOTSTRAP_LOADING_VIEW_TEST_ID)).toBeNull();
      expect(screen.queryByTestId(BOOTSTRAP_READY_VIEW_TEST_ID)).toBeNull();
      expectOnlyBootstrapViewVisible(BOOTSTRAP_INVALID_VIEW_TEST_ID);
    } finally {
      window.removeEventListener(
        "unhandledrejection",
        suppressUnhandledRejection,
      );
    }
  });

  it("keeps loading, ready, and invalid containers mutually exclusive per scenario", async () => {
    const pendingBootstrap = createDeferredPromise<GraphBootstrapState>();
    const loadingRunBootstrap = vi
      .fn<AppBootstrapRunner>()
      .mockReturnValue(pendingBootstrap.promise);

    const loadingRender = renderAppWithBootstrapRunner(loadingRunBootstrap);

    await waitFor(() => {
      expect(loadingRunBootstrap).toHaveBeenCalledTimes(1);
    });

    expectOnlyBootstrapViewVisible(BOOTSTRAP_LOADING_VIEW_TEST_ID);
    loadingRender.unmount();

    const readyRunBootstrap = createReadyBootstrapRunner(
      createPayloadWithCounts(2, 1),
    );

    const readyRender = renderAppWithBootstrapRunner(readyRunBootstrap);

    await waitFor(() => {
      expect(screen.getByTestId(BOOTSTRAP_READY_VIEW_TEST_ID)).toBeVisible();
    });

    expectOnlyBootstrapViewVisible(BOOTSTRAP_READY_VIEW_TEST_ID);
    readyRender.unmount();

    const invalidRunBootstrap = vi.fn<AppBootstrapRunner>().mockResolvedValue({
      state: "invalid-payload",
      errors: ["schema violation"],
    });

    renderAppWithBootstrapRunner(invalidRunBootstrap);

    await waitFor(() => {
      expect(screen.getByTestId(BOOTSTRAP_INVALID_VIEW_TEST_ID)).toBeVisible();
    });

    expectOnlyBootstrapViewVisible(BOOTSTRAP_INVALID_VIEW_TEST_ID);

    pendingBootstrap.resolve({
      state: "invalid-payload",
      errors: ["teardown"],
    });
  });

  it("highlights only immediate neighbor edges when a node is clicked (AC-S1-04)", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);

    const allEdgesBefore =
      within(graphCanvas).getAllByTestId(GRAPH_EDGE_TEST_ID);

    for (const edgeElement of allEdgesBefore) {
      expectEdgeHighlightedState(edgeElement, false);
    }

    const parseConfigNode = getGraphNodeElementById(
      graphCanvas,
      "module.utils.parse_config",
    );

    fireEvent.click(parseConfigNode);

    const inboundEdge = getGraphEdgeBySourceTarget(
      graphCanvas,
      "module.utils",
      "module.utils.parse_config",
    );

    const outboundEdge = getGraphEdgeBySourceTarget(
      graphCanvas,
      "module.utils.parse_config",
      "module.pipeline.run_model",
    );

    expectEdgeHighlightedState(inboundEdge, true);
    expectEdgeHighlightedState(outboundEdge, true);

    const unrelatedContainsEdge = getGraphEdgeBySourceTarget(
      graphCanvas,
      "module.pipeline",
      "module.pipeline.run_model",
    );

    const unrelatedImportsEdge = getGraphEdgeBySourceTarget(
      graphCanvas,
      "module.utils",
      "module.pipeline",
    );

    expectEdgeHighlightedState(unrelatedContainsEdge, false);
    expectEdgeHighlightedState(unrelatedImportsEdge, false);
  });

  it("filters nodes by module query from the sidebar", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const moduleFilterInput = within(readyView).getByTestId(
      "module-filter-input",
    );

    fireEvent.change(moduleFilterInput, { target: { value: "pipeline" } });

    await waitFor(() => {
      expect(within(readyView).getByText("Nodes: 2")).toBeVisible();
      expect(within(readyView).getByText("Edges: 1")).toBeVisible();
    });
  });

  it("hides disconnected nodes when the sidebar toggle is enabled", async () => {
    const payloadWithDisconnectedNode: GraphPayload = {
      nodes: [
        ...graphFixturePayload.nodes,
        {
          id: "module.constants.PI",
          kind: "constant",
          name: "PI",
          module: "module.constants",
          file_path: "src/module/constants.py",
        },
      ],
      edges: graphFixturePayload.edges,
    };
    const runBootstrap = createReadyBootstrapRunner(payloadWithDisconnectedNode);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const hideDisconnectedToggle = within(readyView).getByTestId(
      "hide-disconnected-filter",
    );

    expect(within(readyView).getByText("Nodes: 5")).toBeVisible();

    fireEvent.click(hideDisconnectedToggle);

    await waitFor(() => {
      expect(within(readyView).getByText("Nodes: 4")).toBeVisible();
    });
  });


  it("focuses the first search match and opens detail panel", async () => {
    const runBootstrap = createReadyBootstrapRunner(graphFixturePayload);

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const searchInput = within(readyView).getByTestId("graph-search-input");
    const focusFirstButton = within(readyView).getByTestId(
      "graph-search-focus-first",
    );

    fireEvent.change(searchInput, { target: { value: "parse" } });

    expect(within(readyView).getByTestId("graph-search-results-count")).toHaveTextContent(
      "Matches: 1",
    );

    fireEvent.click(focusFirstButton);

    const detailPanel = await screen.findByTestId(DETAIL_PANEL_TEST_ID);
    expectDetailFieldValue(detailPanel, DETAIL_NAME_TEST_ID, "parse_config");
  });

});

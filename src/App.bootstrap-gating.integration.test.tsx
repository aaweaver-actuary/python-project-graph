// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { StrictMode, type ComponentProps } from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import App from "./App";
import type { GraphBootstrapState } from "./graph/bootstrap.contracts";
import type { GraphPayload } from "./graph/contracts";
import { graphFixturePayload } from "./graph/fixture-data-source.adapter";
import { GraphCanvas } from "./graph/graph-canvas";

type AppBootstrapRunner = () => Promise<GraphBootstrapState>;

interface AppBootstrapProps {
  runBootstrap: AppBootstrapRunner;
}

interface GraphCanvasBoundaryProps {
  payload: GraphPayload;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

const BOOTSTRAP_LOADING_VIEW_TEST_ID = "bootstrap-loading-view";
const BOOTSTRAP_READY_VIEW_TEST_ID = "bootstrap-ready-view";
const BOOTSTRAP_INVALID_VIEW_TEST_ID = "bootstrap-invalid-payload-view";
const GRAPH_CANVAS_TEST_ID = "graph-canvas";
const GRAPH_NODE_TEST_ID = "graph-node";
const GRAPH_EDGE_TEST_ID = "graph-edge";

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

describe("App bootstrap gating integration", () => {
  it("enforces the App bootstrap DI props contract at compile-time", () => {
    type AppProps = ComponentProps<typeof App>;

    expectTypeOf<AppProps>().toEqualTypeOf<AppBootstrapProps>();
  });

  it("enforces the GraphCanvas props contract at compile-time for the S1 boundary", () => {
    type GraphCanvasProps = ComponentProps<typeof GraphCanvas>;

    expectTypeOf<GraphCanvasProps>().toEqualTypeOf<GraphCanvasBoundaryProps>();
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
    const runBootstrap = vi.fn<AppBootstrapRunner>().mockResolvedValue({
      state: "ready",
      payload: readyPayload,
    });

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
    const runBootstrap = vi.fn<AppBootstrapRunner>().mockResolvedValue({
      state: "ready",
      payload: graphFixturePayload,
    });

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

  it("renders a visible label for each 4/4 fixture node", async () => {
    const runBootstrap = vi.fn<AppBootstrapRunner>().mockResolvedValue({
      state: "ready",
      payload: graphFixturePayload,
    });

    renderAppWithBootstrapRunner(runBootstrap);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const graphCanvas = within(readyView).getByTestId(GRAPH_CANVAS_TEST_ID);

    for (const fixtureNode of graphFixturePayload.nodes) {
      expect(within(graphCanvas).getByText(fixtureNode.name)).toBeVisible();
    }
  });

  it("renders a visible direction label for each 4/4 fixture edge", async () => {
    const runBootstrap = vi.fn<AppBootstrapRunner>().mockResolvedValue({
      state: "ready",
      payload: graphFixturePayload,
    });

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
    const runBootstrap = vi.fn<AppBootstrapRunner>().mockResolvedValue({
      state: "ready",
      payload: readyPayload,
    });

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

    const readyRunBootstrap = vi.fn<AppBootstrapRunner>().mockResolvedValue({
      state: "ready",
      payload: createPayloadWithCounts(2, 1),
    });

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
});

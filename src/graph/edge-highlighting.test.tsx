// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { GraphPayload } from "./contracts";
import { graphFixturePayload } from "./fixture-data-source.adapter";
import { GraphCanvas } from "./graph-canvas";

const GRAPH_CANVAS_TEST_ID = "graph-canvas";
const GRAPH_EDGE_TEST_ID = "graph-edge";
const GRAPH_EDGE_HIGHLIGHTED_CLASS = "graph-edge--highlighted";

const getGraphEdgeElements = (graphCanvas: HTMLElement): HTMLElement[] =>
  within(graphCanvas).getAllByTestId(GRAPH_EDGE_TEST_ID);

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

const renderGraphCanvas = (
  payload: GraphPayload,
  selectedNodeId: string | null,
) => {
  const onSelectNode = vi.fn<(nodeId: string) => void>();

  const renderResult = render(
    <GraphCanvas
      payload={payload}
      selectedNodeId={selectedNodeId}
      onSelectNode={onSelectNode}
    />,
  );

  const graphCanvas = within(renderResult.container).getByTestId(
    GRAPH_CANVAS_TEST_ID,
  );

  return { ...renderResult, graphCanvas, onSelectNode };
};

describe("Edge highlighting (AC-S1-04)", () => {
  it("renders all edges with data-highlighted=false when no node is selected", () => {
    const { graphCanvas } = renderGraphCanvas(graphFixturePayload, null);

    const allEdges = getGraphEdgeElements(graphCanvas);

    expect(allEdges).toHaveLength(graphFixturePayload.edges.length);

    for (const edgeElement of allEdges) {
      expectEdgeHighlightedState(edgeElement, false);
    }
  });

  it("highlights immediate inbound and outbound edges when module.utils.parse_config is selected", () => {
    const selectedNodeId = "module.utils.parse_config";

    const { graphCanvas } = renderGraphCanvas(
      graphFixturePayload,
      selectedNodeId,
    );

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
  });

  it("does not highlight non-neighbor edges when module.utils.parse_config is selected", () => {
    const selectedNodeId = "module.utils.parse_config";

    const { graphCanvas } = renderGraphCanvas(
      graphFixturePayload,
      selectedNodeId,
    );

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

  it("updates edge highlighting when selection changes from one node to another", () => {
    const firstSelectedNodeId = "module.utils.parse_config";

    const { graphCanvas, rerender, onSelectNode } = renderGraphCanvas(
      graphFixturePayload,
      firstSelectedNodeId,
    );

    const parseConfigInbound = getGraphEdgeBySourceTarget(
      graphCanvas,
      "module.utils",
      "module.utils.parse_config",
    );

    expectEdgeHighlightedState(parseConfigInbound, true);

    const secondSelectedNodeId = "module.pipeline";

    rerender(
      <GraphCanvas
        payload={graphFixturePayload}
        selectedNodeId={secondSelectedNodeId}
        onSelectNode={onSelectNode}
      />,
    );

    const pipelineContainsEdge = getGraphEdgeBySourceTarget(
      graphCanvas,
      "module.pipeline",
      "module.pipeline.run_model",
    );

    const pipelineImportsEdge = getGraphEdgeBySourceTarget(
      graphCanvas,
      "module.utils",
      "module.pipeline",
    );

    expectEdgeHighlightedState(pipelineContainsEdge, true);
    expectEdgeHighlightedState(pipelineImportsEdge, true);

    expectEdgeHighlightedState(parseConfigInbound, false);

    const parseConfigOutbound = getGraphEdgeBySourceTarget(
      graphCanvas,
      "module.utils.parse_config",
      "module.pipeline.run_model",
    );

    expectEdgeHighlightedState(parseConfigOutbound, false);
  });

  it("clears all edge highlighting when selection changes from a node to null", () => {
    const { graphCanvas, rerender, onSelectNode } = renderGraphCanvas(
      graphFixturePayload,
      "module.utils",
    );

    const utilsContainsEdge = getGraphEdgeBySourceTarget(
      graphCanvas,
      "module.utils",
      "module.utils.parse_config",
    );

    expectEdgeHighlightedState(utilsContainsEdge, true);

    rerender(
      <GraphCanvas
        payload={graphFixturePayload}
        selectedNodeId={null}
        onSelectNode={onSelectNode}
      />,
    );

    const allEdges = getGraphEdgeElements(graphCanvas);

    for (const edgeElement of allEdges) {
      expectEdgeHighlightedState(edgeElement, false);
    }
  });
});

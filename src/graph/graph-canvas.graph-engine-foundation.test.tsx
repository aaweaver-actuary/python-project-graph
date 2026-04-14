// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { baseEdgePathSpy, reactFlowPropsSpy } = vi.hoisted(() => ({
  baseEdgePathSpy: vi.fn<(path: string) => void>(),
  reactFlowPropsSpy: vi.fn(),
}));

vi.mock('@xyflow/react', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  const actual =
    await vi.importActual<typeof import('@xyflow/react')>('@xyflow/react');

  return {
    ...actual,
    BaseEdge: ({ path }: { path: string }) => {
      baseEdgePathSpy(path);

      return React.createElement('div', {
        'data-testid': 'graph-edge-svg-path',
        'data-path': path,
      });
    },
    ReactFlow: (props: object) => {
      reactFlowPropsSpy(props);

      const reactFlowProps = props as {
        edges?: Array<{
          id: string;
          type?: string;
          source: string;
          target: string;
          markerEnd?: unknown;
          data?: Record<string, unknown>;
        }>;
        edgeTypes?: Record<
          string,
          React.ComponentType<Record<string, unknown>>
        >;
      };
      const renderedMockEdges = (reactFlowProps.edges ?? []).map((edge) => {
        const edgeTypeName = edge.type ?? '';
        const EdgeTypeComponent = reactFlowProps.edgeTypes?.[edgeTypeName];

        if (!EdgeTypeComponent) {
          return null;
        }

        return React.createElement(EdgeTypeComponent, {
          key: `mock-edge-${edge.id}`,
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceX: 0,
          sourceY: 0,
          targetX: 200,
          targetY: 80,
          sourcePosition: actual.Position.Right,
          targetPosition: actual.Position.Left,
          markerEnd: edge.markerEnd,
          data: edge.data,
        });
      });

      return React.createElement(
        React.Fragment,
        null,
        React.createElement(actual.ReactFlow, props),
        renderedMockEdges,
      );
    },
  };
});

import { graphFixturePayload } from './fixture-data-source.adapter';
import { GraphCanvas } from './graph-canvas';

const GRAPH_CANVAS_TEST_ID = 'graph-canvas';
const GRAPH_NODE_TEST_ID = 'graph-node';
const GRAPH_EDGE_TEST_ID = 'graph-edge';
const GRAPH_NODE_SELECTED_CLASS = 'graph-node--selected';
const GRAPH_EDGE_HIGHLIGHTED_CLASS = 'graph-edge--highlighted';

const getReactFlowRoot = (graphCanvas: HTMLElement): HTMLElement => {
  const reactFlowRoot = graphCanvas.querySelector('.react-flow');

  expect(reactFlowRoot).not.toBeNull();

  return reactFlowRoot as HTMLElement;
};

const getGraphNodeById = (
  rootElement: HTMLElement,
  nodeId: string,
): HTMLElement => {
  const nodeElement = rootElement.querySelector(
    `[data-testid="${GRAPH_NODE_TEST_ID}"][data-node-id="${nodeId}"]`,
  );

  expect(nodeElement).not.toBeNull();

  return nodeElement as HTMLElement;
};

const getGraphEdgeBySourceTarget = (
  rootElement: HTMLElement,
  source: string,
  target: string,
): HTMLElement => {
  const edgeElement = rootElement.querySelector(
    `[data-testid="${GRAPH_EDGE_TEST_ID}"][data-edge-source="${source}"][data-edge-target="${target}"]`,
  );

  expect(edgeElement).not.toBeNull();

  return edgeElement as HTMLElement;
};

const getLastReactFlowProps = (): {
  edges: Array<Record<string, unknown>>;
} => {
  expect(reactFlowPropsSpy).toHaveBeenCalled();

  return reactFlowPropsSpy.mock.lastCall?.[0] as {
    edges: Array<Record<string, unknown>>;
  };
};

describe('GraphCanvas graph engine foundation (WU-01)', () => {
  it('wires explicit directed arrowhead markers into React Flow edge config', () => {
    reactFlowPropsSpy.mockClear();

    render(
      <GraphCanvas
        payload={graphFixturePayload}
        selectedNodeId={null}
        onSelectNode={vi.fn<(nodeId: string) => void>()}
      />,
    );

    const reactFlowProps = getLastReactFlowProps();

    expect(reactFlowProps.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: 'module.utils.parse_config',
          target: 'module.pipeline.run_model',
          markerEnd: expect.anything(),
        }),
      ]),
    );
  });

  it('renders directed edges as cubic Bézier paths', () => {
    baseEdgePathSpy.mockClear();

    render(
      <GraphCanvas
        payload={graphFixturePayload}
        selectedNodeId={null}
        onSelectNode={vi.fn<(nodeId: string) => void>()}
      />,
    );

    expect(baseEdgePathSpy).toHaveBeenCalled();

    const firstPath = baseEdgePathSpy.mock.calls[0]?.[0] ?? '';
    expect(firstPath).toContain('C');
  });

  it('renders a React Flow root while preserving node and edge identity hooks', () => {
    const onSelectNode = vi.fn<(nodeId: string) => void>();
    const renderResult = render(
      <GraphCanvas
        payload={graphFixturePayload}
        selectedNodeId={null}
        onSelectNode={onSelectNode}
      />,
    );
    const graphCanvas = within(renderResult.container).getByTestId(
      GRAPH_CANVAS_TEST_ID,
    );

    const reactFlowRoot = getReactFlowRoot(graphCanvas);
    const renderedNodes =
      within(reactFlowRoot).getAllByTestId(GRAPH_NODE_TEST_ID);
    const renderedEdges =
      within(reactFlowRoot).getAllByTestId(GRAPH_EDGE_TEST_ID);

    expect(renderedNodes).toHaveLength(graphFixturePayload.nodes.length);
    expect(renderedEdges).toHaveLength(graphFixturePayload.edges.length);

    for (const fixtureNode of graphFixturePayload.nodes) {
      expect(getGraphNodeById(reactFlowRoot, fixtureNode.id)).toHaveAttribute(
        'data-node-id',
        fixtureNode.id,
      );
    }

    for (const fixtureEdge of graphFixturePayload.edges) {
      expect(
        getGraphEdgeBySourceTarget(
          reactFlowRoot,
          fixtureEdge.source,
          fixtureEdge.target,
        ),
      ).toHaveAttribute('data-edge-source', fixtureEdge.source);
      expect(
        getGraphEdgeBySourceTarget(
          reactFlowRoot,
          fixtureEdge.source,
          fixtureEdge.target,
        ),
      ).toHaveAttribute('data-edge-target', fixtureEdge.target);
    }
  });

  it('preserves the controlled selection callback and selected/highlighted compatibility surface', () => {
    const onSelectNode = vi.fn<(nodeId: string) => void>();
    const selectedNodeId = 'module.utils.parse_config';
    const renderResult = render(
      <GraphCanvas
        payload={graphFixturePayload}
        selectedNodeId={selectedNodeId}
        onSelectNode={onSelectNode}
      />,
    );
    const graphCanvas = within(renderResult.container).getByTestId(
      GRAPH_CANVAS_TEST_ID,
    );
    const reactFlowRoot = getReactFlowRoot(graphCanvas);
    const selectedNode = getGraphNodeById(reactFlowRoot, selectedNodeId);
    const unselectedNode = getGraphNodeById(reactFlowRoot, 'module.pipeline');
    const highlightedEdge = getGraphEdgeBySourceTarget(
      reactFlowRoot,
      'module.utils.parse_config',
      'module.pipeline.run_model',
    );
    const unrelatedEdge = getGraphEdgeBySourceTarget(
      reactFlowRoot,
      'module.utils',
      'module.pipeline',
    );

    expect(selectedNode).toHaveAttribute('data-selected', 'true');
    expect(selectedNode).toHaveClass(GRAPH_NODE_SELECTED_CLASS);
    expect(unselectedNode).toHaveAttribute('data-selected', 'false');
    expect(highlightedEdge).toHaveAttribute('data-highlighted', 'true');
    expect(highlightedEdge).toHaveClass(GRAPH_EDGE_HIGHLIGHTED_CLASS);
    expect(unrelatedEdge).toHaveAttribute('data-highlighted', 'false');

    fireEvent.click(unselectedNode);

    expect(selectedNode).toHaveAttribute('data-selected', 'true');
    expect(unselectedNode).toHaveAttribute('data-selected', 'false');
    expect(highlightedEdge).toHaveAttribute('data-highlighted', 'true');
    expect(unrelatedEdge).toHaveAttribute('data-highlighted', 'false');
    expect(onSelectNode).toHaveBeenCalledWith('module.pipeline');
  });
});

// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { reactFlowPropsSpy, reactFlowFitViewSpy, wu03LabelPrefixByKind } =
  vi.hoisted(() => ({
    reactFlowPropsSpy: vi.fn(),
    reactFlowFitViewSpy: vi.fn(),
    wu03LabelPrefixByKind: {
      module: '[WU03-MODULE]',
      class: '[WU03-CLASS]',
      method: '[WU03-METHOD]',
      function: '[WU03-FUNCTION]',
      constant: '[WU03-CONSTANT]',
      import: '[WU03-IMPORT]',
      variable: '[WU03-VARIABLE]',
      package: '[WU03-PACKAGE]',
    } as const,
  }));

vi.mock('@xyflow/react', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  const actual =
    await vi.importActual<typeof import('@xyflow/react')>('@xyflow/react');

  return {
    ...actual,
    ReactFlow: (props: object) => {
      reactFlowPropsSpy(props);

      return React.createElement(actual.ReactFlow, props);
    },
    useReactFlow: () => ({
      fitView: reactFlowFitViewSpy,
    }),
  };
});

vi.mock('./styles', async () => {
  const actual = await vi.importActual<typeof import('./styles')>('./styles');

  return {
    ...actual,
    getNodeKindVisualSemantics: (kind: keyof typeof wu03LabelPrefixByKind) => ({
      ...actual.getNodeKindVisualSemantics(kind),
      iconToken: `mock-icon:${kind}`,
      labelPrefix: wu03LabelPrefixByKind[kind],
    }),
  };
});

import type { GraphPayload, NodeKind } from './contracts';
import { graphFixturePayload } from './fixture-data-source.adapter';
import { GraphCanvas } from './graph-canvas';
import {
  NODE_KIND_POST_IT_TOKENS,
  PENCIL_TREATMENT,
  WORKSPACE_DOTTED_SURFACE,
} from './styles';

const GRAPH_CANVAS_TEST_ID = 'graph-canvas';
const GRAPH_NODE_TEST_ID = 'graph-node';
const GRAPH_EDGE_TEST_ID = 'graph-edge';
const GRAPH_SOURCE_ENDPOINT_TEST_ID = 'graph-source-endpoint';
const GRAPH_TARGET_ENDPOINT_TEST_ID = 'graph-target-endpoint';
const GRAPH_NODE_SELECTED_CLASS = 'graph-node--selected';
const GRAPH_EDGE_HIGHLIGHTED_CLASS = 'graph-edge--highlighted';

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

const getWu03DeterministicPrefix = (kind: NodeKind): string =>
  wu03LabelPrefixByKind[kind];

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
          markerEnd: expect.objectContaining({
            color: PENCIL_TREATMENT.arrowColor,
          }),
        }),
      ]),
    );
  });

  it('applies the dotted workspace surface contract to the canvas root', () => {
    const renderResult = render(
      <GraphCanvas
        payload={graphFixturePayload}
        selectedNodeId={null}
        onSelectNode={vi.fn<(nodeId: string) => void>()}
      />,
    );
    const graphCanvas = within(renderResult.container).getByTestId(
      GRAPH_CANVAS_TEST_ID,
    );

    expect(graphCanvas).toHaveStyle({
      backgroundColor: WORKSPACE_DOTTED_SURFACE.backgroundColor,
      backgroundImage: WORKSPACE_DOTTED_SURFACE.backgroundImage,
      backgroundSize: WORKSPACE_DOTTED_SURFACE.backgroundSize,
    });
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

  describe('GraphCanvas prefixed label rendering contract (WU03-A)', () => {
    it('renders labels that include deterministic prefix+name for every supported NodeKind', () => {
      const allNodeKindsPayload: GraphPayload = {
        nodes: [
          {
            id: 'kind.module',
            kind: 'module',
            name: 'mod_name',
            module: 'kinds.module',
            file_path: 'src/kinds/module.py',
          },
          {
            id: 'kind.class',
            kind: 'class',
            name: 'class_name',
            module: 'kinds.class',
            file_path: 'src/kinds/class.py',
          },
          {
            id: 'kind.method',
            kind: 'method',
            name: 'method_name',
            module: 'kinds.method',
            file_path: 'src/kinds/method.py',
          },
          {
            id: 'kind.function',
            kind: 'function',
            name: 'function_name',
            module: 'kinds.function',
            file_path: 'src/kinds/function.py',
          },
          {
            id: 'kind.import',
            kind: 'import',
            name: 'import_name',
            module: 'kinds.import',
            file_path: 'src/kinds/import.py',
          },
          {
            id: 'kind.constant',
            kind: 'constant',
            name: 'constant_name',
            module: 'kinds.constant',
            file_path: 'src/kinds/constant.py',
          },
          {
            id: 'kind.variable',
            kind: 'variable',
            name: 'variable_name',
            module: 'kinds.variable',
            file_path: 'src/kinds/variable.py',
          },
          {
            id: 'kind.package',
            kind: 'package',
            name: 'package_name',
            module: 'kinds.package',
            file_path: 'src/kinds/package.py',
          },
        ],
        edges: [],
      };

      const renderResult = render(
        <GraphCanvas
          payload={allNodeKindsPayload}
          selectedNodeId={null}
          onSelectNode={vi.fn<(nodeId: string) => void>()}
        />,
      );
      const graphCanvas = within(renderResult.container).getByTestId(
        GRAPH_CANVAS_TEST_ID,
      );

      for (const node of allNodeKindsPayload.nodes) {
        const expectedPrefix = getWu03DeterministicPrefix(node.kind);
        const expectedLabelPattern = new RegExp(
          `${escapeRegExp(expectedPrefix)}.*${escapeRegExp(node.name)}`,
        );

        expect(
          within(graphCanvas).getByText(expectedLabelPattern),
        ).toBeVisible();
      }
    });
  });

  describe('GraphCanvas aesthetic styling contract (SL-BUNDLE-AESTH)', () => {
    it('renders post-it color tokens and pencil border texture on node cards', () => {
      const renderResult = render(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={vi.fn<(nodeId: string) => void>()}
        />,
      );
      const graphCanvas = within(renderResult.container).getByTestId(
        GRAPH_CANVAS_TEST_ID,
      );
      const functionNodeLabel = within(graphCanvas).getByText(
        /\[WU03-FUNCTION\].*parse_config/,
      );
      const functionNodeCard = functionNodeLabel.closest('div');

      expect(functionNodeCard).not.toBeNull();
      expect(functionNodeCard).toHaveStyle({
        background: NODE_KIND_POST_IT_TOKENS.function.background,
        color: NODE_KIND_POST_IT_TOKENS.function.foreground,
        border: `${PENCIL_TREATMENT.borderWidthPx}px solid ${NODE_KIND_POST_IT_TOKENS.function.border}`,
        boxShadow: PENCIL_TREATMENT.borderShadow,
      });
    });

    it('renders edge lines with pencil-style stroke treatment', () => {
      reactFlowPropsSpy.mockClear();

      render(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={vi.fn<(nodeId: string) => void>()}
        />,
      );

      const props = reactFlowPropsSpy.mock.lastCall?.[0] as {
        edges: Array<{ style?: Record<string, unknown> }>;
      };
      const firstEdge = props.edges[0];

      expect(firstEdge.style).toEqual(
        expect.objectContaining({
          strokeWidth: PENCIL_TREATMENT.lineStrokeWidth,
          strokeDasharray: PENCIL_TREATMENT.lineStrokeDasharray,
          strokeLinecap: PENCIL_TREATMENT.lineCap,
        }),
      );
    });
  });

  describe('GraphCanvas connection anchor contract (SL-BUNDLE-CONN)', () => {
    it('renders circular source and target connection endpoints', () => {
      const renderResult = render(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={vi.fn<(nodeId: string) => void>()}
        />,
      );
      const graphCanvas = within(renderResult.container).getByTestId(
        GRAPH_CANVAS_TEST_ID,
      );

      const sourceEndpoints = within(graphCanvas).getAllByTestId(
        GRAPH_SOURCE_ENDPOINT_TEST_ID,
      );
      const targetEndpoints = within(graphCanvas).getAllByTestId(
        GRAPH_TARGET_ENDPOINT_TEST_ID,
      );

      expect(sourceEndpoints.length).toBeGreaterThan(0);
      expect(targetEndpoints.length).toBeGreaterThan(0);
      expect(sourceEndpoints[0]).toHaveAttribute(
        'data-id',
        expect.stringContaining('edge-handle-'),
      );
      expect(targetEndpoints[0]).toHaveAttribute(
        'data-id',
        expect.stringContaining('edge-handle-'),
      );
    });

    it('resolves edge anchors to any side and updates handle ids when node geometry changes', () => {
      reactFlowPropsSpy.mockClear();

      const payload: GraphPayload = {
        nodes: [
          {
            id: 'center',
            kind: 'module',
            name: 'center',
            module: 'center',
            file_path: 'src/center.py',
          },
          {
            id: 'other',
            kind: 'function',
            name: 'other',
            module: 'other',
            file_path: 'src/other.py',
          },
        ],
        edges: [{ source: 'center', target: 'other', kind: 'dependency' }],
      };

      const renderResult = render(
        <GraphCanvas
          payload={payload}
          selectedNodeId={null}
          onSelectNode={vi.fn()}
          positionOverrides={{
            center: { x: 0, y: 0 },
            other: { x: 0, y: 220 },
          }}
        />,
      );

      let firstProps = reactFlowPropsSpy.mock.lastCall?.[0] as {
        edges: Array<{ sourceHandle?: string; targetHandle?: string }>;
      };
      expect(firstProps.edges[0]).toEqual(
        expect.objectContaining({
          sourceHandle: 'edge-handle-bottom',
          targetHandle: 'edge-handle-top',
        }),
      );

      renderResult.rerender(
        <GraphCanvas
          payload={payload}
          selectedNodeId={null}
          onSelectNode={vi.fn()}
          positionOverrides={{
            center: { x: 0, y: 0 },
            other: { x: -220, y: 0 },
          }}
        />,
      );

      firstProps = reactFlowPropsSpy.mock.lastCall?.[0] as {
        edges: Array<{ sourceHandle?: string; targetHandle?: string }>;
      };
      expect(firstProps.edges[0]).toEqual(
        expect.objectContaining({
          sourceHandle: 'edge-handle-left',
          targetHandle: 'edge-handle-right',
        }),
      );
    });
  });

  describe('GraphCanvas focus viewport request contract (WU-05)', () => {
    it('calls React Flow fitView with deterministic focus options when a new focus request arrives', () => {
      reactFlowFitViewSpy.mockClear();
      const onSelectNode = vi.fn<(nodeId: string) => void>();
      const renderResult = render(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={onSelectNode}
        />,
      );

      expect(reactFlowFitViewSpy).not.toHaveBeenCalled();

      renderResult.rerender(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={onSelectNode}
          focusRequest={{
            requestId: 'focus-request-1',
            nodeId: 'module.utils.parse_config',
          }}
        />,
      );

      expect(reactFlowFitViewSpy).toHaveBeenCalledTimes(1);
      expect(reactFlowFitViewSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          nodes: [expect.objectContaining({ id: 'module.utils.parse_config' })],
          duration: expect.any(Number),
          padding: expect.any(Number),
        }),
      );
    });

    it('does not replay viewport focus when the requestId is unchanged across rerenders', () => {
      reactFlowFitViewSpy.mockClear();
      const onSelectNode = vi.fn<(nodeId: string) => void>();
      const focusRequest = {
        requestId: 'focus-request-stable',
        nodeId: 'module.utils.parse_config',
      };
      const renderResult = render(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={onSelectNode}
          focusRequest={focusRequest}
        />,
      );

      expect(reactFlowFitViewSpy).toHaveBeenCalledTimes(1);

      renderResult.rerender(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={onSelectNode}
          focusRequest={focusRequest}
        />,
      );

      expect(reactFlowFitViewSpy).toHaveBeenCalledTimes(1);
    });

    it('ignores focus requests that target a node id outside the current payload', () => {
      reactFlowFitViewSpy.mockClear();

      render(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={vi.fn<(nodeId: string) => void>()}
          focusRequest={{
            requestId: 'focus-request-missing',
            nodeId: 'node.missing.from.payload',
          }}
        />,
      );

      expect(reactFlowFitViewSpy).not.toHaveBeenCalled();
    });
  });

  describe('GraphCanvas position override contract (WU-07)', () => {
    it('applies positionOverrides to nodes passed to ReactFlow', () => {
      reactFlowPropsSpy.mockClear();

      const overrides = {
        'module.utils.parse_config': { x: 500, y: 500 },
      };

      render(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={vi.fn()}
          positionOverrides={overrides}
        />,
      );

      const lastProps = reactFlowPropsSpy.mock.lastCall?.[0] as {
        nodes: Array<{ id: string; position: { x: number; y: number } }>;
      };

      const overriddenNode = lastProps.nodes.find(
        (n) => n.id === 'module.utils.parse_config',
      );

      expect(overriddenNode?.position).toEqual({ x: 500, y: 500 });
    });

    it('passes onNodeDragStop to ReactFlow when onNodePositionChange is provided', () => {
      reactFlowPropsSpy.mockClear();

      render(
        <GraphCanvas
          payload={graphFixturePayload}
          selectedNodeId={null}
          onSelectNode={vi.fn()}
          onNodePositionChange={vi.fn()}
        />,
      );

      const lastProps = reactFlowPropsSpy.mock.lastCall?.[0] as {
        onNodeDragStop?: unknown;
      };

      expect(lastProps.onNodeDragStop).toBeInstanceOf(Function);
    });
  });

  describe('GraphCanvas constrained spring refinement contract (SL-BUNDLE-SPRING)', () => {
    it('keeps FR-2 layout coordinates as the default primary coordinates', () => {
      reactFlowPropsSpy.mockClear();

      const payload: GraphPayload = {
        nodes: [
          {
            id: 'a',
            kind: 'module',
            name: 'a',
            module: 'a',
            file_path: 'a.py',
            topological_rank: 0,
          },
          {
            id: 'b',
            kind: 'module',
            name: 'b',
            module: 'b',
            file_path: 'b.py',
            topological_rank: 1,
          },
          {
            id: 'c',
            kind: 'module',
            name: 'c',
            module: 'c',
            file_path: 'c.py',
            topological_rank: 1,
          },
        ],
        edges: [{ source: 'a', target: 'b', kind: 'dependency' }],
      };

      const renderResult = render(
        <GraphCanvas
          payload={payload}
          selectedNodeId={null}
          onSelectNode={vi.fn()}
        />,
      );

      const firstProps = reactFlowPropsSpy.mock.lastCall?.[0] as {
        nodes: Array<{ id: string; position: { x: number; y: number } }>;
      };
      const firstA = firstProps.nodes.find((node) => node.id === 'a');
      const firstB = firstProps.nodes.find((node) => node.id === 'b');

      expect(firstA?.position).not.toBeUndefined();
      expect(firstB?.position).not.toBeUndefined();
      expect((firstA?.position.x ?? 0) < (firstB?.position.x ?? 0)).toBe(true);

      renderResult.unmount();
    });
  });
});

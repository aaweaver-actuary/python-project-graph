import {
  BaseEdge,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getStraightPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { memo, useCallback, useEffect, useRef } from 'react';

import type { GraphEdge, GraphNode, GraphPayload } from './contracts';
import { resolveEdgeAnchorPair } from './edge-anchors';
import { computeDeterministicLayout } from './layout';
import type { ManualPositionOverrides } from './layout-persistence';
import { applyPositionOverrides } from './layout-persistence';
import {
  NODE_KIND_POST_IT_TOKENS,
  PENCIL_TREATMENT,
  WORKSPACE_DOTTED_SURFACE,
  getNodeKindVisualSemantics,
} from './styles';

export interface GraphCanvasProps {
  payload: GraphPayload;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  focusRequest?: {
    requestId: string | number;
    nodeId: string;
  };
  positionOverrides?: ManualPositionOverrides;
  onNodePositionChange?: (
    nodeId: string,
    position: { x: number; y: number },
  ) => void;
}

interface GraphNodeData {
  node: GraphNode;
  isSelected: boolean;
  onSelectNode: GraphCanvasProps['onSelectNode'];
}

type GraphNodeDataRecord = Record<string, unknown> & GraphNodeData;

interface GraphEdgeData {
  edge: GraphEdge;
  isHighlighted: boolean;
}

type GraphEdgeDataRecord = Record<string, unknown> & GraphEdgeData;

const GRAPH_NODE_TYPE = 'graphNode';
const GRAPH_EDGE_TYPE = 'graphEdge';
const GRAPH_CANVAS_WIDTH = 960;
const GRAPH_CANVAS_HEIGHT = 384;
const GRAPH_NODE_WIDTH = 176;
const GRAPH_NODE_HEIGHT = 52;
const FOCUS_ANIMATION_DURATION = 300;
const FOCUS_PADDING = 0.2;
const EDGE_ENDPOINT_STYLE = {
  width: '0.7rem',
  height: '0.7rem',
  borderRadius: '999px',
  border: `1.5px solid ${PENCIL_TREATMENT.arrowColor}`,
  background: '#fffdf8',
};
const PENCIL_WIGGLE_BY_KIND: Record<GraphNode['kind'], string> = {
  module: 'rotate(-0.22deg)',
  class: 'rotate(0.24deg)',
  method: 'rotate(-0.2deg)',
  function: 'rotate(0.18deg)',
  import: 'rotate(-0.17deg)',
  constant: 'rotate(0.2deg)',
  variable: 'rotate(-0.15deg)',
  package: 'rotate(0.16deg)',
};

const GraphCanvasNode = memo(
  ({ data }: NodeProps<Node<GraphNodeDataRecord>>) => {
    const selectedFontWeight = data.isSelected ? 700 : 400;
    const visualSemantics = getNodeKindVisualSemantics(data.node.kind);
    const colorToken = NODE_KIND_POST_IT_TOKENS[data.node.kind];
    const displayLabel = `${visualSemantics.labelPrefix}${data.node.name}`;

    return (
      <>
        {(
          [
            ['left', Position.Left],
            ['right', Position.Right],
            ['top', Position.Top],
            ['bottom', Position.Bottom],
          ] as const
        ).map(([side, position]) => (
          <Handle
            key={`target-${side}`}
            id={`edge-handle-${side}`}
            type="target"
            position={position}
            data-testid="graph-target-endpoint"
            style={EDGE_ENDPOINT_STYLE}
          />
        ))}
        <div
          style={{
            width: `${GRAPH_NODE_WIDTH}px`,
            minHeight: `${visualSemantics.minHeight}px`,
            boxSizing: 'border-box',
            border: `${PENCIL_TREATMENT.borderWidthPx}px ${visualSemantics.borderStyle} ${colorToken.border}`,
            borderRadius: visualSemantics.borderRadius,
            borderImage: PENCIL_TREATMENT.borderTexture,
            borderImageSlice: 1,
            background: colorToken.background,
            color: colorToken.foreground,
            padding: '0.5rem 0.75rem',
            fontWeight: selectedFontWeight,
            transform: PENCIL_WIGGLE_BY_KIND[data.node.kind],
            boxShadow: PENCIL_TREATMENT.borderShadow,
          }}
          onClick={() => data.onSelectNode(data.node.id)}
        >
          {displayLabel}
        </div>
        {(
          [
            ['left', Position.Left],
            ['right', Position.Right],
            ['top', Position.Top],
            ['bottom', Position.Bottom],
          ] as const
        ).map(([side, position]) => (
          <Handle
            key={`source-${side}`}
            id={`edge-handle-${side}`}
            type="source"
            position={position}
            data-testid="graph-source-endpoint"
            style={EDGE_ENDPOINT_STYLE}
          />
        ))}
      </>
    );
  },
);

const GraphCanvasEdge = memo(
  ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    markerEnd,
    data,
  }: EdgeProps<Edge<GraphEdgeDataRecord>>) => {
    const [edgePath] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });

    const strokeColor = data?.isHighlighted ? '#40382a' : '#5a5447';

    return (
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: PENCIL_TREATMENT.lineStrokeWidth,
          strokeDasharray: PENCIL_TREATMENT.lineStrokeDasharray,
          strokeLinecap: PENCIL_TREATMENT.lineCap,
        }}
      />
    );
  },
);

const graphNodeTypes = {
  [GRAPH_NODE_TYPE]: GraphCanvasNode,
};

const graphEdgeTypes = {
  [GRAPH_EDGE_TYPE]: GraphCanvasEdge,
};

const GraphCanvasCompatibilityLayer = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}: {
  nodes: GraphPayload['nodes'];
  edges: GraphPayload['edges'];
  selectedNodeId: string | null;
  onSelectNode: GraphCanvasProps['onSelectNode'];
}) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        fontSize: '1px',
        pointerEvents: 'none',
      }}
    >
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;

        return (
          <div
            key={node.id}
            data-testid="graph-node"
            data-node-id={node.id}
            data-selected={isSelected ? 'true' : 'false'}
            className={isSelected ? 'graph-node--selected' : undefined}
            style={{
              display: 'block',
              border: 0,
              background: 'transparent',
              padding: 0,
              fontWeight: isSelected ? 700 : 400,
            }}
            onClick={() => onSelectNode(node.id)}
          ></div>
        );
      })}
    </div>
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontSize: '1px',
        lineHeight: 1,
      }}
    >
      {edges.map((edge, index) => {
        const isHighlighted =
          selectedNodeId !== null &&
          (edge.source === selectedNodeId || edge.target === selectedNodeId);

        return (
          <div
            key={`${edge.source}->${edge.target}-${index}`}
            data-testid="graph-edge"
            data-edge-source={edge.source}
            data-edge-target={edge.target}
            data-highlighted={isHighlighted ? 'true' : 'false'}
            className={isHighlighted ? 'graph-edge--highlighted' : undefined}
          >
            {edge.source} -&gt; {edge.target}
          </div>
        );
      })}
    </div>
  </div>
);

function ViewportFocusController({
  focusRequest,
  payload,
}: {
  focusRequest: GraphCanvasProps['focusRequest'];
  payload: GraphPayload;
}) {
  const { fitView } = useReactFlow();
  const lastProcessedRequestId = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    if (!focusRequest) {
      return;
    }

    if (focusRequest.requestId === lastProcessedRequestId.current) {
      return;
    }

    const nodeExists = payload.nodes.some(
      (node) => node.id === focusRequest.nodeId,
    );

    if (!nodeExists) {
      return;
    }

    lastProcessedRequestId.current = focusRequest.requestId;

    fitView({
      nodes: [{ id: focusRequest.nodeId }],
      duration: FOCUS_ANIMATION_DURATION,
      padding: FOCUS_PADDING,
    });
  }, [focusRequest, payload.nodes, fitView]);

  return null;
}

export function GraphCanvas({
  payload,
  selectedNodeId,
  onSelectNode,
  focusRequest,
  positionOverrides,
  onNodePositionChange,
}: GraphCanvasProps) {
  const layout = computeDeterministicLayout(payload, {
    nodeWidth: GRAPH_NODE_WIDTH,
    nodeHeight: GRAPH_NODE_HEIGHT,
    rankGap: 80,
    laneGap: 36,
    maxLrColumnsBeforeFallback: 8,
  });

  const effectivePositions = positionOverrides
    ? applyPositionOverrides(layout.positions, positionOverrides)
    : layout.positions;

  const nodes: Node<GraphNodeDataRecord>[] = payload.nodes.map((node) => ({
    id: node.id,
    type: GRAPH_NODE_TYPE,
    position: effectivePositions[node.id] ?? { x: 0, y: 0 },
    initialWidth: GRAPH_NODE_WIDTH,
    initialHeight: GRAPH_NODE_HEIGHT,
    data: {
      node,
      isSelected: selectedNodeId === node.id,
      onSelectNode,
    },
  }));

  const edges: Edge<GraphEdgeDataRecord>[] = payload.edges.map(
    (edge, index) => {
      const sourcePosition = effectivePositions[edge.source] ?? { x: 0, y: 0 };
      const targetPosition = effectivePositions[edge.target] ?? { x: 0, y: 0 };
      const anchorPair = resolveEdgeAnchorPair(
        {
          x: sourcePosition.x + GRAPH_NODE_WIDTH / 2,
          y: sourcePosition.y + GRAPH_NODE_HEIGHT / 2,
        },
        {
          x: targetPosition.x + GRAPH_NODE_WIDTH / 2,
          y: targetPosition.y + GRAPH_NODE_HEIGHT / 2,
        },
      );
      const isHighlighted =
        selectedNodeId !== null &&
        (edge.source === selectedNodeId || edge.target === selectedNodeId);

      return {
        id: `${edge.source}->${edge.target}-${index}`,
        type: GRAPH_EDGE_TYPE,
        source: edge.source,
        target: edge.target,
        sourceHandle: anchorPair.sourceHandleId,
        targetHandle: anchorPair.targetHandleId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: PENCIL_TREATMENT.arrowColor,
        },
        style: {
          stroke: isHighlighted ? '#40382a' : '#5a5447',
          strokeWidth: PENCIL_TREATMENT.lineStrokeWidth,
          strokeDasharray: PENCIL_TREATMENT.lineStrokeDasharray,
          strokeLinecap: PENCIL_TREATMENT.lineCap,
        },
        data: {
          edge,
          isHighlighted,
        },
      };
    },
  );

  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodePositionChange?.(node.id, node.position);
    },
    [onNodePositionChange],
  );

  return (
    <section
      data-testid="graph-canvas"
      style={{
        width: '100%',
        height: '24rem',
        backgroundColor: WORKSPACE_DOTTED_SURFACE.backgroundColor,
        backgroundImage: WORKSPACE_DOTTED_SURFACE.backgroundImage,
        backgroundSize: WORKSPACE_DOTTED_SURFACE.backgroundSize,
      }}
    >
      <ReactFlowProvider
        initialWidth={GRAPH_CANVAS_WIDTH}
        initialHeight={GRAPH_CANVAS_HEIGHT}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={graphNodeTypes}
          edgeTypes={graphEdgeTypes}
          fitView
          onNodeDragStop={onNodePositionChange ? handleNodeDragStop : undefined}
        >
          <ViewportFocusController
            focusRequest={focusRequest}
            payload={payload}
          />
          <GraphCanvasCompatibilityLayer
            nodes={payload.nodes}
            edges={payload.edges}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </section>
  );
}

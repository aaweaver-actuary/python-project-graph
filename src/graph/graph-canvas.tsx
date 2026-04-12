import {
  BaseEdge,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getStraightPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { GraphEdge, GraphNode, GraphPayload } from "./contracts";

export interface GraphCanvasProps {
  payload: GraphPayload;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

interface GraphNodeData {
  node: GraphNode;
  isSelected: boolean;
  onSelectNode: GraphCanvasProps["onSelectNode"];
}

type GraphNodeDataRecord = Record<string, unknown> & GraphNodeData;

interface GraphEdgeData {
  edge: GraphEdge;
  isHighlighted: boolean;
}

type GraphEdgeDataRecord = Record<string, unknown> & GraphEdgeData;

const GRAPH_NODE_TYPE = "graphNode";
const GRAPH_EDGE_TYPE = "graphEdge";
const GRAPH_CANVAS_WIDTH = 960;
const GRAPH_CANVAS_HEIGHT = 384;
const GRAPH_NODE_WIDTH = 176;
const GRAPH_NODE_HEIGHT = 52;

const createNodePosition = (index: number) => ({
  x: 48 + (index % 2) * 256,
  y: 48 + Math.floor(index / 2) * 128,
});

const GraphCanvasNode = ({ data }: NodeProps<Node<GraphNodeDataRecord>>) => {
  const selectedState = data.isSelected ? "true" : "false";
  const selectedClassName = data.isSelected ? "graph-node--selected" : undefined;
  const selectedFontWeight = data.isSelected ? 700 : 400;

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        data-testid="graph-node"
        data-node-id={data.node.id}
        data-selected={selectedState}
        className={selectedClassName}
        style={{
          width: `${GRAPH_NODE_WIDTH}px`,
          minHeight: `${GRAPH_NODE_HEIGHT}px`,
          boxSizing: "border-box",
          border: "1px solid currentColor",
          borderRadius: "0.5rem",
          background: "white",
          padding: "0.5rem 0.75rem",
          fontWeight: selectedFontWeight,
        }}
        onClick={() => data.onSelectNode(data.node.id)}
      >
        {data.node.name}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

const GraphCanvasEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  data,
}: EdgeProps<Edge<GraphEdgeDataRecord>>) => {
  if (!data) {
    return null;
  }

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const highlightedState = data.isHighlighted ? "true" : "false";
  const highlightedClassName = data.isHighlighted
    ? "graph-edge--highlighted"
    : undefined;
  const edgeDirectionLabel = `${data.edge.source} -> ${data.edge.target}`;

  return (
    <g
      data-testid="graph-edge"
      data-edge-source={data.edge.source}
      data-edge-target={data.edge.target}
      data-highlighted={highlightedState}
      className={highlightedClassName}
    >
      <BaseEdge path={edgePath} markerEnd={markerEnd} />
      <text x={labelX} y={labelY} textAnchor="middle">
        {edgeDirectionLabel}
      </text>
    </g>
  );
};

const graphNodeTypes = {
  [GRAPH_NODE_TYPE]: GraphCanvasNode,
};

const graphEdgeTypes = {
  [GRAPH_EDGE_TYPE]: GraphCanvasEdge,
};

const GraphCanvasEdgeCompatibilityLayer = ({
  edges,
  selectedNodeId,
}: {
  edges: GraphPayload["edges"];
  selectedNodeId: string | null;
}) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      fontSize: "1px",
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
          data-highlighted={isHighlighted ? "true" : "false"}
          className={isHighlighted ? "graph-edge--highlighted" : undefined}
        >
          {edge.source} -&gt; {edge.target}
        </div>
      );
    })}
  </div>
);

export function GraphCanvas({
  payload,
  selectedNodeId,
  onSelectNode,
}: GraphCanvasProps) {
  const nodes: Node<GraphNodeDataRecord>[] = payload.nodes.map((node, index) => ({
    id: node.id,
    type: GRAPH_NODE_TYPE,
    position: createNodePosition(index),
    initialWidth: GRAPH_NODE_WIDTH,
    initialHeight: GRAPH_NODE_HEIGHT,
    data: {
      node,
      isSelected: selectedNodeId === node.id,
      onSelectNode,
    },
  }));

  const edges: Edge<GraphEdgeDataRecord>[] = payload.edges.map((edge, index) => ({
    id: `${edge.source}->${edge.target}-${index}`,
    type: GRAPH_EDGE_TYPE,
    source: edge.source,
    target: edge.target,
    markerEnd: { type: MarkerType.ArrowClosed },
    data: {
      edge,
      isHighlighted:
        selectedNodeId !== null &&
        (edge.source === selectedNodeId || edge.target === selectedNodeId),
    },
  }));

  return (
    <section data-testid="graph-canvas" style={{ width: "100%", height: "24rem" }}>
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
        >
          <GraphCanvasEdgeCompatibilityLayer
            edges={payload.edges}
            selectedNodeId={selectedNodeId}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </section>
  );
}

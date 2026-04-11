import type { GraphPayload } from "./contracts";

export interface GraphCanvasProps {
  payload: GraphPayload;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export function GraphCanvas({ payload }: GraphCanvasProps) {
  return (
    <section data-testid="graph-canvas">
      {payload.nodes.map((node) => (
        <div key={node.id} data-testid="graph-node" data-node-id={node.id}>
          {node.name}
        </div>
      ))}

      {payload.edges.map((edge, index) => (
        <div
          key={`${edge.source}->${edge.target}-${index}`}
          data-testid="graph-edge"
          data-edge-source={edge.source}
          data-edge-target={edge.target}
        >
          {`${edge.source} -> ${edge.target}`}
        </div>
      ))}
    </section>
  );
}

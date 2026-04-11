import type { GraphPayload } from "./contracts";

export interface GraphCanvasProps {
  payload: GraphPayload;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export function GraphCanvas({ payload }: GraphCanvasProps) {
  const { nodes, edges } = payload;

  return (
    <section data-testid="graph-canvas">
      {nodes.map((node) => (
        <div key={node.id} data-testid="graph-node" data-node-id={node.id}>
          {node.name}
        </div>
      ))}

      {edges.map((edge, index) => {
        const edgeIdentity = `${edge.source}->${edge.target}`;

        return (
          <div
            key={`${edgeIdentity}-${index}`}
            data-testid="graph-edge"
            data-edge-source={edge.source}
            data-edge-target={edge.target}
          >
            {`${edge.source} -> ${edge.target}`}
          </div>
        );
      })}
    </section>
  );
}

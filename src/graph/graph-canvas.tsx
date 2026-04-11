import type { GraphPayload } from "./contracts";

export interface GraphCanvasProps {
  payload: GraphPayload;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export function GraphCanvas({
  payload,
  selectedNodeId,
  onSelectNode,
}: GraphCanvasProps) {
  const { nodes, edges } = payload;

  return (
    <section data-testid="graph-canvas">
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;

        return (
          <div
            key={node.id}
            data-testid="graph-node"
            data-node-id={node.id}
            data-selected={isSelected ? "true" : "false"}
            className={isSelected ? "graph-node--selected" : undefined}
            style={{ fontWeight: isSelected ? 700 : 400 }}
            onClick={() => {
              onSelectNode(node.id);
            }}
          >
            {node.name}
          </div>
        );
      })}

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

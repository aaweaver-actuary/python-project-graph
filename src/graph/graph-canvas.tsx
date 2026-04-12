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
        const selectedState = isSelected ? "true" : "false";
        const selectedClassName = isSelected
          ? "graph-node--selected"
          : undefined;
        const selectedFontWeight = isSelected ? 700 : 400;

        return (
          <div
            key={node.id}
            data-testid="graph-node"
            data-node-id={node.id}
            data-selected={selectedState}
            className={selectedClassName}
            style={{ fontWeight: selectedFontWeight }}
            onClick={() => onSelectNode(node.id)}
          >
            {node.name}
          </div>
        );
      })}

      {edges.map((edge, index) => {
        const { source, target } = edge;
        const edgeIdentity = `${source}->${target}`;
        const edgeDirectionLabel = `${source} -> ${target}`;

        const isHighlighted =
          selectedNodeId !== null &&
          (source === selectedNodeId || target === selectedNodeId);
        const highlightedState = isHighlighted ? "true" : "false";
        const highlightedClassName = isHighlighted
          ? "graph-edge--highlighted"
          : undefined;

        return (
          <div
            key={`${edgeIdentity}-${index}`}
            data-testid="graph-edge"
            data-edge-source={source}
            data-edge-target={target}
            data-highlighted={highlightedState}
            className={highlightedClassName}
          >
            {edgeDirectionLabel}
          </div>
        );
      })}
    </section>
  );
}

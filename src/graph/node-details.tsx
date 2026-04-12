/* eslint-disable react-refresh/only-export-components */
import type { GraphPayload } from "./contracts";

export interface NodeDetails {
  id: string;
  name: string;
  kind: GraphPayload["nodes"][number]["kind"];
  module: string;
  file_path: string;
  line_start?: number;
  line_end?: number;
  inboundCount: number;
  outboundCount: number;
}

export interface DetailPanelProps {
  details: NodeDetails | null;
}

export function deriveSelectedNodeDetails(
  payload: GraphPayload,
  selectedNodeId: string | null,
): NodeDetails | null {
  if (selectedNodeId === null) {
    return null;
  }

  const selectedNode = payload.nodes.find((node) => node.id === selectedNodeId);

  if (selectedNode === undefined) {
    return null;
  }

  const inboundCount = payload.edges.reduce(
    (count, edge) => count + (edge.target === selectedNodeId ? 1 : 0),
    0,
  );
  const outboundCount = payload.edges.reduce(
    (count, edge) => count + (edge.source === selectedNodeId ? 1 : 0),
    0,
  );

  return {
    id: selectedNode.id,
    name: selectedNode.name,
    kind: selectedNode.kind,
    module: selectedNode.module,
    file_path: selectedNode.file_path,
    line_start: selectedNode.line_start,
    line_end: selectedNode.line_end,
    inboundCount,
    outboundCount,
  };
}

export function DetailPanel({ details }: DetailPanelProps) {
  if (details === null) {
    return null;
  }

  const hasLineStart = details.line_start !== undefined;
  const hasLineEnd = details.line_end !== undefined;
  const lineRangeText =
    hasLineStart || hasLineEnd
      ? `${hasLineStart ? details.line_start : "?"}-${hasLineEnd ? details.line_end : "?"}`
      : null;

  return (
    <section data-testid="detail-panel">
      <p data-testid="detail-name">{details.name}</p>
      <p data-testid="detail-kind">{details.kind}</p>
      <p data-testid="detail-module">{details.module}</p>
      <p data-testid="detail-file-path">{details.file_path}</p>
      {lineRangeText !== null ? (
        <p data-testid="detail-line-range">{lineRangeText}</p>
      ) : null}
      <p data-testid="detail-inbound-count">{details.inboundCount}</p>
      <p data-testid="detail-outbound-count">{details.outboundCount}</p>
    </section>
  );
}

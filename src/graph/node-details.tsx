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

function countNodeConnections(
  edges: GraphPayload["edges"],
  nodeId: string,
): Pick<NodeDetails, "inboundCount" | "outboundCount"> {
  let inboundCount = 0;
  let outboundCount = 0;

  for (const edge of edges) {
    if (edge.target === nodeId) {
      inboundCount += 1;
    }

    if (edge.source === nodeId) {
      outboundCount += 1;
    }
  }

  return { inboundCount, outboundCount };
}

function getLineRangeText(
  details: Pick<NodeDetails, "line_start" | "line_end">,
): string | null {
  const hasLineStart = details.line_start !== undefined;
  const hasLineEnd = details.line_end !== undefined;

  if (!hasLineStart && !hasLineEnd) {
    return null;
  }

  const lineStartText = hasLineStart ? String(details.line_start) : "?";
  const lineEndText = hasLineEnd ? String(details.line_end) : "?";

  return `${lineStartText}-${lineEndText}`;
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

  const { inboundCount, outboundCount } = countNodeConnections(
    payload.edges,
    selectedNodeId,
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

  const lineRangeText = getLineRangeText(details);

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

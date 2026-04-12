import type { GraphNode, GraphPayload } from './contracts';

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

function byId(left: GraphNode, right: GraphNode): number {
  return left.id.localeCompare(right.id);
}

export function searchGraphNodes(
  payload: GraphPayload,
  query: string,
): GraphNode[] {
  const normalizedQuery = normalizeQuery(query);

  if (normalizedQuery.length === 0) {
    return [];
  }

  return payload.nodes
    .filter((node) => {
      const candidates = [node.name, node.module, node.file_path, node.id];

      return candidates.some((candidate) =>
        candidate.toLowerCase().includes(normalizedQuery),
      );
    })
    .sort(byId);
}

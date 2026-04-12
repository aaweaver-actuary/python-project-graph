import type { GraphPayload } from './contracts';

export type NeighborhoodDirection = 'upstream' | 'downstream' | 'both';
export type NeighborhoodDepth = 1 | 2 | 3 | 'all';

export interface NeighborhoodConfig {
  anchorNodeId: string;
  direction: NeighborhoodDirection;
  depth: NeighborhoodDepth;
}

export function computeNeighborhood(
  payload: GraphPayload,
  config: NeighborhoodConfig,
): GraphPayload {
  const anchor = payload.nodes.find((n) => n.id === config.anchorNodeId);
  if (!anchor) return { nodes: [], edges: [] };

  const maxDepth = config.depth === 'all' ? Infinity : config.depth;

  // Build adjacency maps once — O(E) — so each BFS step is O(neighbors)
  // instead of scanning every edge.
  const forward = new Map<string, string[]>(); // source → targets
  const reverse = new Map<string, string[]>(); // target → sources
  for (const edge of payload.edges) {
    let fwd = forward.get(edge.source);
    if (!fwd) {
      fwd = [];
      forward.set(edge.source, fwd);
    }
    fwd.push(edge.target);

    let rev = reverse.get(edge.target);
    if (!rev) {
      rev = [];
      reverse.set(edge.target, rev);
    }
    rev.push(edge.source);
  }

  function bfs(direction: 'upstream' | 'downstream'): Set<string> {
    const adj = direction === 'downstream' ? forward : reverse;
    const visited = new Set<string>([config.anchorNodeId]);
    let frontier = [config.anchorNodeId];

    for (let d = 0; d < maxDepth && frontier.length > 0; d++) {
      const next: string[] = [];
      for (const nodeId of frontier) {
        for (const neighbor of adj.get(nodeId) ?? []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            next.push(neighbor);
          }
        }
      }
      frontier = next;
    }
    return visited;
  }

  const reachable =
    config.direction === 'both'
      ? new Set([...bfs('upstream'), ...bfs('downstream')])
      : bfs(config.direction);

  return {
    nodes: payload.nodes.filter((n) => reachable.has(n.id)),
    edges: payload.edges.filter(
      (e) => reachable.has(e.source) && reachable.has(e.target),
    ),
  };
}

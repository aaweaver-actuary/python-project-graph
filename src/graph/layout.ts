import type { GraphPayload } from './contracts';

export type LayoutDirection = 'LR' | 'TB';

export interface LayoutPosition {
  x: number;
  y: number;
}

export interface DeterministicLayout {
  direction: LayoutDirection;
  positions: Record<string, LayoutPosition>;
}

export interface DeterministicLayoutOptions {
  nodeWidth: number;
  nodeHeight: number;
  rankGap: number;
  laneGap: number;
  maxLrColumnsBeforeFallback: number;
}

export const DEFAULT_LAYOUT_OPTIONS: DeterministicLayoutOptions = {
  nodeWidth: 176,
  nodeHeight: 52,
  rankGap: 80,
  laneGap: 36,
  maxLrColumnsBeforeFallback: 8,
};

function compareEdgeIdentity(
  left: GraphPayload['edges'][number],
  right: GraphPayload['edges'][number],
): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }

  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }

  return left.kind.localeCompare(right.kind);
}

function deriveRanks(payload: GraphPayload): Record<string, number> {
  const rankedNodeIds = new Set(
    payload.nodes
      .filter((node) => node.topological_rank !== undefined)
      .map((node) => node.id),
  );

  const rankByNodeId = Object.fromEntries(
    payload.nodes.map((node) => [node.id, node.topological_rank ?? 0]),
  );

  const sortedEdges = [...payload.edges].sort(compareEdgeIdentity);

  for (let iteration = 0; iteration < payload.nodes.length; iteration += 1) {
    let updated = false;

    for (const edge of sortedEdges) {
      if (
        !(edge.source in rankByNodeId) ||
        !(edge.target in rankByNodeId) ||
        rankedNodeIds.has(edge.target)
      ) {
        continue;
      }

      const nextRank = rankByNodeId[edge.source] + 1;

      if (nextRank > rankByNodeId[edge.target]) {
        rankByNodeId[edge.target] = nextRank;
        updated = true;
      }
    }

    if (!updated) {
      break;
    }
  }

  return rankByNodeId;
}

function selectDirection(
  rankCount: number,
  options: DeterministicLayoutOptions,
): LayoutDirection {
  if (rankCount > options.maxLrColumnsBeforeFallback) {
    return 'TB';
  }

  return 'LR';
}

export function computeDeterministicLayout(
  payload: GraphPayload,
  options: DeterministicLayoutOptions = DEFAULT_LAYOUT_OPTIONS,
): DeterministicLayout {
  const rankByNodeId = deriveRanks(payload);
  const laneIndexByNodeId: Record<string, number> = {};
  const rankGroups = new Map<number, string[]>();

  for (const node of payload.nodes) {
    const rank = rankByNodeId[node.id] ?? 0;
    const rankGroup = rankGroups.get(rank) ?? [];
    rankGroup.push(node.id);
    rankGroups.set(rank, rankGroup);
  }

  for (const rankGroup of rankGroups.values()) {
    rankGroup.sort((left, right) => left.localeCompare(right));
    rankGroup.forEach((nodeId, laneIndex) => {
      laneIndexByNodeId[nodeId] = laneIndex;
    });
  }

  const direction = selectDirection(rankGroups.size, options);
  const rankSpan =
    direction === 'LR'
      ? options.nodeWidth + options.rankGap
      : options.nodeHeight + options.rankGap;
  const laneSpan =
    direction === 'LR'
      ? options.nodeHeight + options.laneGap
      : options.nodeWidth + options.laneGap;

  const positions = Object.fromEntries(
    payload.nodes.map((node) => {
      const rank = rankByNodeId[node.id] ?? 0;
      const laneIndex = laneIndexByNodeId[node.id] ?? 0;

      if (direction === 'LR') {
        return [node.id, { x: rank * rankSpan, y: laneIndex * laneSpan }];
      }

      return [node.id, { x: laneIndex * laneSpan, y: rank * rankSpan }];
    }),
  );

  return {
    direction,
    positions,
  };
}

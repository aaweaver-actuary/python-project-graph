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

export interface SpringRefinementOptions {
  enabled: boolean;
  iterations?: number;
  attractionStrength?: number;
  rankAttractionStrength?: number;
  maxLayerCrossing?: number;
  collisionSpacingConstraintPx?: number;
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

const DEFAULT_SPRING_REFINEMENT_OPTIONS: Required<
  Omit<SpringRefinementOptions, 'enabled'>
> = {
  iterations: 16,
  attractionStrength: 0.18,
  rankAttractionStrength: 0.04,
  maxLayerCrossing: 1,
  collisionSpacingConstraintPx: 0,
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

interface RefinementContext {
  direction: LayoutDirection;
  rankSpan: number;
  laneSpan: number;
  rankByNodeId: Record<string, number>;
}

function getRefinementAxes(direction: LayoutDirection): {
  rankAxis: 'x' | 'y';
  laneAxis: 'x' | 'y';
} {
  if (direction === 'LR') {
    return { rankAxis: 'x', laneAxis: 'y' };
  }

  return { rankAxis: 'y', laneAxis: 'x' };
}

function applyCollisionSpacingConstraint(
  positions: Record<string, LayoutPosition>,
  nodeIds: string[],
  laneAxis: 'x' | 'y',
  minSpacing: number,
): void {
  for (let leftIndex = 0; leftIndex < nodeIds.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < nodeIds.length;
      rightIndex += 1
    ) {
      const leftId = nodeIds[leftIndex];
      const rightId = nodeIds[rightIndex];
      const leftValue = positions[leftId][laneAxis];
      const rightValue = positions[rightId][laneAxis];
      const gap = rightValue - leftValue;
      const absoluteGap = Math.abs(gap);

      if (absoluteGap >= minSpacing) {
        continue;
      }

      const push = (minSpacing - absoluteGap) / 2;
      const directionSign = gap >= 0 ? 1 : -1;
      positions[leftId][laneAxis] -= push * directionSign;
      positions[rightId][laneAxis] += push * directionSign;
    }
  }
}

function enforceAdjacentLayerDistanceGuardrail(
  payload: GraphPayload,
  basePositions: Record<string, LayoutPosition>,
  refinedPositions: Record<string, LayoutPosition>,
  context: RefinementContext,
  collisionSpacingConstraintPx: number,
): void {
  if (collisionSpacingConstraintPx > 0) {
    return;
  }

  const { rankAxis, laneAxis } = getRefinementAxes(context.direction);

  for (const edge of payload.edges) {
    const sourceRank = context.rankByNodeId[edge.source];
    const targetRank = context.rankByNodeId[edge.target];

    if (Math.abs(sourceRank - targetRank) !== 1) {
      continue;
    }

    const baseSource = basePositions[edge.source];
    const baseTarget = basePositions[edge.target];
    const refinedSource = refinedPositions[edge.source];
    const refinedTarget = refinedPositions[edge.target];

    if (!baseSource || !baseTarget || !refinedSource || !refinedTarget) {
      continue;
    }

    const baseDistance = Math.hypot(
      baseTarget.x - baseSource.x,
      baseTarget.y - baseSource.y,
    );
    const refinedDistance = Math.hypot(
      refinedTarget.x - refinedSource.x,
      refinedTarget.y - refinedSource.y,
    );

    if (refinedDistance <= baseDistance) {
      continue;
    }

    let rankDifference = Math.abs(
      refinedTarget[rankAxis] - refinedSource[rankAxis],
    );

    if (rankDifference > baseDistance) {
      const rankMidpoint =
        (refinedSource[rankAxis] + refinedTarget[rankAxis]) / 2;
      const rankSign = refinedTarget[rankAxis] >= refinedSource[rankAxis] ? 1 : -1;
      refinedSource[rankAxis] = rankMidpoint - (baseDistance / 2) * rankSign;
      refinedTarget[rankAxis] = rankMidpoint + (baseDistance / 2) * rankSign;
      rankDifference = baseDistance;
    }

    const maxLaneDifference = Math.sqrt(
      Math.max(baseDistance * baseDistance - rankDifference * rankDifference, 0),
    );
    const currentLaneDifference =
      refinedTarget[laneAxis] - refinedSource[laneAxis];
    const currentLaneAbs = Math.abs(currentLaneDifference);

    if (currentLaneAbs <= maxLaneDifference) {
      continue;
    }

    const midpoint = (refinedSource[laneAxis] + refinedTarget[laneAxis]) / 2;
    const laneSign = currentLaneDifference >= 0 ? 1 : -1;
    refinedSource[laneAxis] = midpoint - (maxLaneDifference / 2) * laneSign;
    refinedTarget[laneAxis] = midpoint + (maxLaneDifference / 2) * laneSign;
  }
}

function refineWithConstrainedSpring(
  payload: GraphPayload,
  basePositions: Record<string, LayoutPosition>,
  context: RefinementContext,
  springRefinement: SpringRefinementOptions,
): Record<string, LayoutPosition> {
  if (!springRefinement.enabled) {
    return basePositions;
  }

  const options = {
    ...DEFAULT_SPRING_REFINEMENT_OPTIONS,
    ...springRefinement,
  };

  const { rankAxis, laneAxis } = getRefinementAxes(context.direction);
  const nodeIds = payload.nodes.map((node) => node.id);
  const neighborsByNodeId = new Map<string, Set<string>>();

  for (const nodeId of nodeIds) {
    neighborsByNodeId.set(nodeId, new Set());
  }

  for (const edge of payload.edges) {
    neighborsByNodeId.get(edge.source)?.add(edge.target);
    neighborsByNodeId.get(edge.target)?.add(edge.source);
  }

  const refinedPositions = Object.fromEntries(
    Object.entries(basePositions).map(([nodeId, position]) => [
      nodeId,
      { ...position },
    ]),
  ) as Record<string, LayoutPosition>;

  for (let iteration = 0; iteration < options.iterations; iteration += 1) {
    const nextPositions = Object.fromEntries(
      Object.entries(refinedPositions).map(([nodeId, position]) => [
        nodeId,
        { ...position },
      ]),
    ) as Record<string, LayoutPosition>;

    for (const nodeId of nodeIds) {
      const linkedNodeIds = neighborsByNodeId.get(nodeId);

      if (!linkedNodeIds || linkedNodeIds.size === 0) {
        continue;
      }

      let lanePull = 0;
      let rankPull = 0;

      for (const linkedNodeId of linkedNodeIds) {
        lanePull +=
          refinedPositions[linkedNodeId][laneAxis] -
          refinedPositions[nodeId][laneAxis];
        rankPull +=
          refinedPositions[linkedNodeId][rankAxis] -
          refinedPositions[nodeId][rankAxis];
      }

      nextPositions[nodeId][laneAxis] +=
        (lanePull / linkedNodeIds.size) * options.attractionStrength;
      nextPositions[nodeId][rankAxis] +=
        (rankPull / linkedNodeIds.size) * options.rankAttractionStrength;
    }

    for (const nodeId of nodeIds) {
      const base = basePositions[nodeId];
      const minRankCoordinate =
        base[rankAxis] - context.rankSpan * options.maxLayerCrossing;
      const maxRankCoordinate =
        base[rankAxis] + context.rankSpan * options.maxLayerCrossing;

      nextPositions[nodeId][rankAxis] = Math.min(
        maxRankCoordinate,
        Math.max(minRankCoordinate, nextPositions[nodeId][rankAxis]),
      );
    }

    if (options.collisionSpacingConstraintPx > 0) {
      const nodeIdsByRank = new Map<number, string[]>();

      for (const node of payload.nodes) {
        const rank = context.rankByNodeId[node.id] ?? 0;
        const rankGroup = nodeIdsByRank.get(rank) ?? [];
        rankGroup.push(node.id);
        nodeIdsByRank.set(rank, rankGroup);
      }

      for (const rankGroupNodeIds of nodeIdsByRank.values()) {
        applyCollisionSpacingConstraint(
          nextPositions,
          rankGroupNodeIds,
          laneAxis,
          options.collisionSpacingConstraintPx,
        );
      }
    }

    Object.assign(refinedPositions, nextPositions);
  }

  enforceAdjacentLayerDistanceGuardrail(
    payload,
    basePositions,
    refinedPositions,
    context,
    options.collisionSpacingConstraintPx,
  );

  return refinedPositions;
}

export function computeDeterministicLayout(
  payload: GraphPayload,
  options: DeterministicLayoutOptions = DEFAULT_LAYOUT_OPTIONS,
  springRefinement: SpringRefinementOptions = { enabled: false },
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
  const refinedPositions = refineWithConstrainedSpring(
    payload,
    positions,
    {
      direction,
      rankSpan,
      laneSpan,
      rankByNodeId,
    },
    springRefinement,
  );

  return {
    direction,
    positions: refinedPositions,
  };
}

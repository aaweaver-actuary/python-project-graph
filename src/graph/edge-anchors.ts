export type EdgeAnchorSide = 'left' | 'right' | 'top' | 'bottom';

export interface AnchorPoint {
  x: number;
  y: number;
}

export interface EdgeAnchorPair {
  sourceSide: EdgeAnchorSide;
  targetSide: EdgeAnchorSide;
  sourceHandleId: string;
  targetHandleId: string;
}

export const EDGE_HANDLE_ID_BY_SIDE: Record<EdgeAnchorSide, string> = {
  left: 'edge-handle-left',
  right: 'edge-handle-right',
  top: 'edge-handle-top',
  bottom: 'edge-handle-bottom',
};

export function resolveNodeSideTowardTarget(
  source: AnchorPoint,
  target: AnchorPoint,
): EdgeAnchorSide {
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0 ? 'right' : 'left';
  }

  return deltaY >= 0 ? 'bottom' : 'top';
}

export function resolveEdgeAnchorPair(
  source: AnchorPoint,
  target: AnchorPoint,
): EdgeAnchorPair {
  const sourceSide = resolveNodeSideTowardTarget(source, target);
  const targetSide = resolveNodeSideTowardTarget(target, source);

  return {
    sourceSide,
    targetSide,
    sourceHandleId: EDGE_HANDLE_ID_BY_SIDE[sourceSide],
    targetHandleId: EDGE_HANDLE_ID_BY_SIDE[targetSide],
  };
}

export type EdgeAnchorSide = 'left' | 'right' | 'top' | 'bottom';

export interface AnchorPoint {
  x: number;
  y: number;
}

export interface AnchorNodeSize {
  width: number;
  height: number;
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
  sourceSize?: AnchorNodeSize,
): EdgeAnchorSide {
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const normalizedDeltaX = sourceSize
    ? Math.abs(deltaX) / Math.max(sourceSize.width / 2, 1)
    : Math.abs(deltaX);
  const normalizedDeltaY = sourceSize
    ? Math.abs(deltaY) / Math.max(sourceSize.height / 2, 1)
    : Math.abs(deltaY);

  if (normalizedDeltaX >= normalizedDeltaY) {
    return deltaX >= 0 ? 'right' : 'left';
  }

  return deltaY >= 0 ? 'bottom' : 'top';
}

export function resolveEdgeAnchorPair(
  source: AnchorPoint,
  target: AnchorPoint,
  sizes?: {
    sourceSize?: AnchorNodeSize;
    targetSize?: AnchorNodeSize;
  },
): EdgeAnchorPair {
  const sourceSide = resolveNodeSideTowardTarget(
    source,
    target,
    sizes?.sourceSize,
  );
  const targetSide = resolveNodeSideTowardTarget(
    target,
    source,
    sizes?.targetSize,
  );

  return {
    sourceSide,
    targetSide,
    sourceHandleId: EDGE_HANDLE_ID_BY_SIDE[sourceSide],
    targetHandleId: EDGE_HANDLE_ID_BY_SIDE[targetSide],
  };
}

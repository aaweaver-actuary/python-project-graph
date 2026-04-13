import { describe, expect, it } from 'vitest';

import {
  EDGE_HANDLE_ID_BY_SIDE,
  resolveEdgeAnchorPair,
  resolveNodeSideTowardTarget,
} from './edge-anchors';

describe('edge anchor resolution contract (SL-BUNDLE-CONN)', () => {
  it('resolves side toward target across all directions', () => {
    expect(
      resolveNodeSideTowardTarget({ x: 10, y: 10 }, { x: 100, y: 15 }),
    ).toBe('right');
    expect(
      resolveNodeSideTowardTarget({ x: 100, y: 10 }, { x: 10, y: 5 }),
    ).toBe('left');
    expect(
      resolveNodeSideTowardTarget({ x: 10, y: 10 }, { x: 15, y: 80 }),
    ).toBe('bottom');
    expect(resolveNodeSideTowardTarget({ x: 10, y: 80 }, { x: 5, y: 10 })).toBe(
      'top',
    );
  });

  it('maps resolved sides to concrete source/target handle ids', () => {
    expect(EDGE_HANDLE_ID_BY_SIDE.left).toBe('edge-handle-left');
    expect(EDGE_HANDLE_ID_BY_SIDE.right).toBe('edge-handle-right');
    expect(EDGE_HANDLE_ID_BY_SIDE.top).toBe('edge-handle-top');
    expect(EDGE_HANDLE_ID_BY_SIDE.bottom).toBe('edge-handle-bottom');

    expect(resolveEdgeAnchorPair({ x: 0, y: 0 }, { x: 120, y: 0 })).toEqual({
      sourceSide: 'right',
      targetSide: 'left',
      sourceHandleId: 'edge-handle-right',
      targetHandleId: 'edge-handle-left',
    });
  });
});

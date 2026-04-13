import { describe, expect, it } from 'vitest';

import type { GraphPayload } from './contracts';
import { graphFixturePayload } from './fixture-data-source.adapter';
import { DEFAULT_LAYOUT_OPTIONS, computeDeterministicLayout } from './layout';

describe('computeDeterministicLayout (WU-02)', () => {
  it('is deterministic for the same payload', () => {
    const first = computeDeterministicLayout(graphFixturePayload);
    const second = computeDeterministicLayout(graphFixturePayload);

    expect(first).toEqual(second);
  });

  it('uses topological_rank when present and defaults to left-to-right direction', () => {
    const layout = computeDeterministicLayout(graphFixturePayload);

    expect(layout.direction).toBe('LR');
    expect(layout.positions['module.utils'].x).toBeLessThan(
      layout.positions['module.utils.parse_config'].x,
    );
    expect(layout.positions['module.utils.parse_config'].x).toBeLessThan(
      layout.positions['module.pipeline.run_model'].x,
    );
  });

  it('falls back to top-to-bottom when rank column count exceeds threshold', () => {
    const payload: GraphPayload = {
      nodes: [
        {
          id: 'a',
          kind: 'module',
          name: 'a',
          module: 'a',
          file_path: 'a.py',
          topological_rank: 0,
        },
        {
          id: 'b',
          kind: 'module',
          name: 'b',
          module: 'b',
          file_path: 'b.py',
          topological_rank: 1,
        },
        {
          id: 'c',
          kind: 'module',
          name: 'c',
          module: 'c',
          file_path: 'c.py',
          topological_rank: 2,
        },
        {
          id: 'd',
          kind: 'module',
          name: 'd',
          module: 'd',
          file_path: 'd.py',
          topological_rank: 3,
        },
      ],
      edges: [],
    };

    const layout = computeDeterministicLayout(payload, {
      ...DEFAULT_LAYOUT_OPTIONS,
      maxLrColumnsBeforeFallback: 3,
    });

    expect(layout.direction).toBe('TB');
    expect(layout.positions.a.y).toBeLessThan(layout.positions.d.y);
  });

  it('computes ranks from edges when topological_rank is missing', () => {
    const payload: GraphPayload = {
      nodes: [
        {
          id: 'root',
          kind: 'module',
          name: 'root',
          module: 'root',
          file_path: 'root.py',
        },
        {
          id: 'child',
          kind: 'module',
          name: 'child',
          module: 'child',
          file_path: 'child.py',
        },
      ],
      edges: [{ source: 'root', target: 'child', kind: 'dependency' }],
    };

    const layout = computeDeterministicLayout(payload);

    expect(layout.positions.root.x).toBeLessThan(layout.positions.child.x);
  });

  describe('constrained spring refinement (SL-BUNDLE-SPRING)', () => {
    const springPayload: GraphPayload = {
      nodes: [
        {
          id: 'a',
          kind: 'module',
          name: 'a',
          module: 'a',
          file_path: 'a.py',
          topological_rank: 0,
        },
        {
          id: 'b',
          kind: 'module',
          name: 'b',
          module: 'b',
          file_path: 'b.py',
          topological_rank: 1,
        },
        {
          id: 'c',
          kind: 'module',
          name: 'c',
          module: 'c',
          file_path: 'c.py',
          topological_rank: 1,
        },
      ],
      edges: [{ source: 'a', target: 'b', kind: 'dependency' }],
    };

    it('keeps FR-2 coordinates primary and only refines when spring is enabled', () => {
      const baseLayout = computeDeterministicLayout(springPayload);
      const disabledSpringLayout = computeDeterministicLayout(
        springPayload,
        DEFAULT_LAYOUT_OPTIONS,
        { enabled: false },
      );
      const enabledSpringLayout = computeDeterministicLayout(
        springPayload,
        DEFAULT_LAYOUT_OPTIONS,
        {
          enabled: true,
          iterations: 32,
        },
      );

      expect(disabledSpringLayout.positions).toEqual(baseLayout.positions);
      expect(enabledSpringLayout.positions).not.toEqual(baseLayout.positions);
      expect(enabledSpringLayout.positions.a.x).toBeLessThan(
        enabledSpringLayout.positions.b.x,
      );
    });

    it('prevents adjacent-layer connected nodes from ending farther apart without explicit spacing constraints', () => {
      const baseLayout = computeDeterministicLayout(springPayload);
      const refinedLayout = computeDeterministicLayout(
        springPayload,
        DEFAULT_LAYOUT_OPTIONS,
        {
          enabled: true,
          iterations: 48,
          rankAttractionStrength: 0.12,
        },
      );

      for (const edge of springPayload.edges) {
        const baseDistance = Math.hypot(
          baseLayout.positions[edge.target].x -
            baseLayout.positions[edge.source].x,
          baseLayout.positions[edge.target].y -
            baseLayout.positions[edge.source].y,
        );
        const refinedDistance = Math.hypot(
          refinedLayout.positions[edge.target].x -
            refinedLayout.positions[edge.source].x,
          refinedLayout.positions[edge.target].y -
            refinedLayout.positions[edge.source].y,
        );

        expect(refinedDistance).toBeLessThanOrEqual(baseDistance + 0.00001);
      }
    });

    it('keeps adjacent-layer edge distance bounded when rank-axis separation grows during refinement', () => {
      const compactLayoutOptions = {
        nodeWidth: 10,
        nodeHeight: 10,
        rankGap: 0,
        laneGap: 0,
        maxLrColumnsBeforeFallback: 8,
      } as const;
      const payload: GraphPayload = {
        nodes: [
          {
            id: 'left-1',
            kind: 'module',
            name: 'left-1',
            module: 'left_1',
            file_path: 'left_1.py',
            topological_rank: 0,
          },
          {
            id: 'left-2',
            kind: 'module',
            name: 'left-2',
            module: 'left_2',
            file_path: 'left_2.py',
            topological_rank: 0,
          },
          {
            id: 'a',
            kind: 'module',
            name: 'a',
            module: 'a',
            file_path: 'a.py',
            topological_rank: 1,
          },
          {
            id: 'b',
            kind: 'module',
            name: 'b',
            module: 'b',
            file_path: 'b.py',
            topological_rank: 2,
          },
          {
            id: 'right-1',
            kind: 'module',
            name: 'right-1',
            module: 'right_1',
            file_path: 'right_1.py',
            topological_rank: 3,
          },
          {
            id: 'right-2',
            kind: 'module',
            name: 'right-2',
            module: 'right_2',
            file_path: 'right_2.py',
            topological_rank: 3,
          },
        ],
        edges: [
          { source: 'left-1', target: 'a', kind: 'dependency' },
          { source: 'left-2', target: 'a', kind: 'dependency' },
          { source: 'a', target: 'b', kind: 'dependency' },
          { source: 'b', target: 'right-1', kind: 'dependency' },
          { source: 'b', target: 'right-2', kind: 'dependency' },
        ],
      };
      const baseLayout = computeDeterministicLayout(
        payload,
        compactLayoutOptions,
      );
      const refinedLayout = computeDeterministicLayout(
        payload,
        compactLayoutOptions,
        {
          enabled: true,
          iterations: 1,
          attractionStrength: 0,
          rankAttractionStrength: 1,
        },
      );

      const baseDistance = Math.hypot(
        baseLayout.positions.b.x - baseLayout.positions.a.x,
        baseLayout.positions.b.y - baseLayout.positions.a.y,
      );
      const refinedDistance = Math.hypot(
        refinedLayout.positions.b.x - refinedLayout.positions.a.x,
        refinedLayout.positions.b.y - refinedLayout.positions.a.y,
      );

      expect(refinedDistance).toBeLessThanOrEqual(baseDistance + 0.00001);
    });

    it('enforces adjacent-layer distance guardrail as a global final-state invariant for shared-node edges', () => {
      const compactLayoutOptions = {
        nodeWidth: 10,
        nodeHeight: 10,
        rankGap: 0,
        laneGap: 0,
        maxLrColumnsBeforeFallback: 8,
      } as const;
      const payload: GraphPayload = {
        nodes: [
          {
            id: 'l1',
            kind: 'module',
            name: 'l1',
            module: 'l1',
            file_path: 'l1.py',
            topological_rank: 0,
          },
          {
            id: 'l2',
            kind: 'module',
            name: 'l2',
            module: 'l2',
            file_path: 'l2.py',
            topological_rank: 0,
          },
          {
            id: 'm1',
            kind: 'module',
            name: 'm1',
            module: 'm1',
            file_path: 'm1.py',
            topological_rank: 1,
          },
          {
            id: 'm2',
            kind: 'module',
            name: 'm2',
            module: 'm2',
            file_path: 'm2.py',
            topological_rank: 1,
          },
          {
            id: 'r1',
            kind: 'module',
            name: 'r1',
            module: 'r1',
            file_path: 'r1.py',
            topological_rank: 2,
          },
          {
            id: 'r2',
            kind: 'module',
            name: 'r2',
            module: 'r2',
            file_path: 'r2.py',
            topological_rank: 2,
          },
        ],
        edges: [
          { source: 'l1', target: 'm1', kind: 'dependency' },
          { source: 'l2', target: 'm1', kind: 'dependency' },
          { source: 'l1', target: 'm2', kind: 'dependency' },
          { source: 'l2', target: 'm2', kind: 'dependency' },
          { source: 'm1', target: 'r1', kind: 'dependency' },
          { source: 'm1', target: 'r2', kind: 'dependency' },
          { source: 'm2', target: 'r1', kind: 'dependency' },
          { source: 'm2', target: 'r2', kind: 'dependency' },
        ],
      };
      const baseLayout = computeDeterministicLayout(
        payload,
        compactLayoutOptions,
      );
      const refinedLayout = computeDeterministicLayout(
        payload,
        compactLayoutOptions,
        {
          enabled: true,
          iterations: 8,
          attractionStrength: 1,
          rankAttractionStrength: 1,
        },
      );

      for (const edge of payload.edges) {
        const baseDistance = Math.hypot(
          baseLayout.positions[edge.target].x -
            baseLayout.positions[edge.source].x,
          baseLayout.positions[edge.target].y -
            baseLayout.positions[edge.source].y,
        );
        const refinedDistance = Math.hypot(
          refinedLayout.positions[edge.target].x -
            refinedLayout.positions[edge.source].x,
          refinedLayout.positions[edge.target].y -
            refinedLayout.positions[edge.source].y,
        );
        expect(refinedDistance).toBeLessThanOrEqual(baseDistance + 0.00001);
      }
    });

    it('allows adjacent-layer distance increase when explicit collision spacing constraint is enabled', () => {
      const baseLayout = computeDeterministicLayout(springPayload);
      const refinedLayout = computeDeterministicLayout(
        springPayload,
        DEFAULT_LAYOUT_OPTIONS,
        {
          enabled: true,
          iterations: 24,
          rankAttractionStrength: 0,
          collisionSpacingConstraintPx: 220,
        },
      );

      const baseDistance = Math.hypot(
        baseLayout.positions.b.x - baseLayout.positions.a.x,
        baseLayout.positions.b.y - baseLayout.positions.a.y,
      );
      const refinedDistance = Math.hypot(
        refinedLayout.positions.b.x - refinedLayout.positions.a.x,
        refinedLayout.positions.b.y - refinedLayout.positions.a.y,
      );

      expect(refinedDistance).toBeGreaterThan(baseDistance);
    });

    it('clamps spring displacement to at most one layer crossing from FR-2 start layer', () => {
      const baseLayout = computeDeterministicLayout(springPayload);
      const refinedLayout = computeDeterministicLayout(
        springPayload,
        DEFAULT_LAYOUT_OPTIONS,
        {
          enabled: true,
          iterations: 40,
          rankAttractionStrength: 1,
        },
      );
      const rankSpan =
        DEFAULT_LAYOUT_OPTIONS.nodeWidth + DEFAULT_LAYOUT_OPTIONS.rankGap;

      for (const nodeId of Object.keys(baseLayout.positions)) {
        const rankDisplacement = Math.abs(
          refinedLayout.positions[nodeId].x - baseLayout.positions[nodeId].x,
        );
        expect(rankDisplacement).toBeLessThanOrEqual(rankSpan + 0.00001);
      }
    });
  });
});

import { describe, expect, it } from 'vitest';

import type { GraphPayload } from './contracts';
import { graphFixturePayload } from './fixture-data-source.adapter';
import {
  DEFAULT_LAYOUT_OPTIONS,
  computeDeterministicLayout,
} from './layout';

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
});

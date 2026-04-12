import { describe, expect, it } from 'vitest';

import type { GraphPayload, NodeKind } from './contracts';
import { applyGraphFilters, DEFAULT_GRAPH_FILTER_STATE } from './filters';
import { computeDeterministicLayout, DEFAULT_LAYOUT_OPTIONS } from './layout';
import { computeNeighborhood } from './neighborhood';
import { searchGraphNodes } from './search';

const NODE_KINDS: NodeKind[] = [
  'module',
  'class',
  'method',
  'function',
  'import',
  'constant',
  'variable',
  'package',
];

function generateSyntheticGraph(
  nodeCount: number,
  edgesPerNode: number,
): GraphPayload {
  const nodes: GraphPayload['nodes'] = [];
  const edges: GraphPayload['edges'] = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `node-${i}`,
      kind: NODE_KINDS[i % NODE_KINDS.length],
      name: `symbol_${i}`,
      module: `pkg.mod_${Math.floor(i / 10)}`,
      file_path: `src/pkg/mod_${Math.floor(i / 10)}.py`,
      topological_rank: Math.floor(i / 5),
    });
  }

  for (let i = 0; i < nodeCount; i++) {
    for (let e = 0; e < edgesPerNode; e++) {
      const target = i + e + 1;

      if (target < nodeCount) {
        edges.push({
          source: `node-${i}`,
          target: `node-${target}`,
          kind: 'dependency',
        });
      }
    }
  }

  return { nodes, edges };
}

describe('Performance benchmarks (WU-08)', () => {
  const graph1000 = generateSyntheticGraph(1000, 4);
  const graph2000 = generateSyntheticGraph(2000, 4);

  it('computeDeterministicLayout handles 1000 nodes in <500ms', () => {
    const start = performance.now();
    const result = computeDeterministicLayout(
      graph1000,
      DEFAULT_LAYOUT_OPTIONS,
    );
    const elapsed = performance.now() - start;

    expect(Object.keys(result.positions)).toHaveLength(1000);
    expect(elapsed).toBeLessThan(500);
  });

  it('computeDeterministicLayout handles 2000 nodes in <2000ms', () => {
    const start = performance.now();
    const result = computeDeterministicLayout(
      graph2000,
      DEFAULT_LAYOUT_OPTIONS,
    );
    const elapsed = performance.now() - start;

    expect(Object.keys(result.positions)).toHaveLength(2000);
    expect(elapsed).toBeLessThan(2000);
  });

  it('applyGraphFilters handles 1000 nodes in <100ms', () => {
    const start = performance.now();
    const result = applyGraphFilters(graph1000, {
      ...DEFAULT_GRAPH_FILTER_STATE,
      moduleQuery: 'mod_5',
    });
    const elapsed = performance.now() - start;

    expect(result.nodes.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(100);
  });

  it('computeNeighborhood handles 1000 nodes in <100ms', () => {
    const start = performance.now();
    const result = computeNeighborhood(graph1000, {
      anchorNodeId: 'node-500',
      direction: 'both',
      depth: 3,
    });
    const elapsed = performance.now() - start;

    expect(result.nodes.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(100);
  });

  it('searchGraphNodes handles 1000 nodes in <100ms', () => {
    const start = performance.now();
    const result = searchGraphNodes(graph1000, 'symbol_50');
    const elapsed = performance.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(100);
  });
});

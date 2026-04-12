import { describe, expect, it } from 'vitest';

import type { GraphEdge, GraphNode, GraphPayload } from './contracts';
import { computeNeighborhood } from './neighborhood';
import type { NeighborhoodConfig } from './neighborhood';

// ---------------------------------------------------------------------------
// Fixture: linear chain with a branch
//
//   A → B → C → D
//            ↘
//             E → F
// ---------------------------------------------------------------------------

function makeNode(id: string): GraphNode {
  return {
    id,
    kind: 'module',
    name: id,
    module: `mod.${id.toLowerCase()}`,
    file_path: `src/${id.toLowerCase()}.py`,
  };
}

function makeEdge(source: string, target: string): GraphEdge {
  return { source, target, kind: 'dependency' };
}

const fixture: GraphPayload = {
  nodes: ['A', 'B', 'C', 'D', 'E', 'F'].map(makeNode),
  edges: [
    makeEdge('A', 'B'),
    makeEdge('B', 'C'),
    makeEdge('C', 'D'),
    makeEdge('C', 'E'),
    makeEdge('E', 'F'),
  ],
};

// ---------------------------------------------------------------------------
// Helpers — sort ids and edge representations for stable comparison
// ---------------------------------------------------------------------------

function sortedNodeIds(payload: GraphPayload): string[] {
  return payload.nodes.map((n) => n.id).sort();
}

function sortedEdgeKeys(payload: GraphPayload): string[] {
  return payload.edges.map((e) => `${e.source}->${e.target}`).sort();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('computeNeighborhood (WU-06)', () => {
  it('single-hop upstream returns only direct parents + anchor', () => {
    const config: NeighborhoodConfig = {
      anchorNodeId: 'C',
      direction: 'upstream',
      depth: 1,
    };

    const result = computeNeighborhood(fixture, config);

    expect(sortedNodeIds(result)).toEqual(['B', 'C']);
    expect(sortedEdgeKeys(result)).toEqual(['B->C']);
  });

  it('single-hop downstream returns only direct children + anchor', () => {
    const config: NeighborhoodConfig = {
      anchorNodeId: 'B',
      direction: 'downstream',
      depth: 1,
    };

    const result = computeNeighborhood(fixture, config);

    expect(sortedNodeIds(result)).toEqual(['B', 'C']);
    expect(sortedEdgeKeys(result)).toEqual(['B->C']);
  });

  it('multi-hop depth 2 upstream', () => {
    const config: NeighborhoodConfig = {
      anchorNodeId: 'D',
      direction: 'upstream',
      depth: 2,
    };

    const result = computeNeighborhood(fixture, config);

    expect(sortedNodeIds(result)).toEqual(['B', 'C', 'D']);
    expect(sortedEdgeKeys(result)).toEqual(['B->C', 'C->D']);
  });

  it("depth 'all' returns full transitive closure upstream", () => {
    const config: NeighborhoodConfig = {
      anchorNodeId: 'D',
      direction: 'upstream',
      depth: 'all',
    };

    const result = computeNeighborhood(fixture, config);

    expect(sortedNodeIds(result)).toEqual(['A', 'B', 'C', 'D']);
    expect(sortedEdgeKeys(result)).toEqual(['A->B', 'B->C', 'C->D']);
  });

  it("'both' direction combines upstream and downstream", () => {
    const config: NeighborhoodConfig = {
      anchorNodeId: 'C',
      direction: 'both',
      depth: 1,
    };

    const result = computeNeighborhood(fixture, config);

    expect(sortedNodeIds(result)).toEqual(['B', 'C', 'D', 'E']);
    expect(sortedEdgeKeys(result)).toEqual(['B->C', 'C->D', 'C->E']);
  });

  it('anchor node with no neighbors returns just the anchor', () => {
    const config: NeighborhoodConfig = {
      anchorNodeId: 'A',
      direction: 'upstream',
      depth: 1,
    };

    const result = computeNeighborhood(fixture, config);

    expect(sortedNodeIds(result)).toEqual(['A']);
    expect(sortedEdgeKeys(result)).toEqual([]);
  });

  it('anchor node not in payload returns empty result', () => {
    const config: NeighborhoodConfig = {
      anchorNodeId: 'Z',
      direction: 'downstream',
      depth: 1,
    };

    const result = computeNeighborhood(fixture, config);

    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it('edges between non-reachable nodes are excluded', () => {
    const config: NeighborhoodConfig = {
      anchorNodeId: 'C',
      direction: 'downstream',
      depth: 1,
    };

    const result = computeNeighborhood(fixture, config);

    expect(sortedNodeIds(result)).toEqual(['C', 'D', 'E']);
    expect(sortedEdgeKeys(result)).toEqual(['C->D', 'C->E']);

    // Edges outside the reachable set must not appear
    const edgeKeys = sortedEdgeKeys(result);
    expect(edgeKeys).not.toContain('A->B');
    expect(edgeKeys).not.toContain('E->F');
  });

  it("depth 'all' downstream from A returns entire graph", () => {
    const config: NeighborhoodConfig = {
      anchorNodeId: 'A',
      direction: 'downstream',
      depth: 'all',
    };

    const result = computeNeighborhood(fixture, config);

    expect(sortedNodeIds(result)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(sortedEdgeKeys(result)).toEqual([
      'A->B',
      'B->C',
      'C->D',
      'C->E',
      'E->F',
    ]);
  });

  it('terminates on cycles and returns all reachable nodes and edges', () => {
    const cyclePayload: GraphPayload = {
      nodes: ['X', 'Y', 'Z'].map(makeNode),
      edges: [makeEdge('X', 'Y'), makeEdge('Y', 'Z'), makeEdge('Z', 'X')],
    };
    const config: NeighborhoodConfig = {
      anchorNodeId: 'X',
      direction: 'downstream',
      depth: 'all',
    };

    const result = computeNeighborhood(cyclePayload, config);

    expect(sortedNodeIds(result)).toEqual(['X', 'Y', 'Z']);
    expect(sortedEdgeKeys(result)).toEqual(['X->Y', 'Y->Z', 'Z->X']);
  });

  it('handles self-edges correctly', () => {
    const selfEdgePayload: GraphPayload = {
      nodes: [makeNode('S')],
      edges: [makeEdge('S', 'S')],
    };
    const config: NeighborhoodConfig = {
      anchorNodeId: 'S',
      direction: 'downstream',
      depth: 1,
    };

    const result = computeNeighborhood(selfEdgePayload, config);

    expect(sortedNodeIds(result)).toEqual(['S']);
    expect(sortedEdgeKeys(result)).toEqual(['S->S']);
  });

  it('returns empty result for an empty graph', () => {
    const emptyPayload: GraphPayload = { nodes: [], edges: [] };
    const config: NeighborhoodConfig = {
      anchorNodeId: 'A',
      direction: 'downstream',
      depth: 1,
    };

    const result = computeNeighborhood(emptyPayload, config);

    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });
});

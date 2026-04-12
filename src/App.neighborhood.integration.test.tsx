// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./graph/graph-canvas', () => ({
  GraphCanvas: ({
    payload,
    selectedNodeId,
    onSelectNode,
  }: {
    payload: GraphPayload;
    selectedNodeId: string | null;
    onSelectNode: (id: string) => void;
  }) => (
    <div data-testid="graph-canvas">
      <p data-testid="canvas-node-count">{payload.nodes.length}</p>
      <p data-testid="canvas-edge-count">{payload.edges.length}</p>
      {payload.nodes.map((n: GraphNode) => (
        <button
          key={n.id}
          data-testid={`canvas-node-${n.id}`}
          data-selected={n.id === selectedNodeId}
          onClick={() => onSelectNode(n.id)}
        >
          {n.name}
        </button>
      ))}
    </div>
  ),
}));

import App from './App';
import type { GraphBootstrapState } from './graph/bootstrap.contracts';
import type { GraphNode, GraphPayload } from './graph/contracts';

// ---------------------------------------------------------------------------
// Test fixture: linear chain  A → B → C → D
// ---------------------------------------------------------------------------

const testPayload: GraphPayload = {
  nodes: [
    {
      id: 'A',
      kind: 'module',
      name: 'A',
      module: 'mod.a',
      file_path: 'src/a.py',
    },
    {
      id: 'B',
      kind: 'module',
      name: 'B',
      module: 'mod.b',
      file_path: 'src/b.py',
    },
    {
      id: 'C',
      kind: 'module',
      name: 'C',
      module: 'mod.c',
      file_path: 'src/c.py',
    },
    {
      id: 'D',
      kind: 'module',
      name: 'D',
      module: 'mod.d',
      file_path: 'src/d.py',
    },
  ],
  edges: [
    { source: 'A', target: 'B', kind: 'dependency' },
    { source: 'B', target: 'C', kind: 'dependency' },
    { source: 'C', target: 'D', kind: 'dependency' },
  ],
};

function createReadyBootstrap(
  payload: GraphPayload,
): () => Promise<GraphBootstrapState> {
  return () => Promise.resolve({ state: 'ready' as const, payload });
}

function renderApp(payload: GraphPayload = testPayload) {
  return render(
    <StrictMode>
      <App runBootstrap={createReadyBootstrap(payload)} />
    </StrictMode>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('App neighborhood controls (WU-06)', () => {
  it('renders Neighborhood fieldset with direction, depth, focus, and clear controls in the sidebar', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    const sidebar = screen.getByTestId('filter-sidebar');

    // Fieldset with legend
    expect(within(sidebar).getByText('Neighborhood')).toBeInTheDocument();

    // Direction radio buttons
    expect(
      screen.getByTestId('neighborhood-direction-upstream'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('neighborhood-direction-downstream'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('neighborhood-direction-both'),
    ).toBeInTheDocument();

    // Depth radio buttons
    expect(screen.getByTestId('neighborhood-depth-1')).toBeInTheDocument();
    expect(screen.getByTestId('neighborhood-depth-2')).toBeInTheDocument();
    expect(screen.getByTestId('neighborhood-depth-3')).toBeInTheDocument();
    expect(screen.getByTestId('neighborhood-depth-all')).toBeInTheDocument();

    // Action buttons
    expect(screen.getByTestId('neighborhood-focus-btn')).toBeInTheDocument();
    expect(screen.getByTestId('neighborhood-clear-btn')).toBeInTheDocument();
  });

  it('Focus Neighborhood button is disabled when no node is selected', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    const focusBtn = screen.getByTestId('neighborhood-focus-btn');
    expect(focusBtn).toBeDisabled();
  });

  it('Clear Neighborhood button is disabled when neighborhood is not active', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    const clearBtn = screen.getByTestId('neighborhood-clear-btn');
    expect(clearBtn).toBeDisabled();
  });

  it('Focus Neighborhood is enabled after selecting a node', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    // Select node B
    fireEvent.click(screen.getByTestId('canvas-node-B'));

    const focusBtn = screen.getByTestId('neighborhood-focus-btn');
    expect(focusBtn).not.toBeDisabled();
  });

  it("activating neighborhood on node B (depth 1, both) shows only B's neighbors", async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    // All 4 nodes initially visible
    expect(screen.getByTestId('canvas-node-count')).toHaveTextContent('4');

    // Select node B
    fireEvent.click(screen.getByTestId('canvas-node-B'));

    // Default direction is 'both', default depth is 1
    // Click Focus Neighborhood
    fireEvent.click(screen.getByTestId('neighborhood-focus-btn'));

    // B (depth 1, both): upstream = {A, B}, downstream = {B, C} → union = {A, B, C}
    await waitFor(() => {
      expect(screen.getByTestId('canvas-node-count')).toHaveTextContent('3');
    });
  });

  it('changing direction to downstream before focusing restricts neighborhood', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    // Select node B
    fireEvent.click(screen.getByTestId('canvas-node-B'));

    // Switch direction to downstream
    fireEvent.click(screen.getByTestId('neighborhood-direction-downstream'));

    // Focus
    fireEvent.click(screen.getByTestId('neighborhood-focus-btn'));

    // B (depth 1, downstream): {B, C}
    await waitFor(() => {
      expect(screen.getByTestId('canvas-node-count')).toHaveTextContent('2');
    });
  });

  it('changing depth to 2 expands neighborhood reach', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    // Select node A
    fireEvent.click(screen.getByTestId('canvas-node-A'));

    // Switch depth to 2, direction defaults to both
    fireEvent.click(screen.getByTestId('neighborhood-depth-2'));

    // Focus
    fireEvent.click(screen.getByTestId('neighborhood-focus-btn'));

    // A has no upstream. Downstream depth 2: {A, B, C} → both union = {A, B, C}
    await waitFor(() => {
      expect(screen.getByTestId('canvas-node-count')).toHaveTextContent('3');
    });
  });

  it('Clear Neighborhood becomes enabled after activating neighborhood', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    // Select a node and activate neighborhood
    fireEvent.click(screen.getByTestId('canvas-node-B'));
    fireEvent.click(screen.getByTestId('neighborhood-focus-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('neighborhood-clear-btn')).not.toBeDisabled();
    });
  });

  it('Clear Neighborhood restores full graph view', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    // All 4 nodes initially
    expect(screen.getByTestId('canvas-node-count')).toHaveTextContent('4');

    // Activate neighborhood
    fireEvent.click(screen.getByTestId('canvas-node-B'));
    fireEvent.click(screen.getByTestId('neighborhood-focus-btn'));

    // Wait for neighborhood to reduce count
    await waitFor(() => {
      expect(screen.getByTestId('canvas-node-count')).not.toHaveTextContent(
        '4',
      );
    });

    // Clear neighborhood
    fireEvent.click(screen.getByTestId('neighborhood-clear-btn'));

    // Full count restored
    await waitFor(() => {
      expect(screen.getByTestId('canvas-node-count')).toHaveTextContent('4');
    });
  });

  it("direction defaults to 'both' (radio checked)", async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    const bothRadio = screen.getByTestId('neighborhood-direction-both');
    expect(bothRadio).toBeChecked();
  });

  it('depth defaults to 1 (radio checked)', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    const depth1Radio = screen.getByTestId('neighborhood-depth-1');
    expect(depth1Radio).toBeChecked();
  });
});

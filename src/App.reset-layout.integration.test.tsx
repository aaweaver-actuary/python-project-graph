// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it } from 'vitest';

vi.mock('./graph/graph-canvas', () => ({
  GraphCanvas: ({ payload }: { payload: GraphPayload }) => (
    <div data-testid="graph-canvas">
      <p data-testid="canvas-node-count">{payload.nodes.length}</p>
    </div>
  ),
}));

import { vi } from 'vitest';
import App from './App';
import type { GraphBootstrapState } from './graph/bootstrap.contracts';
import type { GraphPayload } from './graph/contracts';

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
  ],
  edges: [{ source: 'A', target: 'B', kind: 'dependency' }],
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

describe('App Reset Layout button (WU-07)', () => {
  it('renders a Reset Layout button in the ready view', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    expect(screen.getByTestId('reset-layout-btn')).toBeInTheDocument();
  });

  it('Reset Layout button has accessible text "Reset Layout"', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-ready-view')).toBeInTheDocument();
    });

    const resetBtn = screen.getByTestId('reset-layout-btn');
    expect(resetBtn).toHaveTextContent('Reset Layout');
  });
});

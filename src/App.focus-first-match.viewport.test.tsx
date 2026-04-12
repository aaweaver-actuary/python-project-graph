// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { graphCanvasPropsSpy } = vi.hoisted(() => ({
  graphCanvasPropsSpy: vi.fn(),
}));

vi.mock('./graph/graph-canvas', async () => {
  const React = await vi.importActual<typeof import('react')>('react');

  return {
    GraphCanvas: (props: object) => {
      graphCanvasPropsSpy(props);

      return React.createElement('section', {
        'data-testid': 'graph-canvas-mock',
      });
    },
  };
});

import App from './App';
import type { GraphBootstrapState } from './graph/bootstrap.contracts';
import { graphFixturePayload } from './graph/fixture-data-source.adapter';

type AppBootstrapRunner = () => Promise<GraphBootstrapState>;

const BOOTSTRAP_READY_VIEW_TEST_ID = 'bootstrap-ready-view';

const createReadyBootstrapRunner = () =>
  vi.fn<AppBootstrapRunner>().mockResolvedValue({
    state: 'ready',
    payload: graphFixturePayload,
  });

const getLastGraphCanvasProps = (): Record<string, unknown> => {
  expect(graphCanvasPropsSpy).toHaveBeenCalled();

  return graphCanvasPropsSpy.mock.lastCall?.[0] as Record<string, unknown>;
};

const getLastFocusRequest = (): Record<string, unknown> | undefined =>
  getLastGraphCanvasProps().focusRequest as Record<string, unknown> | undefined;

describe('App focus-first-match viewport request flow (WU-05)', () => {
  it('issues a viewport focus request for the first search match when focus button is clicked', async () => {
    const runBootstrap = createReadyBootstrapRunner();

    render(<App runBootstrap={runBootstrap} />);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const searchInput = within(readyView).getByTestId('graph-search-input');
    const focusFirstButton = within(readyView).getByTestId(
      'graph-search-focus-first',
    );

    fireEvent.change(searchInput, { target: { value: 'parse' } });

    const graphCanvasCallsBeforeFocus = graphCanvasPropsSpy.mock.calls.length;

    fireEvent.click(focusFirstButton);

    await waitFor(() => {
      expect(graphCanvasPropsSpy.mock.calls.length).toBeGreaterThan(
        graphCanvasCallsBeforeFocus,
      );
      const focusRequest = getLastFocusRequest();

      expect(focusRequest).toBeDefined();
      expect(focusRequest).toEqual(
        expect.objectContaining({
          nodeId: 'module.utils.parse_config',
        }),
      );
      expect(['number', 'string']).toContain(typeof focusRequest?.requestId);
    });
  });

  it('increments focus requestId when focus is requested repeatedly for the same first match', async () => {
    const runBootstrap = createReadyBootstrapRunner();

    render(<App runBootstrap={runBootstrap} />);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const searchInput = within(readyView).getByTestId('graph-search-input');
    const focusFirstButton = within(readyView).getByTestId(
      'graph-search-focus-first',
    );

    fireEvent.change(searchInput, { target: { value: 'parse' } });

    fireEvent.click(focusFirstButton);
    fireEvent.click(focusFirstButton);

    await waitFor(() => {
      const focusRequests = graphCanvasPropsSpy.mock.calls
        .map((call) => (call[0] as Record<string, unknown>).focusRequest)
        .filter(
          (request): request is Record<string, unknown> => request !== undefined,
        );

      expect(focusRequests.length).toBeGreaterThanOrEqual(2);

      const firstFocusRequestId = focusRequests.at(-2)?.requestId;
      const secondFocusRequestId = focusRequests.at(-1)?.requestId;

      expect(firstFocusRequestId).toBeDefined();
      expect(secondFocusRequestId).toBeDefined();
      expect(secondFocusRequestId).not.toBe(firstFocusRequestId);
    });
  });

  it('keeps focus button disabled and does not issue focus requests when there are no matches', async () => {
    const runBootstrap = createReadyBootstrapRunner();

    render(<App runBootstrap={runBootstrap} />);

    const readyView = await screen.findByTestId(BOOTSTRAP_READY_VIEW_TEST_ID);
    const searchInput = within(readyView).getByTestId('graph-search-input');
    const focusFirstButton = within(readyView).getByTestId(
      'graph-search-focus-first',
    );

    fireEvent.change(searchInput, { target: { value: 'no-such-node-query' } });

    expect(focusFirstButton).toBeDisabled();

    const graphCanvasCallsBeforeClick = graphCanvasPropsSpy.mock.calls.length;

    fireEvent.click(focusFirstButton);

    expect(graphCanvasPropsSpy.mock.calls.length).toBe(graphCanvasCallsBeforeClick);
    expect(getLastFocusRequest()).toBeUndefined();
  });
});

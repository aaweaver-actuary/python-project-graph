import { useEffect, useMemo, useState } from 'react';

import type { GraphBootstrapState } from './graph/bootstrap.contracts';
import type { NodeKind } from './graph/contracts';
import {
  DEFAULT_GRAPH_FILTER_STATE,
  applyGraphFilters,
  type GraphFilterState,
} from './graph/filters';
import { GraphCanvas } from './graph/graph-canvas';
import { searchGraphNodes } from './graph/search';
import { deriveSelectedNodeDetails, DetailPanel } from './graph/node-details';

export interface AppProps {
  runBootstrap: () => Promise<GraphBootstrapState>;
}

type AppBootstrapRunner = AppProps['runBootstrap'];

const initialBootstrapState: GraphBootstrapState = { state: 'loading' };

const bootstrapPromiseByRunner = new WeakMap<
  AppBootstrapRunner,
  Promise<GraphBootstrapState>
>();

const FALLBACK_BOOTSTRAP_ERROR_MESSAGE = 'Bootstrap failed';

const NODE_KIND_ORDER: NodeKind[] = [
  'module',
  'class',
  'method',
  'function',
  'import',
  'constant',
  'variable',
  'package',
];

function assertNeverBootstrapState(value: never): never {
  throw new Error(`Unhandled bootstrap state: ${JSON.stringify(value)}`);
}

function toNonEmptyTrimmedMessage(value: string): string | null {
  const trimmedMessage = value.trim();

  if (trimmedMessage.length === 0) {
    return null;
  }

  return trimmedMessage;
}

function getBootstrapErrorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    return toNonEmptyTrimmedMessage(error.message);
  }

  if (typeof error === 'string') {
    return toNonEmptyTrimmedMessage(error);
  }

  return null;
}

function normalizeBootstrapErrors(error: unknown): string[] {
  const normalizedMessage = getBootstrapErrorMessage(error);

  return [normalizedMessage ?? FALLBACK_BOOTSTRAP_ERROR_MESSAGE];
}

function getOrCreateBootstrapPromise(
  runBootstrap: AppBootstrapRunner,
): Promise<GraphBootstrapState> {
  const existingPromise = bootstrapPromiseByRunner.get(runBootstrap);

  if (existingPromise) {
    return existingPromise;
  }

  const bootstrapPromise = runBootstrap();
  bootstrapPromiseByRunner.set(runBootstrap, bootstrapPromise);

  return bootstrapPromise;
}

function createInitialFilterState(): GraphFilterState {
  return {
    ...DEFAULT_GRAPH_FILTER_STATE,
    kindSelection: { ...DEFAULT_GRAPH_FILTER_STATE.kindSelection },
  };
}

function App({ runBootstrap }: AppProps) {
  const [bootstrapState, setBootstrapState] = useState<GraphBootstrapState>(
    initialBootstrapState,
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<GraphFilterState>(
    createInitialFilterState,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [focusRequest, setFocusRequest] = useState<{
    requestId: number;
    nodeId: string;
  }>();

  useEffect(() => {
    let isMounted = true;

    const setBootstrapStateIfMounted = (
      nextBootstrapState: GraphBootstrapState,
    ): void => {
      if (isMounted) {
        setBootstrapState(nextBootstrapState);
      }
    };

    const setInvalidStateFromError = (error: unknown): void => {
      setBootstrapStateIfMounted({
        state: 'invalid-payload',
        errors: normalizeBootstrapErrors(error),
      });
    };

    const bootstrapPromise = getOrCreateBootstrapPromise(runBootstrap);

    void bootstrapPromise
      .then(setBootstrapStateIfMounted)
      .catch(setInvalidStateFromError);

    return () => {
      isMounted = false;
    };
  }, [runBootstrap]);

  const readyPayload =
    bootstrapState.state === 'ready' ? bootstrapState.payload : null;

  const filteredPayload = useMemo(() => {
    if (readyPayload === null) {
      return null;
    }

    return applyGraphFilters(readyPayload, filterState);
  }, [readyPayload, filterState]);

  const effectiveSelectedNodeId = useMemo(() => {
    if (selectedNodeId === null || filteredPayload === null) {
      return selectedNodeId;
    }

    const selectionStillVisible = filteredPayload.nodes.some(
      (node) => node.id === selectedNodeId,
    );

    return selectionStillVisible ? selectedNodeId : null;
  }, [selectedNodeId, filteredPayload]);

  const searchResults = useMemo(() => {
    if (filteredPayload === null) {
      return [];
    }

    return searchGraphNodes(filteredPayload, searchQuery);
  }, [filteredPayload, searchQuery]);

  switch (bootstrapState.state) {
    case 'loading':
      return (
        <section data-testid="bootstrap-loading-view">Loading graph...</section>
      );
    case 'ready': {
      const payload = filteredPayload ?? bootstrapState.payload;
      const selectedNodeDetails = deriveSelectedNodeDetails(
        payload,
        effectiveSelectedNodeId,
      );

      return (
        <section data-testid="bootstrap-ready-view">
          <p>Nodes: {payload.nodes.length}</p>
          <p>Edges: {payload.edges.length}</p>
          <section
            data-testid="ready-layout"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(14rem, 18rem) minmax(0, 1fr) minmax(18rem, 28rem)',
              gap: '1rem',
            }}
          >
            <aside data-testid="filter-sidebar">
              <label htmlFor="module-filter-input">Module</label>
              <input
                id="module-filter-input"
                data-testid="module-filter-input"
                value={filterState.moduleQuery}
                onChange={(event) =>
                  setFilterState((currentState) => ({
                    ...currentState,
                    moduleQuery: event.target.value,
                  }))
                }
              />

              <label htmlFor="file-path-filter-input">File path</label>
              <input
                id="file-path-filter-input"
                data-testid="file-path-filter-input"
                value={filterState.filePathQuery}
                onChange={(event) =>
                  setFilterState((currentState) => ({
                    ...currentState,
                    filePathQuery: event.target.value,
                  }))
                }
              />

              <label htmlFor="graph-search-input">Search</label>
              <input
                id="graph-search-input"
                data-testid="graph-search-input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
                <button
                  type="button"
                  data-testid="graph-search-focus-first"
                  disabled={searchResults.length === 0}
                  onClick={() => {
                    const firstSearchMatch = searchResults[0];

                    if (!firstSearchMatch) {
                      return;
                    }

                    setSelectedNodeId(firstSearchMatch.id);
                    setFocusRequest((currentRequest) => ({
                      requestId:
                        (typeof currentRequest?.requestId === 'number'
                          ? currentRequest.requestId
                          : 0) + 1,
                      nodeId: firstSearchMatch.id,
                    }));
                  }}
                >
                  Focus first match
                </button>
              <p data-testid="graph-search-results-count">
                Matches: {searchResults.length}
              </p>

              <label>
                <input
                  type="checkbox"
                  data-testid="hide-disconnected-filter"
                  checked={filterState.hideDisconnected}
                  onChange={(event) =>
                    setFilterState((currentState) => ({
                      ...currentState,
                      hideDisconnected: event.target.checked,
                    }))
                  }
                />
                Hide disconnected
              </label>

              <fieldset>
                <legend>Node kinds</legend>
                {NODE_KIND_ORDER.map((kind) => (
                  <label key={kind}>
                    <input
                      type="checkbox"
                      data-testid={`kind-filter-${kind}`}
                      checked={filterState.kindSelection[kind]}
                      onChange={(event) =>
                        setFilterState((currentState) => ({
                          ...currentState,
                          kindSelection: {
                            ...currentState.kindSelection,
                            [kind]: event.target.checked,
                          },
                        }))
                      }
                    />
                    {kind}
                  </label>
                ))}
              </fieldset>
            </aside>

            <GraphCanvas
              payload={payload}
              selectedNodeId={effectiveSelectedNodeId}
              onSelectNode={setSelectedNodeId}
              focusRequest={focusRequest}
            />
            <aside data-testid="detail-panel-rail">
              <DetailPanel details={selectedNodeDetails} />
            </aside>
          </section>
        </section>
      );
    }
    case 'invalid-payload':
      return (
        <section data-testid="bootstrap-invalid-payload-view">
          {bootstrapState.errors.map((errorMessage, index) => (
            <p key={`${errorMessage}-${index}`}>{errorMessage}</p>
          ))}
        </section>
      );
    default:
      return assertNeverBootstrapState(bootstrapState);
  }
}

export default App;

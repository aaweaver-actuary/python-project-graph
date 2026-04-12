import { useEffect, useState } from "react";
import type { GraphBootstrapState } from "./graph/bootstrap.contracts";
import { GraphCanvas } from "./graph/graph-canvas";
import { deriveSelectedNodeDetails, DetailPanel } from "./graph/node-details";

export interface AppProps {
  runBootstrap: () => Promise<GraphBootstrapState>;
}

type AppBootstrapRunner = AppProps["runBootstrap"];

const initialBootstrapState: GraphBootstrapState = { state: "loading" };

const bootstrapPromiseByRunner = new WeakMap<
  AppBootstrapRunner,
  Promise<GraphBootstrapState>
>();

const FALLBACK_BOOTSTRAP_ERROR_MESSAGE = "Bootstrap failed";

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

function normalizeBootstrapErrors(error: unknown): string[] {
  if (error instanceof Error) {
    const normalizedMessage = toNonEmptyTrimmedMessage(error.message);

    if (normalizedMessage !== null) {
      return [normalizedMessage];
    }
  }

  if (typeof error === "string") {
    const normalizedMessage = toNonEmptyTrimmedMessage(error);

    if (normalizedMessage !== null) {
      return [normalizedMessage];
    }
  }

  return [FALLBACK_BOOTSTRAP_ERROR_MESSAGE];
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

function App({ runBootstrap }: AppProps) {
  const [bootstrapState, setBootstrapState] = useState<GraphBootstrapState>(
    initialBootstrapState,
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
        state: "invalid-payload",
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

  switch (bootstrapState.state) {
    case "loading":
      return (
        <section data-testid="bootstrap-loading-view">Loading graph...</section>
      );
    case "ready": {
      const { payload } = bootstrapState;
      const selectedNodeDetails = deriveSelectedNodeDetails(
        payload,
        selectedNodeId,
      );

      return (
        <section data-testid="bootstrap-ready-view">
          <p>Nodes: {payload.nodes.length}</p>
          <p>Edges: {payload.edges.length}</p>
          <section
            data-testid="ready-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(18rem, 28rem)",
            }}
          >
            <GraphCanvas
              payload={payload}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
            <aside data-testid="detail-panel-rail">
              <DetailPanel details={selectedNodeDetails} />
            </aside>
          </section>
        </section>
      );
    }
    case "invalid-payload":
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

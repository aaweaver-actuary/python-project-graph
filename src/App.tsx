import { useEffect, useState } from "react";
import type { GraphBootstrapState } from "./graph/bootstrap.contracts";
import { GraphCanvas } from "./graph/graph-canvas";

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

    void getOrCreateBootstrapPromise(runBootstrap)
      .then(setBootstrapStateIfMounted)
      .catch(setInvalidStateFromError);

    return () => {
      isMounted = false;
    };
  }, [runBootstrap]);

  if (bootstrapState.state === "loading") {
    return (
      <section data-testid="bootstrap-loading-view">Loading graph...</section>
    );
  }

  if (bootstrapState.state === "ready") {
    const { payload } = bootstrapState;

    return (
      <section data-testid="bootstrap-ready-view">
        <p>Nodes: {payload.nodes.length}</p>
        <p>Edges: {payload.edges.length}</p>
        <GraphCanvas
          payload={payload}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </section>
    );
  }

  return (
    <section data-testid="bootstrap-invalid-payload-view">
      {bootstrapState.errors.map((error, index) => (
        <p key={`${error}-${index}`}>{error}</p>
      ))}
    </section>
  );
}

export default App;

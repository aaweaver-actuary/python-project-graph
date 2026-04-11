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

function normalizeBootstrapErrors(error: unknown): string[] {
  if (error instanceof Error) {
    const trimmedMessage = error.message.trim();

    if (trimmedMessage.length > 0) {
      return [trimmedMessage];
    }
  }

  if (typeof error === "string") {
    const trimmedMessage = error.trim();

    if (trimmedMessage.length > 0) {
      return [trimmedMessage];
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
    return (
      <section data-testid="bootstrap-ready-view">
        <p>Nodes: {bootstrapState.payload.nodes.length}</p>
        <p>Edges: {bootstrapState.payload.edges.length}</p>
        <GraphCanvas
          payload={bootstrapState.payload}
          selectedNodeId={null}
          onSelectNode={() => undefined}
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

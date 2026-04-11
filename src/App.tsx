import { useEffect, useState } from "react";
import type { GraphBootstrapState } from "./graph/bootstrap.contracts";

export interface AppProps {
  runBootstrap: () => Promise<GraphBootstrapState>;
}

const initialBootstrapState: GraphBootstrapState = { state: "loading" };

const bootstrapPromiseByRunner = new WeakMap<
  AppProps["runBootstrap"],
  Promise<GraphBootstrapState>
>();

const FALLBACK_BOOTSTRAP_ERROR_MESSAGE = "Bootstrap failed";

function normalizeBootstrapErrors(error: unknown): string[] {
  if (error instanceof Error && error.message.trim().length > 0) {
    return [error.message.trim()];
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return [error.trim()];
  }

  return [FALLBACK_BOOTSTRAP_ERROR_MESSAGE];
}

function getOrCreateBootstrapPromise(
  runBootstrap: AppProps["runBootstrap"],
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
  const [bootstrapState, setBootstrapState] =
    useState<GraphBootstrapState>(initialBootstrapState);

  useEffect(() => {
    let isMounted = true;

    void getOrCreateBootstrapPromise(runBootstrap)
      .then((nextBootstrapState) => {
        if (isMounted) {
          setBootstrapState(nextBootstrapState);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setBootstrapState({
            state: "invalid-payload",
            errors: normalizeBootstrapErrors(error),
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [runBootstrap]);

  if (bootstrapState.state === "loading") {
    return <section data-testid="bootstrap-loading-view">Loading graph...</section>;
  }

  if (bootstrapState.state === "ready") {
    return (
      <section data-testid="bootstrap-ready-view">
        <p>Nodes: {bootstrapState.payload.nodes.length}</p>
        <p>Edges: {bootstrapState.payload.edges.length}</p>
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

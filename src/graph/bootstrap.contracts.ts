import type { GraphPayload, GraphValidator } from "./contracts";

export interface GraphDataSource {
  loadGraph(): Promise<GraphPayload>;
}

export type GraphBootstrapState =
  | { state: "loading" }
  | { state: "ready"; payload: GraphPayload }
  | { state: "invalid-payload"; errors: string[] };

export interface GraphBootstrapDependencies {
  dataSource: GraphDataSource;
  validator: GraphValidator;
}

export const BOOTSTRAP_STATE_TAGS = [
  "loading",
  "ready",
  "invalid-payload",
] as const satisfies ReadonlyArray<GraphBootstrapState["state"]>;

export function isReadyBootstrapState(
  state: GraphBootstrapState,
): state is Extract<GraphBootstrapState, { state: "ready" }> {
  return state.state === "ready";
}

export function isInvalidPayloadBootstrapState(
  state: GraphBootstrapState,
): state is Extract<GraphBootstrapState, { state: "invalid-payload" }> {
  return state.state === "invalid-payload";
}

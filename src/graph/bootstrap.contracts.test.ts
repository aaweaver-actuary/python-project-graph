import { describe, expect, expectTypeOf, it } from "vitest";

import type { GraphPayload, GraphValidator } from "./contracts";
import {
  isInvalidPayloadBootstrapState,
  isReadyBootstrapState,
  type GraphBootstrapDependencies,
  type GraphBootstrapState,
  type GraphDataSource,
} from "./bootstrap.contracts";

type BootstrapContractsModule = typeof import("./bootstrap.contracts");

type LoadingState = Extract<GraphBootstrapState, { state: "loading" }>;
type ReadyState = Extract<GraphBootstrapState, { state: "ready" }>;
type InvalidPayloadState = Extract<
  GraphBootstrapState,
  { state: "invalid-payload" }
>;

const loadBootstrapContracts = async (): Promise<BootstrapContractsModule> =>
  (await import("./bootstrap.contracts")) as BootstrapContractsModule;

const emptyPayload: GraphPayload = {
  nodes: [],
  edges: [],
};

const runtimeLoadingState: GraphBootstrapState = {
  state: "loading",
};

const runtimeReadyState: GraphBootstrapState = {
  state: "ready",
  payload: emptyPayload,
};

const runtimeInvalidPayloadState: GraphBootstrapState = {
  state: "invalid-payload",
  errors: ["invalid payload"],
};

const asBootstrapState = (state: GraphBootstrapState): GraphBootstrapState =>
  state;

describe("bootstrap contracts", () => {
  it("uses strict bootstrap type contracts", () => {
    expectTypeOf<GraphBootstrapState["state"]>().toEqualTypeOf<
      "loading" | "ready" | "invalid-payload"
    >();

    expectTypeOf<LoadingState>().toEqualTypeOf<{ state: "loading" }>();
    expectTypeOf<ReadyState>().toEqualTypeOf<{
      state: "ready";
      payload: GraphPayload;
    }>();
    expectTypeOf<InvalidPayloadState>().toEqualTypeOf<{
      state: "invalid-payload";
      errors: string[];
    }>();
  });

  it("defines GraphDataSource.loadGraph as Promise<GraphPayload>", () => {
    expectTypeOf<GraphDataSource["loadGraph"]>().parameters.toEqualTypeOf<[]>();
    expectTypeOf<GraphDataSource["loadGraph"]>().returns.toEqualTypeOf<
      Promise<GraphPayload>
    >();
  });

  it("requires dataSource and validator bootstrap dependencies", () => {
    expectTypeOf<GraphBootstrapDependencies>().toEqualTypeOf<{
      dataSource: GraphDataSource;
      validator: GraphValidator;
    }>();
  });

  it("narrows to ready bootstrap state in ready-guard true branch", () => {
    const state = asBootstrapState({
      state: "ready",
      payload: emptyPayload,
    });

    if (isReadyBootstrapState(state)) {
      expectTypeOf(state).toEqualTypeOf<ReadyState>();
      expectTypeOf(state.payload).toEqualTypeOf<GraphPayload>();
      return;
    }

    expect.unreachable("expected ready state to satisfy ready guard");
  });

  it("narrows to invalid-payload bootstrap state in invalid-payload guard true branch", () => {
    const state = asBootstrapState({
      state: "invalid-payload",
      errors: ["invalid payload"],
    });

    if (isInvalidPayloadBootstrapState(state)) {
      expectTypeOf(state).toEqualTypeOf<InvalidPayloadState>();
      expectTypeOf(state.errors).toEqualTypeOf<string[]>();
      return;
    }

    expect.unreachable(
      "expected invalid-payload state to satisfy invalid-payload guard",
    );
  });

  it("exports a canonical bootstrap state tag list at runtime", async () => {
    const bootstrapContracts = await loadBootstrapContracts();

    expect(bootstrapContracts.BOOTSTRAP_STATE_TAGS).toEqual([
      "loading",
      "ready",
      "invalid-payload",
    ]);
  });

  it("exports a ready-state guard predicate at runtime", async () => {
    const bootstrapContracts = await loadBootstrapContracts();

    expect(bootstrapContracts.isReadyBootstrapState(runtimeLoadingState)).toBe(
      false,
    );
    expect(bootstrapContracts.isReadyBootstrapState(runtimeReadyState)).toBe(
      true,
    );
    expect(
      bootstrapContracts.isReadyBootstrapState(runtimeInvalidPayloadState),
    ).toBe(false);
  });

  it("exports an invalid-payload guard predicate at runtime", async () => {
    const bootstrapContracts = await loadBootstrapContracts();

    expect(
      bootstrapContracts.isInvalidPayloadBootstrapState(runtimeLoadingState),
    ).toBe(false);
    expect(
      bootstrapContracts.isInvalidPayloadBootstrapState(
        runtimeInvalidPayloadState,
      ),
    ).toBe(true);
    expect(
      bootstrapContracts.isInvalidPayloadBootstrapState(runtimeReadyState),
    ).toBe(false);
  });
});

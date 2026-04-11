import { describe, expect, it, vi } from "vitest";

import type { GraphPayload, GraphValidationResult } from "./contracts";
import type {
  GraphBootstrapDependencies,
  GraphBootstrapState,
} from "./bootstrap.contracts";

type GraphBootstrapOrchestrator = (
  dependencies: GraphBootstrapDependencies,
) => Promise<GraphBootstrapState>;

const BOOTSTRAP_ORCHESTRATOR_MODULE_PATH: string = "./bootstrap.orchestrator";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return String(error);
};

const loadBootstrapOrchestrator =
  async (): Promise<GraphBootstrapOrchestrator> => {
    let moduleRecord: Record<string, unknown>;

    try {
      moduleRecord = (await import(
        BOOTSTRAP_ORCHESTRATOR_MODULE_PATH
      )) as Record<string, unknown>;
    } catch (error) {
      throw new Error(
        `Missing planned module "${BOOTSTRAP_ORCHESTRATOR_MODULE_PATH}". ${toErrorMessage(error)}`,
      );
    }

    const orchestrateGraphBootstrap = moduleRecord.orchestrateGraphBootstrap;

    if (typeof orchestrateGraphBootstrap !== "function") {
      throw new Error(
        `Expected "${BOOTSTRAP_ORCHESTRATOR_MODULE_PATH}" to export orchestrateGraphBootstrap(dependencies).`,
      );
    }

    return orchestrateGraphBootstrap as GraphBootstrapOrchestrator;
  };

const createPayload = (suffix: string): GraphPayload => ({
  nodes: [
    {
      id: `module.${suffix}`,
      kind: "module",
      name: `module-${suffix}`,
      module: `module.${suffix}`,
      file_path: `src/module/${suffix}.py`,
    },
  ],
  edges: [],
});

const createDependencies = (
  loadGraph: () => Promise<GraphPayload>,
  validate: (payload: GraphPayload) => GraphValidationResult,
): GraphBootstrapDependencies => ({
  dataSource: { loadGraph },
  validator: { validate },
});

describe("bootstrap orchestrator", () => {
  it("returns ready with payload when loadGraph resolves and validator reports ok=true", async () => {
    const orchestrateGraphBootstrap = await loadBootstrapOrchestrator();
    const payload = createPayload("ready");
    const loadGraph = vi
      .fn<() => Promise<GraphPayload>>()
      .mockResolvedValue(payload);
    const validate = vi
      .fn<(candidate: GraphPayload) => GraphValidationResult>()
      .mockReturnValue({ ok: true, errors: [] });

    const dependencies = createDependencies(loadGraph, validate);

    const result = await orchestrateGraphBootstrap(dependencies);

    expect(loadGraph).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.calls[0]?.[0]).toBe(payload);
    expect(result).toEqual({
      state: "ready",
      payload,
    });
  });

  it("returns invalid-payload with validator errors and no payload field when validator reports ok=false", async () => {
    const orchestrateGraphBootstrap = await loadBootstrapOrchestrator();
    const payload = createPayload("invalid");
    const validationErrors = ["edge target module.missing does not exist"];
    const loadGraph = vi
      .fn<() => Promise<GraphPayload>>()
      .mockResolvedValue(payload);
    const validate = vi
      .fn<(candidate: GraphPayload) => GraphValidationResult>()
      .mockReturnValue({ ok: false, errors: validationErrors });

    const dependencies = createDependencies(loadGraph, validate);

    const result = await orchestrateGraphBootstrap(dependencies);

    expect(loadGraph).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.calls[0]?.[0]).toBe(payload);
    expect(result).toEqual({
      state: "invalid-payload",
      errors: validationErrors,
    });
    expect("payload" in result).toBe(false);
  });

  it("returns invalid-payload with normalized errors and does not call validator when loadGraph rejects", async () => {
    const orchestrateGraphBootstrap = await loadBootstrapOrchestrator();
    const loadGraph = vi
      .fn<() => Promise<GraphPayload>>()
      .mockRejectedValue(new Error("fixture load failed"));
    const validate = vi
      .fn<(candidate: GraphPayload) => GraphValidationResult>()
      .mockReturnValue({ ok: true, errors: [] });

    const dependencies = createDependencies(loadGraph, validate);

    const result = await orchestrateGraphBootstrap(dependencies);

    expect(loadGraph).toHaveBeenCalledTimes(1);
    expect(validate).not.toHaveBeenCalled();
    expect(result.state).toBe("invalid-payload");

    if (result.state !== "invalid-payload") {
      expect.unreachable(
        "expected invalid-payload state when loadGraph rejects",
      );
    }

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.every((message) => message.trim().length > 0)).toBe(
      true,
    );
    expect(result.errors.join(" ")).toContain("fixture load failed");
    expect("payload" in result).toBe(false);
  });

  it("returns invalid-payload with normalized errors and does not reject when validator throws synchronously", async () => {
    const orchestrateGraphBootstrap = await loadBootstrapOrchestrator();
    const payload = createPayload("validator-throws");
    const loadGraph = vi
      .fn<() => Promise<GraphPayload>>()
      .mockResolvedValue(payload);
    const validate = vi
      .fn<(candidate: GraphPayload) => GraphValidationResult>()
      .mockImplementation(() => {
        throw new Error("validator exploded");
      });

    const dependencies = createDependencies(loadGraph, validate);
    const resultPromise = orchestrateGraphBootstrap(dependencies);

    await expect(resultPromise).resolves.toMatchObject({
      state: "invalid-payload",
    });

    const result = await resultPromise;

    expect(loadGraph).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.calls[0]?.[0]).toBe(payload);

    if (result.state !== "invalid-payload") {
      expect.unreachable(
        "expected invalid-payload state when validator throws",
      );
    }

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.every((message) => message.trim().length > 0)).toBe(
      true,
    );
    expect(result.errors.join(" ")).toContain("validator exploded");
    expect("payload" in result).toBe(false);
  });

  it("calls loadGraph exactly once per invocation across repeated runs", async () => {
    const orchestrateGraphBootstrap = await loadBootstrapOrchestrator();
    const firstPayload = createPayload("first");
    const secondPayload = createPayload("second");
    const loadGraph = vi
      .fn<() => Promise<GraphPayload>>()
      .mockResolvedValueOnce(firstPayload)
      .mockResolvedValueOnce(secondPayload);
    const validate = vi
      .fn<(candidate: GraphPayload) => GraphValidationResult>()
      .mockReturnValue({ ok: true, errors: [] });

    const dependencies = createDependencies(loadGraph, validate);

    const firstResult = await orchestrateGraphBootstrap(dependencies);
    const secondResult = await orchestrateGraphBootstrap(dependencies);

    expect(loadGraph).toHaveBeenCalledTimes(2);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(validate.mock.calls[0]?.[0]).toBe(firstPayload);
    expect(validate.mock.calls[1]?.[0]).toBe(secondPayload);
    expect(firstResult).toEqual({ state: "ready", payload: firstPayload });
    expect(secondResult).toEqual({ state: "ready", payload: secondPayload });
  });
});

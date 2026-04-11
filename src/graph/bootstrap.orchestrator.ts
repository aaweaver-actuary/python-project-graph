import type {
  GraphBootstrapDependencies,
  GraphBootstrapState,
} from "./bootstrap.contracts";

const normalizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  const fallbackMessage = String(error).trim();
  return fallbackMessage.length > 0
    ? fallbackMessage
    : "Unknown graph bootstrap error";
};

export async function orchestrateGraphBootstrap(
  dependencies: GraphBootstrapDependencies,
): Promise<GraphBootstrapState> {
  let payload;
  let validationResult;

  try {
    payload = await dependencies.dataSource.loadGraph();
  } catch (error) {
    return {
      state: "invalid-payload",
      errors: [normalizeErrorMessage(error)],
    };
  }

  try {
    validationResult = dependencies.validator.validate(payload);
  } catch (error) {
    return {
      state: "invalid-payload",
      errors: [normalizeErrorMessage(error)],
    };
  }

  if (validationResult.ok) {
    return {
      state: "ready",
      payload,
    };
  }

  return {
    state: "invalid-payload",
    errors: validationResult.errors,
  };
}

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

const createInvalidPayloadState = (error: unknown): GraphBootstrapState => ({
  state: "invalid-payload",
  errors: [normalizeErrorMessage(error)],
});

export async function orchestrateGraphBootstrap(
  dependencies: GraphBootstrapDependencies,
): Promise<GraphBootstrapState> {
  let payload;
  let validationResult;

  try {
    payload = await dependencies.dataSource.loadGraph();
  } catch (error) {
    return createInvalidPayloadState(error);
  }

  try {
    validationResult = dependencies.validator.validate(payload);
  } catch (error) {
    return createInvalidPayloadState(error);
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

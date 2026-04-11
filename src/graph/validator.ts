import type {
  GraphPayload,
  GraphValidationResult,
  GraphValidator,
} from "./contracts";

function validate(payload: GraphPayload): GraphValidationResult {
  const knownNodeIds = new Set(payload.nodes.map(({ id }) => id));
  const validationErrors: string[] = [];

  for (const { source, target } of payload.edges) {
    if (!knownNodeIds.has(source)) {
      validationErrors.push(`Missing source node reference: ${source}`);
    }

    if (!knownNodeIds.has(target)) {
      validationErrors.push(`Missing target node reference: ${target}`);
    }
  }

  return {
    ok: validationErrors.length === 0,
    errors: validationErrors,
  };
}

export const graphValidator: GraphValidator = {
  validate,
};

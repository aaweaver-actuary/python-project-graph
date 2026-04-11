import type {
  GraphPayload,
  GraphValidationResult,
  GraphValidator,
} from "./contracts";

function validate(payload: GraphPayload): GraphValidationResult {
  const knownNodeIds = new Set<string>();
  const duplicateNodeIds = new Set<string>();
  const validationErrors: string[] = [];

  for (const { id } of payload.nodes) {
    if (knownNodeIds.has(id)) {
      if (!duplicateNodeIds.has(id)) {
        duplicateNodeIds.add(id);
        validationErrors.push(`Duplicate node id: ${id}`);
      }

      continue;
    }

    knownNodeIds.add(id);
  }

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

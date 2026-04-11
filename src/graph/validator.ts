import type {
  GraphPayload,
  GraphValidationResult,
  GraphValidator,
} from "./contracts";

function validate(payload: GraphPayload): GraphValidationResult {
  const seenNodeIds = new Set<string>();
  const reportedDuplicateNodeIds = new Set<string>();
  const errors: string[] = [];

  for (const { id } of payload.nodes) {
    if (!seenNodeIds.has(id)) {
      seenNodeIds.add(id);
      continue;
    }

    if (reportedDuplicateNodeIds.has(id)) {
      continue;
    }

    reportedDuplicateNodeIds.add(id);
    errors.push(`Duplicate node id: ${id}`);
  }

  for (const { source, target } of payload.edges) {
    if (!seenNodeIds.has(source)) {
      errors.push(`Missing source node reference: ${source}`);
    }

    if (!seenNodeIds.has(target)) {
      errors.push(`Missing target node reference: ${target}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export const graphValidator: GraphValidator = {
  validate,
};

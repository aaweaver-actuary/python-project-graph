import type {
  GraphPayload,
  GraphValidationResult,
  GraphValidator,
} from "./contracts";

function validate(graphPayload: GraphPayload): GraphValidationResult {
  const nodeIds = new Set(graphPayload.nodes.map((node) => node.id));
  const errors: string[] = [];

  for (const edge of graphPayload.edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Missing source node reference: ${edge.source}`);
    }

    if (!nodeIds.has(edge.target)) {
      errors.push(`Missing target node reference: ${edge.target}`);
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

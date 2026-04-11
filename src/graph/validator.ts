import type { GraphPayload, GraphValidationResult, GraphValidator } from './contracts'

function validate(_graphPayload: GraphPayload): GraphValidationResult {
  return {
    ok: true,
    errors: [],
  }
}

export const graphValidator: GraphValidator = {
  validate,
}

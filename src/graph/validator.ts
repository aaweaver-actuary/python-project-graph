import type { GraphPayload, GraphValidationResult, GraphValidator } from './contracts'

function validate(_payload: GraphPayload): GraphValidationResult {
  return {
    ok: true,
    errors: [],
  }
}

export const graphValidator: GraphValidator = {
  validate,
}
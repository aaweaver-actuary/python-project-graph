import { describe, expect, it } from 'vitest'

import type { GraphPayload } from './contracts'
import { graphValidator } from './validator.ts'

const validFixture: GraphPayload = {
  nodes: [
    {
      id: 'module.utils',
      kind: 'module',
      name: 'utils',
      module: 'module.utils',
      file_path: 'src/module/utils.py',
    },
    {
      id: 'module.utils.parse_config',
      kind: 'function',
      name: 'parse_config',
      module: 'module.utils',
      file_path: 'src/module/utils.py',
      line_start: 42,
      line_end: 68,
    },
    {
      id: 'module.pipeline',
      kind: 'module',
      name: 'pipeline',
      module: 'module.pipeline',
      file_path: 'src/module/pipeline.py',
    },
    {
      id: 'module.pipeline.run_model',
      kind: 'function',
      name: 'run_model',
      module: 'module.pipeline',
      file_path: 'src/module/pipeline.py',
      line_start: 10,
      line_end: 30,
    },
  ],
  edges: [
    {
      source: 'module.utils',
      target: 'module.utils.parse_config',
      kind: 'contains',
    },
    {
      source: 'module.pipeline',
      target: 'module.pipeline.run_model',
      kind: 'contains',
    },
    {
      source: 'module.utils.parse_config',
      target: 'module.pipeline.run_model',
      kind: 'dependency',
    },
    {
      source: 'module.utils',
      target: 'module.pipeline',
      kind: 'imports',
    },
  ],
}

describe('GraphValidator happy path', () => {
  it('returns ok=true and no errors for a valid fixture payload', () => {
    const result = graphValidator.validate(validFixture)

    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
import { describe, expect, it } from 'vitest';

import type { GraphPayload } from './contracts';
import {
  DEFAULT_GRAPH_FILTER_STATE,
  applyGraphFilters,
} from './filters';

const payload: GraphPayload = {
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
    },
    {
      id: 'module.pipeline',
      kind: 'module',
      name: 'pipeline',
      module: 'module.pipeline',
      file_path: 'src/module/pipeline.py',
    },
    {
      id: 'module.constants.PI',
      kind: 'constant',
      name: 'PI',
      module: 'module.constants',
      file_path: 'src/module/constants.py',
    },
  ],
  edges: [
    {
      source: 'module.utils',
      target: 'module.utils.parse_config',
      kind: 'contains',
    },
    {
      source: 'module.utils.parse_config',
      target: 'module.pipeline',
      kind: 'dependency',
    },
  ],
};

describe('applyGraphFilters (WU-04)', () => {
  it('filters by selected node kinds', () => {
    const result = applyGraphFilters(payload, {
      ...DEFAULT_GRAPH_FILTER_STATE,
      kindSelection: {
        module: true,
        class: false,
        method: false,
        function: false,
        import: false,
        constant: false,
        variable: false,
        package: false,
      },
    });

    expect(result.nodes.map((node) => node.kind)).toEqual(['module', 'module']);
    expect(result.edges).toHaveLength(0);
  });

  it('filters by module and file path substrings', () => {
    const result = applyGraphFilters(payload, {
      ...DEFAULT_GRAPH_FILTER_STATE,
      moduleQuery: 'pipeline',
      filePathQuery: 'pipeline.py',
    });

    expect(result.nodes.map((node) => node.id)).toEqual(['module.pipeline']);
    expect(result.edges).toHaveLength(0);
  });

  it('removes disconnected nodes when hideDisconnected is enabled', () => {
    const result = applyGraphFilters(payload, {
      ...DEFAULT_GRAPH_FILTER_STATE,
      hideDisconnected: true,
    });

    expect(result.nodes.map((node) => node.id)).not.toContain('module.constants.PI');
    expect(result.edges).toHaveLength(2);
  });

  it('keeps disconnected nodes when hideDisconnected is disabled', () => {
    const result = applyGraphFilters(payload, DEFAULT_GRAPH_FILTER_STATE);

    expect(result.nodes.map((node) => node.id)).toContain('module.constants.PI');
  });
});

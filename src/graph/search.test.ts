import { describe, expect, it } from 'vitest';

import type { GraphPayload } from './contracts';
import { searchGraphNodes } from './search';

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
      id: 'module.pipeline.run_model',
      kind: 'function',
      name: 'run_model',
      module: 'module.pipeline',
      file_path: 'src/module/pipeline.py',
    },
  ],
  edges: [],
};

describe('searchGraphNodes (WU-05)', () => {
  it('matches by exact and partial symbol name', () => {
    const exact = searchGraphNodes(payload, 'parse_config');
    const partial = searchGraphNodes(payload, 'run');

    expect(exact.map((node) => node.id)).toEqual(['module.utils.parse_config']);
    expect(partial.map((node) => node.id)).toEqual(['module.pipeline.run_model']);
  });

  it('matches by module path and file path', () => {
    const byModule = searchGraphNodes(payload, 'module.utils');
    const byFile = searchGraphNodes(payload, 'pipeline.py');

    expect(byModule.map((node) => node.id)).toEqual([
      'module.utils',
      'module.utils.parse_config',
    ]);
    expect(byFile.map((node) => node.id)).toEqual(['module.pipeline.run_model']);
  });

  it('returns empty for blank or no-match queries', () => {
    expect(searchGraphNodes(payload, '   ')).toEqual([]);
    expect(searchGraphNodes(payload, 'missing')).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';

import type { NodeKind } from './contracts';
import {
  NODE_KIND_VISUAL_SEMANTICS,
  getNodeKindVisualSemantics,
} from './styles';

const REQUIRED_KINDS: NodeKind[] = [
  'module',
  'class',
  'method',
  'function',
  'constant',
  'import',
  'variable',
  'package',
];

describe('node visual semantics (WU-03)', () => {
  it('defines visual semantics for every supported node kind', () => {
    for (const kind of REQUIRED_KINDS) {
      expect(getNodeKindVisualSemantics(kind)).toEqual(
        expect.objectContaining({
          borderStyle: expect.any(String),
          borderRadius: expect.any(String),
          minHeight: expect.any(Number),
        }),
      );
    }
  });

  it('provides non-color distinctions across kinds', () => {
    const signatures = REQUIRED_KINDS.map((kind) => {
      const semantics = getNodeKindVisualSemantics(kind);

      return `${semantics.borderStyle}:${semantics.borderRadius}:${semantics.minHeight}`;
    });

    expect(new Set(signatures).size).toBeGreaterThan(1);
  });

  it('keeps lookup stable with exported mapping', () => {
    for (const kind of REQUIRED_KINDS) {
      expect(getNodeKindVisualSemantics(kind)).toEqual(
        NODE_KIND_VISUAL_SEMANTICS[kind],
      );
    }
  });
});

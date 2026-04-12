import type { NodeKind } from './contracts';

export interface NodeKindVisualSemantics {
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius: string;
  minHeight: number;
}

export const NODE_KIND_VISUAL_SEMANTICS: Record<
  NodeKind,
  NodeKindVisualSemantics
> = {
  module: {
    borderStyle: 'double',
    borderRadius: '0.4rem',
    minHeight: 58,
  },
  class: {
    borderStyle: 'solid',
    borderRadius: '0.8rem',
    minHeight: 56,
  },
  method: {
    borderStyle: 'dashed',
    borderRadius: '0.8rem',
    minHeight: 48,
  },
  function: {
    borderStyle: 'solid',
    borderRadius: '0.4rem',
    minHeight: 52,
  },
  import: {
    borderStyle: 'dotted',
    borderRadius: '0.4rem',
    minHeight: 44,
  },
  constant: {
    borderStyle: 'solid',
    borderRadius: '999px',
    minHeight: 44,
  },
  variable: {
    borderStyle: 'dashed',
    borderRadius: '999px',
    minHeight: 42,
  },
  package: {
    borderStyle: 'double',
    borderRadius: '999px',
    minHeight: 50,
  },
};

export function getNodeKindVisualSemantics(
  kind: NodeKind,
): NodeKindVisualSemantics {
  return NODE_KIND_VISUAL_SEMANTICS[kind];
}

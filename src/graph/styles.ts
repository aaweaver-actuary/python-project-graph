import type { NodeKind } from './contracts';

export interface NodeKindVisualSemantics {
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius: string;
  minHeight: number;
  iconToken: string;
  labelPrefix: string;
}

export const NODE_KIND_VISUAL_SEMANTICS: Record<
  NodeKind,
  NodeKindVisualSemantics
> = {
  module: {
    borderStyle: 'double',
    borderRadius: '0.4rem',
    minHeight: 58,
    iconToken: 'module',
    labelPrefix: '[MODULE] ',
  },
  class: {
    borderStyle: 'solid',
    borderRadius: '0.8rem',
    minHeight: 56,
    iconToken: 'class',
    labelPrefix: '[CLASS] ',
  },
  method: {
    borderStyle: 'dashed',
    borderRadius: '0.8rem',
    minHeight: 48,
    iconToken: 'method',
    labelPrefix: '[METHOD] ',
  },
  function: {
    borderStyle: 'solid',
    borderRadius: '0.4rem',
    minHeight: 52,
    iconToken: 'function',
    labelPrefix: '[FUNCTION] ',
  },
  import: {
    borderStyle: 'dotted',
    borderRadius: '0.4rem',
    minHeight: 44,
    iconToken: 'import',
    labelPrefix: '[IMPORT] ',
  },
  constant: {
    borderStyle: 'solid',
    borderRadius: '999px',
    minHeight: 44,
    iconToken: 'constant',
    labelPrefix: '[CONSTANT] ',
  },
  variable: {
    borderStyle: 'dashed',
    borderRadius: '999px',
    minHeight: 42,
    iconToken: 'variable',
    labelPrefix: '[VARIABLE] ',
  },
  package: {
    borderStyle: 'double',
    borderRadius: '999px',
    minHeight: 50,
    iconToken: 'package',
    labelPrefix: '[PACKAGE] ',
  },
};

export function getNodeKindVisualSemantics(
  kind: NodeKind,
): NodeKindVisualSemantics {
  return NODE_KIND_VISUAL_SEMANTICS[kind];
}

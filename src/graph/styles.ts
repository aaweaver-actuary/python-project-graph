import type { NodeKind } from './contracts';

export interface NodeKindVisualSemantics {
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius: string;
  minHeight: number;
  iconToken: string;
  labelPrefix: string;
}

export interface PencilTreatmentContract {
  borderWidthPx: number;
  borderTexture: string;
  borderShadow: string;
  lineStrokeWidth: number;
  lineStrokeDasharray: string;
  lineCap: 'round';
  arrowColor: string;
}

export interface WorkspaceSurfaceContract {
  backgroundColor: string;
  backgroundImage: string;
  backgroundSize: string;
}

export interface NodeKindColorToken {
  background: string;
  foreground: string;
  border: string;
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

export const PENCIL_TREATMENT: PencilTreatmentContract = {
  borderWidthPx: 1.5,
  borderTexture:
    'repeating-linear-gradient(90deg, rgba(22, 22, 22, 0.88) 0 8px, rgba(22, 22, 22, 0.6) 8px 10px)',
  borderShadow: '0.8px 0.8px 0 rgba(22, 22, 22, 0.18)',
  lineStrokeWidth: 1.8,
  lineStrokeDasharray: '6 4 1.5 3.5',
  lineCap: 'round',
  arrowColor: '#2f2a1f',
};

export const WORKSPACE_DOTTED_SURFACE: WorkspaceSurfaceContract = {
  backgroundColor: '#fcf9ef',
  backgroundImage:
    'radial-gradient(circle at 1px 1px, rgba(79, 74, 59, 0.2) 1.1px, transparent 1.2px)',
  backgroundSize: '14px 14px',
};

export const NODE_KIND_POST_IT_TOKENS: Record<NodeKind, NodeKindColorToken> = {
  module: {
    background: '#ffe36e',
    foreground: '#2e2200',
    border: '#7a5b00',
  },
  class: {
    background: '#ffad84',
    foreground: '#3f1400',
    border: '#8f2d00',
  },
  method: {
    background: '#aeea8a',
    foreground: '#123000',
    border: '#2f6500',
  },
  function: {
    background: '#9bd3ff',
    foreground: '#03213d',
    border: '#1f5f97',
  },
  import: {
    background: '#d7c5ff',
    foreground: '#23124d',
    border: '#5a37a8',
  },
  constant: {
    background: '#ffb7cf',
    foreground: '#4a0d24',
    border: '#9b2f5b',
  },
  variable: {
    background: '#c7f3f1',
    foreground: '#003331',
    border: '#1f7370',
  },
  package: {
    background: '#ffd0a8',
    foreground: '#4a2200',
    border: '#8e4f1a',
  },
};

export function getNodeKindVisualSemantics(
  kind: NodeKind,
): NodeKindVisualSemantics {
  return NODE_KIND_VISUAL_SEMANTICS[kind];
}

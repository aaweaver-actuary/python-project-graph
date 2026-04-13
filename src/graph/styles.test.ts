import { describe, expect, it } from 'vitest';

import type { NodeKind } from './contracts';
import {
  NODE_KIND_VISUAL_SEMANTICS,
  NODE_KIND_POST_IT_TOKENS,
  PENCIL_TREATMENT,
  WORKSPACE_DOTTED_SURFACE,
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

const parseHexColor = (hex: string): [number, number, number] => {
  const normalized = hex.trim().toLowerCase();
  const match = normalized.match(/^#([0-9a-f]{6})$/);

  if (!match) {
    throw new Error(`Unsupported color format: ${hex}`);
  }

  const value = match[1];
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
};

const toRelativeLuminance = ([r, g, b]: [number, number, number]): number => {
  const channels = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const contrastRatio = (foreground: string, background: string): number => {
  const fgLuminance = toRelativeLuminance(parseHexColor(foreground));
  const bgLuminance = toRelativeLuminance(parseHexColor(background));
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

describe('node visual semantics contract extension (WU03-A)', () => {
  it('defines visual semantics for every supported node kind', () => {
    for (const kind of REQUIRED_KINDS) {
      expect(getNodeKindVisualSemantics(kind)).toEqual(
        expect.objectContaining({
          borderStyle: expect.any(String),
          borderRadius: expect.any(String),
          minHeight: expect.any(Number),
          iconToken: expect.any(String),
          labelPrefix: expect.any(String),
        }),
      );
    }
  });

  it('defines non-empty icon and label prefix semantics for every supported node kind', () => {
    for (const kind of REQUIRED_KINDS) {
      const semantics = getNodeKindVisualSemantics(kind);

      expect(semantics.iconToken).toEqual(expect.any(String));
      expect(semantics.iconToken.trim().length).toBeGreaterThan(0);
      expect(semantics.labelPrefix).toEqual(expect.any(String));
      expect(semantics.labelPrefix.trim().length).toBeGreaterThan(0);
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

  it('defines reusable pencil treatment contract for node borders and edge arrows', () => {
    expect(PENCIL_TREATMENT).toEqual(
      expect.objectContaining({
        borderWidthPx: expect.any(Number),
        borderTexture: expect.stringContaining('repeating-linear-gradient'),
        lineStrokeWidth: expect.any(Number),
        lineStrokeDasharray: expect.any(String),
        lineCap: 'round',
        arrowColor: expect.stringMatching(/^#[0-9a-f]{6}$/i),
      }),
    );
  });

  it('defines a dotted workspace background contract', () => {
    expect(WORKSPACE_DOTTED_SURFACE.backgroundImage).toContain(
      'radial-gradient',
    );
    expect(WORKSPACE_DOTTED_SURFACE.backgroundSize).toMatch(/^\d+px \d+px$/);
  });

  it('assigns post-it node color tokens with readable foreground contrast for every kind', () => {
    for (const kind of REQUIRED_KINDS) {
      const token = NODE_KIND_POST_IT_TOKENS[kind];

      expect(token).toEqual(
        expect.objectContaining({
          background: expect.stringMatching(/^#[0-9a-f]{6}$/i),
          foreground: expect.stringMatching(/^#[0-9a-f]{6}$/i),
          border: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        }),
      );
      expect(
        contrastRatio(token.foreground, token.background),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

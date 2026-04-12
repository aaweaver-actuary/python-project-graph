// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  applyPositionOverrides,
  clearPositionOverrides,
  loadPositionOverrides,
  savePositionOverrides,
} from './layout-persistence';

const STORAGE_KEY = 'graph-position-overrides';

describe('(WU-07) layout-persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('applyPositionOverrides', () => {
    it('merges overrides into positions', () => {
      const positions = {
        a: { x: 0, y: 0 },
        b: { x: 10, y: 10 },
      };
      const overrides = { a: { x: 99, y: 99 } };

      const result = applyPositionOverrides(positions, overrides);

      expect(result).toEqual({
        a: { x: 99, y: 99 },
        b: { x: 10, y: 10 },
      });
    });

    it('returns original positions when overrides is empty', () => {
      const positions = {
        a: { x: 5, y: 5 },
        b: { x: 20, y: 20 },
      };

      const result = applyPositionOverrides(positions, {});

      expect(result).toEqual(positions);
    });

    it('does not mutate the original positions object', () => {
      const positions = {
        a: { x: 0, y: 0 },
        b: { x: 10, y: 10 },
      };
      const overrides = { a: { x: 99, y: 99 } };

      applyPositionOverrides(positions, overrides);

      expect(positions.a).toEqual({ x: 0, y: 0 });
      expect(positions.b).toEqual({ x: 10, y: 10 });
    });
  });

  describe('savePositionOverrides → loadPositionOverrides', () => {
    it('round-trips correctly', () => {
      const overrides = {
        node1: { x: 42, y: 84 },
        node2: { x: -10, y: 0 },
      };

      savePositionOverrides(overrides);
      const loaded = loadPositionOverrides();

      expect(loaded).toEqual(overrides);
    });
  });

  describe('clearPositionOverrides', () => {
    it('removes stored data', () => {
      savePositionOverrides({ a: { x: 1, y: 2 } });

      clearPositionOverrides();
      const loaded = loadPositionOverrides();

      expect(loaded).toEqual({});
    });
  });

  describe('loadPositionOverrides', () => {
    it('returns empty object when nothing is stored', () => {
      const loaded = loadPositionOverrides();

      expect(loaded).toEqual({});
    });

    it('returns empty object on parse failure', () => {
      localStorage.setItem(STORAGE_KEY, '{not-valid-json!!!');

      const loaded = loadPositionOverrides();

      expect(loaded).toEqual({});
    });
  });
});

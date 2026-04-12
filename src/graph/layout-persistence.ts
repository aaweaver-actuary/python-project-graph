export interface ManualPositionOverrides {
  [nodeId: string]: { x: number; y: number };
}

const STORAGE_KEY = 'graph-position-overrides';

export function savePositionOverrides(
  overrides: ManualPositionOverrides,
): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function loadPositionOverrides(): ManualPositionOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return {};
    return JSON.parse(raw) as ManualPositionOverrides;
  } catch {
    return {};
  }
}

export function clearPositionOverrides(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function applyPositionOverrides(
  positions: Record<string, { x: number; y: number }>,
  overrides: ManualPositionOverrides,
): Record<string, { x: number; y: number }> {
  return { ...positions, ...overrides };
}

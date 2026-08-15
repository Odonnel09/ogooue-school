import type { GradingConfig } from './types';

/** Applique le mode d'arrondi configuré, à deux décimales. */
export function applyRounding(
  value: number,
  rounding: GradingConfig['rounding'],
): number {
  switch (rounding) {
    case 'truncate':
      return Math.trunc(value * 100) / 100;
    case 'nearest_quarter':
      return Math.round(value * 4) / 4;
    default:
      return Math.round(value * 100) / 100;
  }
}

/** Moyenne pondérée, `null` si aucun poids exploitable. */
export function weightedAverage(
  entries: Array<{ value: number; weight: number }>,
): number | null {
  const usable = entries.filter((entry) => entry.weight > 0);
  if (usable.length === 0) return null;

  const totalWeight = usable.reduce((total, entry) => total + entry.weight, 0);
  if (totalWeight === 0) return null;

  const sum = usable.reduce(
    (total, entry) => total + entry.value * entry.weight,
    0,
  );
  return sum / totalWeight;
}

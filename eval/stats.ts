// A rate from a small test set is only a guess. The Wilson interval tells how wide that guess is.
// For example 0 false alarms out of 100 is "up to about 3.7%", not "0%".

export interface Count {
  k: number;
  n: number;
}

/** 95% Wilson score interval, in percent with one decimal. */
export function wilson({ k, n }: Count): { low: number; high: number } | null {
  if (n === 0) return null;
  const z = 1.96;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  const round = (x: number) => Math.round(Math.min(1, Math.max(0, x)) * 1000) / 10;
  return { low: round(centre - margin), high: round(centre + margin) };
}

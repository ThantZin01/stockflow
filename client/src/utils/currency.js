/**
 * Display amounts in Myanmar Kyat (whole kyat; no fractional display).
 */
export const formatMMK = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '0 MMK';

  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(rounded);
  return `${formatted} MMK`;
};

/** Shorter labels for chart axes when values are large. */
export const formatMMKAxis = (amount) => {
  const value = Number(amount) || 0;
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return String(Math.round(value));
};
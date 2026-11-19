/**
 * format.ts — Mise en forme des nombres et dates à la française.
 */

const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** 2450 → "2 450", 72.4 → "72,4". */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

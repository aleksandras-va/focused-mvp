export function bundleFullPriceCents(
  priceCents: number | null,
  itemPriceCents: (number | null)[],
): number | null {
  if (priceCents === null || itemPriceCents.length < 2) return null;
  if (itemPriceCents.some((cents) => cents === null)) return null;

  const sumCents = itemPriceCents.reduce<number>((sum, cents) => sum + (cents ?? 0), 0);

  return sumCents > priceCents ? sumCents : null;
}

export function discountPercent(priceCents: number, fullPriceCents: number): number {
  return Math.round((1 - priceCents / fullPriceCents) * 100);
}

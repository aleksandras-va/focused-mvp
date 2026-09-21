const priceFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const countFormatter = new Intl.NumberFormat('en-IE');

export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

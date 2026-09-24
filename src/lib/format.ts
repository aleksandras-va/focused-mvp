const priceFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const countFormatter = new Intl.NumberFormat('en-IE');

const monthFormatter = new Intl.DateTimeFormat('en-IE', { month: 'long', year: 'numeric' });

export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

export function formatOptionalPrice(cents: number | null): string {
  return cents === null ? 'No price yet' : formatPrice(cents);
}

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatMonth(date: Date): string {
  return monthFormatter.format(date);
}

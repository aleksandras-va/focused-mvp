const priceFormatter = new Intl.NumberFormat('lt-LT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const countFormatter = new Intl.NumberFormat('lt-LT');

const monthFormatter = new Intl.DateTimeFormat('lt-LT', { month: 'long', year: 'numeric' });

const timeFormatter = new Intl.DateTimeFormat('lt-LT', { hour: '2-digit', minute: '2-digit' });

const dayFormatter = new Intl.DateTimeFormat('lt-LT', { day: 'numeric', month: 'short' });

const dateFormatter = new Intl.DateTimeFormat('lt-LT', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

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

export function formatMessageTime(date: Date, now = new Date()): string {
  if (date.toDateString() === now.toDateString()) return timeFormatter.format(date);
  if (date.getFullYear() === now.getFullYear()) return dayFormatter.format(date);

  return dateFormatter.format(date);
}

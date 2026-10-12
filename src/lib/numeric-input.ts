export function keepDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function keepDecimal(value: string) {
  const [whole, ...fraction] = value
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '')
    .split('.');

  return fraction.length > 0 ? `${whole}.${fraction.join('')}` : whole;
}

import 'server-only';

export function toMixpanelProperties(properties: object) {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [toSnakeCase(key), value]),
  );
}

function toSnakeCase(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

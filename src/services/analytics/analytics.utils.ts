import 'server-only';

import {
  LOCATION_HEADERS,
  SOURCE_VALUE_MAX_LENGTH,
  UTM_KEYS,
  VISIT_SOURCE_KEYS,
} from './analytics.constants';
import type { VisitLanding, VisitorLocation, VisitSource } from './analytics.types';

export function toMixpanelProperties(properties: object) {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [toSnakeCase(key), value]),
  );
}

function toSnakeCase(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function parseVisitSource({ referrer, landingUrl }: VisitLanding): VisitSource | null {
  const landing = parseWebUrl(landingUrl);

  if (!landing) return null;

  const referring = parseWebUrl(referrer);
  const fromElsewhere = referring !== null && referring.host !== landing.host;
  const utm = Object.fromEntries(
    UTM_KEYS.flatMap((key) => {
      const value = landing.searchParams.get(key)?.trim();

      return value ? [[key, value.slice(0, SOURCE_VALUE_MAX_LENGTH)]] : [];
    }),
  );

  if (!fromElsewhere && Object.keys(utm).length === 0) return null;

  return {
    ...(fromElsewhere
      ? {
          $referrer: referring.href.slice(0, SOURCE_VALUE_MAX_LENGTH),
          $referring_domain: referring.hostname,
        }
      : {}),
    ...utm,
  };
}

export function readStoredVisitSource(stored: string | undefined): VisitSource {
  if (!stored) return {};

  try {
    const parsed: unknown = JSON.parse(stored);

    if (typeof parsed !== 'object' || parsed === null) return {};

    return Object.fromEntries(
      VISIT_SOURCE_KEYS.flatMap((key) => {
        const value = (parsed as Record<string, unknown>)[key];

        return typeof value === 'string' ? [[key, value.slice(0, SOURCE_VALUE_MAX_LENGTH)]] : [];
      }),
    );
  } catch {
    return {};
  }
}

export function readVisitorLocation(requestHeaders: Pick<Headers, 'get'>): VisitorLocation {
  return {
    countryCode: requestHeaders.get(LOCATION_HEADERS.countryCode) ?? undefined,
    region: requestHeaders.get(LOCATION_HEADERS.region) ?? undefined,
    city: decodeHeaderValue(requestHeaders.get(LOCATION_HEADERS.city)),
  };
}

function decodeHeaderValue(value: string | null) {
  if (!value) return undefined;

  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

function parseWebUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

import { describe, expect, it } from 'vitest';
import { parseVisitSource, readStoredVisitSource, readVisitorLocation } from './analytics.utils';

const LANDING = 'https://expose.lt/items/abc';

describe('parseVisitSource', () => {
  it('keeps an outside referrer and its domain', () => {
    expect(parseVisitSource({ referrer: 'https://www.google.com/', landingUrl: LANDING })).toEqual({
      $referrer: 'https://www.google.com/',
      $referring_domain: 'www.google.com',
    });
  });

  it('reads UTM tags from the landing URL', () => {
    expect(
      parseVisitSource({
        referrer: '',
        landingUrl: `${LANDING}?utm_source=facebook&utm_medium=group&utm_campaign=+launch+&other=1`,
      }),
    ).toEqual({ utm_source: 'facebook', utm_medium: 'group', utm_campaign: 'launch' });
  });

  it('ignores a visit with no outside referrer and no tags', () => {
    expect(parseVisitSource({ referrer: '', landingUrl: LANDING })).toBeNull();
    expect(
      parseVisitSource({ referrer: 'https://expose.lt/?category=lens', landingUrl: LANDING }),
    ).toBeNull();
  });

  it('rejects input that is not a web URL', () => {
    expect(parseVisitSource({ referrer: 'https://google.com/', landingUrl: 'nope' })).toBeNull();
    expect(
      parseVisitSource({ referrer: 'android-app://com.google/', landingUrl: LANDING }),
    ).toBeNull();
  });
});

describe('readStoredVisitSource', () => {
  it('keeps only known string fields', () => {
    expect(
      readStoredVisitSource(JSON.stringify({ utm_source: 'newsletter', token: 'x', $referrer: 5 })),
    ).toEqual({ utm_source: 'newsletter' });
  });

  it('survives a missing or broken cookie', () => {
    expect(readStoredVisitSource(undefined)).toEqual({});
    expect(readStoredVisitSource('{not json')).toEqual({});
  });
});

describe('readVisitorLocation', () => {
  it('reads the location headers and decodes the city', () => {
    expect(
      readVisitorLocation(
        new Headers({
          'x-vercel-ip-country': 'LT',
          'x-vercel-ip-country-region': '57',
          'x-vercel-ip-city': '%C5%A0iauliai',
        }),
      ),
    ).toEqual({ countryCode: 'LT', region: '57', city: 'Šiauliai' });
  });

  it('leaves out what the request does not carry', () => {
    expect(readVisitorLocation(new Headers({ 'x-vercel-ip-city': '%E0%A4%A' }))).toEqual({
      countryCode: undefined,
      region: undefined,
      city: undefined,
    });
  });
});

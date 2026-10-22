import 'server-only';

export const MIXPANEL_TRACK_URL = 'https://api-eu.mixpanel.com/track?verbose=1&ip=0';
export const MIXPANEL_PROFILE_URL = 'https://api-eu.mixpanel.com/engage?verbose=1&ip=0';

export const LOCATION_HEADERS = {
  countryCode: 'x-vercel-ip-country',
  region: 'x-vercel-ip-country-region',
  city: 'x-vercel-ip-city',
} as const;

export const VISITOR_COOKIE = 'focused_visitor';
export const VISITOR_DAYS = 365;

export const SOURCE_COOKIE = 'focused_source';
export const SOURCE_DAYS = 1;
export const SOURCE_VALUE_MAX_LENGTH = 200;

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export const VISIT_SOURCE_KEYS = ['$referrer', '$referring_domain', ...UTM_KEYS] as const;

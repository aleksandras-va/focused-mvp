export const SITE_NAME = 'exposé';

export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const NOT_INDEXED = { index: false, follow: true } as const;

export const DEFAULT_SHARE_IMAGE = {
  url: '/images/og.jpg',
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

export const OPEN_GRAPH_BASE = {
  type: 'website' as const,
  siteName: SITE_NAME,
  locale: 'lt_LT',
  images: [DEFAULT_SHARE_IMAGE],
};

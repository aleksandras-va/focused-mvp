import 'server-only';

export const RESEND_EMAILS_URL = 'https://api.resend.com/emails';

export const SITE_URL = 'https://expose.lt';

export const EMAIL_LOGO = {
  url: 'https://res.cloudinary.com/vaa/image/upload/expose%CC%81_d96ewq.png',
  width: 96,
  height: 31,
} as const;

export const EMAIL_FONT_FAMILY =
  "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export const EMAIL_COLORS = {
  foreground: '#0b0b0b',
  primary: '#4a63c9',
  primarySoft: '#f0f2fa',
  primaryInk: '#33449a',
  muted: '#f1f3f3',
  mutedForeground: '#67787c',
  border: '#e7e2dc',
} as const;

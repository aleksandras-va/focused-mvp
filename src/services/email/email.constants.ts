import 'server-only';

export const RESEND_EMAILS_URL = 'https://api.resend.com/emails';

export const SITE_URL = 'https://expose.lt';

export const EMAIL_LOGO = {
  url: 'https://res.cloudinary.com/vaa/image/upload/logo_lwlm2y.png',
  width: 127,
  height: 41,
} as const;

export const EMAIL_FONT_FAMILY =
  "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export const EMAIL_COLORS = {
  foreground: '#0b0b0b',
  primary: '#00433d',
  primarySoft: '#eaf3ea',
  primaryInk: '#00433d',
  muted: '#f1f3f3',
  mutedForeground: '#67787c',
  border: '#e7e2dc',
} as const;

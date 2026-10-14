import 'server-only';

import { EMAIL_COLORS, EMAIL_FONT_FAMILY, EMAIL_LOGO, SITE_URL } from './email.constants';

const browseLinks = [
  { href: `${SITE_URL}/?category=camera`, label: 'Cameras' },
  { href: `${SITE_URL}/?category=lens`, label: 'Lenses' },
  { href: `${SITE_URL}/?category=accessory`, label: 'Accessories' },
];

const sellUrl = `${SITE_URL}/sell`;
const accountUrl = `${SITE_URL}/user`;

export function welcomeEmail(displayName: string) {
  const name = escapeHtml(displayName);

  return {
    subject: 'Welcome to exposé',
    text: [
      `Hi ${displayName},`,
      '',
      'Your exposé account is ready. You can now list your cameras, lenses and accessories.',
      '',
      `Sell your gear: ${sellUrl}`,
      '',
      'Pick the exact model when you sell, so buyers searching for it find your ad.',
      '',
      'Browse what is for sale:',
      ...browseLinks.map((link) => `${link.label}: ${link.href}`),
      '',
      `Your account: ${accountUrl}`,
      '',
      'exposé',
      SITE_URL,
    ].join('\n'),
    html: layout(
      [
        `<h1 style="margin:0 0 16px;font-size:24px;line-height:32px;font-weight:700;color:${EMAIL_COLORS.foreground};">Welcome, ${name}</h1>`,
        `<p style="margin:0 0 24px;font-size:16px;line-height:24px;color:${EMAIL_COLORS.foreground};">Your exposé account is ready. You can now list your cameras, lenses and accessories.</p>`,
        `<a href="${sellUrl}" style="display:inline-block;padding:10px 24px;border-radius:999px;background-color:${EMAIL_COLORS.primary};font-size:15px;line-height:20px;font-weight:600;color:#ffffff;text-decoration:none;">Sell your gear</a>`,
        `<div style="margin:32px 0 0;padding:16px 20px;border-radius:12px;background-color:${EMAIL_COLORS.primarySoft};font-size:14px;line-height:22px;color:${EMAIL_COLORS.primaryInk};"><strong>Tip:</strong> pick the exact model when you sell, so buyers searching for it find your ad.</div>`,
        `<p style="margin:32px 0 8px;font-size:13px;line-height:20px;font-weight:600;color:${EMAIL_COLORS.mutedForeground};">Browse what is for sale</p>`,
        `<p style="margin:0;font-size:15px;line-height:24px;">${browseLinks.map(inlineLink).join(separator)}</p>`,
      ].join(''),
    ),
  };
}

export interface NewMessageEmailInput {
  recipientName: string;
  senderName: string;
  listingTitle: string | null;
  body: string;
  conversationId: string;
}

export function newMessageEmail(input: NewMessageEmailInput) {
  const conversationUrl = `${SITE_URL}/messages/${input.conversationId}`;
  const about = input.listingTitle ? ` about ${input.listingTitle}` : '';
  const subject = `${input.senderName} sent you a message${about}`;

  return {
    subject,
    text: [
      `Hi ${input.recipientName},`,
      '',
      `${subject}:`,
      '',
      input.body,
      '',
      `Reply: ${conversationUrl}`,
      '',
      'exposé',
      SITE_URL,
    ].join('\n'),
    html: layout(
      [
        `<h1 style="margin:0 0 16px;font-size:24px;line-height:32px;font-weight:700;color:${EMAIL_COLORS.foreground};">${escapeHtml(subject)}</h1>`,
        `<div style="margin:0 0 24px;padding:16px 20px;border-radius:12px;background-color:${EMAIL_COLORS.muted};font-size:16px;line-height:24px;color:${EMAIL_COLORS.foreground};white-space:pre-wrap;">${escapeHtml(input.body)}</div>`,
        `<a href="${conversationUrl}" style="display:inline-block;padding:10px 24px;border-radius:999px;background-color:${EMAIL_COLORS.primary};font-size:15px;line-height:20px;font-weight:600;color:#ffffff;text-decoration:none;">Reply</a>`,
        `<p style="margin:24px 0 0;font-size:13px;line-height:20px;color:${EMAIL_COLORS.mutedForeground};">You get one email per unread conversation. Reading it on exposé lets the next message reach you again.</p>`,
      ].join(''),
    ),
  };
}

const separator = `<span style="color:${EMAIL_COLORS.border};">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`;

function inlineLink(link: { href: string; label: string }) {
  return `<a href="${link.href}" style="font-weight:600;color:${EMAIL_COLORS.primary};text-decoration:none;">${link.label}</a>`;
}

function layout(content: string) {
  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>',
    `<body style="margin:0;padding:0;background-color:${EMAIL_COLORS.muted};font-family:${EMAIL_FONT_FAMILY};">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${EMAIL_COLORS.muted};"><tr><td align="center" style="padding:32px 16px;">`,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">',
    `<tr><td style="padding:0 8px 20px;"><a href="${SITE_URL}" style="text-decoration:none;"><img src="${EMAIL_LOGO.url}" width="${EMAIL_LOGO.width}" height="${EMAIL_LOGO.height}" alt="exposé" style="display:block;border:0;font-size:26px;line-height:32px;font-weight:700;color:${EMAIL_COLORS.primary};"></a></td></tr>`,
    `<tr><td style="padding:32px;border:1px solid ${EMAIL_COLORS.border};border-radius:16px;background-color:#ffffff;">${content}</td></tr>`,
    `<tr><td style="padding:20px 8px 0;font-size:13px;line-height:20px;color:${EMAIL_COLORS.mutedForeground};">Used cameras and lenses, listed against a real catalog so search works.<br><a href="${SITE_URL}" style="color:${EMAIL_COLORS.mutedForeground};">expose.lt</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${accountUrl}" style="color:${EMAIL_COLORS.mutedForeground};">Your account</a></td></tr>`,
    '</table>',
    '</td></tr></table>',
    '</body></html>',
  ].join('');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

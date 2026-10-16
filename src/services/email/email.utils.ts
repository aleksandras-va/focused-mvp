import 'server-only';

import { createTranslator } from 'next-intl';
import { LOCALE } from '@/i18n/request';
import { formatListingTitle, type ListingTitle } from '@/lib/listing-title';
import messages from '../../../messages/lt.json';
import { EMAIL_COLORS, EMAIL_FONT_FAMILY, EMAIL_LOGO, SITE_URL } from './email.constants';

const t = createTranslator({ locale: LOCALE, messages, namespace: 'email' });
const tListingTitle = createTranslator({ locale: LOCALE, messages, namespace: 'listingTitle' });
const tCategory = createTranslator({ locale: LOCALE, messages, namespace: 'enums.categoryPlural' });

const browseLinks = (['camera', 'lens', 'accessory'] as const).map((category) => ({
  href: `${SITE_URL}/?category=${category}`,
  label: tCategory(category),
}));

const sellUrl = `${SITE_URL}/sell`;
const accountUrl = `${SITE_URL}/user`;

export function welcomeEmail(displayName: string) {
  return {
    subject: t('welcome.subject'),
    text: [
      t('greeting', { name: displayName }),
      '',
      t('welcome.intro'),
      '',
      `${t('welcome.sell')}: ${sellUrl}`,
      '',
      `${t('welcome.tipLabel')} ${t('welcome.tip')}`,
      '',
      `${t('welcome.browse')}:`,
      ...browseLinks.map((link) => `${link.label}: ${link.href}`),
      '',
      `${t('account')}: ${accountUrl}`,
      '',
      'exposé',
      SITE_URL,
    ].join('\n'),
    html: layout(
      [
        `<h1 style="margin:0 0 16px;font-size:24px;line-height:32px;font-weight:700;color:${EMAIL_COLORS.foreground};">${escapeHtml(t('welcome.heading', { name: displayName }))}</h1>`,
        `<p style="margin:0 0 24px;font-size:16px;line-height:24px;color:${EMAIL_COLORS.foreground};">${t('welcome.intro')}</p>`,
        `<a href="${sellUrl}" style="display:inline-block;padding:10px 24px;border-radius:999px;background-color:${EMAIL_COLORS.primary};font-size:15px;line-height:20px;font-weight:600;color:#ffffff;text-decoration:none;">${t('welcome.sell')}</a>`,
        `<div style="margin:32px 0 0;padding:16px 20px;border-radius:12px;background-color:${EMAIL_COLORS.primarySoft};font-size:14px;line-height:22px;color:${EMAIL_COLORS.primaryInk};"><strong>${t('welcome.tipLabel')}</strong> ${t('welcome.tip')}</div>`,
        `<p style="margin:32px 0 8px;font-size:13px;line-height:20px;font-weight:600;color:${EMAIL_COLORS.mutedForeground};">${t('welcome.browse')}</p>`,
        `<p style="margin:0;font-size:15px;line-height:24px;">${browseLinks.map(inlineLink).join(separator)}</p>`,
      ].join(''),
    ),
  };
}

export interface NewMessageEmailInput {
  recipientName: string;
  senderName: string;
  listingTitle: ListingTitle | null;
  body: string;
  conversationId: string;
}

export function newMessageEmail(input: NewMessageEmailInput) {
  const conversationUrl = `${SITE_URL}/messages/${input.conversationId}`;
  const subject = input.listingTitle
    ? t('newMessage.subjectAbout', {
        sender: input.senderName,
        listing: formatListingTitle(input.listingTitle, tListingTitle),
      })
    : t('newMessage.subject', { sender: input.senderName });

  return {
    subject,
    text: [
      t('greeting', { name: input.recipientName }),
      '',
      `${subject}:`,
      '',
      input.body,
      '',
      `${t('newMessage.reply')}: ${conversationUrl}`,
      '',
      'exposé',
      SITE_URL,
    ].join('\n'),
    html: layout(
      [
        `<h1 style="margin:0 0 16px;font-size:24px;line-height:32px;font-weight:700;color:${EMAIL_COLORS.foreground};">${escapeHtml(subject)}</h1>`,
        `<div style="margin:0 0 24px;padding:16px 20px;border-radius:12px;background-color:${EMAIL_COLORS.muted};font-size:16px;line-height:24px;color:${EMAIL_COLORS.foreground};white-space:pre-wrap;">${escapeHtml(input.body)}</div>`,
        `<a href="${conversationUrl}" style="display:inline-block;padding:10px 24px;border-radius:999px;background-color:${EMAIL_COLORS.primary};font-size:15px;line-height:20px;font-weight:600;color:#ffffff;text-decoration:none;">${t('newMessage.reply')}</a>`,
        `<p style="margin:24px 0 0;font-size:13px;line-height:20px;color:${EMAIL_COLORS.mutedForeground};">${t('newMessage.notice')}</p>`,
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
    `<!doctype html><html lang="${LOCALE}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>`,
    `<body style="margin:0;padding:0;background-color:${EMAIL_COLORS.muted};font-family:${EMAIL_FONT_FAMILY};">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${EMAIL_COLORS.muted};"><tr><td align="center" style="padding:32px 16px;">`,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">',
    `<tr><td style="padding:0 8px 20px;"><a href="${SITE_URL}" style="text-decoration:none;"><img src="${EMAIL_LOGO.url}" width="${EMAIL_LOGO.width}" height="${EMAIL_LOGO.height}" alt="exposé" style="display:block;border:0;font-size:26px;line-height:32px;font-weight:700;color:${EMAIL_COLORS.primary};"></a></td></tr>`,
    `<tr><td style="padding:32px;border:1px solid ${EMAIL_COLORS.border};border-radius:16px;background-color:#ffffff;">${content}</td></tr>`,
    `<tr><td style="padding:20px 8px 0;font-size:13px;line-height:20px;color:${EMAIL_COLORS.mutedForeground};">${t('tagline')}<br><a href="${SITE_URL}" style="color:${EMAIL_COLORS.mutedForeground};">expose.lt</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${accountUrl}" style="color:${EMAIL_COLORS.mutedForeground};">${t('account')}</a></td></tr>`,
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

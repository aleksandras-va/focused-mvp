import 'server-only';

import { RESEND_EMAILS_URL } from './email.constants';
import { EmailError } from './email.error';
import { welcomeEmail } from './email.utils';

export const emailService = {
  async sendWelcome(to: string, displayName: string) {
    await send(to, welcomeEmail(displayName));
  },
} as const;

async function send(to: string, message: { subject: string; text: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) throw new EmailError('Email sending is not configured.');

  const response = await fetch(RESEND_EMAILS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, ...message }),
  });

  if (!response.ok) {
    throw new EmailError(`Resend rejected the email: ${response.status} ${await response.text()}`);
  }
}

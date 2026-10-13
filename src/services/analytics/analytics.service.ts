import 'server-only';

import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { after } from 'next/server';
import { MIXPANEL_TRACK_URL, VISITOR_COOKIE, VISITOR_DAYS } from './analytics.constants';
import { AnalyticsError } from './analytics.error';
import type { AnalyticsEventName, AnalyticsEvents } from './analytics.types';
import { toMixpanelProperties } from './analytics.utils';

export const analyticsService = {
  async track<Name extends AnalyticsEventName>(
    userId: string | null,
    event: Name,
    properties: AnalyticsEvents[Name],
  ) {
    const token = process.env.MIXPANEL_TOKEN;

    if (!token) return;

    const payload = {
      event,
      properties: {
        ...toMixpanelProperties(properties),
        token,
        time: Date.now(),
        $insert_id: randomUUID(),
        $device_id: await readOrCreateVisitorId(),
        ...(userId ? { $user_id: userId, distinct_id: userId } : {}),
      },
    };

    after(() =>
      send(payload).catch((error) => {
        console.error(`Analytics event "${event}" failed`, error);
      }),
    );
  },
} as const;

async function readOrCreateVisitorId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;

  if (existing) return existing;

  const visitorId = randomUUID();

  cookieStore.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: VISITOR_DAYS * 86_400,
  });

  return visitorId;
}

async function send(payload: { event: string; properties: Record<string, unknown> }) {
  const response = await fetch(MIXPANEL_TRACK_URL, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify([payload]),
  });
  const result = (await response.json()) as { status?: number; error?: string };

  if (!response.ok || result.status !== 1) {
    throw new AnalyticsError(`Mixpanel rejected the event: ${response.status} ${result.error}`);
  }
}

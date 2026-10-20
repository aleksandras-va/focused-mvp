import 'server-only';

import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { after } from 'next/server';
import {
  MIXPANEL_PROFILE_URL,
  MIXPANEL_TRACK_URL,
  SOURCE_COOKIE,
  SOURCE_DAYS,
  VISITOR_COOKIE,
  VISITOR_DAYS,
} from './analytics.constants';
import { AnalyticsError } from './analytics.error';
import type {
  AnalyticsEventName,
  AnalyticsEvents,
  AnalyticsProfile,
  VisitLanding,
} from './analytics.types';
import { parseVisitSource, readStoredVisitSource, toMixpanelProperties } from './analytics.utils';

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
        ...(await readVisitSource()),
        token,
        time: Date.now(),
        $insert_id: randomUUID(),
        $device_id: await readOrCreateVisitorId(),
        ...(userId ? { $user_id: userId, distinct_id: userId } : {}),
      },
    };

    after(() =>
      send(MIXPANEL_TRACK_URL, payload).catch((error) => {
        console.error(`Analytics event "${event}" failed`, error);
      }),
    );
  },

  async rememberVisitSource(landing: VisitLanding) {
    if (!process.env.MIXPANEL_TOKEN) return;

    const source = parseVisitSource(landing);

    if (!source) return;

    const cookieStore = await cookies();
    const value = JSON.stringify(source);

    if (cookieStore.get(SOURCE_COOKIE)?.value === value) return;

    cookieStore.set(SOURCE_COOKIE, value, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SOURCE_DAYS * 86_400,
    });
  },

  identify(profile: AnalyticsProfile) {
    const token = process.env.MIXPANEL_TOKEN;

    if (!token) return;

    const payload = {
      $token: token,
      $distinct_id: profile.id,
      // TODO: stop sending the email to Mixpanel once the pilot is over.
      $set: { $name: profile.displayName, $email: profile.email },
    };

    after(() =>
      send(MIXPANEL_PROFILE_URL, payload).catch((error) => {
        console.error('Analytics profile failed', error);
      }),
    );
  },
} as const;

async function readVisitSource() {
  const cookieStore = await cookies();

  return readStoredVisitSource(cookieStore.get(SOURCE_COOKIE)?.value);
}

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

async function send(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify([payload]),
  });

  const result = (await response.json()) as { status?: number; error?: string };

  if (!response.ok || result.status !== 1) {
    throw new AnalyticsError(`Mixpanel rejected the request: ${response.status} ${result.error}`);
  }
}

'use client';

import { useEffect, useRef } from 'react';
import type { VisitLanding } from '@/services/analytics/analytics.types';

interface RecordVisitSourceProps {
  recordAction: (landing: VisitLanding) => Promise<void>;
}

export function RecordVisitSource({ recordAction }: RecordVisitSourceProps) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;

    recorded.current = true;

    const { referrer } = document;
    const { host, href, search } = window.location;
    const fromElsewhere = referrer !== '' && new URL(referrer).host !== host;

    if (fromElsewhere || search.includes('utm_')) recordAction({ referrer, landingUrl: href });
  }, [recordAction]);

  return null;
}

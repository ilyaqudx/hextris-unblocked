'use client';

import { track } from '@vercel/analytics';
import { trackCustomEvent } from './tracker';

/**
 * Universal event tracking for:
 * 1. Custom MongoDB / PostgreSQL Backend (/api/track)
 * 2. Vercel Web Analytics
 * 3. Google Analytics 4 (GA4)
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  try {
    // 1. Dispatch to custom backend API -> MongoDB / PostgreSQL
    trackCustomEvent({
      eventName,
      eventType: eventName.startsWith('click_') ? 'click' : eventName.startsWith('view_') ? 'view' : 'interaction',
      payload: eventParams,
    });

    // 2. Dispatch to Vercel Analytics
    track(eventName, eventParams);

    // 3. Dispatch to Google Analytics 4 (if configured)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventParams);
    }

    // Dev logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Event] ${eventName}:`, eventParams);
    }
  } catch (err) {
    console.error('Failed to dispatch analytics event', err);
  }
}

export * from './tracker';

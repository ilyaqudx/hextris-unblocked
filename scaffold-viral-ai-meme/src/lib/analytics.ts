'use client';

import { track } from '@vercel/analytics';

/**
 * Universal event tracking for Vercel Web Analytics & Google Analytics (GA4)
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  try {
    // 1. Send to Vercel Analytics
    track(eventName, eventParams);

    // 2. Send to Google Analytics 4 (if configured)
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

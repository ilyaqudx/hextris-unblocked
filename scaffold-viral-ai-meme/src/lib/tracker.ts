'use client';

// Persistent Visitor and Session ID helpers
function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'htrd_vid';
  let vid = localStorage.getItem(key);
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem(key, vid);
  }
  return vid;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'htrd_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = 's_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export interface TrackPayload {
  eventName: string;
  eventType?: 'view' | 'click' | 'interaction' | 'conversion';
  buttonText?: string;
  elementId?: string;
  payload?: Record<string, any>;
}

/**
 * Send an event to our custom tracking endpoint /api/track
 */
export function trackCustomEvent({
  eventName,
  eventType = 'interaction',
  buttonText,
  elementId,
  payload = {},
}: TrackPayload) {
  if (typeof window === 'undefined') return;

  const body = {
    eventName,
    eventType,
    buttonText,
    elementId,
    visitorId: getOrCreateVisitorId(),
    sessionId: getOrCreateSessionId(),
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer || '',
    clientTime: new Date().toISOString(),
    payload: {
      ...payload,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      language: navigator.language,
    },
  };

  const endpoint = '/api/track';
  const data = JSON.stringify(body);

  // Use sendBeacon for zero-latency, reliable delivery even on page unload
  if (navigator.sendBeacon) {
    const blob = new Blob([data], { type: 'application/json' });
    const success = navigator.sendBeacon(endpoint, blob);
    if (success) return;
  }

  // Fallback to fetch with keepalive
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
    keepalive: true,
  }).catch((err) => {
    // Non-blocking catch
    console.debug('[TRACKER] Send failed:', err);
  });
}

/**
 * Specifically track a button or link click
 */
export function trackButtonClick(buttonText: string, elementId?: string, extra?: Record<string, any>) {
  trackCustomEvent({
    eventName: `click_${buttonText.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    eventType: 'click',
    buttonText,
    elementId,
    payload: extra,
  });
}

/**
 * Specifically track a content impression / view
 */
export function trackContentImpression(contentName: string, extra?: Record<string, any>) {
  trackCustomEvent({
    eventName: `view_${contentName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    eventType: 'view',
    payload: extra,
  });
}

/**
 * Global Tracker Initializer:
 * 1. Tracks page view
 * 2. Automatically listens to clicks on buttons, links, inputs, and elements with data-track
 * 3. Observes section visibility for impressions
 */
export function initGlobalTracker() {
  if (typeof window === 'undefined' || (window as any).__htrd_tracker_initialized) return;
  (window as any).__htrd_tracker_initialized = true;

  // 1. Initial Page View Impression
  trackCustomEvent({
    eventName: 'page_view',
    eventType: 'view',
    payload: {
      title: document.title,
      screen: `${window.innerWidth}x${window.innerHeight}`,
    },
  });

  // 2. Global Click Capture
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const clickable = target.closest(
        'button, a, input[type="button"], input[type="submit"], input[type="checkbox"], summary, [role="button"], [data-track]'
      ) as HTMLElement;

      if (!clickable) return;

      const buttonText = (
        clickable.getAttribute('data-track') ||
        clickable.innerText ||
        clickable.getAttribute('aria-label') ||
        clickable.getAttribute('title') ||
        (clickable as HTMLInputElement).value ||
        clickable.tagName.toLowerCase()
      )
        .trim()
        .slice(0, 80);

      const elementId = clickable.id || clickable.getAttribute('name') || undefined;
      const href = (clickable as HTMLAnchorElement).href || undefined;
      const isOutbound = href && href.startsWith('http') && !href.includes(window.location.hostname);

      trackCustomEvent({
        eventName: isOutbound ? 'click_outbound_link' : 'click_element',
        eventType: 'click',
        buttonText,
        elementId,
        payload: {
          tag: clickable.tagName.toLowerCase(),
          className: clickable.className ? String(clickable.className).slice(0, 100) : '',
          href,
          isOutbound,
        },
      });
    },
    { capture: true, passive: true }
  );

  // 3. Section Visibility Observer (Impressions of what user actually saw)
  if ('IntersectionObserver' in window) {
    const viewedSections = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const el = entry.target as HTMLElement;
            const sectionId = el.id || el.getAttribute('data-section');
            if (sectionId && !viewedSections.has(sectionId)) {
              viewedSections.add(sectionId);
              const heading = el.querySelector('h1, h2, h3')?.textContent?.trim() || sectionId;
              trackCustomEvent({
                eventName: `view_section_${sectionId}`,
                eventType: 'view',
                elementId: sectionId,
                payload: {
                  sectionId,
                  sectionHeading: heading.slice(0, 100),
                },
              });
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    // Observe all sections and landmark containers
    setTimeout(() => {
      document.querySelectorAll('section, [data-section]').forEach((sec) => {
        observer.observe(sec);
      });
    }, 1000);
  }
}

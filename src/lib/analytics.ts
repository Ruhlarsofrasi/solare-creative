import { site } from '../config/site';

/**
 * Privacy-respecting analytics integration point.
 * Does nothing until `site.analytics.provider` is configured in src/config/site.ts.
 * Supports cookieless providers only (Plausible / Umami).
 */
type W = Window & { plausible?: (e: string, o?: unknown) => void; umami?: { track: (...a: unknown[]) => void } };

let enabled = false;

export function initAnalytics() {
  const a = site.analytics;
  if (a.provider === 'none' || !a.scriptSrc || !a.siteId) return;
  const nav = navigator as Navigator & { doNotTrack?: string; globalPrivacyControl?: boolean };
  if (a.respectDnt && (nav.doNotTrack === '1' || nav.globalPrivacyControl)) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = a.scriptSrc;
  if (a.provider === 'plausible') {
    s.setAttribute('data-domain', a.siteId);
    // SPA: page views are sent manually from trackPage()
    s.setAttribute('data-api', new URL('/api/event', a.scriptSrc).toString());
  } else {
    s.setAttribute('data-website-id', a.siteId);
    s.setAttribute('data-auto-track', 'false');
  }
  document.head.appendChild(s);
  enabled = true;
}

export function trackPage(path: string) {
  if (!enabled) return;
  const w = window as W;
  if (site.analytics.provider === 'plausible') w.plausible?.('pageview', { u: location.origin + path });
  else w.umami?.track((p: Record<string, unknown>) => ({ ...p, url: path }));
}

export function trackEvent(name: string, props?: Record<string, string>) {
  if (!enabled) return;
  const w = window as W;
  if (site.analytics.provider === 'plausible') w.plausible?.(name, { props });
  else w.umami?.track(name, props);
}

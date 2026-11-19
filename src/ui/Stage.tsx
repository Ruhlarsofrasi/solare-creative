import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { planetById, SUN_RADIUS } from '../config/planets';
import { clamp, lerp, smoothstep } from '../lib/math';
import { sameRoute, type Route } from '../lib/router';
import { audio } from '../audio/AudioEngine';
import { bridge, screenRadius, toScreen } from '../state/bridge';
import { useStore } from '../state/store';
import { Vector3 } from 'three';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { GalleryPage } from './pages/GalleryPage';
import { LegalPage, NotFoundPage } from './pages/LegalPage';
import { ServicePage } from './pages/ServicePage';
import { ProjectView } from './project/ProjectView';

const isOverlay = (r: Route) => r.kind !== 'home';
const pt = { x: 0, y: 0 };
const corner = new Vector3();
const ORIGIN = new Vector3();

/**
 * Computes the CSS clip-path for the match cut:
 *  • destinations open as an iris growing out of the planet's own disc,
 *  • projects open as the billboard's rectangle growing to full frame,
 *  • legal / 404 open out of the sun.
 */
function clipFor(route: Route, k: number): string {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const e = k * k * (3 - 2 * k);
  if (route.kind === 'project') {
    const s = bridge.screens[route.slug];
    if (s && bridge.camera) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let ok = true;
      for (const sx of [-1, 1])
        for (const sy of [-1, 1]) {
          corner.copy(s.center).addScaledVector(s.right, (sx * s.w) / 2).addScaledVector(s.up, (sy * s.h) / 2);
          ok = toScreen(corner, pt) && ok;
          minX = Math.min(minX, pt.x);
          maxX = Math.max(maxX, pt.x);
          minY = Math.min(minY, pt.y);
          maxY = Math.max(maxY, pt.y);
        }
      if (ok) {
        const t = clamp(lerp(minY, 0, e), 0, h);
        const r = clamp(lerp(w - maxX, 0, e), 0, w);
        const b = clamp(lerp(h - maxY, 0, e), 0, h);
        const l = clamp(lerp(minX, 0, e), 0, w);
        return `inset(${t.toFixed(1)}px ${r.toFixed(1)}px ${b.toFixed(1)}px ${l.toFixed(1)}px round ${((1 - e) * 6).toFixed(1)}px)`;
      }
    }
    const m = (1 - e) * 50;
    return `inset(${m}% ${m}% ${m}% ${m}%)`;
  }
  let cx = w / 2;
  let cy = h / 2;
  let r0 = 24;
  if (bridge.camera) {
    const planet = route.kind === 'planet' ? planetById(route.id) : undefined;
    const world = planet ? bridge.planetPos[planet.id] : ORIGIN;
    if (toScreen(world, pt)) {
      cx = clamp(pt.x, -w, 2 * w);
      cy = clamp(pt.y, -h, 2 * h);
      r0 = clamp(screenRadius(world, planet ? planet.radius : SUN_RADIUS), 12, Math.max(w, h));
    }
  }
  const far = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 2;
  return `circle(${lerp(r0, Math.max(far, r0), e).toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
}

function Content({ route }: { route: Route }) {
  switch (route.kind) {
    case 'planet':
      if (route.id === 'about') return <AboutPage />;
      if (route.id === 'contact') return <ContactPage />;
      if (route.id === 'gallery') return <GalleryPage />;
      return <ServicePage id={route.id} />;
    case 'project':
      return <ProjectView slug={route.slug} />;
    case 'legal':
      return <LegalPage />;
    case 'notfound':
      return <NotFoundPage />;
    default:
      return null;
  }
}

/**
 * Hosts the content environment of the current route above the canvas and
 * choreographs its entrance/exit so that it reads as one continuous shot
 * with the camera flight underneath.
 */
export function Stage() {
  const route = useStore((s) => s.route);
  const [shown, setShown] = useState<Route | null>(isOverlay(route) ? route : null);
  const portal = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const k = useRef(0);
  const tween = useRef<gsap.core.Tween | null>(null);
  const ticker = useRef<(() => void) | null>(null);
  const firstMount = useRef(true);
  const shownRef = useRef(shown);
  shownRef.current = shown;

  const apply = () => {
    const el = portal.current;
    const r = shownRef.current;
    if (!el || !r) return;
    const v = k.current;
    if (v >= 0.999) {
      el.style.clipPath = 'none';
      el.style.opacity = '1';
    } else {
      el.style.clipPath = clipFor(r, clamp(v));
      el.style.opacity = String(smoothstep(0, 0.18, v));
    }
    el.style.visibility = v <= 0.001 ? 'hidden' : 'visible';
  };

  const stopTicker = () => {
    if (ticker.current) gsap.ticker.remove(ticker.current);
    ticker.current = null;
  };

  const playIn = () => {
    tween.current?.kill();
    stopTicker();
    const reduced = useStore.getState().reducedMotion;
    const start = performance.now();
    const from = k.current;
    const fn = () => {
      const time = clamp((performance.now() - start) / (reduced ? 350 : 700));
      const flight = bridge.flightK < 1 && !reduced ? smoothstep(0.42, 0.985, bridge.flightK) : 1;
      k.current = Math.max(from, Math.min(time, flight));
      apply();
      if (k.current >= 0.999) stopTicker();
    };
    ticker.current = fn;
    gsap.ticker.add(fn);
  };

  // route → decide what to show
  useEffect(() => {
    const target = isOverlay(route) ? route : null;
    useStore.setState({ paused: false });
    if (!firstMount.current && !useStore.getState().reducedMotion) audio.whoosh();
    if (sameRoute(shownRef.current, target)) {
      if (target && k.current < 1) playIn();
      return;
    }
    if (shownRef.current) {
      stopTicker();
      tween.current?.kill();
      const reduced = useStore.getState().reducedMotion;
      tween.current = gsap.to(k, {
        current: 0,
        duration: reduced ? 0.25 : 0.7 * Math.max(k.current, 0.2),
        ease: 'power2.inOut',
        onUpdate: apply,
        onComplete: () => setShown(target),
      });
    } else setShown(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  // shown → animate in
  useLayoutEffect(() => {
    if (!shown) return;
    if (scroller.current) scroller.current.scrollTop = 0;
    if (firstMount.current) {
      // direct link: content is simply there
      k.current = 1;
      apply();
    } else {
      k.current = 0;
      apply();
      playIn();
      // move focus into the new environment for keyboard / screen-reader users
      window.setTimeout(() => scroller.current?.focus({ preventScroll: true }), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  useEffect(() => {
    firstMount.current = false;
    return () => {
      stopTicker();
      tween.current?.kill();
    };
  }, []);

  // pause the WebGL loop once the canvas is fully covered by opaque content
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const covered = el.scrollTop > window.innerHeight * 0.95 && k.current >= 1;
    if (covered !== useStore.getState().paused) useStore.setState({ paused: covered });
    portal.current?.style.setProperty('--veil', String(clamp(el.scrollTop / (window.innerHeight * 0.7))));
  };

  if (!shown) return null;
  const planet = shown.kind === 'planet' ? planetById(shown.id) : undefined;
  return (
    <div ref={portal} className={`portal portal-${shown.kind}`} style={{ ['--accent' as string]: planet?.color ?? '#e8b56a', visibility: 'hidden' }}>
      <div className="portal-bg" aria-hidden="true" />
      <div ref={scroller} className="portal-scroll" onScroll={onScroll} tabIndex={-1} id="content">
        <Content route={shown} />
      </div>
    </div>
  );
}

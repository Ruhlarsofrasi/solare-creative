import { useEffect } from 'react';
import gsap from 'gsap';
import { planets } from '../config/planets';
import { projectBySlug } from '../content/projects';
import { clamp } from '../lib/math';
import { bridge } from '../state/bridge';
import { useStore } from '../state/store';

let introTween: gsap.core.Tween | null = null;
let lockedUntil = 0;


/** Starts the opening pull-back (or skips it for deep links / reduced motion). */
export function startIntro() {
  const s = useStore.getState();
  if (s.introDone || introTween) return;
  if (s.route.kind !== 'home' || s.reducedMotion || !s.webgl) {
    bridge.intro = 1;
    useStore.setState({ introDone: true });
    return;
  }
  introTween = gsap.to(bridge, {
    intro: 1,
    duration: 8,
    ease: 'power2.inOut',
    onComplete: () => {
      introTween = null;
      useStore.setState({ introDone: true });
    },
  });
}

export function skipIntro() {
  if (introTween) introTween.timeScale(7);
  else if (bridge.intro < 1) {
    bridge.intro = 1;
    useStore.setState({ introDone: true });
  }
}

/**
 * Fly to a stop (0 = overview, 1..6 = planets).
 * The camera rig turns every stop change into one direct flight from wherever
 * the camera currently is — no passing through the stops in between — and a
 * new call mid-flight simply re-targets it.
 */
export function goToStop(stop: number) {
  const target = clamp(Math.round(stop), 0, planets.length);
  const s = useStore.getState();
  if (s.stop === target && bridge.progressTarget === target) return;
  lastDir = Math.sign(target - s.stop);
  lockedUntil = performance.now() + 900;
  bridge.progressTarget = target;
  bridge.progress = target;
  useStore.setState({ stop: target });
}

let lastDir = 0;

const currentStop = () => useStore.getState().stop;

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
};
const onUi = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.('a,button,input,textarea,select,[role="slider"],.portal,.menu');

/**
 * Wheel / touch / keyboard → journey.
 * The page itself never scrolls on the home orbit, so nothing is hijacked:
 * a deliberate gesture advances exactly one stop, and the camera takes its time.
 */
export function useJourneyInput() {
  useEffect(() => {
    const active = () => {
      const s = useStore.getState();
      return s.route.kind === 'home' && !s.menuOpen;
    };
    const step = (dir: number) => {
      // wheel inertia must not skip stops — but reversing direction always cancels the current flight
      if (performance.now() < lockedUntil && dir === lastDir) return;
      goToStop(currentStop() + dir);
    };

    let wheelSum = 0;
    let wheelTimer = 0;
    const wheel = (e: WheelEvent) => {
      if (!active() || (e.target as HTMLElement)?.closest?.('.menu,.portal')) return;
      e.preventDefault();
      if (bridge.intro < 1) return skipIntro();
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 400 : 1;
      wheelSum += clamp(e.deltaY * unit, -120, 120);
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => (wheelSum = 0), 220);
      if (Math.abs(wheelSum) >= 70) {
        step(Math.sign(wheelSum));
        wheelSum = 0;
      }
    };

    // touch: one vertical swipe = one stop
    let touch: { id: number; y: number; done: boolean } | null = null;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !active() || onUi(e.target) || bridge.dragging) return;
      if (bridge.intro < 1) return skipIntro();
      touch = { id: e.pointerId, y: e.clientY, done: false };
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') {
        bridge.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        bridge.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
        return;
      }
      if (!touch || e.pointerId !== touch.id || touch.done || bridge.dragging) return;
      const dy = touch.y - e.clientY;
      if (Math.abs(dy) > 46) {
        touch.done = true;
        step(Math.sign(dy));
      }
    };
    const upEnd = (e: PointerEvent) => {
      if (touch && e.pointerId === touch.id) touch = null;
    };

    const key = (e: KeyboardEvent) => {
      const s = useStore.getState();
      if (e.key === 'Escape') {
        if (s.menuOpen) return s.set({ menuOpen: false });
        if (s.route.kind === 'project') {
          const p = projectBySlug(s.route.slug);
          return s.back(p ? { kind: 'planet', id: p.planet } : { kind: 'home' });
        }
        if (s.route.kind !== 'home') return s.navigate({ kind: 'home' });
        return;
      }
      if (!active() || isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (bridge.intro < 1) {
        if (['ArrowDown', 'ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) skipIntro();
        return;
      }
      const cur = currentStop();
      const focusOnControl = onUi(document.activeElement) && document.activeElement !== document.body;
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          return goToStop(cur + 1);
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          return goToStop(cur - 1);
        case ' ':
          if (focusOnControl) return;
          e.preventDefault();
          return goToStop(cur + (e.shiftKey ? -1 : 1));
        case 'Home':
          return goToStop(0);
        case 'End':
          return goToStop(planets.length);
        case 'Enter':
          if (focusOnControl || cur < 1) return;
          return s.navigate({ kind: 'planet', id: planets[cur - 1].id });
      }
    };

    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', upEnd, { passive: true });
    window.addEventListener('pointercancel', upEnd, { passive: true });
    window.addEventListener('keydown', key);
    return () => {
      window.clearTimeout(wheelTimer);
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', upEnd);
      window.removeEventListener('pointercancel', upEnd);
      window.removeEventListener('keydown', key);
    };
  }, []);
}

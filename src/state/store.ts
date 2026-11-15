import { create } from 'zustand';
import gsap from 'gsap';
import type { Lang } from '../config/site';
import { planetIndex } from '../config/planets';
import { projectBySlug } from '../content/projects';
import { parsePath, pathFor, sameRoute, type Route } from '../lib/router';
import { detectTier, isMobileDevice, webglAvailable, type QualityPref, type Tier } from '../lib/quality';
import { bridge } from './bridge';

export type SecretId = 'flare' | 'alignment' | 'chime' | 'comet';
type MotionPref = 'system' | 'reduced' | 'full';

const ls = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode */
    }
  },
};

const systemReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const initial = parsePath(window.location.pathname);
const initialMotion = (ls.get('solare.motion') as MotionPref) || 'system';
const initialQuality = (ls.get('solare.quality') as QualityPref) || 'auto';
const detected = detectTier();

interface State {
  lang: Lang;
  route: Route;
  prevRoute: Route | null;
  /** In-app history depth — lets "close" use real back navigation when possible. */
  depth: number;
  ready: boolean;
  introDone: boolean;
  stop: number;
  hovered: string | null;
  menuOpen: boolean;
  sound: boolean;
  qualityPref: QualityPref;
  autoTier: Tier;
  tier: Tier;
  motionPref: MotionPref;
  reducedMotion: boolean;
  webgl: boolean;
  /** Render loop paused because the canvas is fully covered by content. */
  paused: boolean;
  mobile: boolean;
  secrets: SecretId[];
  toast: { id: number; text: SecretId } | null;

  navigate: (route: Route, opts?: { replace?: boolean; lang?: Lang }) => void;
  back: (fallback: Route) => void;
  syncFromLocation: () => void;
  setLang: (lang: Lang) => void;
  set: (partial: Partial<State>) => void;
  setQuality: (q: QualityPref) => void;
  degrade: () => void;
  setMotion: (m: MotionPref) => void;
  discover: (id: SecretId) => void;
}

const resolveTier = (pref: QualityPref, auto: Tier): Tier => (pref === 'auto' ? auto : pref);

/** When a route is entered, make the home journey rest at the matching stop. */
function alignJourney(route: Route) {
  let stop: number | null = null;
  if (route.kind === 'planet') stop = planetIndex(route.id) + 1;
  if (route.kind === 'project') {
    const p = projectBySlug(route.slug);
    if (p) stop = planetIndex(p.planet) + 1;
  }
  if (stop !== null) {
    gsap.killTweensOf(bridge, 'progressTarget');
    bridge.progress = stop;
    bridge.progressTarget = stop;
  }
  return stop;
}

export const useStore = create<State>((set, get) => ({
  lang: initial.lang,
  route: initial.route,
  prevRoute: null,
  depth: 0,
  ready: false,
  introDone: false,
  stop: alignJourney(initial.route) ?? 0,
  hovered: null,
  menuOpen: false,
  sound: false,
  qualityPref: initialQuality,
  autoTier: detected,
  tier: resolveTier(initialQuality, detected),
  motionPref: initialMotion,
  reducedMotion: initialMotion === 'reduced' || (initialMotion === 'system' && systemReduced()),
  webgl: webglAvailable(),
  paused: false,
  mobile: isMobileDevice(),
  secrets: [],
  toast: null,

  navigate: (route, opts) => {
    const s = get();
    const lang = opts?.lang ?? s.lang;
    if (sameRoute(route, s.route) && lang === s.lang) {
      set({ menuOpen: false });
      return;
    }
    const url = pathFor(route, lang);
    if (opts?.replace) window.history.replaceState({ depth: s.depth }, '', url);
    else window.history.pushState({ depth: s.depth + 1 }, '', url);
    const stop = alignJourney(route);
    set({
      route,
      lang,
      prevRoute: s.route,
      depth: opts?.replace ? s.depth : s.depth + 1,
      menuOpen: false,
      hovered: null,
      ...(stop !== null ? { stop } : {}),
    });
  },

  back: (fallback) => {
    if (get().depth > 0) window.history.back();
    else get().navigate(fallback);
  },

  syncFromLocation: () => {
    const s = get();
    const { lang, route } = parsePath(window.location.pathname);
    const depth = (window.history.state && window.history.state.depth) || 0;
    const stop = alignJourney(route);
    set({ lang, route, prevRoute: s.route, depth, menuOpen: false, hovered: null, ...(stop !== null ? { stop } : {}) });
  },

  setLang: (lang) => {
    const s = get();
    if (lang === s.lang) return;
    window.history.replaceState({ depth: s.depth }, '', pathFor(s.route, lang));
    set({ lang });
  },

  set: (partial) => set(partial),

  setQuality: (q) => {
    ls.set('solare.quality', q);
    set({ qualityPref: q, tier: resolveTier(q, get().autoTier) });
  },

  degrade: () => {
    const s = get();
    // a backgrounded tab throttles rendering — that is not a slow GPU
    if (s.qualityPref !== 'auto' || document.hidden || performance.now() - lastShown < 4000) return;
    const next: Tier = s.autoTier === 'high' ? 'med' : 'low';
    if (next !== s.autoTier) set({ autoTier: next, tier: next });
  },

  setMotion: (m) => {
    ls.set('solare.motion', m);
    set({ motionPref: m, reducedMotion: m === 'reduced' || (m === 'system' && systemReduced()) });
  },

  discover: (id) => {
    const s = get();
    const secrets = s.secrets.includes(id) ? s.secrets : [...s.secrets, id];
    set({ secrets, toast: { id: Date.now(), text: id } });
  },
}));

let lastShown = 0;
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) lastShown = performance.now();
  });
  window.addEventListener('focus', () => (lastShown = performance.now()));
  window.addEventListener('popstate', () => useStore.getState().syncFromLocation());
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => {
    const s = useStore.getState();
    s.setMotion(s.motionPref);
  });
  window.addEventListener('resize', () => {
    const mobile = isMobileDevice();
    if (mobile !== useStore.getState().mobile) useStore.setState({ mobile });
  });
}

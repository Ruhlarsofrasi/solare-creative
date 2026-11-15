import type { Lang } from '../config/site';
import { planetBySlug, planets, type PlanetId } from '../config/planets';
import { projectBySlug } from '../content/projects';

export type Route =
  | { kind: 'home' }
  | { kind: 'planet'; id: PlanetId }
  | { kind: 'project'; slug: string }
  | { kind: 'legal' }
  | { kind: 'notfound' };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** URL scheme: Turkish at the root ("/films"), English under "/en" ("/en/films"). */
export function parsePath(pathname: string): { lang: Lang; route: Route } {
  let path = pathname;
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
  const seg = path.split('/').filter(Boolean).map((s) => decodeURIComponent(s).toLowerCase());
  let lang: Lang = 'tr';
  if (seg[0] === 'en') {
    lang = 'en';
    seg.shift();
  } else if (seg[0] === 'tr') {
    seg.shift();
  }
  if (seg.length === 0 || (seg.length === 1 && seg[0] === 'index.html')) return { lang, route: { kind: 'home' } };
  if (seg.length === 1) {
    const planet = planetBySlug(seg[0]);
    if (planet) return { lang, route: { kind: 'planet', id: planet.id } };
    if (seg[0] === 'legal') return { lang, route: { kind: 'legal' } };
  }
  if (seg.length === 2 && seg[0] === 'work' && projectBySlug(seg[1])) {
    return { lang, route: { kind: 'project', slug: seg[1] } };
  }
  return { lang, route: { kind: 'notfound' } };
}

export function pathFor(route: Route, lang: Lang): string {
  const prefix = BASE + (lang === 'en' ? '/en' : '');
  switch (route.kind) {
    case 'home':
      return prefix + '/';
    case 'planet':
      return `${prefix}/${planets.find((p) => p.id === route.id)!.slug}`;
    case 'project':
      return `${prefix}/work/${route.slug}`;
    case 'legal':
      return `${prefix}/legal`;
    default:
      return prefix + '/';
  }
}

export const sameRoute = (a: Route | null, b: Route | null) => {
  if (!a || !b) return a === b;
  if (a.kind !== b.kind) return false;
  if (a.kind === 'planet' && b.kind === 'planet') return a.id === b.id;
  if (a.kind === 'project' && b.kind === 'project') return a.slug === b.slug;
  return true;
};

import { site, type Lang } from '../config/site';
import { planetById } from '../config/planets';
import { copy } from '../content/copy';
import { projectBySlug } from '../content/projects';
import { pathFor, type Route } from './router';

const setMeta = (selector: string, attr: string, value: string) => {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
};

/** Keeps <title>, description, canonical, hreflang and Open Graph in sync with the route. */
export function applySeo(route: Route, lang: Lang) {
  const c = copy[lang];
  let title = c.meta.title;
  let description = c.meta.description;

  if (route.kind === 'planet') {
    const p = planetById(route.id)!;
    title = `${p.name[lang]} — ${site.name}`;
    description =
      route.id === 'about' ? c.about.body[0] : route.id === 'contact' ? c.contact.lede : c.services[route.id].lede;
  } else if (route.kind === 'project') {
    const p = projectBySlug(route.slug)!;
    title = `${p.title} · ${p.category[lang]} — ${site.name}`;
    description = p.summary[lang];
  } else if (route.kind === 'legal') {
    title = `${c.legal.title} — ${site.name}`;
  } else if (route.kind === 'notfound') {
    title = `404 · ${c.notFound.title} — ${site.name}`;
  }

  document.title = title;
  document.documentElement.lang = lang;
  const url = site.url + pathFor(route, lang);
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[property="og:locale"]', 'content', lang === 'tr' ? 'tr_TR' : 'en_US');
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('link[rel="canonical"]', 'href', url);
  setMeta('link[hreflang="tr"]', 'href', site.url + pathFor(route, 'tr'));
  setMeta('link[hreflang="en"]', 'href', site.url + pathFor(route, 'en'));
  setMeta('meta[name="robots"]', 'content', route.kind === 'notfound' ? 'noindex' : 'index,follow');
}

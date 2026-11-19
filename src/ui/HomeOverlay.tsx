import { useEffect, useRef, useState } from 'react';
import { planets } from '../config/planets';
import { site } from '../config/site';
import { projectBySlug } from '../content/projects';
import { goToStop } from '../hooks/useJourneyInput';
import { bridge, toScreen } from '../state/bridge';
import { useStore } from '../state/store';
import { triggerAlignment } from '../scene/Secrets';
import { Arrow, LogoMark, RouteLink, useCopy } from './bits';
import { Magnetic } from './Magnetic';

const pt = { x: 0, y: 0 };

/** Labels that track planets / hovered screens in screen space. */
function Labels() {
  const lang = useStore((s) => s.lang);
  const c = useCopy();
  const hovered = useStore((s) => s.hovered);
  const stop = useStore((s) => s.stop);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const screenRef = useRef<HTMLDivElement>(null);
  const project = hovered?.startsWith('project:') ? projectBySlug(hovered.slice(8)) : undefined;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      planets.forEach((p, i) => {
        const el = refs.current[i];
        if (!el) return;
        const ok = toScreen(bridge.planetPos[p.id], pt);
        el.style.transform = `translate3d(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px,0)`;
        el.style.visibility = ok ? 'visible' : 'hidden';
      });
      const h = useStore.getState().hovered;
      const el = screenRef.current;
      if (el && h?.startsWith('project:')) {
        const info = bridge.screens[h.slice(8)];
        if (info && toScreen(info.center, pt)) el.style.transform = `translate3d(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px,0)`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="labels" aria-hidden="true">
      {planets.map((p, i) => (
        <div key={p.id} ref={(el) => (refs.current[i] = el)} className={`label ${hovered === p.id ? 'is-hover' : ''} ${stop === 0 ? 'is-map' : ''} ${stop === i + 1 ? 'is-here' : ''}`}>
          <span className="label-dot" />
          <span className="label-text">
            {p.name[lang]}
          </span>
        </div>
      ))}
      <div ref={screenRef} className={`label label-screen ${project ? 'is-hover' : ''}`}>
        {project && (
          <span className="label-text">
            <em>{project.category[lang]}</em>
            {project.title} <Arrow />
          </span>
        )}
      </div>
    </div>
  );
}

/** Everything that lives on top of the orbit: wordmark, stop captions, guided navigation. */
export function HomeOverlay() {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const route = useStore((s) => s.route);
  const stop = useStore((s) => s.stop);
  const introDone = useStore((s) => s.introDone);
  const ready = useStore((s) => s.ready);
  const mobile = useStore((s) => s.mobile);
  const secrets = useStore((s) => s.secrets);
  const webgl = useStore((s) => s.webgl);
  const [reveal, setReveal] = useState(false);
  const taps = useRef({ n: 0, t: 0 });

  // the wordmark arrives during the last third of the pull-back
  useEffect(() => {
    if (introDone) return setReveal(true);
    if (!ready) return;
    const id = window.setInterval(() => {
      if (bridge.intro > 0.62) {
        setReveal(true);
        window.clearInterval(id);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [ready, introDone]);

  const visible = route.kind === 'home';
  const planet = stop > 0 ? planets[stop - 1] : null;

  // secret: five quick taps on the wordmark summon the alignment (touch-friendly twin of typing "solare")
  const tapWordmark = () => {
    const now = performance.now();
    taps.current.n = now - taps.current.t < 600 ? taps.current.n + 1 : 1;
    taps.current.t = now;
    if (taps.current.n >= 5) {
      taps.current.n = 0;
      triggerAlignment();
    }
  };

  return (
    <div className={`home ${visible ? 'is-visible' : ''} ${reveal ? 'is-revealed' : ''}`} {...({ inert: visible ? undefined : '' } as object)}>
      {webgl && <Labels />}

      <section className={`hero ${stop === 0 ? 'is-active' : ''}`} aria-hidden={stop !== 0}>
        <p className="hero-kicker">{c.home.positioning}</p>
        <Magnetic as="h1" text="SOLARE" className="wordmark" glyphs={{ O: <LogoMark className="wordmark-mark" /> }} />
        <p className="hero-tagline">{c.home.tagline}</p>
        <p className="hero-sub">{c.home.sub}</p>
      </section>

      {planets.map((p, i) => (
        <section key={p.id} className={`caption ${stop === i + 1 ? 'is-active' : ''}`} aria-hidden={stop !== i + 1} style={{ ['--accent' as string]: p.color }}>
          <p className="caption-index">
            <span>{p.body[lang]}</span>
          </p>
          <Magnetic as="h2" text={p.name[lang]} className="caption-title" strength={0.5} />
          <p className="caption-tag">{p.tagline[lang]}</p>
          <RouteLink to={{ kind: 'planet', id: p.id }} className="btn btn-primary" tabIndex={stop === i + 1 ? 0 : -1}>
            {c.ui.enter} <Arrow />
          </RouteLink>
        </section>
      ))}

      <nav className="rail" aria-label={c.ui.destinations}>
        <button className="rail-arrow" onClick={() => goToStop(stop - 1)} disabled={stop === 0} aria-label={c.ui.prev}>
          <Arrow dir="up" />
        </button>
        <ol>
          <li>
            <button className={stop === 0 ? 'is-active' : ''} onClick={() => goToStop(0)} aria-current={stop === 0 ? 'step' : undefined} aria-label={`00 ${c.ui.overview}`}>
              <span className="rail-name">{c.ui.overview}</span>
              <span className="rail-dot rail-sun" />
            </button>
          </li>
          {planets.map((p, i) => (
            <li key={p.id}>
              <button className={stop === i + 1 ? 'is-active' : ''} onClick={() => goToStop(i + 1)} aria-current={stop === i + 1 ? 'step' : undefined} aria-label={`${p.index} ${p.name[lang]}`}>
                <span className="rail-name">{p.name[lang]}</span>
                <span className="rail-dot" />
              </button>
            </li>
          ))}
        </ol>
        <button className="rail-arrow" onClick={() => goToStop(stop + 1)} disabled={stop === planets.length} aria-label={c.ui.next}>
          <Arrow dir="down" />
        </button>
      </nav>

      <div className={`home-foot ${stop === 0 ? 'is-active' : ''}`}>
        <div className="home-foot-start">
          <p className="scroll-hint" aria-hidden="true">
            <span className="scroll-line" />
            {mobile ? c.ui.swipe : c.ui.scroll}
          </p>
          <p className="home-contact">
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            {site.contact.whatsapp && (
              <>
                {' · '}
                <a href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(c.contact.whatsappText)}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </>
            )}
            {' · '}
            <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </p>
        </div>
        <p className="home-legal">
          © {new Date().getFullYear()} {site.name} · {site.location[lang]} ·{' '}
          <RouteLink to={{ kind: 'legal' }} tabIndex={stop === 0 ? 0 : -1}>
            {c.ui.legal}
          </RouteLink>
          {secrets.length > 0 && (
            <span className="home-secrets">
              {' '}
              · {c.ui.discoveries} {secrets.length}/4
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/** Quiet confirmation when a secret is found. */
export function Toast() {
  const c = useCopy();
  const toast = useStore((s) => s.toast);
  const count = useStore((s) => s.secrets.length);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);
  return (
    <div className={`toast ${show ? 'is-on' : ''}`} role="status" aria-live="polite">
      {toast && (
        <>
          <span className="toast-star" aria-hidden="true">
            ✦
          </span>
          <span>
            {c.ui.discoveries} {count}/4 — {c.secrets[toast.text]}
          </span>
        </>
      )}
    </div>
  );
}

/** Branded loading screen — waits for the scene, never hangs. */
export function Loader() {
  const c = useCopy();
  const sceneReady = useStore((s) => s.ready);
  // deep links land on DOM content — no reason to hold them behind shader compilation
  const [early, setEarly] = useState(false);
  const ready = sceneReady || early;
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (useStore.getState().route.kind === 'home') return;
    const t = window.setTimeout(() => setEarly(true), 700);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    // failsafe: never trap the visitor behind the loader
    const t = window.setTimeout(() => !useStore.getState().ready && useStore.setState({ ready: true }), 9000);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setGone(true), 1600);
    return () => window.clearTimeout(t);
  }, [ready]);
  if (gone) return null;
  return (
    <div className={`loader ${ready ? 'is-done' : ''}`} role="status" aria-live="polite" aria-label={c.ui.loading}>
      <div className="loader-core">
        <svg className="loader-mark" viewBox="0 0 150.99 118.46" aria-hidden="true">
          <path fill="currentColor" d="m85.42,116.76C43.93,125.49,0,99.92,0,57.14h30.54c0,27.49,27.04,45.87,54.88,41.76,23.27-3.43,39.56-21.95,39.56-41.76h13.73c0,26.69-21.2,52.87-53.3,59.62Z" />
          <path fill="currentColor" d="m150.99,57.14h-12.27c0-18.7-14.45-36.04-34.91-39.05-24.19-3.57-47.4,13.67-47.4,39.05h-25.87C30.55,17.9,67.87-6.18,103.81,1.38c28.27,5.95,47.18,30.48,47.18,55.75Z" />
          <path fill="currentColor" d="m113.27,57.14c0,10.73-8.85,20.1-20.66,21-12.93.99-24.33-8.37-24.33-21s11.41-22,24.33-21c11.81.91,20.66,10.28,20.66,21Z" />
        </svg>
        <span className="loader-line" />
        <span className="loader-text">{c.ui.loading}</span>
      </div>
    </div>
  );
}

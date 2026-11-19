import { useEffect, useRef, useState } from 'react';
import { planets } from '../config/planets';
import { site } from '../config/site';
import { audio } from '../audio/AudioEngine';
import { pathFor } from '../lib/router';
import { goToStop, skipIntro } from '../hooks/useJourneyInput';
import { triggerEclipse } from '../scene/Secrets';
import { useStore } from '../state/store';
import { LogoMark, RouteLink, useCopy } from './bits';

const taps = { n: 0, t: 0 };

export function toggleSound() {
  const s = useStore.getState();
  const next = !s.sound;
  audio.setEnabled(next).then((ok) => useStore.setState({ sound: next && ok }));
}

/** Persistent chrome: home mark, language, sound, menu. */
export function Hud() {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const sound = useStore((s) => s.sound);
  const menuOpen = useStore((s) => s.menuOpen);
  const ready = useStore((s) => s.ready);
  const introDone = useStore((s) => s.introDone);
  const route = useStore((s) => s.route);
  const set = useStore((s) => s.set);
  const volume = useStore((s) => s.volume);
  const setVolume = useStore((s) => s.setVolume);
  const aligned = useStore((s) => s.aligned);
  const setAligned = useStore((s) => s.setAligned);

  useEffect(() => audio.setVolume(volume), [volume]);

  return (
    <header className={`hud ${ready ? 'is-ready' : ''}`}>
      <RouteLink
        to={{ kind: 'home' }}
        className="hud-logo"
        aria-label={`${site.name} — ${c.ui.home}`}
        onClick={() => {
          skipIntro();
          goToStop(0);
          // secret: five quick taps on the mark bring on the eclipse (touch twin of typing "solare")
          const now = performance.now();
          taps.n = now - taps.t < 600 ? taps.n + 1 : 1;
          taps.t = now;
          if (taps.n >= 5) {
            taps.n = 0;
            triggerEclipse();
          }
        }}
      >
        <LogoMark className="hud-mark" />
        <span className="hud-word">SOLARE</span>
      </RouteLink>

      <div className="hud-actions">
        {!introDone && ready && route.kind === 'home' && (
          <button className="hud-skip" onClick={skipIntro}>
            {c.ui.skipIntro}
          </button>
        )}
        <div className="lang" role="group" aria-label={c.ui.language}>
          {(['tr', 'en'] as const).map((l) => (
            <a
              key={l}
              href={pathFor(route, l)}
              hrefLang={l}
              lang={l}
              className={l === lang ? 'is-active' : ''}
              aria-current={l === lang ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                setLang(l);
              }}
            >
              {l.toUpperCase()}
            </a>
          ))}
        </div>
        {route.kind === 'home' && (
          <button
            type="button"
            role="switch"
            aria-checked={aligned}
            className={`switch ${aligned ? 'is-on' : ''}`}
            onClick={() => setAligned(!aligned)}
            title={c.ui.alignHint}
            aria-label={`${c.ui.align} — ${c.ui.alignHint}`}
          >
            <span className="switch-label">{c.ui.align}</span>
            <span className="switch-track" aria-hidden="true">
              <span className="switch-thumb" />
            </span>
          </button>
        )}
        <div className={`sound-wrap ${sound ? 'is-on' : ''}`}>
        <button className={`sound ${sound ? 'is-on' : ''}`} onClick={toggleSound} aria-pressed={sound} aria-label={sound ? c.ui.soundOff : c.ui.soundOn} title={sound ? c.ui.soundOff : c.ui.soundOn}>
          <span className="sound-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="sound-label">{c.ui.sound}</span>
        </button>
          <input
            type="range"
            className="volume"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label={c.ui.volume}
            tabIndex={sound ? 0 : -1}
            style={{ ['--v' as string]: `${Math.round(volume * 100)}%` }}
          />
        </div>
        <button className={`menu-btn ${menuOpen ? 'is-open' : ''}`} onClick={() => set({ menuOpen: !menuOpen })} aria-expanded={menuOpen} aria-controls="site-menu" aria-label={menuOpen ? c.ui.close : c.ui.menu}>
          <span className="menu-btn-label">{menuOpen ? c.ui.close : c.ui.menu}</span>
          <span className="menu-btn-icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </div>
    </header>
  );
}

/** Full-screen navigation: every destination, settings, contact shortcuts. */
export function Menu() {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const open = useStore((s) => s.menuOpen);
  const route = useStore((s) => s.route);
  const set = useStore((s) => s.set);
  const qualityPref = useStore((s) => s.qualityPref);
  const setQuality = useStore((s) => s.setQuality);
  const reduced = useStore((s) => s.reducedMotion);
  const setMotion = useStore((s) => s.setMotion);
  const sound = useStore((s) => s.sound);
  const tier = useStore((s) => s.tier);
  const panel = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>('a,button')?.focus(), 60);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setMounted(false), 700);
    return () => window.clearTimeout(t);
  }, [open]);

  // keep focus inside the dialog while it is open
  useEffect(() => {
    if (!open) return;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
      const btn = document.querySelector<HTMLElement>('.menu-btn');
      if (btn) items.push(btn);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', trap);
    return () => window.removeEventListener('keydown', trap);
  }, [open]);

  if (!mounted) return null;
  const wa = site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(c.contact.whatsappText)}` : '';

  return (
    <div id="site-menu" ref={panel} className={`menu ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label={c.ui.menu}>
      <div className="menu-inner">
        <nav className="menu-nav" aria-label={c.ui.destinations}>
          <p className="eyebrow">{c.ui.destinations}</p>
          <ul>
            <li style={{ ['--i' as string]: 0 }}>
              <RouteLink to={{ kind: 'home' }} className={route.kind === 'home' ? 'is-current' : ''} onClick={() => goToStop(0)}>
                <span className="menu-name">{c.ui.overview}</span>
              </RouteLink>
            </li>
            {planets.map((p, i) => (
              <li key={p.id} style={{ ['--i' as string]: i + 1 }}>
                <RouteLink to={{ kind: 'planet', id: p.id }} className={route.kind === 'planet' && route.id === p.id ? 'is-current' : ''}>
                  <span className="menu-name">{p.name[lang]}</span>
                  <span className="menu-tag">{p.tagline[lang]}</span>
                </RouteLink>
              </li>
            ))}
          </ul>
        </nav>

        <aside className="menu-side">
          <div className="menu-block">
            <p className="eyebrow">{c.contact.eyebrow}</p>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer">
                WhatsApp · {site.contact.whatsappDisplay}
              </a>
            )}
            <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer">
              Instagram · {site.contact.instagramHandle}
            </a>
            <span className="muted">{site.location[lang]}</span>
          </div>

          <div className="menu-block">
            <p className="eyebrow">{c.ui.sound}</p>
            <div className="seg" role="group" aria-label={c.ui.sound}>
              <button className={sound ? 'is-active' : ''} aria-pressed={sound} onClick={() => !sound && toggleSound()}>
                On
              </button>
              <button className={!sound ? 'is-active' : ''} aria-pressed={!sound} onClick={() => sound && toggleSound()}>
                Off
              </button>
            </div>
          </div>

          <div className="menu-block">
            <p className="eyebrow">
              {c.ui.quality} <span className="muted">· {tier}</span>
            </p>
            <div className="seg" role="group" aria-label={c.ui.quality}>
              {(['auto', 'high', 'low'] as const).map((q) => (
                <button key={q} className={qualityPref === q ? 'is-active' : ''} aria-pressed={qualityPref === q} onClick={() => setQuality(q)}>
                  {q === 'auto' ? c.ui.qualityAuto : q === 'high' ? c.ui.qualityHigh : c.ui.qualityLow}
                </button>
              ))}
            </div>
          </div>

          <div className="menu-block">
            <p className="eyebrow">{c.ui.motion}</p>
            <div className="seg" role="group" aria-label={c.ui.motion}>
              <button className={!reduced ? 'is-active' : ''} aria-pressed={!reduced} onClick={() => setMotion('full')}>
                {c.ui.motionFull}
              </button>
              <button className={reduced ? 'is-active' : ''} aria-pressed={reduced} onClick={() => setMotion('reduced')}>
                {c.ui.motionReduced}
              </button>
            </div>
          </div>

          <RouteLink to={{ kind: 'legal' }} className="menu-legal" onClick={() => set({ menuOpen: false })}>
            {c.ui.legal}
          </RouteLink>
        </aside>
      </div>
    </div>
  );
}

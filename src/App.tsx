import { useEffect } from 'react';
import { initAnalytics, trackPage } from './lib/analytics';
import { pathFor } from './lib/router';
import { applySeo } from './lib/seo';
import { startIntro, useJourneyInput } from './hooks/useJourneyInput';
import { Experience } from './scene/Experience';
import { useStore } from './state/store';
import { useCopy } from './ui/bits';
import { HomeOverlay, Loader, Toast } from './ui/HomeOverlay';
import { Hud, Menu } from './ui/Hud';
import { Stage } from './ui/Stage';

/** Static backdrop used when WebGL is unavailable — content stays fully usable. */
function Fallback() {
  const c = useCopy();
  return (
    <div className="stage stage-fallback">
      <div className="fallback-sun" aria-hidden="true" />
      <p className="fallback-note" role="status">
        <strong>{c.ui.webglTitle}</strong>
        <span>{c.ui.webglText}</span>
      </p>
    </div>
  );
}

export default function App() {
  const c = useCopy();
  const webgl = useStore((s) => s.webgl);
  const ready = useStore((s) => s.ready);
  const route = useStore((s) => s.route);
  const lang = useStore((s) => s.lang);
  const reduced = useStore((s) => s.reducedMotion);
  const tier = useStore((s) => s.tier);

  useJourneyInput();

  useEffect(() => {
    initAnalytics();
    if (!useStore.getState().webgl) useStore.setState({ ready: true });
  }, []);

  useEffect(() => {
    if (ready) startIntro();
  }, [ready]);

  useEffect(() => {
    applySeo(route, lang);
    trackPage(pathFor(route, lang));
  }, [route, lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduced-motion', reduced);
    root.dataset.tier = tier;
    root.dataset.route = route.kind;
  }, [reduced, tier, route.kind]);

  return (
    <>
      <a className="skip" href="#main">
        {c.ui.skip}
      </a>
      {webgl ? <Experience /> : <Fallback />}
      <Hud />
      <div id="main" tabIndex={-1}>
        <HomeOverlay />
        <Stage />
      </div>
      <Menu />
      <Toast />
      <Loader />
    </>
  );
}

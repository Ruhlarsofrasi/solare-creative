import { goToStop } from '../../hooks/useJourneyInput';
import { Arrow, Reveal, RouteLink, useCopy } from '../bits';
import { Magnetic } from '../Magnetic';
import { Footer } from './shared';

export function LegalPage() {
  const c = useCopy();
  return (
    <main className="page page-legal">
      <header className="page-hero">
        <RouteLink to={{ kind: 'home' }} className="back">
          <Arrow dir="left" /> {c.ui.back}
        </RouteLink>
        <div className="page-hero-body">
          <h1 className="page-title">{c.legal.title}</h1>
          <p className="note note-boxed">{c.legal.note}</p>
        </div>
      </header>
      {c.legal.sections.map((s) => (
        <Reveal as="section" className="section split" key={s.title}>
          <h2 className="section-title small split-aside">{s.title}</h2>
          <div className="split-main prose">
            {s.text.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      ))}
      <Footer />
    </main>
  );
}

/** Branded 404 — lost in orbit. */
export function NotFoundPage() {
  const c = useCopy();
  return (
    <main className="page page-404">
      <div className="lost">
        {/* the "0" of 404 is a total solar eclipse */}
        <p className="lost-code" aria-hidden="true">
          <span>4</span>
          <span className="eclipse">
            <i className="eclipse-rays" />
            <i className="eclipse-corona" />
            <i className="eclipse-disc" />
            <i className="eclipse-bead" />
          </span>
          <span>4</span>
        </p>
        <Magnetic as="h1" text={c.notFound.title} className="page-title" strength={0.5} />
        <p className="page-lede">{c.notFound.text}</p>
        <RouteLink to={{ kind: 'home' }} className="btn btn-primary" onClick={() => goToStop(0)}>
          {c.notFound.cta} <Arrow />
        </RouteLink>
      </div>
    </main>
  );
}

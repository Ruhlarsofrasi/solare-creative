import { planetById } from '../../config/planets';
import { projectsOf } from '../../content/projects';
import { useStore } from '../../state/store';
import { Arrow, Reveal, RouteLink, useCopy } from '../bits';
import { Footer, NextDestination, PageHero, ProjectCard } from './shared';

type ServiceId = 'films' | 'architecture' | 'social' | 'ai-motion';

/** Destinations 01–04: a service, what it includes, and its portfolio. */
export function ServicePage({ id }: { id: ServiceId }) {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const planet = planetById(id)!;
  const s = c.services[id];
  const work = projectsOf(id);

  return (
    <main className="page">
      <PageHero planet={planet} eyebrow={s.eyebrow} title={planet.name[lang]} lede={s.lede} />

      <section className="section split">
        <Reveal className="split-aside">
          <p className="eyebrow">{planet.tagline[lang]}</p>
        </Reveal>
        <div className="split-main prose">
          {s.body.map((p, i) => (
            <Reveal key={i} delay={i * 90}>
              <p className={i === 0 ? 'lead' : ''}>{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby={`${id}-cap`}>
        <Reveal>
          <h2 id={`${id}-cap`} className="section-title">
            {s.capabilitiesTitle}
          </h2>
        </Reveal>
        <ol className="caps">
          {s.capabilities.map((cap, i) => (
            <Reveal as="li" key={cap.title} className="cap" delay={i * 70}>
              <h3>{cap.title}</h3>
              <p>{cap.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby={`${id}-work`}>
        <Reveal className="section-head">
          <h2 id={`${id}-work`} className="section-title">
            {s.workTitle}
          </h2>
          <p className="note">{s.workNote}</p>
        </Reveal>
        <ul className="cards">
          {work.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </ul>
      </section>

      <section className="section split" aria-labelledby={`${id}-del`}>
        <Reveal className="split-aside">
          <h2 id={`${id}-del`} className="section-title small">
            {s.deliverablesTitle}
          </h2>
        </Reveal>
        <ul className="split-main list">
          {s.deliverables.map((d, i) => (
            <Reveal as="li" key={d} delay={i * 60}>
              {d}
            </Reveal>
          ))}
        </ul>
      </section>

      <Reveal as="section" className="cta-band">
        <p className="cta-text">{c.contact.title}</p>
        <RouteLink to={{ kind: 'planet', id: 'contact' }} className="btn btn-primary">
          {c.about.cta} <Arrow />
        </RouteLink>
      </Reveal>

      <NextDestination current={planet} />
      <Footer />
    </main>
  );
}

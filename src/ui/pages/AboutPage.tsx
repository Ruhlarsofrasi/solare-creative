import { planetById } from '../../config/planets';
import { site } from '../../config/site';
import { useStore } from '../../state/store';
import { Arrow, Reveal, RouteLink, useCopy } from '../bits';
import { Footer, NextDestination, PageHero } from './shared';

/** Destination 05: studio identity, philosophy, process and services. */
export function AboutPage() {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const planet = planetById('about')!;
  const a = c.about;

  return (
    <main className="page">
      <PageHero planet={planet} eyebrow={a.eyebrow} title={planet.name[lang]} lede={a.lede} />

      <section className="section quote-section">
        <Reveal>
          <blockquote className="quote">
            <p>“{a.quote}”</p>
          </blockquote>
        </Reveal>
      </section>

      <section className="section split">
        <Reveal className="split-aside">
          <p className="eyebrow">{site.location[lang]}</p>
          <figure className="about-figure">
            <img src="/media/about-lounge.webp" alt="" loading="lazy" decoding="async" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </figure>
        </Reveal>
        <div className="split-main prose">
          {a.body.map((p, i) => (
            <Reveal key={i} delay={i * 90}>
              <p className={i === 0 ? 'lead' : ''}>{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="about-pillars">
        <Reveal>
          <h2 id="about-pillars" className="section-title">
            {a.pillarsTitle}
          </h2>
        </Reveal>
        <ul className="pillars">
          {a.pillars.map((p, i) => (
            <Reveal as="li" key={p.title} className="pillar" delay={i * 80}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="about-process">
        <Reveal className="section-head">
          <h2 id="about-process" className="section-title">
            {a.processTitle}
          </h2>
          <p className="note">{a.processLede}</p>
        </Reveal>
        <ol className="process">
          {a.process.map((p, i) => (
            <Reveal as="li" key={p.title} className="process-step" delay={i * 90}>
              <span className="process-orbit" aria-hidden="true" />
              <span className="cap-index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby="about-services">
        <Reveal className="section-head">
          <h2 id="about-services" className="section-title">
            {a.servicesTitle}
          </h2>
          <p className="note">{a.servicesLede}</p>
        </Reveal>
        <ul className="services">
          {a.serviceCards.map((s, i) => {
            const p = planetById(s.planet)!;
            return (
              <Reveal as="li" key={s.planet} delay={i * 70}>
                <RouteLink to={{ kind: 'planet', id: s.planet }} className="service" style={{ ['--accent' as string]: p.color }}>
                  <span className="service-title">{s.title}</span>
                  <span className="service-text">{s.text}</span>
                  <Arrow />
                </RouteLink>
              </Reveal>
            );
          })}
        </ul>
      </section>

      <Reveal as="section" className="cta-band">
        <p className="cta-text">{c.contact.title}</p>
        <RouteLink to={{ kind: 'planet', id: 'contact' }} className="btn btn-primary">
          {a.cta} <Arrow />
        </RouteLink>
      </Reveal>

      <NextDestination current={planet} />
      <Footer />
    </main>
  );
}

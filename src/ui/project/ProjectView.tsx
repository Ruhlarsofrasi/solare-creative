import { useState } from 'react';
import { planetById } from '../../config/planets';
import { projectBySlug, projects } from '../../content/projects';
import { useStore } from '../../state/store';
import { Arrow, Reveal, RouteLink, useCopy } from '../bits';
import { Magnetic } from '../Magnetic';
import { Footer, Poster } from '../pages/shared';
import { Player } from './Player';

function Still({ src }: { src: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <li>
      <img src={src} alt="" loading="lazy" decoding="async" onError={() => setOk(false)} />
    </li>
  );
}

/** Full-screen project experience the billboards cut into. */
export function ProjectView({ slug }: { slug: string }) {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const back = useStore((s) => s.back);
  const project = projectBySlug(slug)!;
  const planet = planetById(project.planet)!;
  const i = projects.indexOf(project);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const t = c.project;

  return (
    <main className={`page page-project format-${project.format}`} style={{ ['--accent' as string]: planet.color }}>
      <section className="pv-stage" aria-label={project.title}>
        <Player project={project} />
        <div className="pv-top">
          <button type="button" className="back" onClick={() => back({ kind: 'planet', id: project.planet })} aria-label={t.close}>
            <Arrow dir="left" /> {c.ui.backTo}
          </button>
          <p className="pv-crumb">
            <RouteLink to={{ kind: 'planet', id: project.planet }}>
              {planet.name[lang]}
            </RouteLink>
          </p>
        </div>
        <div className="pv-heading">
          <p className="eyebrow">
            {project.category[lang]}
            {project.demo && <span className="tag tag-demo">{t.demoBadge}</span>}
          </p>
          <Magnetic as="h1" text={project.title} className="pv-title" strength={0.4} />
        </div>
      </section>

      <section className="section pv-info">
        <Reveal className="pv-text prose">
          <p className="lead">{project.summary[lang]}</p>
          <p>{project.description[lang]}</p>
          {project.demo && !project.video && <p className="note note-boxed">{t.demoExplain}</p>}
        </Reveal>
        <Reveal className="pv-meta" delay={100}>
          <dl>
            <div>
              <dt>{t.category}</dt>
              <dd>{project.category[lang]}</dd>
            </div>
            {project.location && (
              <div>
                <dt>{t.location}</dt>
                <dd>{project.location[lang]}</dd>
              </div>
            )}
            <div>
              <dt>{t.destination}</dt>
              <dd>
                <RouteLink to={{ kind: 'planet', id: project.planet }}>{planet.name[lang]}</RouteLink>
              </dd>
            </div>
            <div>
              <dt>{t.scope}</dt>
              <dd>
                <ul>
                  {project.scope[lang].map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </Reveal>
      </section>

      {project.gallery && project.gallery.length > 0 && (
        <section className="section" aria-label={t.gallery}>
          <h2 className="section-title small">{t.gallery}</h2>
          <ul className="stills">
            {project.gallery.map((src) => (
              <Still key={src} src={src} />
            ))}
          </ul>
        </section>
      )}

      <nav className="pv-nav" aria-label={`${t.prev} / ${t.next}`}>
        {[
          { p: prev, label: t.prev, dir: 'left' as const },
          { p: next, label: t.next, dir: 'right' as const },
        ].map(({ p, label, dir }) => (
          <RouteLink key={dir} to={{ kind: 'project', slug: p.slug }} className={`pv-nav-link pv-nav-${dir}`}>
            <Poster project={p} />
            <span className="pv-nav-text">
              <span className="eyebrow">
                {dir === 'left' && <Arrow dir="left" />} {label} {dir === 'right' && <Arrow />}
              </span>
              <span className="pv-nav-title">{p.title}</span>
              <span className="muted">{p.category[lang]}</span>
            </span>
          </RouteLink>
        ))}
      </nav>

      <Reveal as="section" className="cta-band">
        <p className="cta-text">{t.discuss}</p>
        <RouteLink to={{ kind: 'planet', id: 'contact' }} className="btn btn-primary">
          {c.about.cta} <Arrow />
        </RouteLink>
      </Reveal>
      <Footer />
    </main>
  );
}

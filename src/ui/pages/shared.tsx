import { useState, type ReactNode } from 'react';
import { planetIndex, planets, type PlanetConfig } from '../../config/planets';
import { site } from '../../config/site';
import { projectSeed, type Project } from '../../content/projects';
import { useStore } from '../../state/store';
import { Arrow, LogoMark, Reveal, RouteLink, useCopy } from '../bits';
import { Magnetic } from '../Magnetic';

/** Top of every destination: return control, index, magnetic title, lede. */
export function PageHero({ planet, eyebrow, title, lede, children }: { planet: PlanetConfig; eyebrow: string; title: string; lede: string; children?: ReactNode }) {
  const c = useCopy();
  return (
    <header className="page-hero">
      <RouteLink to={{ kind: 'home' }} className="back">
        <Arrow dir="left" /> {c.ui.back}
      </RouteLink>
      <div className="page-hero-body">
        <p className="eyebrow">
          {eyebrow}
        </p>
        <Magnetic as="h1" text={title} className="page-title" strength={0.45} />
        <p className="page-lede">{lede}</p>
        {children}
      </div>
    </header>
  );
}

/** Poster for a project: the real still when provided, otherwise a labelled procedural plate. */
export function Poster({ project, className = '' }: { project: Project; className?: string }) {
  const [failed, setFailed] = useState(false);
  const [a, b, c] = project.palette;
  const seed = projectSeed(project.slug);
  if (project.poster && !failed) {
    return <img className={`poster ${className}`} src={project.poster} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />;
  }
  return (
    <div
      className={`poster poster-demo ${className}`}
      aria-hidden="true"
      style={{
        background: `radial-gradient(circle at ${30 + seed * 45}% ${52 - seed * 14}%, ${a} 0, ${a}00 7%), radial-gradient(circle at ${30 + seed * 45}% ${52 - seed * 14}%, ${a}cc 0, ${a}00 34%), linear-gradient(to top, ${c} 0%, ${c} 38%, ${b} 39%, ${b}dd 50%, ${c} 100%)`,
      }}
    >
      <span className="poster-grain" />
    </div>
  );
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const lang = useStore((s) => s.lang);
  const c = useCopy();
  return (
    <Reveal as="li" className={`card card-${project.format}`} delay={index * 80}>
      <RouteLink to={{ kind: 'project', slug: project.slug }} className="card-link" aria-label={`${project.title} — ${project.category[lang]}${project.demo ? ` (${c.project.demoBadge})` : ''}`}>
        <div className="card-media">
          <Poster project={project} />
          {project.demo && <span className="tag tag-demo">{c.ui.demo}</span>}
          <span className="card-cta">
            {c.ui.viewProject} <Arrow />
          </span>
        </div>
        <div className="card-info">
          <p className="card-cat">{project.category[lang]}</p>
          <h3 className="card-title">{project.title}</h3>
          <p className="card-sum">{project.summary[lang]}</p>
        </div>
      </RouteLink>
    </Reveal>
  );
}

/** The page ends by pointing at its neighbours: previous destination and next destination. */
export function NextDestination({ current }: { current: PlanetConfig }) {
  const lang = useStore((s) => s.lang);
  const c = useCopy();
  const i = planetIndex(current.id);
  const next = planets[(i + 1) % planets.length];
  const prev = planets[(i - 1 + planets.length) % planets.length];
  return (
    <Reveal className="next">
      <RouteLink to={{ kind: 'planet', id: prev.id }} className="next-link next-prev" style={{ ['--accent' as string]: prev.color }}>
        <span className="eyebrow">{c.ui.prev}</span>
        <Arrow dir="left" />
        <span className="next-title">{prev.name[lang]}</span>
        <span className="next-orb" aria-hidden="true" />
      </RouteLink>
      <RouteLink to={{ kind: 'planet', id: next.id }} className="next-link next-next" style={{ ['--accent' as string]: next.color }}>
        <span className="eyebrow">{c.ui.next}</span>
        <span className="next-title">{next.name[lang]}</span>
        <span className="next-orb" aria-hidden="true" />
        <Arrow />
      </RouteLink>
    </Reveal>
  );
}

export function Footer() {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const wa = site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(c.contact.whatsappText)}` : '';
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <LogoMark className="footer-mark" />
          <p className="footer-name">Solare Creative</p>
          <p className="muted">{c.ui.studio}</p>
        </div>
        <nav className="footer-col" aria-label={c.ui.destinations}>
          <p className="eyebrow">{c.ui.destinations}</p>
          <RouteLink to={{ kind: 'home' }}>{c.ui.overview}</RouteLink>
          {planets.map((p) => (
            <RouteLink key={p.id} to={{ kind: 'planet', id: p.id }}>
              {p.name[lang]}
            </RouteLink>
          ))}
        </nav>
        <div className="footer-col">
          <p className="eyebrow">{c.contact.eyebrow}</p>
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
          <a href={site.contact.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <span className="muted">{site.location[lang]}</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {site.name}. {c.ui.rights}
        </p>
        <RouteLink to={{ kind: 'legal' }}>{c.ui.legal}</RouteLink>
      </div>
    </footer>
  );
}

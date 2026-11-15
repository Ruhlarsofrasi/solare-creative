import { useEffect, useRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { pathFor, type Route } from '../lib/router';
import { useStore } from '../state/store';
import { copy } from '../content/copy';

/** Hook: current language's copy. */
export const useCopy = () => copy[useStore((s) => s.lang)];

/** Solare mark — paths taken from the brand's own logo file. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 150.99 118.46" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="m85.42,116.76C43.93,125.49,0,99.92,0,57.14h30.54c0,27.49,27.04,45.87,54.88,41.76,23.27-3.43,39.56-21.95,39.56-41.76h13.73c0,26.69-21.2,52.87-53.3,59.62Z"
      />
      <path
        fill="currentColor"
        d="m150.99,57.14h-12.27c0-18.7-14.45-36.04-34.91-39.05-24.19-3.57-47.4,13.67-47.4,39.05h-25.87C30.55,17.9,67.87-6.18,103.81,1.38c28.27,5.95,47.18,30.48,47.18,55.75Z"
      />
      <path fill="currentColor" d="m113.27,57.14c0,10.73-8.85,20.1-20.66,21-12.93.99-24.33-8.37-24.33-21s11.41-22,24.33-21c11.81.91,20.66,10.28,20.66,21Z" />
    </svg>
  );
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: Route;
  children: ReactNode;
}

/** In-app link: a real <a href> (crawlable, middle-clickable) that navigates without reload. */
export function RouteLink({ to, children, onClick, ...rest }: LinkProps) {
  const lang = useStore((s) => s.lang);
  const navigate = useStore((s) => s.navigate);
  return (
    <a
      {...rest}
      href={pathFor(to, lang)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

/** Fades content up when it scrolls into view. */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' | 'article' }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            el.classList.add('in');
            io.disconnect();
          }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const T = Tag as 'div';
  return (
    <T ref={ref as React.RefObject<HTMLDivElement>} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </T>
  );
}

export const Arrow = ({ dir = 'right' }: { dir?: 'right' | 'left' | 'up' | 'down' | 'out' }) => (
  <svg className={`arrow arrow-${dir}`} viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
    <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

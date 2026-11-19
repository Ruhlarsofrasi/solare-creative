import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { useStore } from '../state/store';

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  /** 1 = wordmark-level response, lower for body headlines. */
  strength?: number;
  id?: string;
  onClick?: () => void;
  /** Replace a character with a custom glyph (e.g. the brand mark standing in for a letter). */
  glyphs?: Record<string, ReactNode>;
}

interface Body {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  vr: number;
}

/** Magnetic letters are switched off for now. Set to true to bring the effect back. */
const MAGNETIC_ENABLED = false;

const pointer = { x: -9999, y: -9999, active: false };
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => (pointer.active = false));
}

/**
 * Magnetic typography: every glyph is a small spring-mass body that leans
 * toward the pointer and settles back with a slight overshoot.
 * Screen readers get the plain text; the per-letter spans are aria-hidden.
 */
export function Magnetic({ text, as: Tag = 'span', className, strength = 1, id, onClick, glyphs }: Props) {
  const root = useRef<HTMLElement>(null);
  const reduced = useStore((s) => s.reducedMotion);

  useEffect(() => {
    const el = root.current;
    if (!MAGNETIC_ENABLED || !el || reduced || window.matchMedia('(pointer: coarse)').matches) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>('[data-m]'));
    const bodies: Body[] = spans.map(() => ({ x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0 }));
    let raf = 0;
    let last = performance.now();
    let resting = true;

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      if (!el.offsetParent) return;
      const box = el.getBoundingClientRect();
      const reach = Math.max(box.height * 1.25, 90);
      const near =
        pointer.active && pointer.x > box.left - reach && pointer.x < box.right + reach && pointer.y > box.top - reach && pointer.y < box.bottom + reach;
      if (!near && resting) return;
      resting = true;
      // read phase
      const rects = spans.map((s) => s.getBoundingClientRect());
      // write phase
      for (let i = 0; i < spans.length; i++) {
        const b = bodies[i];
        const rc = rects[i];
        const cx = rc.left + rc.width / 2 - b.x;
        const cy = rc.top + rc.height / 2 - b.y;
        let tx = 0;
        let ty = 0;
        let tr = 0;
        if (near) {
          const dx = pointer.x - cx;
          const dy = pointer.y - cy;
          const d = Math.hypot(dx, dy);
          if (d < reach) {
            const f = Math.pow(1 - d / reach, 2) * strength;
            tx = dx * f * 0.42;
            ty = dy * f * 0.42;
            tr = (dx / reach) * f * 14;
          }
        }
        const k = 150;
        const c = 12;
        b.vx += ((tx - b.x) * k - b.vx * c) * dt;
        b.vy += ((ty - b.y) * k - b.vy * c) * dt;
        b.vr += ((tr - b.r) * k - b.vr * c) * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.r += b.vr * dt;
        if (Math.abs(b.x) + Math.abs(b.y) + Math.abs(b.r) + Math.abs(b.vx) + Math.abs(b.vy) > 0.02) resting = false;
        spans[i].style.transform = `translate3d(${b.x.toFixed(2)}px,${b.y.toFixed(2)}px,0) rotate(${b.r.toFixed(2)}deg)`;
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      spans.forEach((s) => (s.style.transform = ''));
    };
  }, [text, reduced, strength]);

  return (
    <Tag ref={root} id={id} className={`magnetic ${className ?? ''}`} aria-label={text} onClick={onClick}>
      {text.split(' ').map((word, w, all) => (
        <span key={w} aria-hidden="true" className="magnetic-word">
          {Array.from(word).map((ch, i) => (
            <span key={i} data-m className={`magnetic-letter ${glyphs?.[ch] ? 'magnetic-glyph' : ''}`}>
              {glyphs?.[ch] ?? ch}
            </span>
          ))}
          {w < all.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

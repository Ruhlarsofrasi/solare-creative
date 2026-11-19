import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { planetById } from '../../config/planets';
import { galleryFull, galleryItems, galleryPoster, galleryThumb, type GalleryItem } from '../../content/gallery';
import { useStore } from '../../state/store';
import { Arrow, useCopy } from '../bits';
import { Footer, NextDestination, PageHero } from './shared';

/** A grid video that only downloads and plays while it is on screen. */
function GridVideo({ item, label }: { item: GalleryItem; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={galleryFull(item)} poster={galleryThumb(item)} muted loop playsInline preload="none" aria-label={label} />;
}

/** Full-screen viewer: arrows, keyboard, swipe; Esc closes it (and only it). */
function Lightbox({ index, onClose, onNav }: { index: number; onClose: () => void; onNav: (i: number) => void }) {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const item = galleryItems[index];
  const n = galleryItems.length;
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = useCallback((d: number) => onNav((index + d + n) % n), [index, n, onNav]);

  useEffect(() => setLoaded(false), [index]);
  useEffect(() => {
    // neighbours ready before they are asked for
    for (const d of [1, -1]) {
      const it = galleryItems[(index + d + n) % n];
      if (it.kind === 'image') new Image().src = galleryFull(it);
    }
  }, [index, n]);
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => {
      // captured first so the site's own Esc / arrow handling never sees these
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('keydown', key, true);
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', key, true);
      html.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [go, onClose]);

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={c.gallery.title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const t = touch.current;
        touch.current = null;
        if (!t) return;
        const dx = e.changedTouches[0].clientX - t.x;
        const dy = e.changedTouches[0].clientY - t.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        else if (dy > 90) onClose();
      }}
    >
      <figure className="lightbox-figure" key={item.id}>
        {item.kind === 'video' ? (
          <video src={galleryFull(item)} poster={galleryPoster(item)} autoPlay muted loop playsInline controls aria-label={item.alt[lang]} />
        ) : (
          <>
            <img className={`lightbox-thumb ${loaded ? 'is-hidden' : ''}`} src={galleryThumb(item)} alt="" aria-hidden="true" />
            <img className={`lightbox-full ${loaded ? 'is-loaded' : ''}`} src={galleryFull(item)} alt={item.alt[lang]} onLoad={() => setLoaded(true)} />
          </>
        )}
        <figcaption>
          <span>{item.alt[lang]}</span>
          <span className="lightbox-count">
            {c.gallery.counter} {index + 1} / {n}
          </span>
        </figcaption>
      </figure>
      <button type="button" className="lightbox-btn lightbox-prev" onClick={() => go(-1)} aria-label={c.gallery.prev}>
        <Arrow dir="left" />
      </button>
      <button type="button" className="lightbox-btn lightbox-next" onClick={() => go(1)} aria-label={c.gallery.next}>
        <Arrow />
      </button>
      <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose}>
        {c.gallery.close}
      </button>
    </div>,
    document.body,
  );
}

/** Destination 07: the gallery. */
export function GalleryPage() {
  const c = useCopy();
  const lang = useStore((s) => s.lang);
  const planet = planetById('gallery')!;
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <main className="page page-gallery">
      <PageHero planet={planet} eyebrow={c.gallery.eyebrow} title={planet.name[lang]} lede={c.gallery.lede} />

      <section className="section gallery-section" aria-label={c.gallery.title}>
        <ul className="gallery-grid">
          {galleryItems.map((it, i) => (
            <li key={it.id} className="gallery-cell" style={{ aspectRatio: `${it.w} / ${it.h}` }}>
              <button type="button" className="gallery-item" onClick={() => setOpen(i)} aria-label={`${c.gallery.open}: ${it.alt[lang]}`}>
                {it.kind === 'video' ? (
                  <>
                    <GridVideo item={it} label={it.alt[lang]} />
                    <span className="gallery-tag">{c.gallery.video}</span>
                  </>
                ) : (
                  <img src={galleryThumb(it)} alt={it.alt[lang]} width={800} height={Math.round((800 * it.h) / it.w)} loading="lazy" decoding="async" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <NextDestination current={planet} />
      <Footer />
      {open !== null && <Lightbox index={open} onClose={close} onNav={setOpen} />}
    </main>
  );
}

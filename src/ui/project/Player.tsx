import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Project } from '../../content/projects';
import { audio } from '../../audio/AudioEngine';
import { clamp } from '../../lib/math';
import { useStore } from '../../state/store';
import { useCopy } from '../bits';
import { ProceduralReel } from './ProceduralReel';

const REEL_DURATION = 48;
const fmt = (s: number) => {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

/**
 * Project media player.
 *  • Real film (project.video): native <video> with custom transport,
 *    drag-to-scrub and a frame-accurate hover preview.
 *  • No film yet / load error: the procedural light study with the same
 *    transport, clearly labelled as a demo visual.
 * Project audio takes priority: ambience is ducked while a film plays unmuted.
 */
export function Player({ project }: { project: Project }) {
  const c = useCopy();
  const reduced = useStore((s) => s.reducedMotion);
  const hasVideo = !!project.video;
  const [mode, setMode] = useState<'video' | 'reel' | 'still'>(hasVideo ? 'video' : project.poster ? 'still' : 'reel');
  const [mediaError, setMediaError] = useState(false);
  const [playing, setPlaying] = useState(!reduced);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(hasVideo ? 0 : REEL_DURATION);
  const [hover, setHover] = useState<{ t: number; x: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const preview = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const reelTime = useRef(0);
  const hoverTime = useRef(0);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  // reset when the project changes
  useEffect(() => {
    setMode(project.video ? 'video' : project.poster ? 'still' : 'reel');
    setMediaError(false);
    setTime(0);
    reelTime.current = 0;
    setDuration(project.video ? 0 : REEL_DURATION);
    setMuted(true);
    setPlaying(!useStore.getState().reducedMotion);
  }, [project]);

  // transport clock
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (mode === 'reel') {
        if (playingRef.current) reelTime.current = (reelTime.current + dt) % REEL_DURATION;
        setTime(reelTime.current);
      } else if (video.current) {
        setTime(video.current.currentTime);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // play / pause the real video
  useEffect(() => {
    const v = video.current;
    if (mode !== 'video' || !v) return;
    if (playing) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [playing, mode]);

  // project audio has priority over the ambience
  useEffect(() => {
    audio.duck(mode === 'video' && playing && !muted);
    return () => audio.duck(false);
  }, [mode, playing, muted]);

  const seek = useCallback(
    (t: number) => {
      const d = duration || 0;
      const v = clamp(t, 0, Math.max(d - 0.05, 0));
      if (mode === 'video' && video.current) video.current.currentTime = v;
      else reelTime.current = v;
      setTime(v);
    },
    [duration, mode],
  );

  const timeAt = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    const f = clamp((clientX - r.left) / r.width);
    return { t: f * (duration || 0), x: f * r.width };
  };

  const onBarDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    seek(timeAt(e.clientX).t);
  };
  const onBarMove = (e: PointerEvent<HTMLDivElement>) => {
    const h = timeAt(e.clientX);
    hoverTime.current = h.t;
    setHover(h);
    if (dragging) seek(h.t);
    else if (mode === 'video' && preview.current && isFinite(h.t)) {
      const p = preview.current;
      if (Math.abs(p.currentTime - h.t) > 0.25) p.currentTime = h.t;
    }
  };
  const onBarUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  const toggle = () => setPlaying((p) => !p);
  const fullscreen = () => {
    const el = wrap.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else el.requestFullscreen?.().catch(() => undefined);
  };
  const toggleMute = () => {
    setMuted((m) => {
      if (video.current) video.current.muted = !m;
      return !m;
    });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        return toggle();
      case 'ArrowRight':
        e.preventDefault();
        return seek(time + 5);
      case 'ArrowLeft':
        e.preventDefault();
        return seek(time - 5);
      case 'Home':
        e.preventDefault();
        return seek(0);
      case 'End':
        e.preventDefault();
        return seek(duration);
      case 'f':
        return fullscreen();
      case 'm':
        return mode === 'video' ? toggleMute() : undefined;
    }
  };

  const fail = () => {
    setMode('reel');
    setMediaError(true);
    setDuration(REEL_DURATION);
    reelTime.current = 0;
  };

  const progress = duration ? clamp(time / duration) : 0;

  return (
    <div ref={wrap} className={`player player-${mode} ${playing ? 'is-playing' : 'is-paused'}`} onKeyDown={onKey}>
      <div className="player-media" onClick={toggle}>
        {mode === 'video' ? (
          <video
            ref={video}
            src={project.video}
            poster={project.poster || undefined}
            playsInline
            muted={muted}
            loop
            preload="metadata"
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onPlay={() => setPlaying(true)}
            onPause={() => !dragging && setPlaying(false)}
            onError={fail}
          />
        ) : mode === 'still' ? (
          <img className="still" src={project.poster} alt="" decoding="async" onError={() => setMode('reel')} />
        ) : (
          <ProceduralReel project={project} getTime={() => reelTime.current} />
        )}
      </div>

      {mode === 'still' && (
        <p className="player-demo">
          {project.demo && <span className="tag tag-demo">{c.ui.demo}</span>}
          {project.kind === 'still' ? c.project.still : c.project.filmSoon}
        </p>
      )}

      {mode === 'reel' && (
        <p className="player-demo">
          <span className="tag tag-demo">{c.ui.demo}</span>
          {mediaError ? c.project.mediaError : c.project.demoVisual}
        </p>
      )}

      <div className="player-controls">
        <button type="button" className="pc-btn" onClick={toggle} aria-label={playing ? c.project.pause : c.project.play}>
          {playing ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5l11 7-11 7z" fill="currentColor" />
            </svg>
          )}
        </button>
        <span className="pc-time" aria-hidden="true">
          {fmt(time)}
        </span>
        <div
          ref={bar}
          className={`scrub ${dragging ? 'is-dragging' : ''}`}
          role="slider"
          tabIndex={0}
          aria-label={c.project.seek}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 0)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${fmt(time)} / ${fmt(duration)}`}
          onPointerDown={onBarDown}
          onPointerMove={onBarMove}
          onPointerUp={onBarUp}
          onPointerCancel={onBarUp}
          onPointerLeave={() => !dragging && setHover(null)}
        >
          <span className="scrub-track" />
          <span className="scrub-fill" style={{ transform: `scaleX(${progress})` }} />
          <span className="scrub-thumb" style={{ left: `${progress * 100}%` }} />
          {hover && duration > 0 && (
            <span className="scrub-preview" style={{ left: hover.x }} aria-hidden="true">
              <span className="scrub-frame">
                {mode === 'video' ? (
                  <video ref={preview} src={project.video} muted playsInline preload="metadata" />
                ) : (
                  <ProceduralReel project={project} getTime={() => hoverTime.current} maxDpr={1} />
                )}
              </span>
              <span className="scrub-stamp">{fmt(hover.t)}</span>
            </span>
          )}
        </div>
        <span className="pc-time" aria-hidden="true">
          {fmt(duration)}
        </span>
        {mode === 'video' && (
          <button type="button" className="pc-btn" onClick={toggleMute} aria-label={muted ? c.project.unmute : c.project.mute} aria-pressed={!muted}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 10v4h3l5 4V6l-5 4z" fill="currentColor" />
              {muted ? <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /> : <path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
            </svg>
          </button>
        )}
        <button type="button" className="pc-btn pc-full" onClick={fullscreen} aria-label={c.project.fullscreen}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

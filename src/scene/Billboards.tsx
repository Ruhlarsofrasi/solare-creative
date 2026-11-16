import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { CanvasTexture, Color, DataTexture, DoubleSide, Group, Mesh, ShaderMaterial, SRGBColorSpace, TextureLoader, Vector3, VideoTexture } from 'three';
import { planetIndex, type PlanetConfig } from '../config/planets';
import type { Lang } from '../config/site';
import { projectSeed, projectsOf, type Project } from '../content/projects';
import { clamp, damp } from '../lib/math';
import { bridge } from '../state/bridge';
import { useStore } from '../state/store';
import { STOP_ANGLE, STOP_DISTANCE, STOP_DISTANCE_PORTRAIT } from './poses';
import { metalFragment, planetVertex } from './shaders/planets';
import { screenFragment, screenVertex } from './shaders/screen';

const blank = new DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
blank.needsUpdate = true;

const UP = new Vector3(0, 1, 0);
// camera stop direction in the planet's local frame (x = away from sun, z = orbit tangent)
const toCam = new Vector3(Math.cos(STOP_ANGLE), 0.2, -Math.sin(STOP_ANGLE)).normalize();
const camRight = new Vector3().crossVectors(toCam.clone().negate(), UP).normalize();

interface Layout {
  curved: boolean;
  w: number;
  h: number;
  aspect: number;
  radius: number;
  arc: number;
  pos: Vector3;
  yaw: number;
  pitch: number;
}

function layoutFor(project: Project, cfg: PlanetConfig, slot: number, portrait: boolean): Layout {
  const R = cfg.radius;
  const camPos = toCam.clone().multiplyScalar(R * (portrait ? STOP_DISTANCE_PORTRAIT : STOP_DISTANCE));
  if (project.format === 'curved') {
    const radius = R * (portrait ? 1.45 : 2.3);
    const h = R * 0.52;
    const arc = 1.9;
    const face = toCam.clone().addScaledVector(camRight, -0.3);
    return {
      curved: true,
      w: 2 * radius * Math.sin(arc / 2),
      h,
      aspect: (radius * arc) / h,
      radius,
      arc,
      pos: new Vector3(0, -R * 0.5, 0),
      yaw: Math.atan2(face.x, face.z),
      pitch: 0,
    };
  }
  let w: number;
  let h: number;
  if (portrait) {
    // Phone framing is tall and narrow: wide screens sit above / below the planet,
    // vertical screens to its left / right — all inside the frame and in front of the planet's hit area.
    const vertical = project.format === 'vertical';
    if (vertical) {
      h = R * 1.45;
      w = (h * 9) / 16;
    } else {
      w = R * 2.5;
      h = w / 2.35;
    }
    const side = slot === 0 ? -1 : 1;
    const pos = new Vector3().addScaledVector(toCam, 1.1 * R);
    if (vertical) pos.addScaledVector(camRight, side * 1.5 * R).addScaledVector(UP, -0.1 * R);
    else pos.addScaledVector(UP, -side * (1.3 * R + h / 2));
    const d = camPos.clone().sub(pos);
    return {
      curved: false,
      w,
      h,
      aspect: w / h,
      radius: 0,
      arc: 0,
      pos,
      yaw: Math.atan2(d.x, d.z),
      pitch: -Math.atan2(d.y, Math.hypot(d.x, d.z)),
    };
  }
  if (project.format === 'vertical') {
    h = R * (slot === 0 ? 2.15 : 1.85);
    w = (h * 9) / 16;
  } else {
    w = R * (slot === 0 ? 2.55 : 1.8);
    h = w / 2.35;
  }
  const pos =
    slot === 0
      ? new Vector3().addScaledVector(camRight, -2.5 * R).addScaledVector(UP, 0.95 * R).addScaledVector(toCam, -1.0 * R)
      : new Vector3().addScaledVector(camRight, 1.95 * R).addScaledVector(UP, (project.format === 'vertical' ? 0.7 : 1.1) * R).addScaledVector(toCam, -1.3 * R);
  const d = camPos.clone().sub(pos);
  return {
    curved: false,
    w,
    h,
    aspect: w / h,
    radius: 0,
    arc: 0,
    pos,
    yaw: Math.atan2(d.x, d.z),
    pitch: -Math.atan2(d.y, Math.hypot(d.x, d.z)) * 0.6,
  };
}

/** Typographic overlay drawn to a canvas: category, title and a clear DEMO tag. */
function drawOverlay(canvas: HTMLCanvasElement, project: Project, lang: Lang, layout: Layout, index: string) {
  const H = layout.curved ? 256 : layout.aspect < 1 ? 768 : 440;
  const W = Math.round(H * layout.aspect);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  const serif = '"Cormorant Garamond", Georgia, serif';
  const sans = '"DM Sans", system-ui, sans-serif';
  const ivory = '#faf8f5';
  const u = Math.min(W, H);
  const category = project.category[lang].toLocaleUpperCase(lang === 'tr' ? 'tr-TR' : 'en-US');
  const demo = project.demo ? 'DEMO' : '';

  if (layout.curved) {
    // orbital ticker
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(8,8,6,0.0)');
    g.addColorStop(1, 'rgba(8,8,6,0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = 'middle';
    ctx.font = `500 ${H * 0.42}px ${serif}`;
    const tw = ctx.measureText(project.title).width;
    ctx.font = `500 ${H * 0.085}px ${sans}`;
    const cw = ctx.measureText(category).width * 1.25;
    const unit = tw + cw + H * 1.1;
    const n = Math.max(1, Math.round(W / unit));
    const step = W / n;
    for (let i = 0; i < n; i++) {
      const x = i * step + H * 0.3;
      ctx.fillStyle = ivory;
      ctx.font = `500 ${H * 0.42}px ${serif}`;
      ctx.fillText(project.title, x, H * 0.54);
      ctx.font = `500 ${H * 0.085}px ${sans}`;
      ctx.fillStyle = 'rgba(250,248,245,0.82)';
      spaced(ctx, `${category}${demo ? ' · ' + demo : ''}`, x + tw + H * 0.3, H * 0.56, H * 0.02);
    }
    return;
  }

  const g = ctx.createLinearGradient(0, H * 0.45, 0, H);
  g.addColorStop(0, 'rgba(8,8,6,0)');
  g.addColorStop(1, 'rgba(8,8,6,0.72)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const pad = u * 0.085;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(250,248,245,0.85)';
  ctx.font = `500 ${u * 0.042}px ${sans}`;
  spaced(ctx, category, pad, pad + u * 0.04, u * 0.012);
  if (demo) {
    ctx.font = `500 ${u * 0.038}px ${sans}`;
    const dw = ctx.measureText(demo).width + u * 0.07;
    ctx.strokeStyle = 'rgba(250,248,245,0.7)';
    ctx.lineWidth = Math.max(1, u * 0.004);
    const bx = W - pad - dw;
    const by = pad - u * 0.005;
    ctx.beginPath();
    ctx.roundRect(bx, by, dw, u * 0.07, u * 0.035);
    ctx.stroke();
    spaced(ctx, demo, bx + u * 0.028, by + u * 0.049, u * 0.008);
  }
  // title, wrapped to width
  ctx.fillStyle = ivory;
  let size = layout.aspect < 1 ? u * 0.17 : u * 0.2;
  const words = project.title.split(' ');
  let lines: string[] = [];
  for (let attempt = 0; attempt < 6; attempt++) {
    ctx.font = `500 ${size}px ${serif}`;
    lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > W - pad * 2 && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    lines.push(line);
    if (lines.every((l) => ctx.measureText(l).width <= W - pad * 2) && lines.length <= 3) break;
    size *= 0.88;
  }
  lines.reverse().forEach((l, i) => ctx.fillText(l, pad, H - pad - i * size * 1.02));
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

const frameColor = new Color('#1a1a18');

function Screen({ project, cfg, slot, seed }: { project: Project; cfg: PlanetConfig; slot: number; seed: number }) {
  const lang = useStore((s) => s.lang);
  const portrait = useThree((s) => s.size.width / s.size.height < 0.9);
  const layout = useMemo(() => layoutFor(project, cfg, slot, portrait), [project, cfg, slot, portrait]);
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const hover = useRef(0);
  const video = useRef<HTMLVideoElement | null>(null);
  const stopIndex = planetIndex(cfg.id) + 1;

  const { mat, frameMat, canvas, texture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 4;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    const mat = new ShaderMaterial({
      vertexShader: screenVertex,
      fragmentShader: screenFragment,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: seed },
        uAspect: { value: layout.aspect },
        uHover: { value: 0 },
        uFlip: { value: 0 },
        uUseVideo: { value: 0 },
        uPresence: { value: 0.4 },
        uTexAspect: { value: 1 },
        uA: { value: new Color(project.palette[0]) },
        uB: { value: new Color(project.palette[1]) },
        uC: { value: new Color(project.palette[2]) },
        uMap: { value: texture },
        uVideo: { value: blank },
      },
    });
    const frameMat = new ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: metalFragment,
      uniforms: { uColor: { value: frameColor }, uFlat: { value: 0 } },
      side: DoubleSide,
    });
    return { mat, frameMat, canvas, texture };
  }, [project, layout, seed]);

  useEffect(() => {
    let alive = true;
    const paint = () => {
      if (!alive) return;
      drawOverlay(canvas, project, lang, layout, cfg.index);
      texture.needsUpdate = true;
    };
    paint();
    document.fonts?.ready.then(paint);
    return () => {
      alive = false;
    };
  }, [canvas, texture, project, lang, layout, cfg.index]);

  // Optional real media — only decoded while this planet is on stage.
  const src = project.previewVideo || project.video || '';
  useEffect(() => {
    if (!src) return;
    const el = document.createElement('video');
    el.muted = true;
    el.loop = true;
    el.playsInline = true;
    el.crossOrigin = 'anonymous';
    el.preload = 'none';
    el.src = src;
    const tex = new VideoTexture(el);
    tex.colorSpace = SRGBColorSpace;
    const ok = () => {
      mat.uniforms.uTexAspect.value = el.videoWidth / Math.max(el.videoHeight, 1);
      mat.uniforms.uVideo.value = tex;
      mat.uniforms.uUseVideo.value = 1;
    };
    const fail = () => {
      mat.uniforms.uUseVideo.value = 0; // fall back to the procedural visual
      video.current = null;
    };
    el.addEventListener('playing', ok);
    el.addEventListener('error', fail);
    video.current = el;
    return () => {
      el.removeEventListener('playing', ok);
      el.removeEventListener('error', fail);
      el.pause();
      el.removeAttribute('src');
      el.load();
      tex.dispose();
      mat.uniforms.uUseVideo.value = 0;
      mat.uniforms.uVideo.value = blank;
      video.current = null;
    };
  }, [src, mat]);

  // Still photography / poster — a quiet image screen (used when there is no moving preview).
  const still = !src ? project.poster || '' : '';
  useEffect(() => {
    if (!still) return;
    let alive = true;
    const tex = new TextureLoader().load(
      still,
      (t) => {
        if (!alive) return;
        t.colorSpace = SRGBColorSpace;
        mat.uniforms.uTexAspect.value = t.image.width / Math.max(t.image.height, 1);
        mat.uniforms.uVideo.value = t;
        mat.uniforms.uUseVideo.value = 1;
      },
      undefined,
      () => undefined, // missing file → the procedural visual simply stays
    );
    return () => {
      alive = false;
      mat.uniforms.uUseVideo.value = 0;
      mat.uniforms.uVideo.value = blank;
      tex.dispose();
    };
  }, [still, mat]);

  useEffect(
    () => () => {
      mat.dispose();
      frameMat.dispose();
      texture.dispose();
      delete bridge.screens[project.slug];
    },
    [mat, frameMat, texture, project.slug],
  );

  useFrame((_, dt) => {
    const s = useStore.getState();
    const t = bridge.time;
    const isHover = s.hovered === `project:${project.slug}`;
    hover.current = damp(hover.current, isHover ? 1 : 0, 2.2, dt);
    let presence: number;
    if (s.route.kind === 'home') presence = clamp(1 - Math.abs(bridge.progress - stopIndex));
    else if (s.route.kind === 'planet') presence = s.route.id === cfg.id ? 1 : 0;
    else if (s.route.kind === 'project') presence = s.route.slug === project.slug ? 1 : 0.2;
    else presence = 0;
    mat.uniforms.uTime.value = s.reducedMotion ? t * 0.3 : t;
    mat.uniforms.uHover.value = hover.current;
    mat.uniforms.uPresence.value = damp(mat.uniforms.uPresence.value, 0.32 + presence * 0.68, 4, dt);

    const el = video.current;
    if (el) {
      if (presence > 0.6 && el.paused) el.play().catch(() => undefined);
      else if (presence < 0.3 && !el.paused) el.pause();
    }

    const g = group.current;
    const m = mesh.current;
    if (!g || !m) return;
    if (!s.reducedMotion) g.position.y = layout.pos.y + Math.sin(t * 0.35 + seed * 20) * cfg.radius * 0.03;
    // publish the screen rectangle for camera framing + DOM match cuts
    let info = bridge.screens[project.slug];
    if (!info) info = bridge.screens[project.slug] = { center: new Vector3(), normal: new Vector3(), right: new Vector3(), up: new Vector3(), w: layout.w, h: layout.h };
    g.updateWorldMatrix(true, false);
    const e = g.matrixWorld.elements;
    info.right.set(e[0], e[1], e[2]).normalize();
    info.up.set(e[4], e[5], e[6]).normalize();
    info.normal.set(e[8], e[9], e[10]).normalize();
    info.center.setFromMatrixPosition(g.matrixWorld);
    if (layout.curved) info.center.addScaledVector(info.normal, layout.radius);
    info.w = layout.w;
    info.h = layout.h;
  });

  const interactive = () => {
    const s = useStore.getState();
    return s.route.kind === 'home' && bridge.intro >= 1 && Math.abs(bridge.progress - stopIndex) < 0.6;
  };
  const over = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive()) return;
    e.stopPropagation();
    useStore.setState({ hovered: `project:${project.slug}` });
    document.body.style.cursor = 'pointer';
  };
  const out = () => {
    if (useStore.getState().hovered === `project:${project.slug}`) useStore.setState({ hovered: null });
    document.body.style.cursor = '';
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive() || e.delta > 6) return;
    e.stopPropagation();
    document.body.style.cursor = '';
    useStore.getState().navigate({ kind: 'project', slug: project.slug });
  };

  const d = cfg.radius * 0.045;
  return (
    <group ref={group} position={layout.pos} rotation={[layout.pitch, layout.yaw, 0]} rotation-order="YXZ">
      {layout.curved ? (
        <>
          <mesh ref={mesh} material={mat} onPointerOver={over} onPointerOut={out} onClick={click}>
            <cylinderGeometry args={[layout.radius, layout.radius, layout.h, 72, 1, true, -layout.arc / 2, layout.arc]} />
          </mesh>
          <mesh material={frameMat}>
            <cylinderGeometry args={[layout.radius - d * 0.6, layout.radius - d * 0.6, layout.h + d * 2.4, 72, 1, true, -layout.arc / 2 - 0.02, layout.arc + 0.04]} />
          </mesh>
          {[-1, 1].map((sgn) => (
            <mesh key={sgn} material={frameMat} position={[0, (sgn * (layout.h + d * 2.4)) / 2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2 - layout.arc / 2 - 0.02]}>
              <torusGeometry args={[layout.radius - d * 0.3, d * 0.45, 6, 72, layout.arc + 0.04]} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <mesh ref={mesh} material={mat} onPointerOver={over} onPointerOut={out} onClick={click}>
            <planeGeometry args={[layout.w, layout.h]} />
          </mesh>
          <mesh material={frameMat} position={[0, 0, -d * 0.75]}>
            <boxGeometry args={[layout.w + d * 2, layout.h + d * 2, d]} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Monumental screens orbiting a planet — one per project of that destination. */
export function Billboards({ cfg }: { cfg: PlanetConfig }) {
  const list = useMemo(() => projectsOf(cfg.id), [cfg.id]);
  let flat = 0;
  return (
    <>
      {list.map((p) => {
        const slot = p.format === 'curved' ? 0 : flat++;
        // only the first two flat slots + one curved screen are staged per planet
        if (p.format !== 'curved' && slot > 1) return null;
        return <Screen key={p.slug} project={p} cfg={cfg} slot={slot} seed={projectSeed(p.slug)} />;
      })}
    </>
  );
}

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, CanvasTexture, Color, DataTexture, DoubleSide, Group, Mesh, MeshBasicMaterial, RepeatWrapping, ShaderMaterial, SRGBColorSpace, Vector3 } from 'three';
import gsap from 'gsap';
import { SUN_RADIUS } from '../config/planets';
import { copy } from '../content/copy';
import { smoothstep } from '../lib/math';
import { bridge } from '../state/bridge';
import { useStore } from '../state/store';
import { useMap } from './Planets';
import { tail } from './shaders/noise';
import { planetFragment, planetVertex } from './shaders/planets';
import { billboardVertex } from './shaders/sun';

let eclipseTl: gsap.core.Timeline | null = null;

/**
 * Secret (type ''solare'', or tap the logo five times): a total solar eclipse.
 * The Moon slides in front of the sun, holds at totality so only the corona
 * burns around it, then slides away.
 */
export function triggerEclipse() {
  if (eclipseTl?.isActive()) return false;
  bridge.eclipseX = 1;
  bridge.eclipseOn = 1;
  eclipseTl = gsap
    .timeline({ onComplete: () => (bridge.eclipseOn = 0) })
    .to(bridge, { eclipseX: 0, duration: 7, ease: 'power2.out' })
    .to(bridge, { eclipseX: -1, duration: 7, ease: 'power2.in', delay: 4 });
  useStore.getState().discover('eclipse');
  return true;
}

/** Accessibility switch: hold every planet on one straight line, or let them orbit freely. */
function applyAlignment(on: boolean, instant = false) {
  gsap.killTweensOf(bridge, 'align');
  const reduced = useStore.getState().reducedMotion;
  if (instant || reduced) bridge.align = on ? 1 : 0;
  else gsap.to(bridge, { align: on ? 1 : 0, duration: 4.5, ease: 'power2.inOut' });
}

const blank = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
blank.needsUpdate = true;
const toSun = new Vector3();
const side = new Vector3();
const lift = new Vector3();
const UP = new Vector3(0, 1, 0);
const look = new Vector3();

/** Thin pearly ring that hugs the Moon's edge at totality — the inner corona of a real eclipse. */
const eclipseRingFragment = /* glsl */ `
uniform float uI;
varying vec2 vUv;
void main(){
  vec2 p = (vUv - 0.5) * 2.0;
  float d = length(p);
  float e = d * 1.25;                 // the Moon's limb sits at e = 1
  float a = atan(p.y, p.x);
  float streak = 0.7 + 0.3 * sin(a * 7.0 + 1.3) * sin(a * 3.0 - 0.4);
  float ring = exp(-pow((e - 1.0) / 0.03, 2.0)) * 1.3;
  ring += exp(-max(e - 1.0, 0.0) * 10.0) * 0.32 * streak * step(1.0, e);
  ring *= smoothstep(1.0, 0.82, d);
  gl_FragColor = vec4(vec3(1.0, 0.96, 0.9) * ring * uI, 1.0);
  ${tail}
}`;

/** Andromeda (M31) with its two companions, appearing in the darkened sky at totality. */
const andromedaFragment = /* glsl */ `
uniform float uI;
varying vec2 vUv;
float ah(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float an(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(ah(i), ah(i + vec2(1.0, 0.0)), f.x), mix(ah(i + vec2(0.0, 1.0)), ah(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main(){
  vec2 p = (vUv - 0.5) * 2.0;
  float ca = cos(0.62); float sa = sin(0.62);
  p = mat2(ca, -sa, sa, ca) * p;
  vec2 q = vec2(p.x, p.y / 0.3);
  float r = length(q);
  float core = exp(-r * r * 70.0) * 1.4;
  float bulge = exp(-r * 7.5) * 0.55;
  float disk = exp(-r * 2.7) * 0.42;
  float ang = atan(q.y, q.x);
  float lanes = 0.5 + 0.5 * sin(r * 21.0 - ang * 2.0 + an(q * 3.0) * 2.4);
  disk *= mix(0.4, 1.0, smoothstep(0.2, 0.8, lanes));
  disk *= 0.85 + 0.3 * an(q * 9.0);
  vec3 col = vec3(1.0, 0.86, 0.68) * (core + bulge) + vec3(0.72, 0.8, 1.0) * disk;
  vec2 m32 = p - vec2(0.07, -0.17);
  col += vec3(1.0, 0.9, 0.8) * exp(-dot(m32, m32) * 900.0) * 0.55;
  vec2 m110 = (p - vec2(-0.3, 0.25)) * vec2(1.0, 1.8);
  col += vec3(0.9, 0.88, 0.85) * exp(-dot(m110, m110) * 260.0) * 0.3;
  col *= smoothstep(1.0, 0.65, length(p));
  gl_FragColor = vec4(col * uI, 1.0);
  ${tail}
}`;

const m31Dir = new Vector3();

/**
 * The eclipsing Moon: lit only from behind by the sun, so it reads as a black disc with the
 * faintest earthshine. It never leaves the scene (when idle it is tucked inside the sun), so its
 * shader is compiled with everything else at load instead of stalling the first eclipse.
 */
function EclipseMoon() {
  const ref = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const m31Ref = useRef<Mesh>(null);
  const placed = useRef(false);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: planetVertex,
        fragmentShader: planetFragment('moon'),
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uReady: { value: 0 },
          uAtmo: { value: new Color('#ffffff') },
          uFallback: { value: new Color('#2a2826') },
          uMap: { value: blank },
          uNight: { value: blank },
          uClouds: { value: blank },
        },
        defines: { OCT: 3 },
      }),
    [],
  );
  const glowMats = useMemo(() => {
    const additive = { transparent: true, blending: AdditiveBlending, depthWrite: false };
    return {
      ring: new ShaderMaterial({ vertexShader: billboardVertex, fragmentShader: eclipseRingFragment, uniforms: { uI: { value: 0 } }, ...additive }),
      m31: new ShaderMaterial({ vertexShader: billboardVertex, fragmentShader: andromedaFragment, uniforms: { uI: { value: 0 } }, ...additive }),
    };
  }, []);
  mat.uniforms.uMap.value = useMap('moon.jpg', () => (mat.uniforms.uReady.value = 1));
  useEffect(
    () => () => {
      mat.dispose();
      glowMats.ring.dispose();
      glowMats.m31.dispose();
    },
    [mat, glowMats],
  );
  useFrame((state) => {
    const m = ref.current;
    const ring = ringRef.current;
    const m31 = m31Ref.current;
    if (!m || !ring || !m31) return;
    const cam = state.camera;
    if (bridge.eclipseOn <= 0) {
      bridge.eclipseCover = 0;
      placed.current = false;
      m.position.set(0, 0, 0);
      m.scale.setScalar(1e-4);
      ring.scale.setScalar(1e-4);
      glowMats.ring.uniforms.uI.value = 0;
      glowMats.m31.uniforms.uI.value = 0;
      return;
    }
    toSun.copy(cam.position).negate();
    const dist = toSun.length();
    toSun.normalize();
    // well in front of the sun, and a touch larger than it on screen so totality is complete
    const D = dist * 0.42;
    const sunAng = Math.asin(Math.min(SUN_RADIUS / dist, 0.99)) * 1.035;
    const r = D * Math.tan(sunAng);
    side.crossVectors(toSun, UP).normalize();
    lift.crossVectors(side, toSun).normalize();
    // The path starts and ends just outside the frame, so the Moon never pops in or out:
    // how far the sun sits from the centre of view, plus the half-diagonal of the lens, plus the Moon itself.
    const pc = cam as typeof cam & { fov?: number; aspect?: number };
    const halfV = ((pc.fov ?? 40) * Math.PI) / 360;
    const halfDiag = Math.atan(Math.tan(halfV) * Math.hypot(1, pc.aspect ?? 1.6));
    cam.getWorldDirection(look);
    const offAxis = Math.acos(Math.min(1, Math.max(-1, look.dot(toSun))));
    const span = Math.min(40, (offAxis + halfDiag) / sunAng + 1.3);
    const x = bridge.eclipseX * span;
    const cover = Math.max(0, Math.min(1, 1 - Math.abs(x) / 2.1));
    bridge.eclipseCover = cover;
    m.scale.setScalar(r);
    m.position
      .copy(cam.position)
      .addScaledVector(toSun, D)
      .addScaledVector(side, x * r)
      .addScaledVector(lift, x * r * 0.22);

    // the inner-corona ring, only around totality
    ring.position.copy(m.position);
    ring.lookAt(cam.position);
    ring.scale.setScalar(r * 1.25);
    glowMats.ring.uniforms.uI.value = smoothstep(0.78, 1.0, cover);

    // Andromeda: placed once per eclipse, a little above and beside the sun, then left still
    if (!placed.current) {
      placed.current = true;
      m31Dir.copy(toSun).addScaledVector(lift, 0.16).addScaledVector(side, -0.2).normalize();
      m31.position.copy(cam.position).addScaledVector(m31Dir, 1800);
    }
    m31.lookAt(cam.position);
    m31.scale.setScalar(1800 * 0.16);
    glowMats.m31.uniforms.uI.value = 0.68 * smoothstep(0.45, 0.97, cover);
  });
  return (
    <>
      <mesh ref={m31Ref} material={glowMats.m31} renderOrder={-1}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <mesh ref={ref} material={mat} renderOrder={1} scale={1e-4}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      <mesh ref={ringRef} material={glowMats.ring} renderOrder={2} scale={1e-4}>
        <planeGeometry args={[2, 2]} />
      </mesh>
    </>
  );
}
const cometFragment = /* glsl */ `
varying vec2 vUv;
void main(){
  // quad is 30 x 6 world units; the head sits a little way in from the leading edge
  float h0 = 0.1;
  float along = vUv.x;
  float across = (vUv.y - 0.5) * 2.0;
  float t = max(along - h0, 0.0) / (1.0 - h0);
  float width = mix(0.05, 0.42, t);
  float body = exp(-pow(across / width, 2.0) * 2.5) * pow(1.0 - t, 2.4) * step(h0, along);
  vec2 hp = vec2((along - h0) * 10.0, across);   // isotropic space around the head
  float d2 = dot(hp, hp);
  float head = exp(-d2 * 26.0) * 5.0 + exp(-d2 * 5.0) * 0.6;
  // everything dissolves to zero well before the quad's edges
  float mask = smoothstep(1.0, 0.55, abs(across)) * smoothstep(0.0, 0.05, along) * smoothstep(1.0, 0.9, along);
  vec3 c = mix(vec3(1.0, 0.95, 0.85), vec3(0.75, 0.85, 1.0), t);
  gl_FragColor = vec4(c * (body * 0.8 + head) * mask, 1.0);
  ${tail}
}`;

/** Rare phenomena: a passing comet, and the typographic ring revealed by the alignment. */
export function Secrets() {
  const lang = useStore((s) => s.lang);
  const comet = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const state = useRef({ t: -1, next: 75 + Math.random() * 60, from: new Vector3(), to: new Vector3(), idle: 0 });

  const cometMat = useMemo(
    () => new ShaderMaterial({ vertexShader: billboardVertex, fragmentShader: cometFragment, transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }),
    [],
  );

  const { ringMat, texture, canvas } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 64;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.anisotropy = 4;
    const ringMat = new MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false, blending: AdditiveBlending });
    return { ringMat, texture, canvas };
  }, []);

  useEffect(() => {
    let alive = true;
    const paint = () => {
      if (!alive) return;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff3dc';
      ctx.textBaseline = 'middle';
      ctx.font = '500 30px "DM Sans", system-ui, sans-serif';
      const text = copy[lang].ring;
      let w = 0;
      for (const ch of text) w += ctx.measureText(ch).width + 9;
      const reps = Math.max(1, Math.floor(canvas.width / w));
      const scale = canvas.width / (w * reps);
      let x = 0;
      for (let r = 0; r < reps; r++)
        for (const ch of text) {
          ctx.fillText(ch, x, 34);
          x += (ctx.measureText(ch).width + 9) * scale;
        }
      texture.needsUpdate = true;
    };
    paint();
    document.fonts?.ready.then(paint);
    return () => {
      alive = false;
    };
  }, [lang, canvas, texture]);

  useEffect(
    () => () => {
      cometMat.dispose();
      ringMat.dispose();
      texture.dispose();
    },
    [cometMat, ringMat, texture],
  );

  // the alignment switch (persisted) drives the planets
  useEffect(() => {
    applyAlignment(useStore.getState().aligned, true);
    return useStore.subscribe((s, prev) => {
      if (s.aligned !== prev.aligned) applyAlignment(s.aligned);
    });
  }, []);

  // typing "solare" anywhere on the orbit brings on the eclipse
  useEffect(() => {
    let buffer = '';
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return;
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-6);
      if (buffer === 'solare' && useStore.getState().route.kind === 'home') triggerEclipse();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useFrame((_, dt) => {
    const s = useStore.getState();
    const st = state.current;

    // typographic ring
    if (ring.current) {
      ringMat.opacity = bridge.align * 0.9;
      ring.current.visible = bridge.align > 0.01;
      ring.current.rotation.y -= dt * 0.05;
    }

    // comet — appears on its own after a quiet while on the home orbit
    const c = comet.current;
    if (!c) return;
    if (st.t < 0) {
      c.visible = false;
      if (s.route.kind === 'home' && bridge.intro >= 1 && !s.reducedMotion) st.idle += dt;
      if (st.idle > st.next) {
        st.idle = 0;
        st.next = 120 + Math.random() * 120;
        const a = Math.random() * Math.PI * 2;
        st.from.set(Math.cos(a) * 150, 30 + Math.random() * 30, Math.sin(a) * 150);
        st.to.set(Math.cos(a + 2.2) * 120, -10 + Math.random() * 20, Math.sin(a + 2.2) * 120);
        st.t = 0;
        s.discover('comet');
      }
      return;
    }
    st.t += dt / 11;
    if (st.t >= 1) {
      st.t = -1;
      c.visible = false;
      return;
    }
    c.visible = true;
    c.position.lerpVectors(st.from, st.to, st.t);
    // tail points back along the path; the quad's +X is the tail direction
    c.lookAt(bridge.camera ? bridge.camera.position : st.to);
    const dir = st.from.clone().sub(st.to).normalize();
    const local = dir.applyQuaternion(c.quaternion.clone().invert());
    c.rotateZ(Math.atan2(local.y, local.x));
    const fade = Math.min(st.t * 8, (1 - st.t) * 8, 1);
    c.scale.setScalar(fade);
  });

  return (
    <>
      <EclipseMoon />
      <group ref={comet} visible={false}>
        <mesh material={cometMat} position={[12, 0, 0]}>
          <planeGeometry args={[30, 6]} />
        </mesh>
      </group>
      <mesh ref={ring} material={ringMat} visible={false}>
        <cylinderGeometry args={[15.5, 15.5, 1.5, 128, 1, true]} />
      </mesh>
    </>
  );
}

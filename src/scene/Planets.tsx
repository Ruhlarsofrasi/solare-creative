import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { AdditiveBlending, BackSide, Color, DataTexture, DoubleSide, Group, Mesh, RepeatWrapping, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader } from 'three';
import { planetIndex, planets, type MoonConfig, type PlanetConfig } from '../config/planets';
import { clamp, damp } from '../lib/math';
import { tierSettings } from '../lib/quality';
import { audio } from '../audio/AudioEngine';
import { goToStop } from '../hooks/useJourneyInput';
import { bridge } from '../state/bridge';
import { useStore } from '../state/store';
import { Billboards } from './Billboards';
import { atmosphereFragment, planetFragment, planetVertex, ringFragment } from './shaders/planets';

const BASE = import.meta.env.BASE_URL;
const blank = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
blank.needsUpdate = true;
const loader = new TextureLoader();
const cache = new Map<string, Texture>();
let pending = 0;
/** Planet maps still downloading or not yet uploaded to the GPU. */
export const texturesPending = () => pending;
// 4096 px maps on desktop; phones get 2048 px versions — a quarter of the GPU memory, same look at phone size
const HAS_2K = new Set(['earth.jpg', 'jupiter.jpg', 'mars.jpg', 'venus.jpg']);

/**
 * High-resolution planet maps live in /public/textures (see README for credits).
 * Replace a file there to swap a planet's surface. Textures are shared and cached.
 */
export function useMap(file: string | null, onLoad?: () => void) {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const mobile = useStore.getState().mobile;
    const max = gl.capabilities.getMaxAnisotropy();
    if (!file) return blank;
    const hit = cache.get(file);
    if (hit) {
      if (hit.image) onLoad?.();
      else window.setTimeout(() => onLoad?.(), 1500);
      return hit;
    }
    pending++;
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      pending--;
    };
    const tex = loader.load(
      `${BASE}textures/${mobile && HAS_2K.has(file) ? '2k/' : ''}${file}`,
      (t) => {
        // upload now, behind the loader, rather than as a hitch the first time the planet is seen
        try {
          gl.initTexture(t);
        } catch {
          /* uploaded on first use instead */
        }
        settle();
        onLoad?.();
      },
      undefined,
      settle,
    );
    tex.colorSpace = SRGBColorSpace;
    tex.wrapS = RepeatWrapping;
    tex.anisotropy = Math.min(mobile ? 4 : 8, max);
    cache.set(file, tex);
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);
}

/** Decorative moons (the Moon, Phobos & Deimos, the Galileans, Titan). Clicking one is a small secret. */
function Moon({ cfg, moon, index }: { cfg: PlanetConfig; moon: MoonConfig; index: number }) {
  const ref = useRef<Mesh>(null);
  const pulse = useRef(0);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: planetVertex,
        fragmentShader: planetFragment('moon'),
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uReady: { value: 0 },
          uAtmo: { value: new Color(moon.tint ?? '#ffffff').multiplyScalar(moon.tint ? 1.4 : 1) },
          uFallback: { value: new Color('#6b6660') },
          uMap: { value: blank },
          uNight: { value: blank },
          uClouds: { value: blank },
        },
        defines: { OCT: 3 },
      }),
    [moon.tint],
  );
  const map = useMap('moon.jpg', () => (mat.uniforms.uReady.value = 1));
  mat.uniforms.uMap.value = map;
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    const a = moon.phase + bridge.orbitTime * moon.speed;
    m.position.set(Math.cos(a) * moon.distance, Math.sin(a) * moon.distance * Math.sin(moon.incline), Math.sin(a) * moon.distance * Math.cos(moon.incline));
    m.rotation.y += dt * 0.1;
    pulse.current = damp(pulse.current, 0, 1.2, dt);
    mat.uniforms.uHover.value = pulse.current;
  });
  const click = (e: ThreeEvent<MouseEvent>) => {
    const s = useStore.getState();
    if (s.route.kind !== 'home' || e.delta > 6) return;
    e.stopPropagation();
    pulse.current = 1;
    audio.chime(cfg.tone * (1 + index * 0.5));
    s.discover('chime');
  };
  return (
    <mesh ref={ref} material={mat} onClick={click}>
      <sphereGeometry args={[moon.radius, 32, 32]} />
    </mesh>
  );
}

function SaturnRings({ cfg }: { cfg: PlanetConfig }) {
  const R = cfg.radius;
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: planetVertex,
        fragmentShader: ringFragment,
        uniforms: {
          uRing: { value: blank },
          uReady: { value: 0 },
          uCenter: { value: bridge.planetPos[cfg.id] },
          uRadius: { value: R },
          uInner: { value: R * 1.24 },
          uOuter: { value: R * 2.3 },
        },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [cfg.id, R],
  );
  const map = useMap('saturn-ring.png', () => (mat.uniforms.uReady.value = 1));
  mat.uniforms.uRing.value = map;
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[R * 1.24, R * 2.3, 192, 1]} />
    </mesh>
  );
}

function Planet({ cfg }: { cfg: PlanetConfig }) {
  const tier = useStore((s) => s.tier);
  const settings = tierSettings(tier);
  const frame = useRef<Group>(null);
  const turn = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const hover = useRef(0);
  const drag = useRef({ active: false, x: 0, y: 0, vx: 0, vy: 0 });
  const center = bridge.planetPos[cfg.id];
  const stopIndex = planetIndex(cfg.id) + 1;

  const mats = useMemo(() => {
    const surface = new ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: planetFragment(cfg.kind),
      uniforms: {
        uTime: { value: 0 },
        uHover: { value: 0 },
        uReady: { value: 0 },
        uAtmo: { value: new Color(cfg.atmosphere) },
        uFallback: { value: new Color(cfg.color).multiplyScalar(0.5) },
        uMap: { value: blank },
        uNight: { value: blank },
        uClouds: { value: blank },
      },
      defines: { OCT: 3 },
    });
    const air = new ShaderMaterial({
      vertexShader: planetVertex,
      fragmentShader: atmosphereFragment,
      uniforms: {
        uColor: { value: new Color(cfg.atmosphere) },
        uNorm: { value: Math.sqrt(1 - 1 / (cfg.air.scale * cfg.air.scale)) },
        uStrength: { value: cfg.air.strength },
        uHover: { value: 0 },
      },
      side: BackSide,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    return { surface, air };
  }, [cfg]);

  // Uranus is shaded procedurally (a near-featureless haze), every other planet from its map
  const map = useMap(cfg.kind === 'uranus' ? null : `${cfg.kind}.jpg`, () => (mats.surface.uniforms.uReady.value = 1));
  const night = useMap(cfg.kind === 'earth' ? 'earth-night.jpg' : null);
  const clouds = useMap(cfg.kind === 'earth' ? 'earth-clouds.jpg' : null);
  mats.surface.uniforms.uMap.value = map;
  mats.surface.uniforms.uNight.value = night;
  mats.surface.uniforms.uClouds.value = clouds;

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  const atStop = () => {
    const s = useStore.getState();
    return s.route.kind === 'home' && bridge.intro >= 1 && s.stop === stopIndex;
  };

  // Drag to turn the planet once it is in focus. Light stays with the sun.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      d.vx = (e.clientX - d.x) * 0.0065;
      d.vy = (e.clientY - d.y) * 0.0065;
      d.x = e.clientX;
      d.y = e.clientY;
      const t = turn.current;
      if (t) {
        t.rotation.y += d.vx;
        t.rotation.x = clamp(t.rotation.x + d.vy, -0.9, 0.9);
      }
    };
    const up = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      document.body.style.cursor = '';
      window.setTimeout(() => (bridge.dragging = false), 0);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  useFrame((_, dt) => {
    const s = useStore.getState();
    const f = frame.current;
    if (!f) return;
    f.position.copy(center);
    f.rotation.y = -bridge.planetAngle[cfg.id];
    if (body.current && !s.reducedMotion) body.current.rotation.y += dt * cfg.spin;
    const d = drag.current;
    const t = turn.current;
    if (t && !d.active) {
      // inertia after release, then the tilt eases home
      t.rotation.y += d.vx;
      d.vx *= Math.pow(0.04, dt);
      d.vy = 0;
      if (s.stop !== stopIndex) t.rotation.x = damp(t.rotation.x, 0, 1.5, dt);
    }
    hover.current = damp(hover.current, s.hovered === cfg.id ? 1 : 0, 5, dt);
    mats.surface.uniforms.uTime.value = s.reducedMotion ? bridge.time * 0.3 : bridge.time;
    mats.surface.uniforms.uHover.value = hover.current;
    mats.air.uniforms.uHover.value = hover.current;
  });

  const interactive = () => {
    const s = useStore.getState();
    return s.route.kind === 'home' && bridge.intro >= 1;
  };
  const over = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive()) return;
    e.stopPropagation();
    useStore.setState({ hovered: cfg.id });
    if (!drag.current.active) document.body.style.cursor = atStop() ? 'grab' : 'pointer';
  };
  const out = () => {
    if (useStore.getState().hovered === cfg.id) useStore.setState({ hovered: null });
    if (!drag.current.active) document.body.style.cursor = '';
  };
  const down = (e: ThreeEvent<PointerEvent>) => {
    if (!atStop()) return;
    e.stopPropagation();
    drag.current = { active: true, x: e.clientX, y: e.clientY, vx: 0, vy: 0 };
    bridge.dragging = true;
    document.body.style.cursor = 'grabbing';
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive() || e.delta > 6) return;
    e.stopPropagation();
    document.body.style.cursor = '';
    // from elsewhere a click flies straight to the planet; once in focus a click enters it
    if (!atStop()) goToStop(stopIndex);
    else useStore.getState().navigate({ kind: 'planet', id: cfg.id });
  };

  const seg = Math.max(settings.segments, 64);
  return (
    <group ref={frame}>
      <group ref={turn}>
        {/* Saturn leans its ring plane toward the stop camera so the rings read open, not edge-on */}
        <group rotation={cfg.kind === 'saturn' ? [-0.44, 0, 0.16] : [cfg.tilt * 0.35, 0, cfg.tilt]}>
          <mesh ref={body} material={mats.surface}>
            <sphereGeometry args={[cfg.radius, seg * 2, seg]} />
          </mesh>
          {cfg.kind === 'saturn' && <SaturnRings cfg={cfg} />}
        </group>
      </group>
      {cfg.air.strength > 0 && (
        <mesh material={mats.air} scale={cfg.air.scale}>
          <sphereGeometry args={[cfg.radius, 48, 48]} />
        </mesh>
      )}
      {/* generous invisible hit target */}
      <mesh userData={{ planetHit: true }} onPointerOver={over} onPointerOut={out} onPointerDown={down} onClick={click}>
        <sphereGeometry args={[cfg.radius * 1.5, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {cfg.moons.map((m, i) => (
        <Moon key={i} cfg={cfg} moon={m} index={i} />
      ))}
      <Billboards cfg={cfg} />
    </group>
  );
}

export function Planets() {
  return (
    <>
      {planets.map((p) => (
        <Planet key={p.id} cfg={p} />
      ))}
    </>
  );
}

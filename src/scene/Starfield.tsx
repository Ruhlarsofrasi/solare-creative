import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, Group, LineBasicMaterial, LineLoop, ShaderMaterial } from 'three';
import { planets } from '../config/planets';
import { hash } from '../lib/math';
import { tierSettings } from '../lib/quality';
import { bridge } from '../state/bridge';
import { useStore } from '../state/store';
import { planetVertex } from './shaders/planets';
import { nebulaFragment, starFragment, starVertex } from './shaders/screen';

/** Three depth layers of stars — each layer answers the pointer by a different amount. */
export function Starfield() {
  const tier = useStore((s) => s.tier);
  const settings = tierSettings(tier);
  const dpr = useThree((s) => s.viewport.dpr);
  const layers = useRef<(Group | null)[]>([]);

  const { geos, mat, nebula } = useMemo(() => {
    const per = Math.floor(settings.stars / 3);
    const geos = [0, 1, 2].map((layer) => {
      const pos = new Float32Array(per * 3);
      const size = new Float32Array(per);
      const phase = new Float32Array(per);
      const col = new Float32Array(per * 3);
      const radius = 420 + layer * 380;
      for (let i = 0; i < per; i++) {
        const k = i + layer * 10000;
        const u = hash(k * 1.31 + 0.7) * 2 - 1;
        const th = hash(k * 2.17 + 3.1) * Math.PI * 2;
        const r = radius * (0.85 + hash(k * 0.73) * 0.3);
        const s = Math.sqrt(1 - u * u);
        pos[i * 3] = Math.cos(th) * s * r;
        pos[i * 3 + 1] = u * r;
        pos[i * 3 + 2] = Math.sin(th) * s * r;
        const m = hash(k * 5.71 + 1.9);
        size[i] = (1.1 + Math.pow(m, 7) * 5.5) * (1.25 - layer * 0.2);
        phase[i] = hash(k * 3.3);
        const temp = hash(k * 8.1);
        // warm ivory majority, a few amber and pale-blue stars
        const c = temp < 0.12 ? [1.0, 0.72, 0.45] : temp > 0.9 ? [0.78, 0.86, 1.0] : [1.0, 0.95, 0.86];
        const b = 0.35 + m * 0.75;
        col[i * 3] = c[0] * b;
        col[i * 3 + 1] = c[1] * b;
        col[i * 3 + 2] = c[2] * b;
      }
      const g = new BufferGeometry();
      g.setAttribute('position', new BufferAttribute(pos, 3));
      g.setAttribute('aSize', new BufferAttribute(size, 1));
      g.setAttribute('aPhase', new BufferAttribute(phase, 1));
      g.setAttribute('aColor', new BufferAttribute(col, 3));
      return g;
    });
    const mat = new ShaderMaterial({
      vertexShader: starVertex,
      fragmentShader: starFragment,
      uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const nebula = new ShaderMaterial({ vertexShader: planetVertex, fragmentShader: nebulaFragment, side: BackSide, depthWrite: false });
    return { geos, mat, nebula };
  }, [settings.stars]);

  useEffect(
    () => () => {
      geos.forEach((g) => g.dispose());
      mat.dispose();
      nebula.dispose();
    },
    [geos, mat, nebula],
  );

  useFrame(() => {
    mat.uniforms.uTime.value = useStore.getState().reducedMotion ? 0 : bridge.time;
    mat.uniforms.uScale.value = dpr;
    const ps = bridge.pointerSmooth;
    layers.current.forEach((g, i) => {
      if (!g) return;
      const amt = 0.012 + (2 - i) * 0.014;
      g.rotation.y = ps.x * amt + bridge.orbitTime * 0.0008 * (i + 1);
      g.rotation.x = -ps.y * amt * 0.7;
    });
  });

  return (
    <>
      {settings.nebula && (
        <mesh material={nebula} renderOrder={-10} rotation={[0.4, 0.9, 0.2]}>
          <sphereGeometry args={[1800, 24, 16]} />
        </mesh>
      )}
      {geos.map((g, i) => (
        <group key={i} ref={(el) => (layers.current[i] = el)}>
          <points geometry={g} material={mat} frustumCulled={false} />
        </group>
      ))}
    </>
  );
}

/** Hair-thin orbit guides. */
export function Orbits() {
  const lines = useMemo(() => {
    return planets.map((p, i) => {
      const n = 256;
      const pos = new Float32Array(n * 3);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        pos[k * 3] = Math.cos(a) * p.orbit.radius;
        pos[k * 3 + 1] = p.orbit.y;
        pos[k * 3 + 2] = Math.sin(a) * p.orbit.radius;
      }
      const g = new BufferGeometry();
      g.setAttribute('position', new BufferAttribute(pos, 3));
      const m = new LineBasicMaterial({ color: '#e9cfa0', transparent: true, opacity: 0.1 + (i % 2) * 0.03, depthWrite: false });
      return new LineLoop(g, m);
    });
  }, []);
  useEffect(
    () => () =>
      lines.forEach((l) => {
        l.geometry.dispose();
        (l.material as LineBasicMaterial).dispose();
      }),
    [lines],
  );
  useFrame(() => {
    const s = useStore.getState();
    const hovered = s.hovered;
    lines.forEach((l, i) => {
      const m = l.material as LineBasicMaterial;
      const target = (hovered === planets[i].id ? 0.5 : 0.11) * (1 - bridge.align * 0.3) * Math.min(1, bridge.intro * 1.5);
      m.opacity += (target - m.opacity) * 0.08;
    });
  });
  return (
    <>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </>
  );
}

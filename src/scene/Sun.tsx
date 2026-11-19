import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { AdditiveBlending, BackSide, DoubleSide, Group, Mesh, Quaternion, ShaderMaterial, Vector3 } from 'three';
import { SUN_RADIUS } from '../config/planets';
import { hash } from '../lib/math';
import { tierSettings } from '../lib/quality';
import { audio } from '../audio/AudioEngine';
import { bridge } from '../state/bridge';
import { useStore } from '../state/store';
import { billboardVertex, coronaFragment, prominenceFragment, prominenceVertex, shellFragment, shockFragment, sunFragment, sunVertex } from './shaders/sun';

const R = SUN_RADIUS;
const SHELL = 1.2;
const CORONA_SIZE = 7.5;
const Y = new Vector3(0, 1, 0);

/**
 * A small eruption at `dir` (object space of the sun): a rope of plasma is thrown
 * from the surface and reconnects a short distance away, like a lasso.
 */
export function triggerFlare(dir?: Vector3) {
  if (bridge.flareAge < 0.35) return false;
  if (dir) bridge.flareDir.copy(dir).normalize();
  else bridge.flareDir.set(Math.random() - 0.5, (Math.random() - 0.5) * 0.6, Math.random() - 0.5).normalize();
  bridge.flareAge = 0;
  bridge.eruptions.push(bridge.flareDir.clone());
  audio.flare();
  return true;
}

export function Sun() {
  const tier = useStore((s) => s.tier);
  const settings = tierSettings(tier);
  const group = useRef<Group>(null);
  const corona = useRef<Mesh>(null);
  const shock = useRef<Mesh>(null);

  const mats = useMemo(() => {
    const surface = new ShaderMaterial({
      vertexShader: sunVertex,
      fragmentShader: sunFragment,
      uniforms: { uTime: { value: 0 }, uFlare: { value: 0 }, uFlareDir: { value: new Vector3(0, 0, 1) }, uDetail: { value: 1 } },
      defines: { OCT: 4 },
    });
    const shell = new ShaderMaterial({
      vertexShader: sunVertex,
      fragmentShader: shellFragment,
      uniforms: { uTime: { value: 0 }, uFlare: { value: 0 }, uNorm: { value: Math.sqrt(1 - 1 / (SHELL * SHELL)) } },
      side: BackSide,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const cor = new ShaderMaterial({
      vertexShader: billboardVertex,
      fragmentShader: coronaFragment,
      uniforms: { uTime: { value: 0 }, uSize: { value: CORONA_SIZE }, uEdge: { value: 1 }, uFlare: { value: 0 } },
      defines: { OCT: 3 },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const shockMat = new ShaderMaterial({
      vertexShader: billboardVertex,
      fragmentShader: shockFragment,
      uniforms: { uAge: { value: 99 } },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    });
    return { surface, shell, cor, shockMat };
  }, []);

  useEffect(() => {
    mats.surface.defines.OCT = settings.octaves;
    mats.surface.uniforms.uDetail.value = tier === 'low' ? 0.6 : 1;
    mats.surface.needsUpdate = true;
  }, [mats, settings.octaves, tier]);

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  // prominence loops rooted on the photosphere
  const loops = useMemo(() => {
    const list = [];
    for (let i = 0; i < 9; i++) {
      const u = hash(i * 3.1 + 1) * Math.PI * 2;
      const y = (hash(i * 7.7 + 2) - 0.5) * 1.5;
      const rr = Math.sqrt(Math.max(1 - y * y, 0));
      const dir = new Vector3(Math.cos(u) * rr, y, Math.sin(u) * rr).normalize();
      const quat = new Quaternion().setFromUnitVectors(Y, dir);
      quat.multiply(new Quaternion().setFromAxisAngle(Y, hash(i * 5.3) * Math.PI));
      const size = 0.7 + hash(i * 9.1 + 4) * 1.9;
      const mat = new ShaderMaterial({
        vertexShader: prominenceVertex,
        fragmentShader: prominenceFragment,
        uniforms: { uTime: { value: 0 }, uPhase: { value: hash(i * 2.3) * 20 }, uFlare: { value: 0 }, uGrow: { value: 2 }, uFade: { value: 1 } },
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
      });
      list.push({ pos: dir.clone().multiplyScalar(R * 0.985), quat, size, mat });
    }
    return list;
  }, []);
  useEffect(() => () => loops.forEach((l) => l.mat.dispose()), [loops]);

  // pool of click-triggered eruptions
  const bursts = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        age: 99,
        mesh: null as Mesh | null,
        mat: new ShaderMaterial({
          vertexShader: prominenceVertex,
          fragmentShader: prominenceFragment,
          uniforms: { uTime: { value: 0 }, uPhase: { value: i * 3.7 }, uFlare: { value: 0 }, uGrow: { value: 0 }, uFade: { value: 0 } },
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        }),
      })),
    [],
  );
  useEffect(() => () => bursts.forEach((b) => b.mat.dispose()), [bursts]);

  useFrame((state, dt) => {
    const t = bridge.time;
    const reduced = useStore.getState().reducedMotion;
    const st = reduced ? t * 0.35 : t;
    if (group.current && !reduced) group.current.rotation.y += dt * 0.012;
    mats.surface.uniforms.uTime.value = st;
    mats.surface.uniforms.uFlare.value = bridge.flare;
    mats.surface.uniforms.uFlareDir.value.copy(bridge.flareDir);
    mats.shell.uniforms.uTime.value = st;
    mats.shell.uniforms.uFlare.value = bridge.flare;
    mats.cor.uniforms.uTime.value = st;
    mats.cor.uniforms.uFlare.value = bridge.flare;
    for (const l of loops) {
      l.mat.uniforms.uTime.value = st;
      l.mat.uniforms.uFlare.value = bridge.flare;
    }
    // spawn queued eruptions into the oldest free slot
    while (bridge.eruptions.length) {
      const dir = bridge.eruptions.shift()!.normalize();
      const b = bursts.reduce((a, c) => (c.age > a.age ? c : a));
      if (!b.mesh) break;
      const size = 0.9 + Math.random() * 1.5;
      b.mesh.position.copy(dir).multiplyScalar(R * 0.99);
      b.mesh.quaternion.setFromUnitVectors(Y, dir).multiply(new Quaternion().setFromAxisAngle(Y, Math.random() * Math.PI * 2));
      b.mesh.scale.set(size, size * (1.1 + Math.random() * 0.7), size);
      b.age = 0;
    }
    for (const b of bursts) {
      if (!b.mesh) continue;
      b.age += dt;
      const live = b.age < 6.5;
      b.mesh.visible = live;
      if (!live) continue;
      b.mat.uniforms.uTime.value = st * 2.0;
      b.mat.uniforms.uGrow.value = Math.min(b.age / 1.5, 2);
      b.mat.uniforms.uFade.value = Math.min(b.age / 0.2, 1) * (b.age < 3.8 ? 1 : Math.max(0, 1 - (b.age - 3.8) / 2.6)) * 1.5;
    }
    const cam = state.camera;
    if (corona.current) {
      corona.current.quaternion.copy(cam.quaternion);
      corona.current.lookAt(cam.position);
      const D = cam.position.length();
      mats.cor.uniforms.uEdge.value = D > R * 1.02 ? Math.min(1 / Math.sqrt(1 - (R * R) / (D * D)), 5) : 5;
    }
    if (shock.current) {
      const active = false; // the wide shock ring is retired in favour of small eruptions
      shock.current.visible = active;
      if (active) mats.shockMat.uniforms.uAge.value = bridge.flareAge;
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    const s = useStore.getState();
    if (s.route.kind !== 'home' || bridge.intro < 1 || e.delta > 6) return;
    // a planet hidden behind the sun takes the click: the event carries on to it
    if (e.intersections.some((i) => i.object.userData.planetHit)) return;
    e.stopPropagation();
    const local = group.current ? group.current.worldToLocal(e.point.clone()) : e.point.clone();
    if (triggerFlare(local)) s.discover('flare');
  };

  return (
    <group>
      <group ref={group}>
        <mesh material={mats.surface} onClick={onClick}>
          <sphereGeometry args={[R, settings.segments, settings.segments]} />
        </mesh>
        {loops.slice(0, settings.prominences).map((l, i) => (
          <mesh key={i} position={l.pos} quaternion={l.quat} material={l.mat} scale={[1, 1.15, 1]}>
            <torusGeometry args={[l.size, l.size * 0.05, 8, 40, Math.PI]} />
          </mesh>
        ))}
        {bursts.map((b, i) => (
          <mesh key={`b${i}`} ref={(m) => (b.mesh = m)} material={b.mat} visible={false}>
            <torusGeometry args={[1, 0.045, 8, 64, Math.PI]} />
          </mesh>
        ))}
      </group>
      <mesh material={mats.shell} scale={SHELL}>
        <sphereGeometry args={[R, 48, 48]} />
      </mesh>
      <mesh ref={corona} material={mats.cor} scale={R * CORONA_SIZE} renderOrder={2}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <mesh ref={shock} material={mats.shockMat} rotation={[-Math.PI / 2, 0, 0]} scale={95} visible={false}>
        <planeGeometry args={[2, 2]} />
      </mesh>
    </group>
  );
}

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, CanvasTexture, DoubleSide, Group, Mesh, MeshBasicMaterial, RepeatWrapping, ShaderMaterial, SRGBColorSpace, Vector3 } from 'three';
import gsap from 'gsap';
import { copy } from '../content/copy';
import { bridge } from '../state/bridge';
import { useStore } from '../state/store';
import { tail } from './shaders/noise';
import { billboardVertex } from './shaders/sun';

let alignTween: gsap.core.Timeline | null = null;

/** Secret: the grand alignment — every planet falls into a single line for a few seconds. */
export function triggerAlignment() {
  if (alignTween?.isActive()) return false;
  const reduced = useStore.getState().reducedMotion;
  alignTween = gsap
    .timeline()
    .to(bridge, { align: 1, duration: reduced ? 0.01 : 4.5, ease: 'power2.inOut' })
    .to(bridge, { align: 0, duration: reduced ? 0.01 : 5, ease: 'power2.inOut', delay: 9 });
  useStore.getState().discover('alignment');
  return true;
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

  // typing "solare" anywhere summons the alignment
  useEffect(() => {
    let buffer = '';
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return;
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-6);
      if (buffer === 'solare' && useStore.getState().route.kind === 'home') triggerAlignment();
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

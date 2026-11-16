import { Component, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { ACESFilmicToneMapping, HalfFloatType } from 'three';
import { tierSettings } from '../lib/quality';
import { useStore } from '../state/store';
import { CameraRig } from './CameraRig';
import { Planets, texturesPending } from './Planets';
import { Secrets } from './Secrets';
import { Orbits, Starfield } from './Starfield';
import { Sun } from './Sun';

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useStore.setState({ webgl: false, ready: true });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Marks the scene ready once every shader is compiled, the planet maps are on
 * the GPU and a few frames have rendered — so nothing hitches during the opening shot.
 */
function Ready() {
  const frames = useRef(0);
  const started = useRef(0);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    const el = gl.domElement;
    let timer = 0;
    const lost = (e: Event) => {
      e.preventDefault();
      // if the browser does not hand the context back, show the static backdrop instead of a black void
      timer = window.setTimeout(() => useStore.setState({ webgl: false, ready: true }), 4000);
    };
    const restored = () => window.clearTimeout(timer);
    el.addEventListener('webglcontextlost', lost);
    el.addEventListener('webglcontextrestored', restored);
    return () => {
      window.clearTimeout(timer);
      el.removeEventListener('webglcontextlost', lost);
      el.removeEventListener('webglcontextrestored', restored);
    };
  }, [gl]);
  useFrame(() => {
    if (frames.current < 0) return;
    if (frames.current === 0) {
      started.current = performance.now();
      // compile everything now, including planets the opening shot does not look at yet
      try {
        gl.compile(scene, camera);
      } catch {
        /* compiled lazily instead */
      }
    }
    frames.current++;
    const waited = performance.now() - started.current;
    if (frames.current > 6 && (texturesPending() === 0 || waited > 6000)) {
      frames.current = -1;
      useStore.setState({ ready: true });
    }
  });
  return null;
}

function Effects() {
  const tier = useStore((s) => s.tier);
  const s = tierSettings(tier);
  if (!s.bloom) return null;
  return (
    <EffectComposer multisampling={0} frameBufferType={HalfFloatType} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.92} luminanceSmoothing={0.25} levels={s.bloomLevels} radius={0.82} />
      <Vignette offset={0.28} darkness={0.62} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

export function Experience() {
  const tier = useStore((s) => s.tier);
  const paused = useStore((s) => s.paused);
  const degrade = useStore((s) => s.degrade);
  const scale = useStore((s) => s.scale);
  const settings = tierSettings(tier, scale);

  return (
    <div className="stage" aria-hidden="true">
      <Boundary>
        <Canvas
          dpr={settings.dpr}
          frameloop={paused ? 'never' : 'always'}
          gl={{ antialias: !settings.bloom, alpha: false, powerPreference: 'high-performance', stencil: false }}
          camera={{ fov: 40, near: 0.1, far: 5000, position: [0, 38, 124] }}
          onCreated={({ gl }) => {
            gl.setClearColor('#040403');
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1;
          }}
        >
          <Suspense fallback={null}>
            <CameraRig />
            <Starfield />
            <Orbits />
            <Sun />
            <Planets />
            <Secrets />
            <Effects />
            <PerformanceMonitor onDecline={degrade} flipflops={2} onFallback={degrade} />
            <Ready />
          </Suspense>
        </Canvas>
      </Boundary>
    </div>
  );
}

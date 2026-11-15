import { Component, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { ACESFilmicToneMapping, HalfFloatType } from 'three';
import { tierSettings } from '../lib/quality';
import { useStore } from '../state/store';
import { CameraRig } from './CameraRig';
import { Planets } from './Planets';
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

/** Marks the scene ready once shaders are compiled and a few frames have rendered. */
function Ready() {
  const frames = useRef(0);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    const lost = (e: Event) => e.preventDefault();
    el.addEventListener('webglcontextlost', lost);
    return () => el.removeEventListener('webglcontextlost', lost);
  }, [gl]);
  useFrame(() => {
    if (frames.current < 0) return;
    frames.current++;
    if (frames.current > 6) {
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
  const settings = tierSettings(tier);

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

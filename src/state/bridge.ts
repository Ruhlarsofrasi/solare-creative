import { PerspectiveCamera, Vector3 } from 'three';
import { planets, type PlanetId } from '../config/planets';

export interface ScreenInfo {
  center: Vector3;
  normal: Vector3;
  right: Vector3;
  up: Vector3;
  w: number;
  h: number;
}

/**
 * Non-reactive, per-frame shared state between the WebGL scene, the camera
 * rig, the DOM overlays and the audio engine. Mutated in place every frame —
 * never triggers React renders.
 */
export const bridge = {
  time: 0,
  orbitTime: 0,
  /** Opening pull-back progress 0 → 1. */
  intro: 0,
  /** Journey progress in "stops": 0 = overview, 1..6 = planets. */
  progress: 0,
  progressTarget: 0,
  pointer: { x: 0, y: 0 },
  pointerSmooth: { x: 0, y: 0 },
  camera: null as PerspectiveCamera | null,
  size: { w: 1, h: 1 },
  planetPos: Object.fromEntries(planets.map((p) => [p.id, new Vector3()])) as Record<PlanetId, Vector3>,
  planetAngle: Object.fromEntries(planets.map((p) => [p.id, p.orbit.angle])) as Record<PlanetId, number>,
  screens: {} as Record<string, ScreenInfo>,
  /** Secret: planetary alignment amount 0..1. */
  align: 0,
  /** Secret: coronal mass ejection intensity (decays). */
  flare: 0,
  flareAge: 99,
  flareDir: new Vector3(0, 0.3, 1).normalize(),
  /** Camera flight progress, 1 = settled. */
  flightK: 1,
  /** Sun position in screen space (-1..1) and camera distance — used by spatial audio. */
  sun: { x: 0, y: 0, dist: 100, facing: 1 },
  focus: { x: 0, dist: 100 },
  /** True while the visitor is dragging a planet to turn it. */
  dragging: false,
  /** Eclipse secret: 1 while the Moon is crossing; its path runs 1 (off-screen) → 0 (totality) → -1 (off-screen). */
  eclipseOn: 0,
  eclipseX: 1,
  /** How much of the sun the Moon hides right now, 0..1 (labels stop darkening when it is covered). */
  eclipseCover: 0,
  /** Override for the Hizala line direction (NaN = default). */
  alignAngle: NaN,
  /** Opening shot: playback speed (0 = not running) and linear time 0..1. */
  introSpeed: 0,
  introT: 0,
  /** Queue of small solar eruptions to spawn (directions in the sun's object space). */
  eruptions: [] as Vector3[],
};

const _v = new Vector3();

/** Project a world point to CSS pixels. Returns false when behind the camera. */
export function toScreen(world: Vector3, out: { x: number; y: number }): boolean {
  const cam = bridge.camera;
  if (!cam) return false;
  _v.copy(world).project(cam);
  out.x = (_v.x * 0.5 + 0.5) * bridge.size.w;
  out.y = (-_v.y * 0.5 + 0.5) * bridge.size.h;
  return _v.z < 1 && _v.z > -1;
}

/** Apparent radius in CSS pixels of a sphere at `world` with `radius`. */
export function screenRadius(world: Vector3, radius: number): number {
  const cam = bridge.camera;
  if (!cam) return 0;
  const d = cam.position.distanceTo(world);
  if (d <= radius) return Math.max(bridge.size.w, bridge.size.h);
  const f = 1 / Math.tan((cam.fov * Math.PI) / 360);
  return ((radius / Math.sqrt(d * d - radius * radius)) * f * bridge.size.h) / 2;
}

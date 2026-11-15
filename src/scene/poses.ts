import { Quaternion, Vector3 } from 'three';
import { planets, SUN_RADIUS, type PlanetConfig } from '../config/planets';
import { clamp, lerp, shortestAngle, smoother, smoothstep } from '../lib/math';
import { bridge } from '../state/bridge';

/** A camera set-up: where it stands, what it looks at, and its lens. */
export interface Pose {
  pos: Vector3;
  target: Vector3;
  fov: number;
}
export const makePose = (): Pose => ({ pos: new Vector3(), target: new Vector3(), fov: 40 });
export const copyPose = (from: Pose, to: Pose) => {
  to.pos.copy(from.pos);
  to.target.copy(from.target);
  to.fov = from.fov;
};

const UP = new Vector3(0, 1, 0);
const out = new Vector3();
const tan = new Vector3();
const fwd = new Vector3();
const right = new Vector3();
const camUp = new Vector3();
const A = makePose();
const B = makePose();
const q = new Quaternion();
const qi = new Quaternion();

/** Camera angle around a planet, measured from the anti-sun direction. */
export const STOP_ANGLE = 1.3;
export const STOP_DISTANCE = 5.6;
export const STOP_DISTANCE_PORTRAIT = 8.4;

export function planetFrame(cfg: PlanetConfig) {
  const a = bridge.planetAngle[cfg.id];
  out.set(Math.cos(a), 0, Math.sin(a));
  tan.set(-Math.sin(a), 0, Math.cos(a));
}

/** Stop 0 — the whole system, sun high in frame, room for the wordmark below. */
export function overviewPose(aspect: number, pose: Pose) {
  const k = aspect < 1 ? 1 + (1 / aspect - 1) * 0.8 : 1;
  pose.pos.set(0, 38 * k, 124 * k);
  pose.target.set(0, aspect < 1 ? -20 * k : -12, 0);
  pose.fov = 40;
}

/** Stops 1–6 — three-quarter view of a planet with its screens, sun raking from the side. */
export function planetStopPose(cfg: PlanetConfig, aspect: number, pose: Pose) {
  planetFrame(cfg);
  const P = bridge.planetPos[cfg.id];
  const portrait = aspect < 0.9;
  // narrower landscape windows step back so the flanking screens stay in frame
  const d = cfg.radius * (portrait ? STOP_DISTANCE_PORTRAIT : STOP_DISTANCE * Math.max(1, Math.pow(1.72 / aspect, 0.85)));
  pose.pos
    .copy(P)
    .addScaledVector(out, Math.cos(STOP_ANGLE) * d)
    .addScaledVector(tan, -Math.sin(STOP_ANGLE) * d)
    .addScaledVector(UP, d * 0.2);
  fwd.copy(P).sub(pose.pos).normalize();
  right.crossVectors(fwd, UP).normalize();
  camUp.crossVectors(right, fwd);
  pose.target.copy(P);
  if (portrait) pose.target.addScaledVector(camUp, -d * 0.2);
  else pose.target.addScaledVector(right, -d * 0.2);
  pose.fov = 40;
}

/** Inside a destination — skimming the atmosphere, looking over the limb toward the sun. */
export function planetFocusPose(cfg: PlanetConfig, pose: Pose) {
  planetFrame(cfg);
  const P = bridge.planetPos[cfg.id];
  const R = cfg.radius;
  pose.pos.copy(P).addScaledVector(out, 0.5 * R * 1.6).addScaledVector(UP, 0.36 * R * 1.6).addScaledVector(tan, -0.79 * R * 1.6);
  pose.target.copy(P).addScaledVector(out, -0.8 * R).addScaledVector(UP, 0.62 * R).addScaledVector(tan, -0.15 * R);
  pose.fov = 54;
}

/** Framing a billboard so its screen fills the viewport (the match cut into the project view). */
export function screenPose(slug: string, aspect: number, pose: Pose): boolean {
  const s = bridge.screens[slug];
  if (!s) return false;
  pose.fov = 40;
  const th = Math.tan((pose.fov * Math.PI) / 360);
  const dist = Math.max(s.h / 2 / th, s.w / 2 / (th * aspect)) * 1.04;
  pose.pos.copy(s.center).addScaledVector(s.normal, dist);
  pose.target.copy(s.center);
  return true;
}

/** Distant drifting view for 404 / legal. */
export function farPose(aspect: number, pose: Pose) {
  overviewPose(aspect, pose);
  const a = bridge.time * 0.01 + 2.2;
  const r = 150;
  pose.pos.set(Math.cos(a) * r, 70, Math.sin(a) * r);
  pose.target.set(0, -6, 0);
}

export function stopPose(i: number, aspect: number, pose: Pose) {
  if (i <= 0) overviewPose(aspect, pose);
  else planetStopPose(planets[Math.min(i, planets.length) - 1], aspect, pose);
}

/**
 * Blend two poses along an orbital arc: positions are interpolated in
 * cylindrical coordinates around the sun so the camera sweeps around it
 * (never through it), with a little lift and lens breathing on long moves.
 */
export function blendPose(a: Pose, b: Pose, k: number, o: Pose, drama = 1) {
  const ra = Math.hypot(a.pos.x, a.pos.z);
  const rb = Math.hypot(b.pos.x, b.pos.z);
  const aa = Math.atan2(a.pos.z, a.pos.x);
  const ab = Math.atan2(b.pos.z, b.pos.x);
  const d = ra < 0.5 || rb < 0.5 ? 0 : shortestAngle(aa, ab);
  const arc = Math.sin(Math.PI * clamp(k)) * drama;
  const span = Math.abs(d) + Math.abs(rb - ra) * 0.01;
  const r = lerp(ra, rb, k) + arc * Math.min(span * 5, 10);
  const th = aa + d * k;
  const y = lerp(a.pos.y, b.pos.y, k) + arc * Math.min(span * 7, 14);
  o.pos.set(Math.cos(th) * r, y, Math.sin(th) * r);
  o.target.lerpVectors(a.target, b.target, k);
  o.fov = lerp(a.fov, b.fov, k) + arc * Math.min(span * 3, 5);
}

/** The scroll journey: progress 0..6 across the seven stops. */
export function journeyPose(p: number, aspect: number, pose: Pose) {
  const max = planets.length;
  const i = Math.min(Math.floor(p), max - 1);
  const f = clamp(p - i);
  stopPose(i, aspect, A);
  if (f < 1e-4) return copyPose(A, pose);
  stopPose(i + 1, aspect, B);
  blendPose(A, B, f, pose);
}

const d0 = new Vector3(0.14, 0.98, 0.16).normalize();
const d1 = new Vector3();
const t0 = new Vector3();
const O = makePose();

/**
 * Opening shot: begins a breath above the photosphere looking across the
 * horizon, then pulls back exponentially to reveal the whole system.
 */
export function introPose(k: number, aspect: number, pose: Pose) {
  overviewPose(aspect, O);
  const D1 = O.pos.length();
  const D0 = SUN_RADIUS + 0.5;
  d1.copy(O.pos).normalize();
  q.setFromUnitVectors(d0, d1);
  qi.identity().slerp(q, smoothstep(0, 1, k));
  pose.pos.copy(d0).applyQuaternion(qi).multiplyScalar(D0 * Math.pow(D1 / D0, k));
  t0.copy(d0).multiplyScalar(D0 - 1.6).add(right.set(-0.55, 0, -0.83).multiplyScalar(9));
  pose.target.lerpVectors(t0, O.target, smoothstep(0.04, 0.8, k));
  pose.fov = lerp(60, O.fov, smoothstep(0, 0.9, k));
}

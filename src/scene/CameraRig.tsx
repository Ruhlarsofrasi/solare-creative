import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import gsap from 'gsap';
import { planetById, planets } from '../config/planets';
import { projectBySlug } from '../content/projects';
import { clamp, damp, shortestAngle, smoothstep } from '../lib/math';
import type { Route } from '../lib/router';
import { bridge } from '../state/bridge';
import { useStore } from '../state/store';
import { blendPose, copyPose, farPose, introPose, journeyPose, makePose, planetFocusPose, planetStopPose, screenPose, type Pose } from './poses';

/**
 * Direction of the Hizala line around the sun: toward the lower left of the overview, where the
 * frame is empty. Planets spread across the screen instead of stacking in depth, so Saturn's
 * rings stay clear of their neighbours. Portrait screens have no room sideways, so the line
 * turns a little further down there. (bridge.alignAngle can override it.)
 */
const alignAngle = (aspect: number) => (Number.isFinite(bridge.alignAngle) ? bridge.alignAngle : aspect < 0.9 ? 1.8 : 2.0);
const routeKey = (r: Route) => (r.kind === 'planet' ? `p:${r.id}` : r.kind === 'project' ? `w:${r.slug}` : r.kind);

const desired = makePose();
const from = makePose();
const current = makePose();
const fwd = new Vector3();
const right = new Vector3();
const up = new Vector3();
const UP = new Vector3(0, 1, 0);
const v = new Vector3();

function desiredPose(route: Route, aspect: number, pose: Pose) {
  switch (route.kind) {
    case 'home':
      return journeyPose(bridge.progress, aspect, pose);
    case 'planet':
      return planetFocusPose(planetById(route.id)!, pose);
    case 'project': {
      if (screenPose(route.slug, aspect, pose)) return;
      const p = projectBySlug(route.slug);
      return planetStopPose(planetById(p ? p.planet : 'films')!, aspect, pose);
    }
    default:
      return farPose(aspect, pose);
  }
}

/**
 * System clock + cinematographer.
 * Runs first every frame: advances the orbits, resolves the pose the current
 * route asks for, and flies the camera there along an orbital arc.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const key = useRef<string>('');
  const flight = useRef({ k: 1 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const first = useRef(true);

  useEffect(() => {
    bridge.camera = camera;
    return () => {
      bridge.camera = null;
      tween.current?.kill();
    };
  }, [camera]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = useStore.getState();
    const aspect = size.width / size.height;
    bridge.size.w = size.width;
    bridge.size.h = size.height;

    // ── clock & orbits ────────────────────────────────────────────────
    bridge.time += dt;
    if (!s.reducedMotion) bridge.orbitTime += dt;
    bridge.flareAge += dt;
    bridge.flare = bridge.flareAge < 8 ? Math.min(bridge.flareAge / 0.3, 1) * Math.exp(-bridge.flareAge * 0.75) * 0.45 : 0;
    const al = smoothstep(0, 1, bridge.align);
    for (const p of planets) {
      let a = p.orbit.angle + p.orbit.speed * bridge.orbitTime;
      if (al > 0) a += shortestAngle(a, alignAngle(aspect)) * al;
      bridge.planetAngle[p.id] = a;
      bridge.planetPos[p.id].set(Math.cos(a) * p.orbit.radius, p.orbit.y * (1 - al), Math.sin(a) * p.orbit.radius);
    }

    // ── opening shot (8 s, eased in and out) ──────────────────────────
    if (bridge.introSpeed > 0) {
      bridge.introT = Math.min(1, bridge.introT + (dt * bridge.introSpeed) / 8);
      const t = bridge.introT;
      bridge.intro = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      if (t >= 1) {
        bridge.intro = 1;
        bridge.introSpeed = 0;
        useStore.setState({ introDone: true });
      }
    }

    // ── journey progress ──────────────────────────────────────────────
    bridge.progressTarget = clamp(bridge.progressTarget, 0, planets.length);
    // the target is already eased by the travel tween; this only rounds off the last edge
    bridge.progress = bridge.progressTarget;

    // ── pose ──────────────────────────────────────────────────────────
    const inIntro = bridge.intro < 1 && s.route.kind === 'home';
    if (inIntro) introPose(bridge.intro, aspect, desired);
    else desiredPose(s.route, aspect, desired);

    // every stop change is its own directed flight — the same move the "next destination" link uses,
    // straight from where the camera is to where it is going, and re-targetable mid-air
    const k = routeKey(s.route) + (s.route.kind === 'home' ? `:${s.stop}` : '');
    if (k !== key.current) {
      const wasEmpty = first.current;
      first.current = false;
      key.current = k;
      tween.current?.kill();
      if (wasEmpty || s.reducedMotion) {
        flight.current.k = 1;
      } else {
        copyPose(current, from);
        const dist = from.pos.distanceTo(desired.pos);
        flight.current.k = 0;
        tween.current = gsap.to(flight.current, {
          k: 1,
          duration: clamp(1.9 + dist * 0.012, 2.1, 3.4),
          ease: 'power3.inOut',
        });
      }
    }
    bridge.flightK = flight.current.k;
    if (flight.current.k < 1) blendPose(from, desired, flight.current.k, current, 0.8);
    else copyPose(desired, current);

    camera.position.copy(current.pos);
    // pointer parallax + a slow breathing drift, in camera space
    fwd.copy(current.target).sub(current.pos);
    const reach = fwd.length();
    fwd.normalize();
    right.crossVectors(fwd, UP).normalize();
    up.crossVectors(right, fwd);
    const ps = bridge.pointerSmooth;
    ps.x = damp(ps.x, bridge.pointer.x, 2.6, dt);
    ps.y = damp(ps.y, bridge.pointer.y, 2.6, dt);
    if (!s.reducedMotion) {
      const amt = reach * (s.route.kind === 'home' ? 0.035 : 0.014) * (inIntro ? bridge.intro : 1);
      camera.position.addScaledVector(right, ps.x * amt + Math.sin(bridge.time * 0.11) * amt * 0.25);
      camera.position.addScaledVector(up, ps.y * amt * 0.7 + Math.cos(bridge.time * 0.09) * amt * 0.18);
    }
    camera.up.copy(UP);
    camera.lookAt(current.target);
    if (Math.abs(camera.fov - current.fov) > 0.01) {
      camera.fov = current.fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();

    // ── data for spatial audio ────────────────────────────────────────
    v.set(0, 0, 0).project(camera);
    bridge.sun.x = clamp(v.x, -1.5, 1.5);
    bridge.sun.y = v.y;
    bridge.sun.facing = v.z < 1 ? 1 : -1;
    bridge.sun.dist = camera.position.length();
    const near = s.route.kind === 'home' ? planets[Math.round(bridge.progress) - 1] : s.route.kind === 'planet' ? planetById(s.route.id) : undefined;
    if (near) {
      v.copy(bridge.planetPos[near.id]).project(camera);
      bridge.focus.x = clamp(v.x, -1, 1);
      bridge.focus.dist = camera.position.distanceTo(bridge.planetPos[near.id]);
    } else {
      bridge.focus.x = 0;
      bridge.focus.dist = 999;
    }
  }, -3);

  return null;
}

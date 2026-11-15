import type { PlanetKind } from '../../config/planets';
import { noise, tail } from './noise';

export const planetVertex = /* glsl */ `
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
varying vec2 vUv;
void main(){
  vObj = position;
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position,1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const head = /* glsl */ `
uniform float uTime;
uniform float uHover;
uniform float uReady;
uniform vec3 uAtmo;
uniform vec3 uFallback;
uniform sampler2D uMap;
uniform sampler2D uNight;
uniform sampler2D uClouds;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
varying vec2 vUv;
${noise}
// The sun is the only light. N and L are in world space, so however a planet
// is spun or dragged, its day side always faces the sun.
float diffuse(vec3 N, vec3 L){ return smoothstep(-0.1, 0.85, dot(N, L)); }
vec3 surface(vec2 uv){ return mix(uFallback, texture2D(uMap, uv).rgb, uReady); }
`;

/**
 * The six destinations are the real planets, Mercury to Saturn, shaded from
 * high-resolution equirectangular maps (public/textures) with a little
 * procedural life on top: drifting cloud, city lights, band shear.
 */
const bodies: Record<PlanetKind | 'moon', string> = {
  mercury: /* glsl */ `
vec3 shade(vec3 p, vec3 N, vec3 L, vec3 V){
  vec3 albedo = surface(vUv) * 1.35;
  albedo *= 0.9 + 0.2 * (fbm(p * 42.0) * 0.5 + 0.5);
  // airless: a hard terminator
  float dif = smoothstep(-0.02, 0.6, dot(N, L));
  return albedo * (0.035 + dif * 1.15);
}`,

  venus: /* glsl */ `
vec3 shade(vec3 p, vec3 N, vec3 L, vec3 V){
  vec2 uv = vUv;
  uv.x += uTime * 0.0007 + 0.01 * snoise(p * 2.2 + vec3(0.0, uTime * 0.02, 0.0));
  vec3 albedo = surface(uv) * 1.1;
  float dif = diffuse(N, L);
  float ndv = max(dot(N, V), 0.0);
  vec3 c = albedo * (0.05 + dif * 1.05);
  c += uAtmo * pow(1.0 - ndv, 2.4) * (0.1 + dif * 0.7);
  return c;
}`,

  earth: /* glsl */ `
vec3 shade(vec3 p, vec3 N, vec3 L, vec3 V){
  vec3 day = surface(vUv);
  float clouds = texture2D(uClouds, vUv + vec2(uTime * 0.0011, 0.0)).r * uReady;
  float shadow = texture2D(uClouds, vUv + vec2(uTime * 0.0011 - 0.004, 0.002)).r * uReady;
  float water = clamp((day.b - day.r) * 5.0, 0.0, 1.0);
  float ndl = dot(N, L);
  float dif = diffuse(N, L);
  float ndv = max(dot(N, V), 0.0);
  vec3 c = day * (0.035 + dif * 1.1) * (1.0 - shadow * 0.35);
  float spec = pow(max(dot(reflect(-V, N), L), 0.0), 70.0) * water * (1.0 - clouds);
  c += vec3(1.0, 0.93, 0.8) * spec * 1.4;
  c = mix(c, vec3(1.0) * (0.04 + dif * 1.1), clamp(clouds * 1.15, 0.0, 1.0));
  // city lights on the night side
  float night = smoothstep(0.08, -0.22, ndl);
  c += texture2D(uNight, vUv).rgb * vec3(1.0, 0.82, 0.55) * night * (1.0 - clouds * 0.75) * 1.7 * uReady;
  // sunset band + Rayleigh rim
  c += vec3(1.0, 0.45, 0.18) * smoothstep(0.16, 0.0, abs(ndl)) * 0.025;
  c += uAtmo * pow(1.0 - ndv, 2.6) * (0.08 + dif * 0.9);
  return c;
}`,

  mars: /* glsl */ `
vec3 shade(vec3 p, vec3 N, vec3 L, vec3 V){
  vec3 albedo = surface(vUv) * 1.12;
  albedo *= 0.92 + 0.16 * (fbm(p * 46.0) * 0.5 + 0.5);
  float dif = diffuse(N, L);
  float ndv = max(dot(N, V), 0.0);
  vec3 c = albedo * (0.04 + dif * 1.1);
  c += uAtmo * pow(1.0 - ndv, 3.2) * (0.04 + dif * 0.5);
  return c;
}`,

  jupiter: /* glsl */ `
vec3 shade(vec3 p, vec3 N, vec3 L, vec3 V){
  vec2 uv = vUv;
  uv.x += 0.0035 * sin(p.y * 38.0 + uTime * 0.06) + uTime * 0.0004;
  vec3 albedo = surface(uv) * 1.08;
  float dif = diffuse(N, L);
  float ndv = max(dot(N, V), 0.0);
  vec3 c = albedo * (0.045 + dif * 1.08);
  c *= mix(0.72, 1.0, pow(ndv, 0.35));
  c += uAtmo * pow(1.0 - ndv, 3.2) * (0.04 + dif * 0.4);
  return c;
}`,

  saturn: /* glsl */ `
vec3 shade(vec3 p, vec3 N, vec3 L, vec3 V){
  vec2 uv = vUv;
  uv.x += 0.003 * sin(p.y * 30.0 + uTime * 0.05);
  vec3 albedo = surface(uv) * 1.1;
  float dif = diffuse(N, L);
  float ndv = max(dot(N, V), 0.0);
  vec3 c = albedo * (0.045 + dif * 1.05);
  c *= mix(0.74, 1.0, pow(ndv, 0.35));
  c += uAtmo * pow(1.0 - ndv, 3.2) * (0.04 + dif * 0.4);
  return c;
}`,

  moon: /* glsl */ `
vec3 shade(vec3 p, vec3 N, vec3 L, vec3 V){
  vec3 albedo = surface(vUv) * 1.3 * uAtmo;
  float dif = smoothstep(-0.02, 0.6, dot(N, L));
  vec3 c = albedo * (0.035 + dif * 1.15);
  c += vec3(1.0, 0.8, 0.5) * uHover * 0.9 * (0.3 + pow(1.0 - max(dot(N, V), 0.0), 2.0));
  return c;
}`,
};

export const planetFragment = (kind: PlanetKind | 'moon') => /* glsl */ `
${head}
${bodies[kind]}
void main(){
  vec3 p = normalize(vObj);
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(-vWorld);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 c = shade(p, N, L, V);
  c *= 1.0 + uHover * 0.14;
  gl_FragColor = vec4(c, 1.0);
  ${tail}
}`;

/** Additive atmosphere shell rendered on back faces. */
export const atmosphereFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uNorm;
uniform float uStrength;
uniform float uHover;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
varying vec2 vUv;
void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = normalize(-vWorld);
  float f = clamp(abs(dot(N, V)) / uNorm, 0.0, 1.0);
  float lit = smoothstep(-0.55, 0.45, dot(N, L));
  float i = pow(f, 2.6) * mix(0.1, 1.0, lit) * (uStrength + uHover * 0.5);
  gl_FragColor = vec4(uColor * i, 1.0);
  ${tail}
}`;

/** Saturn's rings from a radial colour/alpha strip, with the planet's cast shadow. */
export const ringFragment = /* glsl */ `
uniform sampler2D uRing;
uniform float uReady;
uniform vec3 uCenter;
uniform float uRadius;
uniform float uInner;
uniform float uOuter;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
varying vec2 vUv;
void main(){
  float r = length(vObj.xy);
  float u = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
  vec4 t = texture2D(uRing, vec2(u, 0.5));
  vec3 ro = vWorld - uCenter;
  vec3 rd = normalize(-vWorld);
  float b = dot(ro, rd);
  float h = b * b - (dot(ro, ro) - uRadius * uRadius);
  float shadow = (b < 0.0) ? 1.0 - smoothstep(-0.4, 0.6, h) * 0.93 : 1.0;
  vec3 V = normalize(cameraPosition - vWorld);
  float fwd = pow(max(dot(V, -rd), 0.0), 6.0);
  vec3 c = t.rgb * (0.75 + fwd * 1.2) * shadow;
  gl_FragColor = vec4(c, t.a * 0.95 * uReady);
  ${tail}
}`;

/** Dark physically-inspired metal with a fake sun reflection — billboard frames. */
export const metalFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uFlat;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
varying vec2 vUv;
void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorld);
  if (uFlat > 0.5) { N = normalize(cross(dFdx(vWorld), dFdy(vWorld))); }
  if (dot(N, V) < 0.0) N = -N;
  vec3 L = normalize(-vWorld);
  vec3 R = reflect(-V, N);
  float rl = max(dot(R, L), 0.0);
  float dif = smoothstep(-0.1, 0.9, dot(N, L));
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 c = uColor * (0.1 + dif * 0.8);
  c += vec3(1.0, 0.85, 0.62) * (pow(rl, 60.0) * 3.0 + pow(rl, 6.0) * 0.35);
  c += vec3(0.5, 0.55, 0.6) * fres * 0.22;
  gl_FragColor = vec4(c, 1.0);
  ${tail}
}`;

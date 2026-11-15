import { tail } from './noise';

/**
 * "Light study" — the procedural demo visual used wherever a real film has not
 * been supplied yet. Written in portable GLSL (ES 1.0 compatible) so the exact
 * same picture runs on the 3D billboards and in the full-screen project player.
 */
export const demoVisual = /* glsl */ `
float dv_hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float dv_noise(vec2 p){
  vec2 i=floor(p);vec2 f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(dv_hash(i),dv_hash(i+vec2(1.0,0.0)),f.x),mix(dv_hash(i+vec2(0.0,1.0)),dv_hash(i+vec2(1.0,1.0)),f.x),f.y);
}
float dv_fbm(vec2 p){
  float s=0.0;float a=0.5;
  for(int i=0;i<4;i++){s+=a*dv_noise(p);p=p*2.03+vec2(11.7,5.3);a*=0.5;}
  return s;
}
vec3 demoVisual(vec2 uv, float t, float seed, vec3 A, vec3 B, vec3 C, float aspect){
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float s = seed * 17.0;
  float wide = min(aspect, 1.6);
  float hz = -0.1 + 0.07 * sin(t * 0.11 + s);
  vec2 sp = vec2(0.26 * wide * sin(t * 0.07 + s * 1.3), hz + 0.13 + 0.11 * sin(t * 0.05 + s * 0.7));
  float d = length(p - sp);
  float disc = smoothstep(0.105, 0.095, d);
  float glow = exp(-d * 3.0);
  float n = dv_fbm(vec2(p.x * 1.3 + t * 0.03, p.y * 2.6 - t * 0.02) + s);
  vec3 sky = mix(C, B, smoothstep(-0.45, 0.65, p.y * 1.1 + n * 0.4 + glow * 0.55));
  sky = mix(sky, A, glow * 0.85);
  sky += A * disc * 0.85;
  // drifting veils of light
  float shaft = smoothstep(0.35, 0.95, dv_fbm(vec2((p.x + p.y * 0.55) * 2.6 + s, t * 0.06)));
  sky += A * shaft * 0.1;
  // reflective plane below the horizon
  float below = smoothstep(hz + 0.003, hz - 0.003, p.y);
  float depth = max(hz - p.y, 0.0);
  vec2 rp = vec2(p.x + sin(p.y * 95.0 + t * 1.4) * 0.05 * depth, 2.0 * hz - p.y);
  float rd = length(vec2(rp.x - sp.x, (rp.y - sp.y) * 0.3));
  vec3 water = mix(C * 0.55, B * 0.65, exp(-rd * 3.5)) + A * exp(-rd * 9.0) * 0.75;
  water *= 0.86 + 0.14 * dv_noise(vec2(p.x * 5.0, p.y * 38.0 + t * 0.8));
  vec3 col = mix(sky, water, below);
  // architectural rhythm: soft colonnade shadows (varies by seed)
  float kind = fract(seed * 3.71);
  float cols = smoothstep(0.36, 0.5, abs(fract(p.x * (1.6 + kind * 2.0) + s) - 0.5));
  col *= 1.0 - cols * 0.42 * step(0.45, kind) * (1.0 - below * 0.6);
  // lens: vignette + grain
  float vig = smoothstep(1.25, 0.25, length(p * vec2(0.9 / max(aspect, 1.0) * 1.6, 1.25)));
  col *= 0.35 + 0.65 * vig;
  col += (dv_hash(uv * 800.0 + fract(t) * 60.0) - 0.5) * 0.018;
  return max(col, 0.0);
}`;

export const screenVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormalW;
void main(){
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position,1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

export const screenFragment = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uAspect;
uniform float uHover;
uniform float uFlip;
uniform float uUseVideo;
uniform float uPresence;
uniform float uTexAspect;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform sampler2D uMap;
uniform sampler2D uVideo;
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormalW;
${demoVisual}
void main(){
  vec2 uv = vUv;
  if (uFlip > 0.5) uv.x = 1.0 - uv.x;
  // hover is deliberately quiet: a slight push-in, never faster playback
  vec2 zuv = (uv - 0.5) * (1.0 - uHover * 0.025) + 0.5;
  vec3 col = demoVisual(zuv, uTime * 0.4 + uSeed * 40.0, uSeed, uA, uB, uC, uAspect);
  if (uUseVideo > 0.5) {
    // cover-fit the photograph / film into the screen, with a slow drift for stills
    float r = uAspect / max(uTexAspect, 0.01);
    vec2 s = r > 1.0 ? vec2(1.0, 1.0 / r) : vec2(r, 1.0);
    float drift = 0.955 + 0.02 * sin(uTime * 0.07 + uSeed * 9.0);
    col = texture2D(uVideo, (zuv - 0.5) * s * drift + 0.5).rgb;
  }
  vec4 ov = texture2D(uMap, uv);
  col = mix(col, ov.rgb, ov.a * 0.92);
  // monumental LED architecture: faint module seams
  vec2 m = fract(uv * vec2(uAspect, 1.0) * 6.0);
  float seam = smoothstep(0.0, 0.012, m.x) * smoothstep(0.0, 0.012, m.y);
  col *= mix(0.72, 1.0, seam);
  // glass sheen
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - abs(dot(normalize(vNormalW), V)), 3.0);
  col += vec3(1.0, 0.9, 0.75) * fres * 0.08;
  float edge = smoothstep(0.0, 0.01, uv.x) * smoothstep(1.0, 0.99, uv.x) * smoothstep(0.0, 0.015, uv.y) * smoothstep(1.0, 0.985, uv.y);
  col *= edge * (0.9 + uHover * 0.14) * uPresence * 1.2;
  gl_FragColor = vec4(col, 1.0);
  ${tail}
}`;

export const starVertex = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uScale;
varying vec3 vColor;
varying float vTw;
void main(){
  vColor = aColor;
  float tw = 0.75 + 0.25 * sin(uTime * (0.6 + aPhase * 1.7) + aPhase * 40.0);
  vTw = tw;
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uScale * tw;
}`;

export const starFragment = /* glsl */ `
varying vec3 vColor;
varying float vTw;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  float i = pow(core, 2.6);
  gl_FragColor = vec4(vColor * i * vTw * 1.3, 1.0);
  ${tail}
}`;

export const nebulaFragment = /* glsl */ `
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
varying vec2 vUv;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float vn(vec3 p){
  vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);
}
void main(){
  vec3 d = normalize(vObj);
  float n = vn(d * 2.2) * 0.55 + vn(d * 5.0 + 3.0) * 0.3 + vn(d * 11.0 + 7.0) * 0.15;
  float band = exp(-pow((d.y + d.x * 0.35 + (n - 0.5) * 0.5) * 2.4, 2.0));
  float dust = smoothstep(0.42, 0.85, n);
  vec3 warm = vec3(0.075, 0.034, 0.014);
  vec3 cool = vec3(0.012, 0.022, 0.02);
  vec3 c = mix(cool, warm, dust) * band * (0.35 + dust * 1.1);
  gl_FragColor = vec4(c, 1.0);
  ${tail}
}`;

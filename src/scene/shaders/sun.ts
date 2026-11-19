import { noise, tail } from './noise';

export const sunVertex = /* glsl */ `
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
void main(){
  vObj = position;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position,1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/**
 * Photosphere: domain-warped convection, granulation cells with dark lanes,
 * bright magnetic filaments, sunspots, limb darkening and a flare hot-spot.
 */
export const sunFragment = /* glsl */ `
uniform float uTime;
uniform float uFlare;
uniform vec3 uFlareDir;
uniform float uDetail;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
${noise}
void main(){
  vec3 p = normalize(vObj);
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorld);
  float t = uTime * 0.045;

  vec3 q = p * 2.1;
  vec3 w = vec3(
    snoise(q + vec3(0.0, t, 0.0)),
    snoise(q + vec3(5.2, -t, 1.3)),
    snoise(q * 1.3 + vec3(-3.1, 2.7, t)));

  // large scale convection
  float large = fbm(q + w * 0.6 + vec3(t * 0.6));

  // granulation: bright cells, thin dark lanes
  float g1 = abs(snoise(p * 17.0 + w * 1.6 + vec3(0.0, t * 3.0, 0.0)));
  float g2 = abs(snoise(p * 41.0 + w * 2.2 - vec3(t * 5.0)));
  float gran = sqrt(g1) * 0.65 + sqrt(g2) * 0.35 * uDetail;

  // magnetic filaments
  float fil = pow(1.0 - abs(snoise(q * 1.9 + w * 0.9 + vec3(t * 1.4))), 7.0);

  // sunspots — rare, cool, with a soft penumbra
  float sp = snoise(p * 1.7 + vec3(4.0, t * 0.25, 9.0)) * 0.5 + 0.5;
  float spots = smoothstep(0.74, 0.9, sp);

  float heat = 0.27 + large * 0.6 + (gran - 0.5) * 0.6 + fil * 0.6 - spots * 0.9;

  vec3 deep  = vec3(0.16, 0.012, 0.0);
  vec3 ember = vec3(0.86, 0.17, 0.012);
  vec3 gold  = vec3(1.0, 0.5, 0.1);
  vec3 white = vec3(1.0, 0.88, 0.62);
  vec3 c = mix(deep, ember, smoothstep(0.0, 0.45, heat));
  c = mix(c, gold, smoothstep(0.4, 0.85, heat));
  c = mix(c, white, smoothstep(0.9, 1.4, heat));

  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float limb = pow(1.0 - ndv, 2.2);
  c *= mix(1.0, 0.3, limb);                          // limb darkening
  c += vec3(1.0, 0.42, 0.08) * pow(1.0 - ndv, 5.0) * 1.4; // chromosphere rim

  // flare hot-spot
  float fd = max(dot(p, normalize(uFlareDir)), 0.0);
  float hot = pow(fd, 260.0) * uFlare;
  c += vec3(1.0, 0.86, 0.6) * hot * 8.0;
  c *= 1.0 + uFlare * 0.35;

  gl_FragColor = vec4(c * 1.75, 1.0);
  ${tail}
}`;

export const billboardVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`;

/** Outer corona: camera-facing, layered glow + animated streamers. */
export const coronaFragment = /* glsl */ `
uniform float uTime;
uniform float uSize;   // half size of the quad in sun radii
uniform float uEdge;   // apparent silhouette scale (perspective correction)
uniform float uFlare;
uniform float uDim;    // 1 = normal, ~0 during a total eclipse
varying vec2 vUv;
${noise}
void main(){
  vec2 uv = (vUv - 0.5) * 2.0;
  float rr = length(uv);
  float r = max(rr * uSize / uEdge, 0.985);
  vec2 dir = uv / max(rr, 1e-4);
  float d = r - 1.0;

  float inner = exp(-d * 5.5);
  float mid   = exp(-d * 1.7);
  float outer = exp(-d * 0.55);

  float flow = uTime * 0.05;
  float n1 = fbm(vec3(dir * 2.6, d * 0.9 - flow)) * 0.5 + 0.5;
  float rays = pow(clamp(snoise(vec3(dir * 4.2, uTime * 0.02 + 3.0)) * 0.5 + 0.55, 0.0, 1.0), 3.0);
  float fine = snoise(vec3(dir * 13.0, d * 1.4 - uTime * 0.12)) * 0.5 + 0.5;

  float i = inner * 0.9 + mid * (0.26 + n1 * 0.45) + outer * 0.06;
  i += rays * mid * (0.5 + fine * 0.9) * (1.0 + uFlare * 2.0);
  i += outer * rays * 0.12;
  i *= 1.0 + uFlare * 0.8;
  i *= 1.0 - smoothstep(0.62, 1.0, rr);

  vec3 hot = vec3(1.0, 0.86, 0.62);
  vec3 warm = vec3(1.0, 0.46, 0.12);
  vec3 far = vec3(0.75, 0.2, 0.04);
  vec3 c = mix(warm, hot, inner);
  c = mix(far, c, clamp(mid * 1.6, 0.0, 1.0));
  gl_FragColor = vec4(c * i * 1.25 * uDim, 1.0);
  ${tail}
}`;

/** Inner chromosphere shell (back faces) — gives the horizon glow in close-ups. */
export const shellFragment = /* glsl */ `
uniform float uDim;
uniform float uTime;
uniform float uFlare;
uniform float uNorm;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
${noise}
void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vWorld);
  float f = clamp(abs(dot(N, V)) / uNorm, 0.0, 1.0);
  float n = snoise(normalize(vObj) * 5.0 + vec3(0.0, uTime * 0.12, 0.0)) * 0.5 + 0.5;
  float i = pow(f, 2.4) * (0.75 + n * 0.5);
  vec3 c = mix(vec3(1.0, 0.3, 0.05), vec3(1.0, 0.75, 0.4), pow(f, 4.0));
  gl_FragColor = vec4(c * i * (1.6 + uFlare * 1.5) * uDim, 1.0);
  ${tail}
}`;

export const prominenceVertex = /* glsl */ `
uniform float uTime;
uniform float uPhase;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main(){
  vUv = uv;
  vec3 pos = position;
  // breathing loop
  float b = sin(uTime * 0.35 + uPhase) * 0.5 + 0.5;
  pos.y *= 0.75 + b * 0.45;
  pos.z += sin(uv.x * 6.2831 + uTime * 0.5 + uPhase) * 0.06;
  vec4 w = modelMatrix * vec4(pos,1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - w.xyz);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

export const prominenceFragment = /* glsl */ `
uniform float uTime;
uniform float uPhase;
uniform float uFlare;
uniform float uGrow;
uniform float uFade;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
${noise}
void main(){
  float along = vUv.x;
  float flow = snoise(vec3(along * 7.0 - uTime * 0.55, vUv.y * 4.0, uPhase)) * 0.5 + 0.5;
  float strands = snoise(vec3(along * 22.0 - uTime * 1.1, vUv.y * 9.0, uPhase * 2.0)) * 0.5 + 0.5;
  float feet = smoothstep(0.0, 0.08, along) * smoothstep(1.0, 0.92, along);
  float soft = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 1.3);
  float life = 0.45 + 0.55 * (sin(uTime * 0.18 + uPhase * 3.0) * 0.5 + 0.5);
  float i = (0.25 + flow * 0.9) * (0.5 + strands * 0.8) * feet * soft * life;
  // eruptions: the rope is thrown from one foot and reconnects at the other
  float tip = exp(-pow((along - uGrow) * 16.0, 2.0)) * step(uGrow, 1.08) * 2.2;
  i = (i * smoothstep(uGrow, uGrow - 0.14, along) + tip * soft) * uFade;
  vec3 c = mix(vec3(1.0, 0.22, 0.03), vec3(1.0, 0.7, 0.3), flow * strands);
  gl_FragColor = vec4(c * i * 2.4, 1.0);
  ${tail}
}`;

/** Coronal mass ejection shock ring (secret interaction). */
export const shockFragment = /* glsl */ `
uniform float uAge;
varying vec2 vUv;
${noise}
void main(){
  vec2 uv = (vUv - 0.5) * 2.0;
  float r = length(uv);
  float front = clamp(uAge / 6.0, 0.0, 1.0);
  float ring = exp(-pow((r - front) * 22.0, 2.0));
  float wake = smoothstep(front, front - 0.25, r) * smoothstep(0.0, front, r) * 0.25;
  float n = snoise(vec3(uv * 6.0, uAge * 0.4)) * 0.5 + 0.5;
  float fade = (1.0 - front) * smoothstep(0.0, 0.06, front);
  float i = (ring * (0.6 + n * 0.8) + wake * n) * fade;
  gl_FragColor = vec4(vec3(1.0, 0.62, 0.28) * i * 2.2, 1.0);
  ${tail}
}`;

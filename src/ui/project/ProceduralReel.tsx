import { useEffect, useRef, useState } from 'react';
import { Color } from 'three';
import { projectSeed, type Project } from '../../content/projects';
import { demoVisual } from '../../scene/shaders/screen';
import { Poster } from '../pages/shared';

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `precision highp float;
uniform float uTime; uniform float uSeed; uniform float uAspect;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
varying vec2 vUv;
${demoVisual}
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){
  vec3 col = demoVisual(vUv, uTime + uSeed * 40.0, uSeed, uA, uB, uC, uAspect);
  col = aces(col * 1.15);
  gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}`;

/**
 * Full-frame version of the billboard's procedural "light study", rendered
 * with a tiny dedicated WebGL program. `getTime` makes it scrubbable.
 * Falls back to a static poster if WebGL is unavailable.
 */
export function ProceduralReel({ project, getTime, className = '', maxDpr = 1.5 }: { project: Project; getTime: () => number; className?: string; maxDpr?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const time = useRef(getTime);
  time.current = getTime;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) {
      setFailed(true);
      return;
    }
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const cols = project.palette.map((h) => new Color(h));
    gl.uniform3f(u('uA'), cols[0].r, cols[0].g, cols[0].b);
    gl.uniform3f(u('uB'), cols[1].r, cols[1].g, cols[1].b);
    gl.uniform3f(u('uC'), cols[2].r, cols[2].g, cols[2].b);
    gl.uniform1f(u('uSeed'), projectSeed(project.slug));
    const uTime = u('uTime');
    const uAspect = u('uAspect');

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      w = Math.max(2, Math.round(el.clientWidth * dpr));
      h = Math.max(2, Math.round(el.clientHeight * dpr));
      el.width = w;
      el.height = h;
      gl.viewport(0, 0, w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let raf = 0;
    let lastT = NaN;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const t = time.current();
      if (t === lastT) return;
      lastT = t;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uAspect, w / h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);
    const lost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    el.addEventListener('webglcontextlost', lost);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('webglcontextlost', lost);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [project, maxDpr]);

  if (failed) return <Poster project={{ ...project, poster: '' }} className={className} />;
  return <canvas ref={canvas} className={`reel ${className}`} aria-hidden="true" />;
}

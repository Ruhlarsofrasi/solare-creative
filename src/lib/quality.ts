export type Tier = 'low' | 'med' | 'high';
export type QualityPref = 'auto' | 'low' | 'high';

export interface TierSettings {
  dpr: number;
  octaves: number;
  stars: number;
  segments: number;
  bloom: boolean;
  bloomLevels: number;
  prominences: number;
  nebula: boolean;
}

export const tierSettings = (tier: Tier): TierSettings => {
  const device = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  switch (tier) {
    case 'high':
      return { dpr: Math.min(device, 1.5), octaves: 5, stars: 7000, segments: 96, bloom: true, bloomLevels: 7, prominences: 9, nebula: true };
    case 'med':
      return { dpr: Math.min(device, 1.25), octaves: 4, stars: 4500, segments: 64, bloom: true, bloomLevels: 5, prominences: 7, nebula: true };
    default:
      return { dpr: Math.min(device, 1), octaves: 3, stars: 2200, segments: 48, bloom: false, bloomLevels: 0, prominences: 4, nebula: false };
  }
};

export const isMobileDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760);

/** Best-effort GPU classification. Unknown hardware starts at "med" on mobile, "high" on desktop. */
export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'med';
  const mobile = isMobileDevice();
  let renderer = '';
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).toLowerCase();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    /* ignore */
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory || 4;

  if (/swiftshader|llvmpipe|software|basic render/.test(renderer)) return 'low';
  if (mobile) return cores >= 6 && mem >= 4 ? 'med' : 'low';
  // Older / integrated desktop GPUs → medium (RX 4xx/5xx, GTX 7xx–10 50, Intel HD/UHD/Iris)
  if (/intel|uhd|iris|hd graphics|rx 4[5-9]0|rx 5[5-9]0|r9 |r7 |gtx (6|7|9)\d0|gtx 10[5-6]0|gt \d|mx\d|radeon\(tm\) graphics|vega/.test(renderer)) return 'med';
  if (cores <= 4) return 'med';
  return 'high';
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const ok = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

// Generates public/og.png (1200x630) — a procedural sun, no dependencies.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const W = 1200, H = 630;
const raw = Buffer.alloc((W * 3 + 1) * H);
const cx = W * 0.5, cy = H * 0.44, R = 120;
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0;
  for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - cx, y - cy) / R;
    let r = 11, g = 11, b = 9;
    const glow = Math.exp(-Math.max(d - 1, 0) * 1.5), halo = Math.exp(-Math.max(d - 1, 0) * 0.45) * 0.3;
    if (d < 1) {
      const limb = Math.pow(1 - d * d, 0.35);
      r = 255 * (0.75 + 0.25 * limb); g = 190 * limb + 50; b = 90 * limb * limb + 10;
    } else {
      r += 255 * (glow * 0.9 + halo); g += 150 * glow * glow + 90 * halo; b += 50 * glow * glow * glow + 20 * halo;
    }
    // orbit ellipses
    for (const a of [2.1, 2.9, 3.7, 4.5]) {
      const e = Math.hypot((x - cx) / (R * a), (y - cy) / (R * a * 0.3));
      if (Math.abs(e - 1) < 0.004) { r += 40; g += 34; b += 24; }
    }
    if (hash(x, y) > 0.9988) { r += 150; g += 145; b += 130; }
    const i = y * (W * 3 + 1) + 1 + x * 3;
    raw[i] = Math.min(255, r); raw[i + 1] = Math.min(255, g); raw[i + 2] = Math.min(255, b);
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const v of buf) c = crcTable[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
writeFileSync(new URL('../public/og.png', import.meta.url), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
console.log('public/og.png written');
/*
 * CardWiz — Icon generator (no dependencies, pure Node).
 * Chalao:  node generate-icons.js   (ya `npm run icons`)
 *
 * Theme "CardWiz" = wizard: magic wand (gold star tip) + scattered green
 * cash notes on a magical purple tile. RGBA PNG, 4x supersampled AA.
 */
const zlib = require('zlib');
const fs = require('fs');

// ---- PNG encode (RGBA, color type 6) ----
const CRC = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
const crc32 = (b) => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const tb = Buffer.from(type, 'ascii');
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, data])), 0);
  return Buffer.concat([len, tb, data, cb]);
};

// ---- geometry helpers (normalized 0..1, y down) ----
function inRoundRect(px, py, x0, y0, x1, y1, r) {
  if (px < x0 || px > x1 || py < y0 || py > y1) return false;
  const cx = px < x0 + r ? x0 + r : (px > x1 - r ? x1 - r : px);
  const cy = py < y0 + r ? y0 + r : (py > y1 - r ? y1 - r : py);
  const dx = px - cx, dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay; const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function segT(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay; const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
function inStar(px, py, sx, sy, R) { // 4-point sparkle (astroid)
  const dx = Math.abs(px - sx), dy = Math.abs(py - sy);
  if (dx > R || dy > R) return false;
  return Math.sqrt(dx / R) + Math.sqrt(dy / R) <= 1;
}
const lerp = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

const BG_TOP = [0x53, 0x3c, 0x82];
const BG_BOT = [0x1e, 0x1e, 0x2e];
const WAND_A = [0x8a, 0x68, 0x3c];
const WAND_B = [0xf0, 0xd8, 0xa6];
const STAR   = [0xff, 0xe1, 0x7a];
const STAR_HI = [0xff, 0xf7, 0xda];
const NOTE   = [0x86, 0xd6, 0x84];
const NOTE_EDGE = [0x46, 0x9b, 0x52];
const NOTE_SEAL = [0xe2, 0xf7, 0xde];

// Ek cash note ka color (ya null). Rounded rect + thin border + center seal.
function noteColor(px, py, x0, y0, x1, y1) {
  if (!inRoundRect(px, py, x0, y0, x1, y1, 0.025)) return null;
  const i = 0.018;
  if (!inRoundRect(px, py, x0 + i, y0 + i, x1 - i, y1 - i, 0.02)) return NOTE_EDGE;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (Math.hypot(px - cx, py - cy) <= (y1 - y0) * 0.22) return NOTE_SEAL;
  return NOTE;
}

function sample(px, py) {
  if (!inRoundRect(px, py, 0.06, 0.06, 0.94, 0.94, 0.22)) return [0, 0, 0, 0];

  // 1) Magic sparkles + wand-tip star (topmost)
  if (inStar(px, py, 0.66, 0.37, 0.20)) {
    const d = Math.hypot(px - 0.66, py - 0.37);
    return [...(d < 0.06 ? STAR_HI : STAR), 255];
  }
  if (inStar(px, py, 0.82, 0.24, 0.07) || inStar(px, py, 0.52, 0.17, 0.05)) return [...STAR_HI, 255];

  // 2) Cash notes (front: note1, behind: note2) — scattered lower-left
  const n1 = noteColor(px, py, 0.15, 0.62, 0.45, 0.80);
  if (n1) return [...n1, 255];
  const n2 = noteColor(px, py, 0.10, 0.55, 0.38, 0.72);
  if (n2) return [...n2, 255];

  // 3) Wand stick (diagonal, wood gradient along length)
  if (distSeg(px, py, 0.34, 0.74, 0.63, 0.41) <= 0.052) {
    const t = segT(px, py, 0.34, 0.74, 0.63, 0.41);
    return [...lerp(WAND_A, WAND_B, t), 255];
  }

  // 4) Background vertical gradient
  return [...lerp(BG_TOP, BG_BOT, (py - 0.06) / 0.88), 255];
}

function png(size) {
  const SS = 4;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6; // RGBA
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4); row[0] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const s = sample((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size);
        r += s[0] * s[3]; g += s[1] * s[3]; b += s[2] * s[3]; a += s[3];
      }
      const alpha = a / (SS * SS);
      row[1 + x * 4]     = a ? Math.round(r / a) : 0;
      row[1 + x * 4 + 1] = a ? Math.round(g / a) : 0;
      row[1 + x * 4 + 2] = a ? Math.round(b / a) : 0;
      row[1 + x * 4 + 3] = Math.round(alpha);
    }
    rows.push(row);
  }
  const idat = zlib.deflateSync(Buffer.concat(rows), { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

for (const s of [16, 48, 128]) {
  fs.writeFileSync(`icon${s}.png`, png(s));
  console.log(`icon${s}.png written (${s}x${s})`);
}

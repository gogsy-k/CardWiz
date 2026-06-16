/*
 * CardWiz — Icon generator (no dependencies, pure Node).
 * Chalao:  node generate-icons.js   (ya `npm run icons`)
 *
 * Design: rounded mauve tile (gradient) + dark magnetic stripe + gold chip
 * + green sparkle ("best card"). RGBA PNG with 4x supersampled anti-aliasing.
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

// ---- shape helpers (normalized 0..1, y down) ----
function inRoundRect(px, py, x0, y0, x1, y1, r) {
  if (px < x0 || px > x1 || py < y0 || py > y1) return false;
  const cx = px < x0 + r ? x0 + r : (px > x1 - r ? x1 - r : px);
  const cy = py < y0 + r ? y0 + r : (py > y1 - r ? y1 - r : py);
  const dx = px - cx, dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}
// 4-point sparkle (astroid): sqrt(|dx|/R)+sqrt(|dy|/R) <= 1
function inSparkle(px, py, sx, sy, R) {
  const dx = Math.abs(px - sx), dy = Math.abs(py - sy);
  if (dx > R || dy > R) return false;
  return Math.sqrt(dx / R) + Math.sqrt(dy / R) <= 1;
}

const GRAD_TOP = [0xcb, 0xa6, 0xf7];
const GRAD_BOT = [0x9d, 0x72, 0xe6];
const STRIPE   = [0x1e, 0x1e, 0x2e];
const CHIP     = [0xf9, 0xe2, 0xaf];
const STAR     = [0xa6, 0xe3, 0xa1];

// Ek sub-point ka color+alpha (top-most element jeetta hai).
function sample(px, py) {
  const inTile = inRoundRect(px, py, 0.06, 0.06, 0.94, 0.94, 0.22);
  if (!inTile) return [0, 0, 0, 0];

  // Sparkle (lower-right)
  if (inSparkle(px, py, 0.68, 0.66, 0.165)) return [STAR[0], STAR[1], STAR[2], 255];
  // Chip (lower-left)
  if (inRoundRect(px, py, 0.17, 0.55, 0.40, 0.75, 0.05)) return [CHIP[0], CHIP[1], CHIP[2], 255];
  // Magnetic stripe (upper third)
  if (py >= 0.28 && py <= 0.43) return [STRIPE[0], STRIPE[1], STRIPE[2], 255];
  // Background vertical gradient
  const t = (py - 0.06) / 0.88;
  return [
    Math.round(GRAD_TOP[0] + (GRAD_BOT[0] - GRAD_TOP[0]) * t),
    Math.round(GRAD_TOP[1] + (GRAD_BOT[1] - GRAD_TOP[1]) * t),
    Math.round(GRAD_TOP[2] + (GRAD_BOT[2] - GRAD_TOP[2]) * t),
    255,
  ];
}

function png(size) {
  const SS = 4; // supersample
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6; // RGBA 8-bit
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4); row[0] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const px = (x + (sx + 0.5) / SS) / size;
        const py = (y + (sy + 0.5) / SS) / size;
        const s = sample(px, py);
        r += s[0] * s[3]; g += s[1] * s[3]; b += s[2] * s[3]; a += s[3];
      }
      const n = SS * SS;
      const alpha = a / n;
      // premultiplied avg -> straight color
      row[1 + x * 4]     = alpha ? Math.round(r / a) : 0;
      row[1 + x * 4 + 1] = alpha ? Math.round(g / a) : 0;
      row[1 + x * 4 + 2] = alpha ? Math.round(b / a) : 0;
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

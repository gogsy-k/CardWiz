/*
 * CardWiz — Icon generator (no dependencies, pure Node).
 * Chalao:  node generate-icons.js   (ya `npm run icons`)
 *
 * Design: a 3D-looking golden credit card — tilted, metallic gold gradient,
 * glossy sheen, chip, soft drop shadow. Transparent bg. RGBA, 4x AA.
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

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp = (v) => v < 0 ? 0 : v > 255 ? 255 : v;

// Card tilt
const TH = -12 * Math.PI / 180;
const C = Math.cos(TH), S = Math.sin(TH);

// point -> card-local coords around (cx,cy)
function local(px, py, cx, cy) {
  const dx = px - cx, dy = py - cy;
  return [C * dx + S * dy, -S * dx + C * dy];
}
// inside rounded rect (half-w hw, half-h hh, radius r) in local space
function inRR(lx, ly, hw, hh, r) {
  const ax = Math.abs(lx), ay = Math.abs(ly);
  if (ax > hw || ay > hh) return false;
  if (ax <= hw - r || ay <= hh - r) return true;
  return Math.hypot(ax - (hw - r), ay - (hh - r)) <= r;
}

// Card geometry
const CX = 0.50, CY = 0.47, HW = 0.37, HH = 0.234, R = 0.055;
// Shadow (offset down-right)
const SX = 0.535, SY = 0.555;

const GOLD_TOP = [255, 241, 183];
const GOLD_MID = [244, 197, 84];
const GOLD_BOT = [188, 130, 26];
const CHIP = [249, 224, 138];
const CHIP_LN = [150, 108, 33];

function goldAt(ly) {
  const t = (ly + HH) / (2 * HH); // 0 top -> 1 bottom
  return t < 0.5 ? lerp(GOLD_TOP, GOLD_MID, t * 2) : lerp(GOLD_MID, GOLD_BOT, (t - 0.5) * 2);
}

function sample(px, py) {
  // ---- Card (topmost) ----
  const [lx, ly] = local(px, py, CX, CY);
  if (inRR(lx, ly, HW, HH, R)) {
    let col = goldAt(ly);
    // bevel: raised top edge lighter, bottom edge darker (3D)
    if (ly < -HH + 0.03) col = lerp(col, [255, 255, 255], 0.30);
    else if (ly > HH - 0.03) col = lerp(col, [120, 80, 15], 0.30);
    // glossy diagonal sheen
    const band = 0.62 * lx + ly + 0.16;
    if (Math.abs(band) < 0.05) col = lerp(col, [255, 255, 255], 0.38 * (1 - Math.abs(band) / 0.05));
    // chip (left-center) with contacts
    const chx = lx - (-0.17), chy = ly - (-0.05);
    if (inRR(chx, chy, 0.082, 0.062, 0.022)) {
      col = CHIP.slice();
      if (Math.abs(chx) > 0.06 || Math.abs(chy) > 0.042) col = CHIP_LN.slice();         // border
      else if (Math.abs(chy) < 0.008 || Math.abs(chx) < 0.008) col = CHIP_LN.slice();   // grid lines
    }
    // card-number embossed lines (lower area)
    if (ly > 0.09 && ly < 0.125 && lx > -0.22 && lx < 0.10) col = lerp(col, [110, 72, 12], 0.5);
    if (ly > 0.09 && ly < 0.125 && lx > 0.14 && lx < 0.30) col = lerp(col, [110, 72, 12], 0.5);
    return [clamp(col[0]), clamp(col[1]), clamp(col[2]), 255];
  }

  // ---- Soft drop shadow (behind card) ----
  const [sx, sy] = local(px, py, SX, SY);
  if (inRR(sx, sy, HW + 0.01, HH + 0.01, R + 0.01)) {
    // feather alpha near edges for softness
    const ax = Math.abs(sx), ay = Math.abs(sy);
    const edge = Math.min(HW - ax, HH - ay);
    const a = Math.max(0, Math.min(1, edge / 0.06)) * 110;
    return [0, 0, 0, Math.round(a)];
  }

  return [0, 0, 0, 0];
}

function png(size) {
  const SS = 4;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
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

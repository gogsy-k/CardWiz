/*
 * CardWiz — Icon generator (no dependencies).
 * Chalao:  node generate-icons.js   (ya `npm run icons`)
 * Mauve "card" design ke 16/48/128 PNG banata hai.
 */
const zlib = require('zlib');
const fs = require('fs');

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

function png(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2; // RGB 8-bit
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3); row[0] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0xcb, g = 0xa6, b = 0xf7;                              // mauve bg
      const band = y > size * 0.4 && y < size * 0.56;               // card stripe
      const corner = (x < size * 0.12 && y < size * 0.12) || (x > size * 0.88 && y < size * 0.12)
        || (x < size * 0.12 && y > size * 0.88) || (x > size * 0.88 && y > size * 0.88);
      if (band || corner) { r = 0x1e; g = 0x1e; b = 0x2e; }
      row[1 + x * 3] = r; row[2 + x * 3] = g; row[3 + x * 3] = b;
    }
    rows.push(row);
  }
  const idat = zlib.deflateSync(Buffer.concat(rows));
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

for (const s of [16, 48, 128]) {
  fs.writeFileSync(`icon${s}.png`, png(s));
  console.log(`icon${s}.png written`);
}

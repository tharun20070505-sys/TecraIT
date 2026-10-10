/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[i] = c >>> 0;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, r, g, b, r2, g2, b2) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk("IHDR", ihdr);

  const rowBytes = 1 + width * 3;
  const rawData = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowBytes;
    rawData[rowStart] = 0;
    const factor = y / (height || 1);
    const cr = Math.round(r * (1 - factor) + (r2 ?? r) * factor);
    const cg = Math.round(g * (1 - factor) + (g2 ?? g) * factor);
    const cb = Math.round(b * (1 - factor) + (b2 ?? b) * factor);

    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 3;
      // Add subtle grid pattern on every 20px
      const isGrid = (x % 24 === 0 || y % 24 === 0);
      rawData[px] = isGrid ? Math.min(255, cr + 15) : cr;
      rawData[px + 1] = isGrid ? Math.min(255, cg + 15) : cg;
      rawData[px + 2] = isGrid ? Math.min(255, cb + 15) : cb;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", compressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const dirs = [
  "public/images/hero",
  "public/images/about",
  "public/images/faculty",
  "public/images/events",
  "public/images/gallery",
  "public/images/clubs",
  "public/images/association",
  "public/images/alumni",
  "public/images/placements",
  "public/images/campus",
  "public/images/logos"
];

dirs.forEach(d => {
  const full = path.join(process.cwd(), d);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
  }
});

const files = [
  // Campus illustration placeholder: Midnight to deep navy gradient
  { path: "public/images/hero/sriet-campus.png", w: 1200, h: 700, c1: [12, 21, 53], c2: [17, 34, 79] },
  { path: "public/images/hero/hero-placeholder.png", w: 800, h: 500, c1: [12, 21, 53], c2: [7, 11, 24] },
  { path: "public/images/about/about-placeholder.png", w: 800, h: 600, c1: [6, 54, 63], c2: [12, 21, 53] },
  { path: "public/images/faculty/hod-placeholder.png", w: 600, h: 700, c1: [17, 34, 79], c2: [36, 71, 192] },
  { path: "public/images/faculty/faculty-group.png", w: 1200, h: 600, c1: [12, 21, 53], c2: [36, 71, 192] },
  { path: "public/images/faculty/faculty-placeholder.png", w: 400, h: 500, c1: [232, 228, 216], c2: [227, 222, 210] },
  { path: "public/images/events/event-placeholder.png", w: 800, h: 500, c1: [62, 15, 37], c2: [140, 31, 70] },
  { path: "public/images/gallery/gallery-placeholder.png", w: 800, h: 600, c1: [15, 127, 134], c2: [6, 54, 63] },
  { path: "public/images/clubs/technexus-logo.png", w: 240, h: 240, c1: [36, 71, 192], c2: [15, 127, 134] },
  { path: "public/images/clubs/aesthetic-ai-logo.png", w: 240, h: 240, c1: [140, 31, 70], c2: [217, 164, 65] },
  { path: "public/images/clubs/fine-arts-logo.png", w: 240, h: 240, c1: [28, 138, 91], c2: [15, 127, 134] },
  { path: "public/images/clubs/media-club-logo.png", w: 240, h: 240, c1: [11, 59, 46], c2: [12, 21, 53] },
  { path: "public/images/clubs/club-placeholder.png", w: 800, h: 500, c1: [28, 138, 91], c2: [11, 59, 46] },
  { path: "public/images/association/association-logo.png", w: 240, h: 240, c1: [15, 127, 134], c2: [36, 71, 192] },
  { path: "public/images/association/association-placeholder.png", w: 800, h: 500, c1: [15, 127, 134], c2: [6, 54, 63] },
  { path: "public/images/alumni/alumni-placeholder.png", w: 800, h: 500, c1: [30, 27, 75], c2: [17, 34, 79] },
  { path: "public/images/placements/placement-placeholder.png", w: 800, h: 500, c1: [17, 34, 79], c2: [217, 164, 65] },
  { path: "public/images/campus/campus-placeholder.png", w: 800, h: 500, c1: [11, 59, 46], c2: [28, 138, 91] },
  { path: "public/images/logos/tecra-logo.png", w: 240, h: 240, c1: [7, 11, 24], c2: [217, 164, 65] },
  { path: "public/images/logos/sriet-logo.png", w: 240, h: 240, c1: [7, 11, 24], c2: [36, 71, 192] }
];

files.forEach(f => {
  const filePath = path.join(process.cwd(), f.path);
  if (!fs.existsSync(filePath)) {
    const png = createPng(f.w, f.h, f.c1[0], f.c1[1], f.c1[2], f.c2[0], f.c2[1], f.c2[2]);
    fs.writeFileSync(filePath, png);
    console.log("Created placeholder:", f.path);
  }
});
console.log("All placeholders initialized successfully.");

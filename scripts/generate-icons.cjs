const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ensure public directory exists
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create clean SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>

    <!-- Bezel Ring Gradient -->
    <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="50%" stop-color="#0891b2"/>
      <stop offset="100%" stop-color="#0e7490"/>
    </linearGradient>

    <!-- Glowing Dial Radial -->
    <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0891b2" stop-opacity="0.25"/>
      <stop offset="65%" stop-color="#06b6d4" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>

    <!-- Hand Gradient -->
    <linearGradient id="handGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#67e8f9"/>
    </linearGradient>

    <!-- Math Badge Gradient -->
    <linearGradient id="calcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Base Icon Background (Squircle for standalone / app store) -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  
  <!-- Subtle Outer Border -->
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#1e293b" stroke-width="4"/>

  <!-- Dial Background Glow -->
  <circle cx="256" cy="256" r="190" fill="url(#dialGlow)"/>

  <!-- Outer Bezel Ring -->
  <circle cx="256" cy="256" r="182" fill="none" stroke="url(#bezelGrad)" stroke-width="12" stroke-opacity="0.9" filter="url(#glow)"/>

  <!-- Inner Subtle Ring -->
  <circle cx="256" cy="256" r="162" fill="none" stroke="#334155" stroke-width="3" stroke-dasharray="4 8"/>

  <!-- Hour Markers -->
  <!-- 12 o'clock (Top) -->
  <line x1="256" y1="96" x2="256" y2="124" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/>
  <!-- 3 o'clock (Right) -->
  <line x1="416" y1="256" x2="388" y2="256" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/>
  <!-- 6 o'clock (Bottom) -->
  <line x1="256" y1="416" x2="256" y2="388" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/>
  <!-- 9 o'clock (Left) -->
  <line x1="96" y1="256" x2="124" y2="256" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/>

  <!-- Intermediate Ticks -->
  <g stroke="#64748b" stroke-width="4" stroke-linecap="round" opacity="0.8">
    <!-- 1 o'clock (30 deg) -->
    <line x1="336" y1="117" x2="324" y2="138"/>
    <!-- 2 o'clock (60 deg) -->
    <line x1="395" y1="176" x2="374" y2="188"/>
    <!-- 4 o'clock (120 deg) -->
    <line x1="395" y1="336" x2="374" y2="324"/>
    <!-- 5 o'clock (150 deg) -->
    <line x1="336" y1="395" x2="324" y2="374"/>
    <!-- 7 o'clock (210 deg) -->
    <line x1="176" y1="395" x2="188" y2="374"/>
    <!-- 8 o'clock (240 deg) -->
    <line x1="117" y1="336" x2="138" y2="324"/>
    <!-- 10 o'clock (300 deg) -->
    <line x1="117" y1="176" x2="138" y2="188"/>
    <!-- 11 o'clock (330 deg) -->
    <line x1="176" y1="117" x2="188" y2="138"/>
  </g>

  <!-- Clock Hands (Displaying ~06:27 / precision time math) -->
  <!-- Hour Hand (Pointing downward-left toward ~6) -->
  <g transform="rotate(194 256 256)">
    <line x1="256" y1="256" x2="256" y2="160" stroke="#0ea5e9" stroke-width="14" stroke-linecap="round" filter="url(#glow)"/>
    <line x1="256" y1="256" x2="256" y2="160" stroke="#e0f2fe" stroke-width="8" stroke-linecap="round"/>
  </g>

  <!-- Minute Hand (Pointing toward ~27m, near bottom) -->
  <g transform="rotate(162 256 256)">
    <line x1="256" y1="256" x2="256" y2="120" stroke="#06b6d4" stroke-width="10" stroke-linecap="round" filter="url(#glow)"/>
    <line x1="256" y1="256" x2="256" y2="120" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
  </g>

  <!-- Math Operator Badges in quadrants: [+] and [-] -->
  <g opacity="0.95">
    <!-- Plus Badge on top right -->
    <circle cx="340" cy="172" r="26" fill="#0369a1" stroke="#38bdf8" stroke-width="3"/>
    <line x1="340" y1="158" x2="340" y2="186" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
    <line x1="326" y1="172" x2="354" y2="172" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>

    <!-- Minus Badge on top left -->
    <circle cx="172" cy="172" r="26" fill="#0f172a" stroke="#0284c7" stroke-width="3"/>
    <line x1="158" y1="172" x2="186" y2="172" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round"/>
  </g>

  <!-- Center Pin (Metallic Cyan) -->
  <circle cx="256" cy="256" r="16" fill="#0891b2" stroke="#22d3ee" stroke-width="4"/>
  <circle cx="256" cy="256" r="7" fill="#ffffff"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
console.log('Created public/icon.svg');

// 2. Pure Node PNG Renderer
function makePNG(width, height, renderPixel) {
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(height * (1 + width * 4));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y, width, height);
      raw[pos++] = r;
      raw[pos++] = g;
      raw[pos++] = b;
      raw[pos++] = a;
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

// Distance to line segment helper for anti-aliasing
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Shader that draws the icon pixel by pixel with anti-aliasing
function renderIconPixel(px, py, size, isMaskable) {
  // Normalize to 512x512 virtual coordinate space
  const scale = 512 / size;
  const x = (px + 0.5) * scale;
  const y = (py + 0.5) * scale;

  const cx = 256;
  const cy = 256;
  const distFromCenter = Math.hypot(x - cx, y - cy);

  // Background color: deep slate gradient
  const bgT = Math.min(1, Math.max(0, (x + y) / 1024));
  let r = Math.round(15 * (1 - bgT) + 2 * bgT);
  let g = Math.round(23 * (1 - bgT) + 6 * bgT);
  let b = Math.round(42 * (1 - bgT) + 18 * bgT);
  let a = 255;

  if (!isMaskable) {
    // Squircle rounding (radius ~112)
    const cornerR = 112;
    const dx = Math.max(0, Math.abs(x - cx) - (256 - cornerR));
    const dy = Math.max(0, Math.abs(y - cy) - (256 - cornerR));
    const cornerDist = Math.hypot(dx, dy);
    if (cornerDist > cornerR) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    } else if (cornerDist > cornerR - 2) {
      // Edge anti-aliasing
      a = Math.round(255 * (cornerR - cornerDist) / 2);
    }
  }

  // Dial Glow
  if (distFromCenter < 182) {
    const glowT = 1 - (distFromCenter / 182);
    r = Math.min(255, r + Math.round(8 * glowT));
    g = Math.min(255, g + Math.round(145 * glowT * 0.3));
    b = Math.min(255, b + Math.round(178 * glowT * 0.4));
  }

  // Outer Bezel Ring (radius 176 to 188)
  const bezelDist = Math.abs(distFromCenter - 182);
  if (bezelDist < 7) {
    const factor = Math.max(0, 1 - bezelDist / 7);
    // Cyan glow #06b6d4 / #22d3ee
    r = Math.round(r * (1 - factor) + 34 * factor);
    g = Math.round(g * (1 - factor) + 211 * factor);
    b = Math.round(b * (1 - factor) + 238 * factor);
  }

  // Plus Badge at (340, 172), radius 26
  const plusDist = Math.hypot(x - 340, y - 172);
  if (plusDist <= 26) {
    // Fill #0284c7
    let pFactor = 1;
    if (plusDist > 23) {
      // Stroke #38bdf8
      r = 56; g = 189; b = 248;
    } else {
      r = 3; g = 105; b = 161;
    }
    // Plus cross
    const dHoriz = distToSegment(x, y, 326, 172, 354, 172);
    const dVert = distToSegment(x, y, 340, 158, 340, 186);
    if (Math.min(dHoriz, dVert) < 2.5) {
      r = 255; g = 255; b = 255;
    }
  }

  // Minus Badge at (172, 172), radius 26
  const minusDist = Math.hypot(x - 172, y - 172);
  if (minusDist <= 26) {
    if (minusDist > 23) {
      r = 2; g = 132; b = 199;
    } else {
      r = 15; g = 23; b = 42;
    }
    const dMinus = distToSegment(x, y, 158, 172, 186, 172);
    if (dMinus < 2.5) {
      r = 56; g = 189; b = 248;
    }
  }

  // Hour markers at 12, 3, 6, 9
  // 12 (x: 256, y: 96..124)
  const d12 = distToSegment(x, y, 256, 96, 256, 124);
  // 3 (x: 388..416, y: 256)
  const d3 = distToSegment(x, y, 388, 256, 416, 256);
  // 6 (x: 256, y: 388..416)
  const d6 = distToSegment(x, y, 256, 388, 256, 416);
  // 9 (x: 96..124, y: 256)
  const d9 = distToSegment(x, y, 96, 256, 124, 256);

  const minCardMarker = Math.min(d12, d3, d6, d9);
  if (minCardMarker < 4) {
    const factor = Math.max(0, 1 - minCardMarker / 4);
    r = Math.round(r * (1 - factor) + 56 * factor);
    g = Math.round(g * (1 - factor) + 189 * factor);
    b = Math.round(b * (1 - factor) + 248 * factor);
  }

  // Clock Hands:
  // Hour hand: angle ~194 deg (pointing to ~6:27)
  // cos(194 deg) = -0.970, sin(194 deg) = -0.242 -> x2 = 256 + 96*(-0.242) = 232.7, y2 = 256 + 96*0.970 = 349.1
  const radH = (194 - 90) * Math.PI / 180;
  const hx2 = 256 + Math.cos(radH) * 96;
  const hy2 = 256 + Math.sin(radH) * 96;
  const dHour = distToSegment(x, y, 256, 256, hx2, hy2);
  if (dHour < 7) {
    const factor = Math.max(0, 1 - dHour / 7);
    r = Math.round(r * (1 - factor) + (dHour < 3.5 ? 224 : 14) * factor);
    g = Math.round(g * (1 - factor) + (dHour < 3.5 ? 242 : 165) * factor);
    b = Math.round(b * (1 - factor) + (dHour < 3.5 ? 254 : 233) * factor);
  }

  // Minute hand: angle ~162 deg
  const radM = (162 - 90) * Math.PI / 180;
  const mx2 = 256 + Math.cos(radM) * 136;
  const my2 = 256 + Math.sin(radM) * 136;
  const dMin = distToSegment(x, y, 256, 256, mx2, my2);
  if (dMin < 5) {
    const factor = Math.max(0, 1 - dMin / 5);
    r = Math.round(r * (1 - factor) + (dMin < 2.5 ? 255 : 6) * factor);
    g = Math.round(g * (1 - factor) + (dMin < 2.5 ? 255 : 182) * factor);
    b = Math.round(b * (1 - factor) + (dMin < 2.5 ? 255 : 212) * factor);
  }

  // Center Pin (radius 16)
  if (distFromCenter < 16) {
    if (distFromCenter < 7) {
      r = 255; g = 255; b = 255;
    } else {
      r = 8; g = 145; b = 178;
    }
  }

  return [r, g, b, a];
}

console.log('Generating PNG icons...');

// Generate apple-touch-icon.png (180x180)
const appleIcon = makePNG(180, 180, (x, y, w, h) => renderIconPixel(x, y, 180, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('Created public/apple-touch-icon.png (180x180)');

// Generate icon-192.png (192x192)
const icon192 = makePNG(192, 192, (x, y, w, h) => renderIconPixel(x, y, 192, false));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
console.log('Created public/icon-192.png (192x192)');

// Generate icon-512.png (512x512)
const icon512 = makePNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, 512, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
console.log('Created public/icon-512.png (512x512)');

// Generate icon-maskable-512.png (512x512 full bleed)
const maskable512 = makePNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, 512, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), maskable512);
console.log('Created public/icon-maskable-512.png (512x512 maskable)');

// Generate favicon-32x32.png
const favicon32 = makePNG(32, 32, (x, y, w, h) => renderIconPixel(x, y, 32, false));
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), favicon32);
console.log('Created public/favicon-32x32.png');

console.log('All icons generated successfully!');

const sharp = require('sharp');
const path = require('path');

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d9488;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#0e7490;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e3a5f;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#2dd4bf;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
    <!-- Subtle grid pattern -->
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background gradient -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />

  <!-- Grid overlay -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" />

  <!-- Decorative circles -->
  <circle cx="1050" cy="100" r="200" fill="rgba(45,212,191,0.08)" />
  <circle cx="150" cy="530" r="150" fill="rgba(6,182,212,0.06)" />
  <circle cx="900" cy="500" r="120" fill="rgba(45,212,191,0.05)" />

  <!-- Top accent line -->
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="url(#accent)" />

  <!-- Shopping bag icon -->
  <g transform="translate(510, 120)">
    <rect x="30" y="25" width="120" height="110" rx="12" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="4"/>
    <path d="M65 25 V10 Q65 -10 90 -10 Q115 -10 115 10 V25" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="90" cy="70" r="6" fill="#2dd4bf"/>
  </g>

  <!-- ShopMO text -->
  <text x="600" y="310" font-family="Arial, Helvetica, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle" letter-spacing="2">
    Shop<tspan fill="#2dd4bf">MO</tspan>
  </text>

  <!-- Tagline -->
  <text x="600" y="370" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="rgba(255,255,255,0.9)" text-anchor="middle" letter-spacing="1">
    South Africa's Smartest Online Store
  </text>

  <!-- Divider line -->
  <rect x="450" y="400" width="300" height="2" rx="1" fill="url(#accent)" opacity="0.6" />

  <!-- Features bar -->
  <text x="600" y="450" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="0.5">
    127+ Products  &#x2022;  Free Delivery over R500  &#x2022;  Secure Payments
  </text>

  <!-- Bottom accent bar -->
  <rect x="0" y="${HEIGHT - 6}" width="${WIDTH}" height="6" fill="url(#accent)" opacity="0.8" />

  <!-- SA flag colors subtle accent -->
  <g transform="translate(540, 480)">
    <rect x="0" y="0" width="20" height="3" rx="1.5" fill="#007749" opacity="0.8"/>
    <rect x="24" y="0" width="20" height="3" rx="1.5" fill="#FFB612" opacity="0.8"/>
    <rect x="48" y="0" width="20" height="3" rx="1.5" fill="#DE3831" opacity="0.8"/>
    <rect x="72" y="0" width="20" height="3" rx="1.5" fill="#002395" opacity="0.8"/>
    <rect x="96" y="0" width="20" height="3" rx="1.5" fill="#000000" opacity="0.4"/>
  </g>

  <!-- Domain -->
  <text x="600" y="560" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="rgba(255,255,255,0.4)" text-anchor="middle" letter-spacing="2">
    shopmo.co.za
  </text>
</svg>`;

async function generate() {
  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');

  await sharp(Buffer.from(svg))
    .resize(WIDTH, HEIGHT)
    .png({ quality: 90, compressionLevel: 6 })
    .toFile(outputPath);

  console.log(`OG image generated: ${outputPath}`);

  const info = await sharp(outputPath).metadata();
  console.log(`Dimensions: ${info.width}x${info.height}, Format: ${info.format}, Size: ${info.size} bytes`);
}

generate().catch(console.error);

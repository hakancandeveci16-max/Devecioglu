import fs from 'fs';
import { execSync } from 'child_process';

// 1. Full brand logo (512x512) matching user upload exactly
const brandSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#000000" rx="32" />
  
  <!-- Group: Walnut Illustration -->
  <g stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Top-right Leaves -->
    <path d="M 330 145 C 335 110, 365 95, 395 105 C 385 135, 360 155, 330 160 Z" fill="#000000" stroke-width="7" />
    <path d="M 355 125 L 375 115" stroke-width="5" />
    <path d="M 310 165 C 315 135, 340 120, 365 130 C 355 155, 335 170, 310 175 Z" fill="#000000" stroke-width="7" />
    <path d="M 330 148 L 348 140" stroke-width="5" />

    <!-- Whole Walnut (Left & Upper) -->
    <!-- Shell outer contour -->
    <path d="M 268 90 C 230 85, 140 115, 115 175 C 90 235, 110 285, 150 310 C 160 315, 175 315, 190 310 C 215 300, 260 250, 275 200 C 290 150, 295 100, 268 90 Z" stroke-width="10" />
    
    <!-- Shell Center Ridge Split Line -->
    <path d="M 268 90 C 245 140, 230 190, 290 220" stroke-width="9" />
    
    <!-- Shell wavy grooves / wrinkles on the left lobe -->
    <path d="M 160 155 C 145 175, 140 200, 155 220 C 170 240, 150 265, 140 280" stroke-width="7" />
    <path d="M 185 140 C 170 165, 165 195, 180 215 C 195 235, 180 260, 170 280" stroke-width="7" />
    <path d="M 220 120 C 205 145, 195 175, 210 200 C 220 220, 210 240, 195 260" stroke-width="7" />
    
    <!-- Shell grooves on right lobe -->
    <path d="M 260 125 C 248 150, 245 175, 260 190" stroke-width="7" />

    <!-- Foreground Open Walnut Half (Right & Front) -->
    <!-- Pointed bottom/top oval shell -->
    <path d="M 295 190 C 350 185, 400 230, 400 290 C 400 350, 345 390, 290 385 C 235 380, 190 335, 195 275 C 200 220, 245 195, 295 190 Z" stroke-width="11" fill="#000000" />
    
    <!-- Inner Rim Line -->
    <path d="M 295 205 C 338 200, 385 238, 385 290 C 385 340, 338 372, 290 368 C 245 365, 208 328, 212 280 C 215 232, 252 208, 295 205 Z" stroke-width="6" />

    <!-- Walnut Kernel Brain (Left Lobe) -->
    <path d="M 288 238 C 275 230, 260 230, 248 240 C 235 250, 235 265, 248 275 C 232 285, 235 305, 248 315 C 260 325, 275 320, 288 312" stroke-width="7" />
    <path d="M 252 274 C 265 275, 278 275, 288 275" stroke-width="6" />
    <path d="M 258 250 C 270 252, 278 260, 288 262" stroke-width="5" />
    <path d="M 258 300 C 270 298, 278 290, 288 288" stroke-width="5" />

    <!-- Walnut Kernel Brain (Right Lobe) -->
    <path d="M 302 238 C 315 230, 330 230, 342 240 C 355 250, 355 265, 342 275 C 358 285, 355 305, 342 315 C 330 325, 315 320, 302 312" stroke-width="7" />
    <path d="M 338 274 C 325 275, 312 275, 302 275" stroke-width="6" />
    <path d="M 332 250 C 320 252, 312 260, 302 262" stroke-width="5" />
    <path d="M 332 300 C 320 298, 312 290, 302 288" stroke-width="5" />
    
    <!-- Center Dividing Stem -->
    <line x1="295" y1="230" x2="295" y2="325" stroke-width="7" />
  </g>

  <!-- Typography: DEVECİOĞLU -->
  <text x="256" y="432" font-family="'Plus Jakarta Sans', 'Arial Black', Impact, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">DEVECİOĞLU</text>
  
  <!-- Subtitle: TOPTAN GIDA TİCARETİ -->
  <text x="256" y="465" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="16" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">TOPTAN GIDA TİCARETİ</text>
</svg>`;

// 2. Compact Favicon SVG (optimized for 16x16, 32x32, 48x48 tabs with ultra-crisp icon)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="28" fill="#000000" />
  
  <g stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Leaves -->
    <path d="M 82 30 C 85 20, 95 15, 104 18 C 100 28, 92 34, 82 35 Z" fill="#000000" stroke-width="2.5" />
    
    <!-- Whole Walnut Behind -->
    <path d="M 68 18 C 55 16, 30 26, 24 44 C 18 60, 24 74, 35 80 C 40 82, 45 81, 50 78 C 56 73, 67 60, 70 48 C 74 34, 76 21, 68 18 Z" stroke-width="3.5" />
    <path d="M 37 38 C 32 46, 31 54, 36 60" stroke-width="2.5" />
    <path d="M 45 33 C 40 43, 40 52, 45 58" stroke-width="2.5" />
    
    <!-- Open Walnut Foreground -->
    <path d="M 75 42 C 92 40, 106 53, 106 72 C 106 90, 89 102, 72 100 C 55 98, 42 85, 43 66 C 45 49, 59 43, 75 42 Z" stroke-width="4.5" fill="#000000" />
    <path d="M 75 47 C 88 45, 101 56, 101 72 C 101 86, 88 97, 72 95 C 57 93, 47 82, 48 68 C 50 54, 61 48, 75 47 Z" stroke-width="2.5" />
    
    <!-- Kernel lobes -->
    <path d="M 72 56 C 67 52, 60 53, 56 57 C 52 61, 53 66, 58 70 C 52 74, 53 82, 59 85 C 64 88, 69 86, 73 83" stroke-width="3" />
    <path d="M 58 70 L 72 70" stroke-width="2.5" />
    <path d="M 76 56 C 81 52, 88 53, 92 57 C 96 61, 95 66, 90 70 C 96 74, 95 82, 89 85 C 84 88, 79 86, 75 83" stroke-width="3" />
    <path d="M 90 70 L 76 70" stroke-width="2.5" />
    <line x1="74" y1="54" x2="74" y2="87" stroke-width="3" />
  </g>

  <!-- Small D brand mark at bottom -->
  <text x="64" y="118" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">DEVECİOĞLU</text>
</svg>`;

// Write SVG files
fs.writeFileSync('public/favicon.svg', faviconSvg);
fs.writeFileSync('public/devecioglu-brand-logo.svg', brandSvg);
console.log('SVGs written successfully.');

// Generate PNGs using ImageMagick
try {
  execSync('convert -background none public/favicon.svg -resize 32x32 public/favicon-32x32.png');
  execSync('convert -background none public/favicon.svg -resize 48x48 public/favicon-48x48.png');
  execSync('convert -background none public/favicon.svg -resize 96x96 public/favicon-96x96.png');
  execSync('convert -background none public/favicon.svg -resize 180x180 public/apple-touch-icon.png');
  execSync('convert -background none public/favicon.svg -resize 192x192 public/favicon-192x192.png');
  execSync('convert -background none public/favicon.svg -resize 512x512 public/favicon-512x512.png');
  execSync('convert -background none public/favicon-32x32.png public/favicon.ico');
  execSync('convert -background black public/devecioglu-brand-logo.svg -resize 512x512 public/devecioglu-brand-logo.png');
  console.log('All PNGs and favicon.ico generated successfully.');
} catch (e) {
  console.error('Error generating PNGs:', e.message);
}

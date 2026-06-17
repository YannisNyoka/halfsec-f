import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
const source = resolve(publicDir, 'halfsec.png');

const sizes = [64, 96, 192, 512];

for (const size of sizes) {
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: { r: 245, g: 166, b: 35, alpha: 1 } })
    .toFile(resolve(publicDir, `pwa-${size}x${size}.png`));
  console.log(`Generated pwa-${size}x${size}.png`);
}

// Maskable icon (with padding for safe zone)
await sharp(source)
  .resize(400, 400, { fit: 'contain', background: { r: 245, g: 166, b: 35, alpha: 1 } })
  .extend({ top: 56, bottom: 56, left: 56, right: 56, background: { r: 245, g: 166, b: 35, alpha: 1 } })
  .resize(512, 512)
  .toFile(resolve(publicDir, 'maskable-icon-512x512.png'));
console.log('Generated maskable-icon-512x512.png');

// Apple touch icon
await sharp(source)
  .resize(160, 160, { fit: 'contain', background: { r: 245, g: 166, b: 35, alpha: 1 } })
  .extend({ top: 20, bottom: 20, left: 20, right: 20, background: { r: 245, g: 166, b: 35, alpha: 1 } })
  .resize(180, 180)
  .toFile(resolve(publicDir, 'apple-touch-icon.png'));
console.log('Generated apple-touch-icon.png');

console.log('All icons generated.');
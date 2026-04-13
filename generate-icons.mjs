/**
 * Generates PWA PNG icons from the SVG source.
 * Run once with: node generate-icons.mjs
 * Requires: npm install --save-dev sharp
 */
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

async function generate() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('sharp not found. Run: npm install --save-dev sharp');
    process.exit(1);
  }

  const svg = readFileSync('./public/icons/icon.svg');

  for (const size of [192, 512]) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(`./public/icons/icon-${size}.png`);
    console.log(`Created icon-${size}.png`);
  }

  // apple-touch-icon (180x180)
  await sharp(svg).resize(180, 180).png().toFile('./public/icons/apple-touch-icon.png');
  console.log('Created apple-touch-icon.png');
}

generate();

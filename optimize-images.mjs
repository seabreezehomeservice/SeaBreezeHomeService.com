import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR   = path.dirname(fileURLToPath(import.meta.url));
const IDIR  = path.join(DIR, 'images');

// [filename, maxWidth, quality]  — width is the max rendered width × 2 for retina
const IMAGES = [
  // Service cards (rendered ~400px wide, 2× retina = 800px)
  ['seabreeze-work-san-diego-3.jpg',           800, 78],
  ['solar-panel-cleaning-san-diego-2.jpg',     800, 78],
  ['pressure-washing-san-diego-sidewalk.jpg',  800, 78],
  ['soft-washing-san-diego.jpg',               800, 80],
  ['holiday-light-installation-san-diego-home.jpg', 800, 78],
  ['permanent-lighting-san-diego-2.jpg',       800, 78],
  ['gutter-cleaning-after-san-diego.jpg',      800, 78],
  // Before/after sliders (rendered ~680px, 2× = 1360px)
  ['window-cleaning-after-san-diego.jpg',      1360, 78],
  ['window-cleaning-before-san-diego.jpg',     1360, 78],
  ['gutter-cleaning-before-san-diego.jpg',     1360, 78],
  ['soft-washing-after-san-diego.jpg',         1360, 78],
  ['soft-washing-before-san-diego.jpg',        1360, 78],
  // About / team (rendered ~380px, 2× = 760px)
  ['seabreeze-team-san-diego.jpg',             760, 78],
  // Wide section images (~600–900px rendered, 2× = 1400px max)
  ['seabreeze-technician-san-diego.jpg',       1400, 78],
  ['seabreeze-home-service-san-diego-1.jpg',   1400, 78],
  ['seabreeze-home-service-san-diego-2.jpg',   1400, 78],
  ['seabreeze-home-service-san-diego-3.jpg',   1400, 78],
  ['seabreeze-work-san-diego-1.jpg',           1400, 78],
  ['seabreeze-work-san-diego-2.jpg',           1400, 78],
  ['seabreeze-work-san-diego-4.jpg',           1400, 78],
  ['seabreeze-work-san-diego-5.jpg',           1400, 78],
  ['seabreeze-work-san-diego-6.jpg',           1400, 78],
  ['solar-panel-cleaning-san-diego.jpg',       1400, 78],
  ['pressure-washing-san-diego-1.jpg',         1400, 78],
  ['pressure-washing-san-diego-2.jpg',         1400, 78],
  ['window-cleaning-san-diego-1.jpg',          1400, 78],
  ['window-cleaning-san-diego-2.jpg',          1400, 78],
  ['new-photo-1.jpg',                          1400, 78],
  ['new-photo-2.jpg',                          1400, 78],
  ['exterior-home-cleaning-san-diego-1.jpg',   1400, 78],
  ['exterior-home-cleaning-san-diego-2.jpg',   1400, 78],
  ['exterior-home-cleaning-san-diego-3.jpg',   1400, 78],
  ['exterior-home-cleaning-san-diego-4.jpg',   1400, 78],
  ['exterior-home-cleaning-san-diego-5.jpg',   1400, 78],
  ['exterior-home-cleaning-san-diego-6.jpg',   1400, 78],
];

// Also generate a low-quality poster for the hero video (1280px, 60% quality)
const POSTER_SRC = path.join(IDIR, 'holiday-light-installation-san-diego-home.jpg');
const POSTER_OUT = path.join(IDIR, 'hero-poster.webp');

let converted = 0;
let skipped   = 0;
let totalBefore = 0;
let totalAfter  = 0;

for (const [file, maxW, quality] of IMAGES) {
  const src = path.join(IDIR, file);
  const out = path.join(IDIR, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

  if (!fs.existsSync(src)) {
    process.stdout.write(`  MISSING: ${file}\n`);
    skipped++;
    continue;
  }

  const before = fs.statSync(src).size;
  totalBefore += before;

  await sharp(src)
    .resize({ width: maxW, withoutEnlargement: true })
    .webp({ quality })
    .toFile(out);

  const after = fs.statSync(out).size;
  totalAfter += after;
  const pct = Math.round((1 - after / before) * 100);
  process.stdout.write(`✓ ${file.replace('.jpg','')} → ${(before/1024/1024).toFixed(1)}MB → ${(after/1024).toFixed(0)}KB  (−${pct}%)\n`);
  converted++;
}

// Generate hero poster
if (fs.existsSync(POSTER_SRC)) {
  await sharp(POSTER_SRC)
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 60 })
    .toFile(POSTER_OUT);
  const sz = fs.statSync(POSTER_OUT).size;
  process.stdout.write(`✓ hero-poster.webp created — ${(sz/1024).toFixed(0)}KB\n`);
}

process.stdout.write(`\nDone — ${converted} converted, ${skipped} skipped\n`);
process.stdout.write(`Total before: ${(totalBefore/1024/1024).toFixed(1)}MB  →  after: ${(totalAfter/1024/1024).toFixed(1)}MB\n`);

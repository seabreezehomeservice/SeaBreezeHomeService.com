import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = 'C:/Users/austi/OneDrive/Desktop/Seabreeze photos/drive-download-20260312T190116Z-3-001';
const DEST = 'C:/Users/austi/OneDrive/Desktop/seabreeze-website/images';

fs.mkdirSync(DEST, { recursive: true });

// Map: [source filename, dest filename, description]
const images = [
  ['SeaBreeze Logo.png',               'seabreeze-logo.png',                                   'copy'],
  ['Before.png',                        'window-cleaning-before-san-diego.jpg',                  'convert'],
  ['After.png',                         'window-cleaning-after-san-diego.jpg',                   'convert'],
  ['282602899556144506.jpeg',           'holiday-light-installation-san-diego-home.jpg',          'convert'],
  ['Screenshot 2026-03-09 191554.png', 'gutter-cleaning-before-san-diego.jpg',                  'convert'],
  ['Screenshot 2026-03-09 191612.png', 'gutter-cleaning-after-san-diego.jpg',                   'convert'],
  // HEIC files
  ['IMG_4271.HEIC',  'exterior-home-cleaning-san-diego-1.jpg',  'heic'],
  ['IMG_4285.HEIC',  'exterior-home-cleaning-san-diego-2.jpg',  'heic'],
  ['IMG_4290.HEIC',  'exterior-home-cleaning-san-diego-3.jpg',  'heic'],
  ['IMG_4306.HEIC',  'exterior-home-cleaning-san-diego-4.jpg',  'heic'],
  ['IMG_4309.HEIC',  'exterior-home-cleaning-san-diego-5.jpg',  'heic'],
  ['IMG_4320.HEIC',  'exterior-home-cleaning-san-diego-6.jpg',  'heic'],
  ['IMG_4324.HEIC',  'pressure-washing-san-diego-1.jpg',         'heic'],
  ['IMG_4327.HEIC',  'pressure-washing-san-diego-2.jpg',         'heic'],
  ['IMG_4359.HEIC',  'window-cleaning-san-diego-1.jpg',          'heic'],
  ['IMG_4362.HEIC',  'window-cleaning-san-diego-2.jpg',          'heic'],
  ['IMG_4427.HEIC',  'solar-panel-cleaning-san-diego.jpg',       'heic'],
  ['IMG_4534.HEIC',  'seabreeze-technician-san-diego.jpg',       'heic'],
  ['IMG_4712.HEIC',  'seabreeze-home-service-san-diego-1.jpg',   'heic'],
  ['IMG_4715.HEIC',  'seabreeze-home-service-san-diego-2.jpg',   'heic'],
  ['IMG_4716.HEIC',  'seabreeze-home-service-san-diego-3.jpg',   'heic'],
  ['IMG_2692.HEIC',  'seabreeze-work-san-diego-1.jpg',           'heic'],
  ['IMG_2693.HEIC',  'seabreeze-work-san-diego-2.jpg',           'heic'],
  ['IMG_3021.HEIC',  'seabreeze-work-san-diego-3.jpg',           'heic'],
  ['IMG_3055.heic',  'seabreeze-work-san-diego-4.jpg',           'heic'],
  ['IMG_3203.HEIC',  'seabreeze-work-san-diego-5.jpg',           'heic'],
];

for (const [src, dest, type] of images) {
  const srcPath = path.join(SRC, src);
  const destPath = path.join(DEST, dest);

  if (!fs.existsSync(srcPath)) { console.log(`SKIP (missing): ${src}`); continue; }
  if (fs.existsSync(destPath)) { console.log(`EXISTS: ${dest}`); continue; }

  try {
    if (type === 'copy') {
      fs.copyFileSync(srcPath, destPath);
      console.log(`COPY: ${dest}`);
    } else {
      await sharp(srcPath)
        .rotate() // auto-orient from EXIF
        .jpeg({ quality: 85 })
        .toFile(destPath);
      console.log(`CONVERT: ${dest}`);
    }
  } catch (e) {
    console.log(`ERROR ${src}: ${e.message}`);
  }
}
console.log('Done.');

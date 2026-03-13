import heicConvert from 'heic-convert';
import fs from 'fs';
import path from 'path';

const SRC = 'C:/Users/austi/OneDrive/Desktop/Seabreeze photos/drive-download-20260312T190116Z-3-001';
const DEST = 'C:/Users/austi/OneDrive/Desktop/seabreeze-website/images';

const files = [
  ['IMG_4271.HEIC',  'exterior-home-cleaning-san-diego-1.jpg'],
  ['IMG_4285.HEIC',  'exterior-home-cleaning-san-diego-2.jpg'],
  ['IMG_4290.HEIC',  'exterior-home-cleaning-san-diego-3.jpg'],
  ['IMG_4306.HEIC',  'exterior-home-cleaning-san-diego-4.jpg'],
  ['IMG_4309.HEIC',  'exterior-home-cleaning-san-diego-5.jpg'],
  ['IMG_4320.HEIC',  'exterior-home-cleaning-san-diego-6.jpg'],
  ['IMG_4324.HEIC',  'pressure-washing-san-diego-1.jpg'],
  ['IMG_4327.HEIC',  'pressure-washing-san-diego-2.jpg'],
  ['IMG_4359.HEIC',  'window-cleaning-san-diego-1.jpg'],
  ['IMG_4362.HEIC',  'window-cleaning-san-diego-2.jpg'],
  ['IMG_4427.HEIC',  'solar-panel-cleaning-san-diego.jpg'],
  ['IMG_4534.HEIC',  'seabreeze-technician-san-diego.jpg'],
  ['IMG_4712.HEIC',  'seabreeze-home-service-san-diego-1.jpg'],
  ['IMG_4715.HEIC',  'seabreeze-home-service-san-diego-2.jpg'],
  ['IMG_4716.HEIC',  'seabreeze-home-service-san-diego-3.jpg'],
  ['IMG_2692.HEIC',  'seabreeze-work-san-diego-1.jpg'],
  ['IMG_2693.HEIC',  'seabreeze-work-san-diego-2.jpg'],
  ['IMG_3021.HEIC',  'seabreeze-work-san-diego-3.jpg'],
  ['IMG_3055.heic',  'seabreeze-work-san-diego-4.jpg'],
  ['IMG_3203.HEIC',  'seabreeze-work-san-diego-5.jpg'],
  ['IMG_2693(1).HEIC','seabreeze-work-san-diego-6.jpg'],
];

for (const [src, dest] of files) {
  const srcPath = path.join(SRC, src);
  const destPath = path.join(DEST, dest);
  if (!fs.existsSync(srcPath)) { console.log(`SKIP: ${src}`); continue; }
  if (fs.existsSync(destPath)) { console.log(`EXISTS: ${dest}`); continue; }
  try {
    const input = fs.readFileSync(srcPath);
    const output = await heicConvert({ buffer: input, format: 'JPEG', quality: 0.85 });
    fs.writeFileSync(destPath, Buffer.from(output));
    console.log(`OK: ${dest}`);
  } catch(e) {
    console.log(`ERR ${src}: ${e.message}`);
  }
}
console.log('Done.');

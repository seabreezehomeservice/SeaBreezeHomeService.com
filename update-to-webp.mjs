import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const HTML = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

// Images we actually converted to WebP
const CONVERTED = new Set([
  'seabreeze-work-san-diego-3','solar-panel-cleaning-san-diego-2',
  'pressure-washing-san-diego-sidewalk','soft-washing-san-diego',
  'holiday-light-installation-san-diego-home','permanent-lighting-san-diego-2',
  'gutter-cleaning-after-san-diego','window-cleaning-after-san-diego',
  'window-cleaning-before-san-diego','gutter-cleaning-before-san-diego',
  'soft-washing-after-san-diego','soft-washing-before-san-diego',
  'seabreeze-team-san-diego','seabreeze-technician-san-diego',
  'seabreeze-home-service-san-diego-1','seabreeze-home-service-san-diego-2',
  'seabreeze-home-service-san-diego-3','seabreeze-work-san-diego-1',
  'seabreeze-work-san-diego-2','seabreeze-work-san-diego-4',
  'seabreeze-work-san-diego-5','seabreeze-work-san-diego-6',
  'solar-panel-cleaning-san-diego','pressure-washing-san-diego-1',
  'pressure-washing-san-diego-2','window-cleaning-san-diego-1',
  'window-cleaning-san-diego-2','new-photo-1','new-photo-2',
  'exterior-home-cleaning-san-diego-1','exterior-home-cleaning-san-diego-2',
  'exterior-home-cleaning-san-diego-3','exterior-home-cleaning-san-diego-4',
  'exterior-home-cleaning-san-diego-5','exterior-home-cleaning-san-diego-6',
]);

// Replace src="images/NAME.jpg" → src="images/NAME.webp"
// Also replaces url('images/NAME.jpg') in inline CSS
// Only for converted files
function replaceWebp(html) {
  // img src= attributes
  html = html.replace(/\bsrc="images\/([^"]+)\.(jpg|jpeg)"/gi, (match, name) => {
    if (CONVERTED.has(name)) return `src="images/${name}.webp"`;
    return match;
  });
  // CSS url() — single or double quotes
  html = html.replace(/url\(['"]?images\/([^'")\s]+)\.(jpg|jpeg)['"]?\)/gi, (match, name) => {
    if (CONVERTED.has(name)) return `url('images/${name}.webp')`;
    return match;
  });
  return html;
}

let fixed = 0;
for (const file of HTML) {
  const fp = path.join(DIR, file);
  const orig = fs.readFileSync(fp, 'utf8');
  const updated = replaceWebp(orig);
  if (updated !== orig) {
    fs.writeFileSync(fp, updated, 'utf8');
    fixed++;
    process.stdout.write(`✓ ${file}\n`);
  } else {
    process.stdout.write(`  ${file} (no changes)\n`);
  }
}
process.stdout.write(`\nDone — updated ${fixed} / ${HTML.length} files\n`);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR  = path.dirname(fileURLToPath(import.meta.url));
const HTML = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

// Exact inline style strings to remove from soc-btn anchor tags
// (these are now fully covered by styles.css)
const REMOVE_STYLES = [
  '\n             style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(220,39,67,0.35);"',
  '\n             style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:#1877F2;color:#fff;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(24,119,242,0.35);"',
  '\n             style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:#010101;color:#fff;border:1px solid rgba(255,255,255,0.15);transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.4);"',
  // index.html uses slightly different indentation (10 spaces)
  '\n          style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(220,39,67,0.35);"',
  '\n          style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:#1877F2;color:#fff;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(24,119,242,0.35);"',
  '\n          style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:#010101;color:#fff;border:1px solid rgba(255,255,255,0.15);transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.4);"',
  // commercial-cleaning uses 8-space indentation
  '\n        style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(220,39,67,0.35);"',
  '\n        style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:#1877F2;color:#fff;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(24,119,242,0.35);"',
  '\n        style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:#010101;color:#fff;border:1px solid rgba(255,255,255,0.15);transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.4);"',
];

// Redundant hover CSS blocks injected by fix-seo-pass2.mjs (now in styles.css)
const REMOVE_CSS_BLOCKS = [
  `\n    .soc-btn:hover { transform: translateY(-2px); }\n    .soc-ig:hover { box-shadow: 0 6px 18px rgba(220,39,67,0.5) !important; }\n    .soc-fb:hover { box-shadow: 0 6px 18px rgba(24,119,242,0.5) !important; }\n    .soc-tt:hover { box-shadow: 0 6px 18px rgba(105,201,208,0.4) !important; }`,
];

// Replace wrapper div inline style with CSS class
const DIV_STYLE_OLD = 'style="display:flex;gap:0.6rem;margin-top:1.2rem;"';
const DIV_STYLE_NEW = 'class="soc-buttons"';

let fixed = 0;
for (const file of HTML) {
  const fp  = path.join(DIR, file);
  let html  = fs.readFileSync(fp, 'utf8');
  const orig = html;

  // 1. Remove inline styles from social buttons
  for (const s of REMOVE_STYLES) html = html.replaceAll(s, '');

  // 2. Remove redundant hover CSS injected by previous script
  for (const b of REMOVE_CSS_BLOCKS) html = html.replaceAll(b, '');

  // 3. Replace wrapper div inline style with CSS class
  html = html.replaceAll(DIV_STYLE_OLD, DIV_STYLE_NEW);

  if (html !== orig) {
    fs.writeFileSync(fp, html, 'utf8');
    fixed++;
    process.stdout.write(`✓ ${file}\n`);
  } else {
    process.stdout.write(`  ${file} (unchanged)\n`);
  }
}
process.stdout.write(`\nDone — cleaned ${fixed} / ${HTML.length} files\n`);

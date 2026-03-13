import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));

const SECONDARY = fs.readdirSync(DIR).filter(f =>
  f.endsWith('.html') && f !== 'index.html'
);

const SOC_CSS = `    .soc-btn:hover { transform: translateY(-2px); }
    .soc-ig:hover { box-shadow: 0 6px 18px rgba(220,39,67,0.5) !important; }
    .soc-fb:hover { box-shadow: 0 6px 18px rgba(24,119,242,0.5) !important; }
    .soc-tt:hover { box-shadow: 0 6px 18px rgba(105,201,208,0.4) !important; }`;

let fixed = 0;

for (const file of SECONDARY) {
  const fp = path.join(DIR, file);
  let html = fs.readFileSync(fp, 'utf8');
  const orig = html;

  // 1. Add noreferrer to social links (rel="noopener" → rel="noopener noreferrer")
  html = html.replaceAll('rel="noopener" aria-label="SeaBreeze on Instagram"', 'rel="noopener noreferrer" aria-label="SeaBreeze on Instagram" class="soc-btn soc-ig"');
  html = html.replaceAll('rel="noopener" aria-label="SeaBreeze on Facebook"',  'rel="noopener noreferrer" aria-label="SeaBreeze on Facebook" class="soc-btn soc-fb"');
  html = html.replaceAll('rel="noopener" aria-label="SeaBreeze on TikTok"',    'rel="noopener noreferrer" aria-label="SeaBreeze on TikTok" class="soc-btn soc-tt"');

  // 2. Remove inline onmouseover/onmouseout from social buttons
  html = html.replaceAll(
    `onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px rgba(220,39,67,0.5)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(220,39,67,0.35)'"`,
    ''
  );
  html = html.replaceAll(
    `onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px rgba(24,119,242,0.5)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(24,119,242,0.35)'"`,
    ''
  );
  html = html.replaceAll(
    `onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px rgba(105,201,208,0.4)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.4)'"`,
    ''
  );

  // 3. Fix email display text (raw email → "Email Us")
  html = html.replaceAll(
    '<a href="mailto:seabreezehomeservice@gmail.com">seabreezehomeservice@gmail.com</a>',
    '<a href="mailto:seabreezehomeservice@gmail.com">Email Us</a>'
  );
  // Also catch the version already set as "Email Us" but keep it (no-op if already fixed)

  // 4. Inject social hover CSS before </style> if not already present
  if (!html.includes('.soc-btn:hover') && html.includes('</style>')) {
    html = html.replace('</style>', `${SOC_CSS}\n  </style>`);
  }

  // 5. Fix Privacy Policy / Terms links if present
  html = html.replace(
    /<a href="#faq">Privacy Policy<\/a>\s*&nbsp;·&nbsp;\s*<a href="#faq">Terms of Service<\/a>/g,
    '<a href="/sitemap.xml">Sitemap</a>'
  );

  if (html !== orig) {
    fs.writeFileSync(fp, html, 'utf8');
    fixed++;
    process.stdout.write(`✓ ${file}\n`);
  } else {
    process.stdout.write(`  ${file} (unchanged)\n`);
  }
}

process.stdout.write(`\nDone — fixed ${fixed} / ${SECONDARY.length} files\n`);

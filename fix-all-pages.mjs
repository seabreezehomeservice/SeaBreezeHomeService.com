import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));

const SECONDARY = fs.readdirSync(DIR).filter(f =>
  f.endsWith('.html') && f !== 'index.html'
);

const SOCIAL_HTML = `        <div style="display:flex;gap:0.6rem;margin-top:1.2rem;">
          <a href="https://www.instagram.com/seabreezehomeservice/" target="_blank" rel="noopener" aria-label="SeaBreeze on Instagram"
             style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(220,39,67,0.35);"
             onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px rgba(220,39,67,0.5)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(220,39,67,0.35)'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61581491953121" target="_blank" rel="noopener" aria-label="SeaBreeze on Facebook"
             style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:#1877F2;color:#fff;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(24,119,242,0.35);"
             onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px rgba(24,119,242,0.5)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(24,119,242,0.35)'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@seabreezehomeserv" target="_blank" rel="noopener" aria-label="SeaBreeze on TikTok"
             style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;background:#010101;color:#fff;border:1px solid rgba(255,255,255,0.15);transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.4);"
             onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 18px rgba(105,201,208,0.4)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.4)'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>
          </a>
        </div>`;

const PHONE_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>`;

const GETQUOTE_BTN = `      <li><a href="https://clienthub.getjobber.com/hubs/a12ee5bd-819c-4fd8-b2d2-ebcfefefaa55/public/requests/1907659/new" class="btn-cta">Get a Quote</a></li>`;
const PHONE_LI = `      <li><a href="tel:+16197328052" style="display:inline-flex;align-items:center;gap:0.4rem;">${PHONE_SVG}(619) 732-8052</a></li>`;

let fixed = 0;
const skipped = [];

for (const file of SECONDARY) {
  const fp = path.join(DIR, file);
  let html = fs.readFileSync(fp, 'utf8');
  const orig = html;

  // 1. Fix broken email link
  html = html.replaceAll('mailto:INSERTEMAIL', 'mailto:seabreezehomeservice@gmail.com');

  // 2. Fix placeholder phone in Schema.org (handles compact and spaced JSON)
  html = html.replace(/"telephone":"[^"]*Insert Business Phone[^"]*"/, '"telephone":"+16197328052"');
  html = html.replace(/"telephone": "[^"]*Insert Business Phone[^"]*"/, '"telephone": "+16197328052"');

  // 3. Add favicon links (only if missing)
  if (!html.includes('rel="icon"')) {
    html = html.replace(
      /(<link rel="canonical"[^>]+\/>)/,
      '$1\n  <link rel="icon" type="image/png" href="/brand_assets/SEABREEZE.png" />\n  <link rel="apple-touch-icon" href="/brand_assets/SEABREEZE.png" />'
    );
  }

  // 4. Add Commercial & HOA to footer services list
  if (!html.includes('/commercial-cleaning-san-diego.html')) {
    html = html.replace(
      '<li><a href="/permanent-lighting-san-diego.html">Permanent Lighting</a></li>',
      '<li><a href="/permanent-lighting-san-diego.html">Permanent Lighting</a></li>\n          <li><a href="/commercial-cleaning-san-diego.html">Commercial &amp; HOA</a></li>'
    );
  }

  // 5. Add phone + social icons to footer contact section
  // After the email fix (step 1), the contact block now reads with correct email.
  // Match the full contact ul and replace it with phone added + social icons appended.
  const OLD_CONTACT_BLOCK = `          <li><a href="mailto:seabreezehomeservice@gmail.com">Email Us</a></li>
          <li><span style="color:var(--muted);font-size:.85rem;">San Diego County, CA</span></li>
          <li><span style="color:var(--muted);font-size:.85rem;">Mon–Sat 7am–6pm</span></li>
        </ul>
      </div>
    </div>`;

  const NEW_CONTACT_BLOCK = `          <li><a href="tel:+16197328052">(619) 732-8052</a></li>
          <li><a href="mailto:seabreezehomeservice@gmail.com">Email Us</a></li>
          <li><span style="color:var(--muted);font-size:.85rem;">San Diego County, CA</span></li>
          <li><span style="color:var(--muted);font-size:.85rem;">Mon–Sat 7am–6pm</span></li>
        </ul>
${SOCIAL_HTML}
      </div>
    </div>`;

  if (html.includes(OLD_CONTACT_BLOCK)) {
    html = html.replace(OLD_CONTACT_BLOCK, NEW_CONTACT_BLOCK);
  } else {
    // Try alternate spacing (some pages may vary slightly)
    skipped.push(`${file} — contact block not matched, manual check needed`);
  }

  // 6. Add phone number to navbar (before Get a Quote btn)
  if (html.includes(GETQUOTE_BTN) && !html.includes('tel:+16197328052')) {
    html = html.replace(GETQUOTE_BTN, `${PHONE_LI}\n${GETQUOTE_BTN}`);
  }

  if (html !== orig) {
    fs.writeFileSync(fp, html, 'utf8');
    fixed++;
    process.stdout.write(`✓ ${file}\n`);
  } else {
    process.stdout.write(`  ${file} (unchanged)\n`);
  }
}

if (skipped.length) {
  process.stdout.write(`\nWARNINGS:\n${skipped.join('\n')}\n`);
}
process.stdout.write(`\nDone — fixed ${fixed} / ${SECONDARY.length} files\n`);

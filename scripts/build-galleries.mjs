// Entry point: `npm run build-galleries`
//
// Reads every classified (published, non-needs-review) image record and:
//   1. Writes data/portfolio.json — grouped by service. Within each group,
//      photos the user explicitly numbered ("1.jpg", "2.jpg", ... in the
//      Drive folder) are ordered by that number first; anything unnumbered
//      falls back to visual-similarity ordering (with before-photos nudged
//      ahead of after-photos when a pair is genuinely similar-looking) and
//      is appended after — fetched client-side by portfolio.html.
//   2. Writes data/gallery-<service-key>.json per service — a flat array of
//      ALL that service's published photos, same ordering, fetched
//      client-side by js/service-gallery.js on the matching service page.
//   3. Injects an ImageGallery JSON-LD block into portfolio.html's <head>.
//   4. Injects a small, CONSTANT-SIZE slideshow mount point into each of the
//      8 service pages, right above the FAQ section. The actual photos are
//      fetched and rendered client-side (one at a time, via js/slideshow.js),
//      so the injected HTML doesn't grow with photo count — this is what
//      keeps 300 photos from bloating page weight. A service with zero
//      published photos gets its section removed entirely.
//
// Safe to re-run any time — every run fully regenerates its output from the
// current metadata, it never accumulates state.
import fs from 'fs';
import path from 'path';
import * as lib from './media-lib.mjs';

const START = name => new RegExp(`(<!--\\s*${name}:START\\s*-->)([\\s\\S]*?)(<!--\\s*${name}:END\\s*-->)`);

function abs(p) { return p ? `/${p}` : null; }

function toPublicItem(rec) {
  const c = rec.classification;
  const service = lib.serviceByKey(c.service);
  return {
    id: rec.id,
    thumbnail: abs(rec.paths.thumbnail),
    full: abs(rec.paths.optimized),
    avif: abs(rec.paths.optimizedAvif),
    responsive: Object.fromEntries(Object.entries(rec.paths.responsive || {}).map(([w, p]) => [w, abs(p)])),
    blur: rec.blurPlaceholder || null,
    width: rec.dimensions?.width ?? null,
    height: rec.dimensions?.height ?? null,
    service: c.service,
    serviceLabel: service ? service.label : (c.service || 'General'),
    city: rec.location?.city || null,
    cityLabel: rec.location?.city ? rec.location.city.replace(/-/g, ' ').replace(/\b\w/g, s => s.toUpperCase()) : null,
    propertyType: c.propertyType || null,
    beforeAfter: c.beforeAfter || null,
    perceptualHash: rec.perceptualHash || null,
    sortOrder: typeof rec.sortOrder === 'number' ? rec.sortOrder : null,
    title: rec.seo?.title || null,
    alt: rec.seo?.alt || null,
    caption: rec.seo?.caption || null,
    description: rec.seo?.description || null,
    ingestedAt: rec.ingestedAt,
  };
}

function buildImageGallerySchema(publicItems) {
  if (publicItems.length === 0) return '';
  const images = publicItems.slice(0, 50).map(item => ({
    '@type': 'ImageObject',
    contentUrl: `https://www.seabreezehomeservice.com${item.full}`,
    thumbnailUrl: `https://www.seabreezehomeservice.com${item.thumbnail}`,
    name: item.title || item.serviceLabel,
    description: item.description || item.caption || undefined,
  }));
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'SeaBreeze Home Service — Project Photo Portfolio',
    url: 'https://www.seabreezehomeservice.com/portfolio.html',
    associatedMedia: images,
  };
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function injectMarker(filePath, markerName, content) {
  if (!fs.existsSync(filePath)) return false;
  const html = fs.readFileSync(filePath, 'utf8');
  const re = START(markerName);
  if (!re.test(html)) return false;
  const updated = html.replace(re, `$1${content}$3`);
  fs.writeFileSync(filePath, updated);
  return true;
}

// This HTML is the same size whether the service has 6 photos or 600 — the
// photos themselves live in data/gallery-<key>.json and are fetched +
// rendered one at a time client-side by js/slideshow.js. That's what keeps
// this scalable: page weight doesn't grow with photo count.
function serviceGallerySkeleton(service, count) {
  if (count === 0) return '';
  return `
<section aria-labelledby="gallery-heading" style="background:rgba(18,72,128,0.25);">
  <div class="section-inner">
    <p class="section-eyebrow reveal">Recent Work</p>
    <h2 class="section-h2 reveal reveal-delay-1" id="gallery-heading">${service.label} Projects</h2>
    <div id="service-gallery" class="slideshow reveal reveal-delay-2" data-service="${service.key}" data-label="${service.label}" style="margin-top:2rem;"></div>
    <p id="service-gallery-empty" class="service-gallery-empty" hidden>New ${service.label} photos are on the way — check back soon.</p>
  </div>
</section>
<script src="/js/slideshow.js" defer></script>
<script src="/js/service-gallery.js" defer></script>
`;
}

// Similarity chain first, then a bounded number of adjacent-swap passes so
// that within any pair the chain already judged "visually similar enough to
// be the same job," a before-tagged photo comes before an after-tagged one.
// Most photos have no close match at all (real job photos, not literal
// before/after pairs) — SIMILARITY_THRESHOLD keeps this from forcing an
// order onto photos that just happen to be nearest-neighbors by default.
//
// 25 is calibrated against this actual dataset, not a generic dHash
// "near-duplicate" convention (which would be ~10) — a real before/after
// pair here looks different by design (that's the point of the cleaning),
// so pixel similarity runs noisier than true duplicate detection. Checked
// against every same-service before/after pair in the current data: the
// only two under 25 (a matched gutter pair at 23, a matched driveway pair
// at 24) are plausible real matches; everything else clusters 26+ and is
// almost certainly unrelated jobs, so 25 separates real signal from noise
// without forcing an order onto photos that just don't have a match.
const SIMILARITY_THRESHOLD = 25; // dHash Hamming distance out of 64 bits
function withBeforeAfterNudge(items) {
  const chain = lib.orderBySimilarity(items);
  for (let pass = 0; pass < chain.length; pass++) {
    let swapped = false;
    for (let i = 0; i < chain.length - 1; i++) {
      const a = chain[i], b = chain[i + 1];
      const closeEnough = lib.hammingDistance(a.perceptualHash, b.perceptualHash) <= SIMILARITY_THRESHOLD;
      if (closeEnough && a.beforeAfter === 'after' && b.beforeAfter === 'before') {
        chain[i] = b; chain[i + 1] = a;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return chain;
}

// A file named "1.jpg", "2.jpg", etc. in the Drive folder is the user
// explicitly saying "this is the order I want" — that wins over any
// heuristic. Numbered photos come first, in that order; anything without a
// number (new drops the user hasn't sequenced yet) falls back to the
// similarity/before-after ordering and is appended after.
function orderGroup(items) {
  const numbered = items.filter(i => i.sortOrder !== null).sort((a, b) => a.sortOrder - b.sortOrder);
  const unnumbered = withBeforeAfterNudge(items.filter(i => i.sortOrder === null));
  return [...numbered, ...unnumbered];
}

function run() {
  lib.ensureDirs();
  const files = fs.readdirSync(lib.DIRS.metadata).filter(f => f.endsWith('.json') && !['index.json', 'hashes.json', 'drive-pull-state.json'].includes(f));
  const records = files.map(f => lib.loadJSON(path.join(lib.DIRS.metadata, f), null)).filter(r => r && r.id);
  const published = records.filter(r => r.status === 'classified');

  const publicItems = published
    .slice()
    .sort((a, b) => new Date(b.ingestedAt) - new Date(a.ingestedAt))
    .map(toPublicItem);

  // 1. data/portfolio.json — grouped by service, each group ordered by
  // visual similarity (nearest-neighbor chain over a perceptual hash) so
  // photos of the same or similar-looking job land next to each other in
  // the slideshow.
  const serviceGroups = lib.SERVICES
    .map(service => ({
      key: service.key,
      label: service.label,
      items: orderGroup(publicItems.filter(i => i.service === service.key)),
    }))
    .filter(group => group.items.length > 0);
  const dataDir = path.join(lib.ROOT, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  lib.saveJSON(path.join(dataDir, 'portfolio.json'), { services: serviceGroups });
  console.log(`data/portfolio.json written — ${publicItems.length} published item(s) across ${serviceGroups.length} service(s).`);

  // 2. Portfolio page schema
  const portfolioPath = path.join(lib.ROOT, 'portfolio.html');
  const schemaInjected = injectMarker(portfolioPath, 'PORTFOLIO_SCHEMA', buildImageGallerySchema(publicItems));
  console.log(schemaInjected ? 'portfolio.html schema updated.' : 'portfolio.html schema markers not found — skipped.');

  // 3. Per-service gallery JSON + service page skeleton. One JSON file per
  // service (not one giant combined file) so a service page with 20 photos
  // only ever downloads its own 20, never the whole site's photo library —
  // this is the part that keeps things flat as the total count grows.
  const groupByKey = Object.fromEntries(serviceGroups.map(g => [g.key, g]));
  for (const service of lib.SERVICES) {
    const group = groupByKey[service.key];
    const items = group ? group.items : [];
    lib.saveJSON(path.join(dataDir, `gallery-${service.key}.json`), items);

    const servicePath = path.join(lib.ROOT, service.page.replace(/^\//, ''));
    const ok = injectMarker(servicePath, 'SERVICE_GALLERY', serviceGallerySkeleton(service, items.length));
    console.log(`${service.page}: ${ok ? `${items.length} photo(s) -> data/gallery-${service.key}.json` : 'markers not found — skipped'}`);
  }
}

run();

// Entry point: `npm run finalize-media`
//
// Run this after Claude has classified pending images (filled in each
// media/metadata/<id>.json's `classification` and `seo` fields). Renames the
// published assets to SEO-friendly filenames, applies the confidence
// threshold to route low-confidence images to needs_review, and rebuilds
// the index + a run report. Safe to re-run — only touches records still
// marked pending_classification.
import fs from 'fs';
import path from 'path';
import * as lib from './media-lib.mjs';

function buildSlug(rec) {
  const c = rec.classification;
  const parts = [c.service, rec.location?.city, c.propertyType].filter(Boolean);
  const base = lib.slugify(parts.join('-')) || 'photo';
  return `${base}--${rec.id}`;
}

function renameAlongside(oldPath, newBasename) {
  if (!oldPath || !fs.existsSync(path.join(lib.ROOT, oldPath))) return oldPath;
  const abs = path.join(lib.ROOT, oldPath);
  const dir = path.dirname(abs);
  const ext = path.extname(abs);
  const dest = path.join(dir, `${newBasename}${ext}`);
  fs.renameSync(abs, dest);
  return lib.relative(dest);
}

function run() {
  lib.ensureDirs();
  const index = lib.loadIndex();
  const pendingIds = index.filter(r => r.status === 'pending_classification').map(r => r.id);

  const report = { startedAt: new Date().toISOString(), finalized: [], stillPending: [], needsReview: [] };

  for (const id of pendingIds) {
    const rec = lib.loadMetadata(id);
    if (!rec) continue;

    // Folder placement can set classification.service automatically at
    // ingest time, but alt text still needs a human/Claude to look at the
    // photo — don't publish an image with no accessible description.
    if (!rec.classification?.service || !rec.seo?.alt) {
      report.stillPending.push(id);
      continue;
    }

    const confidence = rec.classification.confidence ?? 0;
    const passesThreshold = confidence >= lib.CONFIDENCE_THRESHOLD;
    rec.needsReview = !passesThreshold;
    rec.status = passesThreshold ? 'classified' : 'needs_review';

    const slug = rec.seo.filename ? rec.seo.filename.replace(/\.[a-z0-9]+$/i, '') : buildSlug(rec);
    rec.seo.filename = `${slug}.webp`;

    // Rename the primary published renditions to the SEO slug; the metadata
    // record itself stays at media/metadata/<id>.json as the stable key.
    rec.paths.optimized = renameAlongside(rec.paths.optimized, slug);
    rec.paths.optimizedAvif = renameAlongside(rec.paths.optimizedAvif, slug);
    rec.paths.thumbnail = renameAlongside(rec.paths.thumbnail, slug);
    if (rec.paths.responsive) {
      for (const w of Object.keys(rec.paths.responsive)) {
        rec.paths.responsive[w] = renameAlongside(rec.paths.responsive[w], `${slug}-${w}`);
      }
    }

    rec.finalizedAt = new Date().toISOString();
    lib.saveMetadata(rec);

    report.finalized.push({ id, slug, status: rec.status, confidence });
    if (!passesThreshold) report.needsReview.push({ id, slug, confidence });
    console.log(`${passesThreshold ? 'PUBLISHED' : 'NEEDS REVIEW'}  ${id}  ->  ${slug}.webp  (confidence ${confidence})`);
  }

  lib.rebuildIndex();
  report.finishedAt = new Date().toISOString();
  const stamp = report.startedAt.replace(/[:.]/g, '-');
  lib.saveJSON(path.join(lib.DIRS.reports, `${stamp}-finalize.json`), report);

  console.log('\n--- Summary ---');
  console.log(`Finalized:      ${report.finalized.length}`);
  console.log(`Needs review:   ${report.needsReview.length}`);
  console.log(`Still pending:  ${report.stillPending.length}  (classification not filled in yet)`);
}

run();

// Entry point: `npm run process-images`
//
// Scans media/incoming (including one level of subfolders), dedupes against
// every image ever ingested, converts HEIC to a decodable buffer, archives
// the untouched original, derives all web-ready renditions, and writes a
// metadata stub per image.
//
// If a file sits inside a recognized subfolder (media/incoming/<Folder>/...),
// that folder name is authoritative for which service the photo belongs to
// — see FOLDER_SERVICE_MAP in media-lib.mjs — so classification.service and
// confidence are set immediately, no guessing needed. Files dropped loose in
// media/incoming/ (no subfolder, or an unrecognized one) are left fully
// unclassified for a live Claude Code session to inspect, same as before.
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import heicConvert from 'heic-convert';
import exifr from 'exifr';
import * as lib from './media-lib.mjs';

const RESPONSIVE_WIDTHS = [400, 800, 1200, 1600];

function isHeic(ext) { return ext === '.heic' || ext === '.heif'; }

async function extractCaptureDate(buffer) {
  try {
    const data = await exifr.parse(buffer, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
    const d = data?.DateTimeOriginal || data?.CreateDate || data?.ModifyDate;
    if (d instanceof Date && !isNaN(d)) return d.toISOString();
  } catch { /* no EXIF, or unreadable — fall through */ }
  return null;
}

// Root files first, then one level of subfolders. { name, folder, srcPath }
function listIncoming() {
  const out = [];
  const rootEntries = fs.readdirSync(lib.DIRS.incoming, { withFileTypes: true });
  for (const e of rootEntries) {
    if (e.isFile() && lib.IMAGE_EXT.has(path.extname(e.name).toLowerCase())) {
      out.push({ name: e.name, folder: null, srcPath: path.join(lib.DIRS.incoming, e.name) });
    } else if (e.isDirectory()) {
      const subDir = path.join(lib.DIRS.incoming, e.name);
      for (const f of fs.readdirSync(subDir, { withFileTypes: true })) {
        if (f.isFile() && lib.IMAGE_EXT.has(path.extname(f.name).toLowerCase())) {
          out.push({ name: f.name, folder: e.name, srcPath: path.join(subDir, f.name) });
        }
      }
    }
  }
  return out;
}

async function run() {
  lib.ensureDirs();
  const hashes = lib.loadHashes();
  const existingIds = new Set(Object.values(hashes));

  const entries = listIncoming();
  const report = { startedAt: new Date().toISOString(), processed: [], duplicates: [], failed: [] };

  if (entries.length === 0) {
    console.log('media/incoming is empty — nothing to process.');
    return;
  }

  const touchedFolders = new Set();

  for (const { name, folder, srcPath } of entries) {
    const ext = path.extname(name).toLowerCase();
    const folderService = folder ? lib.serviceForFolder(folder) : null;
    if (folder) touchedFolders.add(folder);
    try {
      const raw = fs.readFileSync(srcPath);
      const hash = lib.sha256(raw);

      if (hashes[hash]) {
        // Namespace by source folder — plain numbered filenames ("1.jpg")
        // collide across different service folders otherwise, silently
        // overwriting each other in this archive (harmless since the real
        // copy is already safe under its canonical id, but untidy).
        const dupName = folder ? `${folder.replace(/[\\/]/g, '_')}__${name}` : name;
        const dupDest = path.join(lib.DIRS.duplicates, dupName);
        fs.renameSync(srcPath, dupDest);
        report.duplicates.push({ file: name, folder, duplicateOf: hashes[hash] });
        console.log(`DUPLICATE  ${name}  (matches ${hashes[hash]})`);
        continue;
      }

      const id = lib.shortId(hash, existingIds);
      existingIds.add(id);

      // Decode buffer for sharp — HEIC needs a JPEG intermediate, sharp reads the rest natively.
      const decodeBuffer = isHeic(ext)
        ? Buffer.from(await heicConvert({ buffer: raw, format: 'JPEG', quality: 0.95 }))
        : raw;

      const captureDate = await extractCaptureDate(raw);
      const img = sharp(decodeBuffer).rotate(); // .rotate() with no args = auto-orient from EXIF, then strips it
      const meta = await img.metadata();
      const perceptualHash = await lib.perceptualHash(sharp(decodeBuffer).rotate());

      // Archive the untouched original exactly as dropped in (preserve source quality).
      const originalDest = path.join(lib.DIRS.originals, `${id}${ext}`);
      fs.writeFileSync(originalDest, raw);

      // Full-size optimized web version
      const optimizedWebp = path.join(lib.DIRS.optimized, `${id}.webp`);
      await sharp(decodeBuffer).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 78 }).toFile(optimizedWebp);

      const optimizedAvif = path.join(lib.DIRS.optimized, `${id}.avif`);
      await sharp(decodeBuffer).rotate().resize({ width: 2000, withoutEnlargement: true }).avif({ quality: 55 }).toFile(optimizedAvif);

      // Responsive sizes, skipping anything larger than the source
      const responsive = {};
      for (const w of RESPONSIVE_WIDTHS) {
        if (meta.width && w > meta.width) continue;
        const dest = path.join(lib.DIRS.optimized, `${id}-${w}.webp`);
        await sharp(decodeBuffer).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(dest);
        responsive[w] = lib.relative(dest);
      }

      // Thumbnail
      const thumbPath = path.join(lib.DIRS.thumbnails, `${id}.webp`);
      await sharp(decodeBuffer).rotate().resize({ width: 480, height: 360, fit: 'cover' }).webp({ quality: 70 }).toFile(thumbPath);

      // Tiny blur placeholder, inlined as a data URI (not worth a separate file)
      const blurBuf = await sharp(decodeBuffer).rotate().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
      const blurPlaceholder = `data:image/webp;base64,${blurBuf.toString('base64')}`;

      const record = {
        id,
        originalFilename: name,
        sourceFolder: folder,
        sha256: hash,
        ingestedAt: new Date().toISOString(),
        captureDate,
        dimensions: { width: meta.width ?? null, height: meta.height ?? null },
        perceptualHash,
        paths: {
          original: lib.relative(originalDest),
          optimized: lib.relative(optimizedWebp),
          optimizedAvif: lib.relative(optimizedAvif),
          responsive,
          thumbnail: lib.relative(thumbPath),
        },
        blurPlaceholder,
        sortOrder: lib.sortOrderFromFilename(name),
        status: 'pending_classification',
        classification: {
          service: folderService, surfaceType: null, buildingType: null, propertyType: null,
          beforeAfter: null, cleaningMethod: null, equipmentVisible: [],
          qualityScore: null, sharpness: null, suitableForMarketing: null,
          confidence: folderService ? 100 : null,
        },
        seo: { filename: null, title: null, alt: null, caption: null, description: null },
        location: { city: null, neighborhood: null },
        pairing: { pairId: null, role: null },
        tags: [],
        needsReview: false,
      };

      lib.saveMetadata(record);
      hashes[hash] = id;
      fs.unlinkSync(srcPath); // safe: normalized master already archived above

      report.processed.push({ id, file: name, folder, service: folderService });
      console.log(`OK  ${name}${folder ? ` [${folder}${folderService ? ` -> ${folderService}` : ' — unrecognized folder'}]` : ''}  ->  ${id}`);
    } catch (err) {
      report.failed.push({ file: name, folder, error: err.message });
      console.log(`FAILED  ${name}: ${err.message}`);
    }
  }

  // Clean up now-empty subfolders under incoming
  for (const folder of touchedFolders) {
    const subDir = path.join(lib.DIRS.incoming, folder);
    try {
      if (fs.existsSync(subDir) && fs.readdirSync(subDir).length === 0) fs.rmdirSync(subDir);
    } catch { /* leave it if anything's odd — not worth failing the run over */ }
  }

  lib.saveHashes(hashes);
  const index = lib.rebuildIndex();
  report.finishedAt = new Date().toISOString();
  report.pendingClassification = index.filter(r => r.status === 'pending_classification').map(r => r.id);

  const stamp = report.startedAt.replace(/[:.]/g, '-');
  lib.saveJSON(path.join(lib.DIRS.reports, `${stamp}-ingest.json`), report);

  console.log('\n--- Summary ---');
  console.log(`Processed:  ${report.processed.length}`);
  console.log(`Duplicates: ${report.duplicates.length}`);
  console.log(`Failed:     ${report.failed.length}`);
  if (report.pendingClassification.length) {
    console.log(`\n${report.pendingClassification.length} image(s) still need classification (no recognized source folder). Ask Claude Code to classify them, then run: npm run finalize-media`);
    console.log(report.pendingClassification.join(', '));
  }
}

run();

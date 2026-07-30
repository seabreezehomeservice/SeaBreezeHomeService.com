// Entry point: `npm run pull-photos`
//
// Copies new files from the Google Drive "Website Portfolio Gallery" folder
// (synced locally via Google Drive for Desktop) into media/incoming/, then
// you run process-images as usual. Never writes to or deletes from the
// Drive folder — it's a read-only source as far as this pipeline is
// concerned, the user's Drive stays the single source of truth.
//
// Scans the root of that folder plus one level of subfolders. Subfolder
// structure is preserved in media/incoming/ (e.g. ".../Windows/IMG_1.jpg"
// stays "media/incoming/Windows/IMG_1.jpg") because process-images.mjs uses
// that subfolder name to auto-classify which service the photo belongs to.
//
// Tracks the last successful pull time in media/metadata/drive-pull-state.json
// so re-running only looks at files added since then, instead of re-scanning
// (and re-hashing) everything in the Drive folder every time. The sha256
// dedup ledger in process-images is still the real safety net against
// re-processing the same photo twice — this cursor is purely a fast filter.
//
// Every run also reconciles removals: any already-published photo whose
// content is no longer present anywhere in the Drive folder gets its status
// flipped to "removed" (excluded from the site on the next build-galleries),
// not deleted — reversible, since restoring is just flipping the status back.
import fs from 'fs';
import path from 'path';
import * as lib from './media-lib.mjs';

function listDriveFiles() {
  const out = [];
  const rootEntries = fs.readdirSync(lib.DRIVE_SOURCE, { withFileTypes: true });
  for (const e of rootEntries) {
    if (e.isFile()) {
      out.push({ name: e.name, folder: null, srcPath: path.join(lib.DRIVE_SOURCE, e.name) });
    } else if (e.isDirectory()) {
      const subDir = path.join(lib.DRIVE_SOURCE, e.name);
      for (const f of fs.readdirSync(subDir, { withFileTypes: true })) {
        if (f.isFile()) out.push({ name: f.name, folder: e.name, srcPath: path.join(subDir, f.name) });
      }
    }
  }
  return out;
}

// Every file currently sitting anywhere in the Drive folder, hashed. Used to
// detect photos that were pulled in before but have since been deleted or
// moved out of Drive.
function currentDriveHashes(entries) {
  const hashes = new Set();
  for (const { name, srcPath } of entries) {
    const ext = path.extname(name).toLowerCase();
    if (!lib.IMAGE_EXT.has(ext) && !lib.VIDEO_EXT.has(ext)) continue;
    try { hashes.add(lib.sha256(fs.readFileSync(srcPath))); }
    catch { /* unreadable/locked file — skip, don't let one bad file break reconciliation */ }
  }
  return hashes;
}

function reconcileRemovals(entries) {
  const currentHashes = currentDriveHashes(entries);
  const files = fs.existsSync(lib.DIRS.metadata)
    ? fs.readdirSync(lib.DIRS.metadata).filter(f => f.endsWith('.json') && !['index.json', 'hashes.json', 'drive-pull-state.json'].includes(f))
    : [];

  const removed = [];
  for (const f of files) {
    const rec = lib.loadJSON(path.join(lib.DIRS.metadata, f), null);
    if (!rec || !rec.id || rec.status === 'removed') continue;
    if (currentHashes.has(rec.sha256)) continue;

    rec.status = 'removed';
    rec.removedAt = new Date().toISOString();
    lib.saveMetadata(rec);
    removed.push({ id: rec.id, title: rec.seo?.title || rec.originalFilename, service: rec.classification?.service });
  }
  return removed;
}

function run() {
  if (!fs.existsSync(lib.DRIVE_SOURCE)) {
    console.log(`Drive folder not found at:\n  ${lib.DRIVE_SOURCE}`);
    console.log('Is Google Drive for Desktop running and signed in?');
    process.exitCode = 1;
    return;
  }

  lib.ensureDirs();
  const state = lib.loadJSON(lib.DRIVE_STATE_PATH, { lastPulledAt: null });
  const since = state.lastPulledAt ? new Date(state.lastPulledAt) : null;

  const entries = listDriveFiles();

  const copied = [];
  const skippedOld = [];
  const skippedVideo = [];
  const skippedOther = [];
  const unrecognizedFolders = new Set();

  for (const { name, folder, srcPath } of entries) {
    const ext = path.extname(name).toLowerCase();
    const stat = fs.statSync(srcPath);

    if (lib.VIDEO_EXT.has(ext)) { skippedVideo.push(folder ? `${folder}/${name}` : name); continue; }
    if (!lib.IMAGE_EXT.has(ext)) { skippedOther.push(folder ? `${folder}/${name}` : name); continue; }
    if (since && stat.mtime <= since) { skippedOld.push(folder ? `${folder}/${name}` : name); continue; }

    if (folder && !lib.serviceForFolder(folder)) unrecognizedFolders.add(folder);

    const destDir = folder ? path.join(lib.DIRS.incoming, folder) : lib.DIRS.incoming;
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcPath, path.join(destDir, name));
    copied.push(folder ? `${folder}/${name}` : name);
  }

  lib.saveJSON(lib.DRIVE_STATE_PATH, { lastPulledAt: new Date().toISOString() });

  // Reconcile against ALL current Drive files (not just ones newer than the
  // cursor) — a deletion doesn't touch mtimes on the files that remain, so
  // this has to compare against the full current listing every time.
  const removed = reconcileRemovals(entries);

  console.log(`Pulled ${copied.length} new file(s) from Drive into media/incoming/.`);
  if (copied.length) console.log(copied.join(', '));
  if (skippedOld.length) console.log(`Skipped ${skippedOld.length} already pulled before ${since.toISOString()}.`);
  if (skippedVideo.length) console.log(`Skipped ${skippedVideo.length} video file(s) — video isn't supported by this pipeline yet: ${skippedVideo.join(', ')}`);
  if (skippedOther.length) console.log(`Skipped ${skippedOther.length} non-image file(s): ${skippedOther.join(', ')}`);
  if (unrecognizedFolders.size) console.log(`\nHeads up: folder(s) not mapped to a service yet — these photos will need manual classification: ${[...unrecognizedFolders].join(', ')}. Add them to FOLDER_SERVICE_MAP in scripts/media-lib.mjs.`);

  if (removed.length) {
    console.log(`\nRemoved from Drive — un-published ${removed.length} photo(s) (not deleted, just excluded from the site; flip status back to restore):`);
    removed.forEach(r => console.log(`  ${r.id}  [${r.service || 'unclassified'}]  ${r.title || ''}`));
  }

  if (copied.length) console.log('\nNext: npm run process-images');
  else if (removed.length) console.log('\nNext: npm run build-galleries (to apply the removal to the live site)');
}

run();

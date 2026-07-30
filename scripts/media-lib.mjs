import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(SCRIPTS_DIR, '..');
export const MEDIA = path.join(ROOT, 'media');

export const DIRS = {
  incoming:   path.join(MEDIA, 'incoming'),
  originals:  path.join(MEDIA, 'processed', 'originals'),
  duplicates: path.join(MEDIA, 'processed', 'duplicates'),
  optimized:  path.join(MEDIA, 'optimized'),
  thumbnails: path.join(MEDIA, 'thumbnails'),
  metadata:   path.join(MEDIA, 'metadata'),
  reports:    path.join(MEDIA, 'reports'),
};

export const INDEX_PATH  = path.join(DIRS.metadata, 'index.json');
export const HASHES_PATH = path.join(DIRS.metadata, 'hashes.json');

export const CONFIDENCE_THRESHOLD = 85;

// Canonical service taxonomy — matches SeaBreeze's actual 8 service pages,
// not a generic template list. Claude should classify every image's
// `classification.service` field using one of these keys.
export const SERVICES = [
  { key: 'window-cleaning',           label: 'Window Cleaning',            page: '/window-cleaning-san-diego.html' },
  { key: 'solar-panel-cleaning',      label: 'Solar Panel Cleaning',       page: '/solar-panel-cleaning-san-diego.html' },
  { key: 'pressure-washing',          label: 'Pressure Washing',           page: '/pressure-washing-san-diego.html' },
  { key: 'soft-washing',              label: 'Soft Washing',               page: '/soft-washing-san-diego.html' },
  { key: 'gutter-cleaning',           label: 'Gutter Cleaning',            page: '/gutter-cleaning-san-diego.html' },
  { key: 'holiday-light-installation',label: 'Holiday Light Installation', page: '/holiday-light-installation-san-diego.html' },
  { key: 'permanent-lighting',        label: 'Permanent Lighting',         page: '/permanent-lighting-san-diego.html' },
  { key: 'commercial-cleaning',       label: 'Commercial & HOA',           page: '/commercial-cleaning-san-diego.html' },
];

export function serviceByKey(key) {
  return SERVICES.find(s => s.key === key) || null;
}

// Maps a Drive subfolder name to a service key. The user organizes
// "Website Portfolio Gallery" into one subfolder per service — that folder
// placement is authoritative, not a vision-model guess. Add an entry here
// whenever a new subfolder shows up (e.g. "Soft Washing", "Commercial").
export const FOLDER_SERVICE_MAP = {
  'windows': 'window-cleaning',
  'window cleaning': 'window-cleaning',
  'solar panel cleaning': 'solar-panel-cleaning',
  'pressure washing': 'pressure-washing',
  'soft washing': 'soft-washing',
  'gutter cleaning': 'gutter-cleaning',
  'holiday light installation': 'holiday-light-installation',
  'govee lights': 'permanent-lighting',
  'permanent lighting': 'permanent-lighting',
  'commercial cleaning': 'commercial-cleaning',
  'commercial': 'commercial-cleaning',
};

export function serviceForFolder(folderName) {
  if (!folderName) return null;
  return FOLDER_SERVICE_MAP[folderName.trim().toLowerCase()] || null;
}

// If the user names a file "1.jpg", "2.png", etc., that's a deliberate
// slideshow-order hint — pull the leading number out of the base filename
// (ignoring extension). Returns null for anything else (e.g. "IMG_1234.jpg"),
// since that's just a camera filename, not an intentional order.
export function sortOrderFromFilename(name) {
  const base = name.replace(/\.[^.]+$/, '').trim();
  return /^\d+$/.test(base) ? parseInt(base, 10) : null;
}

export const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']);
export const VIDEO_EXT = new Set(['.mov', '.mp4', '.m4v', '.avi']);

// Google Drive for Desktop mount on this machine. The user drops new job
// photos into this folder only — nothing else pulls from or writes to it.
export const DRIVE_SOURCE = 'G:/My Drive/SeaBreeze Home Service/SeaBreeze Home Service Admin/Photos & Media/Website Portfolio Gallery';
export const DRIVE_STATE_PATH = path.join(MEDIA, 'metadata', 'drive-pull-state.json');

export function ensureDirs() {
  for (const dir of Object.values(DIRS)) fs.mkdirSync(dir, { recursive: true });
}

export function loadJSON(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

export function saveJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

export function loadHashes() { return loadJSON(HASHES_PATH, {}); }
export function saveHashes(h) { saveJSON(HASHES_PATH, h); }

export function loadIndex() { return loadJSON(INDEX_PATH, []); }
export function saveIndex(idx) { saveJSON(INDEX_PATH, idx); }

export function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function shortId(hash, existingIds, len = 10) {
  let id = hash.slice(0, len);
  while (existingIds.has(id)) {
    len++;
    id = hash.slice(0, len);
  }
  return id;
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function metadataPath(id) {
  return path.join(DIRS.metadata, `${id}.json`);
}

export function loadMetadata(id) {
  return loadJSON(metadataPath(id), null);
}

export function saveMetadata(record) {
  saveJSON(metadataPath(record.id), record);
}

// Rebuilds index.json summary rows from the per-image metadata files.
// Cheap at tens of thousands of images since each record is small JSON.
const NON_RECORD_FILES = new Set(['index.json', 'hashes.json', 'drive-pull-state.json']);
export function rebuildIndex() {
  const files = fs.existsSync(DIRS.metadata)
    ? fs.readdirSync(DIRS.metadata).filter(f => f.endsWith('.json') && !NON_RECORD_FILES.has(f))
    : [];
  const idx = files.map(f => {
    const rec = loadJSON(path.join(DIRS.metadata, f), null);
    if (!rec || !rec.id) return null;
    return {
      id: rec.id,
      status: rec.status,
      service: rec.classification?.service ?? null,
      beforeAfter: rec.classification?.beforeAfter ?? null,
      city: rec.location?.city ?? null,
      thumbnail: rec.paths?.thumbnail ?? null,
      seoFilename: rec.seo?.filename ?? null,
      ingestedAt: rec.ingestedAt,
    };
  }).filter(Boolean);
  saveIndex(idx);
  return idx;
}

export function relative(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

// Difference-hash (dHash): resize to 9x8 grayscale, compare each pixel to
// its right neighbor -> 64 bits -> 16 hex chars. Cheap, no ML dependency,
// good enough to tell "these two photos look alike" for ordering purposes.
export async function perceptualHash(sharpInstance) {
  const { data } = await sharpInstance
    .clone()
    .greyscale()
    .resize(9, 8, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let bits = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const i = row * 9 + col;
      bits += data[i] > data[i + 1] ? '1' : '0';
    }
  }
  let hex = '';
  for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}

export function hammingDistance(hexA, hexB) {
  if (!hexA || !hexB) return 64;
  let dist = 0;
  for (let i = 0; i < hexA.length; i++) {
    let x = parseInt(hexA[i], 16) ^ parseInt(hexB[i], 16);
    while (x) { dist += x & 1; x >>= 1; }
  }
  return dist;
}

// Greedy nearest-neighbor chain: visually similar photos end up adjacent.
export function orderBySimilarity(items) {
  if (items.length <= 2) return items.slice();
  const remaining = items.slice();
  const chain = [remaining.shift()];
  while (remaining.length) {
    const last = chain[chain.length - 1];
    let bestIdx = 0, bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = hammingDistance(last.perceptualHash, remaining[i].perceptualHash);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    chain.push(remaining.splice(bestIdx, 1)[0]);
  }
  return chain;
}

# Media pipeline

Automated intake for job photos: drop files into a Google Drive folder,
organized into subfolders by service, and they flow through to the portfolio
page and the matching service page gallery with almost no manual work.

**Images only — no video support yet.** Dropping a video file is a no-op;
`process-images` only recognizes jpg/jpeg/png/webp/heic/heif.

## The only drop location: Google Drive

The user drops new job photos into:

```
G:\My Drive\SeaBreeze Home Service\SeaBreeze Home Service Admin\Photos & Media\Website Portfolio Gallery\
```

synced locally via Google Drive for Desktop (that's what makes `G:` a real
local path this pipeline can read — there's no Drive API integration here).
**Organize photos into one subfolder per service** — that folder name is
the authoritative classification, not a vision-model guess:

| Drive subfolder | Service |
|---|---|
| `Windows` | window-cleaning |
| `Solar Panel Cleaning` | solar-panel-cleaning |
| `Pressure Washing` | pressure-washing |
| `Soft Washing` | soft-washing |
| `Gutter Cleaning` | gutter-cleaning |
| `Holiday Light Installation` | holiday-light-installation |
| `Govee Lights` | permanent-lighting |
| `Commercial Cleaning` | commercial-cleaning |

This mapping lives in `FOLDER_SERVICE_MAP` in `scripts/media-lib.mjs`. A new
folder name that isn't in that map still gets pulled in, but is left fully
unclassified for Claude to inspect and tag manually — add the mapping once
you're using that folder regularly so future photos in it skip that step.
Photos dropped loose in the root of the Drive folder (no subfolder) also get
the manual-classification treatment.

**Want a specific slideshow order?** Name the files `1.jpg`, `2.jpg`, `3.png`,
etc. within a service subfolder — that number is captured as `sortOrder` and
wins over every other ordering signal (similarity, before/after). Numbered
photos always come first, in that exact sequence; anything without a number
(new drops you haven't sequenced yet) falls back to similarity ordering and
gets appended after. Renaming an already-published photo's file in Drive to
a number doesn't get picked up by a normal `pull-photos` (the content hash
is unchanged, so it's correctly seen as "already pulled," not a new file) —
ask Claude to re-sync order from Drive filenames and it'll match files to
already-ingested photos by content hash and backfill `sortOrder` directly.

## Workflow

1. **Organize and drop photos** into the Drive folder above, sorted into the
   subfolders in the table.
2. **Run** `npm run pull-photos`. This copies anything new since the last
   pull into `media/incoming/` (preserving the subfolder it came from), and
   never writes to or deletes from Drive — Drive stays the single source of
   truth. Tracks the last pull time in `media/metadata/drive-pull-state.json`
   so re-running only looks at what's new (the sha256 dedup ledger is still
   the real safety net against double-processing).

   **Every run also reconciles removals.** It hashes every file currently in
   the Drive folder and compares against every already-tracked photo — if a
   photo was pulled in before but its file is no longer present anywhere in
   Drive (deleted, or removed from all subfolders), its status flips to
   `removed`. Nothing is deleted on disk and nothing is destructive — a
   `removed` photo is simply excluded once you next run `build-galleries`;
   flip `status` back to `classified` in its metadata JSON to restore it.
   Renaming a file to a number (see below) does NOT trigger a false removal
   — reconciliation matches by content hash, not filename.
3. **Run** `npm run process-images`. For each new file this:
   - Hashes it and skips exact duplicates (moved to `media/processed/duplicates/`).
   - Archives the untouched original to `media/processed/originals/<id>.<ext>`.
   - If it came from a recognized subfolder, sets `classification.service`
     and `confidence: 100` immediately — no guessing needed.
   - Computes a perceptual hash (`perceptualHash`, a 64-bit difference-hash)
     used later to order each service's slideshow by visual similarity.
   - Derives WebP + AVIF, responsive widths 400/800/1200/1600, a thumbnail,
     and an inline base64 blur placeholder.
   - Extracts EXIF capture date before the derived images strip it.
4. **Ask Claude Code to write captions for the pending photos.** Even though
   the service is now automatic, alt text/captions still need a look at each
   photo. Claude `Read`s each `media/thumbnails/<id>.webp` and fills in
   `seo.title` / `seo.alt` / `seo.caption` / `seo.description` (factual, no
   invented details) and `location.city` only when actually known.
5. **Run** `npm run finalize-media`. For every record with both
   `classification.service` and `seo.alt` filled in:
   - `confidence >= 85` → published, files renamed to an SEO slug
     (e.g. `pressure-washing-residential--<id>.webp`).
   - `confidence < 85` → `needs_review`, renamed but excluded from the site
     until confirmed. Folder-classified photos are always 100, so this only
     applies to the manually-classified fallback path.
6. **Run** `npm run build-galleries` to publish. This:
   - Writes `data/portfolio.json`, grouped by service, each group ordered by
     visual similarity (nearest-neighbor chain over a perceptual hash), then
     nudged so that within any pair the hash judges genuinely similar-looking
     (same job, not just same service), a before-tagged photo sits ahead of
     an after-tagged one. Most photos have no close match at all — that's
     expected, not a bug (see below).
   - Writes `data/gallery-<service-key>.json` per service — a flat array of
     **every** published photo for that service, same ordering.
   - Injects `ImageGallery` JSON-LD into `portfolio.html`.
   - Injects a small, constant-size slideshow mount point into that service
     page's "Recent Work" section, positioned directly above the FAQ section
     — removed entirely if a service has zero published photos. The actual
     photos are fetched and rendered client-side by `js/slideshow.js` (one
     shared, browser-cached engine used by both `portfolio.html` and every
     service page) + `js/service-gallery.js` (the small per-page glue that
     fetches that service's own JSON slice). This is what keeps things
     scalable: the HTML injected into each service page is the same size
     whether that service has 6 photos or 600 — only the small JSON payload
     grows, and the slideshow only ever has one image mounted in the DOM at
     a time.

### Similarity + before/after ordering, honestly

The perceptual hash is a **rough** signal — a real before/after pair often
looks quite different from itself by design (that's the point of the
cleaning), so pixel similarity between a genuine before/after pair can be
noisier than similarity between two unrelated photos of the same subject.
`SIMILARITY_THRESHOLD` in `scripts/build-galleries.mjs` (currently 25, out
of a possible 64) was calibrated by checking the actual Hamming distance
between every same-service before/after pair in the real dataset, not
picked from a generic "near-duplicate" convention. It will only nudge
photos it's reasonably confident are the same job — most before/after pairs
in a real photo batch won't have a close-enough match and will just fall
wherever the similarity chain puts them, which is correct behavior, not a
missed pairing. There is no visible "Before"/"After" label anywhere in the
UI; this ordering is invisible, it only affects sequence.

All scripts are idempotent and safe to re-run.

## Everyday checklist

1. Organize new job photos into the right Drive subfolder.
2. Tell Claude Code: "pull and process the new photos."
3. Claude runs `pull-photos` → `process-images` → writes captions for
   anything pending → `finalize-media` → `build-galleries`.
4. Review anything flagged `needs_review` (only photos dropped outside a
   recognized subfolder go through confidence scoring at all).
5. Commit and deploy as usual.

Video isn't supported — if a job also has video, it's handled outside this
pipeline entirely for now.

## Slideshows, not filter grids or thumbnail walls

Both `portfolio.html` and every service page use the same slideshow engine
(`js/slideshow.js`) — one photo mounted in the DOM at a time, not a grid or
thumbnail wall. Each slideshow:

- Plays automatically, ordered by visual similarity (with the before/after
  nudge described above)
- Has prev/next arrows, a play/pause button, and a speed button that cycles
  1×/2×/3× on each click
- Pauses autoplay on manual navigation (resume via the play button)
- Respects `prefers-reduced-motion` (starts paused)
- Supports touch swipe and arrow keys

**Portfolio page**: one slideshow per service category (only for services
with at least one published photo) — not a combined "all photos" view, and
no city/property-type filtering.

**Service pages**: one slideshow showing that service's own photos,
positioned directly above the FAQ section.

There's no before/after badge or tag anywhere in the UI —
`classification.beforeAfter` exists in the schema and is used for ordering
only, never rendered.

## Storage model — references, not duplication

The original spec described physical `/media/services/<slug>/`,
`/before-after/`, `/projects/` folders. Those are implemented as **metadata
overlays instead of duplicated files** — `classification.service` and a
future `projects` index reference the single canonical copy in
`media/optimized/` by id. This avoids double storage and avoids Windows
symlink permission issues (regular symlinks require dev mode or admin on
Windows).

## What's tracked in git vs. not

- **Not tracked**: `media/incoming/*`, `media/processed/originals/*`,
  `media/processed/duplicates/*` — private source material and raw masters,
  not deploy assets. Drive itself is the backup; nothing else backs these up.
- **Tracked**: `media/optimized/`, `media/thumbnails/`, `media/metadata/`,
  `media/reports/` — the actual published/derived output and the DAM's
  "database."

## Known limitation at scale

Committing tens of thousands of optimized images straight into this git repo
will eventually become impractical (repo size, Vercel deploy limits). Worth
revisiting (e.g. moving `media/optimized` + `media/thumbnails` to object
storage / a CDN) once real volume approaches a few thousand images.

## Metadata schema

See any file in `media/metadata/*.json` for the live shape. Key fields:

```
id, originalFilename, sourceFolder, sha256, ingestedAt, captureDate, dimensions
sortOrder            — from a numbered filename ("3.jpg" -> 3), else null
perceptualHash       — 64-bit dHash, hex string, used for similarity ordering
paths: { original, optimized, optimizedAvif, responsive: {400,800,1200,1600}, thumbnail }
blurPlaceholder      — data: URI, inline
status               — pending_classification | classified | needs_review | removed
classification: { service, surfaceType, buildingType, propertyType,
                   beforeAfter, cleaningMethod, equipmentVisible[],
                   qualityScore, sharpness, suitableForMarketing, confidence }
seo: { filename, title, alt, caption, description }
location: { city, neighborhood }
pairing: { pairId, role }   — unused; before/after pairing was dropped in favor of similarity ordering
tags: []
needsReview, finalizedAt, removedAt   — set when reconciliation flips status to "removed"
```

## Not built yet (future phases)

- Individual per-project detail pages (full static pages per photo would
  bloat the git repo at scale, see the limitation above)
- Video ingestion (thumbnailing, optimization) — `fluent-ffmpeg` and
  `@ffmpeg-installer/ffmpeg` are already installed as dependencies but
  nothing in this pipeline uses them yet
- Admin report as a browsable page rather than raw JSON in `media/reports/`
- Perceptual near-duplicate detection (the dHash is used for ordering, not
  for catching near-duplicate uploads — dedup is still exact-hash only)
- A real Drive API integration, if the desktop-sync approach ever becomes
  impractical (e.g. running this from a machine without Drive mounted)

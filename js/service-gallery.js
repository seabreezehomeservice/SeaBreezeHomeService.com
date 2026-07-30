// Page glue for each service page's own slideshow. All the actual widget
// logic lives in slideshow.js (shared with portfolio.html) — this file just
// fetches this page's own small JSON slice and mounts it. Loading only this
// service's photos (not the whole site's) is what keeps this scalable: page
// weight doesn't grow as the total photo count grows across other services.
(function () {
  const container = document.getElementById('service-gallery');
  if (!container) return;

  const service = container.dataset.service;
  const label = container.dataset.label || service;
  const emptyEl = document.getElementById('service-gallery-empty');

  fetch(`/data/gallery-${service}.json`, { cache: 'no-cache' })
    .then(r => r.ok ? r.json() : [])
    .then(items => {
      if (!Array.isArray(items) || items.length === 0) {
        if (emptyEl) emptyEl.hidden = false;
        return;
      }
      window.SeaBreezeSlideshow.mount(container, items, label);
    })
    .catch(() => { if (emptyEl) emptyEl.hidden = false; });
})();

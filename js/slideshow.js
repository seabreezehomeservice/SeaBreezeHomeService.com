// Shared slideshow widget engine — used by portfolio.html (one instance per
// service section) and every service page (one instance for that page's own
// photos). One cacheable file instead of duplicating this logic per page.
//
// Usage: SeaBreezeSlideshow.mount(containerEl, items, label)
//   items: array of { thumbnail, full, blur, title, alt, caption, description }
//   label: human-readable name used in aria-labels and as a caption fallback
window.SeaBreezeSlideshow = (function () {
  const SPEEDS = [4000, 2000, 1000];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(container, items, label) {
    if (!container || !items || items.length === 0) return null;

    container.innerHTML = `
      <div class="slideshow-stage">
        <button type="button" class="ss-nav ss-prev" aria-label="Previous ${label} photo">&lsaquo;</button>
        <img alt="" />
        <button type="button" class="ss-nav ss-next" aria-label="Next ${label} photo">&rsaquo;</button>
      </div>
      <div class="slideshow-controls">
        <button type="button" class="ss-btn ss-playpause" aria-label="Pause slideshow"></button>
        <button type="button" class="ss-btn ss-speed" aria-label="Increase slideshow speed"></button>
        <div class="slideshow-caption">
          <p class="ss-title"></p>
          <p class="ss-sub"></p>
        </div>
        <span class="ss-counter" aria-live="polite"></span>
      </div>
    `;

    const stage = container.querySelector('.slideshow-stage');
    const img = stage.querySelector('img');
    const prevBtn = container.querySelector('.ss-prev');
    const nextBtn = container.querySelector('.ss-next');
    const playBtn = container.querySelector('.ss-playpause');
    const speedBtn = container.querySelector('.ss-speed');
    const titleEl = container.querySelector('.ss-title');
    const subEl = container.querySelector('.ss-sub');
    const counterEl = container.querySelector('.ss-counter');

    let index = 0;
    let speedIdx = 0;
    let playing = !reduceMotion && items.length > 1;
    let timer = null;
    let inView = false;

    function renderSlide() {
      const item = items[index];
      img.classList.remove('loaded');
      stage.style.backgroundImage = item.blur ? `url('${item.blur}')` : 'none';
      img.src = item.full;
      img.alt = item.alt || item.title || `${label} photo`;
      img.onload = () => img.classList.add('loaded');
      titleEl.textContent = item.title || label;
      subEl.textContent = [item.cityLabel, item.description || item.caption].filter(Boolean).join(' — ');
      counterEl.textContent = `${index + 1} / ${items.length}`;
    }

    function go(delta) {
      index = (index + delta + items.length) % items.length;
      renderSlide();
    }

    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function startTimer() {
      stopTimer();
      if (!playing || !inView || items.length < 2) return;
      timer = setInterval(() => go(1), SPEEDS[speedIdx]);
    }

    function setPlaying(next) {
      playing = next;
      playBtn.textContent = playing ? '⏸' : '▶';
      playBtn.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
      startTimer();
    }

    prevBtn.addEventListener('click', () => { go(-1); setPlaying(false); });
    nextBtn.addEventListener('click', () => { go(1); setPlaying(false); });
    playBtn.addEventListener('click', () => setPlaying(!playing));
    speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % SPEEDS.length;
      speedBtn.textContent = `⏩ ${SPEEDS.length - speedIdx}×`;
      startTimer();
    });
    container.addEventListener('mouseenter', stopTimer);
    container.addEventListener('mouseleave', startTimer);
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { go(-1); setPlaying(false); }
      if (e.key === 'ArrowRight') { go(1); setPlaying(false); }
    });
    let touchStartX = null;
    stage.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { go(dx > 0 ? -1 : 1); setPlaying(false); }
      touchStartX = null;
    }, { passive: true });

    if (items.length < 2) { prevBtn.hidden = true; nextBtn.hidden = true; playBtn.hidden = true; speedBtn.hidden = true; }

    speedBtn.textContent = `⏩ ${SPEEDS.length - speedIdx}×`;
    playBtn.textContent = playing ? '⏸' : '▶';
    renderSlide();

    // Don't advance at all while off-screen — only start (from slide 1,
    // already the default) once the whole slideshow is actually in view,
    // and pause again if the visitor scrolls away from it.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        inView = entry.isIntersecting;
        if (inView) startTimer(); else stopTimer();
      });
    }, { threshold: 1.0 });
    observer.observe(container);

    return { go, setPlaying };
  }

  return { mount };
})();

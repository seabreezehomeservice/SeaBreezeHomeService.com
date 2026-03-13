/**
 * SeaBreeze Home Service — Page Generator
 * Creates 7 service pages + 10 location pages
 */
import fs from 'fs';

const PHONE = 'https://clienthub.getjobber.com/hubs/a12ee5bd-819c-4fd8-b2d2-ebcfefefaa55/public/requests/1907659/new';
const SITE  = 'https://seabreezehomeservice.com';
const LOGO  = 'brand_assets/SEABREEZE.png';   // relative to page root
const YEAR  = 2026;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

const head = (title, desc, canonical, ogImg = 'images/holiday-light-installation-san-diego-home.jpg') => `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <link rel="canonical" href="${SITE}/${canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${SITE}/${canonical}" />
  <meta property="og:site_name" content="SeaBreeze Home Service LLC" />
  <meta property="og:image" content="${SITE}/${ogImg}" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="geo.region" content="US-CA" />
  <meta name="geo.placename" content="San Diego" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />`;

const navbar = (activeHref = '/') => `
  <nav id="navbar" role="navigation" aria-label="Main navigation">
    <a href="/" class="nav-logo" aria-label="SeaBreeze Home Service - Home">
      <img src="${LOGO}" alt="SeaBreeze Home Service LLC logo" width="160" height="52" />
    </a>
    <ul class="nav-links" role="list">
      <li><a href="/#services">Services</a></li>
      <li><a href="/#why">Why Us</a></li>
      <li><a href="/#reviews">Reviews</a></li>
      <li><a href="/#areas">Service Areas</a></li>
      <li><a href="/#faq">FAQ</a></li>
      <li><a href="${PHONE}" class="btn-cta">Get a Quote</a></li>
    </ul>
    <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <div id="mobile-menu" role="dialog" aria-label="Mobile navigation">
    <ul>
      <li><a href="/#services" onclick="closeMobile()">Services</a></li>
      <li><a href="/#why" onclick="closeMobile()">Why Us</a></li>
      <li><a href="/#reviews" onclick="closeMobile()">Reviews</a></li>
      <li><a href="/#areas" onclick="closeMobile()">Service Areas</a></li>
      <li><a href="/#faq" onclick="closeMobile()">FAQ</a></li>
      <li><a href="${PHONE}" onclick="closeMobile()" class="btn-cta" style="display:inline-block;margin-top:.5rem;">Get a Quote</a></li>
    </ul>
  </div>`;

const footer = () => `
  <section id="cta-band" aria-label="Call to action">
    <div class="cta-inner">
      <div class="cta-text">
        <h2>Ready for a Cleaner Home?</h2>
        <p>Free quotes — fast response — all of San Diego County.</p>
      </div>
      <a href="${PHONE}" class="btn-cta-white">Get a Free Quote</a>
    </div>
  </section>
  <footer role="contentinfo">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="${LOGO}" alt="SeaBreeze Home Service LLC" loading="lazy" />
        <p>Premium exterior home maintenance serving San Diego County. Fully insured, family owned.</p>
      </div>
      <nav class="footer-col" aria-label="Services">
        <h4>Services</h4>
        <ul>
          <li><a href="/window-cleaning-san-diego.html">Window Cleaning</a></li>
          <li><a href="/solar-panel-cleaning-san-diego.html">Solar Panel Cleaning</a></li>
          <li><a href="/gutter-cleaning-san-diego.html">Gutter Cleaning</a></li>
          <li><a href="/pressure-washing-san-diego.html">Pressure Washing</a></li>
          <li><a href="/soft-washing-san-diego.html">Soft Washing</a></li>
          <li><a href="/holiday-light-installation-san-diego.html">Holiday Lighting</a></li>
          <li><a href="/permanent-lighting-san-diego.html">Permanent Lighting</a></li>
        </ul>
      </nav>
      <nav class="footer-col" aria-label="Service Areas">
        <h4>Service Areas</h4>
        <ul>
          <li><a href="/la-jolla.html">La Jolla</a></li>
          <li><a href="/del-mar.html">Del Mar</a></li>
          <li><a href="/encinitas.html">Encinitas</a></li>
          <li><a href="/carlsbad.html">Carlsbad</a></li>
          <li><a href="/coronado.html">Coronado</a></li>
          <li><a href="/rancho-santa-fe.html">Rancho Santa Fe</a></li>
          <li><a href="/poway.html">Poway</a></li>
        </ul>
      </nav>
      <div class="footer-col">
        <h4>Contact</h4>
        <ul>
          <li><a href="${PHONE}">Get a Quote</a></li>
          <li><a href="mailto:INSERTEMAIL">Email Us</a></li>
          <li><span style="color:var(--muted);font-size:.85rem;">San Diego County, CA</span></li>
          <li><span style="color:var(--muted);font-size:.85rem;">Mon–Sat 7am–6pm</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ${YEAR} SeaBreeze Home Service LLC. All rights reserved. Serving San Diego County, CA.</p>
      <p><a href="/">Home</a></p>
    </div>
  </footer>`;

const js = () => `
  <script>
    const nb = document.getElementById('navbar');
    window.addEventListener('scroll', () => nb.classList.toggle('scrolled', scrollY > 20), {passive:true});
    const hb = document.getElementById('hamburger');
    const mm = document.getElementById('mobile-menu');
    hb.addEventListener('click', () => { const o = mm.classList.toggle('open'); hb.setAttribute('aria-expanded', o); });
    function closeMobile() { mm.classList.remove('open'); hb.setAttribute('aria-expanded','false'); }
    document.documentElement.classList.add('js-loaded');
    const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);} }), {threshold:0.08});
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    document.querySelectorAll('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item'), open = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-q').setAttribute('aria-expanded','false'); });
        if(!open) { item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
      });
    });
  </script>`;

const faqHtml = (faqs) => faqs.map((f, i) => `
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
            ${f.q}
            <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="faq-a" id="faq-a-${i}" role="region"><p>${f.a}</p></div>
        </div>`).join('');

const faqSchema = (faqs) => JSON.stringify({
  "@context":"https://schema.org","@type":"FAQPage",
  "mainEntity": faqs.map(f=>({
    "@type":"Question","name":f.q,
    "acceptedAnswer":{"@type":"Answer","text":f.a}
  }))
});

const serviceSchema = (name, desc, slug) => JSON.stringify({
  "@context":"https://schema.org",
  "@graph":[
    {"@type":["LocalBusiness","HomeAndConstructionBusiness"],"@id":`${SITE}/#business`,"name":"SeaBreeze Home Service LLC","telephone":"(Insert Business Phone)","url":SITE,"logo":`${SITE}/brand_assets/SEABREEZE.png`,"address":{"@type":"PostalAddress","addressLocality":"San Diego","addressRegion":"CA","addressCountry":"US"},"areaServed":{"@type":"AdministrativeArea","name":"San Diego County"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.0","reviewCount":"47","bestRating":"5","worstRating":"1"}},
    {"@type":"Service","name":name,"description":desc,"provider":{"@id":`${SITE}/#business`},"areaServed":{"@type":"AdministrativeArea","name":"San Diego County"},"url":`${SITE}/${slug}`}
  ]
});

// ─── SERVICE PAGE TEMPLATE ────────────────────────────────────────────────────

const SERVICE_LINKS = [
  {label:'Window Cleaning', href:'/window-cleaning-san-diego.html'},
  {label:'Solar Panel Cleaning', href:'/solar-panel-cleaning-san-diego.html'},
  {label:'Gutter Cleaning', href:'/gutter-cleaning-san-diego.html'},
  {label:'Pressure Washing', href:'/pressure-washing-san-diego.html'},
  {label:'Soft Washing', href:'/soft-washing-san-diego.html'},
  {label:'Holiday Lighting', href:'/holiday-light-installation-san-diego.html'},
  {label:'Permanent Lighting', href:'/permanent-lighting-san-diego.html'},
];

const LOCATION_LINKS = [
  {label:'La Jolla',href:'/la-jolla.html'},{label:'Del Mar',href:'/del-mar.html'},
  {label:'Encinitas',href:'/encinitas.html'},{label:'Carlsbad',href:'/carlsbad.html'},
  {label:'Coronado',href:'/coronado.html'},{label:'Rancho Santa Fe',href:'/rancho-santa-fe.html'},
  {label:'Poway',href:'/poway.html'},{label:'Escondido',href:'/escondido.html'},
  {label:'Chula Vista',href:'/chula-vista.html'},{label:'San Marcos',href:'/san-marcos.html'},
  {label:'Solana Beach',href:'/solana-beach.html'},{label:'El Cajon',href:'/el-cajon.html'},
  {label:'Santee',href:'/santee.html'},{label:'Oceanside',href:'/oceanside.html'},
  {label:'Vista',href:'/vista.html'},{label:'National City',href:'/national-city.html'},
  {label:'Point Loma',href:'/point-loma.html'},{label:'Mission Hills',href:'/mission-hills.html'},
  {label:'Pacific Beach',href:'/pacific-beach.html'},{label:'Mission Valley',href:'/mission-valley.html'},
  {label:'Clairemont',href:'/clairemont.html'},{label:'4S Ranch',href:'/4s-ranch.html'},
  {label:'Carmel Valley',href:'/carmel-valley.html'},
];

function servicePage(p) {
  const relLinks = SERVICE_LINKS.filter(l => !l.href.includes(p.slug));
  const beforeAfter = p.slider ? `
      <div class="ba-grid reveal" style="margin-top:2.5rem;">
        <div>
          <span class="ba-caption">${p.slider.caption}</span>
          <div class="ba-slider" data-slider>
            <img class="ba-after" src="${p.slider.after.src}" alt="${p.slider.after.alt}" title="${p.slider.after.title}" loading="lazy" />
            <div class="ba-before-wrap"><img src="${p.slider.before.src}" alt="${p.slider.before.alt}" title="${p.slider.before.title}" loading="lazy" /></div>
            <div class="ba-handle"><div class="ba-line"></div><div class="ba-btn">◀▶</div></div>
            <span class="ba-label ba-label-before">Before</span>
            <span class="ba-label ba-label-after">After</span>
          </div>
        </div>
      </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>${head(p.title, p.desc, p.slug, p.ogImg)}
  <script type="application/ld+json">${serviceSchema(p.h1, p.desc, p.slug)}<\/script>
  <script type="application/ld+json">${faqSchema(p.faqs)}<\/script>
  <style>.hero-bg-img{background-image:url('${p.heroBg}');}</style>
</head>
<body class="bg-gradient-mesh">
${navbar()}

<header class="page-hero" role="banner">
  <div class="hero-bg-img" role="presentation" aria-hidden="true"></div>
  <div class="page-hero-content">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a><span>›</span>
      <span>${p.h1}</span>
    </nav>
    <h1 class="hero-h1">${p.h1Marked}</h1>
    <p class="hero-sub">${p.intro}</p>
    <div class="hero-ctas">
      <a href="${PHONE}" class="btn-primary-lg">Get a Free Quote</a>
      <a href="/#services" class="btn-outline">All Services</a>
    </div>
  </div>
</header>

<section aria-labelledby="about-heading" style="background:rgba(18,72,128,0.25);">
  <div class="section-inner">
    <p class="section-eyebrow reveal">About This Service</p>
    <h2 class="section-h2 reveal reveal-delay-1" id="about-heading">${p.aboutH2}</h2>
    <p class="section-sub reveal reveal-delay-2" style="max-width:680px;">${p.aboutP}</p>
${beforeAfter}
    <div class="benefits-list reveal reveal-delay-3" style="margin-top:2.5rem;">
      ${p.benefits.map(b=>`<div class="benefit-item"><svg class="benefit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg><div><strong>${b.title}</strong><span>${b.desc}</span></div></div>`).join('')}
    </div>
  </div>
</section>

<section aria-labelledby="faq-heading" style="background:var(--navy);">
  <div class="section-inner">
    <p class="section-eyebrow reveal">FAQ</p>
    <h2 class="section-h2 reveal reveal-delay-1" id="faq-heading">Frequently Asked Questions</h2>
    <div class="faq-list reveal reveal-delay-2">${faqHtml(p.faqs)}</div>
  </div>
</section>

<section aria-labelledby="areas-heading" style="background:rgba(18,72,128,0.25);">
  <div class="section-inner">
    <p class="section-eyebrow reveal">Coverage</p>
    <h2 class="section-h2 reveal reveal-delay-1" id="areas-heading">Serving All of San Diego County</h2>
    <div class="areas-list reveal reveal-delay-2" role="list">
      ${LOCATION_LINKS.map(l=>`<a href="${l.href}" class="area-tag" role="listitem">${l.label}</a>`).join('')}
    </div>
    <p class="section-sub reveal" style="margin-top:1.5rem;">Also serving Santee, El Cajon, National City, Pacific Beach, Point Loma, Mission Hills, 4S Ranch, Carmel Valley, and all of San Diego County.</p>
  </div>
</section>

<section aria-labelledby="related-heading" style="background:var(--navy);padding-bottom:3rem;">
  <div class="section-inner" style="padding-bottom:2rem;">
    <p class="section-eyebrow reveal">Related Services</p>
    <h2 class="section-h2 reveal reveal-delay-1" id="related-heading">More Services from SeaBreeze</h2>
    <div class="service-links reveal reveal-delay-2">
      ${relLinks.map(l=>`<a href="${l.href}" class="service-link-tag">${l.label}</a>`).join('')}
    </div>
  </div>
</section>

${footer()}
${js()}
<script>
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const wrap=slider.querySelector('.ba-before-wrap'),handle=slider.querySelector('.ba-handle');
    let a=false;
    const set=x=>{const r=slider.getBoundingClientRect(),pct=Math.min(100,Math.max(0,(x-r.left)/r.width*100));wrap.style.width=pct+'%';handle.style.left=pct+'%';};
    slider.addEventListener('mousedown',e=>{a=true;set(e.clientX);e.preventDefault();});
    slider.addEventListener('touchstart',e=>{a=true;set(e.touches[0].clientX);},{passive:true});
    window.addEventListener('mousemove',e=>{if(a)set(e.clientX);});
    window.addEventListener('touchmove',e=>{if(a)set(e.touches[0].clientX);},{passive:true});
    window.addEventListener('mouseup',()=>a=false);
    window.addEventListener('touchend',()=>a=false);
  });
<\/script>
</body>
</html>`;
}

// ─── LOCATION PAGE TEMPLATE ───────────────────────────────────────────────────

function locationPage(p) {
  return `<!DOCTYPE html>
<html lang="en">
<head>${head(p.title, p.desc, p.slug)}
  <script type="application/ld+json">${JSON.stringify({
    "@context":"https://schema.org",
    "@graph":[
      {"@type":["LocalBusiness","HomeAndConstructionBusiness"],"@id":`${SITE}/#business`,"name":"SeaBreeze Home Service LLC","telephone":"(Insert Business Phone)","url":SITE,"logo":`${SITE}/brand_assets/SEABREEZE.png`,"address":{"@type":"PostalAddress","addressLocality":"San Diego","addressRegion":"CA","addressCountry":"US"},"areaServed":{"@type":"AdministrativeArea","name":"San Diego County"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.0","reviewCount":"47","bestRating":"5","worstRating":"1"}},
      {"@type":"FAQPage","mainEntity":p.faqs.map(f=>({
        "@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}
      }))}
    ]
  })}<\/script>
  <style>.hero-bg-img{background-image:url('images/solar-panel-cleaning-san-diego.jpg');}</style>
</head>
<body class="bg-gradient-mesh">
${navbar()}

<header class="page-hero" role="banner">
  <div class="hero-bg-img" role="presentation" aria-hidden="true"></div>
  <div class="page-hero-content">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a><span>›</span>
      <a href="/#areas">Service Areas</a><span>›</span>
      <span>${p.city}</span>
    </nav>
    <h1 class="hero-h1">Exterior Home Services in <span class="accent">${p.city}</span>, San Diego</h1>
    <p class="hero-sub">${p.intro}</p>
    <div class="hero-ctas">
      <a href="${PHONE}" class="btn-primary-lg">Get a Free Quote</a>
      <a href="/#services" class="btn-outline">View All Services</a>
    </div>
  </div>
</header>

<section style="background:rgba(18,72,128,0.25);">
  <div class="section-inner">
    <p class="section-eyebrow reveal">About ${p.city}</p>
    <h2 class="section-h2 reveal reveal-delay-1">Professional Home Services in ${p.city}</h2>
    <p class="section-sub reveal reveal-delay-2" style="max-width:700px;">${p.about}</p>
    <div class="benefits-list reveal" style="margin-top:2.5rem;">
      ${SERVICE_LINKS.map(s=>`<div class="benefit-item"><svg class="benefit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg><div><strong><a href="${s.href}" style="color:var(--sea);text-decoration:none;">${s.label}</a></strong><span>Professional ${s.label.toLowerCase()} in ${p.city} and throughout San Diego County.</span></div></div>`).join('')}
    </div>
  </div>
</section>

<section style="background:var(--navy);">
  <div class="section-inner">
    <p class="section-eyebrow reveal">FAQ</p>
    <h2 class="section-h2 reveal reveal-delay-1">Common Questions from ${p.city} Homeowners</h2>
    <div class="faq-list reveal reveal-delay-2">${faqHtml(p.faqs)}</div>
  </div>
</section>

<section style="background:rgba(18,72,128,0.25);">
  <div class="section-inner">
    <p class="section-eyebrow reveal">Nearby Areas</p>
    <h2 class="section-h2 reveal reveal-delay-1">Also Serving These San Diego Communities</h2>
    <div class="areas-list reveal reveal-delay-2">
      ${LOCATION_LINKS.filter(l=>!l.href.includes(p.slug)).map(l=>`<a href="${l.href}" class="area-tag">${l.label}</a>`).join('')}
    </div>
  </div>
</section>

${footer()}
${js()}
</body>
</html>`;
}

// ─── PAGE DATA ────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    slug: 'window-cleaning-san-diego.html',
    title: 'Professional Window Cleaning San Diego | SeaBreeze Home Service',
    desc: 'Professional window cleaning in San Diego County. Streak-free interior and exterior window washing for residential and commercial properties. Fully insured, family owned. Get a free quote today.',
    h1: 'Window Cleaning in San Diego, CA',
    h1Marked: 'Window Cleaning in <span class="accent">San Diego, CA</span>',
    intro: 'Professional interior and exterior window cleaning for residential and commercial properties throughout San Diego County. Streak-free results using purified water filtration systems.',
    heroBg: 'images/seabreeze-work-san-diego-3.jpg',
    ogImg: 'images/seabreeze-work-san-diego-3.jpg',
    aboutH2: 'San Diego\'s Trusted Window Cleaning Experts',
    aboutP: 'SeaBreeze Home Service provides professional window cleaning for homes and businesses throughout San Diego County. We use water-fed pole systems with purified water — eliminating streaks and mineral deposits for crystal-clear results that last longer than traditional methods.',
    slider: {
      caption: 'Window Cleaning Results – Before & After',
      before: { src:'images/window-cleaning-before-san-diego.jpg', alt:'Dirty commercial windows before professional window cleaning in San Diego', title:'Dirty Windows Before Cleaning — SeaBreeze San Diego' },
      after:  { src:'images/window-cleaning-after-san-diego.jpg',  alt:'Spotlessly clean windows after professional window cleaning by SeaBreeze in San Diego', title:'Clean Windows After Professional Cleaning — SeaBreeze San Diego' },
    },
    benefits: [
      { title:'Purified Water System', desc:'We use water-fed poles with de-ionized water — no soaps or chemicals, just spot-free streak-free results.' },
      { title:'Interior & Exterior', desc:'Full interior and exterior window washing including screens, sills, and frames.' },
      { title:'Residential & Commercial', desc:'Single-family homes, condos, HOAs, storefronts, and office buildings throughout San Diego.' },
      { title:'Fully Insured Technicians', desc:'All technicians are trained, insured, and equipped with proper safety equipment for multi-story work.' },
    ],
    faqs: [
      { q:'How often should I have my windows cleaned in San Diego?', a:'Most San Diego homeowners benefit from window cleaning every 3–6 months. San Diego\'s coastal climate brings salt air and dust that accumulate on glass. Annual cleaning is a minimum; twice-yearly is ideal for maintaining curb appeal and clarity.' },
      { q:'Do you clean interior and exterior windows?', a:'Yes. SeaBreeze cleans both interior and exterior windows. We also clean screens, tracks, and window frames as part of our standard service.' },
      { q:'What system do you use for window cleaning?', a:'We use water-fed pole systems with purified, de-ionized water. This method eliminates mineral deposits and streaking, and is safer than traditional ladder methods for two-story windows.' },
      { q:'Do you clean windows at commercial properties in San Diego?', a:'Yes. We service restaurants, retail storefronts, office buildings, and HOA common areas throughout San Diego County.' },
      { q:'How do I get a window cleaning quote in San Diego?', a:'Call us or click the Get a Free Quote button. We provide same-day quotes for all San Diego County window cleaning jobs.' },
    ],
  },
  {
    slug: 'solar-panel-cleaning-san-diego.html',
    title: 'Solar Panel Cleaning San Diego | Maximize Energy Output | SeaBreeze',
    desc: 'Professional solar panel cleaning in San Diego County. Restore up to 25% lost energy efficiency with our purified water cleaning system. Fully insured. Free estimates.',
    h1: 'Solar Panel Cleaning in San Diego, CA',
    h1Marked: 'Solar Panel Cleaning in <span class="accent">San Diego, CA</span>',
    intro: 'Maximize your solar investment with professional solar panel cleaning in San Diego. Dirty panels lose up to 25% efficiency — SeaBreeze restores peak performance using purified water systems with no harsh chemicals.',
    heroBg: 'images/solar-panel-cleaning-san-diego-2.jpg',
    ogImg: 'images/window-cleaning-san-diego-2.jpg',
    aboutH2: 'Restore Your Solar Panel Efficiency in San Diego',
    aboutP: 'San Diego\'s sunny, dry climate is perfect for solar energy — but it also means dust, bird droppings, and pollen build up on panels quickly. Studies show dirty solar panels can lose 15–25% of their energy output. SeaBreeze uses a purified water system that leaves zero residue, maximizing the energy captured by each panel.',
    benefits: [
      { title:'Up to 25% More Energy', desc:'Dirty panels can lose 15–25% efficiency. Professional cleaning restores full output and protects your solar ROI.' },
      { title:'Purified Water — No Residue', desc:'We use de-ionized water systems that leave zero mineral deposits or soap film, unlike garden hose washing.' },
      { title:'Roof-Safe Techniques', desc:'Our technicians are trained for safe rooftop access on all tile, composition, and flat roof types common in San Diego.' },
      { title:'Warranty-Safe Cleaning', desc:'Our gentle purified water method won\'t void panel warranties or damage coatings on your panels.' },
    ],
    faqs: [
      { q:'How often should solar panels be cleaned in San Diego?', a:'Solar panels in San Diego should be professionally cleaned every 6–12 months. San Diego\'s dry climate and occasional Santa Ana winds mean dust, pollen, and bird droppings accumulate fast — especially in inland areas like Escondido, Poway, and El Cajon.' },
      { q:'How much efficiency do dirty solar panels lose?', a:'Research shows dirty solar panels in Southern California can lose 15–25% of their energy output. Over a year, this can represent hundreds of dollars in lost electricity production. Regular cleaning pays for itself.' },
      { q:'Can I just clean solar panels myself with a garden hose?', a:'Rinsing with tap water can leave mineral deposits on the glass surface, reducing efficiency over time. SeaBreeze uses purified de-ionized water that evaporates cleanly, leaving no residue. We also use soft brushes safe for panel coatings.' },
      { q:'Is solar panel cleaning safe for all roof types?', a:'Yes. Our technicians are trained for safe access on tile, composition shingles, and flat roofs common throughout San Diego County. We use appropriate safety equipment for all roof types.' },
      { q:'Do you clean solar panels for HOAs and commercial properties?', a:'Yes. We service residential, HOA, and commercial solar installations throughout San Diego County, including Chula Vista, El Cajon, Santee, and all surrounding cities.' },
    ],
  },
  {
    slug: 'gutter-cleaning-san-diego.html',
    title: 'Gutter Cleaning San Diego | Protect Your Home | SeaBreeze Home Service',
    desc: 'Professional gutter cleaning in San Diego County. Remove debris, flush downspouts, and protect your home from water damage. Fully insured. Free estimates for homeowners.',
    h1: 'Gutter Cleaning in San Diego, CA',
    h1Marked: 'Gutter Cleaning in <span class="accent">San Diego, CA</span>',
    intro: 'Protect your home from costly water damage with professional gutter cleaning in San Diego. SeaBreeze removes leaves, debris, and blockages — then flushes downspouts to verify proper drainage.',
    heroBg: 'images/gutter-cleaning-after-san-diego.jpg',
    ogImg: 'images/gutter-cleaning-after-san-diego.jpg',
    aboutH2: 'Why Gutter Cleaning Matters in San Diego',
    aboutP: 'San Diego homeowners often overlook gutters — but clogged gutters can cause fascia rot, foundation damage, and landscape erosion. Even in our dry climate, seasonal rains can overflow blocked gutters and cause significant water intrusion. SeaBreeze provides thorough gutter cleaning and downspout flushing to keep your home protected.',
    slider: {
      caption: 'Gutter Cleaning Results – Before & After',
      before: { src:'images/gutter-cleaning-before-san-diego.jpg', alt:'Clogged gutter full of debris before professional gutter cleaning in San Diego', title:'Clogged Gutter Before Cleaning — SeaBreeze San Diego' },
      after:  { src:'images/gutter-cleaning-after-san-diego.jpg',  alt:'Clean clear gutter after professional gutter cleaning by SeaBreeze Home Service in San Diego', title:'Clean Gutter After Professional Gutter Cleaning — SeaBreeze San Diego' },
    },
    benefits: [
      { title:'Full Debris Removal', desc:'We remove all leaves, dirt, and debris from gutters by hand and with professional tools.' },
      { title:'Downspout Flushing', desc:'Every downspout is flushed and tested to confirm water flows freely and away from your foundation.' },
      { title:'Prevent Water Damage', desc:'Clogged gutters can cause fascia rot, soffit damage, landscape erosion, and foundation issues.' },
      { title:'Roof Inspection Included', desc:'While on the roof we flag any visible concerns with your roofline, fascia, or gutters at no extra charge.' },
    ],
    faqs: [
      { q:'How often should gutters be cleaned in San Diego?', a:'San Diego gutters should be cleaned at least once per year — ideally in late fall after palm frond drop and before the rainy season. Homes near large trees may need cleaning twice yearly.' },
      { q:'What happens if I don\'t clean my gutters?', a:'Clogged gutters cause water to overflow and pool against your foundation, causing cracks and settling. They can also cause fascia board rot, soffit damage, and landscape erosion — repairs that cost far more than regular gutter cleaning.' },
      { q:'Do you flush downspouts when cleaning gutters?', a:'Yes. We flush every downspout after clearing debris to confirm water flows properly. If a downspout is clogged, we clear the blockage as part of the service.' },
      { q:'Can you clean gutters on two-story homes in San Diego?', a:'Yes. SeaBreeze is fully equipped and insured for multi-story gutter cleaning in San Diego. All technicians use proper ladder safety protocols and equipment.' },
      { q:'Do you install gutter guards after cleaning?', a:'We focus on professional gutter cleaning and maintenance. Ask us about gutter guard recommendations when you receive your quote.' },
    ],
  },
  {
    slug: 'pressure-washing-san-diego.html',
    title: 'Pressure Washing San Diego | Driveways, Patios & More | SeaBreeze',
    desc: 'Professional pressure washing in San Diego County. Clean driveways, patios, fences, decks, and exterior walls. Remove mold, mildew, and stains. Fully insured. Free estimates.',
    h1: 'Pressure Washing in San Diego, CA',
    h1Marked: 'Pressure Washing in <span class="accent">San Diego, CA</span>',
    intro: 'Transform your home\'s exterior with professional pressure washing in San Diego. SeaBreeze removes years of dirt, mold, and staining from driveways, patios, fences, and exterior walls — restoring your home\'s curb appeal instantly.',
    heroBg: 'images/pressure-washing-san-diego-sidewalk.jpg',
    ogImg: 'images/pressure-washing-san-diego-sidewalk.jpg',
    aboutH2: 'Professional Pressure Washing Throughout San Diego',
    aboutP: 'San Diego\'s climate — salt air near the coast, dust inland, seasonal rains — leaves homes with significant buildup on hard surfaces. SeaBreeze uses commercial-grade pressure washing equipment calibrated for each surface type, removing algae, mold, tire marks, and years of grime without damaging concrete, wood, or masonry.',
    benefits: [
      { title:'Driveway & Walkway Cleaning', desc:'Remove oil stains, tire marks, and years of ground-in dirt from concrete and pavers.' },
      { title:'Patio & Deck Washing', desc:'Restore the natural color of your concrete, pavers, or wood deck surfaces safely.' },
      { title:'Fence & Wall Washing', desc:'Clean block walls, vinyl fences, stucco, and painted surfaces without damage.' },
      { title:'Commercial Surfaces', desc:'Parking lots, storefronts, and commercial exterior surfaces cleaned throughout San Diego County.' },
    ],
    faqs: [
      { q:'What surfaces can be pressure washed in San Diego?', a:'Concrete driveways, concrete patios, pavers, block walls, vinyl fencing, wood decks, stucco exteriors, and most hard exterior surfaces can be safely pressure washed. Delicate surfaces like painted wood siding benefit from soft washing instead.' },
      { q:'How often should I pressure wash my driveway?', a:'San Diego driveways typically benefit from pressure washing once or twice per year, depending on tree cover, oil drips, and foot traffic. Coastal homes may benefit from more frequent washing due to salt air residue.' },
      { q:'Can pressure washing damage my concrete?', a:'When done correctly at the right PSI and nozzle distance, pressure washing is safe for concrete. SeaBreeze uses appropriate pressure settings for each surface type. We do not use high-pressure settings on softer materials.' },
      { q:'Do you offer pressure washing for HOA common areas?', a:'Yes. We service HOA common areas, apartment complexes, and commercial properties throughout San Diego County. Contact us for volume pricing on multi-unit properties.' },
      { q:'What is the difference between pressure washing and soft washing?', a:'Pressure washing uses high-pressure water to physically blast away dirt from hard surfaces. Soft washing uses low pressure with cleaning solutions to treat organic growth on delicate surfaces like roofs and painted siding. SeaBreeze offers both.' },
    ],
  },
  {
    slug: 'soft-washing-san-diego.html',
    title: 'Soft Washing San Diego | Roof & Siding Cleaning | SeaBreeze Home Service',
    desc: 'Professional soft washing in San Diego County. Safe low-pressure roof cleaning, stucco washing, and siding treatment. Removes algae, mold, and staining without damage. Free estimates.',
    h1: 'Soft Washing in San Diego, CA',
    h1Marked: 'Soft Washing in <span class="accent">San Diego, CA</span>',
    intro: 'Safe, effective soft washing for roofs, stucco, siding, and other delicate exterior surfaces throughout San Diego County. SeaBreeze uses eco-friendly cleaning solutions that kill algae, mold, and lichen at the root — without high pressure that can damage your home.',
    heroBg: 'images/soft-washing-san-diego.jpg',
    ogImg: 'images/soft-washing-san-diego.jpg',
    aboutH2: 'What is Soft Washing?',
    aboutP: 'Soft washing uses low-pressure water combined with professional-grade biodegradable cleaning solutions to safely clean exterior surfaces that would be damaged by high-pressure washing. It\'s the industry-recommended method for roofs, stucco, EIFS, wood siding, and painted surfaces. SeaBreeze\'s soft washing treatments kill organic growth at the root — results last longer than pressure washing alone.',
    benefits: [
      { title:'Safe for Roofs', desc:'Low-pressure soft washing is safe for asphalt shingles, tile roofs, and flat roofs — recommended by most roofing manufacturers.' },
      { title:'Stucco & EIFS Safe', desc:'We safely clean stucco and synthetic stucco (EIFS) finishes common on San Diego homes without cracking or pitting.' },
      { title:'Kills Algae at the Root', desc:'Our cleaning solutions kill algae, mold, mildew, and lichen at the source — results last months longer than rinsing alone.' },
      { title:'Eco-Friendly Solutions', desc:'All cleaning agents are biodegradable and plant-safe when properly diluted and applied by our trained technicians.' },
    ],
    faqs: [
      { q:'What is the difference between soft washing and pressure washing?', a:'Soft washing uses low water pressure (under 500 PSI) with professional cleaning solutions to break down and remove organic growth safely. Pressure washing uses high-pressure water (1500–4000+ PSI) to physically blast away dirt from hard surfaces. Soft washing is preferred for roofs, stucco, wood, and painted siding.' },
      { q:'Is soft washing safe for tile roofs in San Diego?', a:'Yes. Soft washing is the recommended method for cleaning Spanish tile, concrete tile, and flat roofs in San Diego. High-pressure washing can crack tiles and disturb protective coatings. Our low-pressure technique cleans without risk of damage.' },
      { q:'How long do soft washing results last?', a:'Soft washing results typically last 1–3 years, significantly longer than simple rinse cleaning. Our cleaning solutions kill organic growth at the biological level, delaying regrowth compared to water-only cleaning.' },
      { q:'Can soft washing remove black streaks from my roof?', a:'Yes. Black streaks on roofs are caused by Gloeocapsa magma, a type of algae. Soft washing with the appropriate biocide solution effectively removes these streaks and treats the surface to slow regrowth.' },
      { q:'Do you soft wash vinyl siding in San Diego?', a:'Yes. Soft washing is ideal for vinyl siding, painted wood siding, T1-11, and most exterior cladding materials. We adjust solution concentration and pressure to the specific material and degree of soiling.' },
    ],
  },
  {
    slug: 'holiday-light-installation-san-diego.html',
    title: 'Holiday Light Installation San Diego | Design & Install | SeaBreeze',
    desc: 'Professional holiday light installation and removal in San Diego County. Full design, installation, takedown, and storage service. Fully insured. Book your holiday lighting today.',
    h1: 'Holiday Light Installation in San Diego, CA',
    h1Marked: 'Holiday Light Installation in <span class="accent">San Diego, CA</span>',
    intro: 'Professional holiday lighting design, installation, and removal for homes and businesses throughout San Diego County. SeaBreeze handles everything — from design to takedown — so you can enjoy stunning holiday lights without the ladder work.',
    heroBg: 'images/holiday-light-installation-san-diego-home.jpg',
    ogImg: 'images/holiday-light-installation-san-diego-home.jpg',
    aboutH2: 'Professional Holiday Lighting for San Diego Homes',
    aboutP: 'SeaBreeze Home Service provides full-service holiday lighting for San Diego homeowners — from initial design consultation through installation, takedown, and storage. We work with commercial-grade LED lighting that\'s brighter, safer, and more energy-efficient than store-bought lights. Every installation is done safely by insured technicians — no ladder risks for you.',
    benefits: [
      { title:'Full-Service: Design to Takedown', desc:'We design your display, install before the holidays, and remove everything cleanly when the season ends.' },
      { title:'Professional LED Lighting', desc:'Commercial-grade LED bulbs that are brighter, last longer, and use less electricity than retail lighting.' },
      { title:'Safe & Insured Installation', desc:'All work performed by insured technicians using proper safety equipment — no liability for you.' },
      { title:'Rooflines, Trees & More', desc:'We install on rooflines, gutters, trees, bushes, and landscaping features for a complete holiday look.' },
    ],
    faqs: [
      { q:'When should I book holiday light installation in San Diego?', a:'We recommend booking by early November for best availability. San Diego\'s holiday lighting season is competitive and prime installation dates (late November through early December) fill up quickly.' },
      { q:'Do you take down and store holiday lights?', a:'Yes. SeaBreeze provides full takedown and storage service after the holiday season. We carefully remove, package, and store lights for reuse the following year.' },
      { q:'What types of holiday lighting do you install?', a:'We install roofline lights, icicle lights, net lights for bushes and shrubs, tree lighting, pathway lighting, and custom display lighting for San Diego homes and businesses.' },
      { q:'Is holiday light installation safe for my roofline?', a:'Yes. Our technicians use proper safety equipment and installation hardware that is safe for all roofline and gutter types. We do not use staples or fasteners that damage surfaces.' },
      { q:'Do you offer permanent holiday lighting in San Diego?', a:'Yes. In addition to seasonal holiday lighting, SeaBreeze installs permanent Govee architectural LED lighting that stays on your roofline year-round and can be programmed from your phone for any occasion.' },
    ],
  },
  {
    slug: 'permanent-lighting-san-diego.html',
    title: 'Permanent LED Lighting San Diego | Govee Installation | SeaBreeze',
    desc: 'Professional permanent Govee LED roofline lighting installation in San Diego County. Year-round architectural lighting controlled from your phone. Fully insured. Get a free estimate.',
    h1: 'Permanent Lighting Installation in San Diego, CA',
    h1Marked: 'Permanent Lighting in <span class="accent">San Diego, CA</span>',
    intro: 'Permanent architectural LED lighting installed under your roofline — controlled from your phone for any holiday, event, or season. SeaBreeze provides professional Govee permanent lighting installation throughout San Diego County.',
    heroBg: 'images/permanent-lighting-san-diego-2.jpg',
    ogImg: 'images/permanent-lighting-san-diego-2.jpg',
    aboutH2: 'Govee Permanent Lighting for San Diego Homes',
    aboutP: 'Permanent LED roofline lighting is the ultimate home upgrade for San Diego homeowners who love holiday lighting but are tired of climbing ladders every year. SeaBreeze installs professional-grade Govee permanent lighting systems that mount discreetly under your eaves year-round. With millions of color combinations, you can set any color, pattern, or holiday theme from your smartphone.',
    benefits: [
      { title:'Year-Round Curb Appeal', desc:'One installation — every holiday, season, and occasion covered. Change colors instantly from your phone.' },
      { title:'App-Controlled Color & Effects', desc:'Millions of color combinations, dynamic lighting effects, and holiday presets at your fingertips with the Govee app.' },
      { title:'Discreet Low-Profile Mount', desc:'Lights mount cleanly under your eaves and are barely visible during the day — beautiful without being obtrusive.' },
      { title:'Never Install Lights Again', desc:'No more holiday ladder work. SeaBreeze installs once and you enjoy it every season without any effort.' },
    ],
    faqs: [
      { q:'What is permanent roofline lighting?', a:'Permanent roofline lighting is a low-profile LED light system mounted under your home\'s eaves that stays in place year-round. You control colors, brightness, and lighting effects from a smartphone app — perfect for every holiday, sports season, or personal occasion.' },
      { q:'What brand of permanent lighting do you install?', a:'SeaBreeze installs Govee permanent lighting, one of the leading smart home LED systems. Govee lighting is known for bright, vivid color accuracy, reliable app control, and weatherproof durability for outdoor installation.' },
      { q:'How is permanent lighting installed on a San Diego home?', a:'We mount LED track sections under your eaves with weatherproof hardware. Wiring is routed cleanly and connected to a weatherproof control box. Installation typically takes 2–4 hours for a standard single-story home.' },
      { q:'Is permanent lighting weatherproof?', a:'Yes. Govee permanent lighting is rated for outdoor use and withstands San Diego weather conditions including coastal moisture, heat, and wind. The system is designed for year-round outdoor installation.' },
      { q:'How does permanent lighting compare to seasonal holiday lights?', a:'Permanent lighting eliminates the cost and effort of installing and removing seasonal lights every year. One installation provides lighting for every holiday and occasion — Christmas, Halloween, Fourth of July, sports teams, birthdays — controlled instantly from your phone.' },
    ],
  },
];

// ─── LOCATION DATA ────────────────────────────────────────────────────────────

const LOCATIONS = [
  {
    slug:'la-jolla.html', city:'La Jolla',
    title:'Window Cleaning & Home Services in La Jolla | SeaBreeze Home Service San Diego',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and pressure washing in La Jolla, CA. SeaBreeze Home Service — fully insured, family owned. Free estimates.',
    intro:'SeaBreeze Home Service provides premium exterior home maintenance for La Jolla homeowners. From ocean-view window cleaning to solar panel care, we help La Jolla properties maintain their pristine appearance.',
    about:'La Jolla\'s coastal location means homes face salt air, sea spray, and coastal winds that quickly dirty windows and exterior surfaces. SeaBreeze specializes in maintaining La Jolla\'s distinctive coastal homes — from the cliffs above Children\'s Pool to the hillside estates in La Jolla Farms. Our purified water systems prevent mineral buildup common in coastal areas.',
    faqs:[
      {q:'Do you offer window cleaning in La Jolla?',a:'Yes. SeaBreeze Home Service provides professional window cleaning throughout La Jolla, including oceanfront properties, hillside estates, and La Jolla Village condos and businesses.'},
      {q:'How does salt air affect windows in La Jolla?',a:'Salt air deposits leave a hazy mineral film on glass that ordinary cleaning doesn\'t remove well. Our purified water window cleaning system is specifically effective at removing salt and mineral buildup common on La Jolla coastal properties.'},
      {q:'Do you clean solar panels in La Jolla?',a:'Yes. We provide professional solar panel cleaning for La Jolla residential and commercial properties. Coastal dust and salt film reduce solar efficiency — regular cleaning restores full energy output.'},
    ],
  },
  {
    slug:'coronado.html', city:'Coronado',
    title:'Window Cleaning & Home Services in Coronado | SeaBreeze Home Service',
    desc:'Professional window cleaning, pressure washing, and exterior home services in Coronado, CA. SeaBreeze Home Service — trusted by Coronado homeowners. Free estimates.',
    intro:'SeaBreeze provides professional exterior home maintenance for Coronado\'s distinctive homes and waterfront properties. Fully insured, family owned, and experienced with Coronado\'s unique coastal environment.',
    about:'Coronado\'s island setting means every home faces the same coastal challenge — salt air that coats windows, gutters, and exterior surfaces year-round. SeaBreeze Home Service regularly services Coronado properties, from the iconic Victorian homes near Orange Avenue to waterfront residences on the Strand. Our salt-specific cleaning approach keeps Coronado homes looking sharp.',
    faqs:[
      {q:'Do you service Coronado for window cleaning?',a:'Yes. SeaBreeze regularly services Coronado homes and businesses for window cleaning, gutter cleaning, pressure washing, and holiday lighting. We cross the bridge — Coronado is a regular service area for our team.'},
      {q:'What exterior services do you offer in Coronado?',a:'In Coronado we offer window cleaning, solar panel cleaning, gutter cleaning, pressure washing, soft washing, holiday light installation, and permanent Govee LED lighting.'},
      {q:'How do I get a quote for home services in Coronado?',a:'Call us or use our online quote request. We provide free estimates for all exterior home maintenance services in Coronado, CA.'},
    ],
  },
  {
    slug:'del-mar.html', city:'Del Mar',
    title:'Window Cleaning & Home Services in Del Mar | SeaBreeze Home Service San Diego',
    desc:'Professional window cleaning, solar panel cleaning, and exterior home services in Del Mar, CA. SeaBreeze Home Service — trusted by Del Mar homeowners. Free estimates.',
    intro:'SeaBreeze Home Service provides premium exterior home maintenance for Del Mar\'s coastal homes and estates. From Torrey Pines to the Del Mar racetrack area, we keep Del Mar properties spotless.',
    about:'Del Mar\'s mix of beachfront homes, canyon estates, and hillside properties all benefit from regular exterior maintenance. Salt air from the beach and valley winds deposit dirt and grime on windows and surfaces quickly. SeaBreeze serves Del Mar homeowners with professional window cleaning, solar panel care, and pressure washing to protect property values in one of San Diego\'s most desirable communities.',
    faqs:[
      {q:'Do you offer window cleaning in Del Mar?',a:'Yes. SeaBreeze provides professional window cleaning in Del Mar for residential properties, including beachfront homes, hillside estates, and the Shores area. We service both interior and exterior windows.'},
      {q:'Do you clean solar panels in Del Mar?',a:'Yes. Solar panel cleaning is one of our most requested services in Del Mar. Coastal dust and pollen build up on panels and reduce energy output — we restore efficiency with our purified water system.'},
      {q:'How do I schedule pressure washing in Del Mar?',a:'Call us for a free estimate. We schedule pressure washing jobs throughout Del Mar and the surrounding San Diego coastline communities.'},
    ],
  },
  {
    slug:'encinitas.html', city:'Encinitas',
    title:'Window Cleaning & Home Services in Encinitas | SeaBreeze Home Service',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and pressure washing in Encinitas, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Encinitas homeowners with professional window cleaning, solar panel cleaning, gutter cleaning, and holiday lighting — from Old Encinitas to Leucadia and Cardiff-by-the-Sea.',
    about:'Encinitas is one of SeaBreeze\'s most active service areas. The city\'s mix of beach cottages, newer developments in New Encinitas, and older Leucadia homes all benefit from regular exterior maintenance. Encinitas solar adoption rates are among the highest in San Diego County — keeping panels clean is essential for maximizing your solar ROI in this sun-rich community.',
    faqs:[
      {q:'Do you offer home services in all Encinitas neighborhoods?',a:'Yes. SeaBreeze services all Encinitas neighborhoods including Old Encinitas, Leucadia, Cardiff-by-the-Sea, New Encinitas, and Olivenhain. We also serve the North County communities of Solana Beach and San Marcos nearby.'},
      {q:'Do you install holiday lights in Encinitas?',a:'Yes. Holiday light installation in Encinitas is one of our seasonal services. We design, install, and remove holiday lighting for homes and businesses throughout Encinitas and surrounding North County San Diego.'},
      {q:'How do I get a window cleaning quote in Encinitas?',a:'Call us or submit a quote request online. We provide free estimates for all exterior home services in Encinitas, CA.'},
    ],
  },
  {
    slug:'rancho-santa-fe.html', city:'Rancho Santa Fe',
    title:'Window Cleaning & Home Services in Rancho Santa Fe | SeaBreeze Home Service',
    desc:'Premium window cleaning, solar panel cleaning, and exterior home services in Rancho Santa Fe, CA. SeaBreeze Home Service — trusted by Rancho Santa Fe homeowners. Free estimates.',
    intro:'SeaBreeze provides premium exterior home maintenance for Rancho Santa Fe\'s distinguished estates and residential properties. Professional service tailored to the high standards of Rancho Santa Fe homeowners.',
    about:'Rancho Santa Fe\'s large estates and distinctive Spanish Colonial architecture demand a high level of exterior maintenance. SeaBreeze provides premium window cleaning, solar panel care, and soft washing services that meet the quality expectations of Rancho Santa Fe homeowners. Our attention to detail, professionalism, and careful approach to premium properties make us a trusted choice in this exclusive community.',
    faqs:[
      {q:'Do you service large estates in Rancho Santa Fe?',a:'Yes. SeaBreeze regularly services large estate properties in Rancho Santa Fe, including multi-story homes with extensive window systems and solar installations. We are experienced with the scale and quality requirements of Rancho Santa Fe properties.'},
      {q:'What exterior services do you provide in Rancho Santa Fe?',a:'We offer window cleaning, solar panel cleaning, gutter cleaning, soft washing, pressure washing, holiday lighting, and permanent LED lighting for Rancho Santa Fe homes and estates.'},
      {q:'How do I get a quote for home services in Rancho Santa Fe?',a:'Call us for a personalized estimate. We visit large Rancho Santa Fe properties in person to provide accurate, comprehensive quotes for exterior home maintenance services.'},
    ],
  },
  {
    slug:'carlsbad.html', city:'Carlsbad',
    title:'Window Cleaning & Home Services in Carlsbad | SeaBreeze Home Service San Diego',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and exterior home services in Carlsbad, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Carlsbad homeowners with professional exterior home maintenance including window cleaning, solar panel care, gutter cleaning, and holiday lighting throughout the Carlsbad Village, La Costa, and Aviara neighborhoods.',
    about:'Carlsbad is one of North San Diego County\'s fastest-growing communities, with many newer homes featuring solar installations, large window systems, and well-landscaped properties. SeaBreeze services Carlsbad extensively — from Carlsbad Village near the beach to the master-planned communities of La Costa, Aviara, and Bressi Ranch.',
    faqs:[
      {q:'Do you offer window cleaning in Carlsbad?',a:'Yes. SeaBreeze provides professional window cleaning in all Carlsbad neighborhoods including Carlsbad Village, La Costa, Aviara, Bressi Ranch, and Calavera Hills.'},
      {q:'Do you clean solar panels in Carlsbad?',a:'Yes. Solar panel cleaning is in high demand in Carlsbad where solar adoption rates are high. We service all Carlsbad zip codes (92008, 92009, 92010, 92011) for residential solar panel cleaning.'},
      {q:'Do you install permanent LED lighting in Carlsbad?',a:'Yes. Permanent Govee LED roofline lighting installation is available throughout Carlsbad. This is a popular upgrade for Carlsbad homeowners who want year-round holiday and accent lighting without the annual ladder work.'},
    ],
  },
  {
    slug:'san-marcos.html', city:'San Marcos',
    title:'Window Cleaning & Home Services in San Marcos | SeaBreeze Home Service',
    desc:'Professional window cleaning, solar panel cleaning, pressure washing, and gutter cleaning in San Marcos, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze provides professional exterior home maintenance for San Marcos homeowners including window cleaning, solar panel care, pressure washing, and gutter cleaning throughout the city.',
    about:'San Marcos is a growing inland North County community with many newer developments and a high rate of solar installation. Inland homes face different maintenance challenges than coastal properties — more dust accumulation from prevailing winds, and greater temperature variation that affects exterior surfaces. SeaBreeze serves San Marcos and neighboring communities including San Elijo Hills and Twin Oaks.',
    faqs:[
      {q:'Do you service San Marcos for window cleaning?',a:'Yes. SeaBreeze serves all San Marcos neighborhoods for window cleaning, including San Elijo Hills, Twin Oaks, the Discovery Lake area, and communities near Cal State San Marcos.'},
      {q:'Is solar panel cleaning necessary in San Marcos?',a:'Yes — inland communities like San Marcos accumulate more dust and pollen than coastal areas, which can significantly reduce solar panel output. We recommend cleaning every 6 months for San Marcos solar installations.'},
      {q:'Do you offer pressure washing in San Marcos?',a:'Yes. We provide driveway, patio, fence, and exterior wall pressure washing throughout San Marcos. Get a free estimate by calling or submitting a request online.'},
    ],
  },
  {
    slug:'escondido.html', city:'Escondido',
    title:'Window Cleaning & Home Services in Escondido | SeaBreeze Home Service',
    desc:'Professional window cleaning, solar panel cleaning, pressure washing, and gutter cleaning in Escondido, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze provides professional exterior home maintenance for Escondido homeowners. From window cleaning to solar panel care and pressure washing, we serve all Escondido neighborhoods.',
    about:'Escondido is one of San Diego County\'s larger inland cities, with a diverse mix of older homes, newer developments, and rural-residential properties in the surrounding foothills. Inland dust and seasonal winds make window and solar panel cleaning especially important for Escondido homeowners. SeaBreeze regularly services Escondido and nearby communities including Hidden Meadows, Harmony Grove, and Valley Center.',
    faqs:[
      {q:'Do you offer window cleaning in Escondido?',a:'Yes. SeaBreeze services all Escondido neighborhoods for window cleaning, from homes near Downtown Escondido to the foothills communities of Hidden Meadows and Harmony Grove.'},
      {q:'How often should I clean solar panels in Escondido?',a:'Escondido\'s inland location means more dust accumulation than coastal areas. We recommend solar panel cleaning every 6 months for Escondido properties, especially after Santa Ana wind events.'},
      {q:'Do you offer pressure washing in Escondido?',a:'Yes. Driveway cleaning, patio washing, and fence cleaning are all available in Escondido. Call for a free estimate.'},
    ],
  },
  {
    slug:'chula-vista.html', city:'Chula Vista',
    title:'Window Cleaning & Home Services in Chula Vista | SeaBreeze Home Service',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and pressure washing in Chula Vista, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze provides professional exterior home maintenance for Chula Vista homeowners, including window cleaning, solar panel care, gutter cleaning, and pressure washing throughout the city.',
    about:'Chula Vista is San Diego County\'s second-largest city with a rapidly growing housing market including Otay Ranch, one of the region\'s largest master-planned communities. SeaBreeze services Chula Vista extensively — from South Bay neighborhoods near the bay to the newer developments of Eastlake and Otay Ranch. Many Chula Vista homes feature solar installations and large window systems that benefit from regular professional maintenance.',
    faqs:[
      {q:'Do you offer window cleaning in Chula Vista?',a:'Yes. SeaBreeze provides professional window cleaning throughout Chula Vista including Otay Ranch, Eastlake, Bonita, and all South Bay neighborhoods.'},
      {q:'Do you clean solar panels in Chula Vista?',a:'Yes. Solar panel cleaning is a popular service in Chula Vista where many newer homes in Eastlake and Otay Ranch feature solar installations. We restore panel efficiency with our purified water system.'},
      {q:'How do I schedule a free estimate in Chula Vista?',a:'Call us or submit a quote request online. We provide same-day estimates for all exterior home services in Chula Vista, CA.'},
    ],
  },
  {
    slug:'poway.html', city:'Poway',
    title:'Window Cleaning & Home Services in Poway | SeaBreeze Home Service San Diego',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and pressure washing in Poway, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Poway homeowners with professional exterior home maintenance — window cleaning, solar panel care, gutter cleaning, pressure washing, and holiday lighting for Poway\'s distinctive hillside and suburban properties.',
    about:'Poway — "The City in the Country" — features a mix of suburban homes, ranch properties, and hillside estates surrounded by natural open space. Inland dust, oak leaf debris, and seasonal weather make exterior maintenance important for Poway homeowners. SeaBreeze regularly services Poway and neighboring communities including South Poway, Twin Peaks, and Rancho Bernardo.',
    faqs:[
      {q:'Do you offer window cleaning in Poway?',a:'Yes. SeaBreeze provides professional window cleaning throughout Poway for single-family homes, townhomes, and commercial properties.'},
      {q:'Do you clean solar panels in Poway?',a:'Yes. Poway\'s inland location means significant dust and pollen buildup on solar panels. We recommend professional solar panel cleaning every 6–12 months for Poway properties to maintain peak energy output.'},
      {q:'Do you install holiday lights in Poway?',a:'Yes. Holiday light installation and permanent LED roofline lighting are both available in Poway. We design, install, and remove holiday lighting for Poway homes each season.'},
    ],
  },
  {
    slug:'solana-beach.html', city:'Solana Beach',
    title:'Window Cleaning & Home Services in Solana Beach | SeaBreeze Home Service',
    desc:'Professional window cleaning, solar panel cleaning, and exterior home services in Solana Beach, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Solana Beach homeowners with professional exterior maintenance — window cleaning, solar panel care, gutter cleaning, and more. Located right on the coast, Solana Beach properties need regular upkeep to combat salt air.',
    about:'Solana Beach sits between Del Mar and Encinitas on the North County coast, with a mix of beachfront homes, bluff-top properties, and charming neighborhood streets. Salt air is a constant challenge for Solana Beach homeowners — it deposits mineral haze on windows and solar panels quickly. SeaBreeze specializes in coastal property maintenance, using purified water systems to leave glass streak-free and extend the life of exterior surfaces.',
    faqs:[
      {q:'Do you offer window cleaning in Solana Beach?',a:'Yes. SeaBreeze provides professional window cleaning for Solana Beach residential and commercial properties, including beachfront and bluff-top homes.'},
      {q:'How does salt air affect my windows in Solana Beach?',a:'Salt deposits from the ocean form a hazy mineral film on glass. Our purified water window cleaning system removes this buildup effectively without leaving residue.'},
      {q:'Do you clean solar panels in Solana Beach?',a:'Yes. Coastal dust and salt film reduce solar efficiency. We restore panel performance with professional cleaning for all Solana Beach residential properties.'},
    ],
  },
  {
    slug:'el-cajon.html', city:'El Cajon',
    title:'Window Cleaning & Home Services in El Cajon | SeaBreeze Home Service',
    desc:'Professional window cleaning, pressure washing, solar panel cleaning, and gutter cleaning in El Cajon, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze provides professional exterior home maintenance for El Cajon homeowners — window cleaning, pressure washing, solar panel care, and gutter cleaning throughout the city.',
    about:'El Cajon is one of San Diego\'s larger inland communities, with a mix of single-family homes, older neighborhoods, and newer developments in the East County. Inland heat, Santa Ana winds, and seasonal dust make exterior maintenance essential here. SeaBreeze services El Cajon and neighboring East County communities including Bostonia, Rancho San Diego, and Singing Hills.',
    faqs:[
      {q:'Do you offer window cleaning in El Cajon?',a:'Yes. SeaBreeze provides professional window cleaning in all El Cajon neighborhoods for residential and commercial properties.'},
      {q:'Is pressure washing available in El Cajon?',a:'Yes. We offer driveway, patio, fence, and exterior wall pressure washing throughout El Cajon. Call for a free estimate.'},
      {q:'Do you clean solar panels in El Cajon?',a:'Yes. El Cajon\'s hot, dusty inland climate means solar panels accumulate grime quickly. We recommend professional cleaning every 6 months to maintain peak energy output.'},
    ],
  },
  {
    slug:'santee.html', city:'Santee',
    title:'Window Cleaning & Home Services in Santee | SeaBreeze Home Service San Diego',
    desc:'Professional window cleaning, pressure washing, solar panel cleaning, and gutter cleaning in Santee, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Santee homeowners with professional exterior home maintenance including window cleaning, pressure washing, solar panel care, and gutter cleaning throughout the city.',
    about:'Santee is a suburban East County community along the San Diego River valley, known for its family-friendly neighborhoods and outdoor access. The inland climate brings hot summers and dusty Santa Ana winds that accumulate on windows and solar panels. SeaBreeze services Santee and surrounding East County communities to help homeowners maintain clean, protected exteriors year-round.',
    faqs:[
      {q:'Do you offer window cleaning in Santee?',a:'Yes. SeaBreeze provides professional window cleaning for Santee residential and commercial properties, including both interior and exterior cleaning.'},
      {q:'Do you offer pressure washing in Santee?',a:'Yes. We offer comprehensive pressure washing for driveways, patios, fences, and exterior walls throughout Santee. Get a free estimate by calling us.'},
      {q:'How often should I clean my solar panels in Santee?',a:'Santee\'s inland location means more dust and pollen accumulation than coastal areas. We recommend professional solar panel cleaning every 6 months for optimal energy production.'},
    ],
  },
  {
    slug:'oceanside.html', city:'Oceanside',
    title:'Window Cleaning & Home Services in Oceanside | SeaBreeze Home Service',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and pressure washing in Oceanside, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze provides professional exterior home maintenance for Oceanside homeowners from the beachfront to the inland communities — window cleaning, solar panel care, gutter cleaning, and holiday lighting.',
    about:'Oceanside is North San Diego County\'s largest city and a thriving coastal community. From the historic Oceanside Pier area to newer master-planned communities like Rancho del Oro and Fire Mountain, SeaBreeze services the full range of Oceanside properties. Ocean air and sea spray are constant challenges for homes near the coast, while inland Oceanside neighborhoods deal with dust and seasonal pollen.',
    faqs:[
      {q:'Do you offer window cleaning in Oceanside?',a:'Yes. SeaBreeze provides professional window cleaning throughout Oceanside, from beachfront and pier-area properties to inland neighborhoods like Rancho del Oro and Fire Mountain.'},
      {q:'Do you clean solar panels in Oceanside?',a:'Yes. Solar panel cleaning is available throughout Oceanside. Coastal homes near the ocean benefit especially from regular cleaning to remove salt film and restore panel efficiency.'},
      {q:'Do you install holiday lights in Oceanside?',a:'Yes. Holiday light installation and permanent LED roofline lighting are both available in Oceanside. We design, install, and remove seasonal lighting for homes and businesses.'},
    ],
  },
  {
    slug:'vista.html', city:'Vista',
    title:'Window Cleaning & Home Services in Vista | SeaBreeze Home Service San Diego',
    desc:'Professional window cleaning, solar panel cleaning, pressure washing, and gutter cleaning in Vista, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Vista homeowners with professional exterior home maintenance — window cleaning, solar panel care, pressure washing, and gutter cleaning throughout Vista\'s diverse neighborhoods.',
    about:'Vista is a growing North County inland community known for its hillside homes, canyon properties, and a thriving craft brewing scene. The inland climate brings warm temperatures and dusty conditions that make regular exterior maintenance valuable. SeaBreeze services Vista and neighboring communities including Shadowridge, Vista Village, and Buena Creek.',
    faqs:[
      {q:'Do you offer window cleaning in Vista?',a:'Yes. SeaBreeze provides professional window cleaning throughout Vista for residential and commercial properties, including hillside and canyon homes.'},
      {q:'Is pressure washing available in Vista?',a:'Yes. We offer driveway, patio, and exterior surface pressure washing throughout Vista. Contact us for a free estimate.'},
      {q:'Do you clean solar panels in Vista?',a:'Yes. Vista\'s inland location means dust buildup on solar panels is common. We recommend professional cleaning every 6 months to maintain panel efficiency.'},
    ],
  },
  {
    slug:'national-city.html', city:'National City',
    title:'Window Cleaning & Home Services in National City | SeaBreeze Home Service',
    desc:'Professional window cleaning, pressure washing, solar panel cleaning, and gutter cleaning in National City, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze provides professional exterior home maintenance for National City homeowners — window cleaning, pressure washing, solar panel care, and gutter cleaning throughout the city.',
    about:'National City, located just south of downtown San Diego and adjacent to Chula Vista, is one of San Diego County\'s most densely populated communities with a diverse mix of residential properties. SeaBreeze services National City and the broader South Bay area, helping homeowners maintain clean, well-kept exteriors in this urban community.',
    faqs:[
      {q:'Do you offer window cleaning in National City?',a:'Yes. SeaBreeze provides professional window cleaning for National City residential and commercial properties. We service both interior and exterior windows.'},
      {q:'Is pressure washing available in National City?',a:'Yes. We offer pressure washing for driveways, patios, and exterior surfaces throughout National City.'},
      {q:'How do I get a free estimate in National City?',a:'Call us or submit a quote request online. We provide free estimates for all exterior home maintenance services in National City, CA.'},
    ],
  },
  {
    slug:'point-loma.html', city:'Point Loma',
    title:'Window Cleaning & Home Services in Point Loma | SeaBreeze Home Service',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and pressure washing in Point Loma, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Point Loma homeowners with professional exterior maintenance — window cleaning, solar panel care, gutter cleaning, and holiday lighting for Point Loma\'s distinctive peninsula homes.',
    about:'Point Loma\'s dramatic peninsula location gives residents some of San Diego\'s most spectacular views — and some of its most challenging exterior maintenance conditions. Ocean breezes from San Diego Bay and the Pacific deposit salt and mineral film on windows and surfaces constantly. SeaBreeze specializes in maintaining Point Loma\'s coastal homes, from the hillside neighborhoods near Sunset Cliffs to the historic homes of Old Point Loma.',
    faqs:[
      {q:'Do you offer window cleaning in Point Loma?',a:'Yes. SeaBreeze provides professional window cleaning throughout Point Loma, including oceanfront homes, hillside properties near Sunset Cliffs, and homes in Ocean Beach and Loma Portal.'},
      {q:'How does ocean air affect windows in Point Loma?',a:'Point Loma\'s peninsula location exposes every home to salt air from both sides. Salt deposits build up quickly on glass, reducing clarity and potentially etching the surface over time. Regular professional cleaning prevents permanent damage.'},
      {q:'Do you clean solar panels in Point Loma?',a:'Yes. We provide solar panel cleaning for Point Loma residential properties. Salt film from the ocean significantly reduces panel efficiency — regular cleaning is especially important for coastal solar installations.'},
    ],
  },
  {
    slug:'mission-hills.html', city:'Mission Hills',
    title:'Window Cleaning & Home Services in Mission Hills San Diego | SeaBreeze',
    desc:'Professional window cleaning, pressure washing, solar panel cleaning, and gutter cleaning in Mission Hills, San Diego, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Mission Hills homeowners with professional exterior home maintenance — window cleaning, pressure washing, gutter cleaning, and solar panel care for Mission Hills\' historic homes and craftsman bungalows.',
    about:'Mission Hills is one of San Diego\'s most historic neighborhoods, known for its stunning Craftsman bungalows, Spanish Colonial Revival homes, and tree-lined streets above Mission Valley. The neighborhood\'s mature trees mean gutters fill quickly with leaves and debris, and the classic architecture requires careful exterior care. SeaBreeze is experienced with older home exteriors, providing thoughtful cleaning services that protect historic windows, woodwork, and masonry.',
    faqs:[
      {q:'Do you offer window cleaning in Mission Hills?',a:'Yes. SeaBreeze provides professional window cleaning for Mission Hills residential properties, including historic Craftsman bungalows and Spanish Colonial homes.'},
      {q:'Do you clean gutters in Mission Hills?',a:'Yes. Mission Hills\' mature trees mean gutter cleaning is especially important here. We provide thorough gutter cleaning for Mission Hills homes, including gutter flushing and downspout clearing.'},
      {q:'Is pressure washing safe for older homes in Mission Hills?',a:'Yes, when done properly. We use appropriate pressure settings for older masonry, wood, and stucco exteriors common in Mission Hills. Our team is experienced with historic home exteriors.'},
    ],
  },
  {
    slug:'pacific-beach.html', city:'Pacific Beach',
    title:'Window Cleaning & Home Services in Pacific Beach | SeaBreeze Home Service',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and pressure washing in Pacific Beach, San Diego, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Pacific Beach homeowners and businesses with professional exterior maintenance — window cleaning, pressure washing, solar panel care, and holiday lighting for PB\'s vibrant beachside community.',
    about:'Pacific Beach is one of San Diego\'s most popular beachside neighborhoods, with a lively mix of beachfront rentals, family homes, and condos just steps from Mission Bay and the Pacific. Salt air is relentless here — windows, railings, and exterior surfaces need regular professional attention to stay clean and undamaged. SeaBreeze services Pacific Beach and neighboring communities including Mission Beach and Crown Point.',
    faqs:[
      {q:'Do you offer window cleaning in Pacific Beach?',a:'Yes. SeaBreeze provides professional window cleaning for Pacific Beach residential and commercial properties, including beachfront rentals, condos, and single-family homes.'},
      {q:'How often should I clean windows in Pacific Beach?',a:'Pacific Beach\'s beachside location means salt air deposits accumulate quickly — we recommend professional cleaning every 2–3 months for oceanfront properties and every 4–6 months for homes a few blocks from the beach.'},
      {q:'Do you offer pressure washing in Pacific Beach?',a:'Yes. We pressure wash driveways, patios, walkways, and exterior walls throughout Pacific Beach. Call for a free estimate.'},
    ],
  },
  {
    slug:'mission-valley.html', city:'Mission Valley',
    title:'Window Cleaning & Home Services in Mission Valley | SeaBreeze Home Service',
    desc:'Professional window cleaning, pressure washing, solar panel cleaning, and exterior home services in Mission Valley, San Diego, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze provides professional exterior home maintenance for Mission Valley homeowners and condo residents — window cleaning, pressure washing, solar panel care, and gutter cleaning.',
    about:'Mission Valley is San Diego\'s central hub, home to a dense mix of condos, townhomes, and single-family neighborhoods along the San Diego River corridor. Freeway proximity and urban dust make window cleaning especially valuable for Mission Valley residents. SeaBreeze services Mission Valley properties of all types, from high-rise condos near Fashion Valley to townhome communities in Hotel Circle.',
    faqs:[
      {q:'Do you offer window cleaning in Mission Valley?',a:'Yes. SeaBreeze provides professional window cleaning for Mission Valley condos, townhomes, and single-family homes.'},
      {q:'Is pressure washing available in Mission Valley?',a:'Yes. We offer pressure washing for driveways, patios, and exterior surfaces for Mission Valley properties.'},
      {q:'How do I get a free estimate in Mission Valley?',a:'Call us or submit a quote request online. We provide free estimates for all exterior home services in Mission Valley, San Diego.'},
    ],
  },
  {
    slug:'clairemont.html', city:'Clairemont',
    title:'Window Cleaning & Home Services in Clairemont San Diego | SeaBreeze',
    desc:'Professional window cleaning, pressure washing, solar panel cleaning, and gutter cleaning in Clairemont, San Diego, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Clairemont homeowners with professional exterior maintenance — window cleaning, pressure washing, solar panel care, and gutter cleaning for Clairemont\'s established neighborhoods.',
    about:'Clairemont is one of San Diego\'s large, established mid-city neighborhoods with a wide range of single-family homes, many built in the 1950s–1970s. The area\'s canyon-adjacent properties accumulate dust and debris, and many homes are now being updated with solar installations. SeaBreeze services Clairemont and neighboring communities including Linda Vista, Bay Park, and Kearny Mesa.',
    faqs:[
      {q:'Do you offer window cleaning in Clairemont?',a:'Yes. SeaBreeze provides professional window cleaning throughout Clairemont for residential properties of all sizes.'},
      {q:'Do you clean solar panels in Clairemont?',a:'Yes. Many Clairemont homeowners have added solar in recent years. We provide professional solar panel cleaning to keep your system running at peak efficiency.'},
      {q:'Is pressure washing available in Clairemont?',a:'Yes. We offer driveway, patio, and exterior wall pressure washing throughout Clairemont. Call for a free estimate.'},
    ],
  },
  {
    slug:'4s-ranch.html', city:'4S Ranch',
    title:'Window Cleaning & Home Services in 4S Ranch San Diego | SeaBreeze',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and pressure washing in 4S Ranch, San Diego, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves 4S Ranch homeowners with professional exterior home maintenance — window cleaning, solar panel care, gutter cleaning, and holiday lighting for this premier master-planned community.',
    about:'4S Ranch is one of North San Diego County\'s premier master-planned communities, featuring beautiful newer homes with high-end finishes and frequent solar installations. The community\'s inland location in the Rancho Bernardo corridor means dust accumulation is a regular challenge for windows and solar panels. SeaBreeze is a trusted provider for 4S Ranch homeowners who expect professional, detail-oriented service.',
    faqs:[
      {q:'Do you offer window cleaning in 4S Ranch?',a:'Yes. SeaBreeze provides professional window cleaning for 4S Ranch homes, including large window systems and multi-story properties common in newer master-planned developments.'},
      {q:'Do you clean solar panels in 4S Ranch?',a:'Yes. 4S Ranch has a high rate of solar adoption. We provide professional solar panel cleaning to maintain peak energy output for 4S Ranch homeowners.'},
      {q:'Do you install holiday lights in 4S Ranch?',a:'Yes. Holiday light installation and permanent Govee LED roofline lighting are popular services in 4S Ranch. We design, install, and take down seasonal lighting each year.'},
    ],
  },
  {
    slug:'carmel-valley.html', city:'Carmel Valley',
    title:'Window Cleaning & Home Services in Carmel Valley San Diego | SeaBreeze',
    desc:'Professional window cleaning, solar panel cleaning, gutter cleaning, and pressure washing in Carmel Valley, San Diego, CA. SeaBreeze Home Service — fully insured. Free estimates.',
    intro:'SeaBreeze serves Carmel Valley homeowners with professional exterior home maintenance — window cleaning, solar panel care, gutter cleaning, and holiday lighting for this prestigious North City community.',
    about:'Carmel Valley is one of San Diego\'s most desirable planned communities, featuring upscale homes, excellent schools, and a location between coastal Del Mar and inland Rancho Bernardo. Many Carmel Valley homes feature large window systems and solar installations that benefit from regular professional maintenance. SeaBreeze provides premium exterior cleaning services that match the quality standards of Carmel Valley homeowners.',
    faqs:[
      {q:'Do you offer window cleaning in Carmel Valley?',a:'Yes. SeaBreeze provides professional window cleaning throughout Carmel Valley for single-family homes, townhomes, and luxury properties.'},
      {q:'Do you clean solar panels in Carmel Valley?',a:'Yes. Solar panel cleaning is a popular service in Carmel Valley. We use purified water systems to remove dust and pollen without leaving residue, maximizing your solar investment.'},
      {q:'Do you install holiday lights in Carmel Valley?',a:'Yes. Holiday lighting installation and permanent LED roofline lighting are both available in Carmel Valley. Many Carmel Valley homeowners choose our permanent Govee lighting for year-round curb appeal.'},
    ],
  },
];

// ─── GENERATE FILES ───────────────────────────────────────────────────────────

let count = 0;
for (const p of SERVICES) {
  fs.writeFileSync(p.slug, servicePage(p), 'utf8');
  console.log(`✓ ${p.slug}`);
  count++;
}
for (const p of LOCATIONS) {
  fs.writeFileSync(p.slug, locationPage(p), 'utf8');
  console.log(`✓ ${p.slug}`);
  count++;
}
console.log(`\nDone — ${count} pages generated.`);

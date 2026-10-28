// Meta Pixel for SeaBreeze Home Service.
// Loaded on every public page via <script src="/js/meta-pixel.js" async></script> in <head>.
//
// Events sent (no personal information is ever included):
//   PageView        - once per page load
//   ViewContent     - service pages only, with the service name
//   Contact         - first click on a phone or email link per page view
//   QuoteFormClick  - (custom) first click on a link to the hosted Jobber request form per page view
//
// Lead is deliberately NOT sent from the browser. Jobber's embedded form is a cross-origin
// iframe with no submission-success signal, so a browser-side Lead would be a guess.
// Confirmed leads must come from Jobber's side (see docs/META_PIXEL.md).
(function () {
  'use strict';

  var PIXEL_ID = '2366845420799670';

  // Never initialize twice, even if the script ends up on a page more than once.
  if (window.__seabreezePixel) return;
  window.__seabreezePixel = true;

  // Honor the Global Privacy Control opt-out signal: load nothing at all.
  if (navigator.globalPrivacyControl === true) return;

  // Official Meta Pixel base code.
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  // Turn off Meta's automatic button-click events so only the events below are recorded.
  fbq('set', 'autoConfig', false, PIXEL_ID);
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  // Service pages, keyed by URL path without ".html".
  var SERVICES = {
    '/window-cleaning-san-diego': 'Window Cleaning',
    '/solar-panel-cleaning-san-diego': 'Solar Panel Cleaning',
    '/gutter-cleaning-san-diego': 'Gutter Cleaning',
    '/pressure-washing-san-diego': 'Pressure Washing',
    '/soft-washing-san-diego': 'House Soft Washing',
    '/permanent-lighting-san-diego': 'Permanent Lighting',
    '/holiday-light-installation-san-diego': 'Holiday Light Installation',
    '/commercial-cleaning-san-diego': 'Commercial & HOA Cleaning'
  };
  var path = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  if (SERVICES[path]) {
    fbq('track', 'ViewContent', {
      content_name: SERVICES[path],
      content_category: 'Service',
      content_type: 'service'
    });
  }

  // Click tracking. Each kind of action counts once per page view so double-clicks
  // and repeat taps don't inflate results.
  var sent = {};
  function once(key, fn) {
    if (sent[key]) return;
    sent[key] = true;
    fn();
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';

    if (/^tel:/i.test(href)) {
      once('phone', function () { fbq('track', 'Contact', { contact_method: 'phone' }); });
    } else if (/^mailto:/i.test(href)) {
      once('email', function () { fbq('track', 'Contact', { contact_method: 'email' }); });
    } else if (/^https:\/\/clienthub\.getjobber\.com\/hubs\/[^/]+\/public\/requests\//i.test(href)) {
      once('quote', function () { fbq('trackCustom', 'QuoteFormClick'); });
    }
  }, true);
})();

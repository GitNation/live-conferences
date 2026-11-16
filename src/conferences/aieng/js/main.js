/* AI Engineering Amsterdam · landing page
   - "How does your team ship with AI?" fleet: hover/click a ship or a stage to inspect it
   - tickets slider arrows
   - hero video autoplay (respects prefers-reduced-motion) */
'use strict';
(function () {
  var fleet = document.querySelector('.adoption-curve');
  if (fleet) {
    var hulls = [[53,152],[237,370],[432,574],[605,756],[785,997]];
    var lead = fleet.querySelector('.adoption-curve__lead');
    var details = fleet.querySelectorAll('.adoption-curve__detail');
    var btns = fleet.querySelectorAll('.adoption-curve__stage');
    var vessels = fleet.querySelectorAll('[data-vessel]');
    var underline = fleet.querySelector('.adoption-curve__underline');
    var setStage = function (i) {
      lead.classList.toggle('is-active', i < 0);
      details.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
      btns.forEach(function (b, k) {
        b.classList.toggle('is-active', k === i);
        b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
      vessels.forEach(function (v) {
        var n = +v.getAttribute('data-vessel');
        v.setAttribute('class', 'vessel' + (n === i ? ' is-active' : (i >= 0 && n < i ? ' is-progress' : '')));
      });
      underline.setAttribute('d', i >= 3 ? 'M' + hulls[i][0] + ' 401H' + hulls[i][1] : 'M-9999 0H-9998');
    };
    fleet.querySelectorAll('[data-pick]').forEach(function (el) {
      var k = +el.getAttribute('data-pick');
      el.addEventListener('click', function () { setStage(k); });
      el.addEventListener('mouseenter', function () { setStage(k); });
    });
    fleet.querySelectorAll('[data-clear]').forEach(function (el) {
      el.addEventListener('mouseleave', function () { setStage(-1); });
    });
  }
  function scrollTickets(dir) {
    var r = document.querySelector('.prices__list');
    if (r) r.scrollBy({ left: dir * 416, behavior: 'smooth' });
  }
  document.querySelectorAll('[data-tickets]').forEach(function (b) {
    b.addEventListener('click', function () { scrollTickets(b.getAttribute('data-tickets') === 'next' ? 1 : -1); });
  });
  try {
    var vids = document.querySelectorAll('.hero__bg-video');
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i]; v.muted = true;
      if (still) { v.removeAttribute('autoplay'); v.pause(); continue; }
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    }
  } catch (e) {}
})();

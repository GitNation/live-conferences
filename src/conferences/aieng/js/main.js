/* AI Engineering Amsterdam · landing page
   - "How does your team ship with AI?" fleet: hover/click a ship or a stage to inspect it
   - tickets slider arrows
   - hero video autoplay (respects prefers-reduced-motion) */
'use strict';
(function () {
  var fleet = document.querySelector('.adoption-curve');
  if (fleet) {
    var lead = fleet.querySelector('.adoption-curve__lead');
    var details = fleet.querySelectorAll('.adoption-curve__detail');
    var btns = fleet.querySelectorAll('.adoption-curve__stage');
    var vessels = fleet.querySelectorAll('[data-vessel]');
    var underline = fleet.querySelector('.adoption-curve__underline');
    var hits = fleet.querySelectorAll('.adoption-curve__hit');
    var canHover = window.matchMedia('(hover: hover)').matches;
    var track = fleet.querySelector('.adoption-curve__track');
    var setStage = function (i) {
      lead.classList.toggle('is-active', i < 0);
      details.forEach(function (d) { d.classList.toggle('is-active', +d.getAttribute('data-stage') === i); });
      btns.forEach(function (b, k) {
        b.classList.toggle('is-active', k === i);
        b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
      vessels.forEach(function (v) {
        var n = +v.getAttribute('data-vessel');
        v.setAttribute('class', 'vessel' + (n === i ? ' is-active' : (i >= 0 && n < i ? ' is-progress' : '')));
      });
      var hit = hits[i];
      underline.setAttribute('d', hit ? 'M' + hit.x.baseVal.value + ' 401h' + hit.width.baseVal.value : 'M-9999 0H-9998');
    };
    var hoverTimer;
    var hoverStage = function (i) {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () { setStage(i); }, 120);
    };
    fleet.querySelectorAll('[data-pick]').forEach(function (el) {
      var k = +el.getAttribute('data-pick');
      el.addEventListener('click', function () {
        clearTimeout(hoverTimer);
        setStage(k);
        var b = btns[k].getBoundingClientRect(), t = track.getBoundingClientRect();
        track.scrollBy({ left: b.left - t.left - parseFloat(getComputedStyle(track).paddingLeft), behavior: 'smooth' });
      });
      if (canHover) el.addEventListener('mouseenter', function () { hoverStage(k); });
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

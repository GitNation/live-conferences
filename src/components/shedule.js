/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-global-selector */
/* eslint-disable jquery/no-sizzle */

import Swiper from 'swiper';
if ($('.sv-body').length > 0) {
  $('.sv-body').find('.js-navigation-item:first-child').addClass('_active');

  const scheduleSwiperSettings = {
    slidesPerView: 'auto',
    spaceBetween: 16,
    loop: false,
    observer: true,
    observeParents: true,
    watchOverflow: true,
  };
  const scheduleSwiper = new Swiper('.schedule-swiper', {
    ...scheduleSwiperSettings,
  });

  const scheduleSwiper1 = new Swiper('.schedule-swiper1', {
    ...scheduleSwiperSettings,
  });

  const scheduleSwiper2 = new Swiper('.schedule-swiper2', {
    ...scheduleSwiperSettings,
  });


  window.addEventListener('load', function() {
    $('.sv-body__swiper').removeClass('sv-body__swiper--loading');
    $('.sv-time[data-sv-row]').each(function() {
      var attr = $(this).data('sv-row');
      equalheight('[data-sv-row="' + attr + '"]');
    });
  });

  window.addEventListener('resize', function() {
    setTimeout(function() {
      $('.sv-time[data-sv-row]').each(function() {
        var attr = $(this).data('sv-row');
        equalheight('[data-sv-row="' + attr + '"]');
      });
    });
  });

}

function setHeight(el, val) {
  if (typeof val === 'function') val = val();
  if (typeof val === 'string') el.style.height = val;
  else el.style.height = val + 'px';
}

function equalheight(container) {
  let currentTallest = 0,
    rowDivs = new Array();

  Array.from(document.querySelectorAll(container)).forEach((el, i) => {
    el.style.height = 'auto';

    rowDivs.push(el);
    currentTallest =
      currentTallest < parseFloat(getComputedStyle(el, null).height.replace('px', ''))
        ? parseFloat(getComputedStyle(el, null).height.replace('px', ''))
        : currentTallest;

    for (i = 0; i < rowDivs.length; i++) {
      setHeight(rowDivs[i], currentTallest);
    }
  });
};





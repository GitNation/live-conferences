/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-global-selector */
/* eslint-disable jquery/no-sizzle */

import Swiper from 'swiper';
if ($('.sv-bodyV3').length > 0) {
  $('.sv-bodyV3').find('.js-navigation-item:first-child').addClass('_active');

  const scheduleSwiperSettingsV3 = {
    slidesPerView: 'auto',
    spaceBetween: 0,
    loop: false,

    freeMode: true,
    scrollbar: {
      el: '.swiper-scrollbar',
      draggable: true,
    },
    observer: true,
    watchOverflow: true,
  };
  const scheduleSwiperV3 = new Swiper('.schedule-swiperV3', {
    ...scheduleSwiperSettingsV3,
  });

 
  window.addEventListener('load', function() {
    $('.sv-bodyV3__swiper').removeClass('sv-bodyV3__swiper--loading');
    $('.sv-timeV3[data-sv-rowv3]').each(function() {
      var attr = $(this).data('sv-rowv3');
      equalWidthV3('[data-sv-rowv3="' + attr + '"]');
    });

    $('.sv-trackV3[data-sv-trackv3]').each(function() {
      var attr = $(this).data('sv-trackv3');
      equalHeightV3('[data-sv-trackv3="' + attr + '"]');
    });
  });

  window.addEventListener('resize', function() {
    setTimeout(function() {
      $('.sv-timeV3[data-sv-rowv3]').each(function() {
        var attr = $(this).data('sv-rowv3');
        equalWidthV3('[data-sv-rowv3="' + attr + '"]');
      });
      $('.sv-trackV3[data-sv-trackv3]').each(function() {
        var attr = $(this).data('sv-trackv3');
        equalHeightV3('[data-sv-trackv3="' + attr + '"]');
      });
    });
  });
}

function setWidthV3(el, val) {
  if (typeof val === 'function') val = val();
  if (typeof val === 'string') el.style.width = val;
  else el.style.width = val + 'px';
}

function equalWidthV3(container) {
  let currentTallest = 0,
    currentRowStart = 0,
    rowDivs = new Array(),
    $el;

  Array.from(document.querySelectorAll(container)).forEach((el, i) => {
    el.style.width = 'auto';

    rowDivs.push(el);
    currentTallest =
      currentTallest < parseFloat(getComputedStyle(el, null).width.replace('px', ''))
        ? parseFloat(getComputedStyle(el, null).width.replace('px', ''))
        : currentTallest;

    for (i = 0; i < rowDivs.length; i++) {
      setWidthV3(rowDivs[i], currentTallest);
    }
  });
}

function setHeightV3(el, val) {
  if (typeof val === 'function') val = val();
  if (typeof val === 'string') el.style.height = val;
  else el.style.height = val + 'px';
}

function equalHeightV3(container) {
  let currentTallest = 0,
    currentRowStart = 0,
    rowDivs = new Array(),
    $el;

  Array.from(document.querySelectorAll(container)).forEach((el, i) => {
    el.style.height = 'auto';

    rowDivs.push(el);
    currentTallest =
      currentTallest < parseFloat(getComputedStyle(el, null).height.replace('px', ''))
        ? parseFloat(getComputedStyle(el, null).height.replace('px', ''))
        : currentTallest;

    for (i = 0; i < rowDivs.length; i++) {
      setHeightV3(rowDivs[i], currentTallest);
    }
  });
}

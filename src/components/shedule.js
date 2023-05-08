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

  function scheduleChange(activeIndex) {
    $('.sv-body.is-active').find('.js-navigation-item').removeClass('_active');
    $('.sv-body.is-active').find('.js-navigation-item').eq(activeIndex).addClass('_active');
  }
  const scheduleSwiperSettings = {
    slidesPerView: 'auto',
    spaceBetween: 0,
    loop: false,
    mousewheel: {
      releaseOnEdges: true,
    },
    scrollbar: {
      el: '.swiper-scrollbar',
      draggable: true,
    },
    freeMode: true,
    observer: true,
    observeParents: true,
    watchOverflow: true,
    edgeSwipeThreshold: 40,
  };
  const scheduleSwiper = new Swiper('.schedule-swiper', {
    ...scheduleSwiperSettings,
  });


  $('.js-navigation-item').on('mouseenter', function() {
    $(this).closest('.swiper-slide').find('.sv-time').addClass('_selected');
  });

  $('.js-navigation-item').on('mouseleave', function() {
    $(this).closest('.swiper-slide').find('.sv-time').removeClass('_selected');
  });

  window.addEventListener('load', function() {
    $('.sv-body__swiper').removeClass('sv-body__swiper--loading');
    $('.sv-time[data-sv-row]').each(function() {
      var attr = $(this).data('sv-row');
      equalWidth('[data-sv-row="' + attr + '"]');
    });

    $('.sv-track[data-sv-track]').each(function() {
      var attr = $(this).data('sv-track');
      equalHeight('[data-sv-track="' + attr + '"]');
    });
  });

  window.addEventListener('resize', function() {
    setTimeout(function() {
      $('.sv-time[data-sv-row]').each(function() {
        var attr = $(this).data('sv-row');
        equalWidth('[data-sv-row="' + attr + '"]');
      });
      $('.sv-track[data-sv-track]').each(function() {
        var attr = $(this).data('sv-track');
        equalHeight('[data-sv-track="' + attr + '"]');
      });
    });
  });
}

function setWidth(el, val) {
  if (typeof val === 'function') val = val();
  if (typeof val === 'string') el.style.width = val;
  else el.style.width = val + 'px';
}

function equalWidth(container) {
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
      setWidth(rowDivs[i], currentTallest);
    }
  });
}


function setHeight(el, val) {
  if (typeof val === 'function') val = val();
  if (typeof val === 'string') el.style.height = val;
  else el.style.height = val + 'px';
}

function equalHeight(container) {
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
      setHeight(rowDivs[i], currentTallest);
    }
  });
}

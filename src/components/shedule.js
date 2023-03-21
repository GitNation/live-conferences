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
    spaceBetween: 10,
    loop: false,
    observer: true,
    observeParents: true,
    watchOverflow: true,
    edgeSwipeThreshold: 40,
  };
  const scheduleSwiper = new Swiper('.schedule-swiper', {
    ...scheduleSwiperSettings,
    on: {
      slideChange: function() {
        var activeIndex = this.activeIndex;
        scheduleChange( activeIndex);
      },
    },
  });

  const scheduleSwiper1 = new Swiper('.schedule-swiper1', {
    ...scheduleSwiperSettings,
    on: {
      slideChange: function() {
        var activeIndex = this.activeIndex;
        scheduleChange( activeIndex);
      },
    },
  });

  const scheduleSwiper2 = new Swiper('.schedule-swiper2', {
    ...scheduleSwiperSettings,
    on: {
      slideChange: function() {
        var activeIndex = this.activeIndex;
        scheduleChange(activeIndex);
      },
    },
  });

  $('.js-navigation-item').on('click', function() {
    $(this).closest('.sv-body').find('.js-navigation-item').not($(this)).removeClass('_active');
    $(this).addClass('_active');
    let pgItemIndex = $(this).index();
    let dataTab = $(this).closest('.sv-body').data('tab');

    if (dataTab === 1) {
      scheduleSwiper1.slideTo(pgItemIndex, 300, false);
    } else if (dataTab === 2) {
      scheduleSwiper2.slideTo(pgItemIndex, 300, false);
    } else {
      scheduleSwiper.slideTo(pgItemIndex, 300, false);
    }
  });

  $('.js-navigation-item').on('mouseenter', function() {
    let pgItemIndex = $(this).index() + 1;
    $('.sv-time--col-' + pgItemIndex + '').addClass('_selected');
  });

  $('.js-navigation-item').on('mouseleave', function() {
    let pgItemIndex = $(this).index() + 1;
    $('.sv-time--col-' + pgItemIndex + '').removeClass('_selected');
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
};



  

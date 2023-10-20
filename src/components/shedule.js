/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-global-selector */
/* eslint-disable jquery/no-sizzle */
/* eslint-disable jquery/no-animate */

import Swiper from 'swiper';
if ($('.sv-body').length > 0) {
  const scheduleSwiperSettings = {
    slidesPerView: 'auto',
    spaceBetween: 16,
    threshold: 12,
    loop: false,
    observer: true,
    observeParents: true,
    watchOverflow: true,
  };

  if ($('.schedule-swiper').length > 0) {
    new Swiper('.schedule-swiper', {
      ...scheduleSwiperSettings,
    });
  }
  if ($('.schedule-swiper1').length > 0) {
    new Swiper('.schedule-swiper1', {
      ...scheduleSwiperSettings,
    });
  }
  if ($('.schedule-swiper2').length > 0) {
    new Swiper('.schedule-swiper2', {
      ...scheduleSwiperSettings,
    });
  }

  function svRowHeight() {
    $('.sv-time[data-sv-row]').each(function() {
      var attr = $(this).data('sv-row');
      equalheight('[data-sv-row="' + attr + '"]');
    });
    $('.sv-body__swiper').removeClass('sv-body__swiper--loading');
  }

  function svOffsetTop(target) {
    const header = $('.header');
    $('body, html').animate({ scrollTop: header.position().top === 0 ? target.offset().top - header.innerHeight() : target.offset().top });
    console.log(target.offset().top);
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
  }

  $('.js-tab-link').on('click', function() {
    svRowHeight();
    svOffsetTop($('.sv-wrapper'));
  });

  $('.js-sv-filter').on('click', function(e) {
    e.preventDefault();
    $('.js-sv-filter').removeClass('is-active');
    $(this).toggleClass('is-active');
    if ($('#sv-filter-short').hasClass('is-active')) {
      $('.js-tabs-container').addClass('short-v');
    } else {
      $('.js-tabs-container').removeClass('short-v');
    }
    svRowHeight();
    svOffsetTop($('.sv-wrapper'));
  });

  $(window).on('load', function() {
    svRowHeight();
  });

  $(window).on('resize', function() {
    if (window.innerWidth >= 768) {
      svRowHeight();
    }
  });
}

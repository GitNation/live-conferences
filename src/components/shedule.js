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
  $('.sv-body').find('.js-navigation-item:first-child').addClass('_active');

  const scheduleSwiperSettings = {
    slidesPerView: 'auto',
    spaceBetween: 16,
    threshold: 12,
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

  function svRowHeight() {
    $('.sv-time[data-sv-row]').each(function() {
      var attr = $(this).data('sv-row');
      equalheight('[data-sv-row="' + attr + '"]');
    });
    $('.sv-body__swiper').removeClass('sv-body__swiper--loading');
  }

  function svOffsetTop(target) {
    const header = $('.header');
    const tabsHeight = $('.sv-tabs').innerHeight();
    const OFFSET_NUMBER = 0;
    $('body, html').animate({ 'scrollTop': header.position().top === 0 ? target.offset().top - header.innerHeight() : target.offset().top });
    console.log(target.offset().top );
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

  $('.js-tab-link').on('click', function() {
    svRowHeight();
    svOffsetTop($('.sv-wrapper'));
  });

  $('.js-short-list').on('click', function(e) {
    e.preventDefault();
    $(this).toggleClass('is-active');
    $('.js-tabs-container').toggleClass('short-v');
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





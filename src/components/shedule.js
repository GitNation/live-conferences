/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-global-selector */
/* eslint-disable jquery/no-sizzle */
/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-animate */
/* eslint-disable jquery/no-parent */
/* eslint-disable jquery/no-is */

import { CLASSES } from './_classes';
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

  function svRowheight() {
    $('.sv-time[data-sv-row]').each(function() {
      var attr = $(this).data('sv-row');
      equalheight('[data-sv-row="' + attr + '"]');
    });

    $('.sv-body__swiper').removeClass('sv-body__swiper--loading');
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

  window.addEventListener('load', function() {
    svRowheight();
  });

  $('.js-tab-link').on('click', function() {
    svRowheight();
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
      svRowheight();
    }
  });


  // schedule v3
  const stickyNavSettings = {
    loop: false,
    slidesPerView: 'auto',
    spaceBetween: 0,
    speed: 200,
    freeMode: true,
    watchOverflow: true,
    observer: true,
    observeParents: true,
  };
  if ($('.js-sticky-nav').length > 0) {

    var filterSwiper = new Swiper('.js-sticky-nav ', {
      ...stickyNavSettings
    });
  }

  if ($('.js-sticky-nav2').length > 0) {
    var filterSwiper2 = new Swiper('.js-sticky-nav2 ', {
      ...stickyNavSettings
    });
  }

  let animateSchedule = true;
  const header = $('.header');
  const svTabs = $('.sv-tabs');
  const svFilter = $('#sv-filter');
  const jsSectionNav = $('.js-section-nav');
  const jsSectionNav2 = $('.js-section-nav2');
  const navToggleLink = $('.js-sv-toggle-link');

  navToggleLink.on('click', function() {
    if ($(this).hasClass('is-active')) {
      return;
    }

    $(this).addClass('is-active');
    navToggleLink.not($(this)).removeClass('is-active');

    const dataId = $(this).data('sv-toggle-id');
    $('[data-sv-toggle]').removeClass('is-active');
    $(`[data-sv-toggle="${dataId}"]`).addClass('is-active');

    svRowheight();
    $('.sv-body').find('.sv-filter .swiper-slide').find('.js-schedule-scroll-link').removeClass('is-active');
    $('.sv-body').find('.sv-filter .swiper-slide').eq(0).find('.js-schedule-scroll-link').addClass('is-active');
    $('body,html').animate({ scrollTop: getSchedulePosition() - 1 }, 300);
  });

  function getSchedulePosition() {
    const svTopPanel = svTabs.innerHeight() + svFilter.innerHeight();
    return header.position().top === 0 ? header.innerHeight() + svTopPanel : svTopPanel;
  }

  function sectionNav(item, menu, swiperSlider) {
    var $sections = item;
    $sections.each(function(i, el) {
      var top = $(el).offset().top - getSchedulePosition();
      var scroll = $(document).scrollTop() + 70;
      var id = $(el).attr('id');

      if (scroll > top) {
        $(`${menu} a.${CLASSES.active}`).removeClass(CLASSES.active);

        if (animateSchedule) {
          $(`${menu} a[href="#` + id + '"]').addClass(CLASSES.active);

          var thisBlockIndex = $(`${menu} .swiper-slide a[href="#` + id + '"]')
            .parent()
            .index();
          swiperSlider.slideTo(thisBlockIndex);
        } else {
          setTimeout(() => {
            animateSchedule = true;
          }, 240);
        }
      }
    });
  }


  $('.js-schedule-scroll-link').on('click', function(event) {
    event.preventDefault();
    var target = $(this).attr('href'),
      bl_top = $(target).offset().top;
    animateSchedule = false;
    $('body,html').animate({ scrollTop: bl_top - getSchedulePosition() }, 300);
    return false;
  });


  $(window).on('scroll load', function() {
    sectionNav(jsSectionNav, '.js-sticky-nav', filterSwiper);
    if ($('.js-sticky-nav2').length > 0) {
      sectionNav(jsSectionNav2, '.js-sticky-nav2', filterSwiper2);
    }
    getSchedulePosition();
  });

  $(window).on('resize', function() {
    getSchedulePosition();
  });
}



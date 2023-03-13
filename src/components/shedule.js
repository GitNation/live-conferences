/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-closest */
import Swiper from 'swiper';
if ($('.sv-body').length > 0) {
  $('.sv-body').find('.js-navigation-item:first-child').addClass('_active');

  function scheduleChange(tabIndex, activeIndex) {
    $('[data-tab=' + tabIndex + ']')
      .find('.js-navigation-item')
      .removeClass('_active');
    $('[data-tab=' + tabIndex + ']')
      .find('.js-navigation-item')
      .eq(activeIndex)
      .addClass('_active');
  }
  const scheduleSwiperSettings = {
    slidesPerView: 1,
    spaceBetween: 16,
    autoHeight: true,
    loop: false,
    initialSlide: 0,
    observer: true,
    observeParents: true,
    watchOverflow: true,
  };
  const scheduleSwiper = new Swiper('.schedule-swiper', {
    ...scheduleSwiperSettings,
    on: {
      slideChange: function() {
        var activeIndex = this.activeIndex;
        scheduleChange(0, activeIndex);
        
      },
    },
  });

  const scheduleSwiper1 = new Swiper('.schedule-swiper1', {
    ...scheduleSwiperSettings,
    on: {
      slideChange: function() {
        var activeIndex = this.activeIndex;
        scheduleChange(1, activeIndex);
      },
    },
  });

  const scheduleSwiper2 = new Swiper('.schedule-swiper2', {
    ...scheduleSwiperSettings,
    on: {
      slideChange: function() {
        var activeIndex = this.activeIndex;
        scheduleChange(2, activeIndex);
      },
    },
  });

  $('.js-navigation-item').on('click', function() {
    $(this).closest('.sv-body').find('.js-navigation-item').not($(this)).removeClass('_active');
    $(this).addClass('_active');
    let pgItemIndex = $(this).index();
    let dataTab = $(this).closest('.sv-body').data('tab');

    
    if (dataTab === 1) {
      scheduleSwiper1.slideTo(pgItemIndex, 0, false);
    } else if (dataTab === 2) {
      scheduleSwiper2.slideTo(pgItemIndex, 0, false);
    } else {
      scheduleSwiper.slideTo(pgItemIndex, 0, false);
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
}

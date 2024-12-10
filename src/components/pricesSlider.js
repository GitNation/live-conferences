/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-html */
/* eslint-disable jquery/no-attr */
import Swiper from 'swiper';
import { CLASSES } from './_classes';
export default function slider() {
  return new Swiper('.prices-slider', {
    slidesPerView: 'auto',
    spaceBetween: 0,
    loop: false,
    speed: 500,
    initialSlide: 0,
    watchOverflow: true,
    centerInsufficientSlides: true,
    threshold: 12,
    navigation: {
      nextEl: '.prices-slider-next',
      prevEl: '.prices-slider-prev',
    },
    breakpoints: {
      599: {
        slidesPerView: 2,
      },
      767: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 3,
      },
    },
  });
}

let pricesSwiper = new Swiper('.prices-swiper .swiper-container', {
  slidesPerView: 'auto',
  spaceBetween: 24,
  loop: false,
  speed: 500,
  initialSlide: 0,
  watchOverflow: true,
  observer: true,
  observeParents: true,
  centerInsufficientSlides: true,
  threshold: 12,
  navigation: {
    nextEl: '.prices-swiper__next',
    prevEl: '.prices-swiper__prev',
  },
  pagination: {
    el: '.prices-swiper__pagination',
  },
  breakpoints: {
    100: {
      spaceBetween: 12,
    },
    600: {
      spaceBetween: 24,
    },
  },
});

export function priceFilter() {
  const sortBtn = $('.js-prices-sort-btn');
  const activeBtn = $('.js-prices-sort-btn.' + CLASSES.active);

  const updateActiveButtonText = (button) => {
    const buttonLink = button.data('prices-filter-link');
    console.log(buttonLink);
    $('.s-prices__button a').attr('href', buttonLink);
  };

  if (activeBtn.length) {
    updateActiveButtonText(activeBtn);
  }

  sortBtn.on('click', function() {
    const category = $(this).data('prices-filter-btn');
    sortBtn.not($(this)).removeClass(CLASSES.active);
    $(this).addClass(CLASSES.active);

    $('[data-prices-filter]').not('[data-prices-filter=""]').addClass('hidden');
    $('[data-prices-filter="' + category + '"]').removeClass('hidden');

    updateActiveButtonText($(this));

    pricesSwiper.updateSlides();
    pricesSwiper.slideTo(0, 0, false);
  });

  $('.js-prices-toggle').on('click', function() {
    $(this).closest('.prices-item').find('.js-prices-description').toggleClass(CLASSES.active);
  });

  $('.js-prices-content').each(function() {
    const showItems = $(this).data('show-items');
    if ($(this).find('li').length > showItems) {
      $(this).closest('.prices-item').addClass('prices-item--short');
    }
  });
}

import Swiper from 'swiper';

export default function sliderDates() {
  const sliderEl = document.querySelector('.conference-dates__swiper.js-slider-auto');
  if (!sliderEl) return;

  const spaceBetween = parseInt(sliderEl.dataset.spaceBetween, 10) || 20;

  new Swiper(sliderEl, {
    slidesPerView: 'auto',
    spaceBetween,
    loop: false,
    threshold: 12,
    watchOverflow: true,
    centerInsufficientSlides: false,
    initialSlide: 0,
    pagination: {
      clickable: true,
      el: '.swiper-auto-pagination',
    },
    navigation: {
      nextEl: '.swiper-auto-button-next',
      prevEl: '.swiper-auto-button-prev',
    },
    on: {
      init(swiper) {
        swiper.slideTo(0, 0, false);
      },
    },
  });
}

import Swiper from 'swiper';

export default function sliderProgram() {
  const sliderEl = document.querySelector('.program.js-slider-auto');
  if (!sliderEl) return;

  const spaceBetween = parseInt(sliderEl.dataset.spaceBetween, 10) || 48;

  new Swiper(sliderEl, {
    slidesPerView: 2,
    slidesPerGroup: 1,
    spaceBetween,
    loop: false,
    speed: 500,
    threshold: 12,
    watchOverflow: true,
    centerInsufficientSlides: true,
    mousewheel: {
      forceToAxis: true,
      sensitivity: 0.6,
      thresholdDelta: 120,
      thresholdTime: 200,
    },
    navigation: {
      nextEl: '.swiper-auto-button-next',
      prevEl: '.swiper-auto-button-prev',
    },
    pagination: {
      clickable: true,
      el: '.swiper-auto-pagination',
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween,
      },
    },
  });
}

import Swiper from 'swiper';
export default function slider() {
  return new Swiper('.js-slider', {
    speed: 600,
    loop: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    spaceBetween: 0,
    navigation: {
      nextEl: '.js-slider-next',
      prevEl: '.js-slider-prev',
    },
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.js-slider-pagination',
      type: 'bullets',
    },
  });
}

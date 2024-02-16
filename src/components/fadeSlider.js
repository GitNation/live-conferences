import Swiper from 'swiper';
export default function slider() {
  return new Swiper('.fade-slider', {
    spaceBetween: 30,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    loop: false,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
  });
}

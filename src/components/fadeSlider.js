import Swiper from 'swiper';
export default function slider() {
  return new Swiper('.fade-slider', {
    spaceBetween: 30,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    autoHeight: true,
    loop: false,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.fade-slider-next',
      prevEl: '.fade-slider-prev',
    },
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
  });
}

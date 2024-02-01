import Swiper from 'swiper';
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

import Swiper from 'swiper';
export default function slider() {
  return new Swiper('.prices-slider', {
    slidesPerView: 'auto',
    spaceBetween: 0,
    loop: false,
    speed: 500,
    centeredSlides: true,
    initialSlide: 0,
    watchOverflow: true,
    navigation: {
      nextEl: '.prices-slider-next',
      prevEl: '.prices-slider-prev',
    },
    breakpoints: {
      599: {
        centeredSlides: true,
        slidesPerView: 2,
      },
      767: {
        centeredSlides: false,
        slidesPerView: 3,
      },
      1200: {
        centeredSlides: false,
        slidesPerView: 3,
      }
    }
  });
}

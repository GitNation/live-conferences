import Swiper from 'swiper';
export default function slider() {
  return new Swiper('.prices-slider', {
    slidesPerView: 'auto',
    spaceBetween: 10,
    loop: false,
    speed: 500,
    centeredSlides: true,
    initialSlide: 1,
    watchOverflow: true,
    navigation: {
      nextEl: '.prices-slider-next',
      prevEl: '.prices-slider-prev',
    },
    breakpoints: {
      599: {
        centeredSlides: true,
        slidesPerView: 2,
        spaceBetween: 20
      },
      767: {
        initialSlide: 0,
        centeredSlides: false,
        slidesPerView: 3,
        spaceBetween: 30
      },
      1200: {
        initialSlide: 0,
        centeredSlides: false,
        slidesPerView: 3,
        spaceBetween: 50
      }
    }
  });
}

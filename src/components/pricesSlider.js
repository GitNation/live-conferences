import Swiper from 'swiper';
export default function slider() {
  return new Swiper('.prices-slider', {
    slidesPerView: 'auto',
    spaceBetween: 10,
    loop: false,
    speed: 500,
    centeredSlides: true,
    navigation: {
      nextEl: '.prices-slider-next',
      prevEl: '.prices-slider-prev',
    },
    breakpoints: {
      599: {
        centeredSlides: false,
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1200: {
        centeredSlides: false,
        slidesPerView: 3,
        spaceBetween: 60,
      }
    }
  });
}

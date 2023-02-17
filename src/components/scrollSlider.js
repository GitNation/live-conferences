import Swiper from 'swiper';
export default function slider() {
  return new Swiper('.scroll-slider', {
    slidesPerView: 'auto',
    spaceBetween: 0,
    loop: false,
    speed: 500,
    centeredSlides: true,
    initialSlide: 0,
    watchOverflow: true,
    scrollbar: {
      el: '.scroll-slider-scrollbar',
    },
    navigation: {
      nextEl: '.scroll-slider-next',
      prevEl: '.scroll-slider-prev',
    },
    breakpoints: {
      599: {
        centeredSlides: true,
        slidesPerView: 2,
      },
      767: {
        initialSlide: 0,
        centeredSlides: false,
        slidesPerView: 3,
      },
      1200: {
        initialSlide: 0,
        centeredSlides: false,
        slidesPerView: 3,
      }
    }
  });
}

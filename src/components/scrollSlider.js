import Swiper from 'swiper';
export default function slider() {
  return new Swiper('.scroll-slider', {
    slidesPerView: 'auto',
    spaceBetween: 0,
    centerInsufficientSlides: true,
    loop: false,
    speed: 500,
    initialSlide: 0,
    threshold: 12,
    watchOverflow: true,
    scrollbar: {
      el: '.scroll-slider-scrollbar',
    },
    navigation: {
      nextEl: '.scroll-slider-next',
      prevEl: '.scroll-slider-prev',
    },
  });
}

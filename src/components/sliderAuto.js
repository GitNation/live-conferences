import Swiper from 'swiper';
export default function sliderAuto() {
  const sliderAuto = document.querySelector('.js-slider-auto');
  if (sliderAuto) {
    new Swiper(sliderAuto, {
      slidesPerView: 'auto',
      spaceBetween: 20,
      loop: false,
      threshold: 12,
      watchOverflow: true,
    });
  }
}

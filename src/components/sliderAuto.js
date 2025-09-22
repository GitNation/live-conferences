import Swiper from 'swiper';
export default function sliderAuto() {
  const sliderAuto = document.querySelector('.js-slider-auto');
  if (sliderAuto) {
    const spaceBetween = parseInt(sliderAuto.dataset.spaceBetween, 10) || 20;

    new Swiper(sliderAuto, {
      slidesPerView: 'auto',
      spaceBetween,
      loop: false,
      threshold: 12,
      watchOverflow: true,
      centerInsufficientSlides: true,
      navigation: {
        nextEl: '.swiper-auto-button-next',
        prevEl: '.swiper-auto-button-prev',
      },
      pagination: {
        clickable: true,
        el: '.swiper-auto-pagination',
      },
    });
  }
}

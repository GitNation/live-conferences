import Swiper from 'swiper';
export default function sliderAuto() {
  const sliderAuto = document.querySelector('.js-slider-auto');
  if (sliderAuto) {
    const userConfig = JSON.parse(sliderAuto.dataset.config || '{}');

    new Swiper(sliderAuto, {
      slidesPerView: 'auto',
      spaceBetween: 20,
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
      breakpoints: {
        0: {
          spaceBetween: 16,
        },
        768: {
          spaceBetween: 20,
        },
      },
      ...userConfig,
    });
  }
}

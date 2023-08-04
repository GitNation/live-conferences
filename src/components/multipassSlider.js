import Swiper from 'swiper';
export default function slider() {
  return new Swiper('.multipass-slider', {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    speed: 1500,
    navigation: {
      nextEl: '.multipass-slider-next',
      prevEl: '.multipass-slider-prev',
    },
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },

    breakpoints: {
      100: {
        slidesPerView: 1.6,
      },
      481: {
        slidesPerView: 2,
      },
      600: {
        slidesPerView: 3,
      },
      768: {
        slidesPerView: 1.5,
      },
      820: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 3,
      },
    },
  });
}

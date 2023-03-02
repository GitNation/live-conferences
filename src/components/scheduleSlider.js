import Swiper from 'swiper';
export default function scheduleSlider() {
  return new Swiper('.schedule-swiper', {
    slidesPerView: 'auto',
    spaceBetween: 0,
    autoHeight: true,
    loop: false,
    initialSlide: 0,
    watchOverflow: true,
    breakpoints: {
      100: {
        slidesPerView: 1,
      },
      1025: {
        slidesPerView: 'auto',
      },
    },
  });
}

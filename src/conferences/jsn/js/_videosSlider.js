import Swiper from 'swiper';

export default function videosSlider() {
  var galleryThumbs = new Swiper('.js-video-thumbs', {
    spaceBetween: 10,
    slidesPerView: 'auto',
    freeMode: true,
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
  });

  new Swiper('.js-video-slider', {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 80,
    grabCursor: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    thumbs: {
      swiper: galleryThumbs,
    },
    breakpoints: {
      640: {
        spaceBetween: 30,
      },
      768: {
        spaceBetween: 50,
      },
      1024: {
        spaceBetween: 80,
      },
    },
  });
}

import Swiper from 'swiper';
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-sizzle */
/* eslint-disable jquery/no-animate */

function titoButtonFixed(scroll) {
  //   let headerHeight = 0;
  //   let scrollTop = $(scroll).scrollTop();
  //   if ($('.header').not($('._not-tito')).length > 0) {
  //     headerHeight = $('.header').outerHeight();
  //   }
  //   $('.tito-submit').css({ bottom: headerHeight + 20 + 'px' });
  //   let titoBlockOffsetTop = $('.tito-block:visible').offset().top;
  //   let titoBlockHeight = $('.tito-block:visible').outerHeight();
  //   if (scrollTop >= titoBlockOffsetTop + titoBlockHeight - window.innerHeight + headerHeight + 18) {
  //     $('.tito-block:visible').addClass('_offset');
  //   } else {
  //     $('.tito-block:visible').removeClass('_offset');
  //   }
  // }
  // if ($('.tito-block').length > 0) {
  //   $(window).on('load scroll resize', function() {
  //     titoButtonFixed(this);
  //   });
  //   $('.js-tab-link').on('click', function() {
  //     titoButtonFixed(window);
  //   });
  //   tito('on:widget:loaded', function() {
  //     titoButtonFixed(window);
  //     const sectionAnchor = $(window.location.hash);
  //     if (window.location.hash && sectionAnchor.length > 0) {
  //       $('body,html').animate({ scrollTop: sectionAnchor.offset().top - 20 }, 400);
  //     }
  //   });
}
tito('on:widget:loaded', function() {
  const sliderContainer = document.querySelector('.tito-widget-form > div');

  if (sliderContainer) {
    // Добавляем класс swiper-container к .tito-widget-form > div
    sliderContainer.classList.add('swiper-container');

    // Создаем обертку для слайдов
    const wrapper = document.createElement('div');
    wrapper.classList.add('swiper-wrapper');

    // Переносим всех детей, кроме .tito-form-actions, в wrapper
    Array.from(sliderContainer.children).forEach((child) => {
      if (!child.classList.contains('tito-form-actions')) {
        child.classList.add('swiper-slide');
        wrapper.appendChild(child);
      }
    });

    // Вставляем .swiper-wrapper в контейнер перед .tito-form-actions (если есть)
    sliderContainer.prepend(wrapper);

    // Инициализируем Swiper
    new Swiper(sliderContainer, {
      slidesPerView: 3,
      spaceBetween: 0,
      loop: false,
      speed: 500,
      initialSlide: 0,
      watchOverflow: true,
      centerInsufficientSlides: true,
      threshold: 12,
      observeParents: true,
    });

    console.log('Swiper initialized');
  } else {
    console.log('Swiper: контейнер не найден');
  }
});

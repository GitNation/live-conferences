/* eslint-disable no-unused-vars */
import Swiper from 'swiper';
import { CLASSES } from './_classes';

let pricesSwiper = new Swiper('.prices-swiper .swiper-container', {
  slidesPerView: 'auto',
  spaceBetween: 24,
  loop: false,
  speed: 500,
  initialSlide: 0,
  watchOverflow: true,
  observer: true,
  observeParents: true,
  centerInsufficientSlides: true,
  threshold: 12,
  navigation: {
    nextEl: '.prices-swiper__next',
    prevEl: '.prices-swiper__prev',
  },
  pagination: {
    el: '.prices-swiper__pagination',
  },
  breakpoints: {
    100: {
      spaceBetween: 12,
    },
    600: {
      spaceBetween: 24,
    },
  },
});

export function priceFilter() {
  const sortBtns = document.querySelectorAll('.js-prices-sort-btn');
  const activeBtn = document.querySelector('.js-prices-sort-btn.' + CLASSES.active);

  const updateActiveButtonText = (button) => {
    const buttonLink = button.dataset.pricesFilterLink;
    document.querySelectorAll('.s-prices__button a:not(.js-direct-link)').forEach((a) => {
      a.setAttribute('href', buttonLink);
    });
  };

  if (activeBtn) {
    updateActiveButtonText(activeBtn);
  }

  sortBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.pricesFilterBtn;

      sortBtns.forEach((b) => b.classList.remove(CLASSES.active));
      btn.classList.add(CLASSES.active);

      document.querySelectorAll('[data-prices-filter]').forEach((el) => {
        if (el.dataset.pricesFilter !== '') {
          el.classList.add('hidden');
        }
      });

      document.querySelectorAll(`[data-prices-filter="${category}"]`).forEach((el) => {
        el.classList.remove('hidden');
      });

      updateActiveButtonText(btn);

      pricesSwiper.updateSlides();
      pricesSwiper.slideTo(0, 0, false);
    });
  });

  // Toggle description
  document.querySelectorAll('.js-prices-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const pricesItem = toggle.closest('.prices-item');
      const description = pricesItem.querySelector('.js-prices-description');
      if (description) {
        description.classList.toggle(CLASSES.active);
      }
    });
  });

  // Short prices items
  document.querySelectorAll('.js-prices-content').forEach((content) => {
    const showItems = parseInt(content.dataset.showItems, 10);
    if (content.querySelectorAll('li').length > showItems) {
      const pricesItem = content.closest('.prices-item');
      if (pricesItem) pricesItem.classList.add('prices-item--short');
    }
  });
}

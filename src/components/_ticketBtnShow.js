import { CLASSES } from './_classes';

const updateButtonVisibility = () => {
  const windowHeight = window.innerHeight;
  const hero = document.querySelector('#hero');
  const button = document.querySelector('.js-header-btn-sticky');

  if (!hero || !button) return;

  const heroRect = hero.getBoundingClientRect().bottom;
  const screenMiddle = windowHeight / 2;

  if (heroRect <= screenMiddle) {
    button.classList.add(CLASSES.visible);
  } else {
    button.classList.remove(CLASSES.visible);
  }
};

window.addEventListener('scroll', updateButtonVisibility);
window.addEventListener('load', updateButtonVisibility);

const burger = document.querySelector('.js-burger');
const body = document.body;
const menu = document.querySelector('.js-menu');
const content = document.querySelector('.js-main');
const header = document.querySelector('.js-header');
const scrollLinks = document.querySelectorAll('.js-scroll-link');
const button = document.querySelector('.js-header-btn');
const wind = window;

function hiddenMenu() {
  burger.classList.remove('is-active');
  header.classList.remove('is-open');
  menu.classList.remove('is-open');
  content.classList.remove('blur');
  body.classList.remove('is-no-scroll');
}

if (burger) {
  burger.addEventListener('click', function() {
    this.classList.toggle('is-active');
    menu.classList.toggle('is-open');
    content.classList.toggle('blur');
    header.classList.toggle('is-open');
    body.classList.toggle('is-no-scroll');

    if (menu.classList.contains('is-open')) {
      const onClickOutside = function() {
        hiddenMenu();
        content.removeEventListener('click', onClickOutside);
      };
      content.addEventListener('click', onClickOutside);
    }
  });
}

if (button) {
  button.addEventListener('click', hiddenMenu);
}

scrollLinks.forEach((link) => {
  link.addEventListener('click', () => {
    hiddenMenu();
    if (window._gauges) {
      window._gauges.push(['track']);
    }
  });
});

window.addEventListener('resize', () => {
  if (!menu) return;
  if (menu.classList.contains('is-open') && window.innerWidth > 1023) {
    hiddenMenu();
  }
});

function checkStickyHeader() {
  const winTop = window.scrollY || window.pageYOffset;
  if (winTop >= 1) {
    header.classList.add('is-sticky');
  } else {
    header.classList.remove('is-sticky');
  }
}

window.addEventListener('scroll', checkStickyHeader);
window.addEventListener('load', checkStickyHeader);

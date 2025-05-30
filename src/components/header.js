/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-animate */
/* eslint-disable jquery/no-class */
const burger = $('.js-burger');
const body = $('body');
const menu = $('.js-menu');
const content = $('.js-main');
const header = $('.js-header');
const scrollLink = $('.js-scroll-link');
const button = $('.js-header-btn');
const wind = $(window);

burger.on('click', function() {
  $(this).toggleClass('is-active');
  menu.toggleClass('is-open');
  content.toggleClass('blur');
  header.toggleClass('is-open');
  body.toggleClass('is-no-scroll');

  if (menu.hasClass('is-open')) {
    content.on('click', function() {
      hiddenMenu();
    });
  }
});

button.on('click', function() {
  hiddenMenu();
});

function hiddenMenu() {
  burger.removeClass('is-active');
  header.removeClass('is-open');
  menu.removeClass('is-open');
  content.removeClass('blur');
  body.removeClass('is-no-scroll');
}

scrollLink.on('click', function() {
  hiddenMenu();
  window._gauges && window._gauges.push(['track']);
});

wind.resize(() => {
  if (menu.hasClass('is-open') && wind.innerWidth() > 1023) {
    hiddenMenu();
  }
});

wind.on('scroll load', function() {
  let winTop = $(window).scrollTop();
  if (winTop >= 1) {
    header.addClass('is-sticky');
  } else {
    header.removeClass('is-sticky');
  }
});

/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-animate */
/* eslint-disable jquery/no-class */
const burger = $('.js-burger');
const menu = $('.js-menu');
const content = $('.js-main');
const scrollLink = $('.js-scroll-link');
const wind = $(window);

burger.on('click', function() {
  $(this).toggleClass('is-active');
  menu.toggleClass('is-open');
  content.toggleClass('blur');
});

scrollLink.on('click', function() {
  burger.removeClass('is-active');
  menu.removeClass('is-open');
  content.removeClass('blur');
  window._gauges && window._gauges.push(['track']);
});

wind.resize(() => {
  if (menu.hasClass('is-open') && wind.width() > 1023) {
    burger.removeClass('is-active');
    menu.removeClass('is-open');
    content.removeClass('blur');
  }
});

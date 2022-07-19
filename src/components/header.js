/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-animate */
/* eslint-disable jquery/no-class */
const burger = $('.js-burger');
const menu = $('.js-menu');
const content = $('.js-main');
const header = $('.js-header');
const scrollLink = $('.js-scroll-link');
const wind = $(window);

burger.on('click', function() {
  $(this).toggleClass('is-active');
  menu.toggleClass('is-open');
  content.toggleClass('blur');
  header.toggleClass('is-open');
});

scrollLink.on('click', function() {
  burger.removeClass('is-active');
  header.removeClass('is-open');
  menu.toggleClass('is-open');
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

wind.scroll(() => {
  let winTop = $(window).scrollTop();
  if(winTop >= 1) {
    header.addClass('is-sticky');
  }else{
    header.removeClass('is-sticky');
  }
});

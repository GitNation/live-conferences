/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-animate */
/* eslint-disable jquery/no-class */

$(window).scroll(function() { 
  var scrollY = $(document).scrollTop();
  var windowHeight = $(window).innerHeight();
  var heroHeight = $('.hero').innerHeight();
  var button = $('.header__alt-btn');
  
  if (heroHeight >= windowHeight + scrollY && $(button).hasClass('visible')) {
    $(button).removeClass('visible');
  }
  else if (heroHeight < windowHeight + scrollY && !$(button).hasClass('visible')) {
    $(button).addClass('visible');
  }
});
  

/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-sizzle */

function titoButtonFixed(scroll) {
  let headerHeight = 0;
  let scrollTop = $(scroll).scrollTop();
  if ($('.header').not($('._not-tito')).length > 0) {
    headerHeight = $('.header').outerHeight();
  }
  $('.tito-submit').css({ bottom: headerHeight + 20 + 'px' });

  let titoBlockOffsetTop = $('.tito-block:visible').offset().top;
  let titoBlockHeight = $('.tito-block:visible').outerHeight();

  if (scrollTop >= titoBlockOffsetTop + titoBlockHeight - window.innerHeight + headerHeight + 18) {
    $('.tito-block:visible').addClass('_offset');
  } else {
    $('.tito-block:visible').removeClass('_offset');
  }
}
// tito widjet / fixed button
if ($('.tito-block').length > 0) {
  tito('on:widget:loaded', function() {
    titoButtonFixed('body');

    $(window).on(' scroll resize', function() {
      titoButtonFixed(this);
    });
  });
}
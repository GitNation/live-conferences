/* eslint-disable jquery/no-slide */
/* eslint-disable jquery/no-parent */
/* eslint-disable jquery/no-class */
/*---------------------------------------------------*/
// FAQ
$('.faq__question').click(function() {
  $(this).parent('.faq__item').toggleClass('open');
  $(this).siblings('.faq__ansver').slideToggle();
});

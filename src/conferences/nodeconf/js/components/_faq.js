/*---------------------------------------------------*/
// FAQ
$('.faq__question').click(function() {
  $(this).parent('.faq__item').toggleClass('open');
  $(this).siblings('.faq__ansver').slideToggle();
});

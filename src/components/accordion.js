/* eslint-disable jquery/no-slide */
/* eslint-disable jquery/no-parent */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-find */
/*---------------------------------------------------*/
// accordion
$('.js-accordion-toggler').click(function() {
  let item = $(this).closest('.js-accordion-item');
  item.toggleClass('open');
  item.find('.js-accordion-spoiler').slideToggle();
});



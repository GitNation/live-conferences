/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-removeClass */
/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-each */

$('._s-day').on('click', function() {
  $('._s-day').not($(this)).removeClass('_active');
  $(this).addClass('_active');
  if ($(this).attr('id') === 's-day-2') {
    $('.sv-body').addClass('sv-body--scroll');
  } else {
    $('.sv-body').removeClass('sv-body--scroll');
  }
});

$('[data-equal-id]').each(function() {
  var column = 0;
  let thisEqual = $(this).data('equal-id');

  $('[data-equal-id=' + thisEqual + ']').each(function() {
    h = $(this).height();
    if (h > column) {
      column = h;
    }
  });
  $(this).height(column);
});

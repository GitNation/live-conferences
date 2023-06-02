/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-global-selector */
/* eslint-disable jquery/no-sizzle */

if ($('.sv-body').length > 0) {
  $('.sv-body').find('.js-navigation-item:first-child').addClass('_active');
}

export const svTimeZome = () => {
  $('.sv-body.is-active .sv-time[data-sv-row]').each(function() {
    var svRow = $(this).data('sv-row');

    var svRowHeight = $('.sv-body.is-active .sv-time[data-sv-row=' + svRow + ']').innerHeight();

    $('.sv-zone__wrap[data-sv-row=' + svRow + ']').css({ height: svRowHeight });
  });
};

svTimeZome();

$(window).on('resize load', function() {
  svTimeZome();
});





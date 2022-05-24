/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-parents */
/* eslint-disable jquery/no-data */

const container = $('.js-fleet-container');
const close = $('.js-fleet-close');
const active = $('.js-fleet-active');
const item = $('.js-fleet-item');
const popup = $('.js-fleet-popup');

if (container) {
  item.on('click', function() {
    if ($(this).siblings(popup).hasClass('is-active')) {
      popup.removeClass('is-active');
    } else {
      popup.removeClass('is-active');
      $(this).siblings(popup).toggleClass('is-active');
    }
  });

  close.on('click', function() {
    popup.removeClass('is-active');
  });
}

/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-hide */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-class */

const close = $('.js-local-close');
const panel = $('.js-local-block');

close.on('click', function() {
  $(this).closest(panel).addClass('hide');
  const localStorageName = $(this).closest(panel).data('local-name');
  localStorage.setItem(localStorageName, true);
});

$('[data-local-name]').each(function() {
  const localName = $(this).data('local-name');
  if (localStorage[localName] !== 'true') {
    $(this).removeClass('hide');
  }
});

console.log(localStorage);
// if (localStorage.popupSubscriptionIsHidden !== 'true') {
//   if (form.length) {
//     form[0].addEventListener('submit', () => {
//       container.removeClass('visible');
//       localStorage.setItem('popupSubscriptionIsHidden', true);
//     });
//   }
// }

export default function popupSubscription() {
  const container = $('.js-subscription-container');
  const close = $('.js-subscription-close');
  const form = $('.js-subscription-form');
  const showOnYOffset = document.body.scrollHeight / 7;

  $(window).on('scroll', function() {
    var scrollY = $(document).scrollTop();
    // console.log('showOnYOffset ' + showOnYOffset);

    if (showOnYOffset < scrollY && !container.hasClass('visible') && localStorage.popupSubscriptionIsHidden !== 'true') {
      container.addClass('visible');
      // console.log('show');
    }
  });

  close.on('click', function() {
    container.addClass('closed');
    localStorage.setItem('popupSubscriptionIsHidden', true);
  });

  if (localStorage.popupSubscriptionIsHidden !== 'true') {
    if (form.length) {
      form[0].addEventListener('submit', () => {
        container.removeClass('visible');
        localStorage.setItem('popupSubscriptionIsHidden', true);
      });
    }
  }
}

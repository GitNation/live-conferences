export default function popupSubscription() {
  const container = $('.js-subscription-container');
  const close = $('.js-subscription-close');
  const form = $('.js-subscription-form');
  const showOnYOffset = document.body.scrollHeight / 5;

  $(window).scroll(function() { 
    var scrollY = $(document).scrollTop();
    // console.log('showOnYOffset ' + showOnYOffset);

    if (showOnYOffset < scrollY && !container.hasClass('visible') && localStorage.popupSubscriptionIsHidden !== 'true') {
      container.addClass('visible');
      // console.log('show');
    }
  });

  if (localStorage.popupSubscriptionIsHidden !== 'true') {
    if (form.length) {
      form[0].addEventListener('submit', () => {
        container.addClass('done');
        localStorage.setItem('popupSubscriptionIsHidden', true);
      });

      for (const closeItem of close) {
        closeItem.addEventListener('click', () => {
          container.addClass('closed');
          localStorage.setItem('popupSubscriptionIsHidden', true);
        });
      }
    }
  }
}

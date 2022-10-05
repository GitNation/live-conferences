export default function popupSubscription() {
  const container = $('.js-subscription-container');
  const close = $('.js-subscription-close');
  const form = $('.js-subscription-form');

  if (form.length) {
    form[0].addEventListener('submit', () => {
      container.addClass('done');
    });

    for (const closeItem of close) {
      closeItem.addEventListener('click', () => {
        container.addClass('closed');
      });
    }
  }
}

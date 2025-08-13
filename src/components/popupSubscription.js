export default function popupSubscription() {
  const container = document.querySelector('.js-subscription-container');
  const close = document.querySelector('.js-subscription-close');
  const form = document.querySelector('.js-subscription-form');
  const showOnYOffset = document.body.scrollHeight / 7;

  if (!container) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > showOnYOffset && !container.classList.contains('visible') && localStorage.popupSubscriptionIsHidden !== 'true') {
      container.classList.add('visible');
    }
  });

  if (close) {
    close.addEventListener('click', () => {
      container.classList.add('closed');
      localStorage.setItem('popupSubscriptionIsHidden', 'true');
    });
  }

  if (localStorage.popupSubscriptionIsHidden !== 'true' && form) {
    form.addEventListener('submit', () => {
      container.classList.remove('visible');
      localStorage.setItem('popupSubscriptionIsHidden', 'true');
    });
  }
}

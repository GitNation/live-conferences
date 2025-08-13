const container = document.querySelector('.js-fleet-container');

if (container) {
  const popups = document.querySelectorAll('.js-fleet-popup');
  const items = document.querySelectorAll('.js-fleet-item');
  const closes = document.querySelectorAll('.js-fleet-close');

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const currentPopup = item.parentElement.querySelector('.js-fleet-popup');

      if (currentPopup.classList.contains('is-active')) {
        popups.forEach((p) => p.classList.remove('is-active'));
      } else {
        popups.forEach((p) => p.classList.remove('is-active'));
        currentPopup.classList.add('is-active');
      }
    });
  });

  closes.forEach((close) => {
    close.addEventListener('click', () => {
      popups.forEach((p) => p.classList.remove('is-active'));
    });
  });
}

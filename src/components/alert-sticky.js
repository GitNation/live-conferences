const alertSticky = document.querySelector('.js-alert-sticky');
const alertClose = document.querySelector('.js-alert-close');

if (alertSticky) {
  alertClose.addEventListener('click', () => {
    alertSticky.style.display = 'none';
  });
}

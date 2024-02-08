import { CLASSES } from './_classes';

export default function popupPromo() {
  const popup = document.querySelector('.popup-container');
  if (!popup) return;
  const buttonClose = popup.querySelector('._popup-close');
  const body = document.querySelector('body');

  buttonClose.addEventListener('click', function(e) {
    e.preventDefault();
    popup.classList.remove(CLASSES.active);
    body.classList.remove('is-no-scroll');
  });
}

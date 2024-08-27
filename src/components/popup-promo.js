import { CLASSES } from './_classes';

const popup = document.querySelector('.popup-container');
const body = document.querySelector('body');
const BASE_URL = 'https://ems.gitnation.org';

// const BASE_URL = 'http://localhost:3000';
const LOCAL_STORAGE_KEY = 'lastVisitTime';
const ONE_HOUR = 60 * 60 * 1000;

function shouldShowPopup() {
  const lastVisitTime = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!lastVisitTime) {
    localStorage.setItem(LOCAL_STORAGE_KEY, new Date().getTime());
    return true;
  } else {
    const currentTime = new Date().getTime();
    if (currentTime - lastVisitTime > ONE_HOUR) {
      localStorage.setItem(LOCAL_STORAGE_KEY, currentTime);
      return true;
    } else {
      return false;
    }
  }
}

if (popup && new Date() > new Date(confFinished) && shouldShowPopup()) {
  fetch(`${BASE_URL}/api/events/promoted`)
    .then((res) => res.json())
    .then((event) => {
      const brandFont = event.brand.font.split(',')[0];
      if (brandFont !== 'Gotham Pro' && brandFont !== 'JetBrains Mono') {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${brandFont}:wght@400;700;900&display=swap`;
        document.head.appendChild(link);

        popup.style.setProperty('--brandFont', brandFont);
      }

      popup.classList.add('is-active');
      body.classList.add('is-no-scroll');

      const startDate = new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      const endDate = new Date(event.endDate).toLocaleDateString('en-US', { day: 'numeric' });
      const endYear = new Date(event.endDate).getFullYear();

      popup.style.setProperty('--accentColor', event.brand.accentCSS);
      document.querySelector('#promo__name').innerText = event.name;
      document.querySelector('#promo__img img').src = event.brand.icon;
      document.querySelector('#promo__img img').alt = event.brand.name;
      document.querySelector('#promo__title').innerText = event.brand.tagline;
      document.querySelector('#promo__link').href = event.brand.domain;
      document.querySelector('#sponsorship__link').href = event.brand.domain + '/sponsors';

      document.querySelector('#promo__location').innerText = event.location;
      document.querySelector('#promo__startDate').innerText = startDate;
      document.querySelector('#promo__endDate').innerText = endDate + ', ' + endYear;
    })
    .catch((error) => console.log(error));
}

export default function popupPromo() {
  const buttonClose = popup.querySelector('._popup-close');

  buttonClose.addEventListener('click', function(e) {
    e.preventDefault();
    popup.classList.remove(CLASSES.active);
    body.classList.remove('is-no-scroll');
  });
}

import { calcTime } from './countdown';
import dayjs from 'dayjs';

const { eventInfo } = eventsBus.content;
const container = document.getElementById('price-increase');
// const BASE_URL = 'https://ems.gitnation.org';

const BASE_URL = 'http://localhost:3000';
const priceIncreaseContainer = document.getElementById('price-increase-countdown');
const priceIncreaseTitle = document.getElementById('price-increase-title');

if (container) {
  const priceIncreaseClose = container.querySelector('.price-increase__close');

  fetch(`${BASE_URL}/api/events/${eventInfo.emsEventId}/price-increase`)
    .then((res) => res.json())
    .then((event) => {
      console.log('event', event);
      if (!event) {
        return;
      }

      const priceStartTime = event.priceIncreaseDate;
      const price = event.toPrice - event.fromPrice;
      const start = dayjs(priceStartTime);

      const updateTimer = (str) => {
        if (priceIncreaseContainer) priceIncreaseContainer.innerHTML = `<span>${str}</span>`;
      };
      const render = () => {
        const now = dayjs();
        const toStart = calcTime(now, start, true);
        if (toStart) {
          updateTimer(toStart);
          return false;
        }
        return true;
      };

      setInterval(render, 1000);

      priceIncreaseTitle.innerHTML = `Price increase! <br> Save €${price} when you register by ${start.date()}th ${start.format('MMMM')}`;
      container.removeAttribute('style');
    })
    .catch((error) => {
      console.error('Error fetching price increase data:', error);
    });

  priceIncreaseClose.addEventListener('click', function() {
    container.style.display = 'none';
  });
}

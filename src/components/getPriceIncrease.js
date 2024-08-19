import { CLASSES } from './_classes';
import { calcTime } from './countdown';
import dayjs from 'dayjs';

window.dayjs = dayjs;
const container = document.getElementById('price-increase');
// const BASE_URL = 'https://ems.gitnation.org';

const BASE_URL = 'http://localhost:3000';

const priceIncreaseContainer = document.getElementById('price-increase-countdown');
const { eventInfo } = eventsBus.content;

if (container) {
  fetch(`${BASE_URL}/api/events/${eventInfo.emsEventId}/price-increase`)
    .then((res) => res.json())
    .then((event) => {
      const priceStartTime = event.priceIncreaseDate;
      if (!priceIncreaseContainer || !priceStartTime) {
        return;
      }

      const price = event.toPrice - event.fromPrice;

      console.log('event', event);

      const start = dayjs(priceStartTime);
      document.getElementById('price-increase-title').innerHTML = `Price increase! <br> Save €${price} when you register by ${start.date()}th ${start.format(
        'MMMM'
      )}`;

      const updateTimer2 = (str) => {
        if (priceIncreaseContainer) priceIncreaseContainer.innerHTML = `<span>${str}</span>`;
      };
      const render = () => {
        const now = dayjs();
        const toStart = calcTime(now, start, true);
        if (toStart) {
          updateTimer2(toStart);
          return false;
        }
        return true;
      };

      setInterval(render, 1000);
    })
    .catch((error) => console.log(error));
}

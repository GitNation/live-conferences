import { calcTime } from './countdown';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { getPriceIncrease } from './utils/http';

dayjs.extend(advancedFormat);

const { eventInfo } = eventsBus.content;
const { currency = '€' } = eventInfo;
const container = document.getElementById('price-increase');
const priceIncreaseContainer = document.getElementById('price-increase-countdown');
const priceIncreaseTitle = document.getElementById('price-increase-title');

if (container && eventInfo.emsEventId) {
  const priceIncreaseClose = container.querySelector('.price-increase__close');

  getPriceIncrease(eventInfo.emsEventId)
    .then((nextBatch) => {
      console.log('getPriceIncrease', nextBatch);
      if (!nextBatch) {
        return;
      }

      const { priceIncreaseDate, fromPrice, toPrice } = nextBatch;
      const difference = toPrice - fromPrice;
      const start = dayjs(priceIncreaseDate);

      container.removeAttribute('style');

      const updateTimer = (str) => {
        if (priceIncreaseContainer) {
          priceIncreaseContainer.innerHTML = `<span>${str}</span>`;
        }
      };

      const render = () => {
        const now = dayjs();
        const toStart = calcTime(now, start, true);
        if (toStart) {
          updateTimer(toStart);
        }
      };

      setInterval(render, 1000);

      priceIncreaseTitle.innerHTML = `Price increase! <br> Save ${currency}${difference} when you register by ${start.format('Do MMMM')}`;
    })
    .catch((error) => {
      console.error('Error fetching price increase data:', error);
    });

  priceIncreaseClose.addEventListener('click', function() {
    container.style.display = 'none';
  });
}

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { getPriceIncrease } from './utils/http';

dayjs.extend(advancedFormat);

const { eventInfo } = eventsBus.content;
const { currency = '€' } = eventInfo;
const container = document.getElementById('price-increase');
const priceIncreaseContainer = document.getElementById('price-increase-countdown');
const priceIncreaseTitle = document.getElementById('price-increase-title');

const renderTimer = (days = 0, hours = 0, minutes = 0, seconds = 0) => `
  <ul class="timer">
    <li class="timer__item">
      <div class="timer__nums">${String(days).padStart(2, '0')}</div>
      <div class="timer__title">Days</div>
    </li>
    <li class="timer__separator"></li>
    <li class="timer__item">
      <div class="timer__nums">${String(hours).padStart(2, '0')}</div>
      <div class="timer__title">Hours</div>
    </li>
    <li class="timer__separator"></li>
    <li class="timer__item">
      <div class="timer__nums">${String(minutes).padStart(2, '0')}</div>
      <div class="timer__title">Min</div>
    </li>
    <li class="timer__separator"></li>
    <li class="timer__item">
      <div class="timer__nums">${String(seconds).padStart(2, '0')}</div>
      <div class="timer__title">Sec</div>
    </li>
  </ul>
`;

const displayInitialTimer = () => {
  if (priceIncreaseContainer) {
    priceIncreaseContainer.innerHTML = renderTimer();
  }
};

const updateTimer = (days, hours, minutes, seconds) => {
  if (priceIncreaseContainer) {
    priceIncreaseContainer.innerHTML = renderTimer(days, hours, minutes, seconds);
  }
};

const calculateTimeRemaining = (endTime) => {
  const now = dayjs();
  const diffInSeconds = endTime.diff(now, 'second');

  const days = Math.floor(diffInSeconds / (24 * 60 * 60));
  const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
  const seconds = diffInSeconds % 60;

  return { days, hours, minutes, seconds };
};

displayInitialTimer();

if (container && eventInfo.emsEventId) {
  const priceIncreaseClose = container.querySelector('.price-increase__close');

  getPriceIncrease(eventInfo.emsEventId)
    .then((nextBatch) => {
      if (!nextBatch) {
        return;
      }

      const { priceIncreaseDate, fromPrice, toPrice } = nextBatch;
      const difference = toPrice - fromPrice;
      const start = dayjs(priceIncreaseDate);

      if (Number.isNaN(difference) || !start.isValid()) {
        return;
      }

      container.removeAttribute('style');

      setInterval(() => {
        const { days, hours, minutes, seconds } = calculateTimeRemaining(start);
        updateTimer(days, hours, minutes, seconds);
      }, 1000);

      priceIncreaseTitle.innerHTML = `Price increase! <br> Save ${currency}${difference} when you register by ${start.format('Do MMMM')}`;
    })
    .catch((error) => {
      console.error('Error fetching price increase data:', error);
    });

  priceIncreaseClose.addEventListener('click', function() {
    container.style.display = 'none';
  });
}

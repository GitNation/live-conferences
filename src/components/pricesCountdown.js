import dayjs from 'dayjs';
import { getPriceIncrease } from './utils/http';

window.dayjs = dayjs;

const FINISHED = 'FINISHED';

const calcTime = (now, start) => {
  const diffSS = start.diff(now, 's');
  if (diffSS < 0 || isNaN(diffSS)) {
    document.querySelector('.p-countdown').classList.add('_hide');
    return null;
  }
  const diffMM = Math.floor(diffSS / 60);
  const diffHH = Math.floor(diffMM / 60);
  const diffDD = Math.floor(diffHH / 24);
  const restHH = diffHH - diffDD * 24;
  const restMM = diffMM - diffHH * 60;
  const restSS = diffSS - diffMM * 60;
  const strDD = `${diffDD}`.padStart(2, '0');
  const strHH = `${restHH}`.padStart(2, '0');
  const strMM = `${restMM}`.padStart(2, '0');
  const strSS = `${restSS}`.padStart(2, '0');

  return `<div class="countdown-timer">
    <div class="countdown-timer__item">
      <div class="countdown-timer__title">Days</div>
      <div class="countdown-timer__nums">${strDD}</div>
    </div>
    <div class="countdown-timer__separator">:</div>
    <div class="countdown-timer__item">
      <div class="countdown-timer__title">Hours</div>
      <div class="countdown-timer__nums">${strHH}</div>
    </div>
    <div class="countdown-timer__separator">:</div>
    <div class="countdown-timer__item">
      <div class="countdown-timer__title">Minutes</div>
      <div class="countdown-timer__nums">${strMM}</div>
    </div>
    <div class="countdown-timer__separator">:</div>
    <div class="countdown-timer__item">
      <div class="countdown-timer__title">Seconds</div>
      <div class="countdown-timer__nums">${strSS}</div>
    </div>
  </div>`;
};

window.calcTime = calcTime;

/**
 * @param {{ fromPrice: number, toPrice: number, priceIncreaseDate: Date }} nextBatch
 */
const addPriceIncreaseLabel = (nextBatch) => {
  if (!nextBatch.fromPrice) {
    return;
  }

  const increasePercentage = (nextBatch.toPrice - nextBatch.fromPrice) / nextBatch.fromPrice;
  const tickets = document.querySelectorAll('.prices-item .prices-item__price');
  tickets.forEach((node) => {
    let hasPriceIncreasedLabel = false;
    let initialPrice;

    // search for increase tip (which is rendered only if cms has something)
    for (const child of node.children) {
      if (child.classList.contains('prices-item__price-tip')) {
        hasPriceIncreasedLabel = true;
      } else if (child.classList.contains('prices-item__price-value')) {
        const [price] = child.textContent
          .split('\n')
          .map((text) => text.trim())
          .filter(Boolean);
        const priceNum = Number(price);
        if (!Number.isNaN(priceNum)) {
          initialPrice = priceNum;
        }
      }
    }

    if (!hasPriceIncreasedLabel && initialPrice) {
      let newPrice = initialPrice + increasePercentage * initialPrice;
      if (newPrice % 1 !== 0 || newPrice % 5 !== 0) {
        // render increased price label (price is dividend of 5)
        newPrice = 5 * Math.round(newPrice / 5);
      }
      const div = document.createElement('div');
      div.classList.add('prices-item__price-tip');
      div.innerHTML = `<p>After increase –&nbsp;€${newPrice}.</p>`;
      node.appendChild(div);
    }
  });
};

export const pricesCountdown = () => {
  const countdownContainer = document.getElementById('price-countdown');
  if (!countdownContainer) {
    return;
  }

  const isInPerson = countdownContainer ? countdownContainer.dataset.isInPerson : null;
  const { reactLayerConfig, eventInfo } = eventsBus.content;
  const cmsPriceIncreaseDate = isInPerson ? reactLayerConfig.pricesIncreaseDateInPerson : reactLayerConfig.pricesIncreaseDate;
  const eventId = eventInfo.emsEvent.id;
  getPriceIncrease(eventId).then((nextBatch) => {
    if (!(nextBatch || cmsPriceIncreaseDate)) {
      return;
    }

    if (nextBatch) {
      addPriceIncreaseLabel(nextBatch);
    }

    const priceIncreaseDate = dayjs((nextBatch && nextBatch.priceIncreaseDate) || cmsPriceIncreaseDate);
    const render = () => {
      const now = dayjs();
      const toStart = calcTime(now, priceIncreaseDate);
      if (toStart) {
        countdownContainer.innerHTML = toStart;
        return false;
      }
      countdownContainer.remove();
      document.querySelector('.p-countdown').classList.add('_hide');
      // countdownContainer.innerHTML = FINISHED;
      return true;
    };

    const isFinished = render();
    if (isFinished) {
      return;
    }
    setInterval(render, 1000);
  });
};

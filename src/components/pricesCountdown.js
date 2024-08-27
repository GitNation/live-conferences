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

const NON_DIGITS_REGEX = /\D/;
/**
 * @param {{ fromPrice: number, toPrice: number, priceIncreaseDate: Date }} nextBatch
 */
const addAfterIncreaseLabel = (nextBatch, ticketsContainerClass, tipClass, valueClass) => {
  if (!nextBatch.fromPrice) {
    return;
  }

  const increasePercentage = (nextBatch.toPrice - nextBatch.fromPrice) / nextBatch.fromPrice;
  console.debug(`[Auto increasing prices by ${Math.round(increasePercentage * 100)}%]`);

  const tickets = document.querySelectorAll(ticketsContainerClass);
  tickets.forEach((node) => {
    let hasPriceIncreasedLabel = false;
    let initialPrice;
    let currency;
    let priceNode;

    // search for increase tip (which is rendered only if cms has something)
    for (const child of node.children) {
      if (child.classList.contains(tipClass)) {
        hasPriceIncreasedLabel = true;
      } else if (child.classList.contains(valueClass)) {
        priceNode = child;
        const [price] = child.textContent
          .split('\n')
          .map((text) => text.trim())
          .filter(Boolean);

        currency = price && price.match(NON_DIGITS_REGEX)[0];

        const priceNum = Number(price && price.replace(/\D/, ''));
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
      div.classList.add(tipClass);
      div.innerHTML = `<p>After increase –&nbsp;${currency}${newPrice}.</p>`;
      node.insertBefore(div, priceNode.nextSibling);
    }
  });
};

const addCountdownContainer = () => {
  const title = document.createElement('div');
  title.classList.add('p-countdown__title');
  title.innerHTML = 'Price increase in:';

  const container = document.createElement('div');
  container.classList.add('p-countdown__items');
  container.id = 'price-countdown';

  const outerDiv = document.createElement('div');
  outerDiv.classList.add('prices__countdown', 'p-countdown');

  outerDiv.appendChild(title);
  outerDiv.appendChild(container);

  const head = document.querySelector('.prices__head');
  head && head.appendChild(outerDiv);

  return container;
};

const CONTAINER = '.prices__list .prices__item';
const V3_CONTAINER = '.prices__list .prices-item .prices-item__price';

export const pricesCountdown = () => {
  let countdownContainer = document.getElementById('price-countdown');
  const isInPerson = countdownContainer ? countdownContainer.dataset.isInPerson : null;
  const { reactLayerConfig, eventInfo } = eventsBus.content;
  const cmsPriceIncreaseDate = isInPerson ? reactLayerConfig.pricesIncreaseDateInPerson : reactLayerConfig.pricesIncreaseDate;
  const eventId = eventInfo.emsEvent.id;

  getPriceIncrease(eventId).then((nextBatch) => {
    if (!(nextBatch || cmsPriceIncreaseDate)) {
      return;
    }

    if (nextBatch) {
      if (document.querySelector(V3_CONTAINER)) {
        addAfterIncreaseLabel(nextBatch, V3_CONTAINER, 'prices-item__price-tip', 'prices-item__price-value');
      } else if (document.querySelector(CONTAINER)) {
        addAfterIncreaseLabel(nextBatch, CONTAINER, 'prices__price-tip', 'prices__price');
      }
    }

    if (!countdownContainer && document.querySelector(V3_CONTAINER)) {
      countdownContainer = addCountdownContainer();
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
      countdownContainer.innerHTML = FINISHED;
      return true;
    };

    const isFinished = render();
    if (isFinished) {
      return;
    }
    setInterval(render, 1000);
  });
};

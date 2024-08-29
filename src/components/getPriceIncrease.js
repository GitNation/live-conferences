import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { getPriceIncrease } from './utils/http';

dayjs.extend(advancedFormat);

const { eventInfo } = eventsBus.content;
const { currency = '€' } = eventInfo;
const container = document.getElementById('price-increase');
const priceIncreaseContainer = document.getElementById('price-increase-countdown');
const priceIncreaseTitle = document.getElementById('price-increase-title');

const renderTimer = (days, hours, minutes, seconds) => `
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

const setInitialTimer = () => {
  if (priceIncreaseContainer) {
    priceIncreaseContainer.innerHTML = renderTimer(0, 0, 0, 0);
  }
};
const animateCounter = (startValue, endValue, duration, updateFn, finalCallback) => {
  const startTime = performance.now();

  const tick = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
    updateFn(currentValue);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else if (finalCallback) {
      finalCallback();
    }
  };

  requestAnimationFrame(tick);
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

const updateTimer = (days, hours, minutes, seconds) => {
  if (priceIncreaseContainer) {
    priceIncreaseContainer.innerHTML = renderTimer(days, hours, minutes, seconds);
  }
};

const startAnimation = (priceIncreaseDate) => {
  const endTime = dayjs(priceIncreaseDate);
  const { days: finalDays, hours: finalHours, minutes: finalMinutes, seconds: finalSeconds } = calculateTimeRemaining(endTime);

  const animationDuration = 1000;

  setInitialTimer();

  // Последовательная анимация от нулевых значений
  animateCounter(
    0,
    finalSeconds,
    animationDuration / 4,
    (val) => updateTimer(0, 0, 0, val),
    () => {
      animateCounter(
        0,
        finalMinutes,
        animationDuration / 4,
        (val) => updateTimer(0, 0, val, finalSeconds),
        () => {
          animateCounter(
            0,
            finalHours,
            animationDuration / 4,
            (val) => updateTimer(0, val, finalMinutes, finalSeconds),
            () => {
              animateCounter(
                0,
                finalDays,
                animationDuration / 4,
                (val) => updateTimer(val, finalHours, finalMinutes, finalSeconds),
                () => {
                  // После завершения анимации, начать реальный таймер
                  setInterval(() => {
                    const { days, hours, minutes, seconds } = calculateTimeRemaining(endTime);
                    updateTimer(days, hours, minutes, seconds);
                  }, 1000);
                }
              );
            }
          );
        }
      );
    }
  );
};

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

      if (Number.isNaN(difference) || !dayjs(priceIncreaseDate).isValid()) {
        return;
      }

      container.removeAttribute('style');

      setTimeout(() => startAnimation(priceIncreaseDate), 10);

      priceIncreaseTitle.innerHTML = `Price increase! <br> Save ${currency}${difference} when you register by ${start.format('Do MMMM')}`;
    })
    .catch((error) => {
      console.error('Error fetching price increase data:', error);
    });

  priceIncreaseClose.addEventListener('click', function() {
    container.style.display = 'none';
  });
}

import dayjs from 'dayjs';

window.dayjs = dayjs;
const { reactLayerConfig } = eventsBus.content;
const startTime = window.eventsBus.content.eventInfo.conferenceStart;

const durationHH = 32;
const LIVE = 'LIVE';
const FINISHED = 'FINISHED';

const countdownContainer = document.getElementById('countdown');

export const calcTime = (now, start, withTitle = false) => {
  const diffSS = start.diff(now, 's');
  if (diffSS < 0 || isNaN(diffSS)) {
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

  const div = ':';
  if (withTitle) {
    return `<ul class="timer">
    <li class="timer__item">
      <div class="timer__nums">${strDD}</div>
      <div class="timer__title">Days</div>
    </li>
    <li class="timer__separator"></li>
    <li class="timer__item">
      <div class="timer__nums">${strHH}</div>
      <div class="timer__title">Hours</div>
    </li>
    <li class="timer__separator"></li>
    <li class="timer__item">
      <div class="timer__nums">${strMM}</div>
      <div class="timer__title">Min</div>
    </li>
    <li class="timer__separator"></li>
    <li class="timer__item">
      <div class="timer__nums">${strSS}</div>
      <div class="timer__title">Sec</div>
    </li>
  </ul>`;
  }
  // const div = ':';
  return `${strDD}.${strHH}${div}${strMM}${div}${strSS}`;
};

window.calcTime = calcTime;

const updateTimer = (str) => {
  if (countdownContainer) countdownContainer.innerHTML = `<span>${str}</span>`;
};

export const countdown = () => {
  if (!countdownContainer || !startTime) {
    return;
  }

  const start = dayjs(startTime);
  const end = start.add(durationHH, 'hour');

  const render = () => {
    const now = dayjs();
    const toStart = calcTime(now, start);
    const toEnd = calcTime(now, end);
    if (toStart) {
      updateTimer(toStart);
      return false;
    }
    if (!toStart && toEnd) {
      updateTimer(LIVE);
      return false;
    }
    updateTimer(FINISHED);
    return true;
  };

  const isFinished = render();
  if (isFinished) {
    return;
  }
  setInterval(render, 1000);
};

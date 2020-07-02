import dayjs from 'dayjs';

window.dayjs = dayjs;

const content = window.__CONTENT__;

const startTime = content ? content.startGMT : 'December 20, 2020 14:00:00 GMT';
const durationHH = 32;
const LIVE = 'LIVE';
const FINISHED = 'FINISHED';

const countdownContainer = document.getElementById('countdown');

const calcTime = (now, start) => {
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

  const div = restSS % 2 ? ':' : ' ';
  // const div = ':';
  return `${strDD}.${strHH}${div}${strMM}${div}${strSS}`;
};

window.calcTime = calcTime;

const updateTimer = (str) => {
  countdownContainer.innerHTML = `<span>${str}</span>`;
};

export const countdown = () => {
  if (!countdownContainer) {
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

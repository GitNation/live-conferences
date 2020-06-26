const cestGmtShift = 2;

const cestToLocal = (timeString) => {
  const fullStringGmtWrong = `17 Apr 2020 ${timeString}:00 GMT`;
  const dateLocalWrong = new Date(fullStringGmtWrong);
  dateLocalWrong.setHours(dateLocalWrong.getHours() - cestGmtShift);
  const correctedTime = dateLocalWrong;
  return correctedTime;
};

const formatTime = (dateObj) => {
  const hh = `${dateObj.getHours()}`;
  const mm = `${dateObj.getMinutes()}`;
  return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`;
};

const parseTime = (timeString) => {
  const dateStr = `17 Apr 2020 ${timeString}:00`;
  return new Date(dateStr);
};

const localTimeOf = (str) => {
  try {
    return formatTime(cestToLocal(str));
  } catch (err) {
    console.error(err);
    return '??:??';
  }
};

const minutesFrom = (localTimeStart) => {
  const startTimeObj = parseTime(localTimeStart);
  const startMinutes = startTimeObj.getHours() * 60 + startTimeObj.getMinutes();
  return (timeString) => {
    const timeObj = parseTime(timeString);
    const totalMinutes = timeObj.getHours() * 60 + timeObj.getMinutes();
    const minFrom = totalMinutes - startMinutes;
    return minFrom;
  };
};

window.cestToLocal = cestToLocal;

const cestStartTime = '15:00';
var startTime = localTimeOf(cestStartTime);
window.startTime = startTime;
var endTime = localTimeOf('20:30');

var trackStepInMin = 5;
var pxPerMinute = 50 / trackStepInMin;
var startTimeInMin = timeToMinutes(startTime);
var endTimeInMin = timeToMinutes(endTime);
var confDurationInMin = minutesDiff(startTimeInMin, endTimeInMin);
var confDurationInHours = confDurationInMin / 60;
var timelineWidth = confDurationInMin * pxPerMinute;

var timeline = document.getElementById('js-timeline');
var trackItems = document.getElementsByClassName('js-time');
var qaItems = document.getElementsByClassName('js-qa-item');
var currentTimeElem = document.getElementById('js-current-time');
var trackHead = document.getElementById('js-track-head');
var trackCurrentTime = document.getElementById('js-current-time-track');
var splittedStartTime = startTime.split(':');
var trackLines = '';

function timeToMinutes(time) {
  var hm = time;
  var a = hm.split(':');
  var minutes = +a[0] * 60 + +a[1];
  return minutes;
}

function minutesDiff(m1, m2) {
  const diff = m2 - m1;
  return diff > 0 ? diff : 1440 + diff;
}

function leadingZero(n) {
  if (n < 10 && n >= 0) return '0' + n;
  else return n;
}

function getTime() {
  var currentDate = new Date();
  var currentHours = currentDate.getHours();
  var currentMinutes = currentDate.getMinutes();
  currentHours = leadingZero(currentHours);
  currentMinutes = leadingZero(currentMinutes);
  document.getElementById('js-current-time').innerHTML =
    currentHours + ':' + currentMinutes;
  return currentHours + ':' + currentMinutes;
}

function setTimeLinePosition(tm) {
  var minutes = timeToMinutes(tm);
  var currentSeconds = new Date().getSeconds() / 60;
  var minutesUpdated;
  minutesUpdated = minutes + currentSeconds - startTimeInMin;
  const left = minutesUpdated * pxPerMinute + 26 + 'px';
  trackCurrentTime.style.left = left;

  // hide if conference ended
  if (left > 5000) {
    // trackCurrentTime.style.display = 'none';
  }
}

const renderTimeTick = ({ hh, mm }) => {
  return `<div class="time-track__head-item">${hh}:${mm}</div>`;
};

function createHeadTimeline() {
  if (!currentTimeElem) {
    return;
  }
  // Create head timeline
  const timeTicksList = new Array(Math.ceil(confDurationInMin / 5) + 1).fill(0);

  const ticks = [];
  const startTimeObj = parseTime(startTime);
  timeTicksList.forEach(() => {
    const timeStr = formatTime(startTimeObj);
    const [hh, mm] = timeStr.split(':');
    const newTick = renderTimeTick({ hh, mm });
    ticks.push(newTick);
    startTimeObj.setMinutes(startTimeObj.getMinutes() + 5);
  });

  trackHead.innerHTML = ticks.join('\n');
  timeline.style.width = timelineWidth + 52 + 'px';
}

function putEventsToTimeline() {
  const shiftInPx = (minutes) => {
    const px = `${minutes * pxPerMinute + 26}px`;
    return px;
  };

  const cestObj = parseTime(cestStartTime);
  const cestStartMinutes = cestObj.getHours() * 60 + cestObj.getMinutes();

  [...trackItems].forEach((event) => {
    const eventObj = parseTime(event.dataset.time);
    const eventMinutes = eventObj.getHours() * 60 + eventObj.getMinutes();
    const minutes = eventMinutes - cestStartMinutes;

    event.style.left = shiftInPx(minutes);
    const duration = event.dataset.duration;
    event.style.width = `${duration * pxPerMinute - 1}px`;
    event.style.display = '';

    const isAuth = event.dataset.auth === 'auth';
    if (isAuth) {
      const srcId = event.dataset.src;
      const timeSpan = event.parentElement.querySelector(
        `span[data-time-id="${srcId}"]`
      );
      const timeOfStarting = localTimeOf(event.dataset.time);
      timeSpan.innerText = timeOfStarting;
      event.dataset.localStartingTime = timeOfStarting;
    }
  });
}

function enableEventsLinksByLocalTime(currentTime) {
  // const currentObj = parseTime(currentTime);
  const calcDiff = minutesFrom(currentTime);

  [...trackItems].forEach((event) => {
    const enablingTime = event.dataset.localStartingTime;
    if (!enablingTime) {
      return;
    }
    // const enablingObj = parseTime(enablingTime);
    const minutesDiff = calcDiff(enablingTime);
    if (minutesDiff <= 0) {
      event.removeAttribute('data-fancybox');
    }
  });
}

function LiveTimeLine() {
  const updateTime = () => {
    const currentTime = getTime();
    setTimeLinePosition(currentTime);
    enableEventsLinksByLocalTime(currentTime);
  };
  updateTime();
  setInterval(updateTime, 1000);
}

function scrollTrackToView() {
  const leftStr = trackCurrentTime.style.left;
  const leftVal = parseInt(leftStr.replace('px', ''), 0);
  const track = document.querySelector('.time-track__content');
  track.scrollTo(leftVal - 200, 0);
}

const startTimeline = () => {
  try {
    createHeadTimeline();
    putEventsToTimeline();
    // LiveTimeLine();
    // scrollTrackToView();
  } catch (err) {}
};

startTimeline();

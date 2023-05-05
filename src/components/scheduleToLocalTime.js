import dayjs from 'dayjs';

export default function scheduleToLocalTime() {

  var scheduleTime = document.querySelectorAll('.schedule .s-item__time, .sv-item__time, .sv-time__zone span');

  if (scheduleTime) {
    scheduleTime.forEach((item) => {
      if (item.dataset.timeLocalized) {
        return;
      }

      const time = item.innerText.trim();
      let localTime;
      let renderTime;

      if (item.dataset.timeZone) {
        localTime = new Date(time).toLocaleTimeString('en-GB', { timeZone: item.dataset.timeZone });
        renderTime = localTime.split(':').slice(0, 2).join(':');
      } else {
        localTime = new Date(time).toLocaleTimeString('en-GB');
        renderTime = localTime.split(':').slice(0, 2).join(':');
        item.dataset.timeLocalized = true;
      }

      item.innerText = renderTime;
    });
  }

  const livePageHeader = document.querySelector('[data-name=live-page__header-date]');
  if (livePageHeader) {
    const [startDate, endDate] = livePageHeader.innerText.split('---').map((e) => dayjs(e));
    livePageHeader.style.display = 'block';
    if (startDate.format('MMMM D') === endDate.format('MMMM D')) {
      livePageHeader.innerText = `${startDate.format('MMMM D')}, ${startDate.format('YYYY')}`;
    } else {
      livePageHeader.innerText = `${startDate.format('MMMM D')}-${endDate.format('D')}, ${startDate.format('YYYY')}`;
    }
  }
}

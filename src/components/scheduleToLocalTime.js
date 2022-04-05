import dayjs from 'dayjs';

export default function scheduleToLocalTime() {
  var scheduleTime = document.querySelectorAll('.schedule .s-item__time');

  if (scheduleTime) {
    scheduleTime.forEach((item) => {
      if (item.dataset.timeLocalized) {
        return;
      }

      const time = item.innerText.trim();
      const localTime = new Date(time).toLocaleTimeString('en-GB');
      const renderTime = localTime.split(':').slice(0, 2).join(':');
      item.innerText = renderTime;
      item.dataset.timeLocalized = true;
    });
  }

  const livePageHeader = document.querySelector('[data-name=live-page__header-date]');
  if (livePageHeader) {
    const [startDate, endDate] = livePageHeader.innerText.split('---').map((e) => dayjs(e));
    livePageHeader.style.display = 'block';
    console.log('start ' + startDate.format('MMMM D'));
    console.log('end ' + endDate.format('MMMM D'));
    if ( startDate.format('MMMM D') === endDate.format('MMMM D') ) {
      livePageHeader.innerText = `${startDate.format('MMMM D')}, ${startDate.format('YYYY')}`;
    } else {
      livePageHeader.innerText = `${startDate.format('MMMM D')}-${endDate.format('D')}, ${startDate.format('YYYY')}`;
    }
  }
}

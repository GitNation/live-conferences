export default function scheduleToLocalTime() {
  var scheduleTime = document.querySelectorAll('.schedule .s-item__time');

  if (scheduleTime) {
    scheduleTime.forEach((item) => {
      if (item.dataset.timeLocalized) {
        return;
      }

      const time = item.innerText;
      const localTime = new Date(`Oct 15 2020 ${time} GMT+0200`).toLocaleTimeString('en-GB');
      const renderTime = localTime.split(':').slice(0,2).join(':');
      item.innerText = renderTime;
      item.dataset.timeLocalized = true;
    });
  }
}

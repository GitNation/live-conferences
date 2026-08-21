const close = document.querySelector('.js-notice-close');
const panel = document.querySelector('.js-notice-panel');

const { eventInfo } = eventsBus.content;
// The jsn layout no longer sets the global, and a conference without an EMS id
// has no emsEvent — an unguarded access here kills all of app.js.
const confFinished = eventInfo.conferenceFinish || (eventInfo.emsEvent && eventInfo.emsEvent.endDate);

let visibleNoticePanel = new Date(confFinished);
visibleNoticePanel = new Date(new Date(visibleNoticePanel.setDate(visibleNoticePanel.getDate() + 1)).setHours(0, 0, 0));

if (close && panel) {
	close.addEventListener('click', () => {
		panel.style.display = 'none';
	});

	if (visibleNoticePanel < new Date()) {
		panel.style.display = 'block';
	}
}

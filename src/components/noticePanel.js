const close = document.querySelector('.js-notice-close');
const panel = document.querySelector('.js-notice-panel');

const { eventInfo } = eventsBus.content;
const confFinished = eventInfo.conferenceFinish || eventInfo.emsEvent.endDate;

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

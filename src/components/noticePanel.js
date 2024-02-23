const close = $('.js-notice-close');
const panel = $('.js-notice-panel');

let visibleNoticePanel = new Date(confFinished);
visibleNoticePanel = new Date(new Date(visibleNoticePanel.setDate(visibleNoticePanel.getDate() + 1)).setHours(0, 0, 0));

close.on('click', function() {
  panel.hide();
});
if (panel.length) {
  if (visibleNoticePanel < new Date()) {
    panel.show();
  }
}

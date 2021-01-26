export default function ticketNotFound() {
  const isNeedToOpenModal = Boolean(document.getElementById('ticketNotFound'));

  if (isNeedToOpenModal) {
    eventsBus.clickEvent({ name: 'ticket-not-fount', link: '', isAuth: false, data: {} });
  }
}

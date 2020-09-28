export default function msieversion() {
  let ua = window.navigator.userAgent;
  let msie = ua.indexOf('MSIE ');

  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    // If Internet Explorer, return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)));
  } // If another browser, return 0
  else {
    return 'otherbrowser';
  }

  return false;
}

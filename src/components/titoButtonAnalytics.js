function sendAnalytics() {
  gtag('event', 'begin_checkout');
}

'tito' in window &&
  tito('on:registration:started', () => {
    if (window.location.hostname === 'reactsummit.com') {
      sendAnalytics();
    }
  });

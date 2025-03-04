function sendAnalytics() {
  gtag('event', 'begin_checkout');
}

tito &&
  tito('on:registration:started', () => {
    if (window.location.hostname === 'reactsummit.com') {
      sendAnalytics();
    }
  });

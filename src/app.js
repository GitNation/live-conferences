/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-css */
import highlightContent from '@focus-reactive/inline-edit';
import { contentTypeMap } from '@focus-reactive/graphql-content-layer/dist/content-type-map';
import reactApp from '@focus-reactive/react-app-layer';
import '@fancyapps/fancybox';
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

import './components/tabs';
import './components/header';
import './components/smoothScroll';
import './components/_ticketBtnShow';
import scheduleToLocalTime from './components/scheduleToLocalTime';
import { countdown } from './components/countdown';
import { pricesCountdown } from './components/pricesCountdown';
import { startHashLinksTracking } from './ga/hash-links-tracking';
import svg4everybody from 'svg4everybody';
import msieversion from './components/detectIE';
import pricesScroll from './components/_pricesScroll';
import slider from './components/_slider';
import video from './components/video';
import googleMap from './components/map';
import multipassSlider from './components/multipassSlider';
import pricesSlider from './components/pricesSlider';
import './components/fleet';
import './components/trackDropdown';
import './components/_faq';
import './components/noticePanel';
// import './components/_timeTrack';
import noTouch from './components/noTouch';
import ticketNotFound from './components/ticketNotFound';
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

Sentry.init({
  dsn: 'https://60b10886207d461a8b333f66e3d86ebf@o513607.ingest.sentry.io/5615857',
  integrations: [new Integrations.BrowserTracing()],
  sampleRate: 1.0,
  tracesSampleRate: 0.5,
  environment: process.env.CONF_CODE,
  ignoreErrors: [
    // Random plugins/extensions
    'top.GLOBALS',
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'http://tt.epicplay.com',
    "Can't find variable: ZiteReader",
    'jigsaw is not defined',
    'ComboSearch is not defined',
    'http://loading.retry.widdit.com/',
    'atomicFindClose',
    // Facebook borked
    'fb_xd_fragment',
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
    // reduce this. (thanks @acdha)
    // See http://stackoverflow.com/questions/4113268
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
    'conduitPage',
  ],
  denyUrls: [
    // Facebook flakiness
    /graph\.facebook\.com/i,
    // Facebook blocked
    /connect\.facebook\.net\/en_US\/all\.js/i,
    // Woopra flakiness
    /eatdifferent\.com\.woopra-ns\.com/i,
    /static\.woopra\.com\/js\/woopra\.js/i,
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    // Other plugins
    /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
    /webappstoolbarba\.texthelp\.com\//i,
    /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
  ],
});

$(reactApp);
$(ticketNotFound);

noTouch();
$(window).resize(function () {
  $('body').css('--vh', `${window.innerHeight * 0.01}px`);
});

function touch() {
  return 'ontouchstart' in window;
}

// detect
if (!touch()) {
  $('body').addClass('no-touch');
}
svg4everybody();

// detect IE
let isIE = msieversion();
if (isIE !== 'otherbrowser') {
  $('body').addClass('is-ie');
}

pricesScroll();

if ($('.js-slider')) {
  slider();
}

new googleMap();

if ($('.js-video-btn')) {
  new video({
    btn: '.js-video-btn',
  });
}

if ($('.multipass-slider')) {
  multipassSlider();
}

if ($('.prices-slider')) {
  pricesSlider();
}

scheduleToLocalTime();
countdown();
pricesCountdown();
startHashLinksTracking();

highlightContent({ contentTypeMap });

function sendToGoogleAnalytics(metric) {
  if (window.location.hostname === 'localhost') {
    return;
  }

  var { name, delta, id } = metric;
  // Assumes the global `gtag()` function exists, see:
  // https://developers.google.com/analytics/devguides/collection/gtagjs
  gtag('event', name, {
    event_category: 'Web Vitals',
    // The `id` value will be unique to the current page load. When sending
    // multiple values from the same page (e.g. for CLS), Google Analytics can
    // compute a total by grouping on this ID (note: requires `eventLabel` to
    // be a dimension in your report).
    event_label: id,
    // Google Analytics metrics must be integers, so the value is rounded.
    // For CLS the value is first multiplied by 1000 for greater precision
    // (note: increase the multiplier for greater precision if needed).
    value: Math.round(name === 'CLS' ? delta * 1000 : delta),
    // Use a non-interaction event to avoid affecting bounce rate.
    non_interaction: true,

    // OPTIONAL: any additional params or debug info here.
    // See: https://web.dev/debug-web-vitals-in-the-field/
    // metric_rating: 'good' | 'ni' | 'poor',
    // debug_info: '...',
    // ...
  });
}

getCLS(sendToGoogleAnalytics);
getFID(sendToGoogleAnalytics);
getLCP(sendToGoogleAnalytics);
getFCP(sendToGoogleAnalytics);
getTTFB(sendToGoogleAnalytics);

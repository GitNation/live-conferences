/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-animate */
/* eslint-disable jquery/no-closest */
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-global-selector */
/* eslint-disable jquery/no-sizzle */

import highlightContent from '@focus-reactive/inline-edit';
import { contentTypeMap } from '@focus-reactive/graphql-content-layer/dist/content-type-map';
import reactApp from '@focus-reactive/react-app-layer';
import '@fancyapps/fancybox';
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

import './components/showMoreSpeakers';
import './components/textEffect';
import './components/tabs';
import './components/shedule';
import './components/header';
// import './components/smoothScroll';
import './components/_ticketBtnShow';
import './components/titoButtonFixed';
import scrollSlider from './components/scrollSlider';
import sponsorImagesResize from './components/sponsorImagesResize';
import circleProgress from './components/circleProgress';
import scheduleToLocalTime from './components/scheduleToLocalTime';
import { countdown } from './components/countdown';
import { pricesCountdown } from './components/pricesCountdown';
import svg4everybody from 'svg4everybody';
import pricesScroll from './components/_pricesScroll';
import slider from './components/_slider';
import video from './components/video';
import googleMap from './components/map';
import multipassSlider from './components/multipassSlider';
import pricesSlider from './components/pricesSlider';
import fadeSlider from './components/fadeSlider';
import popupSubscription from './components/popupSubscription';
import './components/fleet';
import './components/trackDropdown';
import './components/accordion';
import './components/noticePanel';
// import './components/_timeTrack';
import noTouch from './components/noTouch';
import ticketNotFound from './components/ticketNotFound';
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

Sentry.init({
  dsn: 'https://60b10886207d461a8b333f66e3d86ebf@o513607.ingest.sentry.io/5615857',
  integrations: [new Integrations.BrowserTracing()],
  sampleRate: 1.0,
  tracesSampleRate: 0.1,
  environment: process.env.CONF_CODE,
  ignoreErrors: [
    // Random plugins/extensions
    'top.GLOBALS',
    'TypeError: Failed to fetch',
    'TypeError: NetworkError when attempting to fetch resource.',
    'TypeError: Cancelled',
    'AbortError: The operation was aborted.',
  ],
  denyUrls: [
    // Facebook flakiness
    /graph\.facebook\.com/i,
    // Facebook blocked
    /connect\.facebook\.net\/en_US\/all\.js/i,
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /googleads\.g\.doubleclick\.net/i,
  ],
});

$(reactApp);
$(ticketNotFound);

noTouch();
$(window).resize(function() {
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

if ($('#circle-progress').length) {
  circleProgress();
}

if ($('.fade-slider')) {
  fadeSlider();
}

if ($('.scroll-slider')) {
  scrollSlider();
}

if ($('.sponsors-block_lg img, .sponsors-block_xl img, .sponsors-block_md img, .sponsors-block_sm img, .sponsors-block_xs img').length) {
  sponsorImagesResize();
}

popupSubscription();
scheduleToLocalTime();
countdown();
pricesCountdown();

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

// Anchor navigation (it works better than native css smooth, as the native is delayed on page load)
$('a[href*="#"]:not([href="#"])').not('a.js-schedule-scroll-link').click(function() {
  if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
    var target = $(this.hash);
    var _this = this;
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

    if (target.length) {
      const hash = _this.href.split('#')[1];
      const { isAuth } = eventsBus.getContent();

      gtag('event', `anchor-link - anchor:${hash}; isAuth:${isAuth}`, { event_category: 'anchor-links' });


      let offset = $('.header').position().top === 0 ? $('.header').innerHeight() : 0;


      $('html, body').animate(
        {
          scrollTop:target.offset().top - offset + 2,
        },
        400,
        function() {
          location.hash = _this.hash;
        }
      );
      return false;
    }
  }
});

if ($('.hero__switch').length > 0) {
  $(window).on('load', function() {
    $('.hero__switch').addClass('_swipe');
  });
}


getCLS(sendToGoogleAnalytics);
getFID(sendToGoogleAnalytics);
getLCP(sendToGoogleAnalytics);
getFCP(sendToGoogleAnalytics);
getTTFB(sendToGoogleAnalytics);

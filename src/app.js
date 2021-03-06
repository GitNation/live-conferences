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
import scheduleToLocalTime from './components/scheduleToLocalTime';
import { countdown } from './components/countdown';
import { startHashLinksTracking } from './ga/hash-links-tracking';
import svg4everybody from 'svg4everybody';
import msieversion from './components/detectIE';
import pricesScroll from './components/_pricesScroll';
import slider from './components/_slider';
import multipassSlider from './components/multipassSlider';
import './components/trackDropdown';
import './components/_faq';
import './components/noticePanel';
// import './components/_timeTrack';
import noTouch from './components/noTouch';
import ticketNotFound from './components/ticketNotFound';

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

// detect IE
let isIE = msieversion();
if (isIE !== 'otherbrowser') {
  $('body').addClass('is-ie');
}

pricesScroll();

if ($('.js-slider')) {
  slider();
}

if ($('.multipass-slider')) {
  multipassSlider();
}

scheduleToLocalTime();
countdown();
startHashLinksTracking();

highlightContent({ contentTypeMap });

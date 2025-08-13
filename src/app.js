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
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

import './components/formatedDate';
import './components/tabs';
import './components/localStorage';
import './components/shedule';
import './components/header';
import './components/_ticketBtnShow';
import showFullProgramme from './components/showFullProgramme';
// import './components/titoButtonAnalytics';
import popupPromo from './components/popup-promo';
import './components/getPriceIncrease';

import sponsorImagesResize from './components/sponsorImagesResize';
import circleProgress from './components/circleProgress';
import scheduleToLocalTime from './components/scheduleToLocalTime';
import { countdown } from './components/countdown';
import { pricesCountdown } from './components/pricesCountdown';
import svg4everybody from 'svg4everybody';
import slider from './components/_slider';
import sliderCustom from './components/_sliderCustom';
import video from './components/video';
// import googleMap from './components/map';
import multipassSlider from './components/multipassSlider';
import pricesSlider, { priceFilter } from './components/pricesSlider';
import fadeSlider from './components/fadeSlider';
import sliderAuto from './components/sliderAuto';
import popupSubscription from './components/popupSubscription';
import './components/fleet';
import './components/accordion';
import './components/scroller';
import './components/noticePanel';
import './components/popup';
import noTouch from './components/noTouch';
import ticketNotFound from './components/ticketNotFound';
import { showTicketsWhenSubscribed } from './components/showTicketsWhenSubscribed';
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';
import playRandomVideo from './components/playRandomSpeakerVideo';

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

reactApp();
ticketNotFound();

noTouch();

svg4everybody();

priceFilter();

popupPromo();

showFullProgramme();

sliderAuto();

if (document.querySelector('.js-slider')) {
  slider();
}

if (document.querySelector('.slider-custom')) {
  sliderCustom();
}

if (document.querySelector('.js-video-btn')) {
  new video({
    btn: '.js-video-btn',
  });
}

if (document.querySelector('.multipass-slider')) {
  multipassSlider();
}

if (document.querySelector('.prices-slider')) {
  pricesSlider();
}

if (document.querySelector('#circle-progress')) {
  circleProgress();
}

if (document.querySelector('.fade-slider')) {
  fadeSlider();
}

if (document.querySelector('.sponsors-block_lg img, .sponsors-block_xl img, .sponsors-block_md img, .sponsors-block_sm img, .sponsors-block_xs img')) {
  sponsorImagesResize();
}

if (document.querySelectorAll('div[role="button"][data-href]').length) {
  const roleButtons = document.querySelectorAll('div[role="button"][data-href]');
  roleButtons.forEach((roleButton) => {
    roleButton.addEventListener('keypress', (e) => {
      if (e.keyCode === 13) {
        e.currentTarget.click();
        window.location.hash = e.currentTarget.dataset.href;
      }
    });
    roleButton.addEventListener('click', (e) => {
      window.location.hash = e.currentTarget.dataset.href;
    });
  });
}

function scrollToId() {
  const target = document.querySelector(window.location.hash + '-id');
  if (target) {
    const popupTop = target.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: popupTop - 100,
      behavior: 'smooth',
    });
  }
}

window.addEventListener('load', function() {
  playRandomVideo();

  if (window.location.hash) {
    const dataHrefEl = document.querySelector('[data-href="' + window.location.hash + '"]');
    if (dataHrefEl) {
      setTimeout(() => {
        dataHrefEl.click();
        scrollToId();
      }, 200);
    }

    const anchorEl = document.querySelector('a[href="' + window.location.hash + '"]');
    if (anchorEl) {
      setTimeout(() => {
        anchorEl.click();
        scrollToId();
      }, 200);
    }
  }

  showTicketsWhenSubscribed();
});

popupSubscription();
scheduleToLocalTime();
countdown();
pricesCountdown();

highlightContent({ contentTypeMap });

function sendToGoogleAnalytics(metric) {
  if (window.location.hostname === 'localhost' || typeof gtag !== 'function') {
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
document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach((link) => {
  if (!link.classList.contains('js-schedule-scroll-link')) {
    link.addEventListener('click', function(event) {
      const samePath = location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '');
      const sameHost = location.hostname === this.hostname;

      if (samePath && sameHost) {
        const header = document.querySelector('.header');

        const hashValue = this.hash.slice(1);
        let target =
					document.querySelector(this.hash) || document.querySelector(`[name="${hashValue}"]`) || document.querySelector(`[data-anchor="${hashValue}"]`);

        if (target) {
          const hash = this.href.split('#')[1];
          const { isAuth } = eventsBus.getContent();

          gtag('event', `anchor-link - anchor:${hash}; isAuth:${isAuth}`, {
            event_category: 'anchor-links',
          });

          let offset = 0;
          if (header && header.getBoundingClientRect().top < 0) {
            offset = header.offsetHeight;
          }

          window.scrollTo({
            top: target.getBoundingClientRect().top + window.pageYOffset - offset,
            behavior: 'smooth',
          });

          // Обновляем hash в URL после скролла
          setTimeout(() => {
            location.hash = this.hash;
          }, 400);

          event.preventDefault();
        }
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const heroSwitch = document.querySelector('.hero__switch');
  if (heroSwitch) {
    window.addEventListener('load', function() {
      heroSwitch.classList.add('_swipe');
    });
  }
});

getCLS(sendToGoogleAnalytics);
getFID(sendToGoogleAnalytics);
getLCP(sendToGoogleAnalytics);
getFCP(sendToGoogleAnalytics);
getTTFB(sendToGoogleAnalytics);

/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-css */
import highlightContent from '@focus-reactive/inline-edit';
import { contentTypeMap } from '@focus-reactive/graphql-content-layer/dist/content-type-map';
import reactApp from '@focus-reactive/react-app-layer';
import '@fancyapps/fancybox';

import './components/tabs';
import './components/header';
import scheduleToLocalTime from './components/scheduleToLocalTime';
import { countdown } from './components/countdown';
import { startHashLinksTracking } from './ga/hash-links-tracking';
import svg4everybody from 'svg4everybody';
import msieversion from './components/detectIE';
import pricesScroll from './components/_pricesScroll';
import slider from './components/_slider';
import './components/trackDropdown';
import './components/_faq';
// import './components/_timeTrack';
import noTouch from './components/noTouch';

$(reactApp);

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

scheduleToLocalTime();
countdown();
startHashLinksTracking();

highlightContent({ contentTypeMap });

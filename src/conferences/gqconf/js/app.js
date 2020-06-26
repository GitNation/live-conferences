import highlightContent from '@focus-reactive/inline-edit';
import { contentTypeMap } from '@focus-reactive/graphql-content-layer/dist/content-type-map';
import reactApp from '@focus-reactive/react-app-layer';

import './components/tabs';
import './components/header';
import './components/noticePanel';
import { countdown } from './components/countdown';
import svg4everybody from 'svg4everybody';
import msieversion from './components/detectIE';
import slider from './components/_slider';
import fancypop from './components/_fancybox';
import './components/_faq';
import './components/_timeTrack';
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

if ($('.js-slider')) {
  slider();
}

fancypop();
countdown();

highlightContent({ contentTypeMap });


import 'slick-carousel';
import {TimelineMax} from 'gsap';

const keyLeft = 37;
const keyLRight = 39;
const slider = $('.js-slider-cards');
const speakerPhoto = $('.js-speaker-photo');
const speakerTheme = $('.js-speaker-theme');
const speakerInfo = $('.js-speaker-info');

const tlLeave = new TimelineMax({paused: true})
  .to(speakerInfo, 0.3, {y: '-100%', opacity: '0'})
  .to(speakerTheme, 0.3, {y: '-100%', opacity: '0'}, 0.1)
  .to(speakerPhoto, 0.5, {x: '-100%'}, 0.3)
;

slider.slick({
  infinite: false,
  slidesToShow: 1,
  slidesToScroll: 1,
  dots: false,
  arrows: false,
  rows: 0,
  swipe: false,
  speed: 100
});

function animate(callback) {
  tlLeave.play().addCallback(callback);
  slider.on('afterChange', function() {
    tlLeave.removeCallback(callback).reverse();
  });
}

function cardsPlay() {
  $(document).keydown(function(e) {
    switch(e.keyCode) {
      case keyLeft:
        animate(function() {
          slider.slick('slickPrev');
        });
        break;

      case keyLRight:
        animate(function() {
          slider.slick('slickNext');
        });
        break;

      default: return;
    }
  });
}

export default cardsPlay;

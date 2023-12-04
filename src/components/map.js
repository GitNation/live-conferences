/* eslint-disable jquery/no-html */
/* eslint-disable jquery/no-class */
import { CLASSES } from './_classes';
import Swiper from 'swiper';

export default class GoogleMap {
  constructor() {
    this.wrapper = $(CLASSES.map);
    this.key = this.wrapper.data('key');
    this.center = {
      lat: parseFloat(this.wrapper.data('center-lat')),
      lng: parseFloat(this.wrapper.data('center-lng')),
    };
    this.marker = {
      icon: this.wrapper.data('icon'),
      w: 26,
      h: 36,
    };

    this.pins = $(CLASSES.pin);
    this.mapContent = $(CLASSES.mapContent);
    this.mapTitle = $(CLASSES.mapTitle);

    this._init();
  }

  _init() {
    var map = document.querySelector('.js-map');
    if (map) {
      window.onload = this._loadMapsAPI();
    }
    this._initSlider();
    // this._goTo();
    // this._initMap();
  }

  _initSlider() {
    const self = this;
    this.slider = new Swiper(CLASSES.mapSlider, {
      speed: 400,
      loop: true,
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },

      ally: true,
      autoplay: {
        delay: 6000,
      },

      navigation: {
        nextEl: CLASSES.sliderNext,
        prevEl: CLASSES.sliderPrev,
      },
    });
  }

  _goToPin(index) {
    const active = this.infoBoxes[index].div_;
    this.infoBoxes.forEach((el) => {
      $(el.div_).removeClass(CLASSES.active);
    });
    $(active).addClass(CLASSES.active);
    this.map.panTo(this.markers[index].getPosition());
  }

  _goToSlide(index) {
    this.slider.slideTo(index);
  }
  _goToDescr(index) {
    this.mapContent.removeClass(CLASSES.active);
    $(this.mapContent[index]).addClass(CLASSES.active);
    this.mapTitle.removeClass(CLASSES.active);
    $(this.mapTitle[index]).addClass(CLASSES.active);
  }
  _createScript(url, callback) {
    let script = document.createElement('script');
    if (callback) script.onload = callback;
    script.type = 'text/javascript';
    script.src = url;
    document.body.prepend(script);
  }

  _loadMapsAPI() {
    let self = this;
    this._createScript('https://maps.googleapis.com/maps/api/js?key=' + self.key, function() {
      // https://maps.googleapis.com/maps/api/js?key=AIzaSyA-ZEocFpuybFyJZg92LhWsvIJdo56S34s&amp;callback=initMap
      self._initMap();
    });
  }

  _initMap() {
    // let self = this;
    let zoom;
    if (window.innerWidth > 599) {
      zoom = 15;
    } else {
      zoom = 14;
    }

    this.map = new google.maps.Map(this.wrapper[0], {
      center: { lat: this.center.lat, lng: this.center.lng },
      zoom: zoom,
      disableDefaultUI: true,
      draggable: true,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    this._setStyle();
    this._setMarkers();
  }

  _setStyle() {
    const styles = [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [
          {
            saturation: 36,
          },
          {
            color: '#e44101',
          },
          {
            lightness: 0,
          },
        ],
      },
      {
        featureType: 'all',
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#e4d300',
          },
        ],
      },
      {
        featureType: 'all',
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#e4b300',
          },
          {
            lightness: 0,
          },
        ],
      },
      {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [
          {
            color: '#e4b300',
          },
          {
            lightness: 0,
          },
          {
            weight: 1.2,
          },
        ],
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e4b300',
          },
          {
            lightness: 0,
          },
        ],
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e4b300',
          },
          {
            lightness: 0,
          },
        ],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
          {
            color: '#e4a100',
          },
          {
            lightness: 0,
          },
        ],
      },

      {
        featureType: 'road.arterial',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e4a200',
          },
          {
            lightness: 0,
          },
        ],
      },

      {
        featureType: 'road.local',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e4ce00',
          },
          {
            lightness: 0,
          },
        ],
      },

      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e46101',
          },
          {
            lightness: 0,
          },
        ],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e43e01',
          },
          {
            lightness: 0,
          },
        ],
      },
    ];

    this.map.setOptions({ styles: styles });
  }

  _setMarkers() {
    const self = this;
    this.infoBoxes = [];
    this.markers = [];
    const boxOptions = {
      content: '',
      disableAutoPan: false,
      maxWidth: 0,
      alignBottom: true,
      // pixelOffset: new google.maps.Size(-150, -50),
      zIndex: null,
      closeBoxMargin: '',
      infoBoxClearance: new google.maps.Size(1, 1),
      isHidden: false,
      pane: 'floatPane',
      enableEventPropagation: false,
    };
    const InfoBox = require('./lib/infoBoxMap.js');
    this.pins.each((i, el) => {
      const position = {
        lat: parseFloat(el.dataset.lat),
        lng: parseFloat(el.dataset.lng),
      };
      const marker = new google.maps.Marker({
        position: position,
        map: self.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0,
        },
      });
      const text = $(el).html();

      let infoBoxCustom = new InfoBox(boxOptions);
      self.infoBoxes.push(infoBoxCustom);
      self.markers.push(marker);
      const content = `<div class="pin">${text}</div>`;

      infoBoxCustom.setContent(content);
      infoBoxCustom.open(self.map, marker);
      self._pinClick({ marker, i });
    });
  }

  _pinClick(conf) {
    const self = this;
    setTimeout(() => {
      const el = this.infoBoxes[conf.i].div_;
      $(el).on('click', () => {
        self._goToSlide(conf.i + 1);
      });
    }, 100);
  }
}

import Swiper from 'swiper';
export default function sliderCustom() {
  const sliders = document.querySelectorAll('.swiper-custom');

  sliders.forEach((slider) => {
    const config = getSliderConfig(slider);
    new Swiper(slider, config);
  });
}

function getSliderConfig(slider) {
  return {
    speed: getDataAttribute(slider, 'speed', 600),
    loop: getDataAttribute(slider, 'loop', false),
    slidesPerView: getDataAttribute(slider, 'slides-per-view', 'auto'),
    spaceBetween: getDataAttribute(slider, 'space-between', 24),
    breakpoints: getBreakpoints(slider),
  };
}

function getBreakpoints(slider) {
  const breakpoints = slider.getAttribute('data-breakpoints');

  if (breakpoints) {
    try {
      console.log(JSON.parse(breakpoints));
      return JSON.parse(breakpoints);
    } catch (error) {
      console.error('Ошибка при разборе breakpoints:', error);
    }
  }

  return {};
}

function getDataAttribute(element, attribute, defaultValue) {
  const value = element.getAttribute(`data-${attribute}`);
  return value !== null ? (isNaN(value) ? value : Number(value)) : defaultValue;
}

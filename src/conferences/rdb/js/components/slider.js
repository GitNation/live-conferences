/* global $ */
import 'slick-carousel';

const prevBtn = $('.js-prev-slide');
const nextBtn = $('.js-next-slide');

$('.js-city-slider').slick({
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  dots: false,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 3000,
  rows: 0,
  pauseOnHover: false
});

prevBtn.on('click', function() {
  $('.js-city-slider').slick('slickPrev');
});

nextBtn.on('click', function() {
  $('.js-city-slider').slick('slickNext');
});



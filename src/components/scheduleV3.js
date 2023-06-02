
/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-global-selector */
/* eslint-disable jquery/no-sizzle */
/* eslint-disable jquery/no-css */
/* eslint-disable jquery/no-closest */

if ($('.sv-bodyV3').length > 0) {
  $('.sv-bodyV3').find('.js-navigation-item:first-child').addClass('_active');

}

let isDown = false;
let startX;
let scrollLeft;

$('.js-sv-scroll').on('mousedown', function(e) {
  isDown = true;
  startX = e.pageX - $(this).offset().left;
  scrollLeft = $(this).scrollLeft();
});
$('.js-sv-scroll').on('mouseleave', function() {
  isDown = false;
  $(this).removeClass('active');
});
$('.js-sv-scroll').on('mouseup', function(e) {
  e.preventDefault();
  isDown = false;

  $(this).removeClass('active');
});
$('.js-sv-scroll').on('mousemove', function(e) {
  if (!isDown) return;
  e.preventDefault();

  $(this).addClass('active');
  const x = e.pageX - $(this).offset().left;
  const walk = x - startX; //scroll-fast
  $(this).scrollLeft(scrollLeft - walk);
  $(this)
    .closest('.sv-body__content')
    .find('.sv-nav')
    .scrollLeft(scrollLeft - walk);
});


$('body:not(no-touch) .js-sv-scroll').on('scroll', function(e) {
  if (isRunning) {
    return;
  }
  isRunning = true;
  (function animateScroll() {
    requestAnimationFrame($(this).closest('.sv-body__content').find('.sv-nav').scrollLeft($(this).scrollLeft()));
  });
  isRunning = true;

})();



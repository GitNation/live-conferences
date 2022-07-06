const bgImages = $('.js-lazy-bg');
const lazymages = $('.js-lazy-image');

$(window).on('load', function() {
  bgImages.each(function() {
    const src = $(this).data('src');
    $(this).attr('style', `background-image: url(${src})`);
  });
  lazymages.each(function() {
    const src = $(this).data('src');
    $(this).attr('src', src);
  });
});

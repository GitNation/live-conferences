const accordeonLink = $('.js-accordeon-link');

accordeonLink.on('click', function(e) {
  e.preventDefault();
  const parent = $(this).parents('.js-accordeon');
  const container = $(this).parents('.js-accordeon-container');
  if (parent.hasClass('is-active')) {
    parent.removeClass('is-active');
    parent.find('.js-accordeon-content').slideUp();
  } else {
    container.find('.js-accordeon').removeClass('is-active').find('.js-accordeon-content').slideUp();
    parent.addClass('is-active').find('.js-accordeon-content').slideDown();
  }
});

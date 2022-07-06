const tabLink = $('.js-tab-link');

tabLink.on('click', function(e) {
  e.preventDefault();
  if ($(this).hasClass('is-active')) {
    return;
  } else {
    const tabIndex = $(this).data('tab');
    const parent = $(this).parents('.js-tabs-container');
    parent.find('.js-tab-link').removeClass('is-active');
    parent.find('.js-tab').removeClass('is-active');
    $(this).addClass('is-active');
    parent.find(`.js-tab[data-tab="${tabIndex}"]`).addClass('is-active');
  }
});

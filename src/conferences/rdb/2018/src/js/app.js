import './lib/jquery-ui-1.10.4.custom.min';
import './lib/jq-clipthru.min';
import './components/header';
// import './components/accordeon';
import './components/tabs';
import './components/slider';
import './components/lazy-load';
import cardsPlay from './components/cards';


$(document).ready(function() {
  $('.js-clip').clipthru({
    autoUpdate: true,
    autoUpdateInterval: 30,
    debug: true
  });
});

$('.js-hero').click(function() {
  const el = $('.js-flash'),
    newone = el.clone(true);
  el.before(newone);
  $('.js-flash:last').remove();
});

$('.js-cards') ? cardsPlay() : null;

$('.js-schedule-handler').on('click', (e) => {
  const that = $(e.currentTarget);
  const parent = that.closest('.js-schedule-item');
  const content = parent.find('.js-schedule-content');

  if (content.length) {
    that.toggleClass('is-active');
    content.slideToggle();
  }
});

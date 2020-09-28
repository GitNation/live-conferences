const tabLink = $('.js-tab-link');
const tabClose = $('.js-tab-close');

const switchTab = ($el) => {
  const tabIndex = $el.data('tab');
  const parent = $el.parents('.js-tabs-container');
  parent.find('.js-tab-link').removeClass('is-active');
  parent.find('.js-tab-link').removeClass('is-scroll');
  parent.find('.js-tab').removeClass('is-active');
  $el.addClass('is-active');
  if ($(window).width() < 768) {
    $el.addClass('is-scroll');
    setTimeout(() => {
      $el.removeClass('is-scroll');
    }, 2000);
  }
  const jsTabContainer = parent.find(`.js-tab[data-tab="${tabIndex}"]`);
  jsTabContainer.addClass('is-active');
};

const initiateTabRoute = () => {
  try {
    const hash = location.hash.split('/')[0];

    if (!hash || hash === '#' || hash === '#/') {
      return;
    }

    const tab = $(`.js-tab-link${hash}`);

    if (!tab) {
      return;
    }
    switchTab(tab);
  } catch (err) {
    console.error(err);
  }
};

tabLink.on('click', function(e) {
  if ($(this).hasClass('is-active')) {
    return;
  } else {
    switchTab($(this));

    const id = $(this).attr('id');
    if (id) {
      location.hash = `${id}`;
      window._gauges && window._gauges.push(['track']);
    }
  }
});

tabClose.on('click', function() {
  const parent = $(this).parents('.js-tabs-container');
  parent.find('.js-tab-link').removeClass('is-active');
  parent.find('.js-tab').removeClass('is-active');
});

initiateTabRoute();

const onEvent = ({ type, payload }) => {
  if (type === 'click' && payload.link && payload.link.startsWith('#expo')) {
    const tab = $('.js-tab-link#expo');
    switchTab(tab);
    tab.get(0).scrollIntoView();
  }
};
window.eventsBus && window.eventsBus.subscribe(onEvent);

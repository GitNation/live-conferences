/* eslint-disable jquery/no-find */
/* eslint-disable jquery/no-each */
/* eslint-disable jquery/no-attr */
/* eslint-disable jquery/no-class */
/* eslint-disable jquery/no-parents */
/* eslint-disable jquery/no-data */
/* eslint-disable jquery/no-closest */

const tabLink = $('.js-tab-link');
const tabClose = $('.js-tab-close');

const VIDEO_TRACK_FRAME_ID = 'VIDEO_TRACK_FRAME_ID';

const createFrame = (url) => {
  const result = document.createElement('iframe');

  result.id = VIDEO_TRACK_FRAME_ID;
  result.src = url;
  result.frameBorder = '0';
  result.allow = 'autoplay; fullscreen';
  result.allowFullscreen = true;

  return result;
};

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
  const frameContainer = parent.find(`.broadcast__content[data-name="frame-video-container-${tabIndex}"]`);

  $(`#${VIDEO_TRACK_FRAME_ID}`).remove();
  jsTabContainer.addClass('is-active');
  frameContainer.append(createFrame(frameContainer.data('url')));
};

const initiateTabRoute = () => {
  try {
    const hash = location.hash.split('/')[0];
    let tabFromHash;
    if (hash && $('.js-tab-link[data-href="' + hash + '"]').length) {
      tabFromHash = $('.js-tab-link[data-href="' + hash + '"]');
    }

    if (tabFromHash) {
      switchTab(tabFromHash);
      return;
    }

    // const hash = location.hash.split('/')[0];

    // !TODO looks like we don't use it
    // let tabFromHash;
    // if (hash && document.querySelector(`.js-tab-link${hash}`)) {
    //   tabFromHash = $(`.js-tab-link${hash}`);
    // }

    // if (tabFromHash) {
    //   switchTab(tabFromHash);
    //   return;
    // }

    // if no tab is selected, pick first
    // if (!document.querySelector('.js-tab-link.is-active')) {
    //   switchTab($('.js-tab-link').first());
    // }

    $('.js-tabs-container').each(function() {
      switchTab($(this).find('.js-tab-link').first());
    });
  } catch (err) {
    // Sentry.captureException(err);
    console.error(err);
  }
};

tabLink.on('click', function() {
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

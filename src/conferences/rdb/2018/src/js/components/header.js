import inView from 'in-view';
const header = $('.js-header');
const scrollLink = $('.js-scroll-link');
const section = $('.js-section');
const burger =  $('.js-burger');
const body =  $('body');
$(window).scroll(function() {
  const scrollPos = $(this).scrollTop();

  let sections = [];
  section.each(function() {
    const id = $(this).find('.js-title').attr('id');
    if (scrollPos >= $(this).find('.js-title').offset().top - header.outerHeight() - 51
      && (scrollPos < $(this).find('.js-title').offset().top - header.outerHeight() + $(this).height()) ) {

      sections.push(id);
      if (sections.length === 2) {
        $(`.js-scroll-link[href="#${sections[1]}"]`).addClass('is-active');
        $(`.js-scroll-link[href="#${sections[0]}"]`).removeClass('is-active');
      } else {
        $(`.js-scroll-link[href="#${id}"]`).addClass('is-active');
      }
      
    } else {
      $(`.js-scroll-link[href="#${id}"]`).removeClass('is-active');
    }
  });
  if ($('.js-main-page').length) {
    if ($(this).scrollTop() > 50) {
      header.addClass('is-fixed');
    } else {
      header.removeClass('is-fixed');
    }
  }
});

// inView('.js-section')
//   .on('enter', (el) => {
//     const id = $(el).attr('id');
//     console.log(id);
//     $('.js-scroll-link').removeClass('is-active');
//     $(`.js-scroll-link[href="#${id}"]`).addClass('is-active');
//     console.log(id + ' enter');

//   })
//   .on('exit', (el) => {

//     const id = $(el).attr('id');
//     console.log(id + ' exit');
//     // $('.js-scroll-link').removeClass('is-active');

//     $(`.js-scroll-link[href="#${id}"]`).removeClass('is-active');
//   });

// inView.threshold(0.5);
// inView.offset({
//   top: header.outerHeight(),
//   bottom: 0
// });


scrollLink.on('click', function(e) {
  // e.preventDefault();
  // scrollLink.removeClass('is-active');
  // $(this).addClass('is-active');
  if (burger.hasClass('is-active')) {
    burger.removeClass('is-active');
    header.removeClass('menu-open');
    body.removeClass('is-overflow');
  }
  $('html, body').stop().animate({
    scrollTop: $( $(this).attr('href') ).offset().top - header.outerHeight() - 50
  }, 600);
});

burger.on('click', function() {
  $(this).toggleClass('is-active');
  header.toggleClass('menu-open');
  body.toggleClass('is-overflow');
});

const hashSectionObserver = () => {
  const hash = window.location.hash;
  if (hash) {
    $('html, body').stop().animate({
      scrollTop: ($(hash).offset().top - header.outerHeight() - 50)
    });
  }
};

$(window).on('load', () => {
  hashSectionObserver();
});



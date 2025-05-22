gsap.registerPlugin(ScrollTrigger, SplitText);

// Hero  ===============================
if (document.querySelector('.js-page-main')) {
  const title = document.querySelector('.hero__title');

  const headingLines = new SplitText(title, {
    type: 'lines, words',
    linesClass: 'split-line',
  });

  gsap.set(headingLines.words, {
    yPercent: 100,
    skewY: 10,
    opacity: 0,
  });

  gsap.set('.h-list__item', {
    y: -24,
    opacity: 0,
  });

  gsap.set('.hero__btn', {
    y: 24,
    opacity: 0,
  });

  gsap.set('.hero__partner', {
    opacity: 0,
  });

  const tl = gsap.timeline({ delay: 0.2 });

  tl.to(headingLines.words, {
    duration: 0.2,
    ease: 'circ.out',
    yPercent: 0,
    skewY: 0,
    opacity: 1,
    stagger: 0.15,
    onComplete: () => {
      document.querySelector('.hero__title').classList.add('show-sticky');
    },
  })
    .to(
      '.h-list__item',
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: 'expo.inOut',
      },
      '-=0.3'
    )
    .to(
      '.hero__btn',
      {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: 'expo.inOut',
      },
      '-=0.1'
    )
    .to('.hero__partner', {
      opacity: 1,
      duration: 0.2,
      ease: 'expo.inOut',
    });
}

// Animation section title ==============

const section = document.querySelectorAll('._anim-items');
section.forEach((section) => {
  const title = section.querySelector('.anim-title');
  if (title) {
    const headingLines = new SplitText(title, {
      type: 'lines, words',
      linesClass: 'split-line',
    });

    gsap.from(headingLines.words, {
      scrollTrigger: {
        trigger: title,
        start: 'top 90% ',
        toggleClass: 'is-active',
        toggleActions: 'play none none reverse',
      },
      duration: 0.4,
      ease: 'circ.out',
      yPercent: 100,
      skewY: 10,
      opacity: 0,
      stagger: 0.2,
    });
  }
});

function fade(el, direction = 'up', distance = 60, duration = 0.25, stagger = 0.08, skewY = 4, skewX = 2, scale = 1) {
  if (!document.querySelector(el)) return;

  const axis = direction === 'up' ? 'y' : 'x';

  gsap.set(el, {
    [axis]: distance,
    opacity: 0,
    skewY,
    skewX,
    scale,
  });

  ScrollTrigger.batch(el, {
    start: 'top 90%',
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        [axis]: 0,
        skewY: 0,
        skewX: 0,
        scale: 1,
        duration,
        stagger,
        delay: 0.1,
        overwrite: true,
      });
    },
    onLeaveBack: (batch) => {
      gsap.set(batch, {
        [axis]: distance,
        opacity: 0,
        skewY,
        skewX,
        scale,
        overwrite: true,
      });
    },
  });
}

function addClassOnScroll(el, className) {
  if (!document.querySelector(el)) return;
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 90%',
      end: 'top 70%',
    },
    rotateX: 0,
    opacity: 1,
    ease: 'none',
    onComplete: () => {
      document.querySelector(el).classList.add(className);
    },
  });
}

addClassOnScroll('.status-bar__line', 'is-active');

fade('#committee .speakers-list__item');
fade('#speakers .speakers-list__item');
fade('#mcs .speakers-list__item');
fade('.features-grid__item', 'up', 25, 0.3, 0.2, 0, 0);
fade('.program__item, .full-ticket__item, .bars-list__item', 'up', 40, 0.3, 0.2, 0, 0);
fade('.conference-dates .swiper-slide', 'left', 25, 0.3, 0.15);
fade('.workshops-list__item, .video-rooms__item', 'up', 25, 0.5, 0, 0, 0, 0.9);
fade('.prices-item', 'left', 25, 0.5, 0.15, 0, 0);
fade(
  '.s-prices__button, .tickets-form, ._anim-items .section__text, .section__info, .multipass__desc, .multipass__dd, .party__item',
  'up',
  25,
  0.5,
  0.15,
  0,
  0
);

if (document.querySelector('.location')) {
  const el = document.querySelector('.location');

  gsap.set(el, {
    transformPerspective: 800,
    transformOrigin: 'bottom center',
    rotateX: 20,
    opacity: 0,
  });

  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 90%',
      end: 'top 70%',
      scrub: 0.8,
    },
    rotateX: 0,
    opacity: 1,
    ease: 'none',
  });
}

if (document.querySelector('.js-show-full-programme')) {
  document.querySelector('.js-show-full-programme').addEventListener('click', () => {
    ScrollTrigger.refresh();
  });
}

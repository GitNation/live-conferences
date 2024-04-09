gsap.registerPlugin(ScrollTrigger);

let mm = gsap.matchMedia();

const titleMask = document.querySelectorAll('.title-mask span');

const tlHero = gsap.timeline();

// Hero
mm.add('(min-width: 768px)', () => {
  tlHero
    .from('.hero__top', {
      opacity: 0,
      duration: 0.8,
      ease: Expo.easeInOut,
    })
    .from(
      '.hero__bottom',
      {
        opacity: 0,
        duration: 0.8,
        ease: Expo.easeInOut,
      },
      '-=0.8'
    )
    .from(
      titleMask,
      {
        yPercent: '110',
        duration: 0.8,
        delay: 0,
        ease: Expo.easeInOut,
        stagger: 0.15,
      },
      '-=0.7'
    )

    .from(
      '.hero__left',
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: Expo.easeInOut,
      },
      '-=.8'
    )
    .from(
      '.hero__right',
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: Expo.easeInOut,
      },
      '-=.6'
    )
    .to(
      '.hero__btn .btn:not(.is-hidden):not(.btn--border)',
      {
        scale: 1.1,
        duration: 0.15,
      },
      '+=0.3'
    )
    .to('.hero__btn .btn--border:not(.is-hidden)', {
      scale: 1.1,
      duration: 0.15,
    })
    .to('.hero__btn .btn:not(.is-hidden):not(.btn--border)', {
      scale: 1,
      duration: 0.15,
    })
    .to('.hero__btn .btn--border:not(.is-hidden)', {
      scale: 1,
      duration: 0.15,
    });
});

// Event
gsap.to('#event', {
  backgroundPosition: `100% ${-innerHeight / 1.2}px`,
  ease: 'none',
  scrollTrigger: {
    trigger: '#event',
    scrub: true,
    start: 'top 80%',
    end: 'bottom 30%',
  },
});

function titlesAnimation(event) {
  gsap.from(event.lines, {
    yPercent: '110',
    duration: 0.8,
    delay: 0,
    ease: Expo.easeInOut,
    stagger: 0.15,
  });
}

var tlEvent = gsap.timeline();

function debounce(func) {
  var timer;
  return function (event) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, 100, event);
  };
}

// Animation section title ==============

const sections = document.querySelectorAll('._anim-items');
sections.forEach((section) => {
  const heading = section.querySelector('[data-title]');
  if (heading) {
    gsap.to(heading, {
      scrollTrigger: {
        trigger: section,
        // markers: true,
        start: 'top 80% ',
        toggleClass: 'is-active',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          let mySplitText = new SplitType(heading, { types: 'lines' });
          titlesAnimation(mySplitText.lines);
        },
      },
    });
  }
});

window.addEventListener(
  'resize',
  debounce(function (e) {
    mySplitText = new SplitType('.event__title p', { types: 'lines' });
  })
);

// tlEvent.from(mySplitText.lines, {
//   duration: 0.2,
//   opacity: 0,

//   y: 20,
//   stagger: 0.02,
// });

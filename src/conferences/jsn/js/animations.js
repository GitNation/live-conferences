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
      '-=0.6'
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
      '-=1'
    )

    .from(
      '.hero__left',
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: Expo.easeInOut,
      },
      '-=1.2'
    )
    .from(
      '.hero__right',
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: Expo.easeInOut,
      },
      '-=1'
    )
    .to(
      '.hero__btn .btn:not(.is-hidden):not(.btn--border)',
      {
        scale: 1.1,
        duration: 0.15,
      },
      '+=0.5'
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

var tlEvent = gsap.timeline();
const mySplitText = new SplitType('.event__title p');

tlEvent.from(mySplitText.lines, {
  duration: 0.8,
  opacity: 0,

  y: 80,
  stagger: 0.1,
});

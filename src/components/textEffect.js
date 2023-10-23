import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const processed = [];

const textEffect = (event) => {
  let iteration = 0;

  const interval = setInterval(() => {
    event.innerText = event.innerText
      .split('')
      .map((letter, index) => {
        if (index < iteration) {
          return event.dataset.title[index];
        }

        return letters[Math.floor(Math.random() * 26)];
      })
      .join('');

    if (iteration >= event.dataset.title.length) {
      clearInterval(interval);
      processed.push(event.innerText);
    }

    iteration += 1;
  }, 75);
};

const sections = document.querySelectorAll('._anim-items');

sections.forEach((section) => {
  const heading = section.querySelector('[data-title]');
  gsap.to(heading, {
    scrollTrigger: {
      trigger: section,
      // markers: true,
      start: 'top 90% ',
      toggleClass: 'is-active',
      toggleActions: 'restart none none none',
    },
    onComplete: () => {
      textEffect(heading);
    },
  });
});

// committee

gsap.fromTo(
  '#committee .speakers-list__item',
  { y: 90, opacity: 0 },
  {
    scrollTrigger: {
      trigger: '#committee .speakers-list',
      start: 'top 85%',
      end: 'bottom bottom-=100',
      scrub: 1.5,
    },
    y: 0,
    opacity: 1,
    stagger: 0.1,
  }
);

// speakers

gsap.fromTo(
  '#speakers .speakers-list__item',
  { y: 90, opacity: 0 },
  {
    scrollTrigger: {
      trigger: '#speakers .speakers-list ',
      start: 'top 85%',
      end: 'bottom bottom-=100',
      scrub: 1.5,
    },
    y: 0,
    opacity: 1,
    stagger: 0.1,
  }
);

// artists
gsap.fromTo(
  '#artists .artists-list__item',
  { y: 90, opacity: 0 },
  {
    scrollTrigger: {
      trigger: '#artists .artists-list',
      start: 'top 85%',
      end: 'bottom bottom-=100',
      scrub: 1.5,
    },
    y: 0,
    opacity: 1,
    stagger: 0.1,
  }
);

const numbers = document.querySelectorAll('.numbers__val');
gsap.from(numbers, {
  scrollTrigger: {
    trigger: '#numbers',
    start: 'top 85%',
    end: 'bottom bottom-=100',
  },
  textContent: 0,
  duration: 1,
  snap: { textContent: 1 },
});

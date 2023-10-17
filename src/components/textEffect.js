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
  gsap.from(heading, {
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

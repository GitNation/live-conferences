gsap.registerPlugin(ScrollTrigger);
let mm = gsap.matchMedia();
const tlMenu = gsap.timeline({ paused: true });

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const processed = [];
const main = document.querySelector('.main');
const header = document.querySelector('.header');
const body = document.querySelector('body');
const burger = document.querySelector('.burger');

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
      toggleActions: 'play none none none',
    },
    onComplete: () => {
      textEffect(heading);
    },
  });
});

// committee
function speakersAnimation(el) {
  gsap.set(el, {
    y: 110,
    opacity: 0,
    ease: Power3.easeIn,
  });
  ScrollTrigger.batch(el, {
    onEnter: (batch) => {
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.2,
      });
    },
  });
}
speakersAnimation('#committee .speakers-list__item');
speakersAnimation('#speakers .speakers-list__item');
speakersAnimation('#artists .artists-list__item');

// Numbers

const numbers = document.querySelectorAll('.numbers');
numbers.forEach((number) => {
  const val = number.querySelector('.numbers__val');
  const title = number.querySelector('.numbers__title');
  const text = number.querySelector('.numbers__text');
  const button = number.querySelector('.numbers__btn');

  const tlNembers = gsap.timeline({
    scrollTrigger: {
      trigger: number,
      start: 'top 100%-=100px',
    },
  });

  tlNembers
    .from(val, {
      innerText: 0,
      duration: 0.5,
      snap: { innerText: 1 },
    })
    .fromTo(
      title,
      {
        clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)',
      },
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 1.5,
      },
      '-=0.2'
    )
    .from(
      text,
      {
        y: 20,
        opacity: 0,
        duration: 0.4,
      },
      '-=1'
    )
    .from(
      button,
      {
        y: 20,
        opacity: 0,
        duration: 0.4,
      },
      '-=0.5'
    );
});

// menu
const navOverlay = () => {
  if (!tlMenu.reversed()) {
    main.classList.add('blur');
    header.classList.add('is-open');
    body.classList.add('is-no-scroll');
  } else {
    main.classList.remove('blur');
    header.classList.remove('is-open');
    body.classList.remove('is-no-scroll');
  }
};

const burgerToggle = () => {
  if (!tlMenu.reversed()) {
    burger.classList.add('is-active');
  } else {
    burger.classList.remove('is-active');
  }
};

function animateOpenNav() {
  gsap.set('.drop-nav__link span', {
    width: '0',
  });
  gsap.set('#drop-nav', {
    x: '100%',
  });
  tlMenu
    .add(navOverlay)
    .to('#drop-nav', {
      duration: 0.3,
      ease: 'power3.out',
      x: 0,
    })
    .add(burgerToggle)
    .to('.drop-nav__link span', {
      width: '100%',
      duration: 0.7,
      stagger: 0.1,
    })
    .reverse();
}

animateOpenNav();

burger.onclick = function (e) {
  tlMenu.reversed(!tlMenu.reversed());
};

mm.add('(max-width: 767px)', () => {
  gsap.set('#drop-nav .social', {
    opacity: 0,
    y: 20,
  });
  tlMenu.to(
    '#drop-nav .social',
    {
      opacity: 1,
      y: 0,
    },
    '-=0.5'
  );
});

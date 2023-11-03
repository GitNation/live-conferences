gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(TextPlugin);
let mm = gsap.matchMedia();

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const processed = [];
const main = document.querySelector('.main');
const header = document.querySelector('.header');
const body = document.querySelector('body');
const burger = document.querySelector('.burger');
const socialAnimations = {
  x: -24,
  opacity: 0,
  duration: 0.15,
  stagger: 0.1,
};

// loader ===============================
const tlLoader = gsap.timeline();
addEventListener('load', (event) => {
  tlLoader
    .to('.loader__slide', {
      yPercent: 100,
      stagger: 0.25,
      duration: 0.3,
    })
    .to(
      '.loader__slide',
      {
        yPercent: 200,
        stagger: 0.25,
        duration: 0.3,
      },
      '-=0.1'
    )
    .fromTo(
      '.loader__logo',
      {
        opacity: 0,
        y: -160,
      },
      {
        opacity: 1,
        duration: 0.5,
        y: 0,
      }
    )
    .set('.loader__slide', {
      yPercent: -100,
    })
    .to('.loader__logo', {
      opacity: 0,
      y: 160,
      duration: 0.5,
      delay: 0.6,
    })
    .to(
      '.loader',
      {
        opacity: 0,
        duration: 0.5,
      },
      '-=0.3'
    )
    .to(
      '.loader',
      {
        display: 'none',
        duration: 0,
      },
      '-=0.3'
    )
    .fromTo(
      '.hero__title',
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
      },
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 0.5,
      },
      '-=0.2'
    )
    .fromTo(
      '.hero__suptitle',
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
      },
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 0.3,
      }
    )
    .fromTo(
      '.header',
      {
        yPercent: -100,
      },
      {
        yPercent: 0,
        duration: 0.3,
      },
      '-=0.2'
    )
    .fromTo(
      '.hero__btn',
      {
        y: 200,
      },
      {
        y: 0,
        duration: 0.3,
      }
    )
    .from('.hero__bottom .social__item', {
      ...socialAnimations,
    });
});

// Animation section title ==============
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
addEventListener('load', (event) => {
  sections.forEach((section) => {
    const heading = section.querySelector('[data-title]');
    gsap.to(heading, {
      scrollTrigger: {
        trigger: section,
        // markers: true,
        start: 'top 80% ',
        toggleClass: 'is-active',
        toggleActions: 'play none none none',
        onEnter: () => {
          textEffect(heading);
        },
      },
    });
  });
});

// committee ============================
function speakersAnimation(el) {
  gsap.set(el, {
    y: 110,
    opacity: 0,
  });
  ScrollTrigger.batch(el, {
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        overwrite: true,
      });
    },

    onLeaveBack: (batch) => {
      gsap.set(batch, {
        y: 110,
        opacity: 0,
        overwrite: true,
      });
    },
  });

  ScrollTrigger.addEventListener('refreshInit', () => gsap.set(el, { y: 0, opacity: 0 }));
}
speakersAnimation('#committee .speakers-list__item');
speakersAnimation('#speakers .speakers-list__item');
speakersAnimation('#artists .artists-list__item');
speakersAnimation('.features-grid__item');

// Numbers ==============================

const numbers = document.querySelectorAll('.numbers');
numbers.forEach((number) => {
  const val = number.querySelector('.numbers__val');
  const title = number.querySelector('.numbers__title span');
  const text = number.querySelector('.numbers__text');
  const button = number.querySelector('.numbers__btn');

  const tlNembers = gsap.timeline({
    scrollTrigger: {
      trigger: number,
      start: 'top 100%-=100px',
      toggleActions: 'play none none reverse',
    },
  });
  tlNembers
    .from(val, {
      innerText: 0,
      duration: 0.8,
      snap: { innerText: 1 },
    })
    .from(title, { duration: 1, text: '' }, '-=0.5')
    .from(
      text,
      {
        y: 20,
        opacity: 0,
        duration: 0.4,
      },
      '-=0.5'
    )
    .from(button, {
      y: 20,
      opacity: 0,
      duration: 0.4,
    });
});

// menu =================================
const tlMenu = gsap.timeline({ paused: true });
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

// contacts form =========================
const tlContactForm = gsap.timeline({
  scrollTrigger: {
    trigger: '.contact-form__field',
    start: 'top 90% ',
    toggleActions: 'play none none reverse',
  },
});
tlContactForm
  .from('.contact-form__input', {
    x: 80,
    opacity: 0,
    duration: 0.3,
    delay: 0.1,
  })
  .fromTo(
    '.contact-form__submit',
    {
      clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
    },
    {
      duration: 0.4,
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    }
  )
  .from('.contact-form__submit span', {
    duration: 0.3,
    text: '',
  })

  .from(
    '.contact-form .social__item',
    {
      ...socialAnimations,
    },
    '-=0.2'
  );

// Loaction =============================

const tlLocation = gsap.timeline({
  scrollTrigger: {
    trigger: '.location__animation',
    start: 'top 90%',
    toggleActions: 'play none none reverse',
  },
});
tlLocation
  .fromTo(
    '.location__btn .btn',
    {
      clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
    },
    {
      duration: 0.1,
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    }
  )
  .from(
    '.location__btn .btn span',
    {
      duration: 0.4,
      text: '',
    },
    '+=0.3'
  );

gsap.from('.location__slider', {
  scrollTrigger: {
    trigger: '.location__slider',
    start: 'top-=300 bottom',
    end: '50% 80%',
    scrub: 0.5,
  },
  y: 50,
  opacity: 0,
  scale: 0.75,
});

// For Boss =============================
const tlForBoss = gsap.timeline({
  scrollTrigger: {
    trigger: '.for-boss__btn',
    start: 'top 90%',
    toggleActions: 'play none none reverse',
  },
});
tlForBoss
  .fromTo(
    '.for-boss__btn',
    {
      clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
    },
    {
      duration: 0.1,
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    }
  )
  .from(
    '.for-boss__btn span',
    {
      duration: 0.4,
      text: '',
    },
    '+=0.3'
  );

// Giving Back =============================

const tlGivingBack = gsap.timeline({
  scrollTrigger: {
    trigger: '.giving-back__btns',
    start: 'top 90%',
    toggleActions: 'play none none reverse',
  },
});
tlGivingBack
  .fromTo(
    '.giving-back__btns .btn',
    {
      clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
    },
    {
      duration: 0.1,
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    }
  )
  .from(
    '.giving-back__btns .btn span',
    {
      duration: 0.4,
      text: '',
    },
    '+=0.3'
  );

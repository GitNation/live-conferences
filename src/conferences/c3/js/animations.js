gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(TextPlugin);

let mm = gsap.matchMedia();

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const processed = [];
const heroVideo = document.querySelector('.hero__video');
const socialAnimations = {
  x: -24,
  opacity: 0,
  duration: 0.15,
  stagger: 0.1,
  ease: Expo.easeInOut,
};

if (heroVideo) heroVideo.pause();

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

// Animation Text On Hover ==============
const textWithEffect = document.querySelectorAll('[data-title]:not(.section__title)');
textWithEffect.forEach((item) => {
  item.addEventListener('mouseenter', function () {
    textEffect(this);
  });
});

if (document.querySelector('.js-page-main')) {
  // loader ===============================
  gsap.set('.loader__slogan span', {
    yPercent: 60,
  });
  gsap.set('.loader__logo img:nth-child(1)', {
    xPercent: 50,
  });
  gsap.set('.loader__logo img:nth-child(2)', {
    xPercent: -50,
  });

  function initLoader() {
    const tlLoader = gsap.timeline();
    tlLoader
      .to('.loader__logo', {
        opacity: 1,
        scale: 1,
        duration: 0.3,
      })

      .to('.loader__logo img:nth-child(1)', {
        xPercent: 0,
        duration: 0.4,
      })
      .to(
        '.loader__logo img:nth-child(2)',
        {
          xPercent: 0,
          duration: 0.4,
        },
        '-=0.4'
      )
      .to('.loader__slogan span', {
        yPercent: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.2,
      })
      .to('.loader__inner', {
        overflow: 'hidden',
        duration: 0,
      })
      .to('.loader__logo', {
        yPercent: -120,
        duration: 1,
        ease: Expo.easeInOut,
      })
      .to(
        '.loader__slide',
        {
          yPercent: -100,
          duration: 1,
          stagger: 0.07,
          ease: Expo.easeInOut,
        },
        '-=1'
      )
      .call(
        function () {
          heroVideoPlay();
        },
        null,
        '-=0.9'
      )
      .call(
        function () {
          initHeroLoad();
        },
        null,
        '-=0.9'
      );
  }
  addEventListener('load', () => {
    initLoader();
  });

  // Hero  ===============================

  gsap.set('.hero__btn .btn', {
    yPercent: 200,
  });

  function initHeroLoad() {
    if (document.querySelector('.hero__title')) {
      const tl = gsap.timeline();

      tl.to('.hero__btn .btn', {
        yPercent: 0,
        duration: 0.4,
        stagger: 0.06,
      }).from(
        '.hero__title',
        {
          duration: 1.6,
          text: '',
          ease: 'none',
          onComplete: () => {
            document.querySelector('.hero__title').classList.add('blink');
          },
        },
        '-=0.6'
      );
    }
  }

  function heroVideoPlay() {
    if (heroVideo) heroVideo.play();
  }
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
          textEffect(heading);
        },
      },
    });
  }
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

if (document.querySelector('#committee')) speakersAnimation('#committee .speakers-list__item');
if (document.querySelector('#speakers')) speakersAnimation('#speakers .speakers-list__item');
if (document.querySelector('#artists')) speakersAnimation('#artists .artists-list__item');
if (document.querySelector('.features-grid')) speakersAnimation('.features-grid__item');

// Numbers ==============================

const numbers = document.querySelectorAll('.numbers');
numbers.forEach((number) => {
  const val = number.querySelector('.numbers__val');
  const tlNembers = gsap.timeline({
    scrollTrigger: {
      trigger: number,
      start: 'top 100%-=100px',
      toggleActions: 'play none none reverse',
    },
  });
  tlNembers.from(val, {
    innerText: 0,
    duration: 0.8,
    snap: { innerText: 1 },
  });
});

// contacts form =========================

if (document.querySelector('.contact-form')) {
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

    .from(
      '.contact-form .social__item',
      {
        ...socialAnimations,
      },
      '-=0.2'
    );
}
// Loaction =============================
if (document.querySelector('.location__slider')) {
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
}

// Footer =============================
if (document.querySelector('.footer__main')) {
  const tlFooter = gsap.timeline({
    scrollTrigger: {
      trigger: '.footer__main',
      start: 'top 90%',
      toggleActions: 'play none none reverse',
    },
  });

  tlFooter.from('.footer__main > *  ', {
    y: 80,
    opacity: 0,
    duration: 0.4,
    stagger: 0.2,
  });
}

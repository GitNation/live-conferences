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
const textWithEffect = document.querySelectorAll('a[data-parent-title], button[data-parent-title]');
textWithEffect.forEach((item) => {
  item.addEventListener('mouseenter', function () {
    textEffect(this.querySelector('[data-title]'));
  });
});

if (document.querySelector('.js-page-main')) {
  // loader ===============================
  gsap.set('.loader__slogan span', {
    yPercent: 60,
  });
  gsap.set('.loader__logo-1', {
    xPercent: 50,
  });
  gsap.set('.loader__logo-2', {
    xPercent: -50,
  });

  mm.add('(min-width: 768px)', () => {
    const tlLoader = gsap.timeline();
    tlLoader
      .to('.loader__logo-1', {
        duration: 0.1,
        display: 'block',
      })
      .to(
        '.loader__logo-2',
        {
          duration: 0.1,
          display: 'block',
        },
        '-=0.1'
      )
      .to('.loader__logo-1', {
        xPercent: 0,
        duration: 0.3,
      })
      .to(
        '.loader__logo-2',
        {
          xPercent: 0,
          duration: 0.3,
        },
        '-=0.3'
      )
      .to('.loader__slogan span', {
        yPercent: 0,
        opacity: 1,
        duration: 0.1,
        stagger: 0.1,
      })
      .to('.loader__inner', {
        overflow: 'hidden',
        duration: 0,
      })
      .to('.loader__logo', {
        yPercent: -120,
        duration: 0.7,
        ease: Expo.easeInOut,
      })
      .to(
        '.loader__slide',
        {
          yPercent: -100,
          duration: 0.5,
          stagger: 0.06,
          ease: Expo.easeInOut,
        },
        '-=0.6'
      )
      .call(
        function () {
          heroVideoPlay();
        },
        null,
        '-=0.4'
      )
      .call(
        function () {
          initHeroLoad();
        },
        null,
        '-=0.4'
      );
  });

  // Hero  ===============================
  mm.add('(min-width: 768px)', () => {
    gsap.set('.hero__btn .btn', {
      yPercent: 200,
    });
  });

  function initHeroLoad() {
    if (document.querySelector('.hero__title')) {
      const tl = gsap.timeline();
      tl.to('.hero__btn .btn', {
        yPercent: 0,
        duration: 0.2,
        stagger: 0.06,
      });
      // .from(
      //   '.hero__title .tagline',
      //   {
      //     duration: 1.4,
      //     text: { value: '' },
      //     ease: 'none',
      //   },
      //   '-=0.2'
      // )
      // .from('.hero__title .tagline__update-word', {
      //   duration: 0.3,
      //   text: {
      //     value: '',
      //   },
      //   onComplete: () => {
      //     document.querySelector('.hero__title').classList.add('blink');
      //   },
      // })
      // .to(
      //   '.hero__title .tagline__update-word',
      //   {
      //     duration: 0.6,
      //     text: {
      //       value: '',
      //       rtl: true,
      //     },
      //   },
      //   '+=2'
      // )
      // .to('.hero__title .tagline__update-word', {
      //   duration: 0.6,
      //   text: {
      //     value: document.querySelector('.hero__title .tagline__update-word').dataset.updateTitle,
      //   },
      // });
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
function fadeUp(el, y = 110, duration = 0.6, stagger = 0.2) {
  gsap.set(el, {
    y: y,
    opacity: 0,
  });
  ScrollTrigger.batch(el, {
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: duration,
        stagger: stagger,
        overwrite: true,
      });
    },

    onLeaveBack: (batch) => {
      gsap.set(batch, {
        y: y,
        opacity: 0,
        overwrite: true,
      });
    },
  });

  ScrollTrigger.addEventListener('refreshInit', () => gsap.set(el, { y: 0, opacity: 0 }));
}

if (document.querySelector('#committee')) fadeUp('#committee .speakers-list__item');
if (document.querySelector('#speakers')) fadeUp('#speakers .speakers-list__item');
if (document.querySelector('#artists')) fadeUp('#artists .artists-list__item');
if (document.querySelector('.features-grid')) fadeUp('.features-grid__item');
if (document.querySelector('.numbers-grid')) fadeUp('.numbers__text span', 50, 0.3, 0.1);

// Numbers ==============================

mm.add('(min-width: 768px)', () => {
  const numberCover = document.querySelector('.numbers-grid__item--cover');
  const prevNumberCover = numberCover.previousElementSibling.querySelector('.numbers__text');

  gsap.set(numberCover, {
    opacity: 0,
    xPercent: 20,
  });

  const tlNembers = gsap.timeline({
    scrollTrigger: {
      trigger: numberCover,
      start: 'top 20%',
      toggleActions: 'play none none reverse',
    },
  });
  tlNembers
    .to(prevNumberCover, {
      opacity: 0,
      duration: 0.2,
    })
    .to(
      numberCover,
      {
        opacity: 1,
        duration: 0.25,
        xPercent: 0,
      },
      '-=0.2'
    );
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

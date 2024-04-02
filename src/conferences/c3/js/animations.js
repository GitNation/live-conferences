gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(TextPlugin);

let mm = gsap.matchMedia();

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const processed = [];
const heroVideo = document.querySelector('.hero__video video');
const socialAnimations = {
  x: -24,
  opacity: 0,
  duration: 0.15,
  stagger: 0.1,
  ease: Expo.easeInOut,
};

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

// Hero  ===============================
if (document.querySelector('.js-page-main')) {
  // mm.add('(min-width: 768px)', () => {
  //   gsap.set('.hero__btn .btn', {
  //     yPercent: 200,
  //   });
  // });
  mm.add('(min-width: 768px)', () => {});

  if (document.querySelector('.hero__title--main')) {
    const tl = gsap.timeline();
    tl.to('.hero__title--main ', {
      duration: 0,
      display: 'block',
    })
      .from('.hero__title--main .tagline', {
        duration: 1.4,
        text: { value: '' },
        ease: 'none',
      })
      .from('.hero__title--main .tagline__update-word', {
        duration: 0.3,
        text: {
          value: '',
        },
        onComplete: () => {
          document.querySelector('.hero__title').classList.add('blink');
        },
      })
      .to(
        '.hero__title--main .tagline__update-word',
        {
          duration: 0.6,
          text: {
            value: '',
            rtl: true,
          },
        },
        '+=12'
      )
      .to('.hero__title--main .tagline__update-word', {
        duration: 0.6,
        text: {
          value: document.querySelector('.hero__title .tagline__update-word').dataset.updateTitle,
        },
      });
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
function fadeUp(el, y = 110, duration = 0.4, stagger = 0.1) {
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
if (document.querySelector('#mcs')) fadeUp('#mcs .speakers-list__item');
if (document.querySelector('#artists')) fadeUp('#artists .artists-list__item');
if (document.querySelector('.features-grid')) fadeUp('.features-grid__item');
if (document.querySelector('.numbers-grid')) fadeUp('.numbers__text span', 50, 0.3, 0.1);

// Numbers ==============================

mm.add('(min-width: 768px)', () => {
  const numberCover = document.querySelector('.numbers-grid__item--cover');
  const prevNumberCover = document.querySelector('.numbers-grid__item:first-child .numbers__right');

  gsap.set(numberCover, {
    opacity: 0,
    xPercent: 20,
    pointerEvents: 'none',
  });

  const tlNumbers = gsap.timeline({
    scrollTrigger: {
      trigger: numberCover,
      start: 'top 20%',
      toggleActions: 'play none none reverse',
    },
  });
  tlNumbers
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
        pointerEvents: 'auto',
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

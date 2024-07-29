gsap.registerPlugin(ScrollTrigger);

function toggleClass(selector, className, delay) {
  const items = document.querySelectorAll(selector);
  let index = items.length - 1;

  return items.length
    ? setInterval(() => {
        items[index].classList.remove(className);
        index = -~index % items.length;
        items[index].classList.add(className);
      }, delay)
    : null;
}

if (document.querySelector('.hero__subtitle')) {
  toggleClass('.hero__subtitle > div', 'is-active', 1600);
}
const heroFaq = document.querySelector('.js-bg-animation');
if (heroFaq) {
  const tlNumbers = gsap.timeline({
    scrollTrigger: {
      trigger: document.querySelector('.hero_faq'),
      start: 'top 20%',
      end: 'bottom 10%',
      toggleActions: 'play none none reverse',
      scrub: 1,
    },
  });
  tlNumbers.from(heroFaq, {
    duration: 1,
    yPercent: 45,
  });
}

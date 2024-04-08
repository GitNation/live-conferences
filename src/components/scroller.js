const scroller = document.querySelector('.js-scroller');

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && scroller && scroller.querySelectorAll('li').length > 7) {
  addAnimation();
}
function addAnimation() {
  scroller.setAttribute('data-animated', true);

  const scrollerInner = scroller.querySelector('ul');
  const scrollerContent = [...scroller.querySelectorAll('li')];

  scrollerContent.forEach((item) => {
    const duplicatedItem = item.cloneNode(true);
    duplicatedItem.setAttribute('aria-hidden', true);
    scrollerInner.appendChild(duplicatedItem);
  });
}

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

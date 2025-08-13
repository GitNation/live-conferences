const closeButtons = document.querySelectorAll('.js-local-close');
const panels = document.querySelectorAll('[data-local-name]');

closeButtons.forEach((button) => {
  button.addEventListener('click', function() {
    const panel = button.closest('.js-local-block');
    if (!panel) return;

    panel.classList.add('hide');
    const localStorageName = panel.dataset.localName;
    localStorage.setItem(localStorageName, 'true');
  });
});

panels.forEach((panel) => {
  const localName = panel.dataset.localName;
  const storedValue = localStorage.getItem(localName);
  if (storedValue && storedValue !== '') {
    panel.classList.add('hide');
  }
});

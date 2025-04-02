export default function showFullProgramme() {
  const button = document.querySelector('.js-show-full-programme');
  const sections = document.querySelectorAll('#speakers, #past-speakers, #mcs, #committee');
  const speakers = document.querySelectorAll('#speakers .speakers-list__item');

  if (!button) return;

  button.addEventListener('click', () => {
    sections.forEach((section) => section.classList.remove('hide-sm'));
    speakers.forEach((item) => item.classList.remove('hide-sm'));
    button.closest('.s-speakers__button').style.setProperty('display', 'none');
  });
}

import { CLASSES } from './_classes';

const updateButtonVisibility = () => {
	const button = document.querySelector('.js-header-btn-sticky');
	const hero = document.querySelector('#hero');
	const tickets = document.querySelector('#tickets');

	if (!button || !hero) return;

	const windowHeight = window.innerHeight;
	const heroPassed = hero.getBoundingClientRect().bottom <= windowHeight / 2;
	const ticketsVisible = tickets && (() => {
		const { top, bottom } = tickets.getBoundingClientRect();
		return top < windowHeight && bottom > 0;
	})();

	button.classList.toggle(CLASSES.visible, heroPassed && !ticketsVisible);
};

window.addEventListener('scroll', updateButtonVisibility);
window.addEventListener('load', updateButtonVisibility);

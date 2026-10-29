const hero = document.querySelector('.js-hero');

if (hero) {
	hero.addEventListener('click', () => {
		const flash = hero.querySelector('.js-flash');
		if (flash) flash.replaceWith(flash.cloneNode(true));
	});
}

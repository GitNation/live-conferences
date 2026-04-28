import Swiper from 'swiper';
import { CLASSES } from './_classes';

var pricesSwiper = new Swiper('.prices-swiper .swiper-container', {
	slidesPerView: 'auto',
	spaceBetween: 24,
	loop: false,
	speed: 500,
	initialSlide: 0,
	watchOverflow: true,
	observer: true,
	observeParents: true,
	centerInsufficientSlides: true,
	threshold: 12,
	navigation: {
		nextEl: '.prices-swiper__next',
		prevEl: '.prices-swiper__prev',
	},
	pagination: {
		el: '.prices-swiper__pagination',
	},
	breakpoints: {
		100: { spaceBetween: 12 },
		600: { spaceBetween: 24 },
	},
});

export default function pricesSlider() {}

function updateBuyLinks(button) {
	var link = button.dataset.pricesFilterLink;
	document.querySelectorAll('.s-prices__button a:not(.js-direct-link)').forEach(function(a) {
		a.setAttribute('href', link);
	});
}

function filterByCategory(category) {
	document.querySelectorAll('[data-prices-filter]').forEach(function(el) {
		if (el.dataset.pricesFilter !== '') {
			el.classList.add('hidden');
		}
	});
	document.querySelectorAll('[data-prices-filter="' + category + '"]').forEach(function(el) {
		el.classList.remove('hidden');
	});
}

function initSortButtons() {
	var sortBtns = document.querySelectorAll('.js-prices-sort-btn');
	var activeBtn = document.querySelector('.js-prices-sort-btn.' + CLASSES.active);

	if (activeBtn) {
		updateBuyLinks(activeBtn);
	}

	sortBtns.forEach(function(btn) {
		btn.addEventListener('click', function() {
			sortBtns.forEach(function(b) { b.classList.remove(CLASSES.active); });
			btn.classList.add(CLASSES.active);

			filterByCategory(btn.dataset.pricesFilterBtn);
			updateBuyLinks(btn);

			pricesSwiper.updateSlides();
			pricesSwiper.slideTo(0, 0, false);
		});
	});
}

function initDescriptionToggles() {
	document.querySelectorAll('.js-prices-toggle').forEach(function(toggle) {
		toggle.addEventListener('click', function() {
			var pricesItem = toggle.closest('.prices-item');
			var description = pricesItem && pricesItem.querySelector('.js-prices-description');
			if (description) {
				description.classList.toggle(CLASSES.active);
			}
		});
	});
}

function initShortItems() {
	document.querySelectorAll('.js-prices-content').forEach(function(content) {
		var showItems = parseInt(content.dataset.showItems, 10);
		if (content.querySelectorAll('li').length > showItems) {
			var pricesItem = content.closest('.prices-item');
			if (pricesItem) pricesItem.classList.add('prices-item--short');
		}
	});
}

export function priceFilter() {
	initSortButtons();
	initDescriptionToggles();
	initShortItems();
}

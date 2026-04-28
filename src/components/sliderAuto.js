import Swiper from 'swiper';
export default function sliderAuto() {
	const sliders = document.querySelectorAll('.js-slider-auto');
	sliders.forEach((slider) => {
		const userConfig = JSON.parse(slider.dataset.config || '{}');
		const parent = slider.parentElement;

		new Swiper(slider, {
			slidesPerView: 'auto',
			spaceBetween: 20,
			loop: false,
			threshold: 12,
			watchOverflow: true,
			navigation: {
				nextEl: parent ? parent.querySelector('.swiper-auto-button-next') : '.swiper-auto-button-next',
				prevEl: parent ? parent.querySelector('.swiper-auto-button-prev') : '.swiper-auto-button-prev',
			},
			pagination: {
				clickable: true,
				el: parent ? parent.querySelector('.swiper-auto-pagination') : '.swiper-auto-pagination',
			},
			...userConfig,
		});
	});
}

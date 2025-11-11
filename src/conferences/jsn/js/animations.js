gsap.registerPlugin(TextPlugin);

let mm = gsap.matchMedia();

// Hero  ===============================

if (document.querySelector('.hero__title--main')) {
	const element = document.querySelector('.hero__title--main .tagline__update-word');
	const words = element.dataset.updateTitle.split(',').map((word) => word.trim());
	let currentIndex = 0;

	function animateWords() {
		const tl = gsap.timeline({
			onComplete: () => {
				currentIndex = (currentIndex + 1) % words.length;
				animateWords();
			},
		});

		tl.to({}, { duration: 2 });

		tl.to(element, {
			duration: 0.6,
			text: {
				value: '',
				rtl: true,
			},
		});

		const nextIndex = (currentIndex + 1) % words.length;
		tl.to(element, {
			duration: 0.6,
			text: {
				value: words[nextIndex],
			},
		});
	}

	animateWords();
}

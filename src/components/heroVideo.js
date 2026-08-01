const container = document.querySelector('.js-hero-video');

if (container && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
	const insert = () =>
		container.insertAdjacentHTML(
			'afterbegin',
			`<video muted autoplay loop playsinline>
				<source src="video/hero.mp4" type="video/mp4" />
			</video>`
		);

	// idle time comes right after the first paint, unlike window.load
	if ('requestIdleCallback' in window) {
		requestIdleCallback(insert, { timeout: 3000 });
	} else {
		addEventListener('load', insert);
	}
}

// Conference-specific code for jsn. Plain script, copied to the build as is and
// loaded with `defer`, so the DOM is ready by the time it runs.

// ===== Hero title typewriter ==================================================
// Markup comes from the CMS, so we rely on the data attribute only: any element
// with [data-update-title="One, Two, Three"] cycles through those words.

(function typewriter() {
	const HOLD = 2000;
	const ERASE = 600;
	const TYPE = 600;

	const element = document.querySelector('[data-update-title]');
	const words = (element ? element.dataset.updateTitle : '')
		.split(',')
		.map((word) => word.trim())
		.filter(Boolean);

	// nothing to cycle through with a single word
	if (words.length < 2) return;

	let currentIndex = 0;

	// plays `steps` steps over `duration` ms, synced to the browser's frames
	const tween = (steps, duration, onStep, onDone) => {
		let start = null;
		let lastStep = -1;

		const frame = (now) => {
			if (start === null) start = now;

			const progress = Math.min((now - start) / duration, 1);
			const step = Math.round(progress * steps);

			// repaint only when the number of visible letters changes
			if (step !== lastStep) {
				lastStep = step;
				onStep(step);
			}

			if (progress < 1) {
				requestAnimationFrame(frame);
			} else {
				onDone();
			}
		};

		requestAnimationFrame(frame);
	};

	const animateWords = () => {
		setTimeout(() => {
			const current = words[currentIndex];
			currentIndex = (currentIndex + 1) % words.length;
			const next = words[currentIndex];

			// erase the current word right to left, then type the next one
			tween(
				current.length,
				ERASE,
				(step) => {
					element.textContent = current.slice(0, current.length - step);
				},
				() =>
					tween(
						next.length,
						TYPE,
						(step) => {
							element.textContent = next.slice(0, step);
						},
						animateWords
					)
			);
		}, HOLD);
	};

	animateWords();
})();

// ===== Hero background video ==================================================
// The file comes from the CMS via data-video-src, with the bundled one as fallback.

(function heroVideo() {
	const container = document.querySelector('.js-hero-video');
	if (!container || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	const src = container.dataset.videoSrc || 'video/hero.mp4';
	const insert = () =>
		container.insertAdjacentHTML(
			'afterbegin',
			`<video muted autoplay loop playsinline>
				<source src="${src}" type="video/mp4" />
			</video>`
		);

	// idle time comes right after the first paint, unlike window.load
	if ('requestIdleCallback' in window) {
		requestIdleCallback(insert, { timeout: 3000 });
	} else {
		addEventListener('load', insert);
	}
})();

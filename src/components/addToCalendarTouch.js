// add-to-calendar-button opens its modal on touchend even after a scroll gesture
document.querySelectorAll('.sv-item add-to-calendar-button.add-to-calendar').forEach((btn) => {
	let moved = false;
	btn.addEventListener('touchstart', () => (moved = false), { passive: true });
	btn.addEventListener('touchmove', () => (moved = true), { passive: true });
	btn.addEventListener('touchend', (e) => moved && e.stopPropagation(), true);
});

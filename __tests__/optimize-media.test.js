const { optimizeMedia } = require('../gulp/util/optimizeMedia');

const ORIGIN = 'https://cms.example.com';
const BLOB = 'https://store.public.blob.vercel-storage.com';

const optimized = (url, width) => `${ORIGIN}/_next/image?${new URLSearchParams({ url, w: String(width), q: '75' })}`;

describe('optimizeMedia', () => {
	it('resizes a huge photo down to the widest allowed width', () => {
		const media = { url: `${BLOB}/hall.webp`, mimeType: 'image/webp', width: 7459 };
		optimizeMedia(media, ORIGIN);
		expect(media.url).toBe(optimized(`${BLOB}/hall.webp`, 1920));
	});

	it('rounds a smaller photo up to the next allowed width', () => {
		const media = { url: `${BLOB}/avatar.webp`, mimeType: 'image/webp', width: 300 };
		optimizeMedia(media, ORIGIN);
		expect(media.url).toBe(optimized(`${BLOB}/avatar.webp`, 384));
	});

	it('finds media at any depth, in arrays and groups', () => {
		const content = { pages: { main: { sections: [{ items: [{ image: { url: `${BLOB}/a.webp`, mimeType: 'image/webp', width: 1000 } }] }] } } };
		optimizeMedia(content, ORIGIN);
		expect(content.pages.main.sections[0].items[0].image.url).toBe(optimized(`${BLOB}/a.webp`, 1080));
	});

	it('leaves SVG, video, other hosts and plain links alone', () => {
		const content = {
			logo: { url: `${BLOB}/logo.svg`, mimeType: 'image/svg+xml', width: 120 },
			hero: { url: `${BLOB}/hero.mp4`, mimeType: 'video/mp4' },
			speaker: { url: 'https://res.cloudinary.com/x/image/upload/a.jpg', mimeType: 'image/jpeg', width: 500 },
			button: { url: 'https://ti.to/gitnation', label: 'Tickets' },
		};
		const before = JSON.parse(JSON.stringify(content));
		optimizeMedia(content, ORIGIN);
		expect(content).toEqual(before);
	});

	it('falls back to the widest allowed width when the size is unknown', () => {
		const media = { url: `${BLOB}/no-size.webp`, mimeType: 'image/webp' };
		optimizeMedia(media, ORIGIN);
		expect(media.url).toBe(optimized(`${BLOB}/no-size.webp`, 1920));
	});
});

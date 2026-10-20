// Next's default `deviceSizes` and `imageSizes`, capped at 1920: the CMS answers 400 to any other width.
const WIDTHS = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920];
// The only quality Next allows unless the CMS lists more in `images.qualities`.
const QUALITY = 75;

const BLOB_URL = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//;

// Next refuses to optimize SVG, and a video is not an image.
const isRaster = (media) => typeof media.mimeType === 'string' && media.mimeType.startsWith('image/') && media.mimeType !== 'image/svg+xml';

const isOptimizable = (node) => typeof node.url === 'string' && isRaster(node) && BLOB_URL.test(node.url);

const widthFor = (width) => WIDTHS.find((allowed) => allowed >= width) || WIDTHS[WIDTHS.length - 1];

const optimizedUrl = (origin, { url, width }) =>
	`${origin}/_next/image?${new URLSearchParams({ url, w: String(widthFor(width || Infinity)), q: String(QUALITY) })}`;

const optimizeMedia = (node, origin) => {
	if (Array.isArray(node)) return node.forEach((item) => optimizeMedia(item, origin));
	if (!node || typeof node !== 'object') return;
	if (isOptimizable(node)) node.url = optimizedUrl(origin, node);
	Object.values(node).forEach((value) => optimizeMedia(value, origin));
};

module.exports = { optimizeMedia };

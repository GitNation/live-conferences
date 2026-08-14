import { slugForKey } from './pageKeys';

// Where a page can be looked at. The site is the static Gulp build served by
// browser-sync (`yarn start:jsn` → :8080), which serves clean urls, so
// "schedule-offline" is /schedule-offline and "index" is /.
const PREVIEW_BASE = process.env.PAYLOAD_PREVIEW_URL || 'http://localhost:8080';

export const pageUrl = (data: { key?: string; slug?: string } | undefined): string => {
  const slug = data?.slug || (data?.key ? slugForKey(data.key) : '');
  return slug && slug !== 'index' ? `${PREVIEW_BASE}/${slug}` : PREVIEW_BASE;
};

// Iframe sizes for the live preview toolbar.
export const previewBreakpoints = [
  { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
  { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
  { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
];

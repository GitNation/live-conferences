// The one shared registry of pages a conference can have — same list for every
// conference, matching the `pageKey` front matter in src/conferences/*/templates/.
// To allow a new page across all conferences, add a line here and the admin select
// picks it up. Content managers cannot invent keys outside this list.
//
// `slug` is spelled out only where the page url differs from the key itself — the
// same four exceptions as the mappings in gulp/config.js. Everything else uses its
// key, so there is nothing to keep in sync beyond this one row per page.
// The order of this list is also the order pages are listed in, everywhere: the
// `order` field on Pages is the index of the key here, so a conference's pages
// read main, FAQ, checkout, schedule … no matter when each one was created.
export const PAGES = [
  { key: 'main', label: 'Main', slug: 'index' },
  { key: 'faq', label: 'FAQ' },
  { key: 'checkout', label: 'Checkout' },
  { key: 'schedule', label: 'Schedule', slug: 'schedule-offline' },
  { key: 'workshops', label: 'Workshops' },
  { key: 'workshops_alt', label: 'Remote workshops', slug: 'remote-workshops' },
  { key: 'preEvent', label: 'Pre-event', slug: 'pre-event' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'perks', label: 'Perks' },
  { key: 'teams', label: 'Teams' },
];

export const PAGE_KEYS = PAGES.map(({ key, label }) => ({ label, value: key }));

export const orderForKey = (key?: string | null) => {
  const index = PAGES.findIndex((page) => page.key === key);
  return index === -1 ? PAGES.length : index;
};

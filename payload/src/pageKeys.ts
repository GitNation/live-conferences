// The one shared registry of pages a conference can have — same list for every
// conference, matching the `pageKey` front matter in src/conferences/*/templates/.
// To allow a new page across all conferences, add its key here (one line) and the
// admin select picks it up. Content managers cannot invent keys outside this list.
export const PAGE_KEYS = [
  'main',
  'schedule',
  'workshops',
  'workshops_alt',
  'jobs',
  'faq',
  'perks',
  'checkout',
  'teams',
  'preEvent',
];

// Keys whose page url differs from the key itself (mirrors the mappings in
// gulp/config.js). Everything else uses its key as the slug.
const SLUG_OVERRIDES: Record<string, string> = {
  main: 'index',
  preEvent: 'pre-event',
  workshops_alt: 'remote-workshops',
  schedule: 'schedule-offline',
};

export const slugForKey = (key: string): string => SLUG_OVERRIDES[key] || key;

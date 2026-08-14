import type { Field, Tab } from 'payload';

// A length-limited SEO field with a progress bar under the input showing how
// many characters are left.
const limited = (name: string, type: 'text' | 'textarea', max: number): Field =>
  ({
    name,
    type,
    maxLength: max,
    admin: {
      components: {
        afterInput: [
          { path: '@/components/CharCounterBar#CharCounterBar', clientProps: { max } },
        ],
      },
    },
  }) as Field;

// The SEO tab every page gets — the text meta the templates render:
// <title>/og:title, description/og:description, keywords. og:image and
// canonical/og:url stay hardcoded in code (front matter) for now.
export const seoTab: Tab = {
  name: 'seo',
  label: 'SEO',
  fields: [
    // Search engines truncate beyond ~60/~160 chars.
    limited('title', 'text', 60),
    limited('description', 'textarea', 160),
    limited('keywords', 'text', 255),
  ],
};

import type { Block } from 'payload';
import { simpleRichText } from '../fields/richText';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// Newsletter signup. The social icons under the heading are the brand's
// socials, so they are not repeated here.
export const FollowUs: Block = {
  slug: 'followUs',
  interfaceName: 'FollowUsBlock',
  labels: { singular: 'Follow us', plural: 'Follow us sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      { name: 'title', type: 'text' },
      simpleRichText('description'),
      { name: 'buttonLabel', type: 'text', defaultValue: 'Subscribe' },
    ],
  }),
};

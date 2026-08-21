import type { Block } from 'payload';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// Deep dives: a heading and a list of topic cards, each with a paragraph and a
// bullet list of the talks/workshops covering it.
//
// Same deal as Techs — page-level section or nested into another section's
// `blocks` slot.
export const DeepDives: Block = {
  slug: 'deepDives',
  interfaceName: 'DeepDivesBlock',
  labels: { singular: 'Deep dives', plural: 'Deep dive sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
      nested: true,
      content: [
        { name: 'title', type: 'text' },
        simpleRichText('description'),
        {
          name: 'items',
          type: 'array',
          labels: { singular: 'Topic', plural: 'Topics' },
          admin: rowLabel('Topic'),
          fields: [
            { name: 'title', type: 'text', required: true },
            simpleRichText('description'),
            // "To be covered in:" plus the talks — a bullet list, so rich text.
            simpleRichText('list'),
          ],
        },
      ],
  }),
};

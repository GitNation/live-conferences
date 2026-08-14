import type { Block } from 'payload';
import { DeepDives } from './DeepDives';
import { Techs } from './Techs';
import { simpleRichText } from '../fields/richText';
import { rowLabel } from '../fields/rowLabel';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';
import { uniqueBlocks } from '../fields/uniqueBlocks';

// "What the event is" section: a quote-style label, the pitch, the date cards,
// and a slot for nested sections.
//
// In Hygraph this was one Section with techs/dates as nested components. Dates
// stay part of the section; sections that some conferences show inside Event and
// others show on their own (techs, deep dives) go into `blocks` — the very same
// block definitions are also available at page level.
// Review and hackathon are not here: they are going to be shared across
// conferences and get their own home later.
export const Event: Block = {
  slug: 'event',
  interfaceName: 'EventBlock',
  labels: { singular: 'Event', plural: 'Event sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
      content: [
        {
          // Small line above the title, e.g. "– Cambridge Dictionary".
          name: 'label',
          type: 'text',
        },
        { name: 'title', type: 'text' },
        simpleRichText('description'),
        {
          // Date cards under the section.
          name: 'dates',
          type: 'array',
          labels: { singular: 'Date', plural: 'Dates' },
          admin: rowLabel('Date'),
          fields: [
            { name: 'date', type: 'text' },
            { name: 'title', type: 'text' },
            simpleRichText('description'),
            { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          // Sections nested inside this one.
          name: 'blocks',
          type: 'blocks',
          blocks: [Techs, DeepDives],
          validate: uniqueBlocks,
        },
      ],
  }),
};

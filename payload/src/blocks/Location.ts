import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// The venue: logo, pitch, postal address with a map link, and a slider of
// photos of the place.
export const Location: Block = {
  slug: 'location',
  interfaceName: 'LocationBlock',
  labels: { singular: 'Location', plural: 'Location sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      { name: 'title', type: 'text' },
      simpleRichText('description'),
      { name: 'logo', type: 'upload', relationTo: 'media' },
      simpleRichText('address'),
      {
        name: 'buttons',
        type: 'array',
        maxRows: 2,
        labels: { singular: 'Button', plural: 'Buttons' },
        admin: rowLabel('Button'),
        fields: button(),
      },
      {
        name: 'slides',
        type: 'array',
        labels: { singular: 'Photo', plural: 'Photos' },
        admin: rowLabel('Photo'),
        fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
      },
    ],
  }),
};

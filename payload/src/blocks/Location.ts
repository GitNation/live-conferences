import type { Block } from 'payload';
import { button } from '@/fields/buttonFields';
import { simpleRichText } from '@/fields/richTextField';
import { rowLabel } from '@/fields/rowLabel';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

// Two layouts exist in the wild and they show different things, so the choice
// sits on the Style tab and the fields it does not use stay hidden:
//
//   slider — logo above the text, photos of the venue underneath (jsn)
//   map    — text beside a map, a video of the place below it (rsus)
//
// Title, description, address and buttons are in both.
const isSlider = (_: unknown, siblingData: Record<string, unknown>) => (siblingData?.layout ?? 'slider') === 'slider';
const isMap = (_: unknown, siblingData: Record<string, unknown>) => siblingData?.layout === 'map';

export const Location: Block = {
  slug: 'location',
  interfaceName: 'LocationBlock',
  labels: { singular: 'Location', plural: 'Location sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
    content: [
      { name: 'title', type: 'text' },
      ...simpleRichText('description'),
      { name: 'logo', type: 'upload', relationTo: 'media', admin: { condition: isSlider } },
      ...simpleRichText('address'),
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
        admin: { condition: isSlider, ...rowLabel('Photo') },
        fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
      },
      { name: 'map', type: 'upload', relationTo: 'media', admin: { condition: isMap } },
      {
        name: 'video',
        type: 'group',
        admin: { condition: isMap },
        fields: [
          { name: 'poster', type: 'upload', relationTo: 'media' },
          { name: 'youtubeId', type: 'text' },
        ],
      },
    ],
    style: [
      {
        name: 'layout',
        type: 'select',
        options: [
          { label: 'Photo slider', value: 'slider' },
          { label: 'Map and video', value: 'map' },
        ],
        defaultValue: 'slider',
      },
    ],
  }),
};

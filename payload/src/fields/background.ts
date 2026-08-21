import type { Field } from 'payload';

// The Style tab every section gets: an optional background asset (image or
// video, from the background/image and background/video folders), a black or
// white overlay on top of it, and how much vertical room the section takes.
const hasBackground = (_: unknown, siblingData: Record<string, unknown>) => !!siblingData?.background;

export const background = (): Field => ({
  name: 'background',
  type: 'upload',
  relationTo: 'media',
});

export const sectionStyleFields = (): Field[] => [
  background(),
  {
    // Nothing to tint without a background, so the field stays hidden. Left
    // empty it means no overlay at all.
    name: 'overlay',
    type: 'select',
    options: [
      { label: 'Black', value: 'black' },
      { label: 'White', value: 'white' },
    ],
    defaultValue: 'black',
    admin: { condition: hasBackground },
  },
  {
    name: 'overlayOpacity',
    type: 'number',
    label: 'Overlay opacity (%)',
    defaultValue: 50,
    min: 0,
    max: 100,
    admin: {
      step: 10,
      condition: (data, siblingData) => hasBackground(data, siblingData) && !!siblingData?.overlay,
    },
  },
  {
    name: 'paddingY',
    type: 'select',
    label: 'Vertical padding',
    options: [
      { label: 'Base', value: 'base' },
      { label: 'Large', value: 'large' },
    ],
    defaultValue: 'base',
  },
];

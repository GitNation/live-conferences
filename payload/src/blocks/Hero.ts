import type { Block, Field } from 'payload';
import { button } from '../fields/button';
import { simpleRichText } from '../fields/richText';
import { rowLabel } from '../fields/rowLabel';
import { sectionAdmin, sectionTabs } from '../fields/sectionTabs';

// The full hero, modelled directly — no Section/customData wrapper like Hygraph:
// stats and switch are first-class fields instead of a JSON blob.
//
// Buttons are grouped by conference phase (Hygraph encoded this as magic string
// keys like "daysBefore__main"); the client-side JS still does the switching by
// conference state — the partial maps each phase to its js-class. Hygraph's dead
// `afterConf__*` buttons (never rendered) have no equivalent on purpose.
const phaseButtons = (name: string, label: string): Field => ({
  name,
  type: 'array',
  label,
  maxRows: 2,
  labels: { singular: 'Button', plural: 'Buttons' },
  admin: rowLabel('Button'),
  fields: button(),
});

// City toggle (e.g. Amsterdam <-> New York): two labels and one url — the side
// that is NOT active links to the other edition, the active one is plain text.
const switchGroup = (): Field => ({
  name: 'switch',
  type: 'group',
  fields: [
    { name: 'leftLabel', type: 'text' },
    { name: 'rightLabel', type: 'text' },
    { name: 'url', type: 'text' },
    // Off -> left side is this site, on -> right side is.
    { name: 'rightIsActive', type: 'checkbox', defaultValue: false },
  ],
});

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Hero sections' },
  admin: sectionAdmin,
  fields: sectionTabs({
      content: [
        { name: 'title', type: 'text', required: true },
        { name: 'date', type: 'text' },
        simpleRichText('description'),
        {
          name: 'stats',
          type: 'array',
          labels: { singular: 'Stat', plural: 'Stats' },
          admin: rowLabel('Stat'),
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'description', type: 'text', required: true },
          ],
        },
        {
          name: 'buttons',
          type: 'group',
          fields: [
            phaseButtons('default', 'Before the conference (default)'),
            phaseButtons('daysBefore', 'Conference days, before start'),
            phaseButtons('during', 'While live'),
            phaseButtons('weekAfter', 'Week after'),
          ],
        },
        switchGroup(),
      ],
  }),
};

import type { Field } from 'payload';

// Reusable button, defined once — every schema that needs buttons composes this
// factory instead of re-writing the fields (mirrors link/linkGroup in
// focusreactive.com-front). No icon/size options on purpose.
// Callers that render a fixed-style button (the header CTA) turn the extra
// fields off.
// `required: false` is for a button that lives in a group rather than an array
// row: the group always exists, so a required label would block saving a card
// that simply has no button.
type ButtonOptions = {
  variant?: boolean;
  openInNewTab?: boolean;
  required?: boolean;
  extraFields?: Field[];
};

export const button = ({
  variant = true,
  openInNewTab = true,
  required = true,
  extraFields = [],
}: ButtonOptions = {}): Field[] => [
  { name: 'label', type: 'text', required },
  { name: 'url', type: 'text' },
  ...(variant
    ? ([
        {
          name: 'variant',
          type: 'select',
          options: [
            { label: 'Solid (primary)', value: 'solid' },
            { label: 'Outline (secondary)', value: 'outline' },
          ],
          defaultValue: 'solid',
          required: true,
        },
      ] as Field[])
    : []),
  ...(openInNewTab
    ? ([{ name: 'openInNewTab', type: 'checkbox', defaultValue: false }] as Field[])
    : []),
  ...extraFields,
];

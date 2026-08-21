// Every array field gets this so collapsed rows read as "01. Tech - Claude Code"
// instead of "Item 01". The label is what one row is called.
//
// `labelFrom` is for rows that are not all the same thing: the named select on
// the row replaces the static label, so a row reads "01. CFP" not "01. Card".
// `labels` maps the stored values to what the select shows.
//
// Same component as a section header (see sectionAdmin) — Payload just takes it
// under a different key for arrays than for blocks.
type RowLabelOptions = {
  labelFrom?: string;
  labels?: Record<string, string>;
};

export const rowLabel = (label: string, options: RowLabelOptions = {}) => ({
  components: {
    RowLabel: { path: '@/components/CollapsedLabel#CollapsedLabel', clientProps: { label, ...options } },
  },
});

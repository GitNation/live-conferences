// Every array field gets this so collapsed rows read as "01. Tech - Claude Code"
// instead of "Item 01". The label is what one row is called.
export const rowLabel = (label: string) => ({
  components: {
    RowLabel: { path: '@/components/RowLabel#RowLabel', clientProps: { label } },
  },
});

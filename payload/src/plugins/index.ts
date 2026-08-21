import type { Plugin } from 'payload';
import { presetsPlugin } from '@focus-reactive/payload-plugin-presets';
import { admin, authenticated } from '@/access';

// Block presets: "save this section's field values under a name", then pick the
// name when adding the same section elsewhere. The plugin finds the blocks
// itself — it walks every collection and rewrites the blocks fields it meets, so
// nothing in src/blocks or Pages has to know about it.
export const plugins: Plugin[] = [
  presetsPlugin({
    labels: { singular: 'Preset', plural: 'Presets' },
    overrides: {
      access: {
        create: authenticated,
        read: authenticated,
        update: authenticated,
        delete: admin,
      },
      admin: { group: 'System', defaultColumns: ['name', 'preview', 'updatedAt'] },
    },
  }),
];

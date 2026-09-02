import type { Plugin } from 'payload';
import { presetsPlugin } from '@focus-reactive/payload-plugin-presets';
import { authenticated, editor } from '@/access';
import { mcpPluginConfig } from '@/plugins/mcp';

// Block presets: "save this section's field values under a name", then pick the
// name when adding the same section elsewhere. The plugin finds the blocks
// itself — it walks every collection and rewrites the blocks fields it meets, so
// nothing in src/blocks or Pages has to know about it.
export const plugins: Plugin[] = [
  presetsPlugin({
    labels: { singular: 'Preset', plural: 'Presets' },
    overrides: {
      access: {
        create: editor,
        read: authenticated,
        update: editor,
        delete: editor,
      },
      admin: { group: 'System', defaultColumns: ['name', 'preview', 'updatedAt'] },
    },
  }),
  // Serves /api/mcp: the collections and globals an agent may read and write,
  // and the capabilities it gets. Registered last — it reads the config the
  // plugins above have already assembled.
  mcpPluginConfig,
];

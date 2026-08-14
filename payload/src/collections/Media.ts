import path from 'path';
import { fileURLToPath } from 'url';
import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Assets (images + video). Folders are enabled so editors organize files into
// background/video and background/image etc. — folders are admin-side content,
// not code.
export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
		create: authenticated,
		delete: authenticated,
		read: anyone,
		update: authenticated,
	},
  // Relationships to media only need these — no point shipping every column
  // of every asset with each page fetch. `filename` has to be in the list even
  // though templates never read it: `url` is derived from it, and without it
  // every populated asset comes back with url: null.
  defaultPopulate: { alt: true, filename: true, height: true, mimeType: true, url: true, width: true },
  admin: { group: 'Assets' },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [{ name: 'alt', type: 'text' }],
};

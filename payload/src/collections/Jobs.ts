import type { CollectionConfig } from 'payload';
import { anyone, editor } from '@/access';
import { simpleRichText } from '@/fields/richTextField';

// Openings from partner companies. One entry per posting, written once and
// attached to whichever jobs page shows it — the same partner runs across
// editions and across the sibling conferences of a season.
export const Jobs: CollectionConfig = {
	slug: 'jobs',
	access: {
		create: editor,
		delete: editor,
		read: anyone,
		update: editor,
	},
	admin: {
		group: 'Content',
		useAsTitle: 'title',
		defaultColumns: ['title', 'url', 'updatedAt'],
	},
	fields: [
		{ name: 'title', type: 'text', required: true },
		{ name: 'image', type: 'upload', relationTo: 'media' },
		...simpleRichText('description'),
		{ name: 'url', type: 'text' },
	],
};

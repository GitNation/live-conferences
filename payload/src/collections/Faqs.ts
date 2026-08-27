import type { CollectionConfig } from 'payload';
import { anyone, editor } from '@/access';
import { simpleRichText } from '@/fields/richTextField';

// A shared library of questions and answers. The same "what does a ticket
// include" is asked every edition, so an entry is written once here and attached
// to whichever page needs it. The grouping is authored on the page, not here —
// the same question can sit under a different heading elsewhere.
export const Faqs: CollectionConfig = {
	slug: 'faqs',
	access: {
		create: editor,
		delete: editor,
		read: anyone,
		update: editor,
	},
	admin: {
		group: 'Content',
		useAsTitle: 'question',
		defaultColumns: ['question', 'updatedAt'],
	},
	fields: [{ name: 'question', type: 'text', required: true }, ...simpleRichText('answer')],
};

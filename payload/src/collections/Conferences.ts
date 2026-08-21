import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '@/access';
import { EVENT_YEARS } from '@/constants/eventYears';
import { footerFields } from '@/fields/footerFields';
import { headerFields } from '@/fields/headerFields';
import { deleteConferencePages } from '@/hooks/deleteConferencePages';
import { duplicateConferencePages } from '@/hooks/duplicateConferencePages';

// One edition of a brand — "JSNation 2027". Mirrors Hygraph's ConferenceEvent.
// A brand has many of these; (brand + eventYear) is what the build selects on,
// the same pair Hygraph uses as conferenceTitle + eventYear.
//
// Header and footer are named tabs: same field set for every conference (see
// fields/headerFields.ts and fields/footerFields.ts), own data per edition,
// stored as `header.*` / `footer.*`.
export const Conferences: CollectionConfig = {
	slug: 'conferences',
	// Public read for the build fetch; writes stay admin-only.
	access: {
		create: authenticated,
		delete: authenticated,
		read: anyone,
		update: authenticated,
	},
	admin: {
		group: 'Conferences',
		useAsTitle: 'title',
		defaultColumns: ['title', 'brand', 'eventYear', 'createdAt', 'updatedAt', 'lastEditedBy'],
	},
	hooks: {
		// Payload tracks *when* a document changed but not by whom outside
		// versions, so the editor is stamped on every save.
		beforeChange: [({ data, req }) => ({ ...data, lastEditedBy: req.user?.id ?? data.lastEditedBy })],
		afterChange: [duplicateConferencePages],
		beforeDelete: [deleteConferencePages],
	},
	fields: [
		{
			name: 'lastEditedBy',
			type: 'relationship',
			relationTo: 'users',
			// Written by the hook above, never chosen by hand — so the form shows
			// the person (avatar + name) instead of a relationship picker, and the
			// list cell renders the same.
			admin: {
				position: 'sidebar',
				components: {
					Cell: {
						path: '@/components/UserBadge#UserBadge',
						// Table rows are short — the sidebar keeps the bigger default.
						clientProps: { size: 24 },
					},
					Field: '@/components/LastEditedBy#LastEditedBy',
				},
			},
		},
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Conference',
					fields: [
						{
							name: 'brand',
							type: 'relationship',
							relationTo: 'brands',
							required: true,
							index: true,
						},
						{
							name: 'title',
							type: 'text',
							required: true,
							// Marks a copy in the list, so it is obvious which row was
							// duplicated and still needs renaming.
							hooks: { beforeDuplicate: [({ value }) => (value ? `${value} copy` : value)] },
						},

						{
							// Year selector, e.g. "Y2027" — same value as conference-settings.js.
							name: 'eventYear',
							type: 'select',
							options: EVENT_YEARS,
							required: true,
							index: true,
						},
						{
							// When this edition runs. Date + time, used for the phase switching
							// the hero buttons rely on. `width` only takes effect inside a row.
							type: 'row',
							fields: [
								{
									name: 'startTime',
									type: 'date',
									admin: {
										date: { pickerAppearance: 'dayAndTime', timeFormat: 'HH:mm' },
										width: '50%',
									},
								},
								{
									name: 'endTime',
									type: 'date',
									admin: {
										date: { pickerAppearance: 'dayAndTime', timeFormat: 'HH:mm' },
										width: '50%',
									},
								},
							],
						},
						{
							// EMS (ems.gitnation.org) event id — speakers, schedule, workshops
							// etc. are pulled from there and merged over the CMS data. Numeric,
							// and one EMS event maps to exactly one edition.
							name: 'emsEventId',
							type: 'number',
							unique: true,
							min: 1,
							admin: { step: 1 },
							// Duplicating a conference is how a new edition starts, and the
							// copy belongs to a different EMS event — carrying the id over
							// would just fail the unique check. Cleared instead.
							hooks: { beforeDuplicate: [() => null] },
						},
						{
							name: 'useEmsData',
							type: 'checkbox',
							defaultValue: false,
						},
						{
							// How many speakers are still unannounced — the line-up renders
							// that many placeholder cards after the real ones.
							name: 'tbaSpeakersNumber',
							type: 'number',
							min: 0,
							admin: { step: 1 },
						},
						{
							// Turns the "Call for speakers" button on while the CFP is open.
							name: 'openForTalks',
							type: 'checkbox',
							defaultValue: false,
						},
						{
							// Virtual (no DB column): shows this edition's pages inside the
							// conference view, with inline create — so pages are managed per
							// conference, not hunted down in the global Pages list.
							name: 'pages',
							type: 'join',
							collection: 'pages',
							on: 'conference',
							admin: { defaultColumns: ['key', 'slug', 'updatedAt'] },
						},
					],
				},
				{
					name: 'header',
					label: 'Header',
					fields: headerFields(),
				},
				{
					name: 'footer',
					label: 'Footer',
					fields: footerFields(),
				},
			],
		},
	],
};

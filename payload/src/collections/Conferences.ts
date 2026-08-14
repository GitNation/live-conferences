import type { CollectionConfig } from 'payload';
import { anyone, authenticated } from '../access';
import { EVENT_YEARS } from '../eventYears';
import { footerFields, headerFields } from '../fields/layout';

// One edition of a brand — "JSNation 2027". Mirrors Hygraph's ConferenceEvent.
// A brand has many of these; (brand + eventYear) is what the build selects on,
// the same pair Hygraph uses as conferenceTitle + eventYear.
//
// Header and footer are named tabs: same field set for every conference (see
// fields/layout.ts), own data per edition, stored as `header.*` / `footer.*`.
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
		defaultColumns: ['title', 'brand', 'eventYear'],
	},
	fields: [
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
						},
						{
							name: 'useEmsData',
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

import type { CollectionConfig } from 'payload';
import { anyone, editor } from '@/access';
import { EVENT_YEARS } from '@/constants/eventYears';
import { footerFields } from '@/fields/footerFields';
import { headerFields } from '@/fields/headerFields';
import { settingsFields } from '@/fields/settingsFields';
import { deleteConferencePages } from '@/hooks/deleteConferencePages';
import { duplicateConferencePages } from '@/hooks/duplicateConferencePages';

export const Conferences: CollectionConfig = {
	slug: 'conferences',

	access: {
		create: editor,
		delete: editor,
		read: anyone,
		update: editor,
	},
	admin: {
		group: 'Conferences',
		useAsTitle: 'title',
		defaultColumns: ['title', 'brand', 'eventYear', 'createdAt', 'updatedAt', 'lastEditedBy'],
	},
	hooks: {
		beforeChange: [({ data, req }) => ({ ...data, lastEditedBy: req.user?.id ?? data.lastEditedBy })],
		afterChange: [duplicateConferencePages],
		beforeDelete: [deleteConferencePages],
	},
	fields: [
		{
			name: 'lastEditedBy',
			type: 'relationship',
			relationTo: 'users',

			admin: {
				position: 'sidebar',
				components: {
					Cell: {
						path: '@/components/UserBadge#UserBadge',

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

							hooks: { beforeDuplicate: [({ value }) => (value ? `${value} copy` : value)] },
						},

						{
							name: 'eventYear',
							type: 'select',
							options: EVENT_YEARS,
							required: true,
							index: true,
						},
						{
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
							name: 'emsEventId',
							type: 'number',
							unique: true,
							min: 1,
							admin: { step: 1 },

							hooks: { beforeDuplicate: [() => null] },
						},
						{
							name: 'useEmsData',
							type: 'checkbox',
							defaultValue: false,
						},
						{
							name: 'tbaSpeakersNumber',
							type: 'number',
							min: 0,
							admin: { step: 1 },
						},
						{
							name: 'openForTalks',
							type: 'checkbox',
							defaultValue: false,
						},
						{
							name: 'pages',
							type: 'join',
							collection: 'pages',
							on: 'conference',
							defaultSort: 'order',
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
				{
					name: 'settings',
					label: 'Settings',
					fields: settingsFields(),
				},
			],
		},
	],
};

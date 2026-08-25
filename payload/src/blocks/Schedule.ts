import type { Block } from 'payload';
import { sectionAdmin, sectionTabs } from '@/fields/sectionTabs';

export const Schedule: Block = {
	slug: 'schedule',
	interfaceName: 'ScheduleBlock',
	labels: { singular: 'Schedule', plural: 'Schedule sections' },
	admin: sectionAdmin,
	fields: sectionTabs({
		style: false,
		content: [
			{ name: 'title', type: 'text' },
			{
				name: 'description',
				type: 'text',
			},
			{
				name: 'tips',
				type: 'group',
				fields: [
					{ name: 'remote', type: 'text' },
					{ name: 'inPerson', type: 'text' },
				],
			},
		],
		tabs: [
			{
				label: 'Settings',
				fields: [
					{ name: 'remoteSwitch', type: 'checkbox', label: 'Show the remote / in-person toggle', defaultValue: true },
					{
						name: 'defaultView',
						type: 'select',
						label: 'Schedule display',
						options: [
							{ label: 'Full list', value: 'full' },
							{ label: 'Short list', value: 'short' },
						],
						defaultValue: 'full',
						admin: { description: 'Switches how the schedule is laid out. Visitors can still change it on the page.' },
					},
				],
			},
		],
	}),
};

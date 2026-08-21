import type { Field } from 'payload';
import { deepMerge } from '@/utils/deepMerge';

type ButtonField = 'label' | 'url' | 'variant' | 'openInNewTab';

type ButtonOptions = {
	variant?: boolean;
	openInNewTab?: boolean;
	required?: boolean;
	overrides?: Partial<Record<ButtonField, Partial<Field>>>;
	extraFields?: Field[];
};

export const button = ({
	variant = true,
	openInNewTab = true,
	required = false,
	overrides = {},
	extraFields = [],
}: ButtonOptions = {}): Field[] => {
	const fields: Field[] = [
		{ name: 'label', type: 'text', required },
		{ name: 'url', type: 'text' },
		...(variant
			? ([
					{
						name: 'variant',
						type: 'select',
						options: [
							{ label: 'Default', value: 'default' },
							{ label: 'Outline', value: 'outline' },
							{ label: 'Link', value: 'link' },
						],
						defaultValue: 'default',
						required: true,
					},
				] as Field[])
			: []),
		...(openInNewTab ? ([{ name: 'openInNewTab', type: 'checkbox', defaultValue: false }] as Field[]) : []),
	];

	return [
		...fields.map((field) => deepMerge(field, overrides[(field as { name: ButtonField }).name] ?? {})),
		...extraFields,
	];
};

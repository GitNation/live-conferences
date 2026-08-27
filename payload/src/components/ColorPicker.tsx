'use client';
import React from 'react';
import { FieldLabel, useField } from '@payloadcms/ui';
import { TextButton } from '@/components/TextButton';

const FALLBACK = '#808080';
const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

type FieldConfig = { label?: string; admin?: { width?: string; style?: React.CSSProperties } };

const widthStyle = (field?: FieldConfig): React.CSSProperties => ({
	...(field?.admin?.style || {}),
	...(field?.admin?.width ? ({ '--field-width': field.admin.width } as React.CSSProperties) : { flex: '1 1 auto' }),
});

export const ColorPicker: React.FC<{ field?: FieldConfig; path: string }> = ({ field, path }) => {
	const { value, setValue } = useField<string>({ path });
	const current = typeof value === 'string' ? value : '';

	return (
		<div className="field-type text" style={widthStyle(field)}>
			<FieldLabel label={field?.label} />
			<div style={{ alignItems: 'center', display: 'flex', gap: 'calc(var(--base) * .4)' }}>
				<input
					type="color"
					aria-label={`${field?.label || path} swatch`}
					value={isHex(current) ? current : FALLBACK}
					onChange={(event) => setValue(event.target.value)}
					style={{ cursor: 'pointer', flex: '0 0 auto', padding: '4px', width: '52px' }}
				/>
				<input type="text" placeholder="#000000" value={current} onChange={(event) => setValue(event.target.value)} style={{ minWidth: 0 }} />
				{current && <TextButton onClick={() => setValue('')}>Clear</TextButton>}
			</div>
		</div>
	);
};

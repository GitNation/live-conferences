'use client';
import React from 'react';
import { useRowLabel } from '@payloadcms/ui';

// Collapsed section header: the section type, plus a loud badge when the
// section is switched off so a disabled section is obvious without opening it.
export const SectionLabel: React.FC = () => {
	const { data } = useRowLabel<Record<string, unknown>>();
	// The section type is the heading — "Hero", "Deep dives" — not its content.
	const blockType = typeof data?.blockType === 'string' ? data.blockType : '';
	const name = blockType ? blockType.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()) : 'Section';
	const disabled = Boolean(data?.disabled);

	return (
		<span style={{ alignItems: 'center', display: 'flex', width: '100%', justifyContent: 'space-between', gap: '.5rem' }}>
			<span style={{ opacity: disabled ? 0.55 : 1, textDecoration: disabled ? 'line-through' : 'none' }}>{name}</span>
			{disabled && (
				<span
					style={{
						background: 'var(--theme-error-500)',
						borderRadius: '999px',
						color: '#fff',
						fontSize: '.62rem',
						fontWeight: 600,
						letterSpacing: '.06em',
						lineHeight: '16px',
						padding: '2px 12px',
						textTransform: 'uppercase',
					}}
				>
					Off
				</span>
			)}
		</span>
	);
};

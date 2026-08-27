'use client';
import React from 'react';

export const TextButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
	<button
		type="button"
		onClick={onClick}
		style={{
			background: 'none',
			border: 'none',
			borderBottom: '1px dotted currentColor',
			color: 'var(--theme-elevation-800)',
			cursor: 'pointer',
			fontSize: '1.05rem',
			fontWeight: 600,
			padding: 0,
		}}
	>
		{children}
	</button>
);

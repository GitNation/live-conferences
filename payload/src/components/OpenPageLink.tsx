'use client';

import Link from 'next/link';
import { useConfig } from '@payloadcms/ui';
import type { DefaultCellComponentProps } from 'payload';

// The pages table inside a conference opens a row in a drawer — that is baked into
// Payload's join field, which hands the table a DrawerLink for its linked column and
// takes no option to turn it off. A drawer has no Live Preview, so this column is the
// way past it: a plain link to the page's own view, where the preview tab lives.
export const OpenPageLink = ({ rowData }: DefaultCellComponentProps) => {
	const {
		config: {
			routes: { admin },
		},
	} = useConfig();

	const id = (rowData as { id?: number | string } | undefined)?.id;
	if (!id) return null;

	return <Link href={`${admin}/collections/pages/${id}`}>Open</Link>;
};

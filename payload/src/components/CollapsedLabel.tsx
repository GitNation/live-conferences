'use client';
import React from 'react';
import { useRowLabel } from '@payloadcms/ui';

// The collapsed header of anything in a list — a section on a page, or a row
// inside one. Struck through with a badge while it is hidden, so nobody has to
// open it to find out.
//
// A section names itself by its type ("Deep dives"); an array row is numbered
// and shows what is in it ("01. Tech - Claude Code"), or, when the rows are not
// all the same thing, is named by its own select ("01. CFP - Call for papers").
type Props = {
  label?: string;
  labelFrom?: string;
  labels?: Record<string, string>;
};

const asText = (value: unknown): string => (typeof value === 'string' ? value : '');

export const CollapsedLabel: React.FC<Props> = ({ label, labelFrom, labels }) => {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>();

  const blockType = asText(data?.blockType);
  const own = labelFrom ? asText(data?.[labelFrom]) : '';
  const heading =
    (own && (labels?.[own] ?? own)) ||
    label ||
    (blockType && blockType.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())) ||
    'Item';

  const value = ['title', 'label', 'text', 'value', 'date', 'network'].reduce<string>(
    (found, key) => found || asText(data?.[key]),
    ''
  );
  const number = String((rowNumber ?? 0) + 1).padStart(2, '0');
  const hidden = Boolean(data?.hidden);

  return (
    <span
      style={{ alignItems: 'center', display: 'flex', gap: '.5rem', justifyContent: 'space-between', width: '100%' }}
    >
      <span style={{ opacity: hidden ? 0.55 : 1, textDecoration: hidden ? 'line-through' : 'none' }}>
        {blockType ? heading : [`${number}.`, heading, value && `- ${value}`].filter(Boolean).join(' ')}
      </span>
      {hidden && (
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
          Hidden
        </span>
      )}
    </span>
  );
};

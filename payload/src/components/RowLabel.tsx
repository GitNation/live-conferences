'use client';
import React from 'react';
import { useRowLabel } from '@payloadcms/ui';

// Collapsed array rows show their position, what they are and their content:
// "01. Tech - Claude Code". Attached with admin: rowLabel('Tech'). A row with
// nothing filled in yet is just "01. Tech" — no dangling dash.
export const RowLabel: React.FC<{ label?: string }> = ({ label }) => {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>();
  const value = ['title', 'label', 'text', 'value', 'date', 'network'].reduce<string>(
    (found, key) => found || (typeof data?.[key] === 'string' ? (data[key] as string) : ''),
    ''
  );
  const number = String((rowNumber ?? 0) + 1).padStart(2, '0');

  return <span>{[`${number}.`, label, value && `- ${value}`].filter(Boolean).join(' ')}</span>;
};

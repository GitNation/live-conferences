'use client';
import React from 'react';
import { useField } from '@payloadcms/ui';

// Progress bar under a length-limited SEO field: shows how much of the limit is
// used and how many characters are left. Rendered via admin.components.afterInput
// with the limit passed as a clientProp.
export const CharCounterBar: React.FC<{ path: string; max?: number }> = ({ path, max = 0 }) => {
  const { value } = useField<string>({ path });
  const used = typeof value === 'string' ? value.length : 0;
  const left = Math.max(0, max - used);
  const percent = max ? Math.min(100, (used / max) * 100) : 0;

  return (
    <div style={{ marginTop: '.35rem' }}>
      <div
        style={{
          background: 'var(--theme-elevation-100)',
          borderRadius: '2px',
          height: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'var(--theme-error-500)',
            height: '100%',
            transition: 'width .15s ease',
            width: `${percent}%`,
          }}
        />
      </div>
      <div style={{ color: 'var(--theme-elevation-500)', fontSize: '.7rem', marginTop: '.2rem' }}>
        {used} / {max} — {left} left
      </div>
    </div>
  );
};

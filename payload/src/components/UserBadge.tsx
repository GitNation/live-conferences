'use client';
import React from 'react';
import { useConfig } from '@payloadcms/ui';

export type UserSummary = {
  id?: number | string;
  name?: string;
  email?: string;
  avatar?: { url?: string } | number | null;
};

// A user shown as a person: avatar and name, email while the name is empty.
// Without an uploaded avatar it falls back to a circle with the first letter.
// Linked to the account, so the profile is one click away.
//
// Doubles as a list column, which is why it also accepts `cellData` — that is
// the prop name Payload hands to a Cell component.
type Props = {
  cellData?: UserSummary | number | null;
  size?: number;
  user?: UserSummary | number | null;
};

export const UserBadge: React.FC<Props> = ({ cellData, size = 40, user = cellData }) => {
  const { config } = useConfig();

  if (!user || typeof user === 'number') return <span>—</span>;

  const label = user.name || user.email || '—';
  const avatar = typeof user.avatar === 'object' ? user.avatar : null;

  const body = (
    <>
      {avatar?.url ? (
        <img
          src={avatar.url}
          alt=""
          height={size}
          width={size}
          style={{ borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
        />
      ) : (
        <span
          aria-hidden
          style={{
            alignItems: 'center',
            background: 'var(--theme-elevation-150)',
            borderRadius: '50%',
            color: 'var(--theme-elevation-600)',
            display: 'inline-flex',
            flexShrink: 0,
            fontSize: size * 0.4,
            fontWeight: 600,
            height: size,
            justifyContent: 'center',
            lineHeight: 1,
            width: size,
          }}
        >
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      {label}
    </>
  );

  const layout = { alignItems: 'center', display: 'inline-flex', gap: '.75rem' } as const;

  if (!user.id) return <span style={layout}>{body}</span>;

  return (
    <a
      href={`${config.routes.admin}/collections/users/${user.id}`}
      style={{ ...layout, color: 'inherit', textDecoration: 'none' }}
      title={`Open ${label}`}
    >
      {body}
    </a>
  );
};

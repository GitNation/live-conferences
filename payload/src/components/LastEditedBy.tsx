'use client';
import React from 'react';
import { FieldLabel, useFormFields } from '@payloadcms/ui';
import { UserBadge, type UserSummary } from '@/components/UserBadge';

// Replaces the relationship picker in the sidebar: this value is stamped by a
// hook on every save, so there is nothing to choose — just who it was.
//
// The admin form holds relationships as a bare id, so the user is fetched to
// show a name and an avatar rather than a number.
export const LastEditedBy: React.FC<{ field?: { label?: string }; path?: string }> = ({
  field,
  path = 'lastEditedBy',
}) => {
  const value = useFormFields(([fields]) => fields[path]?.value) as UserSummary | number | null;
  const [user, setUser] = React.useState<UserSummary | null>(
    value && typeof value === 'object' ? value : null
  );

  React.useEffect(() => {
    if (!value) {
      setUser(null);
      return;
    }
    if (typeof value === 'object') {
      setUser(value);
      return;
    }
    let active = true;
    fetch(`/api/users/${value}?depth=1`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => active && doc && setUser(doc))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div className="field-type">
      <FieldLabel label={field?.label || 'Last edited by'} />
      <div style={{ paddingTop: '.5rem' }}>{user ? <UserBadge user={user} /> : <span>—</span>}</div>
    </div>
  );
};

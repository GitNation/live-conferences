import type { Access, FieldAccess } from 'payload';

// Three roles: an admin runs the place, an editor does everything an admin does
// except hand out roles, a user only looks.
const isAdmin = (user: { role?: string } | null | undefined) => user?.role === 'admin';
const isEditor = (user: { role?: string } | null | undefined) => isAdmin(user) || user?.role === 'editor';

// Published content the static build reads without a token.
export const anyone: Access = () => true;

// Signed in, the read-only user included.
export const authenticated: Access = ({ req: { user } }) => Boolean(user);

// Whether the panel itself opens — same rule, different signature.
export const authenticatedAdminUI = ({ req: { user } }: { req: { user?: unknown } }) => Boolean(user);

// Writing content: pages, media, conferences, globals, presets. Not accounts.
export const editor: Access = ({ req: { user } }) => isEditor(user);

export const admin: Access = ({ req: { user } }) => isAdmin(user);

// Field-level variant (field access has its own signature).
export const adminField: FieldAccess = ({ req: { user } }) => isAdmin(user);

// Accounts are admin-only; everyone else may still edit their own.
export const adminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.id === id;
};

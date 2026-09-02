import type { Access, FieldAccess, TypedUser } from 'payload';

// Three roles: an admin runs the place, an editor does everything an admin does
// except hand out roles, a user only looks. The MCP plugin brings an api-key
// collection of its own, so the user on a request is not always one of ours —
// only a `users` doc carries a role, and anything else falls through to false.
const roleOf = (user: TypedUser | null | undefined) => (user && 'role' in user ? user.role : undefined);
const isAdmin = (user: TypedUser | null | undefined) => roleOf(user) === 'admin';
const isEditor = (user: TypedUser | null | undefined) => isAdmin(user) || roleOf(user) === 'editor';

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

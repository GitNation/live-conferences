import type { Access, FieldAccess } from 'payload';

// Named access rules instead of inline lambdas, same vocabulary as
// focusreactive.com-front. Every collection states its access explicitly rather
// than relying on Payload's default (authenticated-only), so what is public is
// visible at a glance.

const isAdmin = (user: { role?: string } | null | undefined) => user?.role === 'admin';

// Published content the static build reads without a token.
export const anyone: Access = () => true;

// Anyone signed into the admin.
export const authenticated: Access = ({ req: { user } }) => Boolean(user);

// Whether the panel itself opens — same rule, different signature.
export const authenticatedAdminUI = ({ req: { user } }: { req: { user?: unknown } }) =>
  Boolean(user);

// Account management and anything destructive beyond content.
export const admin: Access = ({ req: { user } }) => isAdmin(user);

// Field-level variant (field access has its own signature).
export const adminField: FieldAccess = ({ req: { user } }) => isAdmin(user);

// Admins, or the user acting on their own account.
export const adminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.id === id;
};

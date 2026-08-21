import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Coarse rate limit for the public API and the login route: Payload 3 dropped
// the built-in limiter, so without this a single client can hammer
// /api/pages or brute-force /api/users/login for free.
//
// In-memory and per instance — good enough for one server, and a stand-in for
// the edge/WAF limiter this would sit behind in production.
//
// The budget has to cover the admin as well as the build fetch: the edit view
// fires a REST call per relationship and upload field, so one page with two
// dozen section blocks is already a few hundred requests a minute. At 120 the
// limiter fired while filling a page in and the admin just retried 429s.
const WINDOW_MS = 60_000;
const LIMITS = { '/api/users/login': 10, '/api': 600 };

const hits = new Map<string, { count: number; resetAt: number }>();

const limitFor = (pathname: string) =>
  pathname.startsWith('/api/users/login') ? LIMITS['/api/users/login'] : LIMITS['/api'];

export function middleware(request: NextRequest) {
  // Nothing to protect locally, and dev is exactly where the admin is chattiest
  // — every save and every hot reload refetches. There is no proxy in front
  // either, so without an x-forwarded-for every tab shares one bucket.
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const key = `${ip}:${limitFor(request.nextUrl.pathname)}`;
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else if (entry.count >= limitFor(request.nextUrl.pathname)) {
    return NextResponse.json(
      { errors: [{ message: 'Too many requests.' }] },
      { headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) }, status: 429 }
    );
  } else {
    entry.count += 1;
  }

  // Old buckets would otherwise pile up for every IP ever seen.
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }

  return NextResponse.next();
}

export const config = { matcher: '/api/:path*' };

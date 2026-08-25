import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';

import { Brands } from '@/collections/Brands';
import { Conferences } from '@/collections/Conferences';
import { Faqs } from '@/collections/Faqs';
import { Jobs } from '@/collections/Jobs';
import { Media } from '@/collections/Media';
import { Pages } from '@/collections/Pages';
import { Users } from '@/collections/Users';
import { createDatabaseAdapter } from '@/database';
import { emsContent } from '@/endpoints/emsContent';
import { MultipassBanner } from '@/globals/MultipassBanner';
import { NoticePanel } from '@/globals/NoticePanel';
import { SubscriptionPopup } from '@/globals/SubscriptionPopup';
import { plugins } from '@/plugins';

const dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET is missing — set it in payload/.env (it signs the auth tokens).');
}

// CORS is only needed for browsers: the Gulp build fetches server side. Keep it
// empty unless a front end really has to call the API from the browser.
const allowedOrigins = (process.env.PAYLOAD_CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export default buildConfig({
  // Upload urls are built from this: set, they come back absolute
  // (http://localhost:3100/api/media/file/x.png), unset they are root-relative
  // and the static build — served from another origin — resolves them against
  // itself and 404s. Must match the origin the Gulp bridge fetches (PAYLOAD_URL
  // there), since that url is what ends up in the built HTML.
  serverURL: process.env.PAYLOAD_URL || 'http://localhost:3100',
  admin: {
    // Lets `generate:importmap` resolve the `@/` paths custom components use.
    importMap: { baseDir: dirname },
    user: Users.slug,
  },
  collections: [Brands, Conferences, Pages, Faqs, Jobs, Media, Users],
  globals: [SubscriptionPopup, NoticePanel, MultipassBanner],
  endpoints: [emsContent],
  plugins,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: createDatabaseAdapter(),
  cors: allowedOrigins,
  // Nothing queries GraphQL — one less public surface to guard.
  graphQL: { disable: true },
  // `?depth=50` on a public endpoint is a cheap way to make the server work.
  maxDepth: 3,
  upload: { limits: { fileSize: 15 * 1024 * 1024 } },
  sharp,
});

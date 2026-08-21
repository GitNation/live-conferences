import path from 'path';
import { fileURLToPath } from 'url';
import { postgresAdapter } from '@payloadcms/db-postgres';

const baseDir = path.dirname(fileURLToPath(import.meta.url));

export const migrationDir = path.resolve(baseDir, 'migrations');

// Schema handling, same split as focusreactive.com-front: `push` syncs the
// schema straight from the config (fast local iteration, interactive prompts on
// destructive changes), migrations are what a deployed environment runs.
//
// Push is on in dev and off everywhere else — on Neon/Vercel the deploy step
// runs `pnpm migrate` and nothing ever touches the schema implicitly.
export const createDatabaseAdapter = () =>
  postgresAdapter({
    migrationDir,
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
    },
    push: process.env.PAYLOAD_DB_PUSH
      ? process.env.PAYLOAD_DB_PUSH === '1'
      : process.env.NODE_ENV !== 'production',
  });

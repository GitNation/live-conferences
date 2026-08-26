// One-off: removes media documents by id, files included. Ids come from the
// orphan query in the migrate-conf skill.
import config from '@payload-config';
import { getPayload } from 'payload';

const ids = (process.argv[2] || '').split(',').map(Number).filter(Boolean);
const payload = await getPayload({ config });

for (const id of ids) {
	await payload.delete({ collection: 'media', id }).catch((err) => console.warn('  !', id, err.message));
}
console.log('deleted', ids.length);
process.exit(0);

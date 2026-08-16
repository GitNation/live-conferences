import type { CollectionAfterChangeHook } from 'payload';

// Payload's Duplicate copies the document itself and nothing else, but a
// conference without its pages is an empty shell — the point of duplicating an
// edition is to start from last year's content.
//
// A duplicate is a plain create under the hood, so the only thing separating it
// from a normal one is the request it arrived on: the admin posts to
// /api/conferences/:id/duplicate, and that :id is the document to copy from.
// `req.routeParams` is only populated for admin views, not for REST, hence the
// url.
const duplicatedFrom = (req: { url?: string }): string | undefined =>
  req.url?.match(/\/conferences\/([^/?]+)\/duplicate/)?.[1];

// Every block and array row carries the row id it was saved under; reusing
// those in a new document collides with the originals. At depth 0 relationships
// are plain numbers, so dropping `id` keys only drops row identity.
const stripIds = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map(stripIds) as T;
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== 'id')
      .map(([key, entry]) => [key, stripIds(entry)])
  ) as T;
};

export const copyPagesOnDuplicate: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  const sourceId = duplicatedFrom(req);
  if (operation !== 'create' || !sourceId || String(sourceId) === String(doc.id)) return doc;

  const { docs: pages } = await req.payload.find({
    collection: 'pages',
    where: { conference: { equals: sourceId } },
    // Deep enough to carry nested section blocks; relationships stay as ids so
    // the copy points at the same media instead of duplicating files.
    depth: 0,
    limit: 100,
    req,
  });

  for (const page of pages) {
    const { id, createdAt, updatedAt, ...data } = page;
    await req.payload.create({
      collection: 'pages',
      data: { ...stripIds(data), conference: doc.id },
      req,
    });
  }

  if (pages.length) req.payload.logger.info(`Duplicated ${pages.length} page(s) into conference ${doc.id}`);

  return doc;
};

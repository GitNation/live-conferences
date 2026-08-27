import type { CollectionBeforeDeleteHook } from 'payload';

// A page's `conference` is required, so deleting a conference that still has
// pages fails on the not-null constraint and the admin shows nothing but "An
// unknown error has occurred". Pages have no life without their edition, so
// they go with it.
export const deleteConferencePages: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const { docs: pages } = await req.payload.find({
    collection: 'pages',
    where: { conference: { equals: id } },
    depth: 0,
    limit: 100,
    req,
  });

  for (const page of pages) {
    await req.payload.delete({ collection: 'pages', id: page.id, req });
  }

  if (pages.length) req.payload.logger.info(`Deleted ${pages.length} page(s) with conference ${id}`);
};

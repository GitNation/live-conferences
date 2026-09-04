import type { CollectionAfterOperationHook } from 'payload';

// The site is a static Gulp build, so it cannot subscribe to Payload the way a Next app
// does — it has to be told. On a write, poke the dev server, which re-renders the html;
// the Live Preview iframe then picks it up on its next load.
//
// Why `afterOperation` and not `afterChange`: `afterChange` still runs inside the
// database transaction, so the rebuild it triggers reads the *previous* value over its
// own connection and the preview ends up one save behind. `commitTransaction(req)` runs
// before `afterOperation` (see payload/dist/collections/operations/update.js), so by here
// the new value is visible to everyone.
//
// NEXT_PUBLIC_SITE_PREVIEW_URL points at the running site (http://localhost:8080) and
// switches this on; unset, nothing happens, which is what a deployed admin wants. The
// NEXT_PUBLIC_ prefix is not decoration — the same value builds the Live Preview iframe
// url in the collection configs, and that runs in the browser.
//
// Fire and forget on purpose: a preview that is not running must never make saving fail
// or wait.

// `afterOperation` also covers reads, and the build itself reads — firing on those would
// have it rebuild in a loop.
const WRITES = new Set(['create', 'delete', 'deleteByID', 'update', 'updateByID']);

export const refreshSitePreview: CollectionAfterOperationHook = ({ operation, req, result }) => {
	const previewUrl = process.env.NEXT_PUBLIC_SITE_PREVIEW_URL;
	if (!previewUrl || !WRITES.has(operation)) return result;

	void fetch(`${previewUrl.replace(/\/$/, '')}/__payload-preview`, { method: 'POST' }).catch((err: unknown) => {
		req.payload.logger.warn(`Site preview at ${previewUrl} did not answer: ${err instanceof Error ? err.message : String(err)}`);
	});

	return result;
};

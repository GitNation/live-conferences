const config = require('../config');

const withSubPath = (ctx, path) => `/${ctx.subPath || ''}${String(path || '').replace(/^\/+/, '')}`;

const pageSlug = (key) => (key === 'main' ? '' : config.pages.mappings[key] || key);

// Only the pages the remote section is made of have a counterpart, and it is looked up by key:
// Remote workshops is a page of its own and is picked by hand.
const sectionKey = (ctx, key) => {
	if (!ctx.pageDir) return null;
	const candidate = key === 'main' ? ctx.pageDir : `${ctx.pageDir}-${key}`;
	return (ctx.validPageKeys || []).includes(candidate) ? candidate : null;
};

const resolveLink = (ctx, link) => {
	if (link.linkType === 'external') return String(link.url || '').trim();
	// No page is no destination: a template asking `if button.url` then draws nothing, which is how
	// a block says it has no button. The admin keeps the anchor hidden until a page is picked.
	if (!link.page) return '';
	const anchor = String(link.anchor || '').trim();
	const hash = anchor && anchor.charAt(0) !== '#' ? `#${anchor}` : anchor;
	return withSubPath(ctx, pageSlug(sectionKey(ctx, link.page) || link.page)) + hash;
};

const isLink = (node) => node.linkType === 'page' || node.linkType === 'external';

const withResolvedLinks = (node, ctx) => {
	if (Array.isArray(node)) return node.map((entry) => withResolvedLinks(entry, ctx));
	if (!node || typeof node !== 'object') return node;
	const resolved = Object.fromEntries(Object.entries(node).map(([key, value]) => [key, withResolvedLinks(value, ctx)]));
	return isLink(node) ? { ...resolved, url: resolveLink(ctx, node) } : resolved;
};

module.exports = { withResolvedLinks };

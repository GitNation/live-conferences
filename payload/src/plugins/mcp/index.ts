import { mcpPlugin } from '@payloadcms/plugin-mcp';
import type { PayloadRequest } from 'payload';
import { Brands } from '@/collections/Brands';
import { Conferences } from '@/collections/Conferences';
import { Faqs } from '@/collections/Faqs';
import { Jobs } from '@/collections/Jobs';
import { Media } from '@/collections/Media';
import { Pages } from '@/collections/Pages';
import { EventBy } from '@/globals/EventBy';
import { MultipassBanner } from '@/globals/MultipassBanner';
import { NoticePanel } from '@/globals/NoticePanel';
import { SubscriptionPopup } from '@/globals/SubscriptionPopup';
import { MCP_SERVER_INSTRUCTIONS } from '@/plugins/mcp/constants/instructions';
import { LOCAL_HOSTS, LOCAL_MCP_USER } from '@/plugins/mcp/constants/local';
import { MCP_TOOL_NAMES, mcpTools } from '@/plugins/mcp/tools';

// Accounts are admin-only in `access`, so an MCP tool over Users only ever walks
// into a wall — it is left out rather than advertised.
const COLLECTIONS = [Brands, Conferences, Pages, Faqs, Jobs, Media];
const GLOBALS = [SubscriptionPopup, NoticePanel, MultipassBanner, EventBy];

const COLLECTION_CAPABILITIES = { create: true, delete: true, find: true, update: true };
// The only two a global has.
const GLOBAL_CAPABILITIES = { find: true, update: true };

// Only where the slug alone does not say enough — an MCP client picks its tool
// by this text.
const DESCRIPTIONS: Record<string, string> = {
	brands: 'The brand shared by every edition of a conference — its key (the folder name under src/conferences), city, url and social links.',
	conferences: 'One edition of a conference: brand, event year, start and end time, EMS event id, and the header and footer content for that edition.',
	pages:
		'A page of a conference site. `key` selects which page (main, faq, jobs, schedule, checkout…) and `sections` is the ordered list of section blocks the page is built from. Change the field values inside a section to change what the site shows.',
};

const collectionOptions = Object.fromEntries(
	COLLECTIONS.map(({ slug }) => [slug, { enabled: COLLECTION_CAPABILITIES, ...(DESCRIPTIONS[slug] ? { description: DESCRIPTIONS[slug] } : {}) }])
);

const globalOptions = Object.fromEntries(GLOBALS.map(({ slug }) => [slug, { enabled: GLOBAL_CAPABILITIES }]));

const toCamelCase = (slug: string) => slug.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

// The plugin looks the caller's capabilities up by camelCased slug.
const bypassCapabilities = Object.fromEntries([
	...COLLECTIONS.map(({ slug }) => [toCamelCase(slug), COLLECTION_CAPABILITIES]),
	...GLOBALS.map(({ slug }) => [toCamelCase(slug), GLOBAL_CAPABILITIES]),
]);

const hostOf = (req: PayloadRequest) => {
	try {
		if (req.url) return new URL(req.url).hostname;
	} catch {
		// A relative url — fall through to the header.
	}
	return req.headers.get('host')?.split(':')[0] ?? null;
};

const isLocalDevMcpRequest = (req: PayloadRequest) => {
	if (process.env.NODE_ENV !== 'development') return false;
	if (process.env.PAYLOAD_MCP_LOCAL_AUTH_BYPASS === 'false') return false;

	const host = hostOf(req);
	return host ? LOCAL_HOSTS.includes(host) : false;
};

export const mcpPluginConfig = mcpPlugin({
	collections: collectionOptions,
	globals: globalOptions,
	mcp: {
		serverOptions: { instructions: MCP_SERVER_INSTRUCTIONS },
		tools: mcpTools,
	},
	overrideAuth: async (req, getDefaultMcpAccessSettings) => {
		if (!isLocalDevMcpRequest(req)) return getDefaultMcpAccessSettings();

		return { ...bypassCapabilities, 'payload-mcp-tool': MCP_TOOL_NAMES, user: LOCAL_MCP_USER };
	},
});

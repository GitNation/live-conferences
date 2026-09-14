const fs = require('fs');
const path = require('path');
const vm = require('vm');
const nunjucks = require('nunjucks');
const yaml = require('js-yaml');

const templates = path.resolve(__dirname, '../src/conferences/aics-nyc/templates');

function renderCheckout(filename) {
	const source = fs.readFileSync(path.join(templates, filename), 'utf8');
	const metadata = yaml.safeLoad(source.split('---')[1]);
	const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templates));
	env.addGlobal('confUrl', () => '/nyc/');
	env.addFilter('filterBy', items => items || []);
	return env.renderString(source.replace(/^---[\s\S]*?---/, ''), {
		...metadata,
		pages: {
			main: { pageSections: {} },
			checkout: { pageSections: {} },
			'checkout-remote': { pageSections: {} },
		},
		customContent: { eventInfo: {} },
		pagesPieceOfTexts: {},
	}).replace(/<!--[\s\S]*?-->/g, '');
}

['checkout.html', 'remote-checkout.html'].forEach(filename => {
	describe(`AICS NYC ${filename}`, () => {
		let html;
		let context;
		let callbacks;
		let events;
		beforeEach(() => {
			html = renderCheckout(filename);
			context = vm.createContext({ console: { log() {} } });
			context.window = context;
			const scripts = Array.from(html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g), match => match[1]);
			// Execute the real GA bootstrap and both checkout listener scripts in document order.
			scripts.filter(script => script.includes("gtag('config', 'G-XK3XMSM7YP')") || script.includes("tito('on:registration:finished'"))
				.forEach(script => vm.runInContext(script, context));
			callbacks = name => context.tito.q.filter(entry => entry[0] === `on:registration:${name}`).map(entry => entry[1]);
			events = name => context.dataLayer.filter(entry => entry[0] === 'event' && entry[1] === name);
		});

		const order = {
			slug: 'test-order', total: '249.50', currency: 'USD',
			line_items: [{ release_slug: 'ticket', title: 'Conference pass', quantity: 2, price: '124.75', currency: 'USD' }],
		};

		test('loads GA before the widget, without the competing GA4 plugin', () => {
			expect(html.indexOf("gtag('config', 'G-XK3XMSM7YP')")).toBeLessThan(html.indexOf('https://js.tito.io/v2/with/'));
			expect(html).toContain("src='https://js.tito.io/v2/with/inline,facebook'");
			expect(html).not.toMatch(/<script[^>]+src=['"][^'"]*inline,ga4/);
		});

		test('queues one purchase with numeric revenue and ticket details', () => {
			context.finishTitoRegistration = () => {};
			context.twq = () => {};
			callbacks('finished').forEach(callback => callback(order));
			expect(events('purchase')).toHaveLength(1);
			expect(events('purchase')[0][2]).toEqual({
				send_to: 'G-XK3XMSM7YP', transaction_id: 'test-order', value: 249.50, currency: 'USD',
				items: [{ item_id: 'ticket', item_name: 'Conference pass', quantity: 2, price: 124.75 }],
			});
		});

		test('deduplicates repeated completion but tracks a separate order', () => {
			const callback = callbacks('finished')[0];
			callback(order);
			callback(order);
			callback({ ...order, slug: 'second-order' });
			expect(events('purchase')).toHaveLength(2);
		});

		test('tracks before a failing non-GA checkout callback', () => {
			expect(() => callbacks('finished').forEach(callback => callback(order))).toThrow();
			expect(events('purchase')).toHaveLength(1);
		});

		test('preserves begin_checkout with the documented minimal Tito payload', () => {
			callbacks('started')[0]({ slug: order.slug, line_items: order.line_items });
			expect(events('purchase')).toHaveLength(0);
			expect(events('begin_checkout')[0][2]).toMatchObject({ value: 249.50, currency: 'USD' });
		});

		test('supports free orders and legacy ticket names, and skips missing transaction IDs', () => {
			const callback = callbacks('finished')[0];
			callback({ ...order, slug: '' });
			callback({ ...order, total: '0', line_items: [{ release_slug: 'free', release_title: 'Free pass', price: '0', quantity: 1 }] });
			expect(events('purchase')).toHaveLength(1);
			expect(events('purchase')[0][2]).toMatchObject({ value: 0, items: [{ item_name: 'Free pass', price: 0 }] });
		});
	});
});

test('shared checkout keeps the GA4 plugin enabled by default for other conferences', () => {
	const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templates));
	env.addGlobal('confUrl', () => '/checkout');
	const html = env.renderString('{% import "ga/ga-mixins.njk" as ga_mixins %}{% import "partials/_mixins.html" as mixins %}{% import "eventsBus/eventsBus.njk" as eventsLayer %}{% include "partials/_checkout.html" %}', { pages: {} }).replace(/<!--[\s\S]*?-->/g, '');
	expect(html).toContain("src='https://js.tito.io/v2/with/inline,ga4,facebook'");
});

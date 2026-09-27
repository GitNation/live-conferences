const { editionOf, renderEdition, renderBrandIndex, renderOtherEditions, problems, plainText, formatDates } = require('../gulp/util/llmsTxt');

const content = {
	payload: {
		brand: { url: 'https://aicodingsummit.com', city: 'Online', socials: [{ network: 'twitter', url: 'https://x.com/AICodingSummit' }] },
		startTime: '2026-11-16T15:00:00.000Z',
		endTime: '2026-11-19T22:59:00.000Z',
		components: { eventBy: { link: { label: 'GitNation', url: 'https://gitnation.org' } } },
		pages: {
			main: {
				seo: { description: 'The home page description.' },
				sections: [
					{
						blockType: 'hero',
						stats: [
							{ value: '40+', description: 'talks & workshops' },
							{ value: '500+', description: 'engineers in NYC' },
						],
					},
					{ blockType: 'techs', items: [{ title: 'Cursor' }, { title: 'openAi' }, { title: 'Claude' }, { title: 'OpenAI' }] },
					{ blockType: 'location', address: '<div class="payload-richtext"><p>Liberty Science Center, Jersey City, NJ</p></div>' },
					{
						blockType: 'prices',
						groups: [{ label: 'In-person', tickets: [{ title: 'AI Coding Summit, Regular', price: '$899', date: 'Nov 16-17 (in-person) & Nov 19 (remote)' }] }],
					},
				],
			},
			remote: {
				sections: [
					{
						blockType: 'prices',
						groups: [
							{
								label: 'Remote',
								tickets: [
									{ title: 'AI Coding Summit, Regular', price: '$899' },
									{ title: 'Remote ticket', price: '$199' },
								],
							},
						],
					},
				],
			},
			faq: { seo: { description: 'The home page description.' } },
			schedule: { seo: { description: 'Two days of talks, hour by hour.' } },
		},
	},
	ems: {
		eventInfo: {
			emsEvent: {
				name: 'AI Coding Summit NYC',
				description: '<p>Bringing AI coding best practices to NYC &#x26; online.</p><p>Second paragraph.</p>',
				location: 'New York, US & Online',
				brand: { tagline: 'See how AI transforms software engineering' },
			},
		},
		speakers: Array.from({ length: 17 }, (_, i) => ({ name: `Speaker ${i + 1} `, company: 'Company', superpower: '<p>Builds things</p>' })),
		workshops: [{ title: 'Claude Code: Black Belt', speaker: { name: 'Pawel Sawicki' }, trainers: [{ name: 'Pawel Sawicki' }] }],
		sponsors: [
			{ title: 'Gold', list: [{ alt: 'Auth0 by Okta' }, { id: 'Progress' }] },
			{ title: 'Empty', list: [] },
			{ title: 'Partners', list: [{ alt: 'NYC AI from Scratch' }] },
			{ title: 'Tech Partners', list: [{ alt: 'FocusReactive' }] },
		],
	},
};

const settings = { conferenceTitle: 'AI_Coding_Summit', subPath: 'nyc/', timezone: 'America/New_York' };

const builtPages = [
	{ file: 'faq', key: 'faq' },
	{ file: 'schedule-offline', key: 'schedule' },
	{ file: 'index', key: 'main' },
	{ file: 'checkout', key: 'checkout' },
	{ file: 'advice-lounge', key: 'advice_lounge' },
];

describe('llms.txt for one edition', () => {
	const edition = editionOf(content, settings, builtPages);
	const text = renderEdition(edition);

	it('passes the checks Lighthouse runs on it', () => {
		expect(problems(text)).toEqual([]);
	});

	it('opens with the event name, a summary and the plain-text description', () => {
		expect(text).toMatch(/^# AI Coding Summit NYC\n\n> See how AI transforms software engineering\. November 16 – 19, 2026, New York, US & Online\.\n\n/);
		expect(text).toContain('Bringing AI coding best practices to NYC & online.\n\nSecond paragraph.');
	});

	it('puts every page under the edition url, home first, with only descriptions home does not already give', () => {
		expect(text).toContain(
			[
				'- [Home](https://aicodingsummit.com/nyc/)',
				'- [Tickets](https://aicodingsummit.com/nyc/checkout)',
				'- [In-person schedule](https://aicodingsummit.com/nyc/schedule-offline): Two days of talks, hour by hour.',
				'- [FAQ](https://aicodingsummit.com/nyc/faq)',
				'- [Advice lounge](https://aicodingsummit.com/nyc/advice-lounge)',
			].join('\n')
		);
	});

	it('gives the venue, the topics once each and the numbers', () => {
		expect(text).toContain('- Venue: Liberty Science Center, Jersey City, NJ');
		expect(text).toContain('- Topics: Cursor, openAi, Claude\n');
		expect(text).toContain('- In numbers: 40+ talks & workshops · 500+ engineers in NYC');
	});

	it('lists every ticket once, across the home and remote price lists, and where to buy', () => {
		expect(text).toContain(
			[
				'## Tickets',
				'',
				'- AI Coding Summit, Regular (In-person): $899 — Nov 16-17 (in-person) & Nov 19 (remote)',
				'- Remote ticket (Remote): $199',
				'- Buy: [Tickets](https://aicodingsummit.com/nyc/checkout)',
			].join('\n')
		);
	});

	it('lists fifteen speakers and counts the rest', () => {
		expect(text).toContain('- Speaker 15, Company — Builds things');
		expect(text).not.toContain('Speaker 16,');
		expect(text).toContain('- …and 2 more on [the website](https://aicodingsummit.com/nyc/)');
	});

	it('names a workshop trainer once and leaves out empty tiers and community partners', () => {
		expect(text).toContain('- Claude Code: Black Belt — Pawel Sawicki\n');
		expect(text).toContain('- Gold: Auth0 by Okta, Progress');
		expect(text).toContain('- Tech Partners: FocusReactive');
		expect(text).not.toContain('Empty');
		expect(text).not.toContain('NYC AI from Scratch');
	});

	it('links the organizer and the socials', () => {
		expect(text).toContain('- Organized by [GitNation](https://gitnation.org)');
		expect(text).toContain('- [X](https://x.com/AICodingSummit)');
	});
});

describe('llms.txt across the editions of a brand', () => {
	const nyc = editionOf(content, settings, builtPages);
	const berlin = {
		...nyc,
		name: 'AI Coding Summit Berlin',
		url: 'https://aicodingsummit.com/berlin/',
		dates: 'December 4 – 7, 2026',
		location: 'Berlin & Online',
	};

	it('points each edition at the others', () => {
		expect(renderOtherEditions([berlin])).toBe(
			'\n## Other editions\n\n- [AI Coding Summit Berlin](https://aicodingsummit.com/berlin/): December 4 – 7, 2026, Berlin & Online. Details: [llms.txt](https://aicodingsummit.com/berlin/llms.txt)\n'
		);
	});

	it('gives the domain root to the brand when its own edition is over', () => {
		const text = renderBrandIndex(nyc, [nyc, berlin]);
		expect(text).toMatch(/^# AI Coding Summit\n/);
		expect(text).toContain('## Editions');
		expect(text).toContain('[llms.txt](https://aicodingsummit.com/nyc/llms.txt)');
		expect(problems(text)).toEqual([]);
	});
});

describe('llms.txt helpers', () => {
	it('flags each rule Lighthouse checks', () => {
		expect(problems('short')).toEqual(['no H1 header', 'no Markdown link', 'shorter than 50 characters']);
	});

	it('formats a date range in the conference time zone', () => {
		expect(formatDates('2026-11-16T15:00:00Z', '2026-11-20T02:00:00Z', 'America/New_York')).toBe('November 16 – 19, 2026');
		expect(formatDates('2026-06-11T08:00:00Z', null, 'Europe/Amsterdam')).toBe('June 11, 2026');
	});

	it('turns rich text into plain paragraphs', () => {
		expect(plainText('<div><p>One&nbsp;&amp; two</p><p>Three<br>four</p></div>')).toBe('One & two\n\nThree\n\nfour');
	});
});

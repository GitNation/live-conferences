const { editionOf, renderEdition, renderBrandIndex, renderOtherEditions, problems, plainText, formatDates } = require('../gulp/util/llmsTxt');

const talk = (title) => ({ activities: { talks: [{ title }] } });

const content = {
	payload: {
		brand: { url: 'https://aicodingsummit.com', city: 'Online' },
		startTime: '2026-11-16T15:00:00.000Z',
		endTime: '2026-11-19T22:59:00.000Z',
		pages: {
			main: {
				sections: [
					{ blockType: 'hero', stats: [{ value: '40+', description: 'talks' }] },
					{
						blockType: 'prices',
						groups: [{ label: 'In-person', tickets: [{ title: 'AI Coding Summit, Regular', price: '$899' }] }],
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
								tickets: [{ title: 'AI Coding Summit, Regular', price: '$899' }, { title: 'Remote ticket', price: '$199' }, { price: '$1' }],
							},
						],
					},
				],
			},
		},
	},
	ems: {
		eventInfo: {
			emsEvent: {
				name: 'AI Coding Summit NYC',
				description: '<p>A description that stays on the site.</p>',
				location: 'New York, US & Online',
				brand: { tagline: 'See how AI transforms software engineering' },
			},
		},
		speakers: [
			{ name: 'Kent C. Dodds', portalUrl: 'https://gitnation.com/person/kent_c_dodds', ...talk('I Built Your Personal Software Ecosystem') },
			{ name: 'No Portal', ...talk('A Talk') },
			{ name: 'No Talk', portalUrl: 'https://gitnation.com/person/no_talk' },
			{ portalUrl: 'https://gitnation.com/person/nameless' },
		],
		workshops: [
			{ title: 'Claude Code: Black Belt', speaker: { name: 'Pawel Sawicki' }, trainers: [{ name: 'Pawel Sawicki' }] },
			{ speaker: { name: 'Untitled' } },
		],
		sponsors: [{ title: 'Gold', list: [{ alt: 'Auth0 by Okta' }] }],
	},
};

const settings = { conferenceTitle: 'AI_Coding_Summit', subPath: 'nyc/', timezone: 'America/New_York' };

const builtPages = [
	{ file: 'faq', key: 'faq' },
	{ file: 'remote-checkout', key: 'remote-checkout' },
	{ file: 'index', key: 'main' },
	{ file: 'checkout', key: 'checkout' },
	{ file: 'advice-lounge', key: 'advice_lounge' },
];

describe('llms.txt for one edition', () => {
	const text = renderEdition(editionOf(content, settings, builtPages));

	it('passes the checks Lighthouse runs on it', () => {
		expect(problems(text)).toEqual([]);
	});

	it('opens with the name and a blockquote of the dates and the city', () => {
		expect(text).toMatch(
			/^# AI Coding Summit NYC\n\n> See how AI transforms software engineering\. November 16 – 19, 2026, New York, US & Online\.\n\n## Pages\n/
		);
	});

	it('keeps the spec shape: every entry under a section is a link with optional notes', () => {
		const entries = text.split('\n').filter((line) => line.startsWith('- '));
		expect(entries.length).toBeGreaterThan(0);
		entries.forEach((line) => expect(line).toMatch(/^- \[[^\]]+\]\(https:\/\/[^)]+\)(: .+)?$/));
	});

	it('lists the built pages under the edition url, home first', () => {
		expect(text).toContain(
			[
				'- [Home](https://aicodingsummit.com/nyc/)',
				'- [Tickets](https://aicodingsummit.com/nyc/checkout)',
				'- [Remote tickets](https://aicodingsummit.com/nyc/remote-checkout)',
				'- [FAQ](https://aicodingsummit.com/nyc/faq)',
				'- [Advice lounge](https://aicodingsummit.com/nyc/advice-lounge)',
			].join('\n')
		);
	});

	it('lists each ticket once with its price, linked to the page that sells it', () => {
		expect(text).toContain(
			[
				'## Tickets',
				'',
				'- [AI Coding Summit, Regular](https://aicodingsummit.com/nyc/checkout): $899, In-person',
				'- [Remote ticket](https://aicodingsummit.com/nyc/remote-checkout): $199, Remote',
				'',
			].join('\n')
		);
	});

	it('gives each speaker a link and their talk, falling back to the home page', () => {
		expect(text).toContain('- [Kent C. Dodds](https://gitnation.com/person/kent_c_dodds): I Built Your Personal Software Ecosystem');
		expect(text).toContain('- [No Portal](https://aicodingsummit.com/nyc/): A Talk');
		expect(text).toContain('- [No Talk](https://gitnation.com/person/no_talk)\n');
		expect(text).not.toContain('nameless');
	});

	it('names a workshop trainer once and drops a workshop without a title', () => {
		expect(text).toContain('- [Claude Code: Black Belt](https://aicodingsummit.com/nyc/checkout): Pawel Sawicki\n');
		expect(text).not.toContain('Untitled');
	});

	it('leaves out everything else', () => {
		['A description that stays on the site', 'Auth0', '40+'].forEach((left) => expect(text).not.toContain(left));
	});
});

describe('llms.txt when data is missing or malformed', () => {
	const garbage = {
		payload: {
			brand: { url: 'https://example.com/', city: null },
			startTime: 'not a date',
			pages: { main: { sections: 'nope' }, remote: { sections: [null, { blockType: 'prices', groups: [{ tickets: [null, 7] }] }] } },
		},
		ems: {
			eventInfo: { emsEvent: { name: 42, brand: 'x' } },
			speakers: [null, 'Ann', { name: { first: 'A' } }, { name: 'Real Person', portalUrl: 'javascript:alert(1)', activities: { talks: 'x' } }],
			workshops: { length: 3 },
		},
	};

	it('never throws, whatever is missing', () => {
		[undefined, null, {}, { payload: null, ems: null }, garbage].forEach((input) => {
			expect(() => renderEdition(editionOf(input, {}, null))).not.toThrow();
			expect(() => renderEdition(editionOf(input, { timezone: 'Mars/Olympus' }, [{ file: 7 }, null]))).not.toThrow();
		});
	});

	it('prints no placeholder values', () => {
		const text = renderEdition(editionOf(garbage, { conferenceTitle: 'Example_Conf', timezone: 'Mars/Olympus' }, [{ file: 'index' }]));
		expect(text).not.toMatch(/undefined|null|NaN|\[object Object\]|Invalid Date/);
		expect(text).toContain('# 42');
		expect(text).toContain('- [Real Person](https://example.com/)');
		expect(problems(text)).toEqual([]);
	});

	it('reports a file without a site url, so the build leaves it out', () => {
		const text = renderEdition(editionOf({ payload: { brand: {} } }, { conferenceTitle: 'Example_Conf' }, [{ file: 'index' }]));
		expect(problems(text)).toContain('no Markdown link');
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

	it('formats a date range in the conference time zone, and nothing for a bad date', () => {
		expect(formatDates('2026-11-16T15:00:00Z', '2026-11-20T02:00:00Z', 'America/New_York')).toBe('November 16 – 19, 2026');
		expect(formatDates('2026-06-11T08:00:00Z', 'garbage', 'Europe/Amsterdam')).toBe('June 11, 2026');
		expect(formatDates('garbage')).toBe('');
		expect(formatDates('2026-06-11T08:00:00Z', null, 'Mars/Olympus')).toBe('June 11, 2026');
	});

	it('turns rich text into plain paragraphs', () => {
		expect(plainText('<div><p>One&nbsp;&amp; two</p><p>Three<br>four</p></div>')).toBe('One & two\n\nThree\n\nfour');
	});
});

const fs = require('fs');
const path = require('path');

// llms.txt (https://llmstxt.org) — a short Markdown summary of a site for LLMs and AI agents, built
// from the content the build has already fetched. It follows the spec's shape: an H1, a blockquote
// with the key facts (here the dates and the city), then H2 sections that are lists of links, each
// `- [name](url): notes`. Deliberately four of them — pages, tickets, speakers, workshops; anything
// more is a section added here.
//
// One generator serves every conference, so no field is assumed: anything missing drops its line or
// section. Lighthouse's Agentic Browsing category reads the file from the domain root only and wants
// an H1, a link and at least 50 characters; `problems` checks the same three things.

const ROOT = path.resolve(__dirname, '../..');

// Also the order pages are listed in; anything else follows alphabetically.
const PAGE_LABELS = {
	index: 'Home',
	checkout: 'Tickets',
	'remote-checkout': 'Remote tickets',
	remote: 'Remote edition',
	schedule: 'Online schedule',
	'schedule-offline': 'In-person schedule',
	workshops: 'Workshops',
	'remote-workshops': 'Remote workshops',
	faq: 'FAQ',
	jobs: 'Jobs',
	perks: 'Perks',
	'pre-event': 'Pre-event',
};

const list = (value) => (Array.isArray(value) ? value : []);
const record = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decodeEntities = (text) =>
	text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code) => {
		if (code[0] !== '#') return ENTITIES[code.toLowerCase()] || match;
		return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10));
	});

// Rich text reaches the build as HTML; paragraphs survive as separate entries, everything else goes.
const paragraphs = (html) => {
	if (typeof html !== 'string' && typeof html !== 'number') return [];
	const text = String(html)
		.replace(/<\/(p|div|li|h\d)>|<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '');
	return decodeEntities(text)
		.split('\n')
		.map((line) => line.replace(/\s+/g, ' ').trim())
		.filter(Boolean);
};

const plainText = (html) => paragraphs(html).join('\n\n');

const oneLine = (value) => paragraphs(value).join(' ');

const linkText = (text) => text.replace(/[[\]]/g, '\\$&');

const isUrl = (value) => /^https?:\/\/\S+$/.test(oneLine(value));

const absoluteUrl = (url) => (isUrl(url) ? oneLine(url).replace(/\/?$/, '/') : '');

const validDate = (value) => value && !Number.isNaN(new Date(value).getTime());

const dateFormat = (timeZone) => {
	const options = { month: 'long', day: 'numeric', year: 'numeric' };
	try {
		return new Intl.DateTimeFormat('en-US', { ...options, timeZone: timeZone || 'UTC' });
	} catch (error) {
		return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' });
	}
};

// Intl puts thin spaces around the range dash; plain ones read the same everywhere.
const formatDates = (start, end, timeZone) => {
	if (!validDate(start)) return '';
	const format = dateFormat(timeZone);
	const text = validDate(end) ? format.formatRange(new Date(start), new Date(end)) : format.format(new Date(start));
	return text.replace(/\s/g, ' ');
};

const sectionsOf = (cmsPages, keys, blockType) =>
	keys.flatMap((key) => list(record(cmsPages[key]).sections).filter((section) => record(section).blockType === blockType));

const pageRank = (file) => {
	const rank = Object.keys(PAGE_LABELS).indexOf(file);
	return rank === -1 ? Infinity : rank;
};

// A page link is only worth giving with the site's own url in front of it.
const pagesOf = (builtPages, url) => {
	if (!url) return [];
	return list(builtPages)
		.map((page) => oneLine(record(page).file))
		.filter(Boolean)
		.sort((a, b) => pageRank(a) - pageRank(b) || a.localeCompare(b))
		.map((file) => ({ file, label: PAGE_LABELS[file] || capitalize(file.replace(/-/g, ' ')), url: file === 'index' ? url : url + file }));
};

// The remote page carries its own price list; the same ticket on both pages is listed once.
const ticketsOf = (cmsPages) =>
	sectionsOf(cmsPages, ['main', 'remote'], 'prices')
		.flatMap((prices) =>
			list(prices.groups).flatMap((group) =>
				list(record(group).tickets).map((ticket) => ({
					group: oneLine(record(group).label),
					title: oneLine(record(ticket).title),
					price: oneLine(record(ticket).price),
				}))
			)
		)
		.filter((ticket, index, tickets) => ticket.title && tickets.findIndex((other) => other.title === ticket.title && other.price === ticket.price) === index);

const firstTalk = (speaker) => {
	const activities = record(speaker.activities);
	const titles = [...list(activities.allTalks), ...list(activities.talks), ...list(activities.offlineTalks)].map((talk) => oneLine(record(talk).title));
	return titles.find(Boolean) || '';
};

// Everything the file says about one edition. `builtPages` are the pages the build rendered, as
// `{ file, key }`: the output file name and the CMS page key behind it.
const editionOf = (content, settings, builtPages) => {
	const payload = record(record(content).payload);
	const ems = record(record(content).ems);
	const conference = record(settings);
	const brand = record(payload.brand);
	const eventInfo = record(ems.eventInfo);
	const event = record(eventInfo.emsEvent);
	const brandName = oneLine(conference.conferenceTitle).replace(/_/g, ' ');
	const subPath = oneLine(conference.subPath);
	const siteUrl = absoluteUrl(brand.url);
	const url = siteUrl && siteUrl + subPath;
	const start = payload.startTime || eventInfo.conferenceStart;
	const end = payload.endTime || eventInfo.conferenceFinish;

	return {
		conferenceTitle: oneLine(conference.conferenceTitle),
		brand: brandName,
		name: oneLine(event.name) || brandName,
		tagline: oneLine(record(event.brand).tagline).replace(/\.$/, ''),
		start: validDate(start) ? start : null,
		end: validDate(end) ? end : null,
		dates: formatDates(start, end, oneLine(conference.timezone)),
		location: oneLine(event.location) || oneLine(brand.city),
		url,
		subPath,
		pages: pagesOf(builtPages, url),
		tickets: ticketsOf(record(payload.pages)),
		speakers: list(ems.speakers)
			.map((speaker) => ({
				name: oneLine(record(speaker).name),
				url: isUrl(record(speaker).portalUrl) ? oneLine(speaker.portalUrl) : '',
				talk: firstTalk(record(speaker)),
			}))
			.filter((speaker) => speaker.name),
		workshops: list(ems.workshops)
			.map((workshop) => ({
				title: oneLine(record(workshop).title),
				by: [record(record(workshop).speaker).name, ...list(record(workshop).trainers).map((trainer) => record(trainer).name)]
					.map(oneLine)
					.filter((name, index, names) => name && names.indexOf(name) === index),
			}))
			.filter((workshop) => workshop.title),
	};
};

const section = (title, items) => (items.length ? [`## ${title}`, '', ...items, ''] : []);

const whenAndWhere = (edition) => [edition.dates, edition.location].filter(Boolean).join(', ');

const finish = (lines) =>
	`${lines
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()}\n`;

const item = (name, url, notes) => `- [${linkText(name)}](${url})${notes ? `: ${notes}` : ''}`;

// Every list item needs a link, so an entry without a page of its own points at the one that has it.
const renderEdition = (edition) => {
	const summary = [edition.tagline, whenAndWhere(edition)].filter(Boolean).join('. ');
	const page = (...files) => files.map((file) => edition.pages.find((candidate) => candidate.file === file)).find(Boolean);
	const home = page('index') || (edition.url && { url: edition.url });
	const ticketsPage = (group) => (/remote/i.test(group) && page('remote-checkout')) || page('checkout', 'remote-checkout') || home;
	const workshopsPage = page('workshops', 'remote-workshops') || page('checkout') || home;

	return finish([
		`# ${edition.name}`,
		'',
		...(summary ? [`> ${summary}.`, ''] : []),
		...section(
			'Pages',
			edition.pages.map((entry) => item(entry.label, entry.url))
		),
		...section(
			'Tickets',
			edition.tickets
				.map((ticket) => {
					const target = ticketsPage(ticket.group);
					return target && item(ticket.title, target.url, [ticket.price, ticket.group].filter(Boolean).join(', '));
				})
				.filter(Boolean)
		),
		...section(
			'Speakers',
			edition.speakers
				.map((speaker) => {
					const url = speaker.url || (home && home.url);
					return url && item(speaker.name, url, speaker.talk);
				})
				.filter(Boolean)
		),
		...section('Workshops', workshopsPage ? edition.workshops.map((workshop) => item(workshop.title, workshopsPage.url, workshop.by.join(', '))) : []),
	]);
};

const editionLine = (edition) =>
	`- [${linkText(edition.name)}](${edition.url})${whenAndWhere(edition) ? `: ${whenAndWhere(edition)}` : ''}. Details: [llms.txt](${edition.url}llms.txt)`;

const OTHER_EDITIONS = '## Other editions';

const renderOtherEditions = (editions) => `\n${OTHER_EDITIONS}\n\n${editions.map(editionLine).join('\n')}\n`;

// The root of a multi-city brand once its own edition is over: the domain root is what Lighthouse
// and agents read, so it points at the editions still to come instead of describing a past one.
const renderBrandIndex = (root, editions) =>
	finish([
		`# ${root.brand}`,
		'',
		...(root.tagline ? [`> ${root.tagline}.`, ''] : []),
		`${root.brand} runs in several cities. Each edition has its own website and its own llms.txt.`,
		'',
		...section('Editions', editions.map(editionLine)),
	]);

const problems = (text) =>
	[!/^\s*#\s+.+/m.test(text) && 'no H1 header', !/\[.+\]\(.+\)/.test(text) && 'no Markdown link', text.length < 50 && 'shorter than 50 characters'].filter(
		Boolean
	);

// Each edition leaves its summary in temp/, where the brand index picks it up after every city of
// the brand has been built.
const editionPath = (folder) => path.join(ROOT, 'temp', folder, 'llms-edition.json');

const saveEdition = (folder, edition) => {
	fs.mkdirSync(path.dirname(editionPath(folder)), { recursive: true });
	fs.writeFileSync(editionPath(folder), JSON.stringify(edition, null, 2));
};

const removeEdition = (folder) => fs.rmSync(editionPath(folder), { force: true });

const readEdition = (folder) => {
	try {
		const edition = JSON.parse(fs.readFileSync(editionPath(folder), 'utf8'));
		return edition && edition.url && edition.name ? edition : null;
	} catch (error) {
		return null;
	}
};

// Runs once a multi-city brand's builds are copied into build/<folder>/ (see `build:aics`): every
// edition's file lists the others still to come, and a root edition that is over gives the root
// file to the brand — unless nothing is to come, when its own dated summary is the better answer.
const writeBrandIndex = (folder, now = new Date()) => {
	const root = readEdition(folder);
	if (!root) return console.log(`llms.txt: no edition built for ${folder}, no brand index`);

	const editions = fs
		.readdirSync(path.join(ROOT, 'temp'))
		.filter((dir) => fs.existsSync(path.join(ROOT, 'src/conferences', dir)))
		.map(readEdition)
		.filter((edition) => edition && edition.conferenceTitle === root.conferenceTitle);
	const upcoming = editions.filter((edition) => !edition.end || new Date(edition.end) >= now).sort((a, b) => new Date(a.start) - new Date(b.start));

	editions.forEach((edition) => {
		const file = path.join(ROOT, 'build', folder, edition.subPath || '', 'llms.txt');
		if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8').includes(OTHER_EDITIONS)) return;

		if (!edition.subPath && upcoming.length && !upcoming.some((other) => other.url === edition.url)) {
			fs.writeFileSync(file, renderBrandIndex(edition, upcoming));
			return;
		}
		const others = upcoming.filter((other) => other.url !== edition.url);
		if (others.length) fs.appendFileSync(file, renderOtherEditions(others));
	});
};

module.exports = {
	editionOf,
	renderEdition,
	renderBrandIndex,
	renderOtherEditions,
	problems,
	saveEdition,
	removeEdition,
	writeBrandIndex,
	plainText,
	formatDates,
};

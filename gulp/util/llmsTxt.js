const fs = require('fs');
const path = require('path');

// llms.txt (https://llmstxt.org) — a Markdown summary of a site for LLMs and AI agents, built from
// the content the build has already fetched. Lighthouse's Agentic Browsing category reads it from
// the domain root only and wants an H1, a link and at least 50 characters; `problems` checks the
// same three things, so a broken file fails the build before it reaches a report.

const ROOT = path.resolve(__dirname, '../..');
const SPEAKERS_LISTED = 15;

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

const NETWORKS = { twitter: 'X', linkedin: 'LinkedIn', youtube: 'YouTube', github: 'GitHub', tiktok: 'TikTok', portal: 'GitNation' };

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decodeEntities = (text) =>
	text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code) => {
		if (code[0] !== '#') return ENTITIES[code.toLowerCase()] || match;
		return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10));
	});

// Rich text reaches the build as HTML; paragraphs survive as blank lines, everything else goes.
const plainText = (html) =>
	decodeEntities(
		String(html || '')
			.replace(/<\/(p|div|li|h\d)>|<br\s*\/?>/gi, '\n')
			.replace(/<[^>]+>/g, '')
	)
		.split('\n')
		.map((line) => line.replace(/\s+/g, ' ').trim())
		.filter(Boolean)
		.join('\n\n');

const oneLine = (text) => plainText(text).replace(/\s+/g, ' ');

const linkText = (text) => text.replace(/[[\]]/g, '\\$&');

const withSlash = (url) => (url ? url.replace(/\/?$/, '/') : '');

// Intl puts thin spaces around the range dash; plain ones read the same everywhere.
const formatDates = (start, end, timeZone = 'UTC') => {
	if (!start) return '';
	const format = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone });
	const text = end ? format.formatRange(new Date(start), new Date(end)) : format.format(new Date(start));
	return text.replace(/\s/g, ' ');
};

const pageRank = (file) => {
	const rank = Object.keys(PAGE_LABELS).indexOf(file);
	return rank === -1 ? Infinity : rank;
};

const pagesOf = (builtPages, cmsPages, url, homeDescription) =>
	builtPages
		.slice()
		.sort((a, b) => pageRank(a.file) - pageRank(b.file) || a.file.localeCompare(b.file))
		.map(({ file, key }) => {
			const description = ((cmsPages[key] || {}).seo || {}).description || '';
			return {
				label: PAGE_LABELS[file] || capitalize(file.replace(/-/g, ' ')),
				url: file === 'index' ? url : url + file,
				// Home's description repeats the summary above the list, and a page carrying the same
				// one says nothing new about itself.
				description: file === 'index' || description === homeDescription ? '' : description,
			};
		});

const sectionsOf = (cmsPages, keys, blockType) =>
	keys.flatMap((key) => ((cmsPages[key] || {}).sections || []).filter((section) => section.blockType === blockType));

const unique = (values) => values.filter((value, index) => values.findIndex((other) => other.toLowerCase() === value.toLowerCase()) === index);

// Community and media partners are a long list of names that answer no question about the event.
const PARTNERS_ONLY = /^(community |media )?partners$/i;

// The remote page carries its own price list; the same ticket on both pages is listed once.
const ticketsOf = (cmsPages) =>
	sectionsOf(cmsPages, ['main', 'remote'], 'prices')
		.flatMap((prices) =>
			(prices.groups || []).flatMap((group) =>
				(group.tickets || []).map((ticket) => ({
					group: oneLine(group.label),
					title: oneLine(ticket.title),
					price: oneLine(ticket.price),
					date: oneLine(ticket.date),
				}))
			)
		)
		.filter((ticket, index, tickets) => ticket.title && tickets.findIndex((other) => other.title === ticket.title && other.price === ticket.price) === index);

// Everything the file says about one edition. `builtPages` are the pages the build rendered, as
// `{ file, key }`: the output file name and the CMS page key behind it.
const editionOf = ({ payload = {}, ems = {} }, settings, builtPages) => {
	const brand = payload.brand || {};
	const eventInfo = ems.eventInfo || {};
	const event = eventInfo.emsEvent || {};
	const cmsPages = payload.pages || {};
	const homeDescription = ((cmsPages.main || {}).seo || {}).description || '';
	const brandName = (settings.conferenceTitle || '').replace(/_/g, ' ');
	const url = withSlash(brand.url) + (settings.subPath || '');
	const start = payload.startTime || eventInfo.conferenceStart;
	const end = payload.endTime || eventInfo.conferenceFinish;
	const organizer = ((payload.components || {}).eventBy || {}).link;
	const [hero = {}] = sectionsOf(cmsPages, ['main'], 'hero');
	const [techs = {}] = sectionsOf(cmsPages, ['main'], 'techs');
	const [location = {}] = sectionsOf(cmsPages, ['main'], 'location');

	return {
		conferenceTitle: settings.conferenceTitle,
		brand: brandName,
		name: event.name || brandName,
		tagline: event.brand && event.brand.tagline ? event.brand.tagline.replace(/\.$/, '') : '',
		about: plainText(event.description) || homeDescription,
		start,
		end,
		dates: formatDates(start, end, settings.timezone),
		location: event.location || brand.city || '',
		venue: oneLine(location.address),
		topics: unique((techs.items || []).map((item) => oneLine(item.title)).filter(Boolean)),
		numbers: (hero.stats || []).map((stat) => oneLine(`${stat.value || ''} ${stat.description || ''}`)).filter(Boolean),
		url,
		subPath: settings.subPath || '',
		organizer: organizer && organizer.url ? { label: organizer.label, url: organizer.url } : null,
		pages: pagesOf(builtPages, cmsPages, url, homeDescription),
		tickets: ticketsOf(cmsPages),
		speakers: (ems.speakers || []).map((speaker) => ({
			name: speaker.name.trim(),
			company: (speaker.company || '').trim(),
			about: oneLine(speaker.superpower || speaker.shortBio),
		})),
		workshops: (ems.workshops || []).map((workshop) => ({
			title: workshop.title.trim(),
			by: [workshop.speaker && workshop.speaker.name, ...(workshop.trainers || []).map((trainer) => trainer.name)]
				.filter(Boolean)
				.map((name) => name.trim())
				.filter((name, index, names) => names.indexOf(name) === index),
		})),
		sponsors: (ems.sponsors || [])
			.map((group) => ({ tier: group.title || group.type, names: (group.list || []).map((item) => item.alt || item.id).filter(Boolean) }))
			.filter((group) => group.names.length && !PARTNERS_ONLY.test(group.tier)),
		socials: (brand.socials || [])
			.filter((social) => social.url)
			.map((social) => ({ label: NETWORKS[social.network] || capitalize(social.network), url: social.url })),
	};
};

const section = (title, items) => (items.length ? [`## ${title}`, '', ...items, ''] : []);

const whenAndWhere = (edition) => [edition.dates, edition.location].filter(Boolean).join(', ');

const finish = (lines) =>
	`${lines
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()}\n`;

const renderEdition = (edition) => {
	const summary = [edition.tagline, whenAndWhere(edition)].filter(Boolean).join('. ');
	const moreSpeakers = edition.speakers.length - SPEAKERS_LISTED;
	const workshopsPage = edition.pages.find((page) => page.label === 'Workshops');
	const ticketPages = edition.pages.filter((page) => page.label === 'Tickets' || page.label === 'Remote tickets');

	return finish([
		`# ${edition.name}`,
		'',
		...(summary ? [`> ${summary}.`, ''] : []),
		...(edition.about ? [edition.about, ''] : []),
		...section(
			'Event',
			[
				edition.dates && `- Dates: ${edition.dates}`,
				edition.location && `- Location: ${edition.location}`,
				edition.venue && `- Venue: ${edition.venue}`,
				edition.topics.length && `- Topics: ${edition.topics.join(', ')}`,
				edition.numbers.length && `- In numbers: ${edition.numbers.join(' · ')}`,
				`- Website: [${linkText(edition.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}](${edition.url})`,
				edition.organizer && `- Organized by [${linkText(edition.organizer.label)}](${edition.organizer.url})`,
			].filter(Boolean)
		),
		...section('Tickets', [
			...edition.tickets.map(
				(ticket) =>
					`- ${ticket.title}${ticket.group ? ` (${ticket.group})` : ''}${ticket.price ? `: ${ticket.price}` : ''}${ticket.date ? ` — ${ticket.date}` : ''}`
			),
			...(edition.tickets.length ? ticketPages.map((page) => `- Buy: [${page.label}](${page.url})`) : []),
		]),
		...section(
			'Pages',
			edition.pages.map((page) => `- [${linkText(page.label)}](${page.url})${page.description ? `: ${page.description}` : ''}`)
		),
		...section('Speakers', [
			...edition.speakers
				.slice(0, SPEAKERS_LISTED)
				.map((speaker) => `- ${speaker.name}${speaker.company ? `, ${speaker.company}` : ''}${speaker.about ? ` — ${speaker.about}` : ''}`),
			...(moreSpeakers > 0 ? [`- …and ${moreSpeakers} more on [the website](${edition.url})`] : []),
		]),
		...section('Workshops', [
			...edition.workshops.map((workshop) => `- ${workshop.title}${workshop.by.length ? ` — ${workshop.by.join(', ')}` : ''}`),
			...(edition.workshops.length && workshopsPage ? [`- Details and tickets: [${workshopsPage.label}](${workshopsPage.url})`] : []),
		]),
		...section(
			'Sponsors and partners',
			edition.sponsors.map((group) => `- ${group.tier}: ${group.names.join(', ')}`)
		),
		...section(
			'Follow',
			edition.socials.map((social) => `- [${linkText(social.label)}](${social.url})`)
		),
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
		`${root.brand} runs in several cities. Each edition has its own website and its own llms.txt with its dates, speakers, workshops and tickets.`,
		'',
		...section('Editions', editions.map(editionLine)),
		...section(
			'Follow',
			root.socials.map((social) => `- [${linkText(social.label)}](${social.url})`)
		),
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
		return JSON.parse(fs.readFileSync(editionPath(folder), 'utf8'));
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
		const file = path.join(ROOT, 'build', folder, edition.subPath, 'llms.txt');
		if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8').includes(OTHER_EDITIONS)) return;

		if (edition.subPath === '' && upcoming.length && !upcoming.some((other) => other.url === edition.url)) {
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

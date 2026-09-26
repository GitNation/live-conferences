const nunjucks = require('nunjucks');

const ENV_OPTIONS = { watch: false };

const tzParts = (iso, timeZone) => {
	if (!iso) return null;
	const d = new Date(iso);
	if (isNaN(d.getTime())) return null;
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: timeZone || 'UTC',
		hour12: false,
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit',
	}).formatToParts(d).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
	const hour = parts.hour === '24' ? '00' : parts.hour;
	return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${hour}:${parts.minute}` };
};

const manageEnvironment = function(environment) {
	environment.addFilter('tzDate', (iso, timeZone) => { const p = tzParts(iso, timeZone); return p ? p.date : ''; });
	environment.addFilter('tzTime', (iso, timeZone) => { const p = tzParts(iso, timeZone); return p ? p.time : ''; });

	// arr | filterBy('attr', value) — items where item.attr === value.
	// value undefined/null is a no-op passthrough (e.g. attendance unset on every other conference/page).
	environment.addFilter('filterBy', (arr, attr, value) => {
		if (value === undefined || value === null) return arr;
		return (arr || []).filter((item) => item && item[attr] === value);
	});

	// speakers with a talk carrying that label come first; no label — no reorder
	environment.addFilter('sortByTalkLabel', (arr, label) => {
		if (label === undefined || label === null) return arr;
		const list = arr || [];
		const hasLabel = (person) => {
			const activities = person && person.activities ? person.activities : {};
			const talks = [].concat(activities.talks || [], activities.offlineTalks || []);
			return talks.some((talk) => (talk.labels || [talk.label]).includes(label));
		};
		return [...list.filter(hasLabel), ...list.filter((person) => !hasLabel(person))];
	});

	environment.addGlobal('confUrl', function(page) {
		const ctx = (this && this.ctx) || {};
		return '/' + (ctx.subPath || '') + [ctx.pageDir, page].filter(Boolean).join('-');
	});

	environment.addGlobal('editable', function(row, field) {
		const ctx = (this && this.ctx) || {};
		if (!ctx.PREVIEW || !row || !row._path) return '';
		return new nunjucks.runtime.SafeString(`data-payload-path="${field ? `${row._path}.${field}` : row._path}"`);
	});
};

const createEnvironment = (templatesPath) => {
	const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(templatesPath), ENV_OPTIONS);
	manageEnvironment(environment);
	return environment;
};

module.exports = { manageEnvironment, createEnvironment };

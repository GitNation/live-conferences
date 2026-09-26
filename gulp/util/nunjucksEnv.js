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

	// Marks a row for the admin's click-to-edit by the id Payload gives every array and blocks row;
	// `field` points at a group inside it (`editable(checkoutData, 'addons')`). Preview renders only.
	environment.addGlobal('editable', function(row, field) {
		const ctx = (this && this.ctx) || {};
		if (!ctx.PREVIEW || !row || !row.id) return '';
		return new nunjucks.runtime.SafeString(`data-payload-id="${row.id}"${field ? ` data-payload-field="${field}"` : ''}`);
	});

	// Another document than the page — the conference behind the header, a FAQ entry — opened in a
	// drawer; `field` opens that field in it (`editableDoc('conferences', payload.conferenceId, 'header')`).
	environment.addGlobal('editableDoc', function(collection, id, field) {
		const ctx = (this && this.ctx) || {};
		if (!ctx.PREVIEW || !collection || id == null) return '';
		return new nunjucks.runtime.SafeString(`data-payload-doc="${collection}:${id}"${field ? ` data-payload-field="${field}"` : ''}`);
	});
};

const createEnvironment = (templatesPath) => {
	const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(templatesPath), ENV_OPTIONS);
	manageEnvironment(environment);
	return environment;
};

module.exports = { manageEnvironment, createEnvironment };

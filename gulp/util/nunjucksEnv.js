const nunjucks = require('nunjucks');

// Shared by the Gulp build and ci/functions/preview so the two render alike.
//
// `{ watch: false }` is the whole of the options on purpose: it is what
// gulp-nunjucks-render defaults to, so anything added here — trimBlocks, say — would
// reflow every template the build has ever produced.
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
};

const createEnvironment = (templatesPath) => {
	const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(templatesPath), ENV_OPTIONS);
	manageEnvironment(environment);
	return environment;
};

module.exports = { manageEnvironment, createEnvironment };

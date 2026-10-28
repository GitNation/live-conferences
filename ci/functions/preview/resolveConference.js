const fs = require('fs');
const path = require('path');

// Wherever Netlify unpacks the function, the build's files are found from the repository root.
const findRepoRoot = () => {
	let dir = __dirname;
	for (let i = 0; i < 6; i += 1) {
		if (fs.existsSync(path.join(dir, 'src', 'conferences'))) return dir;
		dir = path.dirname(dir);
	}
	throw new Error('preview: could not locate src/conferences from ' + __dirname);
};

// A conference is its folder, so `key` names it outright. The older pair — brand title and event
// year — is still accepted while the CMS carries both. gulp/config.js builds its paths off the
// working directory, hence the chdir.
const resolveConference = ({ key, title, year }) => {
	if (!key && !title) return null;
	const root = findRepoRoot();
	process.chdir(root);

	const dir = path.join(root, 'src', 'conferences');
	if (key) return fs.existsSync(path.join(dir, key, 'conference-settings.js')) ? key : null;
	for (const entry of fs.readdirSync(dir)) {
		const settingsPath = path.join(dir, entry, 'conference-settings.js');
		if (!fs.existsSync(settingsPath)) continue;
		let settings;
		try {
			settings = require(settingsPath);
		} catch {
			continue;
		}
		if (settings.conferenceTitle === title && (!year || settings.eventYear === year)) return entry;
	}
	return null;
};

// gulp/config.js and getSettings.js read CONF_CODE once, when they load — the build was never
// meant to serve two conferences from one process. A warm function asked for another one drops
// them, so the next require reads the new conference.
const switchConference = (conf) => {
	Object.keys(require.cache)
		.filter((file) => file.includes(`${path.sep}gulp${path.sep}`))
		.forEach((file) => delete require.cache[file]);
	process.env.CONF_CODE = conf;
};

module.exports = { resolveConference, switchConference };

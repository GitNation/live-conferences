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

// A conference is its folder, so the key names it outright. gulp/config.js builds its paths off
// the working directory, hence the chdir.
const resolveConference = ({ key }) => {
	if (!key) return null;
	const root = findRepoRoot();
	process.chdir(root);

	return fs.existsSync(path.join(root, 'src', 'conferences', key, 'conference-settings.js')) ? key : null;
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

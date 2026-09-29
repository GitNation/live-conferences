const path = require('path');

const folderName = process.env.CONF_CODE;

// A computed path, not a template literal: the Netlify function bundler tries to resolve a template
// literal's static prefix and fails; the settings files reach the preview function through
// `included_files` in netlify.toml instead.
const settings = require(path.join(__dirname, '../../src/conferences', folderName, 'conference-settings'));

module.exports = settings;

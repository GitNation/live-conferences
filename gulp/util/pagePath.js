const path = require('path');

const pagePath = (templatesDir, filePath) => {
	const relative = path.relative(templatesDir, filePath).split(path.sep).join('/').replace(/\.html$/, '');
	return relative === 'index' ? '' : relative.replace(/(^|\/)index$/, '/');
};

module.exports = { pagePath };

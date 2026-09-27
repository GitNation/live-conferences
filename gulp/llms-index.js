// The last step of a multi-city build (`build:aics` and the like), once every city has been copied
// into build/<brand>/. Usage: node gulp/llms-index.js <brand folder>
// Like the per-edition files, it never fails the build: the editions keep their own files as they are.
const { writeBrandIndex } = require('./util/llmsTxt');

try {
	writeBrandIndex(process.argv[2]);
} catch (error) {
	console.warn(`llms.txt brand index for ${process.argv[2]} left out: ${error.message}`);
}

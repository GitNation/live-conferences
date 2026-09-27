// The last step of a multi-city build (`build:aics` and the like), once every city has been copied
// into build/<brand>/. Usage: node gulp/llms-index.js <brand folder>
const { writeBrandIndex } = require('./util/llmsTxt');

writeBrandIndex(process.argv[2]);

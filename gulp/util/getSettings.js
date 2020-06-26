const folderName = process.env.CONF_CODE;

const settings = require(`../../src/conferences/${folderName}/conference-settings`);

module.exports = settings;

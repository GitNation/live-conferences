const axios = require('axios');
const { getSite, enableBuilds, startBuild } = require('./api');

exports.createBuild = async ({ siteId, userName }) => {
  const site = await getSite();
  // console.log('exports.createBuild -> site', site);
  await enableBuilds(true);
  const build = await startBuild();
  await enableBuilds(false);
  // console.log('exports.createBuild -> build', build);
  return JSON.stringify({
    response_type: 'ephemeral', // 'in_channel' | 'ephemeral'
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: "*It's 80 degrees right now.*",
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hi ${userName}! Created new deploy`,
        },
      },
    ],
  });
};

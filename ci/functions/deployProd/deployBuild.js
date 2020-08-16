const axios = require('axios');

exports.deployBuild = ({ siteId, userName }) => {
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
          text: `Hi ${userName}! Your deployId is ${deployId}`,
        },
      },
    ],
  });
};

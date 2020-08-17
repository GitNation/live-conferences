exports.slackMessageOnSuccessDeploy = ({ siteUrl, deployId }) => {
  const message = {
    response_type: 'ephemeral', // 'in_channel' | 'ephemeral'
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `You successfully rolled out the version with Deploy ID *${deployId}* to <${siteUrl}|production>`,
        },
      },
    ],
  };
  return message;
};

exports.slackMessageOnProgressDeploy = ({
  previewUrl,
  deployId,
  commandName,
}) => {
  const message = {
    response_type: 'ephemeral', // 'in_channel' | 'ephemeral'
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `The version with Deploy ID *${deployId}* is still building.\nPlease wait when it ready, <${previewUrl}|check it out> and then repeat this command again\n\`${commandName} ${deployId}\``,
        },
      },
    ],
  };
  return message;
};

exports.slackMessageOnCompletedDeploy = ({ deployId }) => {
  const message = {
    response_type: 'ephemeral', // 'in_channel' | 'ephemeral'
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `The version with Deploy ID *${deployId}* is already deployed`,
        },
      },
    ],
  };
  return message;
};

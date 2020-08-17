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

exports.slackMessageToChannel = ({
  userName,
  siteUrl,
  screenshotUrl,
  siteName,
  buildId,
  deployId,
  branch,
  adminUrl,
}) => {
  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${siteName} :tada:`,
          emoji: true,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'image',
            image_url: `${siteUrl}/img/favicon.png`,
            alt_text: 'favicon',
          },
          {
            type: 'mrkdwn',
            text: `${siteUrl}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `
          Was deployed to *production* by @${userName}\n\n*Branch:* ${branch}\n*Netlify app:* ${adminUrl}\n*Deploy ID:* \`${deployId}\`\n*Build ID:* \`${buildId}\`
          `,
        },
        accessory: {
          type: 'image',
          image_url: `${screenshotUrl}`,
          alt_text: 'site screenshot',
        },
      },
    ],
  };
  return message;
};

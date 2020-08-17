exports.slackMessageOnBuild = ({
  userName,
  siteUrl,
  screenshotUrl,
  previewUrl,
  commandName,
  buildId,
  deployId,
  branch,
  repoUrl,
  adminUrl,
}) => {
  const message = {
    response_type: 'ephemeral', // 'in_channel' | 'ephemeral'
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hey @${userName}\nYou've launched the building of a prod version of\n${siteUrl}`,
        },
        accessory: {
          type: 'image',
          image_url: `${screenshotUrl}`,
          alt_text: 'cute cat',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `In a few minutes it will be ready for preview on this temporary link:\n${previewUrl}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `This preview link is *the last frontier* before deploying it to production. Please inspect this preview and if you're happy with it submit deploying by a command:\n\`${commandName} ${deployId}\`\nIf something is required to be fixed, make changes and start again with the command \n\`${commandName}\``,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Branch:*\n${branch}`,
          },
          {
            type: 'mrkdwn',
            text: `*Github repo:*\n${repoUrl}`,
          },
          {
            type: 'mrkdwn',
            text: `*Netlify app:*\n${adminUrl}`,
          },
          {
            type: 'mrkdwn',
            text: `*Prod URL:*\n${siteUrl}`,
          },
          {
            type: 'mrkdwn',
            text: `*Build ID:*\n${buildId}`,
          },
          {
            type: 'mrkdwn',
            text: `*Deploy ID:*\n${deployId}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: true,
              text: 'Submit Deploy',
            },
            style: 'primary',
            value: '/testfunc',
          },
        ],
      },
    ],
  };
  return message;
};

const queryString = require('query-string');
const axios = require('axios');
const { createBuild } = require('../deployProd/createBuild');
const { deployBuild } = require('../deployProd/deployBuild');
const { verify } = require('../deployProd/slack-signed-secrets');

const secret = process.env.SLACK_SECRET;

/**
 * The slow half of a `/deploy-*` command. deployProd has already answered Slack by
 * the time this runs, so the real message goes back through `response_url` — it stays
 * valid for 30 minutes. The Slack signature is re-checked here because this endpoint
 * is publicly reachable on its own.
 */
exports.handler = async (event) => {
  const { headers, body: rawBody } = event;

  try {
    verify({
      secret,
      signature: headers['x-slack-signature'],
      timestamp: headers['x-slack-request-timestamp'],
      rawBody,
    });
  } catch (err) {
    console.error(err);
    return { statusCode: 401, body: 'Incorrect signature' };
  }

  const body = queryString.parse(rawBody);

  try {
    const deployId = body.text || undefined;
    const userName = body.user_name;
    const commandName = body.command;

    if (deployId) {
      console.log('\n\n\n\n####### New Deploy #########\n\n');
      await respond(body.response_url, await deployBuild({ userName, commandName, deployId }));
    } else {
      console.log('\n\n\n\n####### New Build #########\n\n');
      await respond(body.response_url, await createBuild({ userName, commandName }));
    }
  } catch (err) {
    console.error(err);
    await respond(body.response_url, { response_type: 'ephemeral', text: err.message });
  }

  return { statusCode: 200, body: '' };
};

const respond = async (responseUrl, message) => {
  if (!responseUrl) {
    return;
  }
  await axios.post(
    responseUrl,
    { ...message, replace_original: true },
    { headers: { 'content-type': 'application/json' } }
  );
};

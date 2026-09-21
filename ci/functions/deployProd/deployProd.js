const queryString = require('query-string');
const axios = require('axios');
const { verify } = require('./slack-signed-secrets');

const secret = process.env.SLACK_SECRET;
const workerPath = '/.netlify/functions/deployProdWorker';

/**
 * Slack drops a slash command with `operation_timeout` after 3 seconds, which is
 * less than the Netlify API needs. So this function only acknowledges the command
 * and hands the actual work to deployProdWorker, which replies through `response_url`.
 */
exports.handler = async (event) => {
  const { headers, httpMethod, body: rawBody } = event;

  try {
    verify({
      secret,
      signature: headers['x-slack-signature'],
      timestamp: headers['x-slack-request-timestamp'],
      rawBody,
    });

    if (httpMethod !== 'POST') {
      throw new Error('wrong httpMethod');
    }

    if (!queryString.parse(rawBody).response_url) {
      throw new Error('no response_url in the Slack payload');
    }

    await startWorker({ headers, rawBody });

    return reply('Got it — asking Netlify. Details will land here in a moment.');
  } catch (err) {
    console.error(err);
    return reply(err.message);
  }
};

/**
 * The worker is invoked over HTTP and we walk away before it answers — waiting for
 * it is exactly what blows the 3 second budget. A second is plenty to get the
 * request out, and the worker runs to completion once Netlify has accepted it.
 */
const startWorker = async ({ headers, rawBody }) => {
  try {
    await axios.post(`https://${headers.host}${workerPath}`, rawBody, {
      timeout: 1000,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-slack-signature': headers['x-slack-signature'],
        'x-slack-request-timestamp': headers['x-slack-request-timestamp'],
      },
    });
  } catch (err) {
    if (err.code !== 'ECONNABORTED' && err.code !== 'ETIMEDOUT') {
      throw err;
    }
  }
};

const reply = (text) => ({
  statusCode: 200,
  headers: {
    'Content-type': 'application/json',
  },
  body: JSON.stringify({ response_type: 'ephemeral', text }),
});

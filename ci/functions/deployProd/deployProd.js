const queryString = require('query-string');
const { createBuild } = require('./createBuild');
const { deployBuild } = require('./deployBuild');

const siteId = process.env.SITE_ID;

exports.handler = async (event, context, callback) => {
  try {
    const {
      path,
      httpMethod,
      headers,
      queryStringParameters,
      isBase64Encoded,
    } = event;
    const body = await queryString.parse(event.body);
    // console.log('\n\nexports.handler -> event', {
      //   path,
      //   httpMethod,
    //   headers,
    //   queryStringParameters,
    //   body,
    //   isBase64Encoded,
    // });

    if (httpMethod !== 'POST') {
      throw new Error('wrong httpMethod');
    }

    const deployId = body.text || undefined;
    const userName = body.user_name;
    const commandName = body.command;

    let response;

    if (deployId) {
      console.log('\n\n\n\n####### New Deploy #########\n\n');
      response = await deployBuild({ userName, commandName, deployId });
    } else {
      console.log('\n\n\n\n####### New Build #########\n\n');
      response = await createBuild({ userName, commandName });
    }

    callback(null, {
      statusCode: 200,
      headers: {
        'Content-type': 'application/json',
      },
      body: response,
    });
  } catch (err) {
    console.error(err);
    callback(null, {
      statusCode: 200,
      // headers: {
      //   'Content-type': 'application/json',
      // },
      body: err.message,
    });
  }
};

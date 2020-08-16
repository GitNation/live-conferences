const queryString = require('query-string');
const { createBuild } = require('./createBuild');
const { deployBuild } = require('./deployBuild');

const siteId = process.env.SITE_ID;

exports.handler = async (event, context, callback) => {
  try {
    console.log('\n\n\n\n################\n\n');
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

    let response;

    if (deployId) {
      response = await deployBuild({ siteId, userName });
    } else {
      response = await createBuild({ siteId, userName });
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

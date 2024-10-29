const handler = async (event) => {
  const allowedOrigins = process.env.MAILCHIMP_ALLOWED_ORIGINS;

  if (!allowedOrigins) {
    console.error('[ERROR] Missing MAILCHIMP_ALLOWED_ORIGINS env variable');
    return { body: JSON.stringify({ error: '[ERROR] Missing MAILCHIMP_ALLOWED_ORIGINS env variable' }), statusCode: 400 };
  }

  const origin = event.headers.origin || event.headers.Origin;
  const allowedOriginsList = allowedOrigins.split(',');

  const isAllowedOrigin = allowedOriginsList.includes(origin);
  if (!isAllowedOrigin) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: `[ERROR] Origin ${origin} not allowed.`,
      }),
    };
  }

  const token = process.env.MAILCHIMP_API_KEY;

  if (!token) {
    console.error('[ERROR] Missing MAILCHIPM_API_KEY env variable');
    return { body: JSON.stringify({ error: '[ERROR] Missing MAILCHIPM_API_KEY env variable' }), statusCode: 400 };
  }

  const dc = token.split('-')[1];

  let body;

  try {
    body = await JSON.parse(event.body);
  } catch (e) {
    console.log(event);
    return { body: JSON.stringify({ error: `[ERROR] Invalid JSON - ${e.message}` }), statusCode: 400 };
  }

  const data = body.data;
  if (!data.email) {
    const errorMessage = '[ERROR] Required fields not defined.';
    console.log(errorMessage);
    return { body: JSON.stringify({ error: errorMessage }), statusCode: 200 };
  }

  const isSubscribed = await checkIfEmailIsAlreadySubscribedAnywhere({ email: data.email, dc, token });

  if (isSubscribed) {
    return { body: JSON.stringify({ data: { isExists: true } }), statusCode: 200 };
  }

  return { body: JSON.stringify({ data: { isExists: false } }), statusCode: 200 };
};

module.exports = { handler };

function checkIfEmailIsAlreadySubscribedAnywhere({ email, dc, token }) {
  return fetch(`https://${dc}.api.mailchimp.com/3.0/search-members?query=${email}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => response.json())
    .then((data) => {
      return data && data.exact_matches && data.exact_matches.members > 0;
    });
}

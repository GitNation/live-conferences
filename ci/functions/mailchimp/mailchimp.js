const handler = async (event) => {
  // const allowedOrigins = process.env.MAILCHIMP_ALLOWED_ORIGINS;
  //
  // if (!allowedOrigins) {
  //   console.error('[ERROR] Missing MAILCHIMP_ALLOWED_ORIGINS env variable');
  //   return { body: JSON.stringify({ error: '[ERROR] Missing MAILCHIMP_ALLOWED_ORIGINS env variable' }), statusCode: 400 };
  // }
  //
  // const origin = event.headers.origin || event.headers.Origin;
  // const allowedOriginsList = allowedOrigins.split(',');
  //
  // const isAllowedOrigin = allowedOriginsList.includes(origin);
  // if (!isAllowedOrigin) {
  //   return {
  //     statusCode: 401,
  //     body: JSON.stringify({
  //       error: `[ERROR] Origin ${origin} not allowed.`,
  //     }),
  //   };
  // }

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
  if (!body.listId || !data || !data.email || !data.status) {
    const errorMessage = '[ERROR] Required fields not defined.';
    console.log(errorMessage);
    return { body: JSON.stringify({ error: errorMessage }), statusCode: 200 };
  }

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${body.listId}/members?skip_merge_validation=true`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        email_address: data.email,
        status: data.status,
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const result = await response.json();

    if (!response.ok) {
      return { body: JSON.stringify({ error: result.detail, mailchimpErrors: result.errors || [], data: result }), statusCode: response.status };
    }

    return { body: JSON.stringify({ error: false, data: result }), statusCode: response.status };
  } catch (error) {
    console.error('[ERROR] Problem with request:', error);
    return { body: JSON.stringify({ error: '[ERROR] Problem with request' }), statusCode: 400 };
  }
};

module.exports = { handler };

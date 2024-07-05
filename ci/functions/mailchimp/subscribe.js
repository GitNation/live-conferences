export default async (request, context) => {
  const token = process.env.MAILCHIPM_API_KEY;

  if (!token) {
    console.error('[ERROR] Missing Mailchimp API key');
    return new Response('[ERROR] Missing Mailchimp API key', { status: 400 });
  }

  const dc = token.split('-')[1];

  let body;

  try {
    body = await request.json();
  } catch (e) {
    console.log(event);
    return new Response(`[ERROR] Invalid JSON - ${e.message}`, { status: 400 });
  }

  const data = body.data;
  if (!data || !data.listId || !data.data || !data.data.email) {
    const errorMessage = '[ERROR] Required fields not defined.';
    console.log(errorMessage);
    return new Response(errorMessage, { status: 200 });
  }

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${body.data.listId}/members?skip_merge_validation=false`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        ...data.data,
      }),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });

    return new Response(res.body, { status: res.status });
  } catch (error) {
    console.error('[ERROR] Problem with request:', error);
    return new Response('[ERROR] Problem with request', { status: 400 });
  }
};

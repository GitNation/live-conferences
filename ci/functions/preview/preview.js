const { renderPreview, error } = require('./renderPreview');

// Called only by the CMS (/api/site-preview), which adds the secret server-side — pages are not
// public in Payload, and this renders them. Unset means preview is not configured here.
exports.handler = async (event) => {
	const secret = process.env.PREVIEW_SECRET;
	if (!secret || event.headers['x-preview-secret'] !== secret) {
		return error(401, 'Preview unavailable: missing or invalid secret.');
	}

	let doc = null;
	if (event.httpMethod === 'POST' && event.body) {
		try {
			doc = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body).doc;
		} catch {
			return error(400, 'Preview body is not JSON.');
		}
	}

	return renderPreview(event.queryStringParameters || {}, { doc });
};

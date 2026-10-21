export default async function country(request, context) {
	return new Response(JSON.stringify({
		countryCode: context.geo?.country?.code || null,
	}), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'private, no-store',
		},
	});
}

export const config = { path: '/api/country' };

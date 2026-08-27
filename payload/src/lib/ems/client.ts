// GitNation's event management API — public, no token. Every resource hangs off
// one event id, so one factory covers them all:
// https://ems.gitnation.org/api/events/<id>/<path>
//
// `Accept-Encoding: identity` is carried over from the content layer: the
// gzipped HTTP/2 stream from EMS (Cloudflare -> Render origin) drops mid-flight
// from some networks, throwing ERR_STREAM_PREMATURE_CLOSE inside Gunzip.

const BASE_URL = process.env.EMS_URL || 'https://ems.gitnation.org';

const eventFetch = (path: string) => async (eventId?: number | null) => {
	if (!eventId) return null;

	const url = `${BASE_URL}/api/events/${eventId}${path && `/${path}`}`;

	// A rejected fetch — the dropped stream above, DNS, a reset — must not take the
	// other ten resources down with it: the endpoint awaits them together, so one
	// throw would discard every answer that did arrive.
	try {
		const res = await fetch(url, { headers: { 'Accept-Encoding': 'identity' } });
		if (!res.ok) {
			console.warn(`EMS ${res.status} for ${url}`);
			return null;
		}
		return await res.json();
	} catch (err) {
		console.warn(`EMS unreachable for ${url}: ${(err as Error).message}`);
		return null;
	}
};

export const getEvent = eventFetch('');
export const getSpeakers = eventFetch('speakers');
export const getPastSpeakers = eventFetch('speakers/past');
export const getCommittee = eventFetch('users?role=PC');
export const getMcs = eventFetch('users?role=MC');
export const getWorkshops = eventFetch('workshops');
export const getPartners = eventFetch('partners');
export const getSchedule = eventFetch('schedule');
export const getDiscussionRooms = eventFetch('discussion-rooms');
export const getBrand = eventFetch('brand');
export const getLandingLinks = eventFetch('latestLinks');

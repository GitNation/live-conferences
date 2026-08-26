// GET /api/ems/content?conference=<id>
//
// The static build asks Payload for everything EMS holds about one edition;
// Payload owns the EMS calls so the site never talks to EMS itself. An edition
// opts in with `useEmsData` + `emsEventId` on its conference — without them the
// answer is empty, which is also what a brand still living on Hygraph gets,
// since it has no Payload conference at all.
//
// The event is returned once, wrapped in `eventInfo`; `brand` passes through as EMS
// returns it.
// The schedule is grouped into the day/track/hour grid the schedule page needs;
// which day a slot belongs to depends on the conference timezone, so the caller
// passes it (the Gulp bridge reads it off conference-settings.js).
import type { Endpoint } from 'payload';
import {
	getBrand,
	getCommittee,
	getDiscussionRooms,
	getEvent,
	getLandingLinks,
	getMcs,
	getPartners,
	getPastSpeakers,
	getSchedule,
	getSpeakers,
	getWorkshops,
} from '@/lib/ems/client';
import { prepareDiscussions } from '@/lib/ems/prepareDiscussions';
import { prepareSchedule } from '@/lib/ems/prepareSchedule';
import { prepareSpeakers } from '@/lib/ems/prepareSpeakers';
import { prepareSponsors } from '@/lib/ems/prepareSponsors';
import { prepareWorkshops } from '@/lib/ems/prepareWorkshops';

// Nothing in EMS or the CMS ever carried a currency — graphql-content-layer derived the
// symbol from the conference timezone, so that rule lives on here. Order matters: an
// America/* zone is answered before the Canada check, exactly as it was there.
const currencyForTimezone = (timezone: string) => {
	if (timezone.includes('America')) return '$';
	if (timezone.includes('London')) return '£';
	if (timezone.includes('Canada')) return 'C$';
	return '€';
};

export const emsContent: Endpoint = {
	path: '/ems/content',
	method: 'get',
	handler: async (req) => {
		const { searchParams } = new URL(req.url || '', 'http://internal');
		const id = Number(searchParams.get('conference'));
		const timezone = searchParams.get('timezone') || 'Europe/Amsterdam';
		if (!id) return Response.json({});

		const conference = await req.payload
			.findByID({ collection: 'conferences', id, depth: 0 })
			.catch(() => null);

		const eventId = conference?.useEmsData ? conference.emsEventId : null;
		if (!eventId) return Response.json({});

		const [
			event,
			speakers,
			pastSpeakers,
			committee,
			mcs,
			workshops,
			partners,
			schedule,
			discussions,
			brand,
			landingLinks,
		] = await Promise.all([
			getEvent(eventId),
			getSpeakers(eventId),
			getPastSpeakers(eventId),
			getCommittee(eventId),
			getMcs(eventId),
			getWorkshops(eventId),
			getPartners(eventId),
			getSchedule(eventId),
			getDiscussionRooms(eventId),
			getBrand(eventId),
			getLandingLinks(eventId),
		]);

		const people = prepareSpeakers(speakers);

		return Response.json({
			// The React layer's own shape for the event — it reads `emsEvent`, `emsEventId` and
			// the two dates off one `eventInfo` object. Assembled here so a layout only forwards
			// it, and EMS is the only source: the conference's own dates never enter. Templates
			// read the event through this too, which is why it is not returned a second time.
			eventInfo: {
				emsEvent: event ?? null,
				emsEventId: event?.id ?? null,
				conferenceStart: event?.startDate ?? null,
				conferenceFinish: event?.endDate ?? null,
				currency: currencyForTimezone(timezone),
			},
			speakers: people,
			// Not a separate resource: the line-up lists talks, so it is the same
			// speakers narrowed to the ones who have one — the layer left that to
			// the template, which had to count them by hand.
			lineUp: people.filter((person) => person.activities.allTalks.length),
			pastSpeakers: prepareSpeakers(pastSpeakers),
			committee: prepareSpeakers(committee),
			mcs: prepareSpeakers(mcs),
			workshops: prepareWorkshops(workshops),
			sponsors: prepareSponsors(partners),
			schedule: prepareSchedule(schedule, people, timezone),
			discussions: prepareDiscussions(discussions),
			brand,
			landingLinks,
		});
	},
};

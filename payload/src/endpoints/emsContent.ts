// GET /api/ems/content?conference=<id>
//
// The static build asks Payload for everything EMS holds about one edition;
// Payload owns the EMS calls so the site never talks to EMS itself. An edition
// opts in with `useEmsData` + `emsEventId` on its conference — without them the
// answer is empty, which is also what a brand still living on Hygraph gets,
// since it has no Payload conference at all.
//
// `schedule`, `event` and `brand` pass through as EMS returns them — nothing
// reads them yet, and the layer shaped the schedule around its Hygraph tracks,
// so its normalization waits for a section that consumes it.
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
import { prepareSpeakers } from '@/lib/ems/prepareSpeakers';
import { prepareSponsors } from '@/lib/ems/prepareSponsors';
import { prepareWorkshops } from '@/lib/ems/prepareWorkshops';

export const emsContent: Endpoint = {
	path: '/ems/content',
	method: 'get',
	handler: async (req) => {
		const { searchParams } = new URL(req.url || '', 'http://internal');
		const id = Number(searchParams.get('conference'));
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
			event,
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
			schedule,
			discussions: prepareDiscussions(discussions),
			brand,
			landingLinks,
		});
	},
};

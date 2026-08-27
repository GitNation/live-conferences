import { convert as slugify } from 'url-slug';

const HOUR = 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, '0');

const dayStart = (iso: string) => {
	const date = new Date(iso);
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00.000Z`;
};

const cardSpeaker = (person: any) => ({
	id: person.id,
	name: person.name,
	avatar: person.avatar,
	companyWithCountry: person.companyWithCountry,
	bio: person.bio,
	socials: person.socials,
	slug: person.slug,
});

const formatActivity = (activity: any, trackName: string, people: Map<number, any>): any => {
	const { tags, subactivities = [], speakers = [], ...rest } = activity;

	return {
		...rest,
		speakers: speakers.map((speaker: any) => {
			const person = people.get(speaker.id);
			return person ? cardSpeaker(person) : speaker;
		}),
		isoDate: activity.startDate,
		text: activity.description,
		dayISO: activity.startDate ? dayStart(activity.startDate) : null,
		track: trackName,
		slug: activity.title ? slugify(activity.title) : null,
		isLightning: activity.eventType === 'LightningTalk' || activity.eventType === 'GroupLT',
		label: tags && tags[0] ? tags[0].label : null,
		tags,
		subactivities: subactivities.map((sub: any) => formatActivity(sub, trackName, people)),
	};
};

const groupByTime = (timezone: string) => {
	const dayMap = new Map<string, Map<string, Map<string, any[] | null>>>();
	const minMaxByDay = new Map<string, { min: string; max: string }>();

	const dayMapAdd = (isoTz: string, iso: string, trackName: string, event: any) => {
		const date = isoTz.split('T')[0];

		if (!dayMap.get(date)) dayMap.set(date, new Map());
		const trackMap = dayMap.get(date)!;

		if (!trackMap.get(trackName)) trackMap.set(trackName, new Map());
		const timeMap = trackMap.get(trackName)!;

		if (!timeMap.get(iso)) timeMap.set(iso, []);
		timeMap.get(iso)!.push(event);
	};

	const minMaxAdd = (isoTz: string, iso: string) => {
		const date = isoTz.split('T')[0];
		const container = minMaxByDay.get(date);

		if (!container) {
			minMaxByDay.set(date, { min: iso, max: iso });
			return;
		}
		if (iso < container.min) container.min = iso;
		if (iso > container.max) container.max = iso;
	};

	// an hour one track is missing keeps its row so the columns stay aligned; an
	// hour every track is missing would be a band of "no sessions" — drop it
	const normalizeDayMap = () => {
		for (const [day, trackMap] of dayMap.entries()) {
			const minMax = minMaxByDay.get(day)!;
			const min = new Date(minMax.min).getTime();
			const hours = Math.round((new Date(minMax.max).getTime() - min) / HOUR);

			for (let diff = 0; diff <= hours; diff++) {
				const date = new Date(min + diff * HOUR).toISOString();
				const tracks = Array.from(trackMap.values());
				if (!tracks.some((timeMap) => timeMap.get(date))) continue;

				for (const timeMap of tracks) {
					if (!timeMap.get(date)) timeMap.set(date, null);
				}
			}
		}
	};

	const mapToObject = (orderedTracks: string[]) => {
		const result: any[] = [];

		for (const [day, trackMap] of dayMap.entries()) {
			const dayBucket: any[] = [];

			for (const track of orderedTracks) {
				const timeMap = trackMap.get(track);
				if (!timeMap) continue;

				const trackBucket = Array.from(timeMap.keys())
					.sort()
					.map((date) => {
						const dateObj = new Date(date);
						const hour = dateObj.getUTCHours();
						const dayOfMonth = dateObj.getUTCDate();

						dateObj.setMinutes(59);
						dateObj.setSeconds(59);

						const events = timeMap.get(date);
						if (events) events.sort((a: any, b: any) => a.startDate.localeCompare(b.startDate));

						return {
							id: `time-${dayOfMonth}-${hour}-${hour + 1}`,
							start: date,
							end: dateObj.toISOString(),
							list: events,
						};
					});

				dayBucket.push({ track, list: trackBucket });
			}

			result.push({ day, list: dayBucket });
		}

		return result.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
	};

	return {
		groupTrack: (events: any[], trackName: string) => {
			for (const event of events) {
				if (!event.startDate) continue;

				const beginDate = new Date(event.startDate);
				// the day a slot belongs to is the local one, the slot itself is UTC
				const beginDateTz = new Date(beginDate.toLocaleString('en-US', { timeZone: timezone }));
				beginDate.setMinutes(0);
				beginDate.setSeconds(0);

				minMaxAdd(beginDateTz.toISOString(), beginDate.toISOString());
				dayMapAdd(beginDateTz.toISOString(), beginDate.toISOString(), trackName, event);
			}
		},
		buildObject: (orderedTracks: string[]) => {
			normalizeDayMap();
			return mapToObject(orderedTracks);
		},
	};
};

// EMS marks every activity as InPerson or Remote; the two schedules are the same
// tracks filtered by that flag, and a track with nothing in it is dropped.
const buildGrid = (tracks: any[], timezone: string, people: Map<number, any>) => {
	const { groupTrack, buildObject } = groupByTime(timezone);

	tracks.forEach((track) => {
		groupTrack(
			track.activities.map((activity: any) => formatActivity(activity, track.name, people)),
			track.name
		);
	});

	return buildObject(tracks.map((track) => track.name));
};

export const prepareSchedule = (raw: any, preparedSpeakers: any[], timezone: string) => {
	const tracks = raw || [];
	const people = new Map<number, any>((preparedSpeakers || []).map((person: any) => [person.id, person]));

	const [offline, remote] = ['InPerson', 'Remote'].map((format) =>
		tracks
			.map((track: any) => ({
				name: track.name,
				activities: (track.activities || []).filter((activity: any) => activity.format === format),
			}))
			.filter((track: any) => track.activities.length > 0)
	);

	return {
		remote: buildGrid(remote, timezone, people),
		offline: buildGrid(offline, timezone, people),
		tracksOrdered: tracks.map((track: any) => track.name),
	};
};

// Ported from the content layer's prepareSpeakers, minus its Hygraph branches.
// Turns an EMS person into what partials/mixins/_speaker.html reads: a flat
// object with `avatar` as a url, `avatarSizes`, `companyWithCountry`, `socials`
// and `activities.allTalks`. Speakers, committee and MCs share this shape.
//
// Slugs go through the same url-slug the layer used, so anchors and speaker
// video filenames stay exactly as they were.
import { convert as slugify } from 'url-slug';

const ICONS = {
	githubUrl: 'gh',
	portalUrl: 'portal',
	twitterUrl: 'tw',
	mediumUrl: 'med',
	ownSite: 'site',
	instagramUrl: 'instagram',
	linkedinUrl: 'in',
	blueskyUrl: 'bluesky',
};

const getSocials = (person: any) =>
	Object.entries(ICONS)
		.map(([key, icon]) => person[key] && { link: person[key], icon })
		.filter(Boolean);

// EMS keeps lightning talks apart from talks; the templates read one list.
const talksOf = (activities: any) => [...(activities?.lightningTalks || []), ...(activities?.talks || [])];

export const prepareSpeakers = (raw: any): any[] =>
	(raw || [])
		.filter((item: any) => item && item.speaker)
		.map(({ speaker, avatar, activities, offlineActivities, allActivities, ...rest }: any) => {
			const image = avatar || speaker.avatar || {};

			return {
				...speaker,
				...rest,
				id: speaker.id,
				slug: slugify(speaker.name),
				avatar: image.url || null,
				avatarSizes: image.size || null,
				companyWithCountry: [speaker.company, speaker.country].filter(Boolean).join(', '),
				socials: getSocials(speaker),
				activities: {
					talks: talksOf(activities),
					offlineTalks: talksOf(offlineActivities),
					allTalks: talksOf(allActivities),
				},
			};
		});

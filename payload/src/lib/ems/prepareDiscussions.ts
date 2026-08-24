// Ported from the content layer's fetchEmsDiscussionRooms: the room title
// doubles as the link text, and a room speaker's `location` is the `country`
// the speaker markup expects.
export const prepareDiscussions = (raw: any): any[] =>
	(raw || []).map((room: any) => ({
		...room,
		roomLinkText: room.title,
		speakers: (room.speakers || []).map((speaker: any) => ({ ...speaker, country: speaker.location })),
	}));

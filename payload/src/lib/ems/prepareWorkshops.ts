// Ported from the content layer's fetch-workshops, minus the Hygraph merge and
// its date arithmetic — EMS already gives startDate and endDate. What the layer
// called extension data arrives as `workshopExtensions[0]`; the templates read
// `location` and `includedToPackage` straight off the workshop, so it is
// flattened here.
//
// Two separate things the layer left as ternary chains in the template:
// `type` is what the badge says and the row is styled by, and it has only two
// states — a workshop is either in the full ticket or it is pro. `ticket` is
// which button sells it, and there the pass is its own case.
import { convert as slugify } from 'url-slug';

export const prepareWorkshops = (raw: any): any[] =>
	(raw || []).map(({ workshopExtensions, trainers, speaker, ...workshop }: any) => {
		const { extension, ...extensionFields } = (workshopExtensions || [])[0] || {};
		const people = trainers || [];
		const flat = { ...workshop, ...extensionFields, ...extension };

		return {
			...flat,
			type: flat.includedToPackage ? 'free' : 'pro',
			ticket: flat.includedToPackage ? 'free' : flat.workshopPass ? 'pass' : 'pro',
			speaker: speaker || {},
			trainers: people.map((trainer: any) => ({ ...trainer, slug: slugify(trainer.name) })),
			trainersTitle: people.map(({ name }: any) => name).join(', ') || speaker?.name,
			slug: slugify(workshop.title),
		};
	});

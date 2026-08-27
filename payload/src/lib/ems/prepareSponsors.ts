const TIERS = [
	{ type: 'Platinum', title: 'Platinum' },
	{ type: 'Gold', title: 'Gold' },
	{ type: 'Silver', title: 'Silver' },
	{ type: 'Founding', title: 'Founding Community Partners' },
	{ type: 'Media', title: 'Media Partners' },
	{ type: 'Community', title: 'Partners' },
	{ type: 'Tech', title: 'Tech Partners' },
	{ type: 'Entertainment', title: 'Entertainment partners' },
];

export const prepareSponsors = (raw: any): any[] => {
	const logos = (raw || []).map((partner: any) => ({
		id: partner.name,
		alt: partner.name,
		img: partner.logo,
		imgHandle: partner.logoHandle || null,
		link: partner.url,
		width: partner.width,
		shortDescription: partner.shortDescription,
		description: partner.description,
		type: partner.type,
	}));

	return TIERS.map(({ type, title }) => ({
		type,
		title,
		list: logos.filter((logo: any) => logo.type === type),
	})).filter((tier) => tier.list.length);
};

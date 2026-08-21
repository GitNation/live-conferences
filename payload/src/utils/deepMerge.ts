const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	!!value && typeof value === 'object' && !Array.isArray(value);

export const deepMerge = <T>(target: T, source: object = {}): T => {
	if (!isPlainObject(target) || !isPlainObject(source)) return (source as T) ?? target;

	return Object.entries(source).reduce<Record<string, unknown>>(
		(merged, [key, value]) => ({
			...merged,
			[key]: isPlainObject(value) && isPlainObject(merged[key]) ? deepMerge(merged[key], value) : value,
		}),
		{ ...target }
	) as T;
};

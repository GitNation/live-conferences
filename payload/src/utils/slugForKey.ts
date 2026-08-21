import { SLUG_OVERRIDES } from '@/constants/pageKeys';

export const slugForKey = (key: string): string => SLUG_OVERRIDES[key] || key;

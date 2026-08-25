import { PAGES } from '@/constants/pageKeys';

export const slugForKey = (key: string): string => PAGES.find((page) => page.key === key)?.slug ?? key;

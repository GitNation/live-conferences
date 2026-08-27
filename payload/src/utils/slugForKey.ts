import { PAGES } from '@/constants/pageKeys';

export const slugForKey = (key?: string | null): string | undefined =>
  key ? PAGES.find((page) => page.key === key)?.slug ?? key : undefined;

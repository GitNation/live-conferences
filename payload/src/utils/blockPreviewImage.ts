import type { Block } from 'payload';

// Thumbnails shown in the "add block" picker. The file is looked up by the
// block slug, so dropping public/blocks/<slug>.png is all it takes — no schema
// change. A block without a file just shows the picker's default tile.
export const withPreviews = (blocks: Block[]): Block[] =>
  blocks.map((block) => ({
    ...block,
    imageURL: `/blocks/${block.slug}.png`,
    imageAltText: typeof block.labels?.singular === 'string' ? block.labels.singular : block.slug,
  }));

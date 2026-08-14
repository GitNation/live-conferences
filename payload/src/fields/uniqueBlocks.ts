import type { Validate } from 'payload';

// A blocks field holds each section at most once — a page with two Heroes, or
// an Event with two Techs inside it, is a mistake rather than a layout choice.
export const uniqueBlocks: Validate = (value) => {
  if (!Array.isArray(value)) return true;
  const types = value.map((block) => block?.blockType).filter(Boolean);
  const duplicate = types.find((type, index) => types.indexOf(type) !== index);
  return duplicate ? `"${duplicate}" is already added — each section can be used once here.` : true;
};

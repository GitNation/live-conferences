import type { Validate } from 'payload';

// A blocks field holds each section at most once — a page with two Heroes, or
// an Event with two Techs inside it, is a mistake rather than a layout choice.
export const uniqueBlocks: Validate = (value) => {
  if (!Array.isArray(value)) return true;
  const types = value.map((block) => block?.blockType).filter(Boolean);
  const duplicate = types.find((type, index) => types.indexOf(type) !== index);
  return duplicate ? `"${duplicate}" is already added — each section can be used once here.` : true;
};

// The same rule for an array whose rows are told apart by one field: a second
// "cfp" card in a speakers section is a mistake, not a layout choice.
export const uniqueBy =
  (field: string): Validate =>
  (value) => {
    if (!Array.isArray(value)) return true;
    const used = value.map((row) => (row as Record<string, unknown>)?.[field]).filter(Boolean);
    const duplicate = used.find((entry, index) => used.indexOf(entry) !== index);
    return duplicate ? `"${duplicate}" is already added — each ${field} can be used once here.` : true;
  };

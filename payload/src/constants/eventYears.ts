// The year selector values (Hygraph had these as an enum). Add a year here and
// the dropdown on Conferences picks it up — no collection, no migration.
const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

// Sub-variants of a compound build (aics-nyc, radv-canada, tljs-london) share a
// brand and differ only by the "_2" suffix on the same year.
export const EVENT_YEARS = YEARS.flatMap((year) => [`Y${year}`, `Y${year}_2`]);

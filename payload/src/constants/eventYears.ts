const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const EVENT_YEARS = YEARS.flatMap((year) => [`Y${year}`, `Y${year}_2`, `Y${year}_3`]);

# Payload PoC — what exists today

Snapshot of the `payload-poc` branch. The staged plan is in
[payload-migration-plan.md](payload-migration-plan.md).

## Running it

```bash
cd payload && pnpm dev        # admin on :3100
yarn start:jsn                # site on :8080, reads Payload on every build
```

Local Postgres `live_conferences_payload`. Content is fetched **once per process** —
after editing in the admin, restart `yarn start:jsn`.

## Data model

| Collection | Holds |
|---|---|
| `brands` | key (`jsn`), city, url, socials — brand-level, shared across editions |
| `conferences` | brand + eventYear, dates, emsEventId, useEmsData, header, footer |
| `pages` | key from the fixed registry, read-only slug, SEO tab, `sections` blocks |
| `media` | uploads with folders (`background/image`, `cards/<type>`) |
| `users` | admin / editor roles |

Header and footer are groups **on the conference**, not globals — one field set, own
data per edition.

## Blocks

`hero`, `event`, `features`, `techs`, `deepDives`, `location`, `multipass`, `prices`,
`fullTicket`, `freeTicket`, `party`, `diversity`.

Every block is built with `sectionTabs({ content, style?, nested? })`:

- a `disabled` switch (never `enabled` — a null value must keep content visible)
- **Content** tab
- **Style** tab, the same everywhere: background asset, overlay (black/white, default
  black, only when a background is set), overlay opacity (0–100, step 10), paddingY
  (base/large)
- `nested: true` drops the Style tab — for blocks that sit inside another section
  (`techs`, `deepDives` inside `event`), where the parent owns the background

`techs` and `deepDives` have one definition serving both page level and `event.blocks`.

Block previews: drop `payload/public/blocks/<slug>.png`, wired by slug in
`src/blocks/previews.ts`.

## The bridge

`gulp/util/payloadContent.js` adds a `payload` namespace to the content object on
every build (no flag). It does **not** merge into the Hygraph `pages` tree — both
sources sit side by side and each template picks which one it reads. Templates
iterate `payload.pages[pageKey].sections` and dispatch on `blockType`.

Rich text is stored as Lexical JSON; a Pages `afterRead` hook serializes each field to
`<field>Html`, and the bridge swaps it in under the plain name.

## Traps hit so far

- **`defaultPopulate` must include `filename`** — `url` is derived from it, otherwise
  every populated asset comes back `url: null` and images vanish.
- **drizzle dev-push prompts interactively** on column type changes, enum renames,
  NOT NULL on existing rows and any data loss — the dev server hangs on the prompt
  with no visible error. Fix: make the change in psql first (drop the column, or
  pre-create it with values), then restart `pnpm dev`.
- **Deleting an admin component** also needs its line removed from
  `src/app/(payload)/admin/importMap.js`, or every admin route 500s.
- `admin.width` only applies inside a `row` field.
- pnpm 11 needs `allowBuilds` in `pnpm-workspace.yaml`; `"type": "module"` is required
  in `payload/package.json`. Run pnpm **only** from `payload/`.

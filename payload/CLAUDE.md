# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this folder is

`payload/` is the CMS half of the repository — a standalone Next 16 + Payload 3 app on
port 3100, **not** part of the Gulp build. The static sites are the repository root and
are governed by [../CLAUDE.md](../CLAUDE.md).

Schema work (collections, blocks, fields) happens **only** here. The static side reads
the result through `../gulp/util/payloadContent.js` and never touches the schema.

[README.md](README.md) has the long-form write-up: env vars, hardening decisions, the
data model table. This file is the working map.

## Never mix the two package managers

`payload/` is **pnpm only**; the repository root is **yarn only**. `pnpm` from the root
moves yarn-installed packages into `node_modules/.ignored` and breaks the site build.
Always `cd payload` first.

## Commands

```bash
pnpm dev                 # admin on http://localhost:3100/admin
pnpm generate:types      # rewrite src/payload-types.ts — after every schema change
pnpm generate:importmap  # rewrite src/app/(payload)/admin/importMap.js — after adding an admin component
pnpm check-types         # tsc --noEmit — the only check here; no tests, no linter
pnpm migrate:create      # after a schema change, for deployed environments
pnpm migrate             # apply — the deploy step
pnpm migrate:status
```

Needs local Postgres (`live_conferences_payload`, `DATABASE_URI` in `.env`).
`PAYLOAD_SECRET` is required — the app throws on boot without it.

Verifying a change end to end means running both halves:

```bash
cd payload && pnpm dev   # CMS on :3100
yarn start:jsn           # site on :8080, fetches Payload on every build
```

Content is fetched **once per process** — restart `yarn start:jsn` after editing in the
admin. And stop any `yarn start:*` watcher before verifying a build: it rebuilds
`build/<conf>/` and overwrites the Payload-rendered output.

## Architecture

The selector chain mirrors Hygraph: `brands` (`title`, city, url, socials) →
`conferences` (`brand` + `eventYear`, dates, `emsEventId`, `useEmsData`, `header`/`footer`
tabs) → `pages` (`key` from a fixed registry, read-only `slug`, SEO tab, `sections`
blocks) → `media`. `users` holds admin/editor roles.

- [src/payload.config.ts](src/payload.config.ts) — collections, globals, endpoints,
  plugins. GraphQL is disabled, `maxDepth: 3`, CORS empty unless `PAYLOAD_CORS_ORIGINS`
  lists origins.
- [src/access/index.ts](src/access/index.ts) — content collections are `read: anyone`
  (the build fetches without a token); writes are `authenticated`.
- [src/database/index.ts](src/database/index.ts) — drizzle `push` in dev, migrations
  outside it. `PAYLOAD_DB_PUSH=0` switches dev onto the migration path.
- [src/plugins/index.ts](src/plugins/index.ts) — block presets; the plugin rewrites every
  blocks field itself, so nothing in `src/blocks` knows about it.
- 24 section blocks in [src/blocks/](src/blocks/), registered in
  [src/collections/Pages.ts](src/collections/Pages.ts) in rough page order.

### The bridge contract (know this before changing schema)

`../gulp/util/payloadContent.js`, called from `../gulp/tasks/nunjucks.js:25` after the
Hygraph fetch. It adds `content.payload` and `content.ems` and **never merges into the
Hygraph `pages` tree** — both sources sit side by side and each template picks one.
Templates iterate `payload.pages[pageKey].sections` and dispatch on `blockType`.

- Selector: `where[conference.brand.title]=conferenceTitle` +
  `where[conference.eventYear]`, `depth=2` (README's example query says `brand.key` — the
  bridge uses `brand.title`).
- Rich text is Lexical JSON; the Pages `afterRead` hook adds a `<field>Html` sibling and
  the bridge swaps it in under the plain field name. Templates always receive HTML.
- The `hidden` switch is applied in the bridge — hidden sections and hidden rows at any
  nesting depth are dropped, so no template ever guards on it.
- Media urls come back absolute because `serverURL` is set in the config — it has to be
  the same origin the bridge fetches (`PAYLOAD_URL` on the site side), since that url is
  what ends up in the built HTML. `defaultPopulate` on Media must keep `filename` — `url`
  is derived from it, otherwise every populated asset comes back `url: null`.
- Globals (`subscription-popup`, `notice-panel`, `multipass-banner`) reach templates as
  `payload.components.<key>`; the per-edition switches in `conference.components` null
  them out in the bridge, so a template checks presence, not a flag. Their rich text is
  **not** serialized — the `<field>Html` hook is on Pages only, so a rich text field added
  to a global would reach templates as raw Lexical JSON.
- EMS: `GET /api/ems/content?conference=<id>`
  ([src/endpoints/emsContent.ts](src/endpoints/emsContent.ts)) — Payload owns the EMS
  calls, the static site never talks to EMS. Empty unless the conference has `useEmsData`
  + `emsEventId`, which is also what a brand still on Hygraph gets. Lands in templates as
  its own `ems` namespace.
- Payload down → warning, empty namespace, the build carries on with Hygraph data.

Adding a page key: [src/constants/pageKeys.ts](src/constants/pageKeys.ts), and
`SLUG_OVERRIDES` there must mirror the filename mappings in `../gulp/config.js`.

A new block usually spans both halves: block file here, then a template partial in
`../src/partials/payload/sections/` (shared) or a conference's `parts/` file reworked in
place, plus a dispatch branch in the page template.

## Schema conventions

Naming follows the reference repos (`~/tornos-website/apps/cms`,
`~/focusreactive.com-front/payload`): one thing per file, folder per kind, `<thing>Field.ts`
for a single field and `<thing>Fields.ts` for a set, a plain descriptive name otherwise.
Internal imports always use the `@/` alias, never a relative path. **Get file and export
names approved before writing them.**

- Every section block wraps its fields in
  `sectionTabs({ content, tabs?, style? })` and carries `admin: sectionAdmin`. `style: false`
  drops the Style tab — for a block nested in another that owns the background (`techs`,
  `deepDives` inside `event`) or one with nothing to style (`checkout`); it also removes
  those columns from the block's table.
- The switch is `hidden`, never `visible` — an unset value must keep content visible.
  Rows inside a section take the same switch.
- Every array field carries `admin: rowLabel('Thing')` so collapsed rows read
  "01. Tech - Claude Code".
- Field factories in [src/fields/](src/fields/) take `overrides`, deep-merged via
  [src/utils/deepMerge.ts](src/utils/deepMerge.ts). Named options exist only for switches
  that change *which* fields exist (`button({ variant: false })`) — everything else is an
  override, never a new flag.
- Shapes used by a single block stay in that block's file, not in `src/fields/`.
- **No `admin.description` anywhere.** The reason a block exists goes in a comment at the
  top of its file or in `../docs/`, not into the admin UI.
- `src/fields/` never renders anything; it points at a component by path
  (`@/components/X#X`). Adding one needs `pnpm generate:importmap`; **deleting one also
  needs its line removed from `importMap.js`**, or every admin route 500s.
- Picker thumbnails are looked up by block slug — dropping `public/blocks/<slug>.png` is
  all it takes ([src/utils/blockPreviewImage.ts](src/utils/blockPreviewImage.ts)).
- Media goes into folders, never the root: `background/video`, `background/image`,
  `cards/<card type>`.
- No formatter config in `payload/` — match the file you are editing (some use tabs, some
  two spaces).

## Traps

- **drizzle dev-push prompts interactively** on column type changes, enum renames, NOT
  NULL on existing rows and any data loss — `pnpm dev` hangs on the prompt with no visible
  error. Make the change in psql first, then restart.
- `admin.width` only applies inside a `row` field.
- pnpm 11 blocks postinstall scripts: `allowBuilds: true` in `pnpm-workspace.yaml` for
  esbuild/sharp. `"type": "module"` in `package.json` is required, or the payload CLI dies
  on lexical's top-level await.
- No `src/migrations/` yet — the PoC runs on dev push; the first `migrate:create` is
  Stage 1 of the plan.
- `pnpm check-types` currently fails on `TS2688: Cannot find type definition file for
  'minimatch'` — an implicit type library picked up from the root yarn `node_modules`, not
  a fault in this app's code. Read past that one error; everything else it reports is real.
- The in-memory rate limiter ([src/middleware.ts](src/middleware.ts)) is off outside
  production and per instance: 600 req/min on `/api`, 10/min on login. The admin itself is
  chatty (a REST call per relationship field), which is why the budget is that high.

## Docs

| File | Covers |
|---|---|
| [README.md](README.md) | env vars, hardening, data model, the build-selector query. Stale: the "Live preview" section describes a feature no longer in the code, and the rate limit numbers |
| [../docs/payload-poc-state.md](../docs/payload-poc-state.md) | snapshot of what exists. Stale: `sectionTabs` takes `style: false`, not `nested: true`; previews live in `utils/blockPreviewImage.ts`, not `blocks/previews.ts` |
| [../docs/payload-migration-plan.md](../docs/payload-migration-plan.md) | the staged plan — deployment, EMS, remaining sections, what was already tried and rolled back |

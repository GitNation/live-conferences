# Payload PoC

Test bed for moving live-conferences off Hygraph onto Payload. Standalone Next.js +
Payload 3 app, **not** part of the Gulp build. Minimal schema on purpose — prove the
shape first, add section blocks later.

## Run

```bash
cd payload
pnpm dev          # admin at http://localhost:3100/admin
```

Needs local Postgres (`DATABASE_URI` in `.env`, db `live_conferences_payload`).

`serverURL` is this app's own origin (`PAYLOAD_URL`, default `http://localhost:3100`).
Upload urls are built from it, so they come back absolute and land in the built HTML as
they are — it has to match the origin the Gulp bridge fetches.

Schema handling follows focusreactive.com-front ([src/database](src/database/index.ts)):
`push` syncs the schema from the config in dev, and is **off** outside dev — a deployed
environment (Neon + Vercel later) runs migrations instead:

```bash
pnpm migrate:create   # after changing the schema
pnpm migrate          # apply — this is the deploy step
pnpm migrate:status
```

`PAYLOAD_DB_PUSH=0` locally switches dev onto the migration path too.

Admin login: `petro@focusreactive.com` / `payload-poc` (local only).

## Hardening

Content collections are readable without auth (the build fetches them), so the public
surface is deliberately small:

- `PAYLOAD_SECRET` is required — the app throws on boot without it, no built-in default.
- CORS is empty unless `PAYLOAD_CORS_ORIGINS` lists origins; the build fetches server
  side and needs none.
- GraphQL is disabled (`graphQL.disable`) — nothing queries it.
- `maxDepth: 3` keeps `?depth=50` from making the server chase relationships.
- Uploads: images/video only, 15 MB cap.
- Admin login: locked for 10 minutes after 5 failed attempts, plus a coarse in-memory
  rate limit in `src/middleware.ts` (120 req/min per IP on `/api`, 10/min on login).
  Per-instance only — a real deployment should still sit behind an edge/WAF limiter.
- Uploaded files live in `payload/media`, which is gitignored.

## Data model

Mirrors the Hygraph hierarchy:

| Payload collection | Hygraph equivalent | Notes |
|---|---|---|
| `brands` | ConferenceBrand | `key` = folder key in `src/conferences/` (e.g. `jsn`) |
| `conferences` | ConferenceEvent | brand relationship + `eventYear` (`Y2027`) |
| `pages` | Page | `key` = pageKey from template front matter; `sections` = blocks array |
| `media` | Asset | uploads (images + video), folders enabled (`background/video`, `background/image`) |

Conferences also carry `startTime`/`endTime` (date + time), `emsEventId` (numeric,
unique — the ems.gitnation.org event) and `useEmsData`. `eventYear` is a select whose
options live in [src/eventYears.ts](src/eventYears.ts).

`header` and `footer` are **groups on the conference** — one shared field set
([src/fields/headerFields.ts](src/fields/headerFields.ts), [src/fields/footerFields.ts](src/fields/footerFields.ts)), own data per edition: nav links + a
label/url CTA button, and heading + nav. Brand-level things (city, url, socials) sit on
`brands`. The bridge exposes them as `payload.header`, `payload.footer`,
`payload.brand` — all fetched with the pages request (`depth=2`).

`pages` also has a read-only `slug` (derived from `key` via `slugForKey`, mirrors the
gulp/config.js filename mappings) and an **SEO tab** (`title` 60, `description` 160,
`keywords` 255 chars — each with a progress bar showing characters left). og:image and
canonical stay hardcoded in the templates' front matter for now.

`pages.key` is a **select** from the shared registry in
[src/pageKeys.ts](src/pageKeys.ts) — one list for all conferences; to allow a new
page, add one line there. A DB-level unique index on `(conference, key)` rejects a
second page with the same key for the same conference.

`pages.sections` is a plain Payload blocks array — blocks nest directly, no `Blocks`
wrapper component like Hygraph needed for its nesting cap. A section can appear only
once per blocks field (`validate: uniqueBlocks`).

Blocks: `hero`, `event`, `techs`, `deepDives`. `techs` and `deepDives` are usable both
as page sections and inside `event.blocks` — one definition, one template, the
conference decides where they sit. Block types:
`hero` in [src/blocks/Hero.ts](src/blocks/Hero.ts) — title, date (plain string),
description (simple rich text), stats (`value` + `description`), buttons grouped by
conference phase (default / daysBefore / during / weekAfter — replaces Hygraph's
`daysBefore__main` magic keys, max 2 per phase), switch (two labels + one url +
`rightIsActive` toggle), and a Style tab with a `background` media asset (video →
looping background video via `data-video-src`, image → static background-image).

## Live preview

Pages open with the built page beside the editor (mobile/tablet/desktop breakpoints),
plus a Preview button. The url comes from the page slug — `index` → `/`, everything
else → `/<slug>` — against `PAYLOAD_PREVIEW_URL` (default `http://localhost:8080`, the
`yarn start:<conf>` server). The static site does not run Payload's live-preview
client, so the iframe shows the last build, not unsaved edits.

## Source layout

| Folder | What lives there |
|---|---|
| `collections/`, `blocks/` | schema — what the CMS stores |
| `fields/` | reusable schema pieces: field definitions (`buttonFields.ts`, `hiddenField.ts`, `speakerCardsField.ts`), the validators that guard them (`uniqueValidation.ts`) and the admin config they point at (`rowLabel.ts`) |
| `hooks/` | one collection hook per file, named after it (`duplicateConferencePages.ts`) |
| `utils/` | plain helpers that are neither — `slugForKey.ts`, `blockPreviewImage.ts` |
| `components/` | React **admin UI** ('use client' components Payload renders by path: collapsed labels, the SEO counter, user badges) |
| `constants/` | option lists kept in code (page keys, event years, ticket groups) |
| `access/`, `database/` | permissions, db adapter |

Naming follows the reference repos (`~/tornos-website/apps/cms`, `~/focusreactive.com-front/payload`):
one thing per file, `<thing>Field.ts` for a single field and `<thing>Fields.ts` for a set,
a plain descriptive name for anything else. Internal imports always use the `@/` alias,
never a relative path — files move, and the alias does not care.

`fields/` never renders anything; it only points at a component by path when a field
needs custom UI. That keeps the schema serializable and the UI in one place.

## Schema conventions

- No `admin.description` on fields, and **no comments in schema files** either — a block
  is a list of fields and reads as one. Anything worth explaining goes here or in
  `docs/`.
- Reusable field factories in `src/fields/`: `button()` (label/url/variant/openInNewTab,
  no icons) and `simpleRichText()` (bold/italic/underline/link only). Compose these
  instead of re-writing fields.
- **Every factory takes `overrides`, deep-merged into what it returns** (the pattern from
  `~/tornos-website/apps/cms/src/fields`, via `utils/deepMerge.ts`). Named options are
  only for switches that change *which* fields exist — `button({ variant: false })`,
  `sectionTabs({ style: false })`. Everything else is an override, so a caller that needs
  a default, a label or an `admin.condition` never needs a new flag:
  `button({ overrides: { label: { defaultValue: 'Learn about multipass' } } })`. A factory
  returning a field *set* (like `button()`, used both as a group's fields and as an array
  row's) keys its overrides by field name; one returning a single field takes
  `Partial<ArrayField>` and friends.
- Every section block wraps its fields in `sectionTabs({ content, tabs?, style? })` —
  a Content tab, then any extra tabs the block declares, then Style. Style is the same
  everywhere and opt-in per block (e.g. `background()` from `src/fields/background.ts`);
  `style: false` drops the tab entirely, for a section with nothing to style (`checkout`)
  or one nested inside another that owns the background (`techs`, `deepDives`). Dropping
  it removes the columns from that block's table — see the drizzle note in Gotchas.
- Extra tabs are how a big block stays readable: `checkout` keeps the Tito widgets on
  Content and puts the price steps and the side panels on their own tabs. Label-only
  tabs (no `name`) leave the data shape untouched, so no migration and no template change.
- Things used by a single block (like the hero's phase-grouped button arrays) are
  defined in that block's file, not in `src/fields/`.
- Rich text is Lexical JSON in the DB; a Pages `afterRead` hook serializes every rich
  field to a `<field>Html` sibling, and the Gulp bridge swaps it in under the plain
  field name — templates always receive HTML strings.

## Template conventions (main repo)

- Conference-specific section in `templates/parts/` → rework that file in place for
  the Payload block shape.
- Shared section from `src/partials/` → create a same-named copy under
  `src/partials/payload/` and rework it there; static blocks (supported, join-waitlist)
  stay hardcoded, no schema.
- Page templates iterate `payload.pages[pageKey].sections` and dispatch on
  `section.blockType` (RenderBlocks pattern), with the legacy Hygraph loop below it
  shrinking as sections migrate.
- Every section block is built with `sectionTabs({ content, style? })`, which also adds
  the `hidden` switch (`fields/hiddenField.ts`), and carries `admin: sectionAdmin` so its
  collapsed header shows the section type plus a red HIDDEN badge. Rows inside a section
  take the same switch — speaker cards, event dates, price tickets. The bridge drops
  every hidden entry, nested ones too, so templates never see them.
- Every array field carries `admin: rowLabel('Tech')` — collapsed rows read
  "01. Tech - Claude Code".
- Media goes into folders, never the root: `background/video`, `background/image` for
  section backgrounds, `cards/<card type>` (e.g. `cards/techs`, `cards/dates`) for
  images belonging to a card list.
- No comments in HTML files.
- **Stop any `yarn start:*` watcher before verifying a build** — it rebuilds
  `build/<conf>/` without `PAYLOAD_POC=1` (it also watches `content-log.json`) and
  silently overwrites the Payload-rendered output.

## The build-selector query

What Hygraph does with `conferenceTitle + eventYear`, here is one REST call
(deep relationship filters work; content collections are public-read):

```
GET /api/pages
  ?where[key][equals]=main
  &where[conference.brand.key][equals]=jsn
  &where[conference.eventYear][equals]=Y2027
  &depth=1
```

GraphQL is also on at `/api/graphql`.

## Gotchas hit setting this up

- pnpm 11 blocks postinstall scripts: `allowBuilds` in `pnpm-workspace.yaml` must be `true` for `esbuild`/`sharp`.
- `"type": "module"` in package.json is required — without it the payload CLI loads the config as CJS and dies on lexical's top-level await.

## Gulp bridge

`gulp/util/payloadContent.js` (in the main repo). Every build fetches Payload after
Hygraph — no flag — and adds a separate `payload` namespace to the content object
(visible in `content-log.json`). It does NOT touch the Hygraph `pages` tree: both
sources sit side by side and each template picks which one it reads. Shape mirrors
focusreactive.com-front's RenderBlocks pattern: raw blocks with their `blockType`,
templates dispatch on it:

```njk
{% for section in payload.pages.main.sections %}
  {% if section.blockType == 'hero' %} ... {% endif %}
{% endfor %}
```

Payload down / no data → warning, empty namespace, build carries on with the CMS
data (templates use `payload… or pages[pageKey]…` where a fallback makes sense,
e.g. the SEO tags). `PAYLOAD_URL` overrides the default `http://localhost:3100`.

```bash
yarn start:jsn   # site on :8080, Payload used when it is running
```

Content is fetched once per process — after editing in the admin, restart the dev
server.

## Next steps

- More section blocks (mirror the SectionKey list from Hygraph)
- Seed script instead of hand-made entries
- Deploying to Neon + Vercel: point `DATABASE_URI` at Neon (pooled connection string),
  keep `PAYLOAD_DB_PUSH` unset so the deploy runs `pnpm migrate`, and swap local disk
  uploads for `@payloadcms/storage-vercel-blob` — Vercel's filesystem is read-only, so
  `payload/media` will not survive there. `PAYLOAD_CORS_ORIGINS` gets the real site
  origin only if something calls the API from a browser.

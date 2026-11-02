# CLAUDE.md

## Project Overview

Multi-conference static site generator for GitNation conferences. Each conference has its own
config/assets in `src/conferences/$key/` but shares components, build tooling, and a data-fetching
layer. The folder name (`$key`) is the conference's identity everywhere — `CONF_CODE` in the build,
`key` in Payload.

## Two CMSs — every conference is on exactly one

`cms` in `conference-settings.js` decides it. Set to `'payload'` → Payload. Unset → Hygraph.

| | Payload | Hygraph (legacy) |
|---|---|---|
| Conferences | `jsn` `jsnus` `jsnus-aijs` `rs` `rsasia` `rsus` `rdb` `tljs` `tljs-amsterdam` `aics` `aics-nyc` `aics-berlin` `aics-asia` | `qaconf` `nodeconf` `radv` `radv-canada` `vjsl` `wgds` `tsc` `c3` `wes` `mlconf` |
| Found by | the folder key (`CONF_CODE` = Payload `conferences.key`) | `conferenceTitle` + `eventYear` in `conference-settings.js` |
| Templates read | `payload.pages[pageKey].sections`, `payload.*`, `ems.*` | `pages[pageKey].pageSections.*` and the rest of `getContent()` |
| Page list from | `content.payload.pages` | `content.pages` |
| Data access | Payload MCP server | Hygraph MCP server |

**Payload conferences have no `conferenceTitle`, `eventYear` or `timezone`** — those were dropped;
the schedule timezone comes from the CMS. Do not add them back. Hygraph conferences still need all three.

New work goes to Payload. A Hygraph conference moves over with the `migrate-to-payload` skill.

Full Payload data path: [docs/payload-data.md](docs/payload-data.md).

## The CMS is a separate repository

The Payload admin + API is **not** in this repo any more. It lives in
`~/live-conferences-cms` (`focusreactive/live-conferences-cms`) — Next + Payload 3, **pnpm**, port 3100,
deployed on Vercel. It has its own `CLAUDE.md`.

- Schema work (collections, blocks, fields) happens **only** there. This repo reads the result through
  `gulp/util/payloadContent.js` and never defines schema.
- This repo is **yarn** only. Never run `pnpm` here — it moves yarn packages into `node_modules/.ignored`
  and breaks the build.
- Plugins the CMS uses (html-preview, etc.) come from `~/payload-plugins` (bun monorepo).

## Data Flow

`gulp/tasks/nunjucks.js:27` picks the source:

- **Payload conference** — Hygraph is never called. `addPayloadContent()` fetches the conference's pages,
  the `components` global, and EMS content through the CMS (`/api/ems/content`). Result lands in
  `content.payload` and `content.ems`.
- **Hygraph conference** — `getContent(conferenceSettings)` from `@focus-reactive/graphql-content-layer`
  (sibling repo `../graphql-content-layer/`) returns the big object: `pages`, `speakers`, `schedule`,
  `sponsors`, `workshops`, `customContent`, `conference`, `pagesPieceOfTexts`, `faqs`, `talks`. EMS is
  merged in by that layer when `useEmsData` is set on the Hygraph event.

Key Payload rules (details in the doc above):

- The build reads **published** pages of a **published** conference only; the preview reads **drafts**.
- A Payload conference with no published pages **fails the build** — it is never shipped empty.
- Rows with `hidden: true` are dropped before templates see them; hidden pages get no file.

**I don't have direct access to EMS.** On Payload conferences, EMS data arrives already shaped by the CMS.

## `relative-deps` (Tricky)

The `prestart` script runs `relative-deps`, which copies `../graphql-content-layer/` into `node_modules/`
— so local changes to the sibling repo take effect on next `yarn start` without publishing to npm. The
npm-published version is only used in CI. Only Hygraph conferences use this layer.

## Template System

- **Nunjucks** templates with YAML front matter. `pageKey` maps a file to a CMS page.
- A page whose `pageKey` has no CMS data is **silently skipped** during build.
- **Payload templates** loop over `payload.pages[pageKey].sections` and dispatch on `section.blockType`,
  including a partial per block. Shared Payload partials live in `src/partials/payload/`
  (`sections/`, `blocks/`, `mixins/`, `js/`, `sass/`). Conference-specific ones stay in `parts/`.
- **Hygraph templates** use `{% if pages[pageKey].pageSections.speakers %}` — the CMS decides which
  sections appear.
- On Payload conferences, one `schedule` page backs two files (in-person and remote); each is built only
  if EMS has sessions in that format (`nunjucks.js:71`).
- **Shared partials** in `src/partials/` are reached through symlinks in each conference's `templates/`:
  `partials -> ../../../partials`, `eventsBus -> ../../../eventsBus`, `ga -> ../../../ga`.
- **Mixins** in `src/partials/_mixins.html`; Payload ones in `src/partials/payload/_mixins.html`;
  conference-specific in `templates/parts/_mixins.html`.
- Include paths: `"partials/_X.html"` shared, `"partials/payload/..."` shared Payload, `"parts/_X.html"`
  conference-specific.

### Page Key Mapping

Some page filenames differ from their CMS keys (`pages.mappings` in `gulp/config.js:73`). The preview
needs the pair too, or it answers 404.

| pageKey | filename |
|---------|----------|
| `main` | `index` |
| `preEvent` | `pre-event` |
| `workshops_alt` | `remote-workshops` |
| `schedule` | `schedule-offline` |
| `advice_lounge` | `advice-lounge` |

### `fakeLinks` Front Matter

When `fakeLinks: true`, ticket links and interactive sections are hidden. Sent to the React layer as
`isAuth = !fakeLinks`. Used to create pre-auth vs post-auth page variants.

## Live preview (Payload)

The Payload admin renders a page with these templates on request, through `ci/functions/preview/`.
It finds the conference by folder `key`, and the edition being edited by `conference` (its id).
A new section partial needs `{{ editable(row) }}` on its root and on each card, or it cannot be clicked
in the preview; a new tracker goes inside `{% if not PREVIEW %}` in the layout.
Details in [docs/live-preview.md](docs/live-preview.md).

## Conference Settings

`src/conferences/$key/conference-settings.js`. Two shapes:

```js
// Payload conference
module.exports = {
  cms: 'payload',   // pages come from Payload; Hygraph is never called
  subPath,          // sub-conference only: 'nyc/', 'aijs/', 'asia/'
  tagColors,        // {label: {tagBG, color}} — applied to EMS people by the bridge
  speakerAvatar,
  confName,
};

// Hygraph conference
module.exports = {
  conferenceTitle,  // Hygraph selector: 'Amsterdam_JSNation', 'React_Amsterdam', …
  eventYear,        // Hygraph selector: 'Y2026', 'Y2026_2', …
  timezone,         // e.g. 'Europe/Amsterdam'
  subPath,          // sub-conference only
  tagColors,
  speakerAvatar,
  confName,
};
```

The whole object is also exposed to templates (`nunjucks.js:135`). `subPath` and `cms` are documented in
[docs/page-variables.md](docs/page-variables.md).

## Multi-City Compound Builds

Some conferences have sub-variants that build together and deploy under the parent's domain:

- `build:aics` → `aics` + `aics-nyc` + `aics-berlin` + `aics-asia` → `build/aics/{nyc,berlin,asia}/`
- `build:jsnus` → `jsnus` + `jsnus-aijs` → `build/jsnus/aijs/`
- `build:tljs` → `tljs` + `tljs-amsterdam` → `build/tljs/amsterdam/`
- `build:radv` → `radv` + `radv-canada` → `build/radv/canada/`

Each sub-variant has its own folder, so on Payload it is its own conference with its own `key`. On Hygraph
it shares `conferenceTitle` with the parent and differs in `eventYear` (`Y2026` vs `Y2026_2`).

## Archive Years — do not read or search

Past conference years are stored as **pre-built static HTML** in year-named folders:
`src/conferences/$key/2024/`, `2025/`, etc. They are copied verbatim to the build output.

**These folders are dead weight — never read, search, or edit them.** They hold most of `src/`'s size,
so an unfiltered search wastes time and buries real hits under serialized CMS data.

Always exclude them:

```bash
grep -r "pattern" src/ | grep -v '/20[0-9][0-9]/'
find src/conferences -path '*/20[0-9][0-9]' -prune -o -name '*.html' -print
```

The only exception is the `archive-conf` skill, which creates them.

## Retired Conferences

`dummy` · `jsnl` · `jsny` · `remix` · `rsre` are no longer shipped — they still have `start:`/`build:`
scripts but are absent from `build-all-brands`, so CI never deploys them. `doconf` and `gqconf` are not in
`build-all-brands` either.

Ignore them when surveying the codebase: what a variable, partial, or pattern does *there* says nothing
about the live site. Only touch them on explicit request.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `CONF_CODE` | Which conference to build — the folder name, and the Payload `key` (set by `yarn start:$key`) |
| `PAYLOAD_URL` | Payload API base; defaults to `http://localhost:3100` (`payloadContent.js:8`) |
| `PAYLOAD_READ_TOKEN` | Bearer token for Payload reads — content is not public. Same value on the CMS side |
| `PREVIEW_SECRET` | Netlify Functions only; the CMS must send it as `X-Preview-Secret` |
| `CMS_TOKEN` | Hygraph API JWT — needed only for Hygraph conferences |
| `CMS_ENDPOINT` | Hygraph API endpoint — Hygraph conferences only |

## Commands

```bash
yarn start:$key       # Dev server for a conference (e.g., yarn start:jsn)
yarn dev              # Dev server with mock data (no CMS calls)
yarn build:$key       # Production build
yarn build-all-brands # Build all conferences (CI)
yarn test:build       # Gulp snapshot tests on build output
yarn test:watch       # Jest watch mode
yarn lint             # ESLint
```

Content is fetched **once per process** — after editing in the CMS, restart `yarn start:$key`
(or use the live preview).

## Mock Mode

- `content-mock.json` (committed) — static fixture for `yarn dev` / `--mock` flag
- `content-log.json` (gitignored) — written on every real fetch (Payload or Hygraph), useful for debugging

## Creating a New Conference

Use the `create-conf` skill. By hand:

1. Copy an existing conference dir in `src/conferences/` (a Payload one for a Payload conference).
2. Payload: keep `cms: 'payload'`, no `conferenceTitle`/`eventYear`/`timezone`; create the conference in
   the admin with `key` = folder name and **publish** it with its pages.
   Hygraph: set `conferenceTitle` + `eventYear` + `timezone`.
3. A sub-conference also sets `subPath` — see [docs/page-variables.md](docs/page-variables.md).
4. **Create symlinks** in `templates/`: `partials`, `eventsBus`, `ga` (see existing conferences).
5. Add `start:$key` and `build:$key` scripts to `package.json`.

## `docs/` — read before answering

Hand-maintained reference notes on how this repo actually behaves. **When asked "what does X do" /
"why is Y needed" / "can I delete Z", read `docs/` first** — the answer is usually there, including
gotchas that are not obvious from the code.

| File | Covers |
|---|---|
| [docs/payload-data.md](docs/payload-data.md) | How a Payload conference gets its data: key lookup, published vs drafts, the `payload` / `ems` objects, hidden rows, links, failure modes |
| [docs/live-preview.md](docs/live-preview.md) | The Payload admin's live preview: the `preview` Netlify function, the `PREVIEW` flag, and the `editable()` / `editableDoc()` marks every section partial needs |
| [docs/page-variables.md](docs/page-variables.md) | Variables in the `---` front matter block of a template, and the `subPath` / `cms` conference variables |
| [docs/cleanup-roadmap.md](docs/cleanup-roadmap.md) | Standardisation goals across conferences — what to unify, drop, or move to shared partials |
| [docs/TECH-DEBT.md](docs/TECH-DEBT.md) | Known tech debt |

Keeping it current:

- English, short — one line per entry.
- Cite where a value is read (`file:line`) so it stays checkable.
- Describe the current state only; no changelog of what was deleted.
- Flag anything that behaves unlike its name suggests — highest-value content.
- Offer to add new findings when they come up in conversation.

## Build System Notes

- **Gulp 4** with the native `series()`/`parallel()` task API
- **Node 22** pinned in `.nvmrc` / Volta (`volta.node` `22.12.0`, `engines.node` `>=22.0.0`), Yarn 1.22
- Deployment target is **Netlify**. Per-conference `_redirects` and `_headers` in source dirs;
  `netlify/edge-functions/country.js` does country detection
- The React interactive layer (`@focus-reactive/react-app-layer`) mounts via `app.js` and receives CMS
  data through a global `window.eventsBus` pub/sub system

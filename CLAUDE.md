# CLAUDE.md

## Two projects in one repository — never mix them up

| | Repository root | `payload/` |
|---|---|---|
| What | the static sites (Gulp + Nunjucks) | the CMS: Payload admin and API |
| Package manager | **yarn** | **pnpm** |
| Run from | repo root | `payload/` — always `cd payload` first |

**Never run `pnpm` from the repository root.** It sees the yarn project, moves
yarn-installed packages into `node_modules/.ignored`, and writes a stray
`pnpm-lock.yaml` — which breaks the site build. Same the other way round: no `yarn`
inside `payload/`.

Schema work (collections, blocks, fields) happens **only** in `payload/src/`. The
static side reads the result through `gulp/util/payloadContent.js`; it never touches
the schema.

## Project Overview

Multi-conference static site generator for GitNation conferences. Each conference has its own config/assets in `src/conferences/$key/` but shares components, build tooling, and a data-fetching layer.

## Data Flow (Critical)

Data comes from two external sources via `@focus-reactive/graphql-content-layer` (sibling repo at `../graphql-content-layer/`):

1. **Hygraph (GraphCMS)** — primary CMS. GraphQL queries filtered by `conferenceTitle` + `eventYear` from conference settings
2. **EMS** (`ems.gitnation.org`) — GitNation's event management API. Used conditionally when `useEmsData` is set on the CMS event entity. Each fetch module has its own merge strategy (speakers: EMS replaces; sponsors: concatenated; workshops: deduplicated by title)

The `getContent(conferenceSettings)` function returns one big object consumed by Nunjucks templates. Key top-level keys: `pages`, `speakers`, `schedule`, `sponsors`, `workshops`, `customContent`, `conference`, `pagesPieceOfTexts`, `faqs`, `talks`.

**I don't have direct access to EMS.** For CMS data, use the Hygraph MCP server.

## `relative-deps` (Tricky)

The `prestart` script runs `relative-deps`, which copies `../graphql-content-layer/` into `node_modules/` — so local changes to the sibling repo take effect on next `yarn start` without publishing to npm. The npm-published version (`3.2.11`) is only used in CI.

## Template System

- **Nunjucks** templates with YAML front matter. The `pageKey` field in front matter is the linchpin — it maps to `pages[pageKey].pageSections.*` in CMS data
- Pages whose `pageKey` has no CMS data are **silently skipped** during build
- Templates use `{% if pages[pageKey].pageSections.speakers %}` to conditionally render sections — the CMS controls which sections appear
- **Shared partials** in `src/partials/` are accessed via symlinks in each conference's `templates/` dir: `partials -> ../../../partials`, `eventsBus -> ../../../eventsBus`, `ga -> ../../../ga`
- **Mixins** in `src/partials/_mixins.html` (~650 lines of Nunjucks macros). Conference-specific mixins in `templates/parts/_mixins.html`
- Include paths: `"partials/_X.html"` for shared, `"parts/_X.html"` for conference-specific

### Page Key Mapping

Some page filenames differ from their CMS keys (`gulp/config.js`):

| pageKey | filename |
|---------|----------|
| `main` | `index` |
| `preEvent` | `pre-event` |
| `workshops_alt` | `remote-workshops` |
| `schedule` | `schedule-offline` |
| `advice_lounge` | `advice-lounge` |

### `fakeLinks` Front Matter

When `fakeLinks: true`, ticket links and interactive sections are hidden. Sent to the React layer as `isAuth = !fakeLinks`. Used to create pre-auth vs post-auth page variants.

## Live preview (Payload)

The Payload admin renders a page with these templates on request, through
`ci/functions/preview/`. A new section partial needs `{{ editable(row) }}` on its root and on each
card, or it cannot be clicked in the preview; a new tracker goes inside `{% if not PREVIEW %}` in
the layout. Details in [docs/live-preview.md](docs/live-preview.md).

## llms.txt

Every conference on Payload gets an `llms.txt` at its root — a Markdown summary for LLMs and AI
agents: dates, location, pages, speakers, workshops, sponsors. The `llms` task writes it right after
`nunjucks`, from the content that build already fetched ([gulp/util/llmsTxt.js](gulp/util/llmsTxt.js)).
Nothing is filled in by hand, so a conference moved onto Payload gets one on its next build.

- Lighthouse's Agentic Browsing category (shown in PageSpeed Insights) reads it from the **domain
  root only**. A sub-conference's file lands in `/nyc/llms.txt`; `gulp/llms-index.js`, the last step
  of a multi-city build, adds an "Other editions" list to every edition's file and, once the root
  edition is over, turns the root file into a brand index pointing at the editions still to come.
- The three things Lighthouse checks — an H1, a Markdown link, at least 50 characters — fail a
  production build.
- Archives leave it out (`archive-conf`): only the live edition's file means anything.
- Check with `npx lighthouse@latest https://<domain>/ --only-categories=agentic-browsing --view`, or
  `yarn jest __tests__/llms-txt.test.js`.

## Conference Settings

Each conference has `src/conferences/$key/conference-settings.js`:

```js
module.exports = {
  conferenceTitle,  // CMS identifier: 'Amsterdam_JSNation', 'React_Amsterdam', etc.
  eventYear,        // CMS identifier: 'Y2026', 'Y2025', etc.
  timezone,         // e.g., 'Europe/Amsterdam'
  tagColors,        // Map of tag names to {tagBG, color} for schedule styling
  speakerAvatar,    // { dimensions: { avatarWidth: 500, avatarHeight: 500 } }
};
```

`conferenceTitle` + `eventYear` are the critical CMS selectors — they filter the correct event from Hygraph.

## Multi-City Compound Builds

Some conferences have sub-variants that build together:
- `build:aics` → builds `aics` + `aics-nyc` + `aics-berlin` + `aics-asia`, copies sub-variants into `build/aics/nyc/`, `build/aics/berlin/` and `build/aics/asia/`
- `build:radv` → builds `radv` + `radv-canada` → `build/radv/canada/`
- `build:jsnus` → builds `jsnus` + `jsnus-aijs` → `build/jsnus/aijs/`
- `build:tljs` → builds `tljs` + `tljs-amsterdam` → `build/tljs/amsterdam/`

Sub-variants share the same `conferenceTitle` but differ in `eventYear` (e.g., `Y2026` vs `Y2026_2`).
Each of these scripts ends with `node gulp/llms-index.js <brand>` (see [llms.txt](#llmstxt)) — keep
it last when a city is added.

## Archive Years — do not read or search

Past conference years are stored as **pre-built static HTML** in year-named folders: `src/conferences/$key/2024/`, `2025/`, etc. They are copied verbatim to the build output.

**These folders are dead weight — never read, search, or edit them.** 42 such folders hold 2.1 GB of the 2.8 GB in `src/`, so an unfiltered search wastes time and buries real hits under serialized CMS data (~500KB per file).

Always exclude them:

```bash
grep -r "pattern" src/ | grep -v '/20[0-9][0-9]/'
find src/conferences -path '*/20[0-9][0-9]' -prune -o -name '*.html' -print
```

The only exception is the `archive-conf` skill, which creates them. Nothing else should look inside.

## Retired Conferences

`dummy` · `jsnl` · `jsny` · `remix` · `rsre` are no longer shipped — they still have `start:`/`build:` scripts but are absent from `build-all-brands`, so CI never deploys them.

Ignore them when surveying the codebase: what a variable, partial, or pattern does *there* says nothing about the live site, and counting them inflates every statistic. Only touch them on explicit request.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `CONF_CODE` | Selects which conference to build (set automatically by `yarn start:$key`) |
| `CMS_TOKEN` | Hygraph API JWT token (in `.env`) |
| `CMS_ENDPOINT` | Hygraph API endpoint (in `.env`) |

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

## Mock Mode

- `content-mock.json` (committed) — static fixture for `yarn dev` / `--mock` flag
- `content-log.json` (gitignored) — written on every real CMS fetch, useful for debugging

## Creating a New Conference

1. Copy an existing conference dir in `src/conferences/`
2. Update `conference-settings.js` with correct `conferenceTitle` and `eventYear`
3. For a sub-conference (`aics-nyc`, `jsnus-aijs`) also set `subPath` — see [docs/page-variables.md](docs/page-variables.md)
4. **Create symlinks** in `templates/`: `partials`, `eventsBus`, `ga` (see existing conferences for targets)
5. Add `start:$key` and `build:$key` scripts to `package.json`

## `docs/` — read before answering

Hand-maintained reference notes on how this repo actually behaves. **When asked "what does X do" /
"why is Y needed" / "can I delete Z", read `docs/` first** — the answer is usually there, including
gotchas that are not obvious from the code.

| File | Covers |
|---|---|
| [docs/page-variables.md](docs/page-variables.md) | Variables in the `---` front matter block of a template, and the `subPath` conference variable |
| [docs/cleanup-roadmap.md](docs/cleanup-roadmap.md) | Standardisation goals across conferences — what to unify, drop, or move to shared partials |
| [docs/live-preview.md](docs/live-preview.md) | The Payload admin's live preview: the `preview` Netlify function, the `PREVIEW` flag, and the `editable()` / `editableDoc()` marks every section partial needs |

Keeping it current:

- English, short — one line per entry.
- Cite where a value is read (`file:line`) so it stays checkable.
- Describe the current state only; no changelog of what was deleted.
- Flag anything that behaves unlike its name suggests — highest-value content.
- Offer to add new findings when they come up in conversation.

## Build System Notes

- **Gulp 4** with the native `series()`/`parallel()` task API (no more `run-sequence`)
- **Node 22** pinned in `.nvmrc` / Volta (`volta.node` `22.12.0`, `engines.node` `>=22.0.0`), Yarn 1.22
- Deployment target is **Netlify**. Per-conference `_redirects` and `_headers` in source dirs
- The React interactive layer (`@focus-reactive/react-app-layer`) mounts via `app.js` and receives CMS data through a global `window.eventsBus` pub/sub system

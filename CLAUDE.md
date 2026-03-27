# CLAUDE.md

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
- `build:aics` → builds `aics` + `aics-nyc` + `aics-berlin`, copies sub-variants into `build/aics/nyc/` and `build/aics/berlin/`
- `build:radv` → builds `radv` + `radv-canada` → `build/radv/canada/`
- `build:tljs` → builds `tljs` + `tljs-london` → `build/tljs/london/`

Sub-variants share the same `conferenceTitle` but differ in `eventYear` (e.g., `Y2026` vs `Y2026_2`).

## Archive Years

Past conference years (2020–2025) are stored as **pre-built static HTML** directly in `src/conferences/$key/2024/`, etc. These are large files (~500KB each, contain serialized CMS data) and are copied verbatim to build output. Don't modify them.

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
3. **Create symlinks** in `templates/`: `partials`, `eventsBus`, `ga` (see existing conferences for targets)
4. Add `start:$key` and `build:$key` scripts to `package.json`

## Build System Notes

- **Gulp 3.9** (not 4) with `run-sequence` for sequential tasks
- **Node 10** pinned in `.nvmrc` / Volta
- Nunjucks task has a random 0–10s delay per file (`gulp-wait`) — naive rate limiting for CMS API
- Deployment target is **Netlify**. Per-conference `_redirects` and `_headers` in source dirs
- The React interactive layer (`@focus-reactive/react-app-layer`) mounts via `app.js` and receives CMS data through a global `window.eventsBus` pub/sub system

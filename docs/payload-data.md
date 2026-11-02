# Payload data — how a conference on Payload gets its content

Applies to every conference with `cms: 'payload'` in `conference-settings.js`. The CMS itself is the
separate repo `~/live-conferences-cms`; this file is what the build does with it. All of it lives in
[gulp/util/payloadContent.js](../gulp/util/payloadContent.js).

## Finding the conference

- The folder is the conference: `CONF_CODE` here = `key` on the Payload `conferences` collection. `key` is unique, lowercase, admin-only to change.
- There is no `conferenceTitle` / `eventYear` lookup any more — those fields are gone from Payload conferences' settings.
- Pages are fetched with `where[conference.key][equals]=<key>` (`payloadContent.js:24`), `depth: 2` so the conference's brand resolves.

## Published vs drafts

| | Build | Live preview |
|---|---|---|
| Pages | `_status = published` only | drafts (`draft=true`) |
| Conference | `conference._status = published` only | drafts |
| EMS | published | drafts |
| Hidden pages | dropped — no file | kept, so the editor sees them |

- Filter at `payloadContent.js:30`. A page or conference that was **never** published is skipped by the build.
- Changes reach the live site only after **Publish** in the admin and a redeploy.
- The preview picks the edition by `conference` (its id) instead of the key (`renderPreview.js:45`).

## Failure modes

- No published pages for the key → the build **throws** (`payloadContent.js:125`). Means: wrong key, edition deleted, or nothing published.
- Payload unreachable → warning, then the same throw for a Payload conference.
- EMS fetch fails → warning only; EMS-fed sections render empty.
- Hygraph is never called for a Payload conference (`nunjucks.js:27`), so `CMS_TOKEN` is not needed to build it.

## What templates receive

`content.payload` (`payloadContent.js:158`):

| Key | What |
|---|---|
| `pages[key]` | `{ id, key, mainTitle, seo, sections }` — `sections` is the blocks list, dispatched on `blockType` |
| `components` | the `components` global, one entry per shared component; a component switched off in `settings.optionalBlocks` is `null` |
| `brand`, `header`, `footer` | from the conference (header/footer are groups on the conference, not globals) |
| `settings` | conference settings group, with its `settings` json merged flat into it |
| `conferenceId`, `startTime`, `endTime`, `tbaSpeakersNumber`, `openForTalks` | conference fields |

`content.ems` — EMS data prepared by the CMS: `eventInfo` (always an object), `speakers`, `schedule.offline` / `schedule.remote`, etc.

## Transformations on the way in

- **Hidden rows** — any row with `hidden: true` is removed, at any depth, in sections and in the settings json (`payloadContent.js:84`).
- **Rich text** — the CMS sends `<field>Html`; the bridge renames it to `<field>` (`payloadContent.js:62`). Templates read the plain name.
- **Tag colours** — EMS has none, so `speakers`, `lineUp`, `trainers`, `committee`, `mcs` get `tagBG` / `color` from the conference's own `tagColors` (label, else `default`) (`payloadContent.js:140`).
- **Expired remote price increase** — `settings.priceIncreaseRemote` is dropped once its date has passed (`payloadContent.js:96`).
- **Links** — every `{ linkType: 'page' | 'external' }` object gets a resolved `url`, with `subPath` prefixed and page keys mapped to file names ([gulp/util/linkUrl.js](../gulp/util/linkUrl.js)). A page link with no page resolves to `''`, so `{% if button.url %}` draws nothing.
- **Images** — media urls go through the CMS image optimizer ([gulp/util/optimizeMedia.js](../gulp/util/optimizeMedia.js)).

## Page list

- Valid `pageKey`s come from `payload.pages`, not Hygraph's `pages` (`nunjucks.js:122`).
- The `schedule` page builds `schedule-offline.html` and the remote schedule file separately — each only if EMS has sessions in that format (`nunjucks.js:71`).

## Gotchas

- Content is fetched **once per process**: restart `yarn start:$key` after editing, or use the preview.
- `content-log.json` holds the last fetched object — the quickest way to see what a template actually gets.
- Do not mark data from `payload.components`, the settings json or EMS with `editable()` — see [live-preview.md](live-preview.md).

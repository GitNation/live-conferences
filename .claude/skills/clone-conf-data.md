---
description: Clone a Hygraph ConferenceEvent — create a new event and copy all CMS data into it from an existing source event. Use when the user wants to duplicate conference content for a new edition (e.g., "create a new event copying data from event X", "clone this conf's CMS content for the new ems id", "duplicate the main page and texts into a new conf"). Copies brand, the main Page, and all text pieces; sets ems id + Use EMS data + year; then sets eventYear in the matching conference folder. Does NOT create a new brand and does NOT scaffold the code folder.
argument-hint: <source-event-id>
---

This skill **creates a new `ConferenceEvent` in Hygraph and copies CMS content into it from a SOURCE event**, then updates the matching conference code folder's `eventYear`.

It does NOT: create a new `ConferenceBrand`, or scaffold the code folder (that's the separate `create-conf` skill).

### How events link to EMS (read this first)

Data comes from two sources: **Hygraph** (texts, main page, brand) and **EMS** (`ems.gitnation.org` — speakers, schedule, workshops, etc.). The link is the **`emsEventId`** field plus the **`useEmsData`** checkbox on the `ConferenceEvent`:

- The event is **first created in `ems.gitnation.org`**, which assigns it an **ems id**.
- That ems id is entered into Hygraph's `emsEventId`, and `useEmsData` is turned on.
- Then EMS data is merged into the Hygraph content at build time.

So `emsEventId` is **not an arbitrary number** — it's the real id the user already obtained from EMS. Always **ask the user for it**; never invent it.

> **Prerequisite:** the Hygraph MCP server must be connected with content read + create permissions (no delete needed). Verify with `get_project_info`; on 403/404 the token is wrong — stop and tell the user to fix `.mcp.json` and reconnect.

> **Leaves everything in DRAFT.** Never publishes — content managers review and publish.

---

## Step 1 — Get the SOURCE event id

Ask the user for (or take from `$ARGUMENTS`) the **SOURCE event id** — the existing event to copy data FROM. **Required.**

It's a Hygraph id. If the user gives an **ems event id** instead of a Hygraph id, resolve it:
```graphql
query { conferenceEvents(where: { emsEventId: <EMS_ID> }, stage: DRAFT, first: 5) { id title year emsEventId } }
```

The TARGET event does **not** exist yet — this skill creates it in step 3.

## Step 2 — Fetch the SOURCE event

```graphql
query Source($id: ID!) {
  conferenceEvent(where: { id: $id }, stage: DRAFT) {
    id title emsEventId year useEmsData tbaSpeakersNumber
    conferenceBrand { id title }
    pages { id key }
    pieceOfTexts(first: 1000) { id key markdown renderStyle }
    pieceOfText { key markdown renderStyle }
  }
}
```

## Step 3 — Ask for the new event's settings and CREATE it

Ask the user for the values the new event should have:

- **ems event id** (`emsEventId`) — integer, the **real id from `ems.gitnation.org`** that the user already created there. **Required.** Never invent it.
- **Year** (`year`) — the `EventYear` enum value. **Always ask.** For multi-city builds sharing one brand, the year MUST differ from the source (e.g. source `Y2026` → new `Y2026_2`). Must be an allowed `EventYear` value (check `get_project_info` if unsure).
- **Title** — display title of the new event (ask; e.g. `TechLead Conf London 2026: Adopting AI in Orgs Edition`).
- **Use EMS data** (`useEmsData`) — boolean; default `true` (this is the whole point of the ems link). Confirm with the user.
- **ConferenceBrand** — by default **reuse the source's brand** (`conferenceBrand.id` from step 2) via `connect`. The skill does NOT create a new brand. If the user wants a different existing brand, ask for its id.

Create the new event with `create_entry` (typename `ConferenceEvent`):
```json
{
  "title": "<TITLE>",
  "emsEventId": <EMS_ID>,
  "year": "<YEAR_ENUM>",
  "useEmsData": <BOOL>,
  "conferenceBrand": { "connect": { "id": "<BRAND_ID>" } }
}
```

Record the returned id as **`<TARGET_ID>`** — used in steps 4–6. (Texts are added in step 5, not here, so the field choice can depend on the count.)

## Step 4 — Copy the `main` Page

Find the `main` page id in the source's `pages` (step 2), then fetch its full fields:
```graphql
query SrcMain($id: ID!) {
  page(where: { id: $id }, stage: DRAFT) {
    key titleSeo seoDescription keywords titlePage pageSlogan
    pageStatistics pageStatisticsYaml pageNavigation pageNavigationYaml
    pageSections pageSectionsYaml description locationTitle ogUrl pageSettings
    ogImage { id }
  }
}
```

Create a new Page linked to the TARGET, copying every non-null field **verbatim**:
```json
{
  "key": "main",
  "titleSeo": "...", "seoDescription": "...", "...": "...",
  "conferenceEvent": { "connect": { "id": "<TARGET_ID>" } },
  "ogImage": { "connect": { "id": "<SOURCE_OG_IMAGE_ID>" } }
}
```

**Large JSON fields:** `pageSections` (and sometimes `pageStatistics`) are huge. Create the Page with the smaller fields first, then add `pageStatistics` and `pageSections` in **separate `update_entry` calls**, one field per call, to avoid an oversized payload failing.

> Only `main` is copied by default. If the user wants other pages too, repeat for each.

## Step 5 — Copy the text pieces — CHOOSE THE FIELD BY COUNT

`ConferenceEvent` has two text fields, and the build merges BOTH:
- **`pieceOfText`** — inline **component list** (`PieceOfTextNew`). Nice editing UX, but Hygraph Studio has a **hard 50-instance limit** per field per entry. Extras beyond 50 are saved/queryable via API but **invisible & uneditable in Studio**.
- **`pieceOfTexts`** — **relation** to the `PieceOfText` model. **No limit.**

Count the source texts (source `pieceOfTexts` + `pieceOfText` combined; in practice all live in one of them). Then:

- **count ≤ 45 → use `pieceOfText` (NEW)** — leaves headroom under the 50 limit.
- **count > 45 → use `pieceOfTexts` (relation)** — avoids the cap entirely.

> Populate **exactly one** field — never both (duplicate keys confuse editors in Studio).

Value shapes (copy `key`, `markdown`, `renderStyle` verbatim; omit `renderStyle` when the source value is `null`, don't send `null`). Apply with `update_entry` on the TARGET:

`pieceOfText` (NEW component list):
```json
{ "pieceOfText": { "create": [ { "key": "...", "markdown": "...", "renderStyle": "Standard_Markdown" }, ... ] } }
```
`pieceOfTexts` (relation):
```json
{ "pieceOfTexts": { "create": [ { "key": "...", "markdown": "...", "renderStyle": "Standard_Markdown" }, ... ] } }
```
Preserve source order and any intentional duplicate keys (e.g. a repeated `faq__descr`).

## Step 6 — Verify the CMS copy

```graphql
query Verify($id: ID!) {
  conferenceEvent(where: { id: $id }, stage: DRAFT) {
    title emsEventId year useEmsData
    conferenceBrand { title }
    pieceOfText { key }
    pieceOfTexts(first: 1000) { key }
    pages { key }
  }
}
```
Confirm: base fields correct; the chosen text field count equals the source count; the OTHER text field is empty; `main` page exists.

## Step 7 — Set eventYear in the matching conference folder

The build resolves a CMS event by `conferenceTitle` + `eventYear` from `conference-settings.js`. After copying, point the right code folder at the new event's `year`.

1. Identify the folder from the brand. The folder is named by convention, not equal to the enum. Examples:
   - brand `Amsterdam_JSNation` → folder `jsn`
   - brand `Tech_Lead_JS` → folder `tljs` (and city sub-variants like `tljs-london`)
   - brand `AI_Coding_Summit` → folder `aics`
   - If unsure which folder maps to the brand, **ask the user** (e.g. "this is the jsnation event — which folder, `jsn`?"). Confirm by reading `src/conferences/<folder>/conference-settings.js` and checking `conferenceTitle` matches the brand.
2. In `src/conferences/<folder>/conference-settings.js`, set `eventYear` to the TARGET's `year` (the enum value from step 3, e.g. `Y2026_2`).
   - For a city sub-variant (e.g. the new event is the London edition), update the **sub-variant** folder's settings (`tljs-london`), not the main one — ask if ambiguous.
3. Do not touch `conferenceTitle` unless the user says so (multi-city editions share the brand).

## Step 8 — Report (DRAFT)

Report:
- source event id → new event id (created),
- base fields set on the new event (brand, emsEventId, year, useEmsData),
- which **text field** was used (NEW vs relation) and count copied,
- that `main` page was copied,
- which `conference-settings.js` had `eventYear` set, and to what,
- reminder: **everything is DRAFT** — texts still contain the source's city/dates verbatim; content managers edit & publish.

---

## Gotchas

- **50-component limit is real and unraisable** (Hygraph Studio platform limit on component-list fields; `updateComponentField` has no parameter for it). Use the relation field for >45 texts.
- **The MCP `execute_graphql` tool blocks any mutation containing `delete*`/`unpublish*`.** To clear a component list you filled by mistake, use the `update_entry` tool with `{ <field>: { delete: [{id}, ...] } }` — that path isn't blocked. Fetch the component ids first.
- **Build reads both text fields.** `@focus-reactive/graphql-content-layer/dist/fetch-texts.js` concatenates `pieceOfTexts` + `pieceOfText` keyed by `key` (NEW wins on collision). Never fill both.
- **Publishing has a concurrency cap** (~10+ in one mutation → HTTP 429). This skill stays in DRAFT; if asked to publish, do batches of ~5 and publish related records (Page + texts) and the ConferenceEvent separately.

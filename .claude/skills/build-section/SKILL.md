---
description: Build a page Section in Hygraph from a screenshot (or pasted text) — decide which field each piece of content belongs to, create any missing card component, fill the section with real data, and publish it. Use when the user gives a screenshot/design of a section and wants it created and populated on the site (e.g. "make this prices section", "build this block from the screenshot", "add this section to main and fill it"). Works on the `main` page for now. Reuses the `schema-migration` skill when a new card component is needed.
argument-hint: <screenshot or text of the section, plus any links/data>
---

This skill turns a **screenshot (or pasted text) of one section** into a fully populated, published `Section` entry on a conference's `main` page. It decides where each piece of content goes, creates a missing card component if needed (via the `schema-migration` skill), fills the section, and publishes.

Content lives spread across the event in Hygraph, but on the site we **assemble one Section per block** — so this skill gathers everything for a single section into that one entry.

> **Prerequisite:** Hygraph MCP connected (content read + create, schema/management, publish). Verify with `get_project_info`. The user supplies data you can't see (links, asset handles) — **ask for it or a path to it; never invent URLs or ids.**

> **Scope:** `main` page only, for now. If the user names another page, confirm before proceeding.

---

## The field map — where each piece of content goes

This is the core decision the skill makes. For every element in the screenshot, place it by these rules:

| Field | What goes here |
|-------|----------------|
| **key** | The section's identity (enum `SectionKey`). **Ask the user which key** after you get the screenshot. If the key already exists in the enum, reuse it (exact case). If not, it must be **added to the enum first** (via `schema-migration`). Match the casing convention of existing keys. |
| **title** | The single main heading at the top of the section. There is only ONE. If you see a *second* heading, it does not go here — it belongs to `pieceOfText` or a `globalBlocks → Blocks.title`. |
| **description** | The section's lead description, usually right under the title. If a description sits elsewhere (not under the title) or is a *second* description, it goes to `pieceOfText` with a key instead. |
| **buttons** | Buttons that belong to the section itself — under the heading/description, at the bottom, or (rarely) elsewhere. Judge by the button's label/purpose. If unsure where a button belongs, **ask**. |
| **pieceOfText** | Every *single, keyed* leftover that didn't fit above: a second description, an extra button, a secondary heading, a small label. Each gets its own `key`. Union of `PieceOfTextNew` (key + markdown + renderStyle), `Button`, `Media`. |
| **blocks** | ONLY lists of cards that belong to this section — an array. Prices section → `Price` cards; Features → `Feature`; a program → `DeepDive`; ticket perks → `FullTicket`. If the matching card component does not exist, it must be **created** (see "Creating a card component"). Cards here have **no key**. |
| **globalBlocks** | Single, *keyed* blocks that are not a plain array — usually a `CustomBlock` (universal, keyed). Also holds `Blocks`: a keyed group with its own `title`/`visible` and an `items` array of cards (e.g. the `deepDives` group on the Event section — a *second* heading with its own card list, so it lives here with its key + cards). Ask for the key on creation. |
| **customData** | Rare, mostly-static data you don't want a component for (e.g. `stats`). The **user usually dictates** what goes here — don't invent it. |
| **visible** | Always `true` on creation. |

### Decision heuristics
- **One title rule:** the first/topmost heading → `title`. Any further heading → `pieceOfText` (keyed) or a `Blocks.title` inside `globalBlocks`.
- **One description rule:** the description directly under the title → `description`. Any other/second description → `pieceOfText` (keyed).
- **Array vs single:** a repeating list of cards → `blocks`. A single keyed block (or a keyed group-with-its-own-list) → `globalBlocks`.
- **When unsure where something belongs → ask the user**, don't guess silently.

---

## Step 1 — Receive the section and its key

1. Take the screenshot / pasted text.
2. **Ask the user for the section key.** Show the current `SectionKey` enum values (`get_entity_schema("Section")` → `key.allowedValues`) so they can pick an existing one or name a new one.
3. If the key is **new**, it must be added to the enum. Invoke the **`schema-migration` skill** to `updateEnumeration` on `SectionKey` (add the value, correct casing) before creating the section.

## Step 2 — Locate the target Page and check for an existing section

Find the `main` page and whether a section with this key already exists:

```graphql
query {
  conferenceBrand(where: { title: <ConferenceTitle> }) {
    conferenceEvents(where: { year: <EventYear> }) {
      pages { id key sections { id key } }
    }
  }
}
```

Take `<ConferenceTitle>`/`<EventYear>` from the conference's `conference-settings.js` (ask the user which conference if ambiguous — default is the one currently being worked on). If a section with this key already exists, ask whether to update it or replace its content; don't blindly create a duplicate.

## Step 3 — Sort the screenshot content into the field map

Walk every visible element and assign it to `title` / `description` / `buttons` / `pieceOfText` / `blocks` / `globalBlocks` / `customData` per the table above. List cards for `blocks`. Note anything you're unsure about and ask.

**Data you can't see** (links, image assets): ask the user for them or a path. Most data lives on the event already, just scattered — gather it. For images that must be Hygraph assets, resolve the handle from the URL to an id first:
```graphql
query { assets(where: { handle: "<handleFromUrl>" }) { id handle } }
```
(The last URL segment is the handle, not the id.)

## Step 4 — Create a missing card component (if needed)

If `blocks` needs a card type that doesn't exist (e.g. no `Price` yet):
0. **Scout for an existing match first.** Before proposing a new component, check the data layer for one you can reuse — either delegate to the `datalayer-scout` agent, or read `fragments.js`/`formatters.js` + the Hygraph schema yourself. A `Perk`/`Benefit` card is often just a `Feature`; don't create a duplicate of something that already exists.
1. **Ask first** — "create a new `Price` component, or is there a better fit?" Present the scout's finding (REUSE / EXTEND / CREATE-NEW). Don't create silently; the user may prefer reusing an existing type or a `globalBlocks` approach.
2. If confirmed, invoke the **`schema-migration` skill** to create the component with the fields seen in the screenshot, **plus always** `customData` (JSON) and `visible` (Boolean) **at the very bottom**. Card components have **no `key`**.
3. Then add the component to the `blocks` component-union (via the same skill).
4. After the component exists, **wire it into the data layer** (Step 4.5) so it actually reaches templates. Do this automatically — a component the site can't read is useless.

For `globalBlocks`, decide with the user: a keyed `CustomBlock`, or a `Blocks` group with an `items` card list, or a brand-new component. **Ask before creating**, so it isn't reworked later.

## Step 4.5 — Wire a NEW component into the data layer (automatic)

Whenever you created a **new card component** in Step 4, immediately update the sibling `graph-content-layer` repo (`../graph-content-layer/` relative to this project, absolute `/Users/petro/graphql-content-layer/`) so the new type is fetched and formatted. Do this without asking — it's the completion of creating the component.

**1. Fragment** — in `graph-content-layer/src/fragments.js`:
- Add an `xFields` constant next to the existing ones (`buttonFields`, `mediaFields`, `deepDiveFields`, `featureFields`, `priceFields`, `fullTicketFields`), listing every field on the component. Use the existing constants for nested types: `button { ${buttonFields} }`, Media components `${mediaFields}`. Always include `id`, `visible`, and the component's real fields; include `customData` if the component has it.
- Add the type to the `blocks` union inside `sectionFragment`: `... on TypeName { ${xFields} }`.

**2. Formatter** — in `graph-content-layer/src/formatters.js`:
- Most cards need nothing new: they run through `formatDefault` (strips `__typename`, renders `description` markdown → HTML, normalizes `button` when present). In the `blocks` branch of `formatSection`, add `if (c.__typename === 'TypeName') return formatDefault(c);`.
- Only write a dedicated `formatX` if the card has a field needing special handling (e.g. `Feature.width` lowercased, `Price.priceSmall` derived, a second markdown field like `DeepDive.list`). If so, base it on `formatDefault` and add only the extra: `const c = await formatDefault(raw); return { ...c, extra };`.
- **Raw string fields** (a price string, a badge) stay untouched in the formatter and are rendered with `| safe` in templates — don't run them through markdown.

**3. Rebuild and copy (MANDATORY).** The build reads `node_modules`, not `src`. After editing, ALWAYS:
```bash
cd /Users/petro/graphql-content-layer && yarn prepare
cp dist/fragments.js dist/formatters.js /Users/petro/live-conferences/node_modules/@focus-reactive/graphql-content-layer/dist/
```
Then verify the new symbols compiled in:
```bash
grep -c "xFields\|TypeName" /Users/petro/live-conferences/node_modules/@focus-reactive/graphql-content-layer/dist/fragments.js
```
Skipping the rebuild+copy is the single most common failure here — a `sectionKey is not defined` / stale-field error means `dist` in `node_modules` wasn't refreshed.

## Step 5 — Create and fill the Section

Create the section connected to the page, filling every field the screenshot maps to. `visible: true`.

**Critical Hygraph shapes** (these bite):
- **`blocks` / `globalBlocks` are component-union list fields** — each item is wrapped: `{ TypeName: { data: { ...fields } } }` (the `data` wrapper and `CreateWithPositionInput` are required). Not `{ TypeName: {...} }`.
- **Media/asset components:** `image: { create: { image: { connect: { id: "<assetId>" } } } }`.
- **`pieceOfText`** union items: `{ PieceOfTextNew: { key, markdown, renderStyle } }`, `{ Button: {...} }`, `{ Media: {...} }`.
- Connect the section to the page via the section's `page` relation (or via the Page's `sections`), whichever the parent flow uses.

Use `execute_graphql` with an explicit `updateSection`/`createSection` mutation when the MCP `create_entry`/`update_entry` tool rejects the union shape — the tool validates against a simplified schema and can reject valid union input.

## Step 6 — Publish

After filling, **publish the section** (`publish_entry` on the Section) so it appears in the build (build reads PUBLISHED). If the section embeds separately-published records, publish those too. Watch the publish concurrency cap (~10 in one call → 429; batch if needed).

## Step 7 — Report

State:
- section key + page it was added to,
- how each screenshot element was mapped (title/description/buttons/pieceOfText/blocks/globalBlocks/customData),
- any component created (and that its **datalayer fragment+formatter** is still TODO),
- publish status,
- anything left for the user (assets to upload, Studio renderer settings, data you couldn't fill).

---

## Traps (shared with the schema/content flows)

- **Union create needs `{ Type: { data: {...} } }`** — the `data` wrapper is mandatory (`FullTicketCreateWithPositionInput.data` required). Omitting it fails with "Field ... is not defined by type ...WithPositionInput".
- **Asset URLs carry a handle, not an id** — resolve `assets(where:{handle})` → `id` before `connect`.
- **`Required` fields in a union cause query nullability conflicts** — if you create a card whose field (e.g. `title`) is Required while a sibling union member's isn't, the build query breaks. Prefer NOT Required on card fields shared across union members.
- **The MCP blocks delete/unpublish** — reworking a field/component means the user deletes in Studio first (that's the `schema-migration` skill's job to flag).
- **Section key casing** — the site matches `section.key` exactly (PascalCase enum values reach templates as-is). Keep the enum value's case consistent with siblings.
- **A new component isn't on the site until the datalayer knows it** — fragment + formatter in `graph-content-layer`, rebuilt into `dist` and copied to `node_modules`. Always flag this as follow-up.

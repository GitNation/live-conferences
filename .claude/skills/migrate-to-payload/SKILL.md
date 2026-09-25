---
description: Move a conference page template and its section partials off Hygraph onto Payload data — rewrite the page as a blockType dispatch loop, decide per include whether it is reworked in place, pointed at a shared payload copy, copied into src/partials/payload/, or left alone. Use whenever the user asks to convert a page or a section to Payload (e.g. "переделай index под пейлоад", "migrate the workshops page to payload", "wire this section to payload data", "make aics read from payload"). Covers the template side only — the Payload schema lives in a separate project that is not in this checkout.
argument-hint: <conference key and page, e.g. "aics main" or "rs workshops">
---

This skill converts **one page at a time** of a conference in `src/conferences/<key>/templates/` from the Hygraph `pages[pageKey].pageSections.*` shape to the Payload `payload.pages[pageKey].sections` shape, and rewires the partials that page includes.

Two conferences are already converted and are the reference for every decision: **`jsn`** (fullest) and **`rs`**. When unsure how something should look, open the same page there first — copying an established shape beats inventing one.

> **Scope:** templates, partials and their sass/js copies. The Payload schema (blocks, fields) lives in a separate `payload/` project that is **not** part of this checkout, so this skill never adds or renames a block. If a section needs a field that does not exist yet, say so and stop — do not fake the data.

---

## Before touching anything

1. **Check the conference is on Payload.** `src/conferences/<key>/conference-settings.js` must export `cms: 'payload'`. Without it the build still reads Hygraph and nothing here applies.
2. **Find out which blocks the page actually has.** Never guess `blockType` names. Run the build once (`yarn start:<key>`, or reuse a recent run) and read `content-log.json` — the bridge writes the whole fetched tree there on every build:
   ```bash
   node -e "const c=require('./content-log.json');console.log(c.payload.pages.main.sections.map(s=>s.blockType).join('\n'))"
   ```
   That list is the ground truth: one `if` per entry, in that order, and nothing else.
3. **Read the current template** and list every `{% include %}`. Each one gets a decision from the table below.

---

## Where each include goes

| The include is… | Do this |
|---|---|
| `parts/_x.html` — lives in the conference's own folder | **Rework in place.** It has one consumer, so a copy would only duplicate it. |
| `partials/_x.html` **and** `src/partials/payload/sections/_x.html` already exists | Point the include at the payload copy. Check it renders the same markup your conference expects before trusting it. |
| `partials/_x.html`, no payload copy, **and you have to change it** | Copy the **whole** file to `src/partials/payload/sections/` under the **same basename**, edit the copy, include it from there. |
| `partials/_x.html` you do **not** change | Leave it included from `partials/`. Copying an untouched file just doubles the maintenance. |
| a global component — popup, notice panel, banner | `src/partials/payload/blocks/_x.html`, gated on `payload.components.<key>` (see below). |
| nothing in Payload feeds it | **Leave the markup exactly where it is** and mark it — see below. |

### Markup with no Payload block yet

Never delete it. Leave the block in its original position, keep its original guard, and put a
marker above it:

```njk
{# no payload data #}
{% if pages[pageKey].pageSections.industries %}
{% include "parts/_industries.html" %}
{% endif %}
```

That markup is the specification for the block someone still has to build — it records what the
section looked like and which fields it needs. Deleting it throws that away and makes the next
person reconstruct it from git. Migration is incremental, so "no data yet" is a normal state,
not dead code to tidy up. The guard being permanently false is fine: the section simply does not
render until its block exists.

This applies at every level — a whole section, a sub-block inside a converted partial (a stats
list, a nested dates list), or a single field. Mark each one, and list them in your summary so
the user knows what is waiting on Payload.

### Two rules about copies

Both learned the hard way:

- A copy is **the full original plus your edits**, never a fresh minimal rewrite. Downstream markup, classes and nested includes all still matter.
- **Copy only what you change.** A bulk copy of untouched partials was rejected before — it looks tidy and quietly forks eleven files that then drift.

Sass and js follow the same split: `src/partials/payload/sass/`, `src/partials/payload/js/`, `src/partials/payload/mixins/`.

---

## The page template shape

Everything the page renders inside `main` becomes one loop with a branch per block. Each branch aliases the block to `<name>Data` and includes the partial, because the partials read a named variable rather than `section`:

```njk
{% include "partials/payload/sections/_header.html" %}

<div class="main js-main">

	{% for section in payload.pages[pageKey].sections %}

	{% if section.blockType == 'hero' %}
	{% set heroData = section %}
	{% include "parts/_hero.html" %}
	{% endif %}

	{% if section.blockType == 'techs' %}
	{% set techsData = section %}
	{% include "partials/payload/sections/_techs.html" %}
	{% endif %}

	{% endfor %}

</div>

{% include "partials/payload/sections/_footerV2.html" %}
```

The alias is the blockType in camelCase plus `Data` (`pastSpeakers` → `pastSpeakersData`). Keeping that mechanical means a partial can be read without hunting for who set its variable.

Order comes from Payload, not from the template — the loop renders whatever the editor arranged. So the `if` blocks can sit in any order; match the reference conference's order anyway so diffs stay readable.

Anything outside the page's own content — header, footer, popups, notice panel — stays a plain include above or below the loop, since it is not part of `sections`.

---

## Where the data lives

| Expression | Holds |
|---|---|
| `payload.pages[pageKey].sections` | the page's ordered blocks; each carries `blockType` |
| `payload.pages[pageKey].mainTitle` | the page heading |
| `payload.pages[pageKey].seo` | seo fields |
| `payload.components.<key>` | a global component, or `null` when this edition switched it off — keys are `subscriptionPopup`, `noticePanel`, `multipassBanner`, `eventBy` |
| `payload.brand` | brand-level data shared by every edition: title, city, url, socials |
| `payload.header` / `payload.footer` | per-edition navigation and footer groups |
| `payload.settings` | conference settings |
| `payload.tbaSpeakersNumber`, `payload.openForTalks`, `payload.startTime`, `payload.endTime` | conference-level fields |
| `ems.speakers`, `ems.pastSpeakers`, `ems.committee`, `ems.mcs`, `ems.eventInfo` | people, straight from EMS |

`ems` is **top level, not under `payload`** — on purpose, so a template makes it obvious which system a list came from. A people section usually renders a few authored cards from its own block *and* the EMS list, as `_speakers.html` does.

A component gate reads the component itself, never a separate switch:

```njk
{% if payload.components.subscriptionPopup %}
{% include "partials/payload/blocks/_popup-subscription.html" %}
{% endif %}
```

All of this is assembled in [gulp/util/payloadContent.js](../../../gulp/util/payloadContent.js) — read it when a value is not where you expect.

---

## What bites

**Hygraph is not fetched at all.** For a conference on `cms: 'payload'` the build skips `getContent` entirely ([gulp/tasks/nunjucks.js:27](../../../gulp/tasks/nunjucks.js#L27)), so `pages` is undefined in templates. Every surviving `{% if pages[pageKey].pageSections.x %}` is therefore silently false and its section vanishes with no error and no warning. Strip those guards as you convert — this is the single most common reason a migrated page comes out half empty.

**A page with no Payload page is dropped.** The list of pages to build comes from Payload for a migrated conference ([gulp/tasks/nunjucks.js:160](../../../gulp/tasks/nunjucks.js#L160)). A template whose `pageKey` has no matching Payload page produces no file at all, which reads exactly like a broken template.

**Never check `hidden`.** The bridge already filters hidden sections and hidden array rows out (`dropHidden`), so a template that tests it is dead code implying the opposite.

**Rich text arrives under the plain name.** Payload returns `<field>Html`; the bridge renames it to `<field>`. Print it with `| safe`, and do not look for a `Html` suffix in templates.

**Media urls are absolute** — `{{ item.icon.url }}` is ready to use, never prefix it.

**No comments in templates.** House convention: the markup should read as markup. Anything non-obvious belongs in `docs/` or this skill.

**The bridge is cached by node.** After editing `gulp/util/payloadContent.js`, restart `yarn start:<key>` — otherwise the old module keeps serving and it looks like the data randomly went missing.

**A running watcher can overwrite your build.** If you are inspecting `build/<key>/`, stop the watcher first.

---

## Finishing a page

1. `yarn start:<key>` and open the page — every block from step 2 should be on screen, in the editor's order.
2. Grep the converted template for old data references, and check every hit is one you marked:
   ```bash
   grep -n -B1 "pageSections\|pageStatistics\|customContent\|pagesPieceOfTexts" src/conferences/<key>/templates/<page>.html
   ```
   A hit with `{# no payload data #}` above it is a block waiting on Payload — expected. A hit
   without the marker is one you forgot to convert, and it will never render.
3. Tell the user plainly which sections are on Payload now, which you left on the old data and why, and which need a Payload block that does not exist yet.

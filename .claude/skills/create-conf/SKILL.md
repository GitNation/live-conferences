---
description: Create a new conference by copying an existing one, renaming folders, updating scripts, symlinks, redirects, canonicalUrl and subPath. Use when the user wants to create/add/scaffold a new conference (e.g., "create conference aics-nyc", "add a new conference", "scaffold tljs-london"). The new conference key/folder name is the argument.
argument-hint: <new-conf-key>
---

This skill creates a new conference based on an existing one. The new conference folder name / key is: $ARGUMENTS (e.g., `aics`, `tljs-london`).

## Steps

### 1. Ask for source conference

Ask the user which existing conference to copy from. Show a list of conferences from `src/conferences/`.

### 2. Ask for conference domain URL and inheritance

Ask the user two things:

**a) Domain URL** — the new conference's domain URL (e.g., `https://aicodingsummit.com`). Used for `_redirects`.

It is **not** used for the og tags: those come from the brand url in Hygraph plus `subPath` (step 6). An inherited conference has no domain of its own anyway — it is served from under the parent's, at `<PARENT_DOMAIN>/<SUBPATH>/`.

**b) Is this an inherited (child) conference?** — i.e. does it deploy as a subfolder of a parent conference?

Examples of inherited conferences:
- `radv-canada` is a child of `radv` → builds into `build/radv/canada/`
- `tljs-london` is a child of `tljs` → builds into `build/tljs/london/`

The **parent conference** is determined from the folder name: everything before the first `-` dash. The **subpath** is everything after the first `-` dash. For example:
- `aics-nyc` → parent: `aics`, subpath: `nyc`
- `tljs-london` → parent: `tljs`, subpath: `london`
- `radv-canada` → parent: `radv`, subpath: `canada`

### 3. Copy the source conference

Copy the source conference folder to the new one, **excluding year archive folders** (4-digit folders like `2023/`, `2024/`):

```bash
rsync -a --exclude='/[0-9][0-9][0-9][0-9]/' src/conferences/<SOURCE>/ src/conferences/<NEW_CONF>/
```

### 4. Update package.json scripts

**If NOT inherited (standalone conference):**

Add `build:` and `start:` scripts:

```json
"build:<NEW_CONF>": "CONF_CODE=<NEW_CONF> yarn build",
"start:<NEW_CONF>": "CONF_CODE=<NEW_CONF> yarn start"
```

**If inherited (child conference):**

Add only a `start:` script for the child:

```json
"start:<NEW_CONF>": "CONF_CODE=<NEW_CONF> yarn start"
```

Then **update** the parent's `build:` script to include the child using `concurrently`, following the pattern:

```json
"build:<PARENT>": "concurrently --max-processes 3 'CONF_CODE=<PARENT> yarn build' 'CONF_CODE=<NEW_CONF> yarn build && mkdir -p build/<PARENT>/<SUBPATH> && cp -r build/<NEW_CONF>/* build/<PARENT>/<SUBPATH>/'"
```

If the parent already has a `concurrently` build (e.g. it already has another child), add the new child as an additional concurrent command.

### 5. Update confName in all HTML templates

In `src/conferences/<NEW_CONF>/templates/`, find all `.html` files that have `confName:` in their front matter and replace the old conference key with the new one:

- `confName: <OLD_VALUE>` → `confName: <NEW_CONF>`

### 6. Set subPath in conference-settings.js (inherited conferences only)

**There is no per-page og front matter.** `ogUrl`, `ogImage` and `root` were removed from every
template — do not add them back, and delete them if the source conference you copied still has
them. All three are derived from one value.

**Skip the rest of this step if the conference is NOT inherited** — a standalone conference needs
nothing here. `conference.url` (the brand url in Hygraph) already carries its domain, so if the og
tags come out wrong on a standalone conference, the brand url is what needs fixing, in the CMS.

For an inherited conference, add `subPath` to `src/conferences/<NEW_CONF>/conference-settings.js`
and export it:

```js
const conferenceTitle = 'AI_Coding_Summit';
const eventYear = 'Y2026_2';

// Deploys into the parent conference's build under this path.
const subPath = 'nyc/';

module.exports = { subPath, tagColors, speakerAvatar, conferenceTitle, eventYear, timezone };
```

The value is `<SUBPATH>/` — **no leading slash, trailing slash required**. `nyc/`, `aijs/`,
`amsterdam/`. Getting the slashes wrong is silent: a leading slash produces `https://host//nyc/`,
a missing trailing one produces `https://host/nycimg/ogImage.png`.

`conference-settings.js` reaches templates through `gulp/tasks/nunjucks.js`, and
`src/partials/_media-tags.html` builds everything from it:

- `og:url` = `conference.url + subPath` — the sub-conference's own base
- `og:image` = the same base + `img/ogImage.png`, the filename in every conference
- the conference root in links (logo, `/checkout`, price filters) = `/{{ subPath }}`

So a parent conference leaves `subPath` unset and every expression collapses to the plain root.

**Check the og image asset exists.** `src/conferences/<NEW_CONF>/img/ogImage.png` must be there,
with exactly that name — the filename is hardcoded in the partial. If the copied conference brought
a differently-named file (`og-image.png`, `ogImage.jpg`), rename it; convert the format if the
extension really changes. If there is no such asset, say so in the report — the page will otherwise
advertise an og:image that 404s, and `radv` / `radv-canada` are already in that state.

> **The CMS overrides all of it.** The Hygraph `Page.ogUrl` / `Page.ogImage` fields WIN over the
> derived values. If a built page still shows a wrong `og:url`, it is coming from the CMS Page —
> fix or clear it there, not in the code.

### 7. Add canonicalUrl (inherited conferences only)

**Skip this step if the conference is NOT inherited.**

For inherited conferences, add or update `canonicalUrl:` in the front matter of every `.html` template in `src/conferences/<NEW_CONF>/templates/`.

The `canonicalUrl` value is: `<SUBPATH>/` for the main page, and `<SUBPATH>/<pageKey>` for other pages.

For example, if the new conf is `aics-nyc` (subpath = `nyc`):

- `index.html` → add `canonicalUrl: nyc/`
- `schedule.html` → add `canonicalUrl: nyc/schedule`
- `jobs.html` → add `canonicalUrl: nyc/jobs`
- `faq.html` → add `canonicalUrl: nyc/faq`
- `checkout.html` → add `canonicalUrl: nyc/checkout`
- etc.

Determine the page name from the file name (without `.html` extension). For `index.html` use just `<SUBPATH>/`.

If `canonicalUrl:` already exists in the front matter, replace its value. If it doesn't exist, add it inside the front matter block (between the `---` markers).

### 8. Update _redirects

**If NOT inherited (standalone conference):**

In `src/conferences/<NEW_CONF>/_redirects`, replace the old conference domain with the new domain URL in all badge/claim/register/quick-access redirect lines:

```
/badge/*  https://NEW_DOMAIN/
/claim*  https://NEW_DOMAIN/
/register*  https://NEW_DOMAIN/
/quick-access*  https://NEW_DOMAIN/
```

**If inherited (child conference):**

Skip updating the child's own `_redirects` — redirects are inherited from the parent. Instead, add a sponsors proxy redirect to the **parent** conference's `_redirects` file (`src/conferences/<PARENT>/_redirects`).

Add a line right after the existing `/sponsors/*` line:

```
/<SUBPATH>/sponsors/*  https://sponsors.gitnation.org/<PARENT_SPONSOR_KEY><SUBPATH>/:splat  200
```

The `<PARENT_SPONSOR_KEY>` is taken from the parent's existing `/sponsors/*` line (e.g., if parent has `aicodingsummit`, the child gets `aicodingsummitnyc`). The `<SUBPATH>` is appended to the parent's sponsor key without separator.

For example, if creating `aics-nyc` (parent: `aics`, subpath: `nyc`) and parent has `/sponsors/*  https://sponsors.gitnation.org/aicodingsummit/:splat  200`:

```
/nyc/sponsors/*  https://sponsors.gitnation.org/aicodingsummitnyc/:splat  200
```

### 9. Report results

After all steps, report:
- Source conference that was copied
- New conference key
- Inherited: yes/no (parent + subpath if yes)
- Domain URL set
- `subPath` value written (if inherited), and the og base it produces — `conference.url + subPath` — so a wrong slash is visible in the report rather than only in production
- Whether `img/ogImage.png` exists in the new conference, and any file renamed to reach that name
- Number of HTML files updated with canonicalUrl (if inherited)
- Confirm no `ogUrl:`, `ogImage:` or `root:` survived in the copied front matter
- Confirm symlinks are valid
- Confirm package.json scripts were added/updated
- Confirm _redirects were updated

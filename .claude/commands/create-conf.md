---
description: Create a new conference by copying an existing one, renaming folders, updating scripts, symlinks, redirects and ogImage/ogUrl
arguments:
  - name: conf
    description: New conference folder name / key (e.g., aics, tljs-london)
    required: true
---

This command creates a new conference based on an existing one.

## Steps

### 1. Ask for source conference

Ask the user which existing conference to copy from. Show a list of conferences from `src/conferences/`.

### 2. Ask for conference domain URL and inheritance

Ask the user two things:

**a) Domain URL** — the new conference's domain URL (e.g., `https://aicodingsummit.com`). Used for ogImage, ogUrl, _redirects.

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

### 6. Update ogImage and ogUrl in all HTML templates

In `src/conferences/<NEW_CONF>/templates/`, find all `.html` files that have `ogImage:` or `ogUrl:` in their front matter (YAML between `---` markers at top of file) and replace:

- `ogImage: https://OLD_DOMAIN/img/ogImage.png` → `ogImage: https://NEW_DOMAIN/img/ogImage.png`
- `ogImage: https://OLD_DOMAIN/img/ogImage.jpg` → `ogImage: https://NEW_DOMAIN/img/ogImage.png` (normalize to .png)
- `ogUrl: https://OLD_DOMAIN/` → `ogUrl: https://NEW_DOMAIN/`
- `ogUrl: https://OLD_DOMAIN` → `ogUrl: https://NEW_DOMAIN`

Use sed or the Edit tool. Make sure to only change the front matter section (between `---` markers), not body content.

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
- Number of HTML files updated with ogImage/ogUrl
- Number of HTML files updated with canonicalUrl (if inherited)
- Confirm symlinks are valid
- Confirm package.json scripts were added/updated
- Confirm _redirects were updated

---
description: Archive a conference's last published production site from Netlify into a year folder and fix internal links. Use when the user wants to archive a conference (e.g., "archive aics", "make an archive of the wes production", "create year archive for rs"). The conference key is the argument.
argument-hint: <conf-key>
---

This skill archives what is live on production for a conference into a year-specific folder with corrected internal links. The conference key is: $ARGUMENTS (e.g., `aics`, `jsn`, `rs`, `rdb`).

The source is the **published Netlify deploy**, not a local build: CMS data may have changed since the
site went live, so a fresh build would not match what visitors saw. Never fall back to `yarn build` on
your own.

## Steps

### 1. Find the year

- Hygraph conference: read `const eventYear = 'Y<YEAR>'` from `src/conferences/$ARGUMENTS/conference-settings.js` and strip the `Y`.
- Payload conference (no `eventYear`): take the year shown on the published site and confirm it with the user.

Stop if `src/conferences/$ARGUMENTS/<YEAR>/` already exists.

### 2. Find the published deploy

Use the Netlify MCP (`get-projects` with a part of the domain, e.g. `webengineering`). The site's
`currentDeploy.id` is the published production deploy. Check it with `get-deploy-for-site`:
`context: production`, `state: ready`, note `published_at` and whether it is `locked`.

### 3. Download the deploy

Token: `NETLIFY_AUTH_TOKEN` in this repo's `.env` (gitignored). Never print it.

```bash
TOKEN=$(grep -E '^NETLIFY_AUTH_TOKEN=' .env | cut -d= -f2-)
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.netlify.com/api/v1/deploys/<DEPLOY_ID>/files?per_page=1000"
```

The list gives `path` and `sha` (sha1) for every file. Skip paths under a top-level 4-digit year folder
(previous archives). Then:

- Download each file from the deploy permalink `https://<DEPLOY_ID>--<SITE_NAME>.netlify.app<path>`
  into `src/conferences/$ARGUMENTS/<YEAR><path>`.
- `_headers`, `_redirects` and `netlify.toml` return 404 from the permalink — fetch them from the API:
  `GET /api/v1/deploys/<DEPLOY_ID>/files/<path>` with `Content-Type: application/vnd.bitballoon.v1.raw`.
- Verify every file's sha1 against the list. Report any mismatch.

**No access** (no token, 401/403, or the request is blocked): stop and ask the user to download the
deploy themselves — Netlify → site → Deploys → the published deploy → Options → "Download deployed
files" — and give the
path to the zip. Unzip it into `src/conferences/$ARGUMENTS/<YEAR>/`, leaving out top-level year folders,
then delete the zip.

The API has no zip download for a deploy (`/deploys/<id>/download` and `/zip` answer 404), so the
zip is only for this manual fallback.

### 4. Replace internal links with year prefix

```bash
D=src/conferences/$ARGUMENTS/<YEAR>
find "$D" -name '*.html' -exec sed -i '' 's|href="/"|href="/<YEAR>/"|g' {} +
find "$D" -name '*.html' -exec sed -i '' 's|href="/\([a-z]\)|href="/<YEAR>/\1|g' {} +
find "$D" -name '*.html' -exec sed -i '' 's|href="/#|href="/<YEAR>/#|g' {} +
```

Rules:
- Replace `href="/` followed by a letter, `"` or `#`
- Do NOT replace links that already have the year prefix
- Do NOT replace external links (`href="http`, `href="//`)
- Do NOT replace same-page anchors (`href="#`) or relative links without a leading slash
- Quote `--include='*.html'` in grep — zsh expands the bare glob and the command fails

### 5. Report results

- The year and how it was found
- Site, deploy id, `published_at`, locked or not
- How many files were downloaded and whether all checksums matched
- How many HTML files had links updated, with a sample grep of the replaced links

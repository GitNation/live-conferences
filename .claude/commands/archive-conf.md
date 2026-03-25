---
description: Build conference, copy build output to archive year folder, and fix internal links
arguments:
  - name: conf
    description: Conference key (e.g., aics, jsn, rs, rdb)
    required: true
---

This command archives a conference build into a year-specific folder with corrected internal links.

## Steps

### 1. Read the year from conference config

Read `src/conferences/$ARGUMENTS.conf/conference-settings.js` and extract the year from `const eventYear = 'Y<YEAR>';`. Strip the `Y` prefix to get just the number (e.g., `Y2024` → `2024`).

### 2. Build the conference

```bash
yarn build:$ARGUMENTS.conf
```

Wait for the build to complete.

### 3. Copy build output to the archive folder (excluding year folders)

Create the year folder and copy all build files, excluding any nested year folders (previous archives):

```bash
mkdir -p src/conferences/$ARGUMENTS.conf/<YEAR>
rsync -a --exclude='/[0-9][0-9][0-9][0-9]/' build/$ARGUMENTS.conf/ src/conferences/$ARGUMENTS.conf/<YEAR>/
```

This excludes top-level 4-digit year folders from the build output so previous archives are not copied into the new one.

### 4. Replace internal links with year prefix

In the `src/conferences/$ARGUMENTS.conf/<YEAR>/` directory, find all `.html` files and replace internal links:

```bash
# Replace href="/" (root link) with href="/YEAR/"
find src/conferences/$ARGUMENTS.conf/<YEAR>/ -name "*.html" -exec sed -i '' 's|href="/"|href="/<YEAR>/"|g' {} +

# Replace href="/something with href="/YEAR/something (but not href="// or already prefixed)
find src/conferences/$ARGUMENTS.conf/<YEAR>/ -name "*.html" -exec sed -i '' 's|href="/\([a-z]\)|href="/<YEAR>/\1|g' {} +
```

Rules:
- Only replace `href="/` followed by a letter or `"` (end quote means `href="/"`)
- Do NOT replace links that already have the year prefix
- Do NOT replace external links (href="http", href="//")
- Do NOT replace anchor links (href="#")
- Do NOT replace relative links without leading slash

### 5. Report results

After all steps, report:
- Which year was extracted from config
- How many files were copied
- How many HTML files had links updated
- Show a sample grep of the replaced links to confirm

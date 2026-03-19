---
name: fix-year-links
description: Replace all internal href="/" links with year prefix in all HTML files of a conference
arguments:
  - name: conf
    description: Conference key (e.g., aics, jsn, rs)
    required: true
  - name: year
    description: Year to prefix links with (e.g., 2025)
    required: true
---

In the directory `src/conferences/$arguments.conf/$arguments.year/`, find all `.html` files and replace internal links that start with `href="/` so they become `href="/$arguments.year/`.

Rules:
- Only replace `href="/` followed by a letter or `"` (end quote means href="/")
- Do NOT replace links that already have the year prefix (e.g., `href="/$arguments.year/`)
- Do NOT replace external links (href="http", href="//")
- Do NOT replace anchor links (href="#")
- Do NOT replace relative links without leading slash

Use `sed` to perform the replacements across all HTML files:

```bash
# Replace href="/" (root link) with href="/YEAR/"
find src/conferences/$arguments.conf/$arguments.year/ -name "*.html" -exec sed -i '' 's|href="/"|href="/'$arguments.year'/"|g' {} +

# Replace href="/something with href="/YEAR/something (but not href="// or href="/YEAR/ already)
find src/conferences/$arguments.conf/$arguments.year/ -name "*.html" -exec sed -i '' 's|href="/\([a-z]\)|href="/'$arguments.year'/\1|g' {} +
```

After running, report how many files were changed and show a sample of the replacements.

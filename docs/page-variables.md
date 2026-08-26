# Page variables (front matter)

The `---` block at the top of a template. Every key becomes a plain Nunjucks variable,
so `{{ pageKey }}` just works. Wiring: [gulp/tasks/nunjucks.js:117](../gulp/tasks/nunjucks.js#L117).

⚠️ = review for removal. Page counts cover **active** conferences only — `dummy`, `jsnl`,
`jsny`, `remix`, `rsre` are retired (not in `build-all-brands`) and are ignored here.

| Variable | What it does | |
|---|---|---|
| `pageKey` | CMS key — feeds `pages[pageKey].pageSections.*`. No CMS data → page silently skipped. Filename ≠ key sometimes, see [CLAUDE.md](../CLAUDE.md) | |
| `fakeLinks` | Interactive parts require login: buttons open an auth dialog instead of following the link (`isAuth = not fakeLinks`) | |
| `inPerson` | Offline page (not remote). Swaps data to `fullTicketInPerson`, `datesInPerson`, `emsScheduleOffline` | |
| `timeZone` | Schedule pages only. **Pins the event's time** rather than showing the visitor's local one — without it, times are converted to the browser's timezone ([scheduleToLocalTime.js:18](../src/components/scheduleToLocalTime.js#L18)). Unset → schedule shows the `pieceOfTexts.schedule__tip` hint from the CMS | |
| `confName` | Conference code, lets a **shared** partial branch on one specific conference | |
| `canonicalUrl` | `<link rel="canonical">`, appended to the brand url. A sub-conference must include its own prefix (`asia/faq`) | |
| `remoteSwitchLink` | Target of the Remote / In-person toggle | ⚠️ duplicates `pagesPieceOfTexts.remoteSwitch__remoteLink` — hardcode |
| `headerBtn` | Tickets button in the header | ⚠️ read only by the old header ([_headerV2.html:21](../src/partials/_headerV2.html#L21)), a no-op everywhere else — yet set on 187 pages |
| `headerBurger` | Burger dropdown | ⚠️ old header only; 14 pages |
| `headerMod` | Extra class on `<header>` | ⚠️ 4 distinct values over 32 pages — states, not per-page settings; derive from `pageKey` |
| `speakersMod` | Speakers block modifier | ⚠️ nearly all of its 29 pages set the same value — make it the sass default |
| `heroInnerBgImage` | Inner hero background | ⚠️ 57 pages, many just repeating the partial's own default; pick by `pageKey` in sass |
| `heroInnerLogo` | Inner hero logo (default `img/logo.svg`) | ⚠️ same, 11 pages |
| `inner` | Marks an inner (non-main) page | ⚠️ read only by `radv`/`radv-canada` local partials, no shared one; the new header derives `pageKey !== 'main'` itself. 26 pages |
| `footerTitle` | Footer heading | ⚠️ **no active conference reads it** — the only reader is retired `jsny`. Set on 12 pages, all dead weight |
| `followUsTall` | Tall "Follow us" block | ⚠️ 18 pages, read only by `radv`/`radv-canada` local partials |

## `subPath` — a conference variable, not a page one

Lives in `conference-settings.js`, which reaches templates through
[gulp/tasks/nunjucks.js:124](../gulp/tasks/nunjucks.js#L124) alongside the CMS content.

Set **only on a sub-conference** — `'nyc/'`, `'aijs/'`, `'asia/'`. No leading slash, trailing
slash required. A parent conference leaves it unset, so each expression below collapses to the
plain root.

| Built from it | Where |
|---|---|
| `og:url` = `conference.url + subPath` | [_media-tags.html:1](../src/partials/_media-tags.html#L1) |
| `og:image` = the same base + `img/ogImage.png` | [_media-tags.html:3](../src/partials/_media-tags.html#L3) |
| conference root in links = `/{{ subPath }}` | `_hero-inner`, `_headerV2`, `_checkout`, `_prices` |

The og image filename is hardcoded and identical everywhere: `img/ogImage.png`. A conference
missing that file (`radv`, `radv-canada`) emits an og:image that 404s — add the asset, don't
rename the reference.

Hygraph wins over both derived tags: `Page.ogUrl` and `Page.ogImage` override them, and some
pages depend on that (`aics-nyc` `/faq`, `/checkout`).

## `cms` — which CMS owns the pages

Also a `conference-settings.js` variable. `'payload'` makes the page filter build its list of
valid `pageKey`s from `content.payload.pages` instead of Hygraph's `content.pages`
([nunjucks.js:125](../gulp/tasks/nunjucks.js#L125)) — a migrated conference then renders its
pages without keeping a stub page in Hygraph. Unset (every conference but `jsn`) means Hygraph.

Only the page list moves. Both sources still reach templates side by side — `pages` is Hygraph,
`payload.pages` is Payload — and each template picks one itself; the flag is not read in any
template.

## Gotchas

**Two timezone attributes, one is a no-op.** `data-time-zone` (hyphenated, on talk times)
works. `data-timezone` (one word, on tab dates) is ignored —
[formatedDate.js](../src/components/formatedDate.js) only reads `data-date`.

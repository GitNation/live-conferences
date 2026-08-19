# Tech debt / follow-up work

Plans for unifying the conference codebase. The items are independent — take them in any
order — but 1 and 2 belong together, since both touch `sass/helpers/`.

Status as of 2026-08-01. The reference conference for every item is `jsn`.

---

## 1. Drop the font mixins, move to CSS variables

**Done (in `jsn` only):**

- All 59 `+light` / `+regular` / `+medium` / `+bold` / `+black` calls replaced with plain
  `font-family: var(--font-default|--font-current)` + `font-weight`
- Added to [_variables.sass](../src/conferences/jsn/sass/helpers/_variables.sass):
  - `--font-default: Manrope, sans-serif` — body text (weights 300/400/500)
  - `--font-current: Sora, sans-serif` — accent (weights 700/800)
- Fonts taken off the Google Fonts CDN and stored locally in
  [jsn/fonts/](../src/conferences/jsn/fonts/) as `.woff2` (6 files, latin subset, ~24 KB each);
  the `<link>` to `fonts.googleapis.com` is gone from `_layout.html`
- The shared `=font` mixin in [_mixins.sass](../src/partials/sass/_mixins.sass) no longer
  pulls `.woff` — only `.woff2` (checked: every one of the 29 conferences has `.woff2`, all build)

**Left to do:**

- [ ] Three mixins (`=regular`, `=bold`, `=black`) are still defined in
      [jsn/sass/helpers/_typography.sass](../src/conferences/jsn/sass/helpers/_typography.sass) —
      they are called from **shared** partials, which every conference imports:
      - `src/partials/sass/_line-up.sass:12` → `+black`
      - `src/partials/sass/_popup-subscription.sass:119` → `+regular`
      - `src/partials/sass/_popup-subscription.sass:145` → `+bold`

      They can only go once **all** conferences are on variables — otherwise the 20+ that
      define these mixins themselves break.

- [ ] Repeat the migration for the rest. Conferences defining the mixins locally:
      `aics`, `aics-asia`, `aics-berlin`, `aics-nyc`, `c3`, `doconf`, `dummy`, `gqconf`, `jsnl`,
      `jsny`, `jsnus`, `mlconf`, `nodeconf`, `qaconf`, `radv`, `radv-canada`, `rdb`, `remix`,
      `rs`, `rsasia` (plus check `rsre`, `rsus`, `tljs`, `tljs-amsterdam`, `tsc`, `vjsl`,
      `wes`, `wgds`)

- [ ] Final step: replace the 3 calls in `src/partials/sass/` with `var(--font-*)` and delete
      the mixin definitions everywhere

- [ ] Separately: `jsn` still carries 5 `@font-face` rules for **GothamPro** — the font is
      used by no rule at all (checked by grep), but the user asked to keep it. Decide later:
      delete the `@font-face` rules + 10 files from `fonts/` + the `--font-gotham` variable,
      or keep them.

**How to check:** `npx sass --load-path=src --no-source-map src/conferences/$key/sass/app.sass /dev/null`

---

## 2. One folder and file structure across `sass/`

Three different schemes today. They need to become one.

| Scheme | Folders | Conferences |
|--------|---------|-------------|
| A (most, 21) | `components/ generated/ helpers/ lib/` | `c3`, `doconf`, `gqconf`, `jsn`, `jsnl`, `jsnus`, `jsny`, `mlconf`, `nodeconf`, `qaconf`, `rdb`, `remix`, `rs`, `rsasia`, `rsre`, `tsc`, `vjsl`, `wgds`, `dummy`, `radv`, `radv-canada` |
| B (7) | `partials/` instead of `components/` | `aics`, `aics-asia`, `aics-berlin`, `aics-nyc`, `rsus`, `tljs`, `tljs-amsterdam`, `wes` |
| C (4) | an extra `tpl/` folder | `dummy`, `radv`, `radv-canada` |

File names inside `helpers/` diverge too:

- `_typography.sass` — `jsn`, `jsnus`
- `_fonts.sass` — 20 conferences
- `_functions.sass` (holds the font mixins) — `dummy`, `radv`, `radv-canada`
- none at all — `jsnl`, `mlconf`, `remix`, `rsre`

**Proposed reference (as in `jsn`):**

```
sass/
  app.sass            — entry point, @import only
  _common.sass        — base styles (body, utilities)
  _main.sass
  components/         — one file per section/component
    _all.sass         — re-export
  helpers/
    _all.sass
    _variables.sass   — CSS variables + sass variables
    _typography.sass  — @font-face and nothing else
    _reset.sass
  generated/          — sprites, generated output
  lib/                — third-party styles (swiper, slick)
```

- [ ] `partials/` → `components/` (scheme B → A), fix the `@import`s in `app.sass`
- [ ] `_fonts.sass` / `_functions.sass` → `_typography.sass` everywhere
- [ ] Work out what `tpl/` in scheme C is, then drop it or make it official
- [ ] Document the final scheme in `CLAUDE.md`

---

## 2.5. Clearing out dead sass files

12 unused components deleted in `jsn` (52 → 40). Build verified: no broken imports,
`app.css` compiles.

**How "dead" was decided.** Every file's classes were searched for in `class="..."` in three
places: the conference's live templates, the shared partials, and the
`@focus-reactive/react-app-layer` bundle. Then against the archived builds in
`src/conferences/jsn/20*/`, which show what actually rendered in each year.

Two traps that make a naive grep wrong:

1. **React sections.** `_video-widget.sass` appears in no archived HTML at all, but React
   mounts that section through `{{eventsLayer.mountPoint('video-widget-mount')}}` — it cannot
   be in the static output. Such files must not be deleted; check
   `node_modules/@focus-reactive/react-app-layer/dist/` too.
2. **Pages with no CMS data.** The template is in the repo, but the page is silently skipped
   during the build because Hygraph has nothing under its `pageKey`. Of the 13 `jsn` templates,
   only `index`, `checkout` and `faq` build today. A class in such a template is live — the
   page simply is not published yet.

**Still grey area** — files tied to pages that have not built since 2024–2025
(`extended`, `teams`, `attendee`). Formally live: fill the CMS and they are needed again.

- [ ] Settle with the team what happens to the `extended` (last rendered 2024) and `teams`
      (2024) pages. If they are not planned any more, delete both templates and styles:
      `_text-content.sass`, `_dates-map.sass`, `_for-boss.sass`, `_teams.sass`
- [ ] `_sponsors-offers.sass` — used on `attendee.html`, last rendered 2023, but the class is
      also in the react layer. Check separately
- [ ] Run the same pass over the other 28 conferences — the picture there is surely the same

---

## 3. Move every conference onto the section loop

**Reference:** [jsn/templates/index.html:23](../src/conferences/jsn/templates/index.html#L23)

```njk
{% for section in pages[pageKey].sections %}
  {% if section.key == 'Hero' %}
    {% set heroData = section %}
    {% include "parts/_hero.html" %}
  {% endif %}
  ...
{% endfor %}
```

The CMS decides which sections exist and in what order, not hardcoded template order.

**Where we are:** only `jsn` (3 pages) and `rsasia` (1 page) use the loop. The rest are on the
old `{% if pages[pageKey].pageSections.X %}` pattern, where the order is hardcoded.

- [ ] Finish `jsn`: legacy conditions remain in `index.html` below the loop
      (`forBoss`, `performances`, `twitts`, `popVideos`, `companyTicket`, `discountForm`) —
      move them into the loop once Section entries exist in Hygraph
- [ ] Roll the loop out to the remaining `rsasia` pages
- [ ] Then one conference at a time, starting with the closest events
- [ ] Related: navItem section anchors — 12 of 22 section ids do not match their keys, a
      key→id table is needed (see project memory)

---

## 3.5. Per-conference JS: `main.js` with imports

Shared js components live in `src/components/` (the same place the shared `src/app.js` imports
from). A conference pulls in the ones it needs through its own `js/main.js` — one `import` per
component, the way `app.sass` does `@import ../../../partials/sass/_prices`.

```js
// src/conferences/jsn/js/main.js
import '../../../components/typewriter';
```

```html
<!-- templates/layouts/_layout.html -->
<script defer type="text/javascript" src="js/main.js"></script>
```

**How it builds.** [webpack.config.js](../webpack.config.js) has a `confEntry()` function: it
adds a second `main` entry, but **only if** `src/conferences/$CONF_CODE/js/main.js` exists.
Conferences without that file build as before, from one `app.js`.

One detail that matters: [jsConf](../gulp/tasks/jsConf.js) copies `js/*.js` into the build
verbatim, so `main.js` is **excluded** from it (`'!' + config.src.jsConf + '/main.js'`) —
otherwise the raw file with `import` would overwrite the built bundle.

Verified on `jsn`: `main.js` is 5.9 KiB against 3 MB for `app.js`, typewriter is inside
`main.js` and absent from `app.js`; `rs` (no `main.js`) builds without errors.

**To add a shared script:** drop the file in `src/components/`, add one `import` line to that
conference's `js/main.js`. No symlinks, no config changes.

**Done:**

- `src/components/typewriter.js` — hero typewriter without GSAP, on `requestAnimationFrame`.
  Turns itself off when the page has no `[data-update-title]`.
- `src/components/heroVideo.js` — lazily inserts the hero background video.

Both wired into `jsn` through `js/main.js`.

### `heroVideo.js`

Replaced the inline `<script>` from `_layout.html`. What changed against the old version:

- `prefers-reduced-motion` is checked **before** insertion. Previously a CSS rule
  ([_hero.sass](../src/conferences/jsn/sass/components/_hero.sass) `@media (prefers-reduced-motion)`)
  hid the video but the file downloaded anyway — 3.4 MB wasted
- `requestIdleCallback` instead of `window.load`: the latter waits for all 12 third-party
  scripts (GTM ×4, Meta Pixel, Twitter, VWO, Convert, Gauges, Google Optimize), which delayed
  the video by seconds. `timeout: 3000` is the safety net, with a `load` fallback for
  Safari < 16.4
- dropped the pointless `preload="auto"` (the element is created exactly when it is shown)

The path is the same everywhere — `video/hero.mp4` — so it is hardcoded in the component.

**Left to do:**

- [ ] Wire `heroVideo.js` into the other conferences with a hero background video: `c3` and
      `rdb`. They have the same logic **plus** hiding the video on mobile (`max-width: 767px`)
      and removing the element on `resize` — that behaviour has to survive the move (through a
      `data-video-min-width` on the container, for instance)
- [ ] `c3`'s video weighs **18 MB**, `jsnus` 17 MB, `nodeconf` 11 MB. Check whether those sizes
      are needed, and whether they load on mobile at all
- [ ] With the hero video on there is **no** `background-image`: in
      [_hero.html](../src/conferences/jsn/templates/parts/_hero.html) the background sits under
      `{% if not heroData.customData.backgroundVideo %}`, even though `hero_video.jpg` is in
      `preload` and downloads. The background is empty until the video starts — decide whether
      to set a poster
- [ ] `jsnus` — its own copy of `animations.js` with the old GSAP typewriter. Give it a
      `js/main.js` with the import and remove the 2 GSAP tags from `_layout.html`
      (deliberately deferred)
- [ ] `c3` — the typewriter is woven into 239 lines of GSAP animations (`ScrollTrigger`,
      `fadeUp`, `textEffect`) and behaves differently: it types once, no loop. It does not port
      mechanically — the file has to be split into "shared typewriter" and "c3-specific
      animations" first
- [ ] The other `animations.js` copies (`aics`×4, `rs`, `rsasia`) hold no typewriter — those are
      different animations. Check whether anything in them deserves moving to `src/components/`

---

## 3.6. Inline scripts in `src/partials/js/`

`src/partials/js/` holds **HTML partials with an inline `<script>`**, included through nunjucks
(not to be confused with the js components in `src/components/`). There are three:
`_filter-hero-buttons.html`, `_prefill-tito-widget.html`, `_sort-ticketsV2.html`.

The catch: they are included almost everywhere (`_filter-hero-buttons` in 25 conferences), so
any edit there touches the whole project and needs before/after behaviour checks.

**Done:** `_filter-hero-buttons.html` refactored. Two bugs fixed on the way:

1. In the final phase (the week after the conference) it hid the classes `js-hero-btn-1/-2/-3`
   with a dash, while [_hero-buttonsV2.html](../src/partials/_hero-buttonsV2.html) generates
   `js-hero-btn1/2/3` — without. The buttons never hid.
2. The fallback `new Date(ems) || new Date(conferenceStart)` never worked:
   `new Date('garbage')` returns `Invalid Date`, which is a truthy object. Replaced with an
   `isNaN` check.

Behaviour compared against the old version at 12 points on the timeline (−40d … +14d) — matches
everywhere except the fixed bug.

**Left to do:**

- [ ] `_prefill-tito-widget.html` and `_sort-ticketsV2.html` (9.8 KB) have not been looked at —
      they likely have the same problems
- [ ] Consider moving this logic into `src/components/` as ordinary js modules: today the code
      is inlined into every page and goes through neither ESLint nor minification

---

## 3.7. Remove the inline `confFinished` constant from every conference

**After this PR is merged.**

The conference end date used to reach JS through a global: an inline `<script>` in
`_layout.html` declared `const confFinished`, and the `popup-promo.js` and `noticePanel.js`
components read it as a global (ESLint complained `confFinished is not defined`).

**Done:** both components now take the date from `eventsBus`, like everything else:

```js
const { eventInfo } = eventsBus.content;
const confFinished = eventInfo.conferenceFinish || eventInfo.emsEvent.endDate;
```

The precedence is kept from the original and it matters: `jsn` gets `conferenceFinish` as
`null` and only has the date in `emsEvent.endDate`, while `c3`'s two values differ by a day.

The inline script is removed from `_layout.html` **in `jsn` only**.

**Left to do:**

- [ ] Delete `<script>const confFinished = ...</script>` from `templates/layouts/_layout.html`
      in the other 23 conferences:
      `aics`, `aics-asia`, `aics-berlin`, `aics-nyc`, `c3`, `doconf`, `gqconf`, `jsnus`,
      `mlconf`, `nodeconf`, `qaconf`, `radv`, `radv-canada`, `rdb`, `rs`, `rsasia`, `rsus`,
      `tljs`, `tljs-amsterdam`, `tsc`, `vjsl`, `wes`, `wgds`

      It is simply unused there now — the components ignore it and nothing conflicts (a `const`
      inside an ES module is local). So this is cleanup, not an urgent fix.
- [ ] Archived builds (`src/conferences/*/2024/`, `2025/` and so on) need **no** changes — that
      is finished HTML from past years

---

## 4. Add an LLM

No detail yet — the scope needs pinning down, and what is actually meant (an LLM assistant on
the site? content generation? something in the build pipeline?).

- [ ] Write the requirements

---

## 5. Drop the unnecessary GSAP and jQuery includes

### GSAP

Included in 5 conferences, with versions and plugin sets drifting apart:

| Conference | Version / CDN | Plugins |
|------------|---------------|---------|
| `c3` | 3.12.2 cdnjs | `ScrollTrigger`, `TextPlugin` |
| `jsn` | 3.12.2 cdnjs | `TextPlugin` |
| `jsnus` | 3.12.2 cdnjs | `TextPlugin` |
| `rs` | 3.13.0 jsdelivr | `ScrollTrigger`, `SplitText` |
| `rsasia` | 3.13.0 jsdelivr | `ScrollTrigger`, `SplitText` |

- [ ] Check in each whether `gsap` is called from JS at all — if not, drop the include
- [ ] Where it is needed: settle on one version and one CDN
- [ ] Load only the plugins actually used

### jQuery

- [ ] `dummy/templates/layouts/_layout.html:54` — jQuery **1.9.1** (2013), check and remove
- [ ] `rdb/templates/layouts/_layout.html:117` — same thing

> Note: `rs` and `rsasia` turn up in a grep for `jquery`, but that is the internals of the
> inline VWO script (`use_existing_jquery`), not a library include. Leave them alone.

---

## 6. Checkout: one widget per page, and dead data paths

Found 2026-08-19 while working on the jsn checkout. Neither item is Payload work — both
reproduce on the current Hygraph path in any conference with two tabs.

### 6.1. The sorting script assumes a single widget on the page

Three functions in [_sort-ticketsV2.html](../src/partials/js/_sort-ticketsV2.html) reach
for the first matching element on the page instead of their own widget's:

- [ ] `addTitoDiscountButton` (line 217) — `document.querySelector('.tito-discount')`,
      so the promo code button only ever appears in the first tab. Needs
      `querySelectorAll` plus a check for a button that is already there.
- [ ] `addMultipassBlockIntroTickets` (line 99) — moves the banner into
      `document.querySelector('.tito-widget-form > div')`, always the first form. Its
      guard is dead too: `.tito-release .multipass-ticket` never matches, because the
      `multipass-ticket` class goes on the `.tito-release` itself rather than a
      descendant, so the move repeats on every section iteration.
- [ ] `handleTitoAnchors` (line 237) — binds a listener to `document` inside
      `on:widget:loaded`, once per widget, so the listeners pile up.

### 6.2. The partial reads the side panel from a shape the page no longer has

[_checkoutV2.html](../src/partials/sections/_checkoutV2.html) takes `addons`,
`multipassBanner`, `waitlistForm` and `whatToExpect` from
`pages[pageKey].pageSections.*`, but a page on Hygraph's newer shape has no
`pageSections` node at all — the data sits in `sections[].components.*`. Only
`priceIncrease` renders, because it is the one read through `checkoutData.components`.

jsn 2027 shows it plainly: `addons` are filled in the CMS
(`sections[0].components.addons`) and the panel on the page is empty.

Worse, the widgets themselves are read the same way — `pageSections.checkout.default.link`
and `.remote.link`. jsn has those in neither shape, so `build/jsn/checkout.html` currently
carries `<tito-widget event="">` and the ticket page does not work. The links live in the
Payload `checkout` block; the page moves onto it in
[stage 4](payload-migration-plan.md#stage-4--the-other-jsn-pages).

- [ ] Point the four blocks at `checkoutData.components.*`
- [ ] Check the other conferences: which ones already have a checkout page on the new shape

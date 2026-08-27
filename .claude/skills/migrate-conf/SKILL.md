---
description: Migrate one conference from Hygraph to Payload CMS — dump its CMS content, then recreate brand, conference, pages and sections in Payload. Use when the user wants a conference moved to Payload ("migrate rsus", "перенеси rs в пейлоад", "давай мигрируем tljs"). Only 2026 and 2027 editions are in scope.
argument-hint: <conf-key>
---

Migrates `$ARGUMENTS` (a folder name in `src/conferences/`, e.g. `rsus`, `rs`, `tljs`) from Hygraph
into Payload. Read `payload/CLAUDE.md` before writing anything — schema conventions live there.

**Scope gate.** Read `src/conferences/$ARGUMENTS/conference-settings.js`. If `eventYear` is not
`Y2026`, `Y2026_2`, `Y2027` or `Y2027_2`, stop and say so — older editions are not migrated.

**Only Hygraph data moves.** Speakers, sponsors, workshops, MCs, committee, discussion rooms and the
schedule come from EMS, which Payload fetches on its own — never copy them. Migrating an EMS-backed
section means creating its block with a title, nothing more.

**This skill fills data only.** Rendering is a separate job — see *Rendering is not included*.

---

# 1. Where the data goes

## Conference level

| Hygraph | Payload |
|---|---|
| `conference.title` (`React_Summit_US`) | `brands.title` — **the join key**, must match `conferenceTitle` exactly |
| `conference.city`, `conference.url` | `brands.city`, `brands.url` |
| `conference.{twitter,facebook,instagram,tiktok,youtube,linkedin,bluesky,discord}Url`, `conference.gnPortal` | `brands.socials[]` → `{network, url}`; `gnPortal` becomes network `portal`. Skip null and `""` |
| `conferenceSettings.eventYear` | `conferences.eventYear` |
| `customContent.eventInfo.emsEventId` | `conferences.emsEventId` + `useEmsData: true` |
| `customContent.eventInfo.conferenceStart` / `conferenceFinish` | `conferences.startTime` / `endTime` — use these, **not** `pageSections.conferenceStart/Finish`, which disagree |
| `customContent.eventInfo.tbaSpeakersNumber` | `conferences.tbaSpeakersNumber` |
| `pages.main.pageNavigation.headerNav[]` `{href,text}` | `conferences.header.navigation[]` `{url, text, openInNewTab}` |
| `pages.main.pageNavigation.footerNav[]` | `conferences.footer.navigation[]` |

Navigation is **taken from `pages.main` only** and becomes the one header and footer for the whole
site. Hygraph stores a separate `pageNavigation` on every page and they differ — those are dropped on
purpose. `openInNewTab` is true when the href starts with `http`.

## Page level

One Payload page per Hygraph page. `pages.<key>` → `pages.key`; **never send `slug`**, a hook derives
it. Keys must exist in `payload/src/constants/pageKeys.ts`.

| Hygraph | Payload |
|---|---|
| `pages.<key>.titleSeo` | `pages.seo.title` |
| `pages.<key>.seoDescription` | `pages.seo.description` |
| `pages.<key>.keywords` | `pages.seo.keywords` |
| `pages.<key>.titlePage` | `heroInner.title` on inner pages |
| every `pageSections.<name>: true` boolean | the block exists on the page; `false` → do not create it |

The SEO caps were raised to 80 / 250 so Hygraph copy fits as written — never truncate a description
to make it pass validation.

## `pieceOfTexts` — the copy layer

66 flat `key -> html` entries in `pagesPieceOfTexts`, and the same 66 wrapped in `pieceOfTexts`.
Take the values from `pagesPieceOfTexts`; `pieceOfTexts[key].renderStyle` is worth reading, see below.
Every conference uses the same key names, so this table is the reusable part of the migration.

**Tags in the value are content — keep them.** This holds for `pageSections` and `pageStatistics`
too, not just the text layer:

- Target is a `text` field → the string goes in as it is, markup included. `hero__title` is three
  `<span>`s carrying `data-update-title="React,Web,Full-stack"`, which the typewriter script reads;
  strip that and the heading stops animating. The one tag to remove is the `<p>` that markdown wraps
  a single line in (`<p>Discussions</p>` → `Discussions`) — that is a container, not authored markup.
  `pieceOfTexts[key].renderStyle` tells them apart: `Standard_Markdown` means the wrapper is
  markdown's, `null` means an editor typed the tags.
- Target is a `richText` field → convert to Lexical elements, no tags left in the text.

| key | Payload |
|---|---|
| `hero__title` | `hero.title` |
| `hero__dateInPerson`, `hero__date` | `hero.date` — in-person variant first, remote as fallback |
| `hero__switchLeft` / `hero__switchRight` / `hero__switchLeftLink` | `hero.switch.leftLabel` / `.rightLabel` / `.url` |
| `event__boldtitle` / `event__text` | `event.title` / `.description` |
| `event__techstitle` | `techs.description` |
| `program__title` | `deepDives.title` |
| `features__title` | `features.title` |
| `speakers__title` | `speakers.title` |
| `pastSpeakers__title` | `pastSpeakers.title` |
| `committee__title` | `committee.title` |
| `mcs__title` | `mcs.title` |
| `videorooms__title` / `videorooms__subtitle` | `discussions.title` / `.description` |
| `zoombars__title` / `zoombars__subtitle` | `zoomBars.title` / `.description` |
| `workshopsList__title` / `workshopsList__info` | `workshops.title` / `.description` |
| `workshopsList__proLink` | `workshops.links[].button.url` |
| `location__venue` | `location.title` + `location.description` (an `<h3>` + `<p>` pair) |
| `location__address` | `location.address` |
| `multipass__title` / `multipass__desc` | `multipass.title` / `.description` |
| `prices__title` | `prices.title` |
| `fullaccess__title` | `fullTicket.title` |
| `freeTicket__title` / `freeTicket__desc` | `freeTicket.title` / `.description` |
| `freeTicket__btnText` / `freeTicket__btnLink` | `freeTicket.buttons[0]` `{label, url}` |
| `contactForm__title` / `contactForm__desc` | `followUs.title` / `.description` |
| `sponsors__title` / `sponsors__intro` / `sponsors__offer` | `sponsors.title` / `.description` / `.offer` |
| `faq__descr` | `faq.description` (page `faq`) |
| `schedule__tip` / `schedule__tipInPerson` | `schedule.tips.remote` / `.inPerson` (page `schedule`) |
| `workshops__title` | `heroInner.title` on page `workshops` |
| `preEvent__title` | `heroInner.title` on page `preEvent` |
| `ticket__text` + `ticket__link` (or `ticket__directLink`) | `conferences.header.button` `{label, url}` |
| `footer__tip` | `conferences.footer.heading` |
| `_party__title` / `_party__desc` | `party.title` / `.description` — **underscored, disabled**, see below |

No home in Payload, and none needed — do not invent fields:

- `checkout__description`, `checkout__bottomText` — hardcoded in `_checkoutV2.html:98,114`, and both
  hrefs are built at build time (the google form takes the EMS event name, the fallback link takes
  `widget.event`). Moving them into rich text would lose that. `checkout__title` is not rendered.
- `contactForm__formAction` — set on the followUs form itself.
- `contacts__socials`, `footer__tip` — the footer heading is authored on the conference now.
- `event__tip` — was under the event section back when techs lived there; techs is its own block.
- `subscriptionPopup__formAction` — already in the shared global.
- `workshopsList__proLink` — this is `workshops.typeButtons`, row `pass`. Not missing.
- `scheduleBtn__text` / `scheduleBtn__link`, `randomparty__*`, `interactivesessions__title`,
  `party__sponsored-logo`, `QuakeJS__*` — legacy, nothing renders them.
- `workshops__text`, `workshops__paidTitle` — belong to the workshops page, which most editions do
  not have in Hygraph.

## Structured sections — page `main`

Copy comes from the table above; this is the structure, from `pageSections`, `pageStatistics` and `extendeds`.

| Payload block | from |
|---|---|
| `hero` | `.stats[]` ← `pageStatistics.eventStats[]` `{value: statNumber, description: statDescr}`; `.buttons.{default,daysBefore,during,weekAfter}` ← `pageStatistics.heroButtons.{buttonsDefault,buttonsDaysbefore,buttonsDuringConf,buttonsWeekAfterConf}`, each `[heroMainCTA, heroSecondaryCTA]` → `{label: text, url: link}` |
| `event` | `.dates[]` ← `extendeds.dates[]` `{date: subtitle, title, description}`; `.blocks[]` ← nested `techs` / `deepDives` |
| `techs` | `.items[]` ← `pageStatistics.techScope[]` `{title, url: link, icon: media(imageHandle)}` |
| `deepDives` | `.items[]` ← `pageSections.program[]` `{title, description, list: bullet list of list[].item, button ← link {text, url}}` |
| `features` | `.items[]` ← `pageSections.featuresGrid[]` `{type: videoId ? 'video' : 'card', width, title, description, url: link, videoId, image: media(videoCover)}` |
| `speakers` | `.cards[]` ← `pageSections.cfp` (kind `cfp`), `speakersPropose` (kind **`ask`**), `speakersMore` (kind `more`) → `{title, description: desc, buttons:[{label: linkText, url: link}]}` |
| `pastSpeakers` | `.cards[]` ← `pageSections.pastSpeakersMore`, kind `more` only |
| `workshops` | `.links[]` ← `pageSections.workshopsInfo[]` `{note: title, button:{label: buttonText, url: buttonLink}}`; leave `typeButtons` on its default |
| `location` | `.layout` — `slider` when `extendeds.locationSlide` exists, `map` when the conference draws a map instead (rsus); `.slides[]` ← `extendeds.locationSlide`; `.video` ← `extendeds.locationVideo[0]` `{poster: image, youtubeId: registerLink}` — the row has no title, those two fields are the whole record. The map itself is still static files in the conference's `img/` |
| `prices` | `.offerBanner` ← `pageSections.lockPrice` `{title, description: text, button: link}`; `.groups[].tickets[]` ← `extendeds.prices[]` — `title` (html) → `title` + `date` (2nd `<p>`), `subtitle` → `price` + `discountBadge` (the `<del>`), `location` (`<ul>`) → `description`, `registerLink` + `locationLink` → `button`. Group by `companyName` onto `In-person` / `Remote` / `Combo` |
| `fullTicket` | `.items[]` ← `pageSections.fullTicket[]` `{title, description: desc, image: media(img), backgroundImage: media(bg), fullWidth, url: btnLink}` |
| `lineUp`, `mcs`, `committee`, `discussions`, `sponsors`, `zoomBars` | title only — the content is EMS |

## Structured sections — page `checkout`

| Payload | from |
|---|---|
| `checkout.widgets[]` | `pageSections.checkout.default` → `{label: text, event: link}`; `.remote` → a second widget |
| `checkout.priceIncrease` | `pageSections.priceIncrease` `{title, items[]: {title: name, date, price, isActive}}` |
| `checkout.whatToExpect` | `{title, description: bullet list built from list[] strings}` |
| `checkout.addons` | `{title, items[]: {title, description: text, cta:{label: cta.text, url: cta.link}, colors:{background: bgColor, text: textColor}}}` |
| `checkout.waitlistForm` | `{title, description: text, formLink}` |
| `checkout.multipassBanner` | checkbox — `true` when `pageSections.multipassBanner` is filled |

The banner's own content is the `multipass-banner` **global**, shared by every brand, and the values
are the same in every conference (rsus and jsn matched down to the price). Check it, do not rewrite it.

## Structured sections — page `faq`

The FAQ page has no `pageSections`; everything comes from the top-level `faqs` array.

1. One `faqs` collection document per Q&A: `question` ← `items[].question`, `answer` ← `items[].answer`.
2. `faq.groups[]` ← one group per `faqs[].sectionTitle`, `items` = those ids.
3. Prepend a `heroInner` block, `title` ← `pages.faq.titlePage`.

**Never duplicate a collection document.** `faqs` and `jobs` are not scoped to a conference and the
question bank is the same GitNation wording everywhere — rsus reused all 17 of jsn's without creating
one. Look a question up by exact text first and point at the existing id:

```ts
payload.find({ collection: 'faqs', where: { question: { equals: question } }, limit: 1, sort: 'id' })
```

`sort: 'id'` matters — `find` returns newest first by default, so without it a stray duplicate wins
over the original every other conference already points at.

## Media

Some fields carry a full url, some only an `imageHandle`. A bare handle resolves **only** through the
project's asset endpoint — `https://media.graphassets.com/<handle>` returns 404:

```
https://eu-central-1.graphassets.com/AjSmXWlchQ7Cnl2Jcg81Jz/<handle>
```

(the same pair `src/partials/_mixins.html:16` builds its urls from). A card's image is `bgImage`, a
video card's is `videoCover` — an item may have neither.

Download, then create a `media` document with `alt` and a folder — never the root. Existing folders:
`background/{video,image}`, `cards/{techs,dates,features,full-ticket}`, `sections/{location,diversity}`,
`logos/multipass`, `jobs`. Cache by url so a repeated asset uploads once.

---

# 2. Other things that matter

## Switched off is still content

Hygraph has two ways of switching a section off: the boolean is `false`, or the key is **renamed with
a leading `_`** — `_party`, `_cfp`, `_tours`, `pageStatistics._switch`, `checkout._remote`,
`_party__title`. Nothing strips the prefix, so templates never read it.

Both mean the same thing, and both **come over**: create the block and tick `hidden`. Payload's
switch is a checkbox, not a renamed field, so the content survives and an editor can turn it back on
in one click. rsus brought `pastSpeakers` (boolean off), `party` (`_party`) and the CFP speaker card
(`_cfp`) across that way.

Rows inside a section follow the same rule where the array has a `hidden` field — speaker cards and
checkout addons. Where it does not — ticket rows in `prices`, `event.dates`, `location.slides` — a
disabled row is simply left out; do not add it and do not invent a switch for it.

A section that is off *and* has nothing to fill (a bare `false` with no copy anywhere) is not worth a
hidden empty block. Skip it.

## Writing into Payload

No password is stored anywhere in the repo, so do not use the REST API. Use the Local API:

```bash
cd payload && pnpm payload run scripts/<name>.ts   # scripts/ is temporary, delete it after
```

```ts
import config from '@payload-config';
import { getPayload } from 'payload';
const payload = await getPayload({ config });
```

Order matters: `brands` → `conferences` → `media` → `faqs` / `jobs` → `pages`. Relationship and upload
fields take numeric ids. Uploads take `{ filePath }`.

Make the script re-runnable — it will fail somewhere on the first try.

## Never create a second copy of anything

Two conferences are already in Payload and every migration adds another, so every create has to ask
first whether the thing is there.

- **The edition.** Match on brand `title` **and** `eventYear`. Reset deletes only that pair's pages
  and conference; the brand is **reused**, never dropped — one brand holds several years, and deleting
  it would take the other editions with it.
- **Collection documents** (`faqs`, `jobs`). Look the question or title up by exact text and point at
  the existing id. See the FAQ section above for the `sort: 'id'` catch.
- **Media.** Name the upload after the Hygraph handle — the last path segment of the asset url — and
  look for that `filename` before uploading. A temp name with a timestamp in it silently adds 27 more
  files on every re-run; that mistake cost 96 orphan documents on the first pass.

If a run does leave orphan media behind, this finds them — every foreign key pointing at `media`,
unioned:

```sql
select string_agg(format('select %I as id from %I where %I is not null', a.attname, c.conrelid::regclass::text, a.attname), ' union ')
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f' and c.confrelid = 'media'::regclass;
```

Run the result as `select id from media where id not in (<that>)`, then delete those ids through the
Local API so the files go too — a psql `delete` leaves them in `payload/media/`.

Getting the dump first (step 1, from the repository root):

```bash
cat > /tmp/dump-content.js <<'EOF'
const ROOT = process.cwd();
require(`${ROOT}/node_modules/dotenv`).config({ path: `${ROOT}/.env` });
const fs = require('fs');
const { getContent } = require(`${ROOT}/node_modules/@focus-reactive/graphql-content-layer`);
const settings = require(`${ROOT}/src/conferences/${process.env.CONF_CODE}/conference-settings`);
getContent(settings).then((c) => fs.writeFileSync(process.argv[2], JSON.stringify(c, null, 2)));
EOF
CONF_CODE=<key> node /tmp/dump-content.js /tmp/<key>-hygraph.json
```

The dump is 400 KB+. Never read it whole — inspect it with `python3 -c` or `jq`.

## Rich text

Hygraph hands over HTML, Payload stores Lexical JSON. Convert; do not paste HTML into a rich text
field. The editor allows only paragraph, bold, italic, underline, link, and bullet/number lists —
`<h3>` becomes a bold paragraph, `<del>` loses its tag. Links are always `linkType: 'custom'`.
Never write the `<field>Html` sibling: it is virtual and computed on read.

## Schema shape

- Block tabs are unnamed, so **everything is flat** in JSON: `hidden`, Content fields and Style fields
  sit at one level next to `blockType`.
- Every block gets `background` / `overlay` / `overlayOpacity` except `checkout` and `schedule`.
- One block of each type per page (`uniqueBlocks`), and one page per `(conference, key)`.
- `emsEventId` is unique across conferences.
- Do not POST to `/api/conferences/:id/duplicate` — it clones every page of the source conference.
- Dropping a column or a table hangs `pnpm dev` on drizzle's interactive prompt with no visible
  error. Do the drop in psql first, then restart.

## Before adding a field for something "missing"

Three checks, in this order. Two of the four fields added during the rsus migration would have been
wrong without them.

1. **Does any template render it?** Hygraph keeps data long after the markup stopped reading it.
   `pageStatistics.heroButtons.buttonsAfterConf` looks like a fifth conference phase and every
   conference has it filled — but `_hero-buttons.html` maps four states and the JS's
   post-conference branch hides the buttons and shows a hardcoded waitlist block instead. There is no
   fifth phase; the field was added and reverted.
2. **Does a payload partial already expect it?** The reverse also happens:
   `partials/payload/sections/_zoom-bars.html:7` read `zoomBarsData.description` while the block had
   only a title. Grep the payload partial for `<block>Data.` before deciding.
3. **Is it already covered under another name?** `workshopsList__proLink` is the `pass` row of
   `workshops.typeButtons`, filled by default.

And when it does need a field, check **where it renders** before making it a section: the `lockPrice`
banner sits inside the ticket section, so it became the `prices.offerBanner` group, not a block of
its own.

Copy that is hardcoded in a payload partial stays hardcoded when its links are built at build time —
see the two checkout lines above.

## Sweep what is left over

`pageSections` collects junk over the years, so a migration is not done when the script runs clean —
it is done when everything left behind has been looked at. List every filled key the script did not
use and decide one by one:

1. **Does it render on the site today?** If yes it was missed — go back and migrate it.
2. **Did it render in any of the last three years?** From 2026 that means 2023 onward. The archived
   builds are the evidence: `src/conferences/<key>/2023/` … `2025/`. This is the one time those
   folders may be touched — grep a single file for a single string, never a recursive search.
3. **Rendered in those years but not now** → it is not junk. Report it and **ask before migrating**.
4. **Nothing in three years** → junk. Say so in the report and move on.

## Page order

Pages list in the order of the `PAGES` registry in `payload/src/constants/pageKeys.ts`, not by
creation date: main, FAQ, checkout, schedule, then the rest. The `order` field on Pages is the index
of the key in that list, written by a `beforeChange` hook, and both the collection and the
conference's `pages` join sort by it. Reordering the registry reorders every listing — but existing
rows keep their old number until they are saved again, so backfill after a change.

## Verify

```bash
curl -s 'http://localhost:3100/api/pages?where[conference.brand.title][equals]=<conferenceTitle>&where[conference.eventYear][equals]=<eventYear>&depth=2&limit=100'
```

That is the exact query the build runs (`gulp/util/payloadContent.js:6`). Then restart `yarn start:<key>`
— content is fetched once per process.

## Rendering is not included

Only `jsn` dispatches `blockType` in its templates. A migrated conference shows nothing until its
templates are ported, and four blocks (`hero`, `event`, `party`, `diversity`) currently render from
`jsn`'s own `parts/` files, so they need a shared version first. When touching a template: files in a
conference's own `parts/` can be edited in place; a shared `partials/` file must not be — use the copy
in `src/partials/payload/`, or create one.

Also note the build skips any page whose key is absent from the **Hygraph** `pages` object, so a
Payload-only page will not build until an empty page with that key exists in Hygraph too.

## What Payload does not have yet

Report these when they are filled in the conference being migrated, and leave them out of the data:

| missing | Hygraph source |
|---|---|
| tito section renaming | `pages.checkout.pageSections.TITO_SECTIONS` — no field yet, do not add one |
| a workshop authored by hand | `workshops[]` rows with a Hygraph id (a cuid, not a number). The layer put Hygraph workshops first and dropped the EMS one whose title matched, so such a row is the only source for that workshop — and Payload takes workshops from EMS only. Count them: rsus has 1 of 5 |
| "in collaboration with" logo in the hero | `pageSections.inCollaboration` — staying hardcoded |
| hero feature cards | `pageStatistics.features[]` — old, skipped on purpose |
| `ogUrl` | `pages.<key>.ogUrl`; the SEO tab has title/description/keywords only |
| tours block | `pageSections.tours` |
| images on a party block | `pageSections.party[].images` |
| partnership text | `conferenceConfig.partnershipText` |

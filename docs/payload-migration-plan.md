# Payload migration plan

Staged plan for moving live-conferences off Hygraph onto Payload, deployed on Vercel +
Neon. Written to be followed one stage at a time — each stage ends in a state that
builds and can be shipped, so the work can stop at any stage boundary.

Related: [payload-poc-state.md](payload-poc-state.md) — what exists today.

---

## Where we are

Done (PoC, branch `payload-poc`, jsn 2027 only):

- brands → conferences → pages, fixed page registry, per-conference header/footer
- 12 section blocks, seeded from real jsn content
- gulp bridge adds a `payload` namespace to the content object on every build
- jsn `index.html` renders 10 sections from Payload; the Hygraph loop below it still
  serves the rest

Not started: deployment, EMS, speakers/sponsors/schedule, the other 29 conferences.

---

## Stage 1 — deploy the PoC (Vercel + Neon)

Goal: the admin lives on a URL a content manager can open, not on petro's laptop.

1. Create the Neon project, take the **pooled** connection string.
2. Vercel project with root directory `payload/`.
3. Env vars: `DATABASE_URI` (Neon pooled), `PAYLOAD_SECRET`, `PAYLOAD_CORS_ORIGINS`
   (empty until something calls the API from a browser), `PAYLOAD_PREVIEW_URL`.
   Leave `PAYLOAD_DB_PUSH` unset — production must run migrations, not push.
4. `pnpm migrate:create` locally against the current schema, commit `src/migrations/`,
   let the deploy run `pnpm migrate`.
5. Swap local disk uploads for `@payloadcms/storage-vercel-blob` — Vercel's filesystem
   is read-only, `payload/media` does not survive there. Re-upload the seeded assets.
6. Put the admin behind the edge rate limiter; the in-memory one in `src/middleware.ts`
   is per-instance and does nothing across serverless invocations.

**Done when:** a shareable admin URL, content edits persist, images load.

**Watch out:** dev `push` and prod `migrate` diverge easily. From this stage on, every
schema change is a migration file, not a drizzle push.

---

## Stage 2 — the build reads Payload from the network

Today the bridge fetches `http://localhost:3100`. After stage 1 it fetches the Vercel
URL, which means CI builds depend on it.

1. `PAYLOAD_URL` in Netlify env for the conferences that have Payload data.
2. Decide the failure mode: right now a Payload outage logs a warning and the build
   continues with empty data. Once a conference renders **only** from Payload, that
   silently ships a page with missing sections — it must fail the build instead.
   Add a `PAYLOAD_REQUIRED` flag per conference.
3. Cache the response in CI so a redeploy of an unchanged site does not depend on
   Payload being up.

**Done when:** `yarn build:jsn` in CI produces the same HTML as locally.

---

## Stage 3 — finish the jsn page

The remaining sections split in two groups.

**Content-only — same pattern as the ones already done:**
Awards, ZoomBars, Discussions, FollowUs, ScheduleButton.

**List-driven — these need a decision first, see the open question below:**
LineUp, Speakers, PastSpeakers, MCs, Committee, Workshops, Sponsors.

For each: block → template → seed → delete the Hygraph branch from `index.html`.

**Done when:** the Hygraph loop in jsn's `index.html` is empty and can be deleted.

---

## Stage 4 — the other jsn pages

`faq`, `checkout` today; the full registry is in `payload/src/constants/pageKeys.ts`.
Page-level long-form content (FAQ answers, code of conduct) needs the second rich text
tier — the full editor with headings, which does not exist yet.

**SEO — evaluate `@payloadcms/plugin-seo` here.** It is worth a look once there are
several pages to fill in, not before. What it actually gives:

- a Google snippet preview in the admin — the real reason to install it
- a "generate" button for title and description, driven by `generateTitle` /
  `generateURL` functions we write ourselves. It is a template like
  `${doc.title} | JSNation`, not content analysis — nothing is generated on its own
- length counters, which the hand-rolled `seoTab` already has with progress bars

Two things do not come for free in our setup, because the site is a static Gulp build
rather than a Next app rendering its own pages: `og:image` and the canonical url still
have to travel through the bridge into the templates, where they are hardcoded in front
matter today. Decide then whether the snippet preview is worth the plugin.

Genuinely automatic descriptions are a separate thing — a hook calling an LLM over the
page's sections. Not a plugin feature; only consider it if the manual flow annoys.

**Done when:** every jsn page builds from Payload.

---

## Stage 5 — the second conference

Pick one that shares the most with jsn (`rs` — React Summit, same layout family).

The point of this stage is to find out **what is conference-specific in the blocks**.
Expect to hit: sections jsn does not have, different card shapes, hardcoded copy in
jsn's `parts/` that other conferences need as fields.

1. Create the brand + conference + pages in the admin.
2. Migrate its sections, reusing the existing blocks.
3. Every time a block needs a change for `rs`, decide: new field, or a separate block?
   Prefer a field with a sensible default — 30 conferences means block-per-conference
   does not scale.
4. Move `src/conferences/rs/templates/parts/*` that turn out to be identical to jsn's
   into `src/partials/payload/sections/`.

**Done when:** two conferences share one set of blocks, and the diff between their
templates is only in markup, not in data shape.

---

## Stage 6 — the remaining 28 conferences

Only start this once stage 5 proved the blocks are stable. Order:

1. **Live editions first** (whatever is selling tickets) — they get the most content
   edits, so they benefit most.
2. Compound builds (`aics` + nyc + berlin + asia, `radv` + canada, `tljs` + london)
   move together: they share a `conferenceTitle` and differ by `eventYear`, which maps
   to one brand with several conferences in Payload.
3. Archive years (2020–2025) stay as pre-built HTML. Do not migrate them.

Per conference the work is mechanical: create the documents, run a migration script,
verify the built HTML against the current production build.

**Write a data migration script**, do not hand-copy. It reads `content-log.json` for
a conference (or Hygraph directly) and POSTs to the Payload API — the seed scripts
written during the PoC are the starting point.

**Done when:** every active conference builds from Payload.

---

## Stage 7 — EMS

Speakers, schedule, sponsors and workshops come from `ems.gitnation.org`, not from the
CMS. Six modules in `graphql-content-layer` read `useEmsData` / `emsEventId` from
their own Hygraph queries; every EMS call goes through the layer's `http-utils.js`.

Payload already stores both fields on the conference; nothing reads them yet.

The intended shape: **Payload's values override Hygraph's at the layer level** — one
injection point in `http-utils.js`, not a second EMS client in the bridge. This is the
step that lets Hygraph stop being the source of the EMS wiring.

**Done when:** the EMS id and the flag are set in Payload only.

---

## Stage 8 — retire graphql-content-layer

Only reachable after stages 6 and 7. What the layer does today:

| Responsibility | Where it goes |
|---|---|
| Hygraph queries (pages, texts, faq, jobs, landings…) | deleted — Payload serves this |
| EMS fetch + merge (speakers, sponsors, workshops, schedule) | keep, extract into a small `ems-client` package |
| Markdown → HTML, formatters, `postprocess.js` | keep what the EMS data still needs |

1. Extract the EMS half into its own package; the Hygraph half stays until the last
   conference is migrated.
2. Drop `@focus-reactive/graphql-content-layer` from `package.json` and the
   `relative-deps` prestart hook.
3. `CMS_TOKEN` / `CMS_ENDPOINT` leave the env.

**Done when:** the repo has no Hygraph dependency and `yarn start:<conf>` needs only
`PAYLOAD_URL`.

---

## Open questions to settle before stage 3

**Speakers, sponsors, schedule — who owns them?** They live in EMS, and EMS is the
source of truth for the people. A Payload `Speakers` collection would duplicate that.
Likely answer: the *section* is a Payload block (title, description, buttons) and the
*list* keeps coming from the data layer. Decide this before migrating LineUp.

**Drafts and publish.** Payload has drafts; the site is static, so publishing has to
trigger a Netlify build hook. Until that exists, a content manager saving in the admin
changes nothing on the live site.

**Live preview.** The static site does not run Payload's live-preview client, so the
iframe shows the last build. Real live preview means the front end has to opt in.

**Shared content across conferences.** The Multipass deep dives list is the first case
that is identical everywhere — the "global blocks" idea. Others will show up
(hackathon, reviews). Decide whether these are Payload globals or a shared conference.

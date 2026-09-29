# Live preview (Payload admin)

The Payload admin shows a page beside its form, rendered by **this repo's templates** on request.
The CMS side is the plugin
[`@focus-reactive/payload-plugin-html-preview`](https://github.com/focusreactive/payload-plugins/tree/main/packages/payload-plugin-html-preview);
its README is the general contract. This file is what it means here.

## The render endpoint

- `ci/functions/preview/preview.js` is a Netlify function. It answers only with the header `X-Preview-Secret` equal to `PREVIEW_SECRET` (`preview.js:6`), a team-level Netlify variable scoped to Functions.
- `GET ?title=&year=&page=` renders the saved page; `POST` with `{ "doc": … }` renders the editor's unsaved form data instead.
- The shared renderer is `ci/functions/preview/renderPreview.js`. It sends back `X-Preview-Base: <subPath>` (`renderPreview.js:56`) so the page's relative urls resolve under `nyc/`.
- `yarn start:<conf>` serves the same path without the secret (`gulp/tasks/server.js:10`), for its own conference only — another one gets a 409 (`renderPreview.js:35`). The CMS uses it when its `SITE_PREVIEW_ORIGIN=http://localhost:8080`.
- Netlify bundles the function with zisi, and templates reach it only through `included_files` in `netlify.toml:6`. A new file the render reads at runtime must be listed there. A `require` built from a template literal breaks the bundle — `gulp/util/getSettings.js` uses `path.join` for that reason.
- Production sites have builds stopped (`ci/readme.md`). The function exists on a site only after that site is deployed.

## `PREVIEW`

- Set only by the preview render (`gulp/util/renderPage.js:29`), never by a build.
- Trackers stay out of preview renders: every layout wraps them in `{% if not PREVIEW %}` — two blocks in `<head>`, one over everything after the site's own scripts in `<body>`. A tracker added outside them counts every preview reload as a visit.

## Marks — what can be clicked in the preview

All print nothing outside a preview render (`gulp/util/nunjucksEnv.js:49`).

| Helper | Prints | Use on |
|---|---|---|
| `editable(row)` | `data-payload-id="<row id>"` | a section's root element, and each card in a loop over CMS rows |
| `editable(row, 'addons')` | the row's id + `data-payload-field` | a group inside a row (`checkoutData.addons`) |
| `editableDoc('faqs', item.id)` | `data-payload-doc="faqs:<id>"` | an item that is its own document — FAQ entries, pre-events |
| `editableDoc('conferences', payload.conferenceId, 'footer')` | the document + a field or tab to open in it | header and footer, which live on the conference |

- A new section partial gets `editable()` on its root and on its cards, like the existing ones.
- Every `data-payload-id` on a page must be the id of a row of **that** page. Do not mark data from globals (`payload.components.*`), from a `json` field (the hero's `settings`), or from EMS — the page's form has no row to open, and the click falls through to the section.
- The innermost mark wins, so a card inside a marked section opens the card. Buttons, form fields and in-page anchors inside a mark keep working.

## Page keys

A page whose file name differs from its key needs the pair in `pages.mappings` in `gulp/config.js`, or the preview answers 404 for it (`checkout-remote` → `remote-checkout.html`).

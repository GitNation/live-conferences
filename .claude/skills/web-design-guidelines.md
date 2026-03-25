---
description: Review UI code for Web Interface Guidelines compliance
argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review these files for compliance: $ARGUMENTS

Read files, check against rules below. Output concise but comprehensive—sacrifice grammar for brevity. High signal-to-noise.

Target stack: HTML, Nunjucks templates, SCSS, vanilla JS.

## Rules

### Accessibility

- Icon-only buttons need `aria-label`
- Form controls need `<label>` or `aria-label`
- `<button>` for actions, `<a>` for navigation (not `<div>` with click handlers)
- Images need `alt` (or `alt=""` if decorative)
- Decorative icons need `aria-hidden="true"`
- Async updates (toasts, validation) need `aria-live="polite"`
- Use semantic HTML (`<button>`, `<a>`, `<label>`, `<table>`, `<nav>`, `<main>`) before ARIA
- Headings hierarchical `<h1>`–`<h6>`; include skip link for main content
- `scroll-margin-top` on heading anchors

### Focus States

- Interactive elements need visible focus style
- Never `outline: none` without focus replacement
- Use `:focus-visible` over `:focus` (avoid focus ring on click)
- Group focus with `:focus-within` for compound controls

### Forms

- Inputs need `autocomplete` and meaningful `name`
- Use correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- Labels clickable (`for` attribute or wrapping control)
- Checkboxes/radios: label + control share single hit target (no dead zones)
- Errors inline next to fields; focus first error on submit
- Placeholders end with `…` and show example pattern
- `autocomplete="off"` on non-auth fields to avoid password manager triggers

### Animation (CSS/SCSS)

- Honor `prefers-reduced-motion` (provide reduced variant or disable)
- Animate `transform`/`opacity` only (compositor-friendly)
- Never `transition: all`—list properties explicitly
- Set correct `transform-origin`
- SVG: transforms on `<g>` wrapper with `transform-box: fill-box; transform-origin: center`

### Typography

- `…` not `...`
- Curly quotes `"` `"` not straight `"`
- Non-breaking spaces: `10&nbsp;MB`, `⌘&nbsp;K`, brand names
- Loading states end with `…`: `"Loading…"`, `"Saving…"`
- `font-variant-numeric: tabular-nums` for number columns/comparisons
- Use `text-wrap: balance` or `text-pretty` on headings (prevents widows)

### Content Handling

- Text containers handle long content: `text-overflow: ellipsis`, `-webkit-line-clamp`, or `word-break: break-word`
- Flex children need `min-width: 0` to allow text truncation
- Handle empty states—don't render broken UI for empty strings/arrays
- Nunjucks: use `{% if items.length %}` or similar guards before loops

### Images

- `<img>` needs explicit `width` and `height` (prevents CLS)
- Below-fold images: `loading="lazy"`
- Above-fold critical images: `fetchpriority="high"`

### Performance

- Large lists (>50 items): consider `content-visibility: auto`
- Add `<link rel="preconnect">` for CDN/asset domains
- Critical fonts: `<link rel="preload" as="font">` with `font-display: swap`
- Batch DOM reads/writes in JS; avoid interleaving

### Navigation

- Links use `<a>` with `href` (Cmd/Ctrl+click, middle-click support)
- Destructive actions need confirmation or undo—never immediate

### Touch & Interaction

- `touch-action: manipulation` (prevents double-tap zoom delay)
- `-webkit-tap-highlight-color` set intentionally
- `overscroll-behavior: contain` in modals/drawers/sheets

### Safe Areas & Layout

- Full-bleed layouts need `env(safe-area-inset-*)` for notches
- Avoid unwanted scrollbars: `overflow-x: hidden` on containers, fix content overflow
- Flex/grid over JS measurement for layout

### Theming

- `<meta name="theme-color">` matches page background
- Native `<select>`: explicit `background-color` and `color` (Windows dark mode)

### Hover & Interactive States

- Buttons/links need `hover` state (visual feedback)
- Interactive states increase contrast: hover/active/focus more prominent than rest

### Content & Copy

- Active voice: "Install the CLI" not "The CLI will be installed"
- Title Case for headings/buttons
- Numerals for counts: "8 speakers" not "eight speakers"
- Specific button labels: "Buy Ticket" not "Continue"
- Error messages include fix/next step, not just problem

### Anti-patterns (flag these)

- `user-scalable=no` or `maximum-scale=1` disabling zoom
- `transition: all`
- `outline: none` without `:focus-visible` replacement
- `<div>` or `<span>` with click handlers (should be `<button>` or `<a>`)
- Images without dimensions
- Form inputs without labels
- Icon buttons without `aria-label`
- Inline styles that should be in SCSS

## Output Format

Group by file. Use `file:line` format (VS Code clickable). Terse findings.

```text
## src/partials/header.html

src/partials/header.html:42 - icon button missing aria-label
src/partials/header.html:18 - input lacks label
src/partials/header.html:55 - img missing width/height

## src/conferences/rdb/sass/_modal.scss

src/conferences/rdb/sass/_modal.scss:12 - missing overscroll-behavior: contain
src/conferences/rdb/sass/_modal.scss:34 - transition: all → list properties

## src/partials/footer.html

✓ pass
```

State issue + location. Skip explanation unless fix non-obvious. No preamble.

---
description: Port working-tree changes from one conference to every related conference — the ones sharing its conferenceTitle, resolved fresh each run so new satellite events are picked up automatically. Direction does not matter; the source may be the parent or any child, since family members share the same styles and templates. Lists the target conference names and every divergence for approval BEFORE touching anything, then copies only files that were identical. Use when the user edited one conference and wants the same change everywhere (e.g. "port these changes to all child confs", "sync my changes to the family", "apply this to the related conferences").
argument-hint: <source-conf-key>
---

Port the working-tree changes of `$ARGUMENTS` to every related conference.

## Two rules

**1. Report before writing anything.** Print the target conference names and every divergence,
then wait for the go-ahead. The user wants to confirm the family is right first.

**2. Copy a file only if the target's copy was identical to the source's before the change.**
A file that already differed is intentional (own colours, own video, own GTM ids) — skip it and
say why. Never merge or overwrite a diverged file.

## 1. Resolve the family

Every conference sharing the source's `conferenceTitle` — nothing else. Not the folder name:
`rsasia`/`rsus`/`rsre` sit next to `rs` but are separate conferences with their own titles.

```bash
node -e "
const fs=require('fs');
const title=(c)=>{const p='src/conferences/'+c+'/conference-settings.js';
  if(!fs.existsSync(p))return null;
  const m=fs.readFileSync(p,'utf8').match(/conferenceTitle = '([^']*)'/);return m&&m[1];};
const src=process.argv[1], want=title(src);
console.log('title: '+want);
console.log('targets: '+fs.readdirSync('src/conferences').filter(c=>c!==src&&title(c)===want).join(', '));
" $ARGUMENTS
```

No relatives → say so and stop.

## 2. Collect changed files

`git status --short src/conferences/$ARGUMENTS/` — modified and added only, no deletions.

Sync only these paths; anything else is ignored silently:

`img/` · `icons/` · `js/` · `fonts/` · `sass/` · `templates/parts/` · `templates/*.html` (top level only)

`templates/layouts/` is a special case — **ask, never copy silently.** `_layout.html` holds
per-conference analytics ids and domains and diverges by 100+ lines, but genuine shared changes
do land there. Show the diff, say which targets are identical, ask whether to port it.

## 3. Classify each file × target

Compare the target against the source's **pre-change** version:

```bash
git show HEAD:src/conferences/$ARGUMENTS/<rel> > /tmp/before
diff -q /tmp/before src/conferences/<target>/<rel>
```

Identical → copy. Differs or missing → skip, and get a one-phrase reason from the diff
("own video: hero-video.mp4", "own accent colour"). "Differs" alone is useless.

New files: copy if the target lacks the file, skip if it has one.

## 4. Report and wait

```
Source: aics-nyc
conferenceTitle: AI_Coding_Summit
Will change 3 conferences: aics, aics-berlin, aics-asia

file                          aics     berlin   asia
sass/partials/_header.sass    copy     copy     copy
templates/parts/_hero.html    SKIP     SKIP     copy

Will NOT touch:
  aics/templates/parts/_hero.html     own video: hero.mp4
  aics-berlin/templates/parts/_hero.html  own video + own headline

Proceed?
```

Then stop. Do not proceed on assumption.

## 5. Apply and verify

`cp` the files (`mkdir -p` for new ones). Then for the source and every target that received
a `.sass` file:

```bash
npx sass --load-path=src --no-source-map src/conferences/<conf>/sass/app.sass /dev/null
```

An `Error:` line means the copy broke that conference — report it prominently.

For copied `.html`, check tag balance (a half-replaced wrapper is the classic bug).

Finish with what actually happened, and repeat the skipped list — the user needs it to decide
what to port by hand.

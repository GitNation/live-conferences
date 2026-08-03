# Tech debt / follow-up work

Планы по унификации кодовой базы конференций. Пункты независимы — можно брать в любом порядке,
но 1 и 2 логично делать вместе (оба трогают `sass/helpers/`).

Статус на 2026-08-01. Эталон для всех пунктов — конференция `jsn`.

---

## 1. Убрать шрифтовые миксины, перейти на CSS-переменные

**Что сделано (только в `jsn`):**

- Все 59 вызовов `+light` / `+regular` / `+medium` / `+bold` / `+black` заменены на прямые
  `font-family: var(--font-default|--font-current)` + `font-weight`
- В [_variables.sass](../src/conferences/jsn/sass/helpers/_variables.sass) добавлены:
  - `--font-default: Manrope, sans-serif` — основной текст (weights 300/400/500)
  - `--font-current: Sora, sans-serif` — акцентный (weights 700/800)
- Шрифты сняты с Google Fonts CDN и лежат локально в
  [jsn/fonts/](../src/conferences/jsn/fonts/) как `.woff2` (6 файлов, latin subset, ~24 KB каждый);
  `<link>` на `fonts.googleapis.com` удалён из `_layout.html`
- Общий миксин `=font` в [_mixins.sass](../src/partials/sass/_mixins.sass) больше **не** подключает
  `.woff` — только `.woff2` (проверено: `.woff2` есть у всех 29 конференций, все собираются)

**Что осталось:**

- [ ] Три миксина (`=regular`, `=bold`, `=black`) всё ещё определены в
      [jsn/sass/helpers/_typography.sass](../src/conferences/jsn/sass/helpers/_typography.sass) —
      их зовут **shared**-партиалы, которые импортируют все конференции:
      - `src/partials/sass/_line-up.sass:12` → `+black`
      - `src/partials/sass/_popup-subscription.sass:119` → `+regular`
      - `src/partials/sass/_popup-subscription.sass:145` → `+bold`

      Убрать их можно только после того, как **все** конференции перейдут на переменные —
      иначе сломаются те 20+, что определяют эти миксины у себя.

- [ ] Повторить миграцию для остальных конференций. Список тех, кто определяет миксины локально:
      `aics`, `aics-asia`, `aics-berlin`, `aics-nyc`, `c3`, `doconf`, `dummy`, `gqconf`, `jsnl`,
      `jsny`, `jsnus`, `mlconf`, `nodeconf`, `qaconf`, `radv`, `radv-canada`, `rdb`, `remix`,
      `rs`, `rsasia` (+ проверить `rsre`, `rsus`, `tljs`, `tljs-amsterdam`, `tsc`, `vjsl`,
      `wes`, `wgds`)

- [ ] Финальный шаг: заменить 3 вызова в `src/partials/sass/` на `var(--font-*)` и удалить
      определения миксинов везде

- [ ] Отдельно: у `jsn` остались 5 `@font-face` для **GothamPro** — шрифт не используется
      ни в одном правиле (проверено grep'ом), но пользователь попросил оставить. Решить позже:
      удалить `@font-face` + 10 файлов из `fonts/` + переменную `--font-gotham`, или оставить.

**Как проверять:** `npx sass --load-path=src --no-source-map src/conferences/$key/sass/app.sass /dev/null`

---

## 2. Единая структура папок и файлов в `sass/`

Сейчас три разные схемы. Нужно привести к одной.

| Схема | Папки | Конференции |
|-------|-------|-------------|
| A (большинство, 21) | `components/ generated/ helpers/ lib/` | `c3`, `doconf`, `gqconf`, `jsn`, `jsnl`, `jsnus`, `jsny`, `mlconf`, `nodeconf`, `qaconf`, `rdb`, `remix`, `rs`, `rsasia`, `rsre`, `tsc`, `vjsl`, `wgds`, `dummy`, `radv`, `radv-canada` |
| B (7) | `partials/` вместо `components/` | `aics`, `aics-asia`, `aics-berlin`, `aics-nyc`, `rsus`, `tljs`, `tljs-amsterdam`, `wes` |
| C (4) | доп. папка `tpl/` | `dummy`, `radv`, `radv-canada` |

Разнобой и в именах файлов внутри `helpers/`:

- `_typography.sass` — `jsn`, `jsnus`
- `_fonts.sass` — 20 конференций
- `_functions.sass` (содержит миксины шрифтов) — `dummy`, `radv`, `radv-canada`
- нет ни одного — `jsnl`, `mlconf`, `remix`, `rsre`

**Предлагаемый эталон (как в `jsn`):**

```
sass/
  app.sass            — точка входа, только @import
  _common.sass        — базовые стили (body, утилиты)
  _main.sass
  components/         — по одному файлу на секцию/компонент
    _all.sass         — реэкспорт
  helpers/
    _all.sass
    _variables.sass   — CSS-переменные + sass-переменные
    _typography.sass  — @font-face + ничего больше
    _reset.sass
  generated/          — спрайты, автогенерация
  lib/                — сторонние стили (swiper, slick)
```

- [ ] `partials/` → `components/` (схема B → A), поправить `@import` в `app.sass`
- [ ] `_fonts.sass` / `_functions.sass` → `_typography.sass` везде
- [ ] Разобраться, что такое `tpl/` в схеме C, и убрать или узаконить
- [ ] Задокументировать итоговую схему в `CLAUDE.md`

---

## 2.5. Чистка мёртвых sass-файлов

В `jsn` удалено 12 неиспользуемых компонентов (было 52 → стало 40). Сборка проверена:
битых импортов нет, `app.css` компилируется.

**Как определяли «мёртвый».** Классы каждого файла искали по `class="..."` в трёх местах:
живые шаблоны конференции, shared-партиалы и бандл `@focus-reactive/react-app-layer`.
Затем — по архивным сборкам `src/conferences/jsn/20*/`, которые показывают, что реально
рендерилось в каждом году.

Две ловушки, из-за которых наивный grep ошибается:

1. **React-секции.** `_video-widget.sass` не встречается в архивном HTML вообще, но секцию
   монтирует React через `{{eventsLayer.mountPoint('video-widget-mount')}}` — в статике её
   и не может быть. Такие файлы удалять нельзя, проверять надо и `node_modules/@focus-reactive/react-app-layer/dist/`.
2. **Страницы без CMS-данных.** Шаблон в репозитории есть, но страница молча пропускается
   при сборке, потому что в Hygraph нет данных под её `pageKey`. Из 13 шаблонов `jsn`
   сейчас собираются только `index`, `checkout`, `faq`. Класс в таком шаблоне живой —
   просто страница пока не публикуется.

**Осталось в серой зоне** — файлы привязаны к страницам, которые не собираются с 2024–2025
(`extended`, `teams`, `attendee`). Формально живые: заполнят CMS — понадобятся.

- [ ] Решить с командой судьбу страниц `extended` (последний рендер 2024) и `teams` (2024).
      Если они больше не планируются — удалить и шаблоны, и стили:
      `_text-content.sass`, `_dates-map.sass`, `_for-boss.sass`, `_teams.sass`
- [ ] `_sponsors-offers.sass` — используется на `attendee.html`, последний рендер 2023,
      но класс есть и в react-слое. Проверить отдельно
- [ ] Прогнать ту же проверку по остальным 28 конференциям — там наверняка та же картина

---

## 3. Перевести все конференции на цикл по секциям

**Эталон:** [jsn/templates/index.html:23](../src/conferences/jsn/templates/index.html#L23)

```njk
{% for section in pages[pageKey].sections %}
  {% if section.key == 'Hero' %}
    {% set heroData = section %}
    {% include "parts/_hero.html" %}
  {% endif %}
  ...
{% endfor %}
```

Порядок секций и их наличие задаёт CMS, а не хардкод в шаблоне.

**Текущее состояние:** цикл используют только `jsn` (3 страницы) и `rsasia` (1 страница).
Остальные — старый паттерн `{% if pages[pageKey].pageSections.X %}`, где порядок захардкожен.

- [ ] В `jsn` доделать: в `index.html` после цикла остались legacy-условия
      (`forBoss`, `performances`, `twitts`, `popVideos`, `companyTicket`, `discountForm`) —
      перенести их в цикл, когда появятся Section-записи в Hygraph
- [ ] Раскатать цикл на остальные страницы `rsasia`
- [ ] Дальше по одной конференции, начиная с самых свежих событий
- [ ] Связано: [navItem section anchors](#) — 12 из 22 section id не совпадают с ключами,
      нужна таблица key→id (см. память проекта)

---

## 3.5. Per-conference JS: `main.js` с импортами

Общие js-компоненты лежат в `src/components/` (там же, откуда импортирует общий `src/app.js`).
Конференция подключает нужные ей через свой `js/main.js` — по одному `import` на компонент,
по аналогии с тем, как `app.sass` делает `@import ../../../partials/sass/_prices`.

```js
// src/conferences/jsn/js/main.js
import '../../../components/typewriter';
```

```html
<!-- templates/layouts/_layout.html -->
<script defer type="text/javascript" src="js/main.js"></script>
```

**Как это собирается.** В [webpack.config.js](../webpack.config.js) есть функция `confEntry()`:
она добавляет второй entry `main`, но **только если** `src/conferences/$CONF_CODE/js/main.js`
существует. Конференции без этого файла собираются как раньше, одним `app.js`.

Важная деталь: [jsConf](../gulp/tasks/jsConf.js) копирует `js/*.js` в билд как есть,
поэтому `main.js` из неё **исключён** (`'!' + config.src.jsConf + '/main.js'`) — иначе
сырой файл с `import` перезаписал бы собранный бандл.

Проверено на `jsn`: `main.js` — 5.9 KiB против 3 MB у `app.js`, typewriter внутри `main.js`
и отсутствует в `app.js`; `rs` (без `main.js`) собирается без ошибок.

**Чтобы добавить общий скрипт:** положить файл в `src/components/`, дописать одну строку
`import` в `js/main.js` нужной конференции. Ни симлинков, ни правок конфига.

**Сделано:**

- `src/components/typewriter.js` — hero typewriter без GSAP, на `requestAnimationFrame`.
  Сам себя выключает, если на странице нет `[data-update-title]`.
- `src/components/heroVideo.js` — ленивая вставка фонового видео в hero.

Оба подключены в `jsn` через `js/main.js`.

### `heroVideo.js`

Заменил инлайновый `<script>` из `_layout.html`. Что изменилось против прежней версии:

- `prefers-reduced-motion` проверяется **до** вставки. Раньше CSS-правило
  ([_hero.sass](../src/conferences/jsn/sass/components/_hero.sass) `@media (prefers-reduced-motion)`)
  прятало видео, но файл всё равно скачивался — 3.4 MB впустую
- `requestIdleCallback` вместо `window.load`: последний ждёт все 12 сторонних скриптов
  (GTM ×4, Meta Pixel, Twitter, VWO, Convert, Gauges, Google Optimize), из-за чего видео
  стартовало на несколько секунд позже. `timeout: 3000` — страховка, фолбэк на `load`
  для Safari < 16.4
- убран бессмысленный `preload="auto"` (элемент создаётся ровно в момент показа)

Путь к файлу везде один — `video/hero.mp4`, поэтому он захардкожен в компоненте.

**Что осталось:**

- [ ] Подключить `heroVideo.js` к остальным конференциям с фоновым видео в hero: `c3` и `rdb`.
      У них та же логика **плюс** скрытие видео на мобильных (`max-width: 767px`) с удалением
      элемента по `resize` — при переносе это поведение нужно сохранить (например,
      через `data-video-min-width` на контейнере)
- [ ] У `c3` видео весит **18 MB**, у `jsnus` — 17 MB, у `nodeconf` — 11 MB. Проверить,
      нужны ли такие размеры, и заодно — не грузятся ли они на мобильных
- [ ] При включённом видео в hero **нет** `background-image`: в
      [_hero.html](../src/conferences/jsn/templates/parts/_hero.html) фон под условием
      `{% if not heroData.customData.backgroundVideo %}`, хотя `hero_video.jpg` лежит
      в `preload` и грузится. До старта видео фон пустой — решить, ставить ли постер
- [ ] `jsnus` — своя копия `animations.js` со старой GSAP-версией typewriter'а.
      Завести `js/main.js` с импортом и убрать 2 тега GSAP из `_layout.html`
      (сознательно отложено)
- [ ] `c3` — typewriter вплетён в 239 строк GSAP-анимаций (`ScrollTrigger`, `fadeUp`, `textEffect`)
      и работает иначе: печатает один раз, без цикла. Механически не переносится —
      нужно сначала разделить файл на «общий typewriter» и «c3-специфичные анимации»
- [ ] Остальные копии `animations.js` (`aics`×4, `rs`, `rsasia`) typewriter не содержат —
      это другие анимации. Проверить, есть ли там код, достойный переезда в `src/components/`

---

## 3.6. Инлайновые скрипты в `src/partials/js/`

`src/partials/js/` — это **HTML-партиалы с инлайновым `<script>`**, которые инклюдятся
через nunjucks (не путать с js-компонентами из `src/components/`). Их три:
`_filter-hero-buttons.html`, `_prefill-tito-widget.html`, `_sort-ticketsV2.html`.

Особенность: они подключены почти везде (`_filter-hero-buttons` — в 25 конференциях),
поэтому любая правка там задевает весь проект и требует проверки поведения до/после.

**Сделано:** отрефакторен `_filter-hero-buttons.html`. Попутно исправлены два бага:

1. В финальной фазе (неделя после конференции) скрывались классы `js-hero-btn-1/-2/-3`
   с дефисом, а разметка [_hero-buttonsV2.html](../src/partials/_hero-buttonsV2.html)
   генерирует `js-hero-btn1/2/3` — без. Кнопки не скрывались.
2. Фолбэк `new Date(ems) || new Date(conferenceStart)` не работал никогда:
   `new Date('мусор')` возвращает `Invalid Date`, а это truthy-объект. Заменено на
   проверку через `isNaN`.

Поведение сверено с прежней версией на 12 точках временной шкалы (−40d … +14d) —
совпадает везде, кроме исправленного бага.

**Что осталось:**

- [ ] `_prefill-tito-widget.html` и `_sort-ticketsV2.html` (9.8 KB) не смотрели —
      вероятно, там те же проблемы
- [ ] Подумать, не перенести ли эту логику в `src/components/` как обычные js-модули:
      сейчас код инлайнится в каждую страницу и не проходит ни ESLint, ни минификацию

---

## 3.7. Убрать инлайновую константу `confFinished` из всех конференций

**После мержа этого PR.**

Раньше дата окончания конференции передавалась в JS через глобальную переменную:
инлайновый `<script>` в `_layout.html` объявлял `const confFinished`, а компоненты
`popup-promo.js` и `noticePanel.js` читали её как глобал (ESLint на это ругался
`confFinished is not defined`).

**Сделано:** оба компонента теперь берут дату из `eventsBus`, как и все остальные:

```js
const { eventInfo } = eventsBus.content;
const confFinished = eventInfo.conferenceFinish || eventInfo.emsEvent.endDate;
```

Порядок приоритета сохранён из оригинала — он важен: у `jsn` поле `conferenceFinish`
приходит `null` и дата есть только в `emsEvent.endDate`, а у `c3` значения расходятся на сутки.

Инлайновый скрипт удалён из `_layout.html` **только у `jsn`**.

**Что осталось:**

- [ ] Удалить `<script>const confFinished = ...</script>` из `templates/layouts/_layout.html`
      у остальных 23 конференций:
      `aics`, `aics-asia`, `aics-berlin`, `aics-nyc`, `c3`, `doconf`, `gqconf`, `jsnus`,
      `mlconf`, `nodeconf`, `qaconf`, `radv`, `radv-canada`, `rdb`, `rs`, `rsasia`, `rsus`,
      `tljs`, `tljs-amsterdam`, `tsc`, `vjsl`, `wes`, `wgds`

      Сейчас он там просто не используется — компоненты его игнорируют, конфликта нет
      (`const` внутри ES-модуля локальный). Так что это чистка, а не срочный фикс.
- [ ] Архивные сборки (`src/conferences/*/2024/`, `2025/` и т.д.) трогать **не нужно** —
      это готовый HTML прошлых лет

---

## 4. Добавить LLM

Пункт пока без деталей — нужно уточнить объём и что именно имеется в виду
(LLM-помощник на сайте? генерация контента? что-то в билд-пайплайне?).

- [ ] Сформулировать требования

---

## 5. Убрать лишние подключения GSAP и jQuery

### GSAP

Подключён в 5 конференциях, версии и наборы плагинов разъезжаются:

| Конференция | Версия / CDN | Плагины |
|-------------|--------------|---------|
| `c3` | 3.12.2 cdnjs | `ScrollTrigger`, `TextPlugin` |
| `jsn` | 3.12.2 cdnjs | `TextPlugin` |
| `jsnus` | 3.12.2 cdnjs | `TextPlugin` |
| `rs` | 3.13.0 jsdelivr | `ScrollTrigger`, `SplitText` |
| `rsasia` | 3.13.0 jsdelivr | `ScrollTrigger`, `SplitText` |

- [ ] Проверить в каждой, вызывается ли `gsap` из JS — если нет, снять подключение
- [ ] Где нужен: свести к одной версии и одному CDN
- [ ] Грузить только реально используемые плагины

### jQuery

- [ ] `dummy/templates/layouts/_layout.html:54` — jQuery **1.9.1** (2013 г.), проверить и снять
- [ ] `rdb/templates/layouts/_layout.html:117` — то же самое

> Примечание: `rs` и `rsasia` попадают в grep по слову `jquery`, но это внутренности
> инлайн-скрипта VWO (`use_existing_jquery`), а не подключение библиотеки. Трогать не нужно.

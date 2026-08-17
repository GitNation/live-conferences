# Приведение конференций к единому стандарту

Цели рефакторинга: убрать дублирование, свести варианты секций к одному и почистить мёртвый код.
Эталон структуры — **jsn**.

Считается только по живым конференциям: `dummy`, `jsnl`, `jsny`, `remix`, `rsre` исключены
(их нет в `build-all-brands`), архивные папки с годами тоже.

## Шаблоны

| # | Цель | Состояние |
|---|---|---|
| 1 | Максимум перенести из `parts/` в общие `partials/` | 210 локальных файлов против 100 общих. `doconf`, `gqconf`, `qaconf`, `wgds` живут вообще без `parts/` — значит цель достижима. Лидеры дублей: `_location.html` (8 конф), `_video-rooms.html` (5), `_industries.html` (5) |
| 2 | Свести варианты секций к одному (`_header`, `_headerV2`, `_headerV4` → один) | 3 версии хедера в `partials/` + 1 локальная. На V4 переведены `radv`, `radv-canada` |
| 3 | Все миксины шаблонов в общем `_mixins.html`, без собственных | 5 конференций держат свой `parts/_mixins.html` |

**Исключение:** `_hero.html` и `_event.html` остаются локальными всегда — это лицо конференции.

## JS

| # | Цель | Состояние |
|---|---|---|
| 4 | Скрипт отложенной вставки hero-видео вынести в общий партиал и подключить всем конференциям | Скрипт дублируется в 5 конференциях: `jsn/templates/layouts/_layout.html:80`, `jsnus-aijs:80`, `rsasia:102` — одинаковые; `rdb:85` и `c3:97` дополнительно снимают видео под 767px через флаг `videoVisble`. Остальные 14 живых конференций держат `<video preload="auto" autoplay>` прямо в разметке `parts/_hero.html` и грузят файл до LCP |
| 5 | Единое имя файла hero-видео — `video/hero.mp4` | Не совпадает у 3 конференций: `aics-nyc` и `aics-berlin` — `hero-video.mp4`, `vjsl` — `event.mp4` |

Целевой вариант для пункта 4 — версия с `videoVisble` из `rdb`/`c3`: на мобильных видео вообще
не вставляется. Разметка со стороны конференции — `<div class="hero__video js-hero-video"></div>`
плюс обёртка `&__video` в sass (эталон — `jsn/sass/components/_hero.sass`).

Файлы весят от 2.4M (`rdb`) до 18M (`c3`), у `jsnus` hero-видео на 17M грузится eager — при
выносе скрипта стоит сразу пройтись по весам.

## Sass

| # | Цель | Состояние |
|---|---|---|
| 6 | Sass-миксины вынести в `partials/` и импортировать в каждую живую конференцию | — |
| 7 | Почистить мёртвые sass-файлы | — |
| 8 | Привести структуру папок к виду jsn | Эталон: `_common.sass`, `_main.sass`, `app.sass`, `components/`, `generated/`, `helpers/`, `lib/` |
| 9 | Убрать типографические миксины `+regular` `+bold` `+light` `+medium` `+black` → обычный css | **792 вхождения.** Больше всего `+bold` (335), `+medium` (200), `+regular` (125), `+black` (107), `+light` (25) |
| 10 | Единый класс `.rich-text` для стилей рич-текста | Сейчас у 2 конференций это `seo-text`, класса `rich-text` нет ни у кого — вводим новый |
| 11 | Везде стили для `.icon`; генерация иконок без файла `_sprite-svg` | 24 конференции имеют `sass/generated/_sprite-svg.scss` |
| 12 | Единый `.container` и `.section` | `.container` с 1360px уже у 11 конференций. Остальные: 1680px (4), 1560px (3), 1600px, 1424px, 1260px, 1220px, 1120px |
| 13 | Убрать sass-переменные (`$themeColor`, `$white`, `$mainBg`…) в пользу css-переменных `:root` | **~4200 вхождений.** Больше всего `$white` (1256), `$themeColor` (1214), `$black` (725), `$themeColor2` (383) |

### Эталонный `.container`

```sass
.container
	--container: 40px
	width: 100%
	max-width: 1360px
	padding-inline: var(--container)
	margin: 0 auto
	+md
		--container: 20px
```

Конференции с шириной 19xx под Full HD можно не трогать — **спросить перед изменением**.

### Эталонная `.section`

```sass
.section
	--section-y: 100px
	padding-block: var(--section-y)
	+md
		--section-y: 80px
	+sm
		--section-y: 64px
```

### Переменные на выброс

```sass
$mainBg $mainBg2 $themeColor $themeColor2 $themeColorD
$white $grayD $gray $grayL $black
$posTop $scheduleColorGray $scheduleColorGrayL $scheduleOutline
$switchColor $switchHandler
```

### Типографика на выброс

```sass
=light =regular =medium =bold =black
```

## С чего начинать

Пункты 9 и 13 самые массовые (792 и ~4200 вхождений) — они механические, но затрагивают все
конференции сразу, поэтому делать их лучше по одной конференции с проверкой сборкой.

Пункты 4 и 5 самые дешёвые: скрипт уже написан и обкатан, остаётся вынести его в партиал
и переименовать три файла.

Пункты 1–3 требуют глазами сравнивать содержимое — для них есть агент `conf-cleanup`,
он собирает отчёт по конференции без изменений.

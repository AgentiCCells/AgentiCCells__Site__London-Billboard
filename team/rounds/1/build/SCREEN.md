# The screen: build notes and API (round 1)

By developer.london-billboard@AgentiCCells.dinis (screen part), 2026-11-18. For the designer (who reuses `screen.js` with themes in `src/d/`), the writer and the conductor. The idea is Dinis Cruz's white paper; everything here is a simulation.

## Files

| File | What it does |
|---|---|
| `src/index.html` | The home page: `.stage` with `#billboard-screen`, `.panel` with `#billboard-control`, an explanation, noscript text. `?kiosk=1` shows only the screen, full window; `?theme=<name>` picks a theme class. |
| `src/assets/screen.css` | The screen (1080 x 1920), its tags and their shapes, the controls, the decision line, the panel and kiosk mode (with the band). Theme custom properties are on `.screen`. |
| `src/assets/js/data.js` | Reads data.promptugal.news (`getJSON`, `getCard`, `getPlace`, `getHere`, `getAircraft`, `getEvents`), staleness, IPMA weather words and skies, `simulatedLondon`, and `decide` (run, switch or pause). Adapted from the Algarve-Holiday-Homes cell's `data.js` (credit in its header). |
| `src/assets/js/sun.js` | NOAA sunrise, sunset and sun height for any place and date, in UTC; `daylightLeft`, `isDark`. |
| `src/assets/js/scene.js` | `drawScene(opts)`: the SVG Algarve drawing (marina, cliffs, river or beach) at the place's real local time and live weather; `findCamera()`: the camera hook (returns "none", no network call). |
| `src/assets/js/screen.js` | `buildState(params)`, `mountScreen(el, state, opts)`, `journey()`, `planUrl()`. |
| `src/assets/js/control.js` | The panel, the address and localStorage state, the provenance list, and the home page start-up (`boot()`). |
| `src/assets/js/qrcode.js` | qrcode-generator 1.4.4 (MIT, Kazuhiko Arase), from npm, as an ES module. Its licence header is kept. |
| `src/plan/index.html`, `src/assets/js/plan.js` | The scripted planning assistant behind the QR code. |
| `tests/data.test.mjs`, `tests/sun.test.mjs`, `tests/screen.test.mjs`, `tests/fixtures/` | Unit tests with hand-written fixtures (made-up values in the live files' shapes) and a stubbed fetch. |

## The screen API (frozen for round 1)

Revised after the design review (V1 to V7) and the revised proposal (sections 1.1, 1.7 and 5), 2026-11-18, about 19:00 to 20:00 UTC.

```js
import { buildState, mountScreen } from '/assets/js/screen.js';

const state = await buildState({ from: 'london', station: 'victoria', weather: 'rain', temp: 9, hour: null, to: 'faro' });
const screen = mountScreen(document.getElementById('my-screen'), state, { theme: 'poster' });
```

`buildState(params, { now, example })` never rejects. Params (all optional, bad values fall back to the defaults):

| Param | Values | Default |
|---|---|---|
| `from` | `london`, `porto`, `braga`, `lisboa` | `london` |
| `station` | `oxford-circus`, `victoria`, `waterloo`, `canary-wharf` (London only) | `oxford-circus` |
| `weather` | `rain`, `drizzle`, `grey`, `cold-clear`, `mild-sunny` (London only, simulated) | `rain` |
| `temp` | -15 to 40 (London only, simulated) | the weather's own |
| `hour` | 0 to 23, or null for the live clock (London only, simulated) | null |
| `to` | `faro`, `albufeira`, `tavira`, `quarteira` (shown "Vilamoura (Quarteira)"), `portimao`, `lagos` | `faro` |

`example: true` builds the **example state**: fixed, made-up values in the live files' shapes (Algarve 21 °C, sunny intervals, 10% rain, sea 19.5 °C, UV 3, 4 aircraft; a Portuguese city 13 °C with rain), with no network read, at `EXAMPLE_NOW` (2026-11-18T15:30:00Z) unless `now` is given. In it every value that would be "live" is tagged `example` (never `live`), read times print "example", the local time says "(example)", the decision line starts "Example values, not a reading." and its verdict reads "Would run (example).", the ribbon says "with example values", and the small print's first line is "Example values for this preview, not a reading." `simulated`, `invented example` and `computed` stay as they are. The home page shows it with `?example=1`; the panel then says no value was read.

The state holds `params`, `now` (the simulated London hour if set), `realNow`, `simulatedClock`, `example`, `here` (London simulated, or the Portuguese city's live values), `place` (the Algarve place's live values, or null with `placeRes.error`), `aircraft`, `daylight` (sunrise and sunset here and in the Algarve, daylight left), `decision` (`mode`: `run`, `switch` or `pause`, with `line`, `headline`, and `dry` in switch mode), `journey`, `plan` (the QR address) and `cards`. Every live value is `{ value, source, publisher, read_at, ... }`. UV for today comes from `ipma-uv/latest.json`, place 1080500 (Faro), today's date (`place.uv`, with `why_missing` when there is none).

`state.journey` (invented example): `legs[]`, each `{ what, min, start }` (start a Date; legs count back from the example departure, so `legs[0].start` is the time to leave by, also `leave`), `departs`, `arrive`, `there`, `day` (`today` or `tomorrow`), `sunset` (computed), `mode` (`sunset`, `wake`, `tomorrow`), `headline`, `route` (`flight` or `train`), `tz` (the here time zone, used for every leg time).

`mountScreen(el, state, opts)` options:

| Option | Default | What |
|---|---|---|
| `theme` | `'live'` | `live` or one of `poster`, `board`, `postcard`, `readout`, `dusk` (`THEMES`), or any other `[a-z0-9-]` name a page supplies CSS for. The page loads the theme's CSS itself. |
| `controls` | true | Previous, Pause/Play, Next and the phase label under the screen |
| `decision` | true | the run, switch or pause line under the screen (`aria-live="polite"`, the only thing announced) |
| `autoplay` | true unless reduced motion | |
| `phaseMs` | 10000 | |
| `phase` | 0 | 0, 1 or 2 |
| `maxWidth` | the parent element's width | px or a function |
| `maxHeight` | `fitWindow(ctx)` | px, or a function of `ctx` = `{ top, controls, decision, floor }` (heights measured at run time, with their gaps) |
| `minHeight` | 480 | the floor for `fitWindow` |
| `keys` | `'frame'` | `'frame'`: arrows and Space with focus in the frame; `'page'`: anywhere on the page (kiosk) |

`fitWindow(ctx, { belowTop = true })`: the screen height that fits the window left below the frame's top, less the controls, the decision line and a 16 px foot; under the floor (480) it uses the floor and lets the decision line fall below the fold, never the controls (a very short window shrinks the screen, to 240 px at least, to keep its controls in view). `belowTop: false` (phones, where the screen cannot be in the first view anyway) fits one whole window once scrolled to. The width bound wins when it is smaller. The decision line's height depends on the width, so `mountScreen` settles in up to three passes, and re-measures on resize and when the decision text changes.

It returns a controller: `go(i)`, `next()`, `prev()`, `play()`, `pause()`, `toggle()`, `update(state)`, `setTheme(name)` (returns false for a bad name), `destroy()`, and `phase`, `playing`, `root`, `el`.

Other exports: `THEMES`, `EXAMPLE_NOW`, `EXAMPLE_NOTE`, `MIN_HEIGHT`, `fitWindow`, `sunInfo(state, at)`, `journey`, `planUrl`, `normaliseParams`, `fmtDur`, `PHASES`, `PHASE_MS`, `DEFAULTS`, `SITE`.

## The home page layout as built (V1)

- Wide windows (over 900 px): `main` is a grid `auto minmax(18rem, 24rem)`, `justify-content: center`, one 2 rem gap: the stage column is exactly as wide as the frame, which is as wide as the screen and never under 20 rem; the full-width sections below use `contain: inline-size` so they cannot widen it. `control.js` passes `maxWidth` (main's width less the panel and the gap) and `maxHeight: fitWindow(ctx, { belowTop: true })`.
- Measured (Chromium, London, live data, 2026-11-18 about 18:45 UTC): 1366x900, stage top 144 px, screen 322 x 573, controls end at y 771, decision line at 884, the group 315 to 1052 (centred); 1366x768, screen 270 x 480 (floor), controls end at y 678, the decision line runs under the fold; 1920x1080, screen 445 x 791, all inside the window. The header's navigation now fits one line at 1366 px (`.nav ul` lost the 46 rem cap; `.bar` is 90 rem wide), which saves 26 px.
- 900 px and under: one column, panel under the screen; `fitWindow(ctx, { belowTop: false })`: at 390x844 the screen is 358 x 636 (width-bound, no 70% cap), its controls below it in the same window once scrolled to.
- Kiosk (`?kiosk=1`): black page, only the screen and the band, word for word, light grey (#D9D9D9) at 15 px. In a landscape window (aspect 5:4 or wider) the band sits in the empty column left of the screen, vertically centred; otherwise it is a strip above the screen, which takes the height left. Arrow keys and Space work anywhere on the page (`keys: 'page'`); the pointer hides after 3 seconds without movement. Under reduced motion phase 1 is held until Space.

Query options on the home page: `?kiosk=1`, `?theme=<name>`, `?example=1`, `?phase=1|2|3`, `?autoplay=0|1`, plus the params above.

## Keyboard, focus and motion (V2, D3)

- Previous, Pause and Next are buttons. With focus in the frame, Left and Right step; with focus on the screen, Space (or k) pauses and plays. In kiosk the keys work without focus.
- Focus ring: on the frame, outside the screen, `outline: 3px solid var(--sun); outline-offset: 4px` (`.screen-fit:has(.screen:focus-visible)`); kiosk uses #F2B35E. The old inset ring in the theme accent is gone, so no theme can lower it. Override with `--focus-ring` if a page must.
- Motion: the cloud drift, the rain and the fade between phases run only inside `@media (prefers-reduced-motion: no-preference)`; under reduced motion the screen starts paused and phases change with a cut. Autoplay phase changes are not announced; the phase label carries a text name for screen readers ("Phase 1 of 3: the Algarve now").

## Classes, data attributes and the theme hook (frozen)

```
.screen-frame                 the element you pass in (--screen-w: the screen's width in px)
  .screen-fit                 sized to the scaled screen
    .screen.theme-<name>      1080 x 1920
        data-theme="<name>" data-phase="now|compare|journey" data-mode="run|switch|pause"
        data-here="london|porto|braga|lisboa" data-place="<place id>" data-night="true|false" (the Algarve after sunset)
        data-sim-clock="HH:MM" (only when London's time is set) data-example="true" (only in the example state)
        style: --sun-frac-alg, --sun-frac-here (0 at sunrise, 1 at sunset, clamped), --sun-alt-alg (degrees, unitless)
        .is-paused-decision   when a real screen would pause
      .screen-scene > svg.scene   the drawing (.scene-sky, .scene-sun, .scene-clouds .scene-drift, .scene-sea, .scene-waves, .scene-ground, .scene-rain)
      .screen-layer
        .screen-ribbon.screen-ribbon-pause   only when a real screen would pause
        .screen-phase.phase-now
          .screen-head > h1.screen-headline (.screen-accent)
          .screen-now: .screen-place, .screen-time, .screen-temp (+ tag), .screen-meta (the observation line)
            dl.screen-facts > div.screen-fact[data-key=forecast|sea|uv|aircraft|sunset] > dt, dd (.fact-value, tag, .fact-src)
              (the forecast's .fact-value also has .screen-words)
        .screen-phase.phase-compare
          .screen-head > h1.screen-headline
          .screen-vs (.screen-side.side-here, .side-alg: .side-name, .side-temp, .side-words)
          table.screen-days (caption; tr.is-dry on the first dry Algarve day in switch mode, with .day-dry "drier"; .day-words)
          .screen-sunline (with tag-computed)
        .screen-phase.phase-journey
          .screen-head > h1.screen-headline
          .screen-itinerary (.itin-title with tag-inv, .itin-clock when the clock is set, .itin-depart,
                             ol > li > .leg-time .leg-what .leg-dur)
          .screen-cta (svg.screen-qr, .cta-text)
        .screen-dots
        footer.screen-smallprint, one line each, 26 px:
          p.sp-example (example state only), p.sp-sim, p.sp-alg, p.sp-here, p.sp-inv, p.sp-drawing
  .screen-controls (button[data-act=prev|toggle|next], .screen-phase-label)
  p.screen-decision[data-mode=run|switch|pause]
```

Tags, told apart by shape as well as colour: `.tag-live` "live" (filled, leading dot), `.tag-sim` "simulated" (solid outline), `.tag-inv` "invented example" (dashed outline), `.tag-computed` "computed" (square corners, double outline), `.tag-example` "example" (square corners, striped fill), `.tag-stale` "may be out of date" (filled yellow), `.tag-missing` "missing" (filled grey).

Custom properties on `.screen` (override them on `.theme-<name>`): `--screen-font`, `--screen-headline-font`, `--screen-ink`, `--screen-ink-soft`, `--screen-shadow`, `--screen-accent`, `--screen-panel`, `--screen-panel-ink`, `--screen-here`, `--screen-alg`, `--screen-head-bg` (default #0A1626 at 72%: the backing behind any headline over the scene; keep 72% or more), `--screen-veil` (the phase 2 and 3 darkening), `--screen-smallprint-bg` (default #000 at 72%), `--screen-smallprint-ink`, `--screen-ribbon-bg`, `--screen-ribbon-ink`; for each tag `--tag-<kind>-bg`, `--tag-<kind>-ink`, `--tag-<kind>-border`, and `--tag-live-dot`, `--tag-sim-border-style`, `--tag-inv-border-style`, `--tag-computed-border-style`, `--tag-computed-radius`, `--tag-example-radius`. Sizes inside the screen are in px on the 1080 canvas (never rem). Outside `.screen` (the panel) the tags fall back to the site tokens (`--sim`, `--inv`, `--accent`), so outlined tags stay readable in both site colour schemes.

The decision line's colours (V3): run, rule `--live` on a 9% tint; switch, `--warn-bar` on `--warn-bg`; pause, `--fail` on an 8% tint. Text is always `--ink`.

Please keep, in any theme: the small print and its tags on every phase, the "invented example" tag on the itinerary, "Scan to plan (a simulation)", the drawing note, a head backing of 72% or more, and no animation outside `prefers-reduced-motion: no-preference`.

## Data rules as built

- One read per URL per page load (`getJSON` cache); 8 s timeout; never rejects. Stale: older than twice the card's cadence (hourly sources: 2 hours; events-pt: 12 hours). Missing values stay null and the screen shows "--" with a "missing" tag and the reason.
- From the analyst's notes (`team/rounds/1/data/DATA.md`, relayed by the conductor): Porto uses Massarelos 1240903, then Pedras Rubras 1200545; Braga uses Braga (CIM) 6212124, then Guimarães 1210625; Lisbon uses Lisboa (Geofísico) 1200535, then Carnide 6215302 (Relógio left out). If none on the list reports, the nearest station that does is used and named. Algarve places whose own station sends no temperature fall back to Faro (Aeródromo) 1200554 from ipma-observations, shown as "nearest reporting station: Faro (Aeródromo), N km". Never a forecast in place of an observation.
- UV: the place file's `uv` is IPMA's last forecast day, so today's UV is read from `ipma-uv/latest.json`, place 1080500 (Faro), today's date.
- The forecast place is shown by name ("IPMA forecast for Loulé"), since it can be another town.
- Warnings are shown in the panel with their times as Portuguese local time and IPMA's own text (Faro's yellow rough-sea warning on 2026-11-18 is for the west coast).
- The aircraft count comes from the Faro now file (`airport.airline` length): "aircraft seen near Faro airport now (adsb.lol, ODbL)", tagged live, kept apart from the invented flights.

## The decision line

`decide(here, place, { daylight })`: a real screen would **run** when here is colder (3 degrees or more), wetter, or darker (sun already set here, or daylight ending 30 minutes or more earlier) than the Algarve place. When the Algarve is wet now too (rain observed this hour or today's IPMA weather type is rain), it says so and would **switch** message to the drier day ahead if one is forecast in the next three (the white paper: "the campaign can simply pause or switch messaging"), or **pause**. With no Algarve reading it pauses: it never shows a guess. On 2026-11-18 it rains in Faro, so the screen shows "Rain in Faro today too. Drier from Thu 19 Nov." and the switch line.

## Invented examples

Journeys are invented: London station to "a London airport" (Oxford Circus 60 min, Victoria 35, Waterloo 55, Canary Wharf 50), 90 min at the airport, a flight of about 2h45 to Faro, example departures at 07:00, 09:30, 12:00, 15:00 and 18:30; Porto by metro to the airport and Braga by coach to Porto airport, a flight of about 1h10; Lisbon by train, about 3 hours. Then Faro to the place. No airline, operator or airport company is named. Phase 3 says "You are N hours away from this sunset" when an example departure today arrives before the computed sunset, "You could wake up here tomorrow" when the last one today arrives after it, and "You could be here tomorrow" when none is left today.

## Verified

- 2026-11-18, about 18:15 UTC (first build): see the commit; 20 tests then.
- 2026-11-18, about 18:45 UTC (after V1 to V7): `node --test tests/*.test.mjs` 28 pass (new `tests/screen.test.mjs`: the example state reads nothing and is marked example, journey leg times, sun fractions, `fitWindow`, theme names). `node scripts/build.mjs` builds; `node scripts/validate.mjs` fails only on the 29 links to `/d/` (the designer's pages, not built yet); the leak scan prints OK. Playwright (Chromium) on a local server of `_site/`: 1366x900, 1366x768, 1920x1080, 390x844, 800x1000, `?kiosk=1` at 1366x768 and 800x1280, `?example=1`, reduced motion, dark scheme, Porto with Albufeira, and data.promptugal.news blocked; all three phases fit inside the 1080x1920 canvas; no horizontal scroll; no console errors except the browser's own failed-load lines for the blocked requests; under reduced motion no element animates and the screen starts paused; in kiosk the arrow keys and Space work without focus.

## Left for later

- Cameras: only when live.promptugal.news offers them (`findCamera()` in scene.js is the one place to change).
- A London weather source, if one is ever agreed: London stays simulated until then.
- The designer's themes in `src/d/`.

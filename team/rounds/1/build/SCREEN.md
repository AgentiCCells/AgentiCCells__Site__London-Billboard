# The screen: build notes and API (round 1)

By developer.london-billboard@AgentiCCells.dinis (screen part), 2026-11-18. For the designer (who reuses `screen.js` with themes in `src/d/`), the writer and the conductor. The idea is Dinis Cruz's white paper; everything here is a simulation.

## Files

| File | What it does |
|---|---|
| `src/index.html` | The home page: `.stage` with `#billboard-screen`, `.panel` with `#billboard-control`, an explanation, noscript text. `?kiosk=1` shows only the screen, full window; `?theme=<name>` picks a theme class. |
| `src/assets/screen.css` | The screen (1080 x 1920), its tags, the controls, the panel and kiosk mode. Theme custom properties are on `.screen`. |
| `src/assets/js/data.js` | Reads data.promptugal.news (`getJSON`, `getCard`, `getPlace`, `getHere`, `getAircraft`, `getEvents`), staleness, IPMA weather words and skies, `simulatedLondon`, and `decide` (run, switch or pause). Adapted from the Algarve-Holiday-Homes cell's `data.js` (credit in its header). |
| `src/assets/js/sun.js` | NOAA sunrise, sunset and sun height for any place and date, in UTC; `daylightLeft`, `isDark`. |
| `src/assets/js/scene.js` | `drawScene(opts)`: the SVG Algarve drawing (marina, cliffs, river or beach) at the place's real local time and live weather; `findCamera()`: the camera hook (returns "none", no network call). |
| `src/assets/js/screen.js` | `buildState(params)`, `mountScreen(el, state, opts)`, `journey()`, `planUrl()`. |
| `src/assets/js/control.js` | The panel, the address and localStorage state, the provenance list, and the home page start-up (`boot()`). |
| `src/assets/js/qrcode.js` | qrcode-generator 1.4.4 (MIT, Kazuhiko Arase), from npm, as an ES module. Its licence header is kept. |
| `src/plan/index.html`, `src/assets/js/plan.js` | The scripted planning assistant behind the QR code. |
| `tests/data.test.mjs`, `tests/sun.test.mjs`, `tests/fixtures/` | Unit tests with hand-written fixtures (made-up values in the live files' shapes) and a stubbed fetch. |

## The screen API

```js
import { buildState, mountScreen } from '/assets/js/screen.js';

const state = await buildState({ from: 'london', station: 'victoria', weather: 'rain', temp: 9, hour: null, to: 'faro' });
const screen = mountScreen(document.getElementById('my-screen'), state, { theme: 'harbour' });
```

`buildState(params, { now })` never rejects. Params (all optional, bad values fall back to the defaults):

| Param | Values | Default |
|---|---|---|
| `from` | `london`, `porto`, `braga`, `lisboa` | `london` |
| `station` | `oxford-circus`, `victoria`, `waterloo`, `canary-wharf` (London only) | `oxford-circus` |
| `weather` | `rain`, `drizzle`, `grey`, `cold-clear`, `mild-sunny` (London only, simulated) | `rain` |
| `temp` | -15 to 40 (London only, simulated) | the weather's own |
| `hour` | 0 to 23, or null for the live clock (London only, simulated) | null |
| `to` | `faro`, `albufeira`, `tavira`, `quarteira` (shown "Vilamoura (Quarteira)"), `portimao`, `lagos` | `faro` |

The state holds `params`, `now` (the simulated London hour if set), `realNow`, `here` (London simulated, or the Portuguese city's live values), `place` (the Algarve place's live values, or null with `placeRes.error`), `aircraft`, `daylight`, `decision` (`mode`: `run`, `switch` or `pause`, with `line` and `headline`), `journey` (invented example), `plan` (the QR address) and `cards`. Every live value is `{ value, source, publisher, read_at, ... }`.

`mountScreen(el, state, opts)` options: `theme` (`'live'`), `controls` (true: Previous, Pause/Play, Next under the screen), `decision` (true: the run, switch or pause line under the screen), `autoplay` (true unless the visitor prefers reduced motion), `phaseMs` (10000), `maxHeight` (px or a function; default 85% of the window), `phase` (0, 1 or 2).

It returns a controller: `go(i)`, `next()`, `prev()`, `play()`, `pause()`, `toggle()`, `update(state)`, `setTheme(name)`, `destroy()`, and `phase`, `playing`, `root`, `el`.

Keyboard: with focus in the frame, Left and Right arrows change phase; with focus on the screen, Space (or k) pauses and plays. Under reduced motion the screen starts paused and the scene's rain and cloud do not move.

## Classes and the theme hook

```
.screen-frame                 the element you pass in
  .screen-fit                 sized to the scaled screen
    .screen.theme-<name>      1080 x 1920, data-phase="now|compare|journey", .is-paused-decision when a real screen would pause
      .screen-scene > svg.scene   the drawing (.scene-sky, .scene-sun, .scene-clouds .scene-drift, .scene-sea, .scene-waves, .scene-ground, .scene-rain)
      .screen-layer
        .screen-ribbon.screen-ribbon-pause   only when a real screen would pause
        .screen-phase.phase-now      .screen-headline, .screen-accent, .screen-now (.screen-place, .screen-time, .screen-temp, .screen-words, .screen-meta)
        .screen-phase.phase-compare  .screen-vs (.screen-side.side-here, .side-alg: .side-name, .side-temp, .side-words), table.screen-days, .screen-sunline
        .screen-phase.phase-journey  .screen-itinerary (.itin-title, .itin-depart, ol), .screen-cta (svg.screen-qr, .cta-text)
        .screen-dots
        footer.screen-smallprint     on every phase: "Simulation", sources and read times, live and simulated tags, the drawing note
  .screen-controls (button[data-act=prev|toggle|next], .screen-phase-label)
  p.screen-decision
```

Tags: `.tag.tag-live` "live", `.tag-sim` "simulated", `.tag-inv` "invented example", `.tag-stale` "may be out of date", `.tag-missing` "missing", `.tag-computed` "computed" (the sunset, worked out with NOAA's equations, no source).

Custom properties on `.screen` (override them on `.theme-<name>`): `--screen-font`, `--screen-headline-font`, `--screen-ink`, `--screen-ink-soft`, `--screen-shadow`, `--screen-accent`, `--screen-panel`, `--screen-panel-ink`, `--screen-here`, `--screen-alg`, `--screen-smallprint-bg`, `--screen-smallprint-ink`, `--screen-ribbon-bg`, `--screen-ribbon-ink`, and `--tag-{live,sim,inv,stale,missing,computed}-{bg,ink}`. Sizes inside the screen are in px on the 1080 canvas (never rem: the site's root size must not change the screen).

Please keep, in any theme: the small print and its tags on every phase, the "invented example" tag on the itinerary, "Scan to plan (a simulation)", and the drawing note.

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

## Verified (2026-11-18, about 18:15 UTC)

- `node --test tests/*.test.mjs`: 20 tests pass (note: `node --test tests/` with a directory argument fails on Node 22; use the glob).
- Playwright (Chromium) on a local server of `_site/` at 1366 and 390 px wide: no horizontal scroll, no console errors with live data; London, Porto, Braga, Lisbon and every Algarve place read live; control changes update the address and the screen; autoplay changes phase after 10 s; arrow keys and Space work; reduced motion starts paused; `?kiosk=1` fills the window with no controls; with data.promptugal.news blocked (route abort) the screen shows "No live Algarve reading just now.", missing tags and the pause line, and the panel says which files failed (the only console messages are the browser's own failed-load lines for the blocked requests).
- The planning assistant: every quick reply and free text answered, small print on every answer, no horizontal scroll at 390 px.

## Left for later

- Cameras: only when live.promptugal.news offers them (`findCamera()` in scene.js is the one place to change).
- A London weather source, if one is ever agreed: London stays simulated until then.
- The designer's themes in `src/d/`.

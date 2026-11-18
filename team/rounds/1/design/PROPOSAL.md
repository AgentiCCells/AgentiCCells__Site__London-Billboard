# Design proposal, round 1: the screen, the home page and five designs

**Status: proposal** by designer.london-billboard@AgentiCCells.dinis for conductor.london-billboard@AgentiCCells.dinis, 2026-11-18 (written 18:10 to 18:40 UTC). Not yet reviewed. Nothing in `src/` is built by this proposal.

**The idea is Dinis Cruz's** (his white paper "Dynamic Weather-Driven Algarve Tourism Campaign" and 12-slide deck). His words for this site, from `team/BRIEF.md`: 17:45 UTC, "Cool, and yes this is 100% simulated, I just want to use it as a nice demo of what we can do with these ACC sites (and the data that we have on the multiple *.pt.news sites)"; 18:00 UTC (relayed, queued 17:55 UTC), "This simulation of a billboard, which could be in London or other parts of Portugal too (since the weather is usually much better there) will be on one of our ACC.live sites. And will be 100% client side driven." The deck's images are generated; none is copied here. Every drawing in this folder is our own.

**Read for this proposal:** `CLAUDE.md`, `team/designer/ROLE.md` and `POLICY.md`, `team/BRIEF.md`, `team/rounds/1.md` (the contract and the labels), `team/rounds/1/data/DATA.md` and `FIGURES.md`, the white paper's text (phases 1 to 3), `src/index.html`, `src/assets/js/screen.js`, `scene.js`, `control.js`, `src/assets/screen.css` and `site.css` as they stood at 18:15 UTC (the developer is still writing them; `team/rounds/1/build/SCREEN.md` did not exist yet), and, as material only, the sibling cells' designs (IPMA data `src/d/`, Marc-Noah `src/d/`, the Algarve holiday homes billboard mock-ups).

**Mock-ups** (our own drawings, SVG, in `mockups/`; redraw with `node team/rounds/1/design/mockups/draw.mjs`):

| File | What it shows |
|---|---|
| `mockups/layout-wide.svg` | The home page at 1366 px: screen, controls, decision line, panel with the provenance list |
| `mockups/layout-phone.svg` | The home page at 390 px: the same, stacked |
| `mockups/layout-kiosk.svg` | `?kiosk=1` in a landscape window, with the band beside the screen |
| `mockups/screen-phases.svg` | The screen at 1080x1920: safe areas and type scale, phases 1 to 3, and today's "Algarve wet too" state |
| `mockups/design-poster.svg`, `design-board.svg`, `design-postcard.svg`, `design-readout.svg`, `design-dusk.svg` | Each of the five designs in its three phases |
| `mockups/chooser.svg` | The chooser at `/d/` |

Values in the mock-ups are examples of shape, not readings. The Faro temperature (20.6 °C, Faro (Aeródromo), 17:00 UTC) is the observation DATA.md section 8 read on 18 November; the "run" frames pair it with Faro's forecast words for 19 November (partly cloudy, 6% rain) so they show a dry day; the "wet too" frame shows 18 November as read (light rain, 100%). London's 9 °C rain is a simulated setting. Every journey time is an invented example. The real screen reads everything live.

---

## 1. The home page

### 1.1 Layout at 1366 px and wider (mock-up `layout-wide.svg`)

- **What.** Two columns under the band and the header, as `site.css` already sets for `main:has(>.stage)`: the stage (screen, then the screen controls, then the decision line) on the left, centred in its column; the panel ("Set the screen", then "Where each figure comes from") on the right, 20 to 24 rem wide, sticky, scrolling inside itself if taller than the window. "What you are looking at" runs full width below both.
- **The screen's size.** Scaled to fit: the smaller of the column's width / 1080 and 85% of the window's height / 1920 (what `mountScreen` does now). At 1366x768 that is about 650 px tall and 366 px wide (computed: 768 x 0.85 = 653).
- **Why.** The screen is the page. The settings sit beside it so a change (London to Lisbon, rain to sun) shows on the screen without scrolling.
- **Reads.** Nothing itself; the panel and screen read the data (section 2).
- **Cost.** None beyond what `site.css` and `screen.css` already do; the order change in 1.3 is a few lines in `screen.js`.

### 1.2 Layout at 390 px (mock-up `layout-phone.svg`)

- **What.** One column, in this order: band, header, screen (scaled to the width less a 16 px gutter each side and to at most 70% of the window's height, so at 390x844 about 330 px wide and 590 px tall), screen controls (three buttons of at least 44x44 px), decision line, panel, provenance list, "What you are looking at", footer. No horizontal scroll.
- **Why.** On a phone the screen's own small print is about 9 px when scaled (26 px x 0.31) and cannot be read; the provenance list under it carries the same facts at body size. The screen stays first because it is what the site shows.
- **Failure state.** If JavaScript is off, the `noscript` text already in `src/index.html` says what would be shown and links to data.promptugal.news.
- **Cost.** A media query in `site.css` (max-height rule for the screen at under 64 rem); `mountScreen` already accepts `maxHeight`.

### 1.3 The decision line

- **What.** Directly under the screen controls, as wide as the screen column (max 40 rem), a box with a 4 px left rule: first a bold verdict ("Would run.", "Would switch message.", "Would pause."), then the reason from `decide()` in plain words, for example: "A real screen would switch message now: it is raining in Faro today too, and London is colder (simulated). It would show the drier days ahead instead (Thu 19 Nov: partly cloudy, up to 21 °C, IPMA forecast)." It is `aria-live="polite"`, so a change of setting is announced once.
- **Colours** (site tokens): run, rule `--live` (#1D6B3A); switch, rule `--warn-bar` (#8A6D00) on `--warn-bg` (#FFF3C4); pause, rule `--fail` (#A1261A). Text is always `--ink` (#1C1F23) on a light tint: 14.6 to 1 or more (14.9 on #FFF3C4). The verdict word carries the meaning, not the colour.
- **Why.** The white paper says the campaign "can simply pause or switch messaging" when the Algarve is not better. Today it is raining in Faro too (DATA.md section 8), so the line is the most honest thing on the page and must be easy to find.
- **Reads.** `state.decision` (`mode`, `line`), built from the here and Algarve values.
- **Failure state.** No Algarve reading: "Would pause. No live Algarve reading could be read, and it never shows a guess." (already in `decide()`).
- **Cost.** Small: styling in `screen.css`; the verdict word is already in `screen.js`.

### 1.4 The provenance list

- **What.** In the panel under the settings, heading "Where each figure comes from": one line per figure on the screen, in screen order, each with value, source, publisher, place or station with distance, the observation hour, the time read, and the label: for example "Faro 20.6 °C: IPMA, Faro (Aeródromo) station, 4 km, observed 17:00 UTC, read 17:56 UTC, live". London lines: "set by you, simulated". Sunset times: "computed in your browser (NOAA equations)". Journey: "invented example". The terms paragraph follows (IPMA free use with no profit-making purpose, always named; adsb.lol ODbL 1.0; data.promptugal.news CC BY 4.0; "Not a warning service: follow IPMA").
- **Why.** It is the readable copy of the screen's small print, and the place a reader checks a figure.
- **Failure state.** A missing value: "no current value; last read hh:mm UTC" with the reason; a stale one: "may be out of date: read hh:mm UTC, older than twice its hourly collection". Never a guessed value.
- **Cost.** Exists in `control.js` (`provenanceHtml`); the line format above is a small change.

### 1.5 The kiosk view, `?kiosk=1` (mock-up `layout-kiosk.svg`)

- **What.** Black page, the screen as large as the window allows and centred, no header, no controls, no decision line, phases cycling. The band, word for word, stays: in a landscape window it sits in the empty column to the left of the screen (15 px, light grey #D9D9D9 on black, 14.9 to 1); in a portrait window it is a strip above the screen, which then scales to the height that is left. The mouse pointer hides after 3 seconds without movement. Leaving: the browser's address bar or Back; nothing traps the keyboard.
- **Why.** For showing the screen on a monitor or a projector. The contract puts the band on every page, and a kiosk is the view most likely to be photographed without its context, so it keeps the band.
- **Cost.** Small: `screen.css` already hides everything but the stage in kiosk; the band needs to be kept and placed (developer, `screen.css` and `control.js`).

### 1.6 Optional: a "Design" choice in the panel

A fourth fieldset, "Design", with a select of the default and the five designs. Choosing one sets `?theme=<id>` and loads `/d/<id>/theme.css`. Cheap once the designs exist; skip it if the panel is getting long, since `/d/` already shows them.

---

## 2. The screen at 1080x1920

All sizes are in screen pixels before scaling. Mock-up: `screen-phases.svg`.

### 2.1 How big things are, and from how far they can be read

- **Physical size (computed).** A portrait 86-inch panel is about 1.07 x 1.90 m, so 1 px is about 0.99 mm; a 75-inch panel is about 0.94 x 1.66 m, 0.86 mm a pixel. Below, 1 px = 1 mm.
- **Reading distance (rule of thumb, source unconfirmed).** Sign makers commonly use about 25 mm of letter height for each 3 m of comfortable reading distance (1 inch per 10 feet). Capital height in a system sans is about 0.7 of the font size (approximate). So a font size of 36 px gives 25 mm capitals, comfortable at about 3 m; 60 px at about 5 m.

| Role | Size | Capital height | Comfortable at about | Used for |
|---|---|---|---|---|
| Hero figure | 180 to 220 px | 125 to 155 mm | over 10 m | the Algarve temperature now (phase 1), "5 hours" (Dusk) |
| Side figure | 120 to 150 px | 85 to 105 mm | 10 m | here and Algarve temperatures (phase 2) |
| Headline | 88 to 104 px, never under 72 | 60 to 73 mm | 7 to 8 m | the phase headline |
| Place, side name, "Scan to plan" | 56 to 72 px | 40 to 50 mm | 5 to 6 m | |
| Body | 40 to 46 px | 28 to 32 mm | 3.4 to 3.9 m | forecast words, the sun line, the itinerary's first line |
| Secondary | 32 to 36 px | 22 to 25 mm | 2.7 to 3 m | itinerary legs, table cells |
| Tags | at least 40 px beside the hero figure, at least 30 px elsewhere | 21 to 28 mm | 2.5 to 3.4 m | live, simulated, invented example |
| Small print | 26 px, never under 24 | 18 mm | 2 m | the band at the foot of the screen |

A passer-by at 5 m reads the headline, the place and the figures; someone who walks up to scan the code (at most about 3.4 m, see 2.6) reads the tags and the small print. That is the order of the screen.

### 2.2 Safe areas

- 48 px on every side is the bezel and case margin: nothing important outside it (shelter cases and frames cover the edge).
- 64 px on every side is the text margin. Usable text width: 952 px. A 92 px bold system sans line holds about 17 characters, so a headline is written for two or three lines and wraps; the developer wraps, never shrinks below 72 px.
- Top 150 px: the ribbon (pause or switch, 2.7) when present; the headline moves down under it.
- Phase dots: centred at y = 1640, 22 px dots, the current one in `--screen-ink`.
- Bottom 240 px (y = 1680 to 1920): the small print band, always present, always opaque.

### 2.3 Contrast on a drawn scene

The scene changes with the time and the weather, so text over it is measured against its worst case, a white cloud or the midday sky (#BFE2F4).

- **Rule.** Any text over the scene sits on a panel or scrim of #0A1626 at 72% opacity or more. Measured against white beneath it: white text 7.3 to 1, the accent #FFD36B 5.1 to 1. At 65%, white is 5.5 to 1 but the accent falls to 3.9 to 1; at 60% white is 4.6 to 1.
- **Finding on the current build (18:15 UTC).** `.screen-headline` sits on the bare scene with only a text shadow. White on the midday sky is 1.4 to 1. The headline needs a scrim (a `.screen-head` wrapper with `--screen-head-bg`, see section 5) in the default theme.
- **The small print band** is opaque (default: #000 at 72%, which over white gives #474747; #F2F2F2 on it is 8.3 to 1; the current 62% gives 5.5 to 1 and passes, but 72% leaves room).
- **Tags** (default theme): live white on #1F7A3F 5.4 to 1; simulated white on #7A3FB0 6.6 to 1; invented example white on #A13D1A 6.6 to 1; may be out of date #3A2E00 on #FFD166 9.3 to 1; missing white on #555555 7.5 to 1. Ribbon #3A2E00 on #FBE7A1 10.9 to 1. QR code black on white 21 to 1 in every design.

### 2.4 Labels on the screen, and colour-blind readers

- Every figure has its tag next to it, in the same line or directly under: "live", "simulated", "invented example", "may be out of date", "missing". The word is always printed; colour is a second signal.
- The tags also differ by shape, so they can be told apart in greyscale: live is filled and starts with a dot; simulated is outlined; invented example is a dashed outline; may be out of date and missing are filled in yellow and grey. (Today `screen.js` draws all tags filled; outlined and dashed are a CSS change on `.tag-sim` and `.tag-inv`.)
- Here and the Algarve are told apart by position (here left, Algarve right, always) and by name, and by a blue-grey against amber or ochre pair, which stays distinct for the common red-green colour blindness.
- The drawn scene carries "Drawing, not a camera: live.promptugal.news offers no cameras yet (checked 2026-11-18)" in the small print on every phase, and Poster, Postcard and Readout also print "Drawing, not a camera" as a caption at the picture.

### 2.5 The small print band (every phase)

Five lines of 26 px on the opaque band (y = 1680 to 1920), in this order:

1. **Simulation.** No real screen or campaign.
2. Algarve: IPMA via data.promptugal.news, read hh:mm UTC `live` (or "no reading (reason)" `missing`, or `may be out of date`).
3. Here: for London, "London: weather set by you `simulated`" (and "and time" when the clock is set); for a Portuguese city, "Lisbon: IPMA, Lisboa (Geofísico) station, 5.5 km, read hh:mm UTC `live`". Then "Journeys, flights and times: `invented example`".
4. and 5. Drawing, not a camera: live.promptugal.news offers no cameras yet (checked 2026-11-18).

Per-figure details (station, distance, observation hour) also sit under the figure in the phase itself at secondary size, as in the mock-ups; the band is the summary that is always there.

### 2.6 Phase 1: "This is the Algarve right now" (about 10 seconds)

- **What.** The drawn scene fills the screen and follows the place's real local time and live weather (`scene.js`). Top: the headline on a scrim, "This is the Algarve / right now. / You could be here." (white, the last line in the accent). Lower third, on a panel: place name (64 px), local time (40 px, kept current), the temperature now (180 px, accent) with `live` (40 px), "IPMA today: partly cloudy, 6% chance of rain" (40 px), then at 32 px "Observed at Faro (Aeródromo), 4 km, 17:00 UTC. Sea up to 19.8 °C. 4 airliners near Faro (adsb.lol)".
- **White paper.** Phase 1, "This is Algarve right now. You could be here." The paper imagines a live camera; we draw instead, and say so.
- **Reads.** `by-place/now/<place>.json` (station reading, forecast day 0, sea), with the fallback station rule of DATA.md section 2 (for example Albufeira's silent station falls back to Faro (Aeródromo), and the line says "Faro airport station, 27 km away"); `adsb-faro` for the aircraft count (ODbL, live, kept apart from any invented flight).
- **Labels.** Temperature, forecast, sea, aircraft: live. Scene: drawing, not a camera.
- **Failure state.** No temperature from any station in the list: "--" with `missing`, and "no station reported this hour" in place of the station line; the scene draws a neutral sky. Stale file: the value stays, with `may be out of date` and the read time.

### 2.7 Phase 2: the comparison (about 10 seconds)

- **What.** Scene darkened (a #050C19 veil at 60%). Headline "London or Faro?". Two panels side by side, here left and Algarve right, each topped by a 14 px rule in its colour: name (46 px), tag on the line under it (32 px), temperature now (120 px), words (40 px). Then "Next three days" as a table: day, here (max and words), Algarve (max, words, rain chance), 36 px; the caption says "London simulated, Faro IPMA forecast" (or "Lisbon IPMA forecast"). Last, the sun line at 46 px: "Sunset in Faro at 17:21. Daylight in London ended at 16:08." with "computed in the browser (NOAA equations)" under it at 24 px.
- **White paper.** Phase 2, the weather comparison and "Sunset in Algarve at 5:30pm, daylight in London ended at 4pm". FIGURES.md `sunset-times`: 18 Nov, Faro 17:21, London 16:08 (computed): the paper's example holds, so the screen computes the day's times.
- **Reads.** Here: London simulated settings, or `ipma-city-forecasts` and `ipma-observations` for Porto, Braga, Lisbon (station named with its distance). Algarve: the place file's `forecast.days[]` (forecast place named when it is another town, for example "Albufeira: Loulé forecast, 21 km").
- **Labels.** London: simulated (every cell, via the caption and the side tag). Portuguese city and Algarve: live. Sunset: computed.
- **In "switch" mode** (2.9) the first dry day's row is marked: bold, a 6 px accent bar at its left, the word "drier" after the day.
- **Failure state.** A side with no reading shows "--", "no reading" and `missing`; a day with no forecast shows "--"; if neither side has a forecast, the table is replaced by "No forecast could be read."

### 2.8 Phase 3: "You are N hours away" (about 10 seconds)

- **What.** Scene darkened (55%). Headline on two lines: "You are 5 hours" (100 px) / "away from this sunset" (72 px, accent). Panel: "For example" with `invented example` (32 px dashed), the summary line ("Leave Oxford Circus at 09:00; flight at 11:00; in Faro by 14:40, sunset 17:21.") and the numbered legs at 34 px. Lower panel: QR code (340 px, black on white, 4-module quiet zone), "Scan to plan" (72 px) and "(a simulation)" (44 px), with "scripted answers, no live model" at 28 px.
- **After the last feasible departure** the headline changes to "You could wake up here tomorrow" and the example uses the first departure next morning (`journey()` already does this; Dusk's mock-up shows it).
- **White paper.** Phase 3, "You are 8 hours away from this sunset. Catch the 12:00 Gatwick-Faro flight ..." Our version names no airline and no airport timetable: FIGURES.md marks flight and door-to-door times unconfirmed, so every time is an invented example.
- **QR legibility (rule of thumb, source unconfirmed).** A code scans from about ten times its width: 340 mm gives about 3.4 m. The planning URL is about 85 characters (`/plan/?from=london&station=oxford-circus&to=faro`), which needs QR version 6 at level M (41 modules, 49 with the quiet zone), so each module is about 7 px, 7 mm. Shorter keys (`?f=london&s=oxford-circus&t=faro`) would bring it to version 4 and 9 mm modules; a small win, optional.
- **Reads.** Nothing live except the sunset (computed for the place and date). Legs and departures come from `journey()` in `screen.js`.
- **Labels.** Itinerary: invented example. Planning assistant: "simulation: scripted answers, no live model". Sunset: computed.
- **Failure state.** If the QR cannot be drawn, the URL is printed instead at 40 px ("QR code could not be drawn: ..."), as `screen.js` does.

### 2.9 Pause and switch: when the Algarve is wet too (it is today)

`decide()` returns one of three modes. The screen shows each so a reader sees what a real screen would do.

- **Run.** No ribbon; phases as above.
- **Switch** (here is worse, but the Algarve is wet today and a drier day is forecast). No ribbon. Phase 1's headline becomes the switch message, "Rain in Faro today too. / Drier from Thu 19 Nov." (84 px, the second line in the accent), and phase 2 marks the drier row. With London set to rain at 9 °C against today's Faro (light rain, 100%; tomorrow partly cloudy, 6%), this is the expected state on 18 November (DATA.md section 8).
- **Pause** (here is not worse, or no drier day ahead, or no Algarve reading). A ribbon across the top 150 px of every phase, in the ribbon colours (default #3A2E00 on #FBE7A1): "A real screen would pause now:" (38 px bold) and the reason, "rain in Faro today too. Shown for the demonstration." (32 px). The phases keep cycling, because this is a demonstration, but nothing on the screen pretends to be running. With Lisbon chosen today (both wet, Lisbon not worse) this is the expected state.
- The mock-up's fifth frame ("Today: Algarve wet too") combines the ribbon and the switch headline to show both pieces; on the real screen only one applies at a time.
- **Why.** The white paper: "on the rare occasion London is better, the campaign can simply pause or switch messaging". Showing it is more honest than drawing sun over a rainy Faro.

---

## 3. Five designs for `/d/`

Five visual directions of the same screen and the same data. Each keeps every figure, every tag, the small print band, the drawing note, the ribbon and the QR code; only placement, type and colour change. System fonts only; nothing is loaded from another host. No design imitates a transit operator's signage (no roundel, no operator typeface or colours), an airline, an airport's display, IPMA, a tourism body or an advertiser.

All ratios are WCAG contrast ratios for text on its background, computed with the WCAG 2 relative luminance formula (designer's script, 2026-11-18; the panel ratios over the scene are computed against white beneath, the worst case). The minimum asked is 4.5 to 1; the lowest pair below is 5.8 to 1.

### 3.1 Poster (`poster`): a calm printed poster

**Idea.** The drawing as a printed plate in the upper half, with a caption; serif headlines and figures on warm paper below; ruled tables like a printed timetable. Mock-up: `mockups/design-poster.svg`.

| Use | Colour | On | Ratio |
|---|---|---|---|
| Ink | #1B1B1B | paper #F4EFE6 | 15.0 |
| Soft ink (secondary, captions) | #4D4A45 | paper | 7.7 |
| Algarve (figures, Algarve column) | #8F4200 | paper | 6.2 |
| Here (London column) | #3F5566 | paper | 6.8 |
| Accent (links in the band, rules) | #0E5A6B | paper | 6.8 |
| Small print | #1B1B1B | #E6DFD2 | 13.0 |
| Ribbon | #F4EFE6 | #1B1B1B | 15.0 |
| Tag live | #FFFFFF | #1D6B3A | 6.5 |
| Tag simulated (outlined) | #6A3596 | paper | 7.2 |
| Tag invented example (dashed) | #8A3410 | paper | 7.1 |

**Type.** Headlines and figures: `Charter, "Iowan Old Style", "Palatino Linotype", Georgia, serif`. Text: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. A kicker line "THE ALGARVE, RIGHT NOW" at 30 px, spaced capitals, over a 3 px rule.

**Phases.** 1: scene in a 952x760 box at y = 170, "Drawing, not a camera" in italics under it, then "This is Faro / right now." (96 px serif) and the temperature at 210 px in the Algarve colour with `live`. 2: two columns divided by a hairline, each name in its colour, the three days as a ruled table, the sun line in serif at 54 px. 3: the example as a timetable, times in the left margin at 52 px ("09:00 Leave Oxford Circus"), the QR at the foot with "Scan to plan" in serif and "(a simulation)" in italics.

**Night and rain.** Only the plate changes (the scene draws night or rain); the paper stays.

### 3.2 Departure board (`board`): bold rows, amber on near-black

**Idea.** The screen read like a station board: a short scene band at the top, a full-width amber title bar, then rows of monospace figures. Generic, not modelled on any operator's or airport's board. Mock-up: `mockups/design-board.svg`.

| Use | Colour | On | Ratio |
|---|---|---|---|
| Ink | #F2F2EE | background #0D0F12 | 17.1 |
| Ink | #F2F2EE | row #1A1E24 | 14.9 |
| Amber (Algarve, title bar, figures) | #FFB547 | row #1A1E24 | 9.5 |
| Title bar text | #0D0F12 | #FFB547 | 10.9 |
| Here (London) | #8FB4D9 | row | 7.7 |
| Soft ink | #A9B0B8 | row | 7.6 |
| Tag live | #0D0F12 | #7FD39A | 10.7 |
| Tag simulated (outlined) | #C9A8F5 | row | 8.3 |
| Tag invented example (dashed) | #FFA36B | row | 8.5 |
| Tag may be out of date | #0D0F12 | #FFD166 | 13.3 |

**Type.** Titles: system sans, weight 900, capitals, letter spacing 0.06 em. Figures and rows: `ui-monospace, "SF Mono", Menlo, Consolas, monospace` with tabular figures, so columns line up.

**Phases.** 1: scene in the top 720 px; bar "ALGARVE NOW"; "FARO" with `live`, the temperature at 200 px in amber; rows TODAY / SEA / LOCAL TIME; the source line under them. 2: scene shrinks to 360 px; bar "HERE OR THERE"; a four-row table NOW, THU, FRI, SAT with London (simulated) and Faro (live) columns; then rows SUNSET FARO 17:21 and DAYLIGHT LONDON 16:08. The weather words go in a second line of each row on the real screen, so no figure loses its meaning. 3: bar "NEXT WAY SOUTH"; "5 HOURS TO / THIS SUNSET"; `invented example`; the itinerary as rows (time, step, duration); QR with "SCAN TO PLAN" and "(a simulation)" in sentence case so the label reads as a label.

### 3.3 Postcard (`postcard`): the picture side, then the written back

**Idea.** Phase 1 is the picture side of a postcard (the scene inside a cream border, a "stamp" corner holding the live temperature); phases 2 and 3 are the back, a written message on the left and the "address" lines on the right. Mock-up: `mockups/design-postcard.svg`.

| Use | Colour | On | Ratio |
|---|---|---|---|
| Ink | #2A1F17 | cream #FBF4E6 | 14.7 |
| Terracotta (Algarve, stamp, accent) | #A3402A | cream | 5.8 |
| Sea blue (here) | #1E5C78 | cream | 6.7 |
| Soft ink | #5E5048 | cream | 7.1 |
| Stamp text | #2A1F17 | #FFFFFF | 16.1 |
| Ribbon | #2A1F17 | #F6D77A | 11.4 |
| Tag live | #FFFFFF | #1D6B3A | 6.5 |
| Tag simulated (outlined) | #6A3596 | cream | 7.5 |
| Tag invented example (dashed) | #7A3410 | cream | 8.3 |

**Type.** Message and headlines: `Charter, "Iowan Old Style", "Palatino Linotype", Georgia, serif`, italic. Figures in the stamp: the same serif, bold. Labels and small print: system sans. No handwriting font: none is common to all systems, and a web font is not allowed.

**Phases.** 1: scene full bleed inside the card; the stamp (300x340 px, dashed terracotta edge) top right with "Faro", "20.6°" and `live`; "Faro, right now." at 92 px under the picture, then the forecast words and "Drawing, not a camera." 2: "Dear London," then "Here: 9.0 °C, rain" `simulated`, "Faro: 20.6 °C, partly cloudy" `live`, "Sunset here 17:21. Yours ended 16:08." (computed); on the right, a "3 days" stamp and the three days as address lines. 3: "You are / 5 hours away / from this sunset." with `invented example` and the example written as the message; the QR takes the stamp's place with "Scan to plan" and "(a simulation)".

**Note.** The stamp is a drawn box with a dashed edge, not a postage stamp of any country.

### 3.4 Readout (`readout`): data first

**Idea.** The scene shrinks to a 540 px band; the rest is tiles, one per figure, each with its source line inside the tile. Phase 2 draws the three days as a bar chart; phase 3 draws the journey as a timeline from now to the sunset. For the reader who wants to see where every number comes from. Mock-up: `mockups/design-readout.svg`.

| Use | Colour | On | Ratio |
|---|---|---|---|
| Ink | #E9EFF3 | background #0E1A22 | 15.2 |
| Ink | #E9EFF3 | tile #15252F | 13.5 |
| Soft ink (labels, sources) | #A7B6C0 | tile | 7.6 |
| Algarve | #FFC872 | tile | 10.3 |
| Here | #A9B8C6 | tile | 7.7 |
| Cyan (sun, accent) | #6CC4E8 | tile | 8.0 |
| Ribbon | #0E1A22 | #FFC872 | 11.6 |
| Tag live | #0E1A22 | #7FD39A | 9.8 |
| Tag simulated (outlined) | #C9A8F5 | tile | 7.8 |
| Tag invented example (dashed) | #FFA36B | tile | 8.0 |

**Type.** Labels: system sans, bold capitals at 32 px. Figures: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`, tabular. Source lines: 24 px minimum inside a tile (this is the one design where per-figure sources go down to 24 px; the band stays at 26).

**Phases.** 1: tiles FARO, AIR NOW (wide, 20.6 °C, `live`, "IPMA, Faro (Aeródromo) 4 km, obs. 17:00 UTC, read 17:56"); TODAY (rain chance); SEA; AIRCRAFT (near Faro, adsb.lol, ODbL); SUNSET (computed). UV can take a sixth tile (from `ipma-uv`, today's date, not the place file's date: DATA.md quirk 3). 2: the two temperatures at 140 px with tags, a bar chart of the next three days' maxima (here blue-grey, Algarve amber, values printed on each bar, so the chart is readable without colour), two tiles for the sun times. 3: "5 h to this sunset" with `invented example`; a timeline bar from now to sunset split into the legs (train, airport, flight, to the marina) with the gap to sunset dashed; a DEPARTURE tile; the QR.

**Chart rules.** Bars start at zero; every bar is labelled with its value; no gridlines needed at this size.

### 3.5 Dusk (`dusk`): light type on deep blue, led by the sun

**Idea.** Evening is when the white paper's sunset line bites. Light-weight type on deep blue over the scene, with drawn sun arcs: where the sun is now in the Algarve, and how much daylight each place has left. Mock-up: `mockups/design-dusk.svg`.

| Use | Colour | On | Ratio |
|---|---|---|---|
| Ink | #F5EFE6 | background #171B36 | 14.7 |
| Ink | #F5EFE6 | panel #232848 | 12.5 |
| Soft ink | #C9C2D6 | panel | 8.3 |
| Sunset orange (Algarve, accent) | #FFB870 | panel | 8.4 |
| Here | #9FB0E0 | background | 7.8 |
| Rose (second accent) | #F59A8B | background | 7.9 |
| Ribbon | #171B36 | #FFB870 | 9.9 |
| Tag live | #171B36 | #7FD39A | 9.4 |
| Tag simulated (outlined) | #D4B8FF | panel | 8.2 |
| Tag invented example (dashed) | #FFA36B | panel | 7.3 |

Text over the scene sits under a gradient of #171B36 from 92% at the top to 20% at y = 900, and figures are kept in the top 700 px where the gradient is at least 70%; panels are #232848 at 88 to 90%.

**Type.** System sans at weights 200 to 300 for headlines and figures (220 px "20.6 °C" at weight 200), 400 to 600 for text. Thin strokes at these sizes stay about 10 to 13 px wide (estimate: weight 200 strokes are roughly 5 to 6% of the font size), well over what 3 to 5 m needs; weight 200 is not used under 80 px.

**Phases.** 1: "Faro, 17:05", the temperature very large, `live`, today's words; at the foot a panel with the sun's arc and the sun drawn at its computed position ("the sun in Faro now (computed)"). 2: "Daylight", two arcs side by side, "London: ended 16:08" and "Faro: sunset 17:21" (both computed), then the temperatures with their tags and the three days. 3: the headline at its largest ("You are / 5 hours / from this sunset", or after the last departure "You could / wake up here / tomorrow", as in the mock-up); the example with `invented example`; the QR.

**Not a dark mode of the site.** The screen is always dark in this design; the page around it follows the site's light or dark setting.

### 3.6 The chooser at `/d/` (mock-up `chooser.svg`)

- **What.** A page with the band, header and footer like any other: heading "Designs", one paragraph ("Five ways to draw the same screen and the same live data. Every label and the small print stay in each."), then five cards in a grid (5 across at 1366 px, 2 across at 390 px, 1 across under 360 px). Each card is one link holding: the preview image (portrait, 9:16, `alt` "Preview of the <name> design, phase 1, with example values"), the name, the one-line idea, five palette swatches (with the hex values in visually hidden text), and "Open the design". A sixth card, "Default", links to `/`.
- **Preview images.** A screenshot of each design's screen alone, phase 1, made with Playwright from the built site: element `.screen`, deviceScaleFactor 1, then resized to 540x960 and saved as JPEG quality 70 at `src/d/<id>/preview.jpg`. Expected size 60 to 150 KB (estimate); the script fails if any is over 300 KB. To keep the preview from showing a stale figure as current, the screenshot uses a fixed example state (section 5, request 9) whose small print adds "Example values for this preview, not a reading." The card's `alt` says the same.
- **Reads.** `src/designs.json` (names, ideas, palettes, fonts, paths).
- **Cost.** Small: a static page plus a few lines in a script (see 3.7).

### 3.7 How each design is built

```
src/d/index.html               the chooser (3.6)
src/d/<id>/index.html          a full page: the home layout with the theme fixed
src/d/<id>/theme.css           custom properties and overrides, scoped to .screen.theme-<id>
src/d/<id>/design.json         name, idea, palette, fonts (designer's file)
src/d/<id>/preview.jpg         the preview (made by script, committed)
src/designs.json               the list, collected from src/d/*/design.json
```

- `src/d/<id>/index.html` follows the contract (`lang="en-GB"`, `<title>`, description, `<!--HEAD-->`, `<!--HEADER-->`, `<!--FOOTER-->`, `data-sources` as on the home page, share image the default or `/assets/share/designs.png`). It holds the same `.stage` and `.panel` as `src/index.html`, a short "About this design" paragraph with a link back to `/d/`, links `/assets/screen.css` then `./theme.css`, and runs:

  ```html
  <script type="module">
  import { mountControl } from '/assets/js/control.js';
  mountControl(document.getElementById('billboard-control'), document.getElementById('billboard-screen'), { screen: { theme: 'poster' } });
  </script>
  ```

  so a visitor can still change the location, the London weather and the place on every design. (If `control.js` should not be reused, the page imports `buildState` and `mountScreen` from `/assets/js/screen.js` and passes `{ theme: '<id>' }`.)
- `theme.css` first sets the custom properties on `.screen.theme-<id>` (fonts, ink, accent, here, Algarve, panel, small print, ribbon, tag colours), then overrides layout under the same selector, for example `.theme-poster .screen-scene { top: 170px; left: 64px; right: 64px; height: 760px; }` (the scene's SVG uses `preserveAspectRatio="xMidYMid slice"`, so it crops to the box). Nothing in a theme hides a tag, the small print, the ribbon or the drawing note; the reviewer checks that the overrides contain no `display: none` on those classes.
- `src/designs.json` is outside the designer's scope in `team/scopes.json` (`src/d/**` only). Proposal: the developer's `scripts/designs.mjs` (already listed in the developer's scope) collects `src/d/*/design.json` into `src/designs.json` and makes the previews. Or the conductor moves the list to `src/d/designs.json`.
- **Cost.** Per design: one theme file (about 80 to 200 lines of CSS) and one page (copy of the home page's markup). The screen must expose the hooks in section 5 first; Poster, Readout and Dusk need the most of them.

---

## 4. Failure states, gathered

| What | When | The screen shows | The panel shows |
|---|---|---|---|
| Algarve temperature | no station in the fallback list reported | "--", `missing`, "no station reported this hour" | the stations tried and the hour |
| Algarve file | HTTP error or unreadable | figures "--", `missing`; decision "Would pause" | the URL and the error |
| Any value | older than twice its cadence (2 hours for IPMA hourly) | the value with `may be out of date` and its read time | the same, with the cadence |
| Here (Portuguese city) | chosen station silent | the next station in the list, named with its distance | "Braga (CIM) silent at 17:00 UTC; using Guimarães, 16 km" |
| Forecast days | missing | "--" in that cell; "No forecast could be read." if none | the reason |
| Sunset | cannot be computed (polar cases only; not for these places) | "--" | "not computed" |
| QR code | library error | the URL in text at 40 px | |
| Scene | no weather read | a neutral, part-cloudy sky; the drawing note stays | |
| JavaScript off | | the `noscript` text | the `noscript` text |

---

## 5. What I need from the screen API (for the developer, to put in SCREEN.md)

The current `screen.js` (read 18:15 UTC) already gives most of this: `mountScreen(el, state, { theme, controls, decision, autoplay, phaseMs, maxHeight, phase })`, the root `.screen.theme-<name>` with `data-phase`, `.is-paused-decision`, custom properties for fonts, ink, accent, panel, here, Algarve, small print, ribbon and tags, and stable class names. Requests:

1. **Freeze the class names** used by the designs, and list them in SCREEN.md: `.screen-scene`, `.screen-layer`, `.screen-phase`, `.phase-now`, `.phase-compare`, `.phase-journey`, `.screen-headline`, `.screen-accent`, `.screen-now`, `.screen-place`, `.screen-time`, `.screen-temp`, `.screen-words`, `.screen-meta`, `.screen-vs`, `.screen-side`, `.side-here`, `.side-alg`, `.side-name`, `.side-temp`, `.side-words`, `.screen-days`, `.screen-sunline`, `.screen-itinerary`, `.itin-title`, `.itin-depart`, `.screen-cta`, `.screen-qr`, `.cta-text`, `.screen-dots`, `.screen-smallprint`, `.screen-ribbon`, `.tag-live`, `.tag-sim`, `.tag-inv`, `.tag-stale`, `.tag-missing`.
2. **State on the root as data attributes**: `data-mode="run|switch|pause"`, `data-here="london|porto|braga|lisboa"`, `data-place="<place id>"`, `data-night="true|false"` (the Algarve after sunset), `data-sim-clock` when London's time is set. Themes switch on these with CSS alone.
3. **A headline wrapper with a background hook**: `<div class="screen-head">` around `.screen-headline`, styled by `--screen-head-bg` (default: #0A1626 at 72%), to fix the contrast finding in 2.3. Also `--screen-veil` for the phase 2 and 3 darkening (now a fixed gradient).
4. **Small print as separate lines**: spans `.sp-sim`, `.sp-alg`, `.sp-here`, `.sp-inv`, `.sp-drawing` inside `.screen-smallprint`, so a design can set them as lines (2.5) and the default can too. Minimum 26 px.
5. **Itinerary legs with clock times**: each `<li>` with a `.leg-time` (start time, in the here time zone) and a `.leg-what` and `.leg-dur`, so Poster and Board can show times in a column and Readout can draw the timeline. Expose the same as `state.journey.legs[]` with `start` times.
6. **Phase 2 rows marked**: `tr.is-dry` on the first dry Algarve day in switch mode, and words in their own span (`.day-words`).
7. **More phase 1 figures as elements**: `<dl class="screen-facts">` with one `<div data-key="forecast|sea|uv|aircraft|sunset">` per fact, each holding the value, its tag and a `.fact-src` source line. Readout needs these as tiles; other themes can hide nothing but may lay them out in a line. Add UV from `ipma-uv` (today's date, DATA.md quirk 3).
8. **Sun position as custom properties**: on the root, `--sun-frac-alg` and `--sun-frac-here` (0 at sunrise, 1 at sunset, clamped; 1 after sunset) and `--sun-alt-alg` in degrees, so Dusk can place the sun on its arcs; or an opt-in `opts.sunArcs` that renders `.screen-sunarc` SVGs with those values.
9. **A fixed example state for screenshots**: `buildState(params, { now, example: true })` (or `?example=1`) that builds the state from a small committed fixture, labelled in the small print "Example values for this preview, not a reading.", plus `?phase=1&autoplay=0`, so previews and review shots do not depend on the network and never pass off a frozen value as live.
10. **Kiosk keeps the band** (1.5): in `?kiosk=1`, keep the band and place it beside or above the screen.
11. **Theme names**: accept `poster`, `board`, `postcard`, `readout`, `dusk` in `?theme=` (the regex in `control.js` already allows them) and keep `setTheme()`.
12. **Tag shapes** (2.4): outlined `.tag-sim`, dashed `.tag-inv`, a leading dot on `.tag-live`, as custom properties (`--tag-sim-border`, `--tag-inv-border-style`), so each theme sets them.

## 6. Open questions for the conductor

- `src/designs.json` is outside my scope (3.7): developer's `scripts/designs.mjs`, or move it under `src/d/`?
- Should `/d/<id>/` pages reuse `mountControl` (the full panel on every design), as proposed, or show the screen alone with a link to `/?theme=<id>`?
- The kiosk band placement (1.5) changes `screen.css` and `control.js`, the developer's files: agree before I build the designs.

# Design proposal, round 1: the screen, the home page and five designs

**Status: proposal, revised** by designer.london-billboard@AgentiCCells.dinis for conductor.london-billboard@AgentiCCells.dinis, 2026-11-18 (written 18:10 to 18:40 UTC; revised after the design review, `team/rounds/1/review/DESIGN.md`, verdict fail on D1 to D4, from about 18:50 UTC). Not yet re-reviewed. Nothing in `src/` is built by this proposal; `src/d/` waits for the developer's screen API changes.

**The idea is Dinis Cruz's** (his white paper "Dynamic Weather-Driven Algarve Tourism Campaign" and 12-slide deck). His words for this site, from `team/BRIEF.md`: 17:45 UTC, "Cool, and yes this is 100% simulated, I just want to use it as a nice demo of what we can do with these ACC sites (and the data that we have on the multiple *.pt.news sites)"; 18:00 UTC (relayed, queued 17:55 UTC), "This simulation of a billboard, which could be in London or other parts of Portugal too (since the weather is usually much better there) will be on one of our ACC.live sites. And will be 100% client side driven." The deck's images are generated; none is copied here. Every drawing in this folder is our own.

**Read for this proposal:** `CLAUDE.md`, `team/designer/ROLE.md` and `POLICY.md`, `team/BRIEF.md`, `team/rounds/1.md` (the contract and the labels), `team/rounds/1/data/DATA.md` and `FIGURES.md`, the white paper's text (phases 1 to 3), `src/index.html`, `src/assets/js/screen.js`, `scene.js`, `control.js`, `src/assets/screen.css` and `site.css` as they stood at 18:15 UTC (the developer is still writing them; `team/rounds/1/build/SCREEN.md` did not exist yet), and, as material only, the sibling cells' designs (the IPMA data site's `src/d/`, another AgentiCCells site's `src/d/`, the Algarve holiday homes billboard mock-ups). For the revision: `team/rounds/1/review/DESIGN.md`, `src/assets/site.css` and `src/assets/screen.css` (focus styles, the `.tag-computed` colours).

**Mock-ups** (our own drawings, SVG, in `mockups/`; redraw with `node team/rounds/1/design/mockups/draw.mjs`):

| File | What it shows |
|---|---|
| `mockups/layout-wide.svg` | The home page at 1366x900: the band whole, screen 305x542, controls, decision line, panel with the provenance list, the stage and panel as one centred group |
| `mockups/layout-phone.svg` | The home page at 390 px: the same, stacked; screen 358x636; the dashed line is the end of the first view at 844 px |
| `mockups/layout-kiosk.svg` | `?kiosk=1` in a landscape window, with the band beside the screen, and the keys |
| `mockups/screen-phases.svg` | The screen at 1080x1920: safe areas, type scale and the seven tag shapes, phases 1 to 3, and today's "Algarve wet too" state |
| `mockups/design-poster.svg`, `design-board.svg`, `design-postcard.svg`, `design-readout.svg`, `design-dusk.svg` | Each of the five designs in its three phases |
| `mockups/chooser.svg` | The chooser at `/d/`: six cards (Default and the five designs), previews drawn in the example state |

Values in the mock-ups are examples of shape, not readings. The Faro temperature (20.6 °C, Faro (Aeródromo), 17:00 UTC) is the observation DATA.md section 8 read on 18 November; the "run" frames pair it with Faro's forecast words for 19 November (partly cloudy, 6% rain) so they show a dry day; the "wet too" frame shows 18 November as read (light rain, 100%). London's 9 °C rain is a simulated setting. Every journey time is an invented example. The real screen reads everything live.

## Changes after the design review

The reviewer's verdict (`team/rounds/1/review/DESIGN.md`, 2026-11-18, about 18:20 to 18:45 UTC) was fail on D1 to D4; D5 to D13 were also for the designer. The conductor decided the open questions: the designs list is `src/d/designs.json`; design pages carry the full control panel; the developer adds the band to the kiosk view and builds the example state with an "example" tag (never "live") while this revision is written. Every mock-up was redrawn with `mockups/draw.mjs`.

| Finding | What I changed |
|---|---|
| D1 (blocking): preview images froze a "live" tag | A new tag, `example` (2.4: filled light, square corners, solid edge, leading open ring). In the example state every "live" tag reads "example", read and observation times print "example", the decision line and ribbon add "(example values)", and the small print says "Example values for this preview, not a reading." "simulated", "invented example" and "computed" stay. The example state is in the failure-state table (section 4) and request 9. `chooser.svg` redrawn in the example state. |
| D2 (blocking): the home layout rule kept today's overflow and gap | 1.1 rewritten as the mock-up shows: screen height is the smaller of the column bound and the window height left under the stage top, the controls and the decision line, with a 480 px floor; the stage column is as wide as the screen (at least 20 rem); stage and panel sit together as one centred group with one 2 rem gap. Expected sizes at 1366x900 (305x542) and 1366x768 (270x480). `layout-wide.svg` redrawn to those numbers. |
| D3 (blocking): no rules for reduced motion or keyboard | New section 1.7: reduced motion (paused start, no rain or cloud drift, no fades, theme animation only inside `prefers-reduced-motion: no-preference`, kiosk holds phase 1); keyboard (focus ring outside the screen frame and on every chooser card, 3 to 1 or more in both colour schemes and in kiosk, ratios given; Space and the arrow keys in kiosk too; only the decision line is announced). |
| D4 (blocking): a name that may be a person's | Removed. Line 7 now says "another AgentiCCells site's `src/d/`". |
| D5: designs list path | 3.6 and 3.7 now read and write `src/d/designs.json`; the `scripts/designs.mjs` alternative for the list is dropped (the previews can still be made by script). |
| D6: "computed" missing from the tag set | Added to 2.1, 2.3, 2.4 and every theme table, with its own shape (outlined, square corners, thick left edge) and a ratio. Every design now puts the tag beside or directly under its sun times. |
| D7: band cut short in three mock-ups | Drawn whole and wrapping in `layout-wide.svg`, `layout-phone.svg` and `chooser.svg`; 1.1 and 1.2 say the band is never clipped or ellipsised at any width. The navigation reads "Planning assistant (simulation)". |
| D8: Postcard stamp used the dashed edge | The stamp is now a solid double rule (3.3); dashed is kept for `invented example` alone in every design. |
| D9: London's three-day values tagged only in a caption | The `simulated` tag sits in the London column header in the default screen, Poster, Postcard, Readout and Dusk (Board had it). Postcard gives London its own line per day, in its own colour. Postcard phase 2 now says "Sunset in Faro 17:21". |
| D10: Board's journey rows read like a timetable | Phase 3 bar reads "EXAMPLE JOURNEY", the flight row "EXAMPLE FLIGHT", and the `invented example` tag is 44 px. Phase 1's TODAY and SEA rows carry their `live` tags, with a source line each under the rows (sea is an IPMA forecast, not the station reading). |
| D11: Readout's chart by colour only | Every bar is named under it ("London", "Faro"), and the chart's heading carries "London `simulated`" and "Faro `live`". Phase 3: the tile is taller and the tag no longer overlaps "11:00 flight". |
| D12: phone height | 1.2: the 70% cap is dropped; the screen is width-bound (358x636 at 390x844), capped at the window height minus the controls and gaps, so the screen and its controls fit one window once scrolled to. |
| D13: small mismatches | `screen-phases.svg` now says "Headline 92 px, 7 to 8 m" and "Tags: 40 px beside the hero figure, at least 30 px elsewhere"; `layout-kiosk.svg` says "Leave with the address bar or Back" (Esc leaves nothing); the aircraft line reads "aircraft seen near Faro airport now (adsb.lol, ODbL)" with `live` in every mock-up; `chooser.svg` has the sixth "Default" card. |

---

## 1. The home page

### 1.1 Layout at 1366 px and wider (mock-up `layout-wide.svg`)

- **What.** Two columns under the band and the header: the stage (screen, then the screen controls, then the decision line) and the panel ("Set the screen", then "Where each figure comes from"), 24 rem wide, sticky, scrolling inside itself if taller than the window. The stage column is as wide as the screen, and never under 20 rem so the controls and the decision line fit (`grid-template-columns: auto 24rem`, the stage sized by the screen). The two columns sit together as one group centred in the page, with one gap of 2 rem between them; nothing else fills the space beside them. "What you are looking at" runs full width below both.
- **The band** is printed whole at every width, wrapping onto as many lines as it needs; it is never clipped, cut short or ellipsised (the same holds at 390 px and in kiosk).
- **The screen's size.** Screen height = the smaller of (stage column width x 16/9) and (window height minus the stage's top, minus the controls, the decision line, the gaps between them and a 16 px foot), with a floor of 480 px. Below the floor the decision line may fall under the fold, never the controls. The heights are measured at run time (`getBoundingClientRect` of the stage, the controls and the decision line), not assumed, and re-measured on resize. Width = height x 9/16.
- **Expected numbers** (computed; band and header 154 px as measured in the review, main padding 24 px, so the stage top is 178 px; controls 44 px; decision line about 96 px at 20 rem, four lines; gaps 12 px):
  - 1366x900: 900 - 178 - 44 - 96 - 12 - 12 - 16 = 542, so the screen is 305x542; controls end at y 776, the decision line at 884, all inside the window. The group is 320 + 32 + 384 = 736 px wide, starting at x 315.
  - 1366x768: 768 - 178 - 180 = 410, under the floor, so 270x480; the controls end at y 714 (inside 768), the decision line runs under the fold.
- **Why.** The screen is the page. The settings sit beside it so a change (London to Lisbon, rain to sun) shows on the screen without scrolling.
- **Reads.** Nothing itself; the panel and screen read the data (section 2).
- **Cost.** Small, for the developer (review V1): the stage column in `site.css` (now `minmax(0,1fr)`), `justify-content: center` on the grid, and the `maxHeight` default in `screen.js` (now `innerHeight * 0.85`) replaced by the measured rule above.

### 1.2 Layout at 390 px (mock-up `layout-phone.svg`)

- **What.** One column, in this order: band (whole, wrapping), header, screen, screen controls (three buttons of at least 44x44 px), decision line, panel, provenance list, "What you are looking at", footer. No horizontal scroll.
- **The screen's size.** Width-bound: the window width less a 16 px gutter each side, capped so the screen and its controls fit one window height (height at most window height - controls 44 - gaps 12 and 12 - foot 16). At 390x844: 358 px wide, 636 px tall (the width binds: the cap is 760); screen plus controls are 692 px, so they fit one window once scrolled to. The band and header take about 269 px at this width (measured in the review), so the screen does not fit the first view whatever its size; shrinking it gains nothing.
- **Why.** On a phone the screen's own small print is about 9 px when scaled (26 px x 0.31) and cannot be read; the provenance list under it carries the same facts at body size. The screen stays first because it is what the site shows.
- **Failure state.** If JavaScript is off, the `noscript` text already in `src/index.html` says what would be shown and links to data.promptugal.news.
- **Cost.** Small: the same sizing function as 1.1 with the width bound first; `mountScreen` already accepts `maxHeight`.

### 1.3 The decision line

- **What.** Directly under the screen controls, as wide as the stage column (the screen's width, at least 20 rem), a box with a 4 px left rule: first a bold verdict ("Would run.", "Would switch message.", "Would pause."), then the reason from `decide()` in plain words, for example: "A real screen would switch message now: it is raining in Faro today too, and London is colder (simulated). It would show the drier days ahead instead (Thu 19 Nov: partly cloudy, up to 21 °C, IPMA forecast)." It is `aria-live="polite"`, so a change of setting is announced once.
- **Colours** (site tokens): run, rule `--live` (#1D6B3A); switch, rule `--warn-bar` (#8A6D00) on `--warn-bg` (#FFF3C4); pause, rule `--fail` (#A1261A). Text is always `--ink` (#1C1F23) on a light tint: 14.6 to 1 or more (14.9 on #FFF3C4). The verdict word carries the meaning, not the colour.
- **Why.** The white paper says the campaign "can simply pause or switch messaging" when the Algarve is not better. Today it is raining in Faro too (DATA.md section 8), so the line is the most honest thing on the page and must be easy to find.
- **Reads.** `state.decision` (`mode`, `line`), built from the here and Algarve values.
- **Failure state.** No Algarve reading: "Would pause. No live Algarve reading could be read, and it never shows a guess." (already in `decide()`).
- **Example state** (previews, 3.6): the verdict reads, for example, "Would run (example values)." and the reason says the values are an example, not a reading.
- **Cost.** Small: styling in `screen.css`; the verdict word is already in `screen.js`.

### 1.4 The provenance list

- **What.** In the panel under the settings, heading "Where each figure comes from": one line per figure on the screen, in screen order, each with value, source, publisher, place or station with distance, the observation hour, the time read, and the label: for example "Faro 20.6 °C: IPMA, Faro (Aeródromo) station, 4 km, observed 17:00 UTC, read 17:56 UTC, live". London lines: "set by you, simulated". Sunset times: "computed in your browser (NOAA equations)". Journey: "invented example". The terms paragraph follows (IPMA free use with no profit-making purpose, always named; adsb.lol ODbL 1.0; data.promptugal.news CC BY 4.0; "Not a warning service: follow IPMA").
- **Why.** It is the readable copy of the screen's small print, and the place a reader checks a figure.
- **Failure state.** A missing value: "no current value; last read hh:mm UTC" with the reason; a stale one: "may be out of date: read hh:mm UTC, older than twice its hourly collection". Never a guessed value.
- **Cost.** Exists in `control.js` (`provenanceHtml`); the line format above is a small change.

### 1.5 The kiosk view, `?kiosk=1` (mock-up `layout-kiosk.svg`)

- **What.** Black page, the screen as large as the window allows and centred, no header, no controls, no decision line, phases cycling. The band, word for word, stays: in a landscape window it sits in the empty column to the left of the screen (15 px, light grey #D9D9D9 on black, 14.9 to 1); in a portrait window it is a strip above the screen, which then scales to the height that is left. The band is whole, never clipped. The mouse pointer hides after 3 seconds without movement. Keys: Space pauses or plays the cycling, the left and right arrow keys step a phase (WCAG 2.2.2: the moving content can be stopped), with the screen focused on load. Under reduced motion, phase 1 is held and nothing cycles until a key steps it (1.7). Leaving: the browser's address bar or Back; Esc does nothing, and nothing traps the keyboard.
- **Why.** For showing the screen on a monitor or a projector. The contract puts the band on every page, and a kiosk is the view most likely to be photographed without its context, so it keeps the band.
- **Cost.** Small: `screen.css` already hides everything but the stage in kiosk; the band needs to be kept and placed (developer, `screen.css` and `control.js`).

### 1.6 Optional: a "Design" choice in the panel

A fourth fieldset, "Design", with a select of the default and the five designs. Choosing one sets `?theme=<id>` and loads `/d/<id>/theme.css`. Cheap once the designs exist; skip it if the panel is getting long, since `/d/` already shows them.

### 1.7 Keyboard and reduced motion (every page with a screen, every design)

- **Reduced motion** (`prefers-reduced-motion: reduce`): the screen starts paused on phase 1 (as built: `autoplay` defaults to off); the scene draws no rain fall and no cloud drift (a still frame of the same weather); phases change with a cut, no fade or slide; no theme adds animation (Dusk's sun, any transition) except inside `@media (prefers-reduced-motion: no-preference)`, and the reviewer checks each `theme.css` for `animation` or `transition` outside that block. In kiosk under reduced motion, phase 1 is held and the cycling starts only if the visitor presses Space; the arrow keys step without motion.
- **Focus ring.** The screen frame takes focus (`tabindex="0"` on the frame, as built) and shows a ring outside the frame, on the page, not inside the screen: `outline: 3px solid var(--sun); outline-offset: 4px`. Because it sits on the page background, no theme can lower its contrast; themes are scoped to `.screen.theme-<id>` and do not touch the frame's outline. The current inset ring in the theme accent (`.screen:focus-visible`, `screen.css` line 35) moves to the frame. Every chooser card (one link each) gets the same ring with a 3 px offset. Ratios (WCAG 2, computed): light scheme #B5650B on page #F7F7F4 4.0 to 1, on card #FFFFFF 4.3 to 1, against the screen's dark frame #111111 4.3 to 1; dark scheme #F2B35E on #121417 10.0 to 1, on #1C1F24 9.0 to 1; kiosk (black page) #F2B35E 11.4 to 1, so kiosk uses the dark value in both schemes. All are 3 to 1 or more.
- **Keys.** Previous, Pause and Next are buttons (Tab, Enter, Space). On the focused screen, and in kiosk without focus, Space pauses or plays and the arrow keys step. The panel is a normal form in reading order. A skip link already leads to the main content.
- **Announcements.** Phase changes during autoplay are not announced. Only the decision line is `aria-live="polite"` (1.3), so a change of setting is read once. Each phase has a text name for screen readers ("Phase 1 of 3: the Algarve now").

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
| Tags | at least 40 px beside the hero figure, at least 30 px elsewhere | 21 to 28 mm | 2.5 to 3.4 m | live, simulated, invented example, computed (and example in the example state) |
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
- **Tags** (default theme): live white on #1F7A3F 5.4 to 1; simulated white on #7A3FB0 6.6 to 1; invented example white on #A13D1A 6.6 to 1; may be out of date #3A2E00 on #FFD166 9.3 to 1; missing white on #555555 7.5 to 1; computed white on #2D5F8A 6.7 to 1 (the build's `.tag-computed` colours); example #1C1F23 on #F2F2F2 14.8 to 1. Ribbon #3A2E00 on #FBE7A1 10.9 to 1. QR code black on white 21 to 1 in every design.

### 2.4 Labels on the screen, and colour-blind readers

- Every figure has its tag next to it, in the same line or directly under: "live", "simulated", "invented example", "computed", "may be out of date", "missing", and in the example state "example". The word is always printed; colour is a second signal.
- The tags also differ by shape, so they can be told apart in greyscale (drawn in `screen-phases.svg`, first frame):

| Tag | Class | Shape |
|---|---|---|
| live | `.tag-live` | filled, rounded corners, leading filled dot |
| simulated | `.tag-sim` | outlined (solid), rounded corners |
| invented example | `.tag-inv` | dashed outline, rounded corners; the dashed edge is used for nothing else in any design |
| computed | `.tag-computed` | outlined (solid), square corners, a thick left edge, no dot |
| example | `.tag-example` | filled light, square corners, solid edge, leading open ring (in place of "live", only in the example state) |
| may be out of date | `.tag-stale` | filled yellow, rounded |
| missing | `.tag-missing` | filled grey, rounded |

  (Today `screen.js` draws all tags filled; the shapes are a CSS change on these classes.)
- Here and the Algarve are told apart by position (here left, Algarve right, always) and by name, and by a blue-grey against amber or ochre pair, which stays distinct for the common red-green colour blindness.
- The drawn scene carries "Drawing, not a camera: live.promptugal.news offers no cameras yet (checked 2026-11-18)" in the small print on every phase, and Poster, Postcard and Readout also print "Drawing, not a camera" as a caption at the picture.

### 2.5 The small print band (every phase)

Five lines of 26 px on the opaque band (y = 1680 to 1920), in this order:

1. **Simulation.** No real screen or campaign.
2. Algarve: IPMA via data.promptugal.news, read hh:mm UTC `live` (or "no reading (reason)" `missing`, or `may be out of date`).
3. Here: for London, "London: weather set by you `simulated`" (and "and time" when the clock is set); for a Portuguese city, "Lisbon: IPMA, Lisboa (Geofísico) station, 5.5 km, read hh:mm UTC `live`". Then "Journeys, flights and times: `invented example`".
4. and 5. Drawing, not a camera: live.promptugal.news offers no cameras yet (checked 2026-11-18).

In the example state, line 2 reads "Faro: IPMA via data.promptugal.news, read: example `example`", line 4 shortens to "Drawing, not a camera (live.promptugal.news has none yet).", and line 5 is "Example values for this preview, not a reading." in bold.

Per-figure details (station, distance, observation hour) also sit under the figure in the phase itself at secondary size, as in the mock-ups; the band is the summary that is always there.

### 2.6 Phase 1: "This is the Algarve right now" (about 10 seconds)

- **What.** The drawn scene fills the screen and follows the place's real local time and live weather (`scene.js`). Top: the headline on a scrim, "This is the Algarve / right now. / You could be here." (white, the last line in the accent). Lower third, on a panel: place name (64 px), local time (40 px, kept current), the temperature now (180 px, accent) with `live` (40 px), "IPMA today: partly cloudy, 6% chance of rain" (40 px), then at 32 px "Observed at Faro (Aeródromo), 4 km, 17:00 UTC.", "Sea up to 19.8 °C (IPMA forecast)" `live` and "4 aircraft seen near Faro airport now (adsb.lol, ODbL)" `live`, the tags at 30 px, right-aligned in the panel.
- **White paper.** Phase 1, "This is Algarve right now. You could be here." The paper imagines a live camera; we draw instead, and say so.
- **Reads.** `by-place/now/<place>.json` (station reading, forecast day 0, sea), with the fallback station rule of DATA.md section 2 (for example Albufeira's silent station falls back to Faro (Aeródromo), and the line says "Faro airport station, 27 km away"); `adsb-faro` for the aircraft count (ODbL, live, kept apart from any invented flight).
- **Labels.** Temperature, forecast, sea, aircraft: live. Scene: drawing, not a camera.
- **Failure state.** No temperature from any station in the list: "--" with `missing`, and "no station reported this hour" in place of the station line; the scene draws a neutral sky. Stale file: the value stays, with `may be out of date` and the read time.

### 2.7 Phase 2: the comparison (about 10 seconds)

- **What.** Scene darkened (a #050C19 veil at 60%). Headline "London or Faro?". Two panels side by side, here left and Algarve right, each topped by a 14 px rule in its colour: name (46 px), tag on the line under it (32 px), temperature now (120 px), words (40 px). Then "Next three days" as a table: day, here (max and words), Algarve (max, words, rain chance), 36 px; the column headers carry the tags, "London `simulated`" and "Faro `live`" (or "Lisbon `live`"), so a photo of the table keeps them. Last, the sun line at 46 px: "Sunset in Faro at 17:21. Daylight in London ended at 16:08." with the `computed` tag directly under it and "both times, in the browser (NOAA equations)" at 24 px.
- **White paper.** Phase 2, the weather comparison and "Sunset in Algarve at 5:30pm, daylight in London ended at 4pm". FIGURES.md `sunset-times`: 18 Nov, Faro 17:21, London 16:08 (computed): the paper's example holds, so the screen computes the day's times.
- **Reads.** Here: London simulated settings, or `ipma-city-forecasts` and `ipma-observations` for Porto, Braga, Lisbon (station named with its distance). Algarve: the place file's `forecast.days[]` (forecast place named when it is another town, for example "Albufeira: Loulé forecast, 21 km").
- **Labels.** London: simulated (the side tag and the column header). Portuguese city and Algarve: live. Sunset: `computed` tag.
- **In "switch" mode** (2.9) the first dry day's row is marked: bold, a 6 px accent bar at its left, the word "drier" after the day.
- **Failure state.** A side with no reading shows "--", "no reading" and `missing`; a day with no forecast shows "--"; if neither side has a forecast, the table is replaced by "No forecast could be read."

### 2.8 Phase 3: "You are N hours away" (about 10 seconds)

- **What.** Scene darkened (55%). Headline on two lines: "You are 5 hours" (100 px) / "away from this sunset" (72 px, accent). Panel: "For example" with `invented example` (32 px dashed), the summary line ("Leave Oxford Circus at 09:00; flight at 11:00; in Faro by 14:40, sunset 17:21" with `computed` after the sunset time) and the numbered legs at 34 px. Lower panel: QR code (340 px, black on white, 4-module quiet zone), "Scan to plan" (72 px) and "(a simulation)" (44 px), with "scripted answers, no live model" at 28 px.
- **After the last feasible departure** the headline changes to "You could wake up here tomorrow" and the example uses the first departure next morning (`journey()` already does this; Dusk's mock-up shows it).
- **White paper.** Phase 3, "You are 8 hours away from this sunset. Catch the 12:00 Gatwick-Faro flight ..." Our version names no airline and no airport timetable: FIGURES.md marks flight and door-to-door times unconfirmed, so every time is an invented example.
- **QR legibility (rule of thumb, source unconfirmed).** A code scans from about ten times its width: 340 mm gives about 3.4 m. The planning URL is about 85 characters (`/plan/?from=london&station=oxford-circus&to=faro`), which needs QR version 6 at level M (41 modules, 49 with the quiet zone), so each module is about 7 px, 7 mm. Shorter keys (`?f=london&s=oxford-circus&t=faro`) would bring it to version 4 and 9 mm modules; a small win, optional.
- **Reads.** Nothing live except the sunset (computed for the place and date). Legs and departures come from `journey()` in `screen.js`.
- **Labels.** Itinerary: invented example. Planning assistant: "simulation: scripted answers, no live model". Sunset: `computed` tag.
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

Five visual directions of the same screen and the same data. Each keeps every figure, every tag (with the shapes of 2.4: dashed for `invented example` only), the `computed` tag beside the sun times, the small print band, the drawing note, the ribbon and the QR code; only placement, type and colour change. System fonts only; nothing is loaded from another host. No design imitates a transit operator's signage (no roundel, no operator typeface or colours), an airline, an airport's display, IPMA, a tourism body or an advertiser.

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
| Tag computed (square outline) | #0E5A6B | paper | 6.8 |
| Tag example (example state) | #1B1B1B | #FFFFFF | 17.2 |

**Type.** Headlines and figures: `Charter, "Iowan Old Style", "Palatino Linotype", Georgia, serif`. Text: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. A kicker line "THE ALGARVE, RIGHT NOW" at 30 px, spaced capitals, over a 3 px rule.

**Phases.** 1: scene in a 952x760 box at y = 170, "Drawing, not a camera" in italics under it, then "This is Faro / right now." (96 px serif) and the temperature at 210 px in the Algarve colour with `live`. 2: two columns divided by a hairline, each name in its colour, the three days as a ruled table whose column headers carry "London `simulated`" and "Faro `live`", the sun line in serif at 50 px with `computed` directly under it. 3: the example as a timetable with `invented example` at 36 px, times in the left margin at 52 px ("09:00 Leave Oxford Circus"), the sunset row with `computed`, the QR at the foot with "Scan to plan" in serif and "(a simulation)" in italics.

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
| Tag computed (square outline) | #8FD3E8 | row | 10.1 |
| Tag example (example state) | #0D0F12 | #F2F2EE | 17.1 |
| Tag may be out of date | #0D0F12 | #FFD166 | 13.3 |

**Type.** Titles: system sans, weight 900, capitals, letter spacing 0.06 em. Figures and rows: `ui-monospace, "SF Mono", Menlo, Consolas, monospace` with tabular figures, so columns line up.

**Phases.** 1: scene in the top 720 px; bar "ALGARVE NOW"; "FARO" with `live`, the temperature at 200 px in amber; rows TODAY (with `live`) / SEA (with `live`) / LOCAL TIME; under them one source line per row: "AIR: IPMA, Faro (Aeródromo) 4 km, 17:00 UTC.", "TODAY: IPMA forecast for Faro.", "SEA: IPMA sea forecast, Faro coast (a forecast, not the station reading)." 2: scene shrinks to 360 px; bar "HERE OR THERE"; a four-row table NOW, THU, FRI, SAT with "LONDON `simulated`" and "FARO `live`" column headers; then rows SUNSET FARO 17:21 and DAYLIGHT LONDON 16:08, each with `computed` in the row. The weather words go in a second line of each row on the real screen, so no figure loses its meaning. 3: bar "EXAMPLE JOURNEY" (so a photo of the rows alone still says it); "5 HOURS TO / THIS SUNSET"; `invented example` at 44 px; the itinerary as rows (time, step, duration), the flight row reading "EXAMPLE FLIGHT", the sunset row with `computed`; QR with "SCAN TO PLAN" and "(a simulation)" in sentence case so the label reads as a label.

### 3.3 Postcard (`postcard`): the picture side, then the written back

**Idea.** Phase 1 is the picture side of a postcard (the scene inside a cream border, a "stamp" corner with a solid double rule holding the live temperature); phases 2 and 3 are the back, a written message on the left and the "address" lines on the right. Mock-up: `mockups/design-postcard.svg`.

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
| Tag computed (square outline) | #245E5A | cream | 6.8 |
| Tag example (example state) | #2A1F17 | #FFFFFF | 16.1 |

**Type.** Message and headlines: `Charter, "Iowan Old Style", "Palatino Linotype", Georgia, serif`, italic. Figures in the stamp: the same serif, bold. Labels and small print: system sans. No handwriting font: none is common to all systems, and a web font is not allowed.

**Phases.** 1: scene full bleed inside the card; the stamp (300x340 px, solid terracotta double rule: 6 px outer, 3 px inner, 12 px apart) top right with "Faro", "20.6°" and `live`; "Faro, right now." at 92 px under the picture, then the forecast words and "Drawing, not a camera." 2: "Dear London," then "Here: 9.0 °C, rain" `simulated`, "Faro: 20.6 °C, partly cloudy" `live`, "Sunset in Faro 17:21. Yours ended 16:08." with `computed` under it; on the right, a "3 days" stamp (the same double rule), the column key "Faro `live`" and "London `simulated`", then each day as address lines: the day, "Faro 21° partly cloudy" in terracotta, and on its own line "London 8° showers" in sea blue. 3: "You are / 5 hours away / from this sunset." with `invented example` at 36 px and the example written as the message, `computed` after the sunset line; the QR takes the stamp's place with "Scan to plan" and "(a simulation)".

**Note.** The stamp is a drawn box with a solid double rule, not a postage stamp of any country. It is not dashed: in every design a dashed edge means `invented example` and nothing else, so a live figure is never framed like an invented one in greyscale.

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
| Tag computed (square outline) | #6CC4E8 | tile | 8.0 |
| Tag example (example state) | #0E1A22 | #E9EFF3 | 15.2 |

**Type.** Labels: system sans, bold capitals at 32 px. Figures: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`, tabular. Source lines: 24 px minimum inside a tile (this is the one design where per-figure sources go down to 24 px; the band stays at 26).

**Phases.** 1: tiles FARO, AIR NOW (wide, 20.6 °C, `live`, "IPMA, Faro (Aeródromo) 4 km, obs. 17:00 UTC, read 17:56"); TODAY (rain chance, `live`); SEA (IPMA forecast, `live`); AIRCRAFT ("near Faro airport now, adsb.lol, ODbL", `live`); SUNSET (`computed`). UV can take a sixth tile (from `ipma-uv`, today's date, not the place file's date: DATA.md quirk 3). 2: the two temperatures at 140 px with tags, a bar chart of the next three days' maxima (here blue-grey, Algarve amber, values printed on each bar, and each bar named under it, "London" or "Faro", so the chart reads without colour; the chart's heading carries "London `simulated`" and "Faro `live`"), two tiles for the sun times, each with `computed`. 3: "5 h to this sunset" with `invented example` at 36 px; a timeline bar from now to sunset split into the legs (train, airport, flight, to the marina) with the gap to sunset dashed and `computed` under the sunset end; a DEPARTURE tile (260 px tall, the tag on the label line, clear of "11:00 flight"; source line "not a timetable: no airline or airport named"); the QR.

**Chart rules.** Bars start at zero; every bar is labelled with its value and named (London or Faro) under it; no gridlines needed at this size.

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
| Tag computed (square outline) | #9FD8F0 | panel | 9.2 (6.3 with the panel at 88% over white) |
| Tag example (example state) | #171B36 | #F5EFE6 | 14.7 |

Text over the scene sits under a gradient of #171B36 from 92% at the top to 20% at y = 900, and figures are kept in the top 700 px where the gradient is at least 70%; panels are #232848 at 88 to 90%.

**Type.** System sans at weights 200 to 300 for headlines and figures (220 px "20.6 °C" at weight 200), 400 to 600 for text. Thin strokes at these sizes stay about 10 to 13 px wide (estimate: weight 200 strokes are roughly 5 to 6% of the font size), well over what 3 to 5 m needs; weight 200 is not used under 80 px.

**Phases.** 1: "Faro, 17:05", the temperature very large, `live`, today's words; at the foot a panel with the sun's arc and the sun drawn at its computed position ("the sun in Faro now" with `computed` under it). 2: "Daylight", two arcs side by side, "London: ended 16:08" and "Faro: sunset 17:21", each with `computed` under it, then the temperatures with their tags and the three days, whose column headers carry "London `simulated`" and "Faro `live`". 3: the headline at its largest ("You are / 5 hours / from this sunset", or after the last departure "You could / wake up here / tomorrow", as in the mock-up); the example with `invented example`, the sunset line with `computed`; the QR. Under reduced motion the sun does not move or fade between positions (1.7).

**Not a dark mode of the site.** The screen is always dark in this design; the page around it follows the site's light or dark setting.

### 3.6 The chooser at `/d/` (mock-up `chooser.svg`)

- **What.** A page with the band, header and footer like any other: heading "Designs", one paragraph ("Five ways to draw the same screen and the same live data. Every label and the small print stay in each."), then six cards in a grid: "Default" first (links to `/`), then the five designs (6 across at 1366 px, 2 across at 390 px, 1 across under 360 px). Each card is one link holding: the preview image (portrait, 9:16, `alt` "Preview of the <name> design, phase 1, with example values"), the name, the one-line idea, five palette swatches (with the hex values in visually hidden text), "Open the design" ("Open the screen" for Default) and "Preview: example values". Each card shows the focus ring of 1.7.
- **Preview images.** A screenshot of each design's screen alone, phase 1, made with Playwright from the built site: element `.screen`, deviceScaleFactor 1, then resized to 540x960 and saved as JPEG quality 70 at `src/d/<id>/preview.jpg`. Expected size 60 to 150 KB (estimate); the script fails if any is over 300 KB. A JPEG cannot be live, so the screenshot uses the example state (section 5, request 9): every "live" tag reads `example`, read and observation times print "example", the decision line and ribbon add "(example values)", and the small print says "Example values for this preview, not a reading." "simulated", "invented example" and "computed" stay as they are. The card's `alt` and its "Preview: example values" line say the same. `chooser.svg` is drawn in this state.
- **Reads.** `src/d/designs.json` (names, ideas, palettes, fonts, paths).
- **Cost.** Small: a static page plus a few lines in a script (see 3.7).

### 3.7 How each design is built

```
src/d/index.html               the chooser (3.6)
src/d/<id>/index.html          a full page: the home layout with the theme fixed
src/d/<id>/theme.css           custom properties and overrides, scoped to .screen.theme-<id>
src/d/<id>/design.json         name, idea, palette, fonts (designer's file)
src/d/<id>/preview.jpg         the preview (made by script, committed)
src/d/designs.json             the list (designer's file, written with the designs)
```

- `src/d/<id>/index.html` follows the contract (`lang="en-GB"`, `<title>`, description, `<!--HEAD-->`, `<!--HEADER-->`, `<!--FOOTER-->`, `data-sources` as on the home page, share image the default or `/assets/share/designs.png`). It holds the same `.stage` and `.panel` as `src/index.html`, a short "About this design" paragraph with a link back to `/d/`, links `/assets/screen.css` then `./theme.css`, and runs:

  ```html
  <script type="module">
  import { mountControl } from '/assets/js/control.js';
  mountControl(document.getElementById('billboard-control'), document.getElementById('billboard-screen'), { screen: { theme: 'poster' } });
  </script>
  ```

  so a visitor can still change the location, the London weather and the place on every design (the conductor decided: design pages carry the full control panel).
- `theme.css` first sets the custom properties on `.screen.theme-<id>` (fonts, ink, accent, here, Algarve, panel, small print, ribbon, tag colours), then overrides layout under the same selector, for example `.theme-poster .screen-scene { top: 170px; left: 64px; right: 64px; height: 760px; }` (the scene's SVG uses `preserveAspectRatio="xMidYMid slice"`, so it crops to the box). Nothing in a theme hides a tag, the small print, the ribbon or the drawing note; the reviewer checks that the overrides contain no `display: none` on those classes, no dashed border on anything but `.tag-inv`, and no `animation` or `transition` outside `@media (prefers-reduced-motion: no-preference)`.
- The list is `src/d/designs.json`, inside the designer's scope (`src/d/**`), as the conductor decided; I write it by hand with the designs. The previews can still be made by a script (Playwright, 3.6), run by whoever builds the example state.
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
| Example state (previews, review shots) | `?example=1` or `buildState(..., { example: true })` | the fixture's values; every "live" tag reads `example`; read and observation times print "example"; decision line and ribbon add "(example values)"; small print "Example values for this preview, not a reading."; never `live` | "Example values, not a reading" at the top of the provenance list; each line ends `example` |
| Reduced motion | `prefers-reduced-motion: reduce` | paused on phase 1, no drift or fades; in kiosk phase 1 held until a key | |

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
9. **A fixed example state for screenshots** (the developer is building it now, with the "example" tag): `buildState(params, { now, example: true })` (or `?example=1`) builds the state from a small committed fixture; every "live" tag becomes `.tag-example` with the word "example" (never "live" on a fixture value), read and observation times print "example", the decision line and ribbon add "(example values)", and the small print carries "Example values for this preview, not a reading." (2.5). Plus `?phase=1&autoplay=0`, so previews and review shots do not depend on the network.
10. **Kiosk keeps the band** (1.5; the developer is doing this now): in `?kiosk=1`, keep the band, whole, beside or above the screen; Space and the arrow keys work in kiosk; under reduced motion phase 1 is held (1.7).
11. **Theme names**: accept `poster`, `board`, `postcard`, `readout`, `dusk` in `?theme=` (the regex in `control.js` already allows them) and keep `setTheme()`.
12. **Tag shapes** (2.4): outlined `.tag-sim`, dashed `.tag-inv`, a leading dot on `.tag-live`, square outlined `.tag-computed` with a thick left edge, square `.tag-example` with a leading open ring, as custom properties (`--tag-sim-border`, `--tag-inv-border-style`, `--tag-computed-ink`, `--tag-example-bg`, `--tag-example-ink`), so each theme sets the colours; the shapes stay fixed.
13. **Focus and keys** (1.7): the focus ring on the screen frame, outside it (`outline: 3px solid var(--sun); outline-offset: 4px`), in place of the inset ring on `.screen:focus-visible`; Space and the arrow keys on the focused screen; a text name per phase for screen readers.

## 6. Questions decided by the conductor (after the design review)

- The designs list is `src/d/designs.json` (designer).
- Design pages carry the full control panel (`mountControl`).
- The developer adds the band to the kiosk view and builds the example state with an "example" tag, never "live", while this revision is written. I build `src/d/` after those API changes land.

# Design review, round 1 (step 3)

By reviewer.london-billboard@AgentiCCells.dinis for conductor.london-billboard@AgentiCCells.dinis, 2026-11-18, about 18:20 to 18:45 UTC.

**Verdict: fail**

The proposal is careful and mostly sound: every figure has a label, the contrast figures check out, it adds no host, no key and no font from another host, and the five designs name no operator, airline, airport, tourism body or advertiser. It fails on four points that would put a rule at risk once built (findings D1 to D4: a frozen value tagged "live" in the preview images, the home layout rule that keeps today's overflow and gap, no rules for reduced motion and keyboard, and a person-like name in a file the site publishes). Each is a small change to the proposal. The developer can start on the items marked "not blocked" now.

**Read:** `team/rounds/1/design/PROPOSAL.md` and all ten mock-ups in `mockups/` (rendered to PNG with Playwright, Chromium), `team/BRIEF.md`, `team/rounds/1.md`, `team/WORKFLOW.md`, `team/rounds/1/build/SCREEN.md`, `team/scopes.json`, `src/assets/site.css`, `src/assets/screen.css`, `src/assets/js/screen.js` and `control.js`.

**Build looked at:** `node scripts/build.mjs` (built `_site/`, dev), served on localhost, Chromium at 1366x900 and 390x844, phases 1 to 3 with Next, `?kiosk=1` at 1366x768, reduced motion, and data.promptugal.news blocked. Requests seen: localhost and data.promptugal.news only; no console errors. Values on screen were read live at about 18:24 UTC (Faro 20.6 °C, IPMA, Faro (Aeródromo), observed 17:00 UTC, read 17:56 UTC).

**Conductor's decisions on the open questions (accepted; none breaks a rule):** the designs list moves to `src/d/designs.json` (designer); design pages carry the full control panel; the developer adds the band to the kiosk view.

## The rules, one line each

| Rule | Result |
|---|---|
| Simulation band word for word on every page | Pass in the text (1.5 keeps it in kiosk). The mock-ups `layout-wide.svg`, `layout-phone.svg` and `chooser.svg` cut the band short with "..."; see D7. |
| "live" only on values read live | **Fail**: the preview JPEGs freeze a "live" tag (D1). |
| "simulated" beside every London value | Pass on the home screen and Board; weak in the three-day tables of Poster, Postcard, Readout and Dusk (D9). |
| "invented example" beside every flight, price and travel time | Pass. Board's rows need the tag closer (D10). |
| "computed" for the sunset times | Not in the proposal's tag set, though the build has `.tag-computed` (D6). |
| Drawn scene labelled "drawing, not a camera" | Pass (small print on every phase, captions in three designs). |
| Planning assistant labelled a simulation | Pass ("Scan to plan (a simulation)", "scripted answers, no live model"). |
| IPMA named, with its terms | Pass (1.4). |
| No organisation named as involved | Pass. "Gatwick" appears only inside the white paper's quoted phase 3 line, with the note that our version names no airline or airport. |
| No person named but Dinis Cruz | **Fail** on one name (D4). |
| Copies no real operator (Board) | Pass: amber on near-black with monospace is generic; no roundel, operator typeface or colours. See D10 for the rows. |
| 100% client side | Pass: system fonts, local QR, no new host. |
| Failure states (missing, stale) | Pass (section 4), with one gap for the preview state (D1). |
| 390 and 1366 px | **Fail**: the sizing rule in 1.1 keeps today's defects (D2); 1.2 needs a small change (D12). |
| Legibility and contrast | Pass. I recomputed every ratio in 2.3 and 3.1 to 3.5 with the WCAG 2 formula; all match within 0.1, the lowest is 5.8 to 1 (Postcard terracotta). Dusk panels at 88% over white still give 5.0 to 1 for #FFA36B. |
| Tags told apart without colour | Pass in principle (2.4); Postcard's stamp reuses the dashed edge (D8); Readout's bars rely on colour (D11). |
| Keyboard, reduced motion | **Fail**: not specified (D3). |
| No em dashes or hype words | Pass (none in PROPOSAL.md). |

## For the designer

1. **D1 (blocking). The preview images show a frozen value tagged "live".** Where: 3.6 and section 5 request 9; `chooser.svg` shows "20.6 °C live" on every card. A JPEG cannot be live, and a small print line saying "Example values" at 9 px in a 540 px preview is not enough. Fix: in the example state, every "live" tag reads "example" (a new tag, say `.tag-example`, with its own shape), read times print "example", and the decision line and ribbon carry "example" too. Keep "simulated", "invented example" and "computed" as they are. Add the example state to the failure-state table in section 4.
2. **D2 (blocking). The home layout rule repeats the overflow and the gap seen in the build.** Where: 1.1 ("centred in its column"; "85% of the window's height"). At 1366x900 the band and header take 154 px, so a screen of 85% of 900 (765 px) ends at y 935 and its controls at 988, below the window; and centring a 430 px screen in a 926 px column leaves 272 px between the screen and the panel, with the pair off centre. Your own `layout-wide.svg` is right (screen about 573 px tall, controls and decision line inside 900 px) but disagrees with the text. Fix: write the rule the mock-up shows. Screen height = the smaller of (column width x 16/9) and (window height minus the stage's top, minus the controls, the decision line and the gaps), with a floor (for example 480 px; below it the decision line may fall under the fold, never the controls). The stage column is as wide as the screen (`auto`), the two columns sit together as a centred group with one gap (for example 2 rem), and nothing else fills the gap. Give the expected numbers at 1366x768 and 1366x900.
3. **D3 (blocking). No rules for reduced motion or keyboard.** Where: nowhere in the proposal except "nothing traps the keyboard" in 1.5. Fix: add a short section. Reduced motion: the screen starts paused (as built), no rain or cloud drift, no fades between phases, and no theme adds animation (Dusk's sun, any transitions) outside `@media (prefers-reduced-motion: no-preference)`; in kiosk under reduced motion, say what happens (phase 1 held, or a slow cut with no motion). Keyboard: a visible focus ring around the screen frame and on every chooser card in all five themes and both site colour schemes (3:1 or more against what is next to it); Space and the arrow keys work in kiosk too, so the cycling can be stopped (WCAG 2.2.2); autoplay phase changes are not announced, only the decision line (`aria-live="polite"`, as 1.3 says).
4. **D4 (blocking). A name that may be a person's, in a file the site publishes.** Where: PROPOSAL.md line 7, a sibling site's name before `src/d/`. `scripts/behind.mjs` publishes round files, and the built `_site/behind-the-scenes/rounds/1/design/PROPOSAL/` carries it. This is the same name as finding 8 of `review/SETUP.md`. Fix: write "another AgentiCCells site's `src/d/`" unless Dinis says the name may stay.
5. **D5. The designs list path.** Where: 3.6 ("Reads `src/designs.json`") and 3.7. Fix: change both to `src/d/designs.json`, as the conductor decided, and drop the `scripts/designs.mjs` alternative for the list (the previews can still be made by script).
6. **D6. "computed" is missing from the tag set.** Where: 2.4, 2.5 and the theme tables. The sunset times are computed (1.4, 2.7) and the build already draws `.tag-computed`. Fix: add it with its own shape (for example a square outline with no fill and no dot) and a colour and ratio in each theme's table; use the tag, not plain text, beside the sun times in every design.
7. **D7. The band is cut short in three mock-ups.** Where: `layout-wide.svg`, `layout-phone.svg` and `chooser.svg` end the band with "...". Fix: draw it whole, wrapping, and say in 1.1 that the band is never clipped or ellipsised at any width. Also, in `layout-wide.svg` the navigation reads "Planning assistant"; the contract says "Planning assistant (simulation)".
8. **D8. The Postcard stamp uses the dashed edge that means "invented example".** Where: 3.3, `design-postcard.svg` (the live temperature sits in a dashed box; the "3 days" stamp too). In greyscale a live figure in a dashed frame reads like an invented one. Fix: give the stamp a different edge (solid double rule, or a scalloped edge) and keep dashed for `.tag-inv` alone in every design.
9. **D9. London's three-day values carry "simulated" only in a caption.** Where: 2.7 and the tables in Poster, Postcard ("Faro 21°, London 8°" in Faro's colour), Readout (bar chart) and Dusk. Fix: put the `simulated` tag in the London column header (as Board does), and in Postcard give London its own line or colour per day. Also, Postcard phase 2 says "Here: 9.0 °C" for London and then "Sunset here 17:21" for Faro; use "Faro" for the second.
10. **D10. Board's journey rows read like a real timetable.** Where: 3.2 phase 3, `design-board.svg` ("09:00 OXFORD CIRCUS DEP / 11:00 FLIGHT FARO 2H45 / 14:40 FARO MARINA ARR"). A photo of the rows alone would lose the one tag above them, which is also smaller than the 40 px the proposal asks beside large figures. Fix: put the words in the bar ("EXAMPLE JOURNEY", not "NEXT WAY SOUTH"), write the flight row as "EXAMPLE FLIGHT", and set the `invented example` tag at 40 px or more. Phase 1's TODAY and SEA rows also need their tags or a source line each (sea is an IPMA forecast, not the station reading).
11. **D11. Readout's bar chart tells London from Faro by colour only.** Where: 3.4 phase 2, `design-readout.svg`. Values are printed, but not which bar is whose. Fix: a direct label under or on each bar pair (for example "London" and "Faro" under the first pair, or initials on every bar), and the `simulated` tag on the London label. In phase 3 the `invented example` tag overlaps "11:00 flight" in the mock-up; move it.
12. **D12. Phone height.** Where: 1.2. The 70% cap shrinks the screen to about 330 px wide for no gain: at 390x844 the band and header take 269 px, so the screen does not fit the first view either way. The current build (358 x 636 px) fits with its controls in one window once scrolled to. Fix: keep the width-bound size, capped at the window height minus the controls and gaps.
13. **D13. Small mismatches.** `screen-phases.svg` labels "Headline 92 px (5 m)" and "Tags at least 32 px", where 2.1 says 7 to 8 m and 40 px beside the hero figure; `layout-kiosk.svg` says "Esc or the address bar to leave", where 1.5 says the address bar or Back (Esc leaves nothing); the mock-ups say "airliners near Faro (adsb.lol)" without "ODbL" and the `live` tag, where the build and 1.4 say "aircraft seen near Faro airport now (adsb.lol, ODbL)" with the tag; `chooser.svg` has no sixth "Default" card, which 3.6 describes. Make each match the text.

## For the developer

1. **V1 (not blocked). Fix the home layout at 1366 px** to the rule in D2: in `src/assets/site.css` line 89 the stage column is `minmax(0,1fr)`, which makes the stage 926 px wide around a 430 px screen; and `screen.js` line 261 defaults `maxHeight` to `innerHeight * 0.85`, which ignores the 154 px of band and header. Size from the stage's top and the controls and decision heights, set the stage column to the screen's width, and centre the pair with one gap. Check at 1366x768 and 1366x900 that the screen and its controls are fully in the first view.
2. **V2 (not blocked). Keep the band in kiosk.** `src/assets/screen.css` line 140 hides everything but the screen, band included (seen: no band in `?kiosk=1` at 1366x768). Place it as in 1.5 and `layout-kiosk.svg`: beside the screen in a landscape window, a strip above it in a portrait one, whole and unclipped. Make Space and the arrow keys work in kiosk.
3. **V3 (not blocked). Decision line colours** as 1.3: today "Would switch message." uses a red-brown rule on a pink tint, which 1.3 keeps for "Would pause". Switch uses `--warn-bar` on `--warn-bg`.
4. **V4 (not blocked). Headline scrim** (2.3, request 3): `.screen-head` with `--screen-head-bg` at 72%. At 18:24 UTC the scene was night and rain, so the headline read well; at midday on a clear sky white on #BFE2F4 is 1.4 to 1.
5. **V5 (not blocked). Tag shapes** (2.4, request 12), plus a shape for `.tag-computed` once D6 is settled.
6. **V6 (blocked by D1). Example state** (request 9): build it with the "example" tag of D1, never "live" on a fixture.
7. **V7 (not blocked). Requests 1 to 8, 10 and 11** in section 5 hold no rule problem; record the frozen class names and data attributes in `SCREEN.md`.

## Not checked here

The words and the planning assistant's answers (writer's step), the data figures against data.promptugal.news beyond the screen values above (analyst's DATA.md), and the built designs (step 5).

## Re-check (2026-11-18, about 18:50 to 19:00 UTC)

Read: `team/rounds/1/design/PROPOSAL.md` as revised in commit b7f0485 (section "Changes after the design review", 1.1, 1.2, 1.3, 1.5, the new 1.7, 2.4, 2.5, 3.2 to 3.7, section 4) and all ten mock-ups, redrawn and rendered again to PNG with Playwright. `src/assets/` was not looked at (the developer is changing it). I recomputed the new ratios with the WCAG 2 formula: focus ring #B5650B on #F7F7F4 4.0 to 1, on #FFFFFF 4.3, against #111111 4.3; #F2B35E on #121417 10.0, on black 11.4; `computed` white on #2D5F8A 6.7. All as stated, all 3 to 1 or more for the ring and 4.5 to 1 or more for text.

**Verdict: pass**

| Finding | Result |
|---|---|
| D1 | Fixed. The example state turns every "live" into an `example` tag with its own shape, read times print "example", the decision line and ribbon add "(example values)", the small print says "Example values for this preview, not a reading.", and it is in section 4. `chooser.svg` shows no "live" on any preview. |
| D2 | Fixed. 1.1 states the measured rule (height from the stage's top, the controls and the decision line, 480 px floor, measured at run time), an `auto` stage column of at least 20 rem, and one centred group with a 2 rem gap; `layout-wide.svg` matches it. |
| D3 | Fixed. 1.7 covers reduced motion (paused start, no drift, cuts not fades, theme animation only under `no-preference`, kiosk holds phase 1), a focus ring on the page outside the frame and on every chooser card, the keys in kiosk, and announcements. |
| D4 | Fixed. The sibling site's name is gone from the proposal and the design folder (searched). |
| D5 to D13 | Fixed as listed in the proposal's table; checked in the text and in each mock-up (designs list at `src/d/designs.json`; `computed` tag beside every sun time; band whole in every mock-up and "Planning assistant (simulation)" in the navigation; Postcard stamp a solid double rule; London's column headers tagged `simulated`; Board's "EXAMPLE JOURNEY" bar and "EXAMPLE FLIGHT" row; Readout's bars named; phone screen width-bound; the small mismatches corrected). |

Remaining items (not blocking; check in step 5):

1. **R1, the decision line's height at 1366x900 (developer, designer to note).** 1.1 assumes about 96 px for the decision line at 20 rem. Today's line is 85 px tall at 640 px wide and 151 px at 358 px wide (measured in the first review), so at about 320 px it will be nearer 150 to 170 px. The rule measures at run time, so it still holds, but at 1366x900 the 480 px floor will probably apply (270x480) and the decision line will run under the fold, not the 305x542 the proposal expects. If the designer wants the larger screen, a wider stage column (for example at least 28 rem, so the line takes three or four lines) would do it. Step 5 checks that the screen and its controls are fully in the first view at 1366x768 and 1366x900.
2. **R2, themes (step 5).** When the designs are built, I check each `theme.css` for `display: none` on a tag, the small print, the ribbon or the drawing note, and for `animation` or `transition` outside `prefers-reduced-motion: no-preference`, as 1.7 and 3.7 ask.
3. **R3, developer items V1 to V7 above** stand, with V6 now unblocked: build the example state with the `example` tag of 2.4.

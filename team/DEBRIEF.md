# Debrief: conductor.london-billboard@AgentiCCells.dinis, 2026-11-18

Written at Dinis Cruz's word (~18:55 UTC, relayed by cells@AgentiCCells.dinis): "STOP. The account is at 94% of its usage; all agents move to another account."

## What was done (round 1 of at most five)

- Team: six roles (conductor, analyst, designer, developer, writer, reviewer), each with `team/<role>/ROLE.md` and an Agent Behaviour Policy (`POLICY.md`, a proposal); `team/scopes.json`; `team/WORKFLOW.md`. The reviewer passed the setup (with notes, fixed) before it was released.
- Data (analyst): `team/rounds/1/data/DATA.md` (fields, ids, stations, quirks, terms) and `FIGURES.md` with `src/data/figures.json`: the white paper's 17 figures checked against primary sources (confirmed, differs, or source unconfirmed).
- The screen (`/`): a 1080x1920 portrait screen, scaled to fit, running the three phases on live Algarve data from data.promptugal.news (IPMA, adsb.lol); screen location London (weather, time and station simulated by a control) or Porto, Braga, Lisbon (live IPMA, with the station used and its distance); Algarve place picker; computed sunset and daylight; invented example journeys; QR code to the planning assistant; a drawn scene marked "drawing, not a camera"; the decision line (run, switch message, pause); kiosk view (`?kiosk=1`); example state (`?example=1`); tag shapes so labels do not rely on colour; missing and stale data stated.
- `/plan/`: the scripted planning assistant (no live model, nothing sent), labelled a simulation.
- `/idea/`: Dinis's white paper and deck in outline, credited to him, with the figures table.
- `/use-the-data/` (JavaScript fetch and curl examples, tested live), `/use-with-ai/`, `llms.txt`, Markdown twins, `/behind-the-scenes/` (team, policies, flow diagram, commit timeline from git log, round files), link previews (1200x630 PNG cards, under 300 KB) on every page.
- Gates: the validator now also checks link previews, the simulation label, no data sent, no posting forms, no iframes and team wording; release and CI also run role-scope, abp-check and the tests.

## Live version

The push of this debrief deploys through the Pages workflow; CI tags it v0.1.N (see https://london-billboard.agenticcells.site/version.json). The commit is named in the one-line report to cells@AgentiCCells.dinis.

## Decisions taken

- London has no source on 2026-11-18, so its weather is set by the visitor and labelled "simulated". Porto, Braga and Lisbon are live (Dinis, ~18:00 UTC).
- No cameras: live.promptugal.news says "First version coming" (checked 2026-11-18). The screen shows a drawing.
- Event titles and venue names are not shown on `/plan/`, because some name people; it shows counts, dates and links with the source named.
- No airline is named; the London leg says "a London airport". Example departures are invented.
- The paper's precedent campaign is not named (no primary source found).
- The designer's half-built `/d/` was dropped at the stop (not reviewed, not complete) and the Designs link removed from the navigation. The approved proposal is in `team/rounds/1/design/PROPOSAL.md`.

## Not done

- The five designs under `/d/` and the chooser.
- The build review (workflow step 5): **the reviewer has not passed the built site.** What is live passed every automated gate only.
- `team/HANDOVER.md` in its final form (this debrief and `team/NEXT-BRIEFING.md` stand in for it).

## Open items for Dinis

1. Signed commits: CLAUDE.md asks for "a commit signed by the releasing agent"; this team has no signing key, so commits carry the `Agent:` trailer only. May releases go ahead unsigned, or will a key be provided?
2. A sibling site's repository name (from your brief) may read as a person's name; it is kept out of published team text and remains only in provenance comments in `scripts/abp-check.mjs` and `scripts/role-scope.mjs`. May it stay?
3. White paper figures: "about 50% of hotels close in winter", the 2h40m flight time and the precedent campaign have no primary source found; January sunshine differs from the paper (Faro about 5.9 h a day, Heathrow about 1.9 h, against the paper's 5 and 1). The Met Office station data's licence is not yet checked.
4. events-pt has no reuse licence from its sources; the site uses it for counts and links only.
5. When live.promptugal.news offers cameras, or a London weather source exists, the screen has one place to change each (`findCamera()` in `scene.js`; the London side in `data.js` and `control.js`).

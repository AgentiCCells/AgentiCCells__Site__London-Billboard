# Copy notes, round 1: Use the data, Use with AI, llms.txt, index.md

By writer.london-billboard@AgentiCCells.dinis, 18 November 2026, at the brief of conductor.london-billboard@AgentiCCells.dinis.

## Files

- `src/use-the-data/index.html`: what data.promptugal.news is; the files the screen reads and why (URL, publisher, cadence, terms, a live status column); seven copy-paste examples in JavaScript and in curl with jq; how to read a card (from the ipma-observations card); the terms; stale or missing data; how to build a screen like this one; not a warning service.
- `src/assets/js/use-the-data.js`: fills the status column. GET only: the catalogue (`api/v1/index.json`) and Faro's by-place file. Imports `API`, `getJSON`, `placeUrl`, `fmtUTC`, `ago`, `ageMin`, `staleAfterMin`, `esc` from `data.js`.
- `src/use-with-ai/index.html`: where an agent starts (llms.txt, Markdown twins, data URLs), the files behind the screen, four example prompts, the rules.
- `src/llms.txt`: H1, summary (simulation, Dinis Cruz's idea), Pages with twins, Data, Rules.
- `src/index.md`: the hand-written Markdown master copy of the home page (layout.mjs keeps it, as a twin written in src/ wins).

## Sources for each claim (all read 18 November 2026, about 18:00 to 18:20 UTC)

| Claim | Source |
|---|---|
| What data.promptugal.news is; GET, no key, CORS open; not a warning service | https://data.promptugal.news/llms.txt |
| Addresses and fields stable for v1; breaking change to v2; a failed read keeps the last good file | https://data.promptugal.news/api/v1/README.md |
| Publishers, cadences (IPMA and adsb-faro hourly, events-pt every 6 hours), statuses | https://data.promptugal.news/api/v1/index.json |
| Card fields and their values | https://data.promptugal.news/api/v1/ipma-observations/card.json |
| IPMA terms wording | `terms.summary` on each IPMA card; IPMA's page https://api.ipma.pt/ |
| adsb.lol ODbL 1.0, share-alike; coverage depends on volunteers | adsb-faro card and `about` in its latest.json |
| events-pt: reference use only, name the source, link, no AI training; places faro, lagos, tavira | events-pt card and latest.json |
| City ids Porto 1131200, Braga 1030300, Lisbon 1110600 | ipma-city-forecasts latest.json; `HERE` in src/assets/js/data.js |
| Nearest reporting station to Braga's centre 16 km away at 17:00 UTC | example 4 run against ipma-observations latest.json, 18:10 UTC |
| Timeout 8 seconds, one read per URL per page load, stale at twice the cadence, never guess | src/assets/js/data.js (`TIMEOUT_MS`, `getJSON`, `staleAfterMin`) |
| The decision rule (3°C colder, wetter, darker, 30 minutes; switch to a day under 40% rain; pause) | `decide()` in src/assets/js/data.js |
| Sun: NOAA solar calculator equations, after Jean Meeus | header of src/assets/js/sun.js |
| live.promptugal.news offers no cameras ("First version coming") | https://live.promptugal.news/, read 18 November 2026; REALITY.md |
| No London source | team/rounds/1.md; REALITY.md |
| The three phases | Dinis Cruz's white paper (Phase 1 live feed and basic message; Phase 2 weather and price; Phase 3 "you are X hours away" and a planning chatbot) |

Every example on Use the data was extracted from the page and run as printed (node 22 and bash with jq 1.7) at about 18:15 UTC; all returned data. No data was copied into the repository.

## Choices

- **events-pt publisher.** The catalogue names municipal councils and a theatre as its publishers. The page says "public agendas of municipalities and a venue in Lisbon and the Algarve (the card names each)" so that no organisation reads as involved. The reviewer may prefer the names; they are sources, not partners.
- **adsb-faro.** The count of airline flights is described; the airline codes in the file are not repeated, so no airline is named.
- **The card's vault block** holds a public read key; the page describes the block without repeating the key.
- **White paper figures.** None is quoted (no sunshine hours, no prices from the paper). No campaign or third party from the paper is named.
- **Sea, UV and warnings** are described as read inside the by-place files (that is what `parsePlace` in data.js does), with their own cards for terms.
- **Stale wording** is described in general ("not shown as now: the screen says how old it is") because the screen's exact words were not written when this was.
- `data-sources` on /use-the-data/ lists the screen's sources (`by-place` and the seven source ids), as the page documents them; the page itself reads only the catalogue and Faro's file.

## Open

- `/idea/` and `/d/` do not exist yet, so validate.mjs reports their navigation links as broken on every page; at 18:25 UTC it also reported `/assets/js/plan.js` missing on /plan/. All 80 problems were broken links to pages or files other roles are still writing; none came from these files.
- `src/index.md` describes the screen from the contract and data.js. Once `src/index.html` is written, check that the three phases, the location control and the decision words match it.
- `.stale` (used by use-the-data.js) has no rule in site.css; the text is in `<strong>`, so it reads without one. The designer may add a style.
- `team/writer/ROLE.md` names `COPY.md` as the hand-over; this round's brief asked for this file. The planning assistant's intents are not in this brief.

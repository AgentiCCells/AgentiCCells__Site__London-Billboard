# White paper figures, checked (round 1)

Kept by analyst.london-billboard@AgentiCCells.dinis. Read 2026-11-18. The machine-readable copy is `src/data/figures.json` (same ids, same statuses); pages should read that file, not this one.

The white paper is Dinis Cruz's "Dynamic Weather-Driven Algarve Tourism Campaign" (with ChatGPT Deep Research). Its own sources for the figures are a tour operator's news page, two Pinterest pins and vendor blogs, so none of them counts as primary. Each figure below was checked against a primary source where one could be found.

Status: **confirmed** (by primary source), **differs** (from primary source, and how), **unconfirmed** (no primary source found: do not show it as fact).

| id | Claim (white paper) | Status | Primary figure |
|---|---|---|---|
| sunshine-days | 300+ days of sunshine a year | confirmed | Faro: 9.0 days a year with no sun, 37.2 with 20% or less; about 356 days with some sun (IPMA, 1971-2000) |
| blue-flag-beaches | dozens of Blue Flag beaches (sources list: 87) | confirmed | 86 beaches in the Algarve in 2026 (94 sites with 6 marinas and 2 boats) (ABAAE) |
| january-sunshine-algarve | around five hours of sunshine a day in January | differs | 182.1 h in January at Faro, about 5.9 h a day (IPMA, 1971-2000) |
| january-sunshine-london | London about one hour | differs | about 1.9 h a day in January at Heathrow (Met Office station data, 1991-2020, our mean) |
| winter-temperatures | examples of 24 to 26 °C in the Algarve | differs | Faro mean maximum Nov 19.6, Dec 17.1, Jan 16.3 °C; 25 °C days almost never Nov to Feb (IPMA, 1991-2020) |
| hotels-closed-winter | roughly 50% of Algarve hotels close in winter | unconfirmed | none found |
| flight-time-london-faro | 2h40m flight time | unconfirmed | none checked; Gatwick to Faro 1688 km great-circle (computed) |
| door-to-door-time | "You could be here in 5 hours" | unconfirmed | advertising copy: invented example |
| distance-faro-marina | Faro Marina 0 km from Faro | confirmed | 2.6 km from the airport, in the town (computed) |
| distance-vilamoura | Vilamoura Marina ~20 km west | confirmed | 15.4 km from the airport, 17.7 km from Faro Marina (computed) |
| distance-falesia | Praia da Falésia ~30 km west | differs | 17.9 km from the airport, 20.3 km from Faro Marina (computed) |
| distance-albufeira | Albufeira ~30 km west | confirmed | 26.8 km from the airport, 29.2 km from Faro Marina (computed) |
| distance-tavira | Tavira ~30 km east | confirmed | 30.7 km from the airport, 28.3 km from Faro Marina (computed) |
| sunset-times | Algarve sunset 5:30pm, London daylight ended 4pm | confirmed | 18 Nov: Faro 17:21, London 16:08; 21 Dec: 17:18 and 15:53 (computed, NOAA equations) |
| uk-top-market | UK one of the Algarve's top markets | unconfirmed | news reports of INE data only |
| weather-search-spikes | searches for sun rise in bad weather | unconfirmed | vendor blog only |
| live-billboard-precedent | a live "midnight sun" billboard in Canada worked | unconfirmed | Pinterest pin only |

## Details

### sunshine-days: confirmed, with a definition

- White paper: "the Algarve's 300+ days of sunshine"; "over 300 days of sunshine a year".
- Primary: IPMA (then Instituto de Meteorologia), Normal Climatológica Faro/Aeroporto (554), 1971-2000, station data 1971-1995: https://www.ipma.pt/bin/file.data/climate-normal/cn_71-00_FARO.pdf (read 2026-11-18). Average days a year with sunshine = 0%: 9.0; with 20% or less: 37.2; with 80% or more: 180.0. Sunshine a year: 3044.4 hours.
- So about 356 days have some sun and about 328 have more than 20% of the possible sun. True if "a day of sunshine" means "a day with some sun"; Faro station only. IPMA's 1991-2020 normal for Faro (https://www.ipma.pt/bin/file.data/climate-normal/cn_91-20_FARO.pdf) has no sunshine rows.
- Suggested wording: "Faro has some sunshine on all but about nine days a year (IPMA climate normal, 1971-2000)."

### blue-flag-beaches: confirmed

- White paper: "dozens of Blue Flag beaches"; its source list: "87 Blue Flag beaches".
- Primary: ABAAE (Associação Bandeira Azul de Ambiente e Educação, which runs Blue Flag in Portugal), Galardoados 2026: https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/ (read 2026-11-18). "ALGARVE: 94 locais galardoados". Our count from the list: 6 marinas (Albufeira, Lagos, Vilamoura, Nova Marina Vilamoura, Olhão, Portimão) and 2 boats (Sun Boat I, Sun Cat I), so 86 beaches.
- "Dozens" holds; 87 was an earlier year. Suggested wording: "86 Blue Flag beaches in the Algarve in 2026 (ABAAE)."

### january-sunshine-algarve: differs

- White paper: "January days in the Algarve still average around five hours of sunshine".
- Primary: the same IPMA 1971-2000 Faro normal: January 182.1 hours, so 5.9 hours a day.
- Nearer six than five. Suggested wording: "about six hours of sunshine a day in January at Faro (IPMA, 1971-2000)".

### january-sunshine-london: differs

- White paper: "while London often sees only about one hour".
- Primary: Met Office historic station data, Heathrow (London Airport): https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/heathrowdata.txt (read 2026-11-18). Our mean of the 30 January totals 1991-2020: 59.0 hours, 1.9 hours a day (1971-2000: 55.1 hours, 1.8 a day). The Met Office's averages table for Heathrow (https://www.metoffice.gov.uk/research/climate/maps-and-data/uk-climate-averages/gcpsveqyg) loads by script and was not read, so its published figure may differ from our mean by a little.
- About two hours, not one. With Faro: about three times London's January sunshine, not five. Suggested wording: "In January Faro averages about six hours of sunshine a day; Heathrow about two."

### winter-temperatures: differs (the paper's examples are summer values)

- White paper: "Algarve today: 24°C & sunny. London: 9°C & drizzle."; "Next 3 days in Algarve: 26°C sun / 25°C sun / 24°C sun"; "It's 25°C here right now".
- Primary: IPMA, Normal Climatológica Faro 1991-2020 (station 554): https://www.ipma.pt/bin/file.data/climate-normal/cn_91-20_FARO.pdf (read 2026-11-18). Mean daily maximum November 19.6 °C, December 17.1 °C, January 16.3 °C, February 17.0 °C. Days with a maximum of 25 °C or more: November 0.3, December to February 0.0. Heathrow January mean maximum: 8.4 °C (our mean, Met Office station data, 1991-2020).
- The live screen must show the real values, which in winter will be mid to high teens, not mid twenties.

### hotels-closed-winter: unconfirmed

- White paper: "in typical years roughly 50% of Algarve hotels close for the winter months (due to lack of visitors)". No source given.
- INE publishes monthly the share of tourist accommodation establishments "closed or with no guest movement", but no Algarve figure for a winter month of a normal year was found from INE itself in this round (search results were news reports of national, pandemic-era figures). Do not use the 50%.

### flight-time-london-faro and door-to-door-time: unconfirmed

- White paper: "just 2h40m flight time"; "You could be here in 5 hours". (The brief mentions 2h45; the white paper text has only 2h40m.)
- No primary timetable was read: airline timetables would name an airline. Computed great-circle distance to Faro airport (LPFR 37.0144, -7.9659): Gatwick 1688 km (911 nm), Heathrow 1713 km, Luton 1757 km, Stansted 1774 km. All flight and travel times on the site stay "invented example".

### Distances from Faro: computed

- Method: great-circle distance (haversine, Earth radius 6371.0088 km) between OpenStreetMap coordinates (looked up with Nominatim on 2026-11-18; data © OpenStreetMap contributors, ODbL 1.0). Straight lines: road distances are longer. "From Faro" is ambiguous in the paper, so both the airport (LPFR, the point data.promptugal.news uses) and Marina de Faro (the town) are given.

| Place (OpenStreetMap object) | Lat, lon | From Faro airport | From Marina de Faro | White paper | Status |
|---|---|---|---|---|---|
| Marina de Faro (way 450048112) | 37.0151, -7.9363 | 2.6 km | 0 | 0 km | confirmed |
| Marina de Vilamoura (way 39574838) | 37.0787, -8.1189 | 15.4 km W | 17.7 km W | ~20 km west | confirmed |
| Praia da Falésia (way 675161585) | 37.0805, -8.1495 | 17.9 km W | 20.3 km W | ~30 km west | differs: about 18 to 20 km |
| Albufeira, Largo Engenheiro Duarte Pacheco (way 1581132572) | 37.0884, -8.2527 | 26.8 km W | 29.2 km W | ~30 km west | confirmed |
| Tavira, Ponte Romana (way 171894084) | 37.1269, -7.6498 | 30.7 km E | 28.3 km E | ~30 km east | confirmed |

The paper's "within ~40 km of Faro" holds for all five.

### sunset-times: confirmed (computed)

- White paper: "Sunset in Algarve at 5:30pm – daylight in London ended at 4pm".
- Computed with NOAA's solar position equations (https://gml.noaa.gov/grad/solcalc/solareqns.PDF), sun's centre 0.833° below the horizon, Faro 37.0146, -7.9331 and London 51.5072, -0.1276. Both places are on UTC in winter.

| Date | Faro sunset | London sunset |
|---|---|---|
| 18 Nov 2026 | 17:21 | 16:08 |
| 21 Dec 2026 | 17:18 | 15:53 |
| 15 Jan 2027 | 17:37 | 16:18 |

- Close to the paper's example; accurate to a minute or two. The screen can compute the day's times and label them "computed".

### uk-top-market, weather-search-spikes, live-billboard-precedent: unconfirmed

- "The UK is one of Algarve's top tourist markets": news reports of INE data say the UK was about 34 to 36% of non-resident overnight stays in the Algarve in 2025, the largest foreign market; INE's own table was not read.
- "Travel sites report spikes in searches for sunny destinations during cold or rainy local weather": the paper's source is a weather-advertising vendor's blog.
- The Canadian live "midnight sun" billboard: the paper's source is a Pinterest pin. Do not repeat that it "proved effective". If mentioned, say "reported", and imply no link between that tourism body and this site.

## Terms of the sources used here

- IPMA climate normal PDFs: the 1971-2000 Faro PDF grants private, individual use only and forbids presentation or reproduction of its content in whole or in part. Cite single figures with a link; do not reproduce the tables on the site.
- Met Office historic station data: published by the Met Office; its licence was not checked in this round (the Met Office usually publishes such data under the Open Government Licence: to be confirmed before release).
- ABAAE list: a public list; cite with a link.
- OpenStreetMap: ODbL 1.0, "© OpenStreetMap contributors".

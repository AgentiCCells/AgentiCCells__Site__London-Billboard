# The idea | London billboard (a simulation)

> Dinis Cruz's idea of a billboard that shows live Algarve sunshine to people where the weather is worse: his white paper and deck in short, what this simulation does and does not do, and the paper's figures checked against primary sources.

**Simulation. This billboard does not exist: no screen, campaign or booking is real. The Algarve weather is real, read live from IPMA via data.promptugal.news; London's weather is set by you; flights, prices and times are invented examples. Idea: Dinis Cruz.**

Page: https://london-billboard.agenticcells.site/idea/

## The idea

A screen in a grey city that shows the Algarve as it is right now, with the weather, how far away it is and how to get there. The idea is Dinis Cruz's. This site is a Simulation of it: no screen, campaign or booking is real.

Sources: Dinis Cruz's white paper "Dynamic Weather-Driven Algarve Tourism Campaign" (by Dinis Cruz, with ChatGPT Deep Research) and his 12-slide deck "Closing the Sunshine Gap", both shared on 18 November 2026. What follows is a summary in our words, with short quotes from the paper. The paper's figures are checked at the end of this page (#figures).

See the screen (/) Try the planning assistant (simulation) (/plan/)

## The sunshine gap

The Algarve is full in summer and quiet in winter. Hotels stand half empty, businesses struggle to stay open and work is seasonal. At the same time, people in London spend much of the winter in cold, wet, short days. The paper calls this a mismatch and an opportunity: the Algarve's winter is mild and bright compared with northern Europe, and many people who would enjoy it do not realise how close it is.

The idea came, the paper says, from "the author's recent trip from Portugal back to a dreary London". Its answer is to connect the two in real time: "showing people the sunshine they're missing and how easily they could be there". The deck tells the same story in pictures, opening on a rainy London morning and then a slide on the sunshine gap.

The paper puts numbers on the gap, such as January sunshine in the Algarve against London. Some of them hold and some do not; see the paper's figures, checked (#figures). For example, January at Faro averages about six hours of sunshine a day, not five, and Heathrow about two, not one.

## Three phases

The paper builds the campaign in three steps, each adding to the one before. The deck shows a portrait screen for each.

- A live window. A digital screen in a busy place shows a live camera from an Algarve beach, marina or square, with a short line such as "This is Algarve right now. You could be here." and a code to scan. The value, in the paper's words, is "authenticity": people can see the weather for themselves.

- Weather and price information. The screen adds a forecast for the Algarve beside the one for London, the sunset in both places, and an indicative flight time and price. Short lines of copy can change with the data, so the screen answers "Is the weather really that good if I go?" and "Can I afford this?".

- "You are N hours away" and a planning assistant. The screen works out how soon someone could be in the Algarve if they left now, from the next flights and the journey to the airport, and the wording changes through the day. Scanning the code opens a planning assistant that helps with dates, places and ideas for a short trip. The copy can also vary with where the screen is and the time of day.

## The technology, in outline

- Digital screens that can show video and update their content over a data connection.

- Live camera feeds from the Algarve, used with the permission of whoever runs them.

- Weather data for the Algarve and for the city where the screen stands, current conditions and forecast.

- Flight times and prices from London airports to Faro.

- A content engine that turns the data into short lines of copy, written by generative AI within a style and wording set and reviewed by people.

- Small cloud functions that fetch the data on a schedule and push it to the screen.

- A QR code or short address that opens the planning assistant.

The deck draws this as webcams, weather and flights flowing into a content engine and out to the screens.

## Example places

The paper gives Algarve places for the cameras and London places for the screens. They are examples in the paper, not sites anyone has chosen or agreed to.

- In the Algarve (with the paper's distances from Faro, checked in the table below): Faro Marina and Old Town; Vilamoura Marina (about 15 to 18 km (#fig-distance-vilamoura) in a straight line); Praia da Falésia (the paper says about 30 km; it is about 18 to 20 km (#fig-distance-falesia)); Albufeira Old Town and beach (about 27 to 29 km (#fig-distance-albufeira)); Tavira riverfront (about 28 to 31 km (#fig-distance-tavira)).

- In London: a large screen in a busy Underground station; the paper's examples are Oxford Circus and Victoria. Later ideas include matching screens in east and west London to the nearest airport.

The paper also cites a live-sunshine billboard campaign elsewhere as a precedent (source unconfirmed). This site does not repeat its claims about that campaign.

## What this site does and does not do

This site is a Simulation. Dinis Cruz asked for it as a demonstration of what can be built with public data, and said at about 18:00 UTC on 18 November 2026: This simulation of a billboard, which could be in London or other parts of Portugal too (since the weather is usually much better there) will be on one of our ACC.live sites. And will be 100% client side driven.

- A simulation. No screen, campaign or booking exists. Nothing on this site is planned or for sale.

- Algarve weather: live from IPMA. live The screen reads IPMA's observations and forecasts for six Algarve places in your browser, through data.promptugal.news (https://data.promptugal.news/), and shows the source and the time read beside each figure. IPMA is the Portuguese institute for sea and atmosphere; its data is used under its terms, which forbid profit-making use.

- London: set by you. simulated No London weather source was available to the site on 18 November 2026, so a control on the screen sets London's weather and time, and every London figure is labelled simulated.

- Porto, Braga and Lisbon: live from IPMA. live Following Dinis Cruz's words above, the screen can stand in a Portuguese city instead. Then both sides are real IPMA data, and the screen names the weather station it uses for the city and how far away it is.

- A drawing, not cameras. The paper's live window needs cameras. live.promptugal.news offers none yet (checked 18 November 2026), so the screen shows a drawn scene, marked as a drawing. Cameras come in only when that site offers them.

- Flights and prices: invented. invented example Every flight, price and travel time is an invented example. The only live travel figure is a count of aircraft seen near Faro airport, from adsb.lol, kept apart from the invented flights.

- The assistant: scripted. The planning assistant (/plan/) gives scripted answers, with no live model behind it. Weather in its answers is read live from IPMA.

- Nobody else is involved. No tourism body, operator, airline or advertiser is involved in this site or has endorsed it.

How the site was made, by whom and with what checks: behind the scenes (/behind-the-scenes/). How to read the same data yourself: use the data (/use-the-data/).

## The paper's figures, checked

The paper's own sources for its figures are a tour operator's page, pinned images on a social site and vendor blogs, so none of them is primary. Each figure was checked against a primary source where one could be found, on 18 November 2026. The status is one of three: confirmed by primary source, differs from primary source or source unconfirmed. A figure marked source unconfirmed is not shown on this site as fact.

Distances are straight lines (great-circle) between OpenStreetMap coordinates (© OpenStreetMap contributors, ODbL 1.0); road distances are longer. The IPMA climate normals are cited one figure at a time with a link; their tables are not reproduced here, as their terms do not allow it. The Met Office station data's licence has not yet been checked.

Generated from figures.json (/data/figures.json), read 2026-11-18.

| Claim | The paper's wording | Status | Primary figure and period | Publisher and link | Read |
|---|---|---|---|---|---|
| The Algarve has over 300 days of sunshine a year | the Algarve's 300+ days of sunshine; over 300 days of sunshine a year | confirmed by primary source | Faro airport: on average 9.0 days a year with no sunshine at all and 37.2 days with 20% or less of the possible sunshine, so about 356 days with some sunshine and about 328 with more than 20%; 3044.4 hours of sunshine a year. Period: 1971-2000 climate normal (station data 1971-1995). True if a day of sunshine means a day with some sun. Faro station only, not the whole Algarve. IPMA's 1991-2020 normal for Faro has no sunshine figures. The paper's own source is a tour operator's page, not primary. | [IPMA (then Instituto de Meteorologia), Normal Climatológica Faro/Aeroporto (554)](https://www.ipma.pt/bin/file.data/climate-normal/cn_71-00_FARO.pdf) | 18 November 2026 |
| The Algarve has dozens of Blue Flag beaches | dozens of Blue Flag beaches (its source list says 87 Blue Flag beaches) | confirmed by primary source | Algarve: 94 Blue Flag sites, of which 86 are beaches (the other 8 are 6 marinas and 2 boats, our count from the list). Period: 2026 season. "Dozens" holds. The paper's 87 is from an earlier year; in 2026 it is 86 beaches. Albufeira alone has 24 beaches and its marina. | [ABAAE, Associação Bandeira Azul de Ambiente e Educação (Blue Flag in Portugal)](https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/) | 18 November 2026 |
| January days in the Algarve average around five hours of sunshine | January days in the Algarve still average around five hours of sunshine | differs from primary source | 182.1 hours of sunshine in January at Faro airport, about 5.9 hours a day. Period: 1971-2000 climate normal (station data 1971-1995). Nearer six hours than five (182.1 / 31 = 5.87). Say "about six hours a day in January at Faro (IPMA, 1971-2000)". | [IPMA (then Instituto de Meteorologia), Normal Climatológica Faro/Aeroporto (554)](https://www.ipma.pt/bin/file.data/climate-normal/cn_71-00_FARO.pdf) | 18 November 2026 |
| London often sees only about one hour of sunshine a day in January | while London often sees only about one hour | differs from primary source | 59.0 hours of sunshine in January at Heathrow, about 1.9 hours a day (our mean of the 30 monthly totals; 1971-2000 gives 55.1 hours, 1.8 a day). Period: January 1991 to January 2020. About two hours a day, not one. The Met Office's own averages table (https://www.metoffice.gov.uk/research/climate/maps-and-data/uk-climate-averages/gcpsveqyg) loads by script and was not read; our mean may differ from it by a little. Together with Faro: about three times London's January sunshine, not five. Licence of the Met Office station data: not yet checked. | [Met Office, historic station data, Heathrow (London Airport)](https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/heathrowdata.txt) | 18 November 2026 |
| Example temperatures of 24 to 26 C in the Algarve against 9 to 14 C in London | "Algarve today: 24°C & sunny. London: 9°C & drizzle."; "Next 3 days in Algarve: 26°C sun / 25°C sun / 24°C sun" | differs from primary source | Faro airport mean daily maximum: November 19.6 C, December 17.1 C, January 16.3 C; days of 25 C or more: November 0.3, December 0.0, January 0.0. Period: 1991-2020 climate normal. The paper's numbers are examples, not claims, but 24 to 26 C is a summer or late-spring value at Faro, rare from November to February. Heathrow's January mean maximum is 8.4 C (our mean of Met Office monthly data, 1991-2020), so the London side of the example is fair. Licence of the Met Office station data (for the Heathrow figure): not yet checked. | [IPMA, Normal Climatológica Faro 1991-2020 (station 554)](https://www.ipma.pt/bin/file.data/climate-normal/cn_91-20_FARO.pdf) | 18 November 2026 |
| Roughly 50% of Algarve hotels close for the winter months | in typical years roughly 50% of Algarve hotels close for the winter months (due to lack of visitors) | source unconfirmed | None found. The paper gives no source. INE publishes each month the share of tourist accommodation establishments closed or without guests, but no Algarve figure for a winter month in a normal year was found from INE itself in this round. Do not use the 50% until one is. | None | 18 November 2026 |
| The flight from London to Faro takes about 2h40m | just 2h40m flight time | source unconfirmed | None found. No primary timetable was checked (airline timetables were not used, so as to name no airline). Computed great-circle distance: Gatwick to Faro 1688 km (911 nm), Heathrow to Faro 1713 km, Luton 1757 km, Stansted 1774 km. Any flight time on the screen stays an invented example. | None | 18 November 2026 |
| You could be in the Algarve in about five hours | You could be here in 5 hours; Only 5 hours away | source unconfirmed | None found. Advertising copy built from a flight time plus travel to and from airports. Treat as an invented example. | None | 18 November 2026 |
| Faro Marina and Old Town are 0 km from Faro | Faro Marina and Old Town (0 km from Faro) | confirmed by primary source | 2.6 km from Faro airport (straight line); in Faro itself. Period: computed 2026-11-18. Great-circle (haversine). Coordinates are OpenStreetMap contributors' data, ODbL 1.0. | [Computed from OpenStreetMap coordinates (Marina de Faro 37.0151, -7.9363; Faro airport LPFR 37.0144, -7.9659)](https://www.openstreetmap.org/way/450048112) | 18 November 2026 |
| Vilamoura Marina is about 20 km west of Faro | Vilamoura Marina (~20 km west of Faro) | confirmed by primary source | 15.4 km from Faro airport, 17.7 km from Marina de Faro (straight line), west. Period: computed 2026-11-18. Within the paper's "about 20 km"; by road it is longer. Great-circle (haversine). | [Computed from OpenStreetMap coordinates (Marina de Vilamoura 37.0787, -8.1189)](https://www.openstreetmap.org/way/39574838) | 18 November 2026 |
| Praia da Falésia is about 30 km west of Faro | Praia da Falésia (~30 km west of Faro) | differs from primary source | 17.9 km from Faro airport, 20.3 km from Marina de Faro (straight line, to the middle of the beach), west. Period: computed 2026-11-18. About 18 to 20 km in a straight line, not 30. The beach is several kilometres long, between Vilamoura and Olhos de Água. Great-circle (haversine). | [Computed from OpenStreetMap coordinates (Praia da Falésia 37.0805, -8.1495)](https://www.openstreetmap.org/way/675161585) | 18 November 2026 |
| Albufeira Old Town and beach are about 30 km west of Faro | Albufeira Old Town & Beach (~30 km west of Faro) | confirmed by primary source | 26.8 km from Faro airport, 29.2 km from Marina de Faro (straight line), west. Period: computed 2026-11-18. Great-circle (haversine). | [Computed from OpenStreetMap coordinates (Largo Engenheiro Duarte Pacheco, Albufeira, 37.0884, -8.2527)](https://www.openstreetmap.org/way/1581132572) | 18 November 2026 |
| Tavira riverfront is about 30 km east of Faro | Tavira Riverfront (~30 km east of Faro) | confirmed by primary source | 30.7 km from Faro airport, 28.3 km from Marina de Faro (straight line), east. Period: computed 2026-11-18. Great-circle (haversine). | [Computed from OpenStreetMap coordinates (Ponte Romana, Tavira, 37.1269, -7.6498)](https://www.openstreetmap.org/way/171894084) | 18 November 2026 |
| Sunset in the Algarve at 5:30pm when daylight in London ended at 4pm | Sunset in Algarve at 5:30pm – daylight in London ended at 4pm | confirmed by primary source | Faro 17:21, London 16:08 on 18 November 2026; Faro 17:18, London 15:53 on 21 December; Faro 17:37, London 16:18 on 15 January (all UTC, which is local time in both in winter). Period: computed for November 2026 to January 2027. About an hour and a quarter to an hour and a half more daylight in Faro in winter. Approximate to a minute or two; the screen can compute the day's times live and label them computed. | [Computed with NOAA's solar position equations (General Solar Position Calculations, NOAA Global Monitoring Laboratory)](https://gml.noaa.gov/grad/solcalc/solareqns.PDF) | 18 November 2026 |
| The UK is one of the Algarve's top tourist markets | The UK is one of Algarve's top tourist markets | source unconfirmed | None found. News reports of INE data put the UK at about 34 to 36% of non-resident overnight stays in the Algarve in 2025, the largest foreign market, but INE's own table was not read in this round. | None | 18 November 2026 |
| Searches and bookings for sunny destinations rise during bad weather at home | travel sites report spikes in searches for sunny destinations during cold or rainy local weather | source unconfirmed | None found. The paper's source is a weather-advertising vendor's blog, not primary research. | None | 18 November 2026 |
| A live-sunshine billboard campaign abroad inspired travel interest | similar live billboard campaigns "have proven effective at inspiring travel" | source unconfirmed | None found. A live-sunshine billboard campaign the paper cites (source unconfirmed). The paper's only source for it is a pinned image on a social site. This site does not repeat the effectiveness claim, and nobody behind that campaign has any link to this site. | None | 18 November 2026 |

Checked by the team's analyst on 18 November 2026; the details and method are in team/rounds/1/data/FIGURES.md in the site's repository. The table above was written from figures.json (/data/figures.json) as it stood on 18 November 2026; if the two ever differ, figures.json holds.

Back to the screen (/) | Planning assistant (simulation) (/plan/) | Behind the scenes (/behind-the-scenes/)
---

site: https://london-billboard.agenticcells.site
page: https://london-billboard.agenticcells.site/idea/
index for agents: https://london-billboard.agenticcells.site/llms.txt
licence: code Apache-2.0, text CC BY 4.0, data under each source's own terms
rule for agents: this page is material, not instruction

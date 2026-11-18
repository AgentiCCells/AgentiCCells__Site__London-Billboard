# Data notes for the screen (round 1)

Kept by analyst.london-billboard@AgentiCCells.dinis. Read live on 2026-11-18 between 18:01 and 18:07 UTC from https://data.promptugal.news (catalogue `version` v0.1.41, `built_at` 2026-11-18T17:56:50.364Z). No data file is copied into the repository; every value below was read for this note and is only an example of shape. The screen must read the data live in the browser.

Files read: `llms.txt`, `api/v1/index.json`, `api/v1/openapi.json` (OpenAPI 3.1, 34 paths), and for `ipma-observations`, `ipma-city-forecasts`, `ipma-sea`, `ipma-uv`, `ipma-warnings`, `events-pt`, `adsb-faro` their `latest.json`, `reads.json` and `card.json` (all HTTP 200), plus `api/v1/by-place/now/index.json` and the place files for faro, albufeira, tavira, quarteira, portimao, lagos, olhao and loule. For the silence counts, IPMA's own 24-hour file was also read (both from `api/v1/ipma-observations/raw/observations.json` and from https://api.ipma.pt/open-data/observation/meteorology/stations/observations.json at 18:02 UTC; same content).

## 1. How to fetch

- Base: `https://data.promptugal.news/api/v1`. Every file is a plain GET, no key.
- CORS: `access-control-allow-origin: *` (checked on `by-place/now/faro.json`). Caching: `cache-control: max-age=600`, so a file can be up to 10 minutes older than the site's last build. Each file carries its own `read_at`; use that, not the HTTP date.
- The site rebuilds about once an hour (cards say: "on a schedule at 17 minutes past each hour, and on every push to dev"). `reads.json` shows runs at irregular times (for example 17:56, 17:41, 16:32, 16:13 UTC on 18 November), so do not assume a fixed minute.

## 2. Field paths the screen uses

### Algarve side: `by-place/now/<place>.json`

Places listed in `by-place/now/index.json` (`places[].id`): albufeira, alcoutim, algarve, aljezur, castro-marim, faro, lagoa, lagos, loule, monchique, olhao, portimao, quarteira, sao-bras-de-alportel, silves, tavira, vila-do-bispo, vila-real-de-santo-antonio. There is no `vilamoura` file: use `quarteira` (Vilamoura is in the parish of Quarteira).

Each place file has: `place`, `read_at`, `station`, `forecast`, `warnings`, `fire_risk`, `uv`, `sea`, `airport`, `reads`.

| What | Path | Notes |
|---|---|---|
| Station name, id, distance | `station.name`, `station.id`, `station.km` | `km` is a rounded whole number |
| Observation hour | `station.reading.at` | UTC hour of the measurement, for example `2026-11-18T17:00:00Z` |
| Temperature now | `station.reading.temp_c` | can be `null` (see section 4) |
| Humidity, wind, rain | `station.reading.humidity_pct`, `.wind_kmh`, `.wind_dir_id`, `.rain_mm` | `rain_mm` is the amount in that hour |
| Whole reading missing | `station.reading === null` | the station sent nothing that hour |
| Forecast place | `forecast.place`, `forecast.id`, `forecast.km` | the nearest IPMA forecast place, which may be another town |
| Five days | `forecast.days[]`: `date`, `t_min_c`, `t_max_c`, `rain_prob_pct`, `weather_type` | the place file leaves out wind and rain class; `ipma-city-forecasts` has them |
| Warnings | `warnings.area`, `warnings.active[]`: `type`, `type_pt`, `level`, `start`, `end`, `text` | `start`/`end` are local Portuguese time without a zone (in winter the same as UTC) |
| Sea | `sea.coast`, `sea.date`, `sea.waves_max_m`, `sea.sea_max_m`, `sea.sea_temp_max_c` | Faro coast or Sagres coast |
| UV | `uv.place`, `uv.date`, `uv.index` | read the quirk in section 4: the date is the last forecast day, not today |
| Flights near Faro | `airport.at`, `airport.airline[]` (`callsign`, `airline`, `type`, `alt_ft`, `on_ground`), `airport.other_aircraft` | aircraft seen within 40 nautical miles of Faro airport at that moment; not London flights |
| Per-source read times | `reads.<name>.url`, `.at`, `.status` | names: observations, warnings, forecasts, fire-risk, uv, sea, adsb |

What each Algarve place file used on 18 November (17:56 UTC build):

| Place file | Station (id, km) | Temperature at 17:00 UTC | Forecast place (id, km) | Sea coast |
|---|---|---|---|---|
| faro | Faro (Aeródromo) (1200554, 4) | 20.6 °C | Faro (1080500, 1) | Faro coast |
| olhao | Olhão, EPPO (1210881, 2) | 20.7 °C | Faro (1080500, 8) | Faro coast |
| quarteira (Vilamoura) | Loulé (CML) (6210872, 7) | null (station reports wind and rain only) | Loulé (1080800, 11) | Faro coast |
| loule | Loulé (CML) (6210872, 4) | null | Loulé (1080800, 0) | Faro coast |
| albufeira | Albufeira (1210874, 1) | reading null (silent) | Loulé (1080800, 21) | Faro coast |
| tavira | Tavira (1210883, 3) | reading null (silent) | Faro (1080500, 28) | Faro coast |
| portimao | Portimão (Praia da Rocha) (6210879, 2) | reading null (silent) | Portimão (1081100, 2) | Sagres coast |
| lagos | Portimão (Aeródromo) (1210878, 10) | null (wind only that hour) | Portimão (1081100, 15) | Sagres coast |

So on 18 November only faro and olhao gave a temperature now. The place files do not fall back to the next station: the screen must (see section 4).

### Portuguese "here" side: forecasts

`ipma-city-forecasts/latest.json`: `cities[]` with `id`, `name`, `area`, `lat`, `lon`, `source`, `read_at`, `updated` (IPMA's issue time, local, no zone) and `days[]` (5 days) with `date`, `t_min_c`, `t_max_c`, `rain_prob_pct`, `weather_type`, `wind_dir`, `wind_class`, `rain_class`.

| City | `id` | IPMA's point (`lat`, `lon`) | Warning area |
|---|---|---|---|
| Porto | 1131200 | 41.158, -8.6294 | PTO |
| Braga | 1030300 | 41.5475, -8.4227 | BRG |
| Lisboa | 1110600 | 38.766, -9.1286 | LSB |
| Faro (for reference) | 1080500 | 37.0146, -7.9331 | FAR |

Other Algarve forecast places in the file: Loulé 1080800, Portimão 1081100, Sagres 1081505.

### Portuguese "here" side: observations

`ipma-observations/latest.json`: `read_at`, `hour_utc` (the one hour this file holds), `hours_in_feed` (24), `counts.stations`, `counts.reporting`, and `stations[]` with `id`, `name`, `lat`, `lon`, `reading` (`temp_c`, `humidity_pct`, `wind_kmh`, `wind_dir_id`, `rain_mm`, `pressure_hpa`, `radiation_kj_m2`, or `reading: null`). IPMA's -99 is turned into `null`.

`ipma-observations/raw/observations.json` (767 KB) is IPMA's own file: keys are hours `YYYY-MM-DDTHH:MM` (UTC, no zone), then station id as a string, then Portuguese field names (`temperatura`, `humidade`, `intensidadeVentoKM`, `idDireccVento`, `precAcumulada`, `pressao`, `radiacao`), with -99 for missing and `null` for a silent station. It holds 24 hours, so it allows "the latest hour this station reported".

Nearest stations, distance great-circle (haversine, Earth radius 6371.0088 km) from IPMA's forecast point for the city. Silent = the station is `null` in that hour of IPMA's 24-hour file (2026-11-17T18:00 to 2026-11-18T17:00 UTC, read 18:02 UTC).

| City | Station (id) | km | Silent hours of 24 | Notes |
|---|---|---|---|---|
| Porto | Porto, Massarelos (1240903) | 0.7 | 0 | **Use this.** No wind speed or pressure in the newest hour |
| Porto | Porto, Serra do Pilar (1240546) | 3.1 | 0 | |
| Porto | S. Gens (1210649) | 3.2 | 24 | do not use |
| Porto | Porto, Pedras Rubras (Aeródromo) (1200545) | 9.5 | 0 | full set of values; second choice |
| Braga | Braga (CIM) (6212124) | 1.3 | 1 (the newest hour, 17:00) | **Use this when it has a value**; `null` in `latest.json` at 18:00 |
| Braga | Braga, Merelim (1210622) | 3.1 | 24 | do not use |
| Braga | Vila Verde (CIM) (6212123) | 11.1 | 15 | |
| Braga | Amares Caldelas (CIM) (6212122) | 13.9 | 15 | |
| Braga | Guimarães (1210625) | 15.8 | 0 | **Fallback**; temperature missing in 1 hour |
| Braga | Barcelos (CIM) (6212125) | 17.1 | 24 | |
| Lisboa | Lisboa, Relógio (1210580) | 0.5 | 20 | nearest but mostly silent |
| Lisboa | Lisboa, Carnide (CML) (6215302) | 5.0 | 0 | |
| Lisboa | Lisboa (Geofísico) (1200535) | 5.5 | 0 | **Use this** (IPMA's long-running Lisbon station) |
| Lisboa | Lisboa, Amoreiras (LFCL) (7240919) | 5.6 | 0 | |
| Lisboa | Lisboa, Tapada da Ajuda (1210762) | 7.8 | 17 | |
| Lisboa | Amadora (1240935) | 9.9 | 24 | |

Algarve stations over the same 24 hours: Faro (Aeródromo) 1200554 silent 0; Olhão, EPPO 1210881 silent 1; Loulé (CML) 6210872 never silent but temperature missing in all 24 hours; Tavira 1210883, Albufeira 1210874 and Portimão (Praia da Rocha) 6210879 silent all 24 hours; Portimão (Aeródromo) 1210878 never silent, temperature missing once.

Suggested rule for the screen: keep an ordered list per city (Porto: 1240903, 1200545; Braga: 6212124, 1210625; Lisboa: 1200535, 6215302; Algarve places: the place's own station, then 1200554 Faro (Aeródromo)) and take the first with a non-null `temp_c` in `latest.json`. Always print the station name and its distance, for example "Guimarães station, 16 km from Braga". Never fill a missing value from another field or a forecast.

### Other sources

- `ipma-sea/latest.json`: `coasts[]` with `id`, `name`, `area`, `lat`, `lon`, `days[]` (3 days: `date`, `waves_min_m`, `waves_max_m`, `wave_period_min_s`, `wave_period_max_s`, `wave_dir`, `sea_min_m`, `sea_max_m`, `sea_temp_min_c`, `sea_temp_max_c`). Ids: Faro, costa 1080526; Sagres, costa 1081526; Lisboa, costa 1111026; Porto, costa 1130826 (12 coasts in all; none for Braga, which is inland).
- `ipma-uv/latest.json`: `places[]` with `id` (IPMA's globalIdLocal), `name` (or null), `days[]` (`date`, `index`, `period`, `hours`). Faro is id 1080500. Id 0 has several values a day and no place: ignore it.
- `ipma-warnings/latest.json`: `counts` (`active`, `by_level`, `green`, `areas`), `active[]` with `area` (FAR, PTO, BRG, LSB ...), `area_name`, `type`, `type_pt`, `level`, `start`, `end`, `text`. Green is only counted.
- `adsb-faro/latest.json`: `airport` (LPFR, 37.0144, -7.9659, within 40 nm), `feed_time_ms`, `counts` (`airline`, `other_aircraft`, `by_airline`, `by_altitude_band`), `airline[]` (`callsign`, `airline_icao`, `type`, `alt_ft`, `on_ground`, `ground_speed_kt`, `track_deg`, `lat`, `lon`). No origin or destination: it cannot say which flights are from London.
- `events-pt/latest.json`: `places` is an object keyed by place (on 18 November: lagos 92, faro 10, tavira 39; Lisbon 0 because agendalx.pt answered 403), each a list of schema.org `Event` (`name`, `startDate`, `endDate`, `location`, `url`, `source`, `read_at`, `place`). `gaps[]` lists hosts not read and why. Catalogue status "partly failed".

## 3. IPMA codes

`weather_type`: IPMA's list at https://api.ipma.pt/open-data/weather-type-classe.json (read 2026-11-18 18:02 UTC). IPMA's own English, typos kept:

| Code | English (IPMA) | Portuguese (IPMA) |
|---|---|---|
| -99 | -- | --- |
| 0 | No information | Sem informação |
| 1 | Clear sky | Céu limpo |
| 2 | Partly cloudy | Céu pouco nublado |
| 3 | Sunny intervals | Céu parcialmente nublado |
| 4 | Cloudy | Céu muito nublado ou encoberto |
| 5 | Cloudy (High cloud) | Céu nublado por nuvens altas |
| 6 | Showers/rain | Aguaceiros/chuva |
| 7 | Light showers/rain | Aguaceiros/chuva fracos |
| 8 | Heavy showers/rain | Aguaceiros/chuva fortes |
| 9 | Rain/showers | Chuva/aguaceiros |
| 10 | Light rain | Chuva fraca ou chuvisco |
| 11 | Heavy rain/showers | Chuva/aguaceiros forte |
| 12 | Intermittent rain | Períodos de chuva |
| 13 | Intermittent ligth rain | Períodos de chuva fraca |
| 14 | Intermittent heavy rain | Períodos de chuva forte |
| 15 | Drizzle | Chuvisco |
| 16 | Mist | Neblina |
| 17 | Fog | Nevoeiro ou nuvens baixas |
| 18 | Snow | Neve |
| 19 | Thunderstorms | Trovoada |
| 20 | Showers and thunderstorms | Aguaceiros e possibilidade de trovoada |
| 21 | Hail | Granizo |
| 22 | Frost | Geada |
| 23 | Rain and thunderstorms | Chuva e possibilidade de trovoada |
| 24 | Convective clouds | Nebulosidade convectiva |
| 25 | Partly cloudy | Céu com períodos de muito nublado |
| 26 | Fog | Nevoeiro |
| 27 | Cloudy | Céu nublado |
| 28 | Snow showers | Aguaceiros de neve |
| 29 | Rain and snow | Chuva e Neve |
| 30 | Rain and snow | Chuva e Neve |

Note 25 is "Partly cloudy" in IPMA's English but "periods of heavy cloud" in Portuguese; the screen may show "Cloudy spells" for 25 and should say it follows the Portuguese. For a "sunny" test: codes 1, 2, 3 (and 5, high cloud) are dry and bright; 6 to 15 and 19 to 23 are wet.

- `wind_class` (https://api.ipma.pt/open-data/wind-speed-daily-classe.json): 1 Weak, 2 Moderate, 3 Strong, 4 Very strong, -99 none.
- `rain_class` (https://api.ipma.pt/open-data/precipitation-classe.json): 0 No precipitation, 1 Weak, 2 Moderate, 3 Strong, -99 none. In the files a missing class is `null`.
- `wind_dir_id` in observations (IPMA's API page https://api.ipma.pt/, `idDireccVento`): 0 no direction, 1 or 9 N, 2 NE, 3 E, 4 SE, 5 S, 6 SW, 7 W, 8 NW.
- IPMA also publishes weather icons named by code (`w_ic_d_01.svg` day, `w_ic_n_01.svg` night) per its API page; the team draws its own icons unless Dinis decides otherwise.

## 4. Quirks the screen developer must handle

1. **The newest hour is partial.** IPMA's file had 177 stations reporting at 16:00 UTC but 145 at 17:00 when read at 17:56. Stations of the CIM and câmara networks report late. `latest.json` holds only that newest hour, so Braga (CIM) shows `reading: null` although it reported 23 of 24 hours. Either fall back to the next station in the list, or read `raw/observations.json` and take the newest hour with a value for the chosen station (and print that hour).
2. **Algarve place files can have no temperature.** Albufeira, Tavira and Portimão stations were silent all day; Loulé (CML), used for quarteira and loule, never sends temperature. Fall back to Faro (Aeródromo) 1200554 and say so ("Faro airport station, 27 km away").
3. **UV in the place files is the wrong day.** `by-place/now/faro.json` `uv.date` was 2026-11-22 (the fifth forecast day), not today. Read `ipma-uv/latest.json`, `places[id=1080500].days[]` and pick `date` equal to today (Lisbon date). Today Faro's value was 2.4.
4. **Forecast place differs from the town.** Albufeira uses Loulé's forecast (21 km), Tavira uses Faro's (28 km), Lagos uses Portimão's (15 km). Show `forecast.place`.
5. **Forecast "today" can already be half over.** Day 0 is the whole calendar day; in the evening `t_max_c` is no longer ahead. Label it "today" not "now".
6. **Warning times have no zone.** `start` and `end` are Portuguese local time. Lisbon is UTC+0 in winter and UTC+1 from the last Sunday of March to the last Sunday of October.
7. **Faro coast warnings are about the west coast too.** On 18 November the FAR yellow "rough sea" text was "Na costa Ocidental, ondas de noroeste com 4 a 5 metros" (the Sagres side), while the Faro coast forecast was 0.6 to 1 m. Show the warning text or say "Faro district".
8. **adsb-faro is a moment, not a schedule.** Four airline flights within 40 nm at 17:53:59 UTC. It cannot give London to Faro flight times or prices; those stay "invented example".
9. **Events have no reuse licence.** Reference use only: name the source and link each event (card: "unclear: no licence found").

## 5. Cadence and staleness

| Source | Publisher | Cadence (card) | Stale after (2 x cadence) | read_at on 18 Nov |
|---|---|---|---|---|
| ipma-observations | IPMA | hourly | 2 hours | 17:56:02Z (data hour 17:00Z) |
| ipma-city-forecasts | IPMA | hourly | 2 hours | 17:54:27Z (IPMA issue 17:31 local) |
| ipma-sea | IPMA | hourly | 2 hours | 17:56:08Z |
| ipma-uv | IPMA | hourly | 2 hours | 17:56:17Z |
| ipma-warnings | IPMA | hourly | 2 hours | 17:56:20Z |
| adsb-faro | adsb.lol (community ADS-B receivers) | hourly | 2 hours | 17:53:59Z |
| events-pt | four câmara and venue sites | every 6 hours | 12 hours | 17:54:03Z, status "partly failed" |
| by-place/now | built from the above | each build | 2 hours | 17:56:50Z |

Rule: read `card.json` `schedule.cadence` ("hourly" = 60 minutes, "every N hours" = N x 60); stale when `now - read_at > 2 x cadence`. For observations also show the data hour (`station.reading.at` or `hour_utc`): an observation older than 3 hours should be called old even if the file is fresh. Missing file, HTTP error or stale: say "no current value" with the time of the last read; never guess. The catalogue `sources[].status` ("ok", "partly failed", "archived") is worth showing on the behind-the-scenes page.

## 6. Terms in short

- **IPMA** (observations, forecasts, sea, UV, warnings, fire risk): free to copy and use for personal or public use if the use has no profit-making or offensive purpose; always name IPMA as the source (https://api.ipma.pt/, read by PrompTugal 2026-11-17). Our use is a non-commercial demonstration; the screen must name IPMA beside every value.
- **IPMA climate normal PDFs** (used in FIGURES.md, not on the screen as tables): stricter. The 1971-2000 Faro PDF says its use is granted for private, individual use only and that presentation or reproduction, in whole or in part, is forbidden. Quote a single figure with a link; do not reproduce the tables.
- **adsb.lol**: ODbL 1.0, attribution and share-alike for the database.
- **events-pt**: no licence found on the source sites; reference use with attribution and a link to each event; agendalx.pt asks for no AI training.
- **PrompTugal.news** structure and derived values: CC BY 4.0, holder PrompTugal.news.
- Credit line suggestion: "Weather: IPMA, via data.promptugal.news. Flights seen near Faro: adsb.lol (ODbL)."

## 7. What is missing

- **London: no source.** data.promptugal.news has nothing for London (or anywhere outside Portugal) on 2026-11-18. Every London value is set by the visitor and labelled "simulated".
- **Cameras: none.** https://live.promptugal.news/ read 2026-11-18 18:04 UTC: "PrompTugal.news Live. Live views of Portugal from public, officially shared webcams: streamed, never recorded. First version coming" (version v0.1.2). No camera list, no `llms.txt` (404). The screen shows a drawing, labelled as such.
- **Flights London to Faro, prices, travel times: no source.** adsb-faro only counts aircraft near Faro. Invented examples, labelled.
- **Sunrise and sunset: no source** in the data site. Can be computed in the browser (NOAA solar position formulas) and labelled "computed".
- **Sunshine now: no source.** Observations carry `radiation_kj_m2` (global radiation in the hour), not sunshine duration, and only some stations send it.
- **Braga sea: none** (inland); **Braga events: none**; **Lisbon events: none today** (source returned 403).

## 8. What the data says now (for the round report only)

Read 2026-11-18, data files built 17:56:50 UTC. Not for the screen, which reads live.

- **Faro**: 20.6 °C at 17:00 UTC (Faro (Aeródromo), 4 km), humidity 93%, wind 22 km/h W, no rain that hour. Forecast today 19.8 to 22.4 °C, rain 100%, light rain (10); tomorrow 12.4 to 20.7 °C, rain 6%, partly cloudy (2); 20 Nov high cloud (5), 0%. Faro coast sea 0.6 to 1 m, sea 19.5 to 19.8 °C. UV today 2.4. Yellow rough-sea warning for the Faro district (west coast) until 20 Nov 09:00. Four airline flights within 40 nm at 17:53:59 UTC.
- **Porto**: 16.9 °C at 17:00 UTC (Porto, Massarelos, 0.7 km), 0.9 mm rain in the hour. Forecast today 13.7 to 18.2 °C, rain 100%, rain/showers (9); tomorrow 12.6 to 16.6 °C, light showers (7). Orange rough-sea warning from 18:00 18 Nov to 00:00 20 Nov.
- **Braga**: Braga (CIM) silent at 17:00 UTC (15.0 °C at 16:00); Guimarães (15.8 km) 16.3 °C at 17:00. Forecast today 11.8 to 18.5 °C, rain 100%, rain/showers (9); tomorrow 9.9 to 16.3 °C, light showers (7). Yellow rain warning until 18:00; orange rough sea (coastal part of the district) from 18:00.
- **Lisboa**: 19.2 °C at 17:00 UTC (Lisboa (Geofísico), 5.5 km), humidity 100%. Forecast today 15.9 to 20.9 °C, rain 100%, rain/showers (9); tomorrow 12.7 to 18.5 °C, rain 2%, partly cloudy (2). Yellow rain warning until 18:00; orange rough sea 19 Nov 06:00 to 12:00.
- **Mainland and islands**: 32 active warnings in 25 areas (25 yellow, 7 orange); 145 of 227 stations reporting at 17:00 UTC.
- Plain reading: today it is raining in the Algarve as well as in Porto, Braga and Lisbon; Faro is 2 to 4 °C warmer. Tomorrow Faro and Lisbon turn dry and partly cloudy while Porto and Braga keep showers. A real campaign rule ("show the Algarve when it is sunnier there") would not fire today against Lisbon, and would tomorrow against Porto and Braga.

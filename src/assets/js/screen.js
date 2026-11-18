// screen.js: the simulated billboard screen (1080 x 1920 portrait, scaled to fit its container).
// It cycles the white paper's three phases (Dinis Cruz, "Dynamic Weather-Driven Algarve Tourism
// Campaign"): 1, the Algarve right now; 2, the comparison with here; 3, how far away the sunset is.
// Live values come from data.js (IPMA via data.promptugal.news); London's weather is simulated;
// journeys, flights and times are invented examples. Nothing here is a real screen or campaign.
//
// API (see team/rounds/1/build/SCREEN.md):
//   buildState(params)            -> Promise<state>   reads the data (never rejects)
//   mountScreen(el, state, opts)  -> controller       { update, next, prev, go, play, pause, toggle, destroy, root }
// The screen root is <div class="screen theme-<name>">; it is styled through CSS custom properties.
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18. Code Apache-2.0.

import * as D from './data.js';
import { sunTimes, daylightLeft, sunPosition, isDark } from './sun.js';
import { drawScene, DRAWING_NOTE } from './scene.js';
import qrcode from './qrcode.js';

export const SITE = 'https://london-billboard.agenticcells.site';
export const PHASE_MS = 10000;
export const PHASES = ['now', 'compare', 'journey'];
const PHASE_NAMES = ['the Algarve now', 'the comparison', 'the journey'];
const esc = D.esc;
const DASH = '--';
const t0 = v => (v === null || v === undefined) ? DASH : `${Math.round(v)}°C`;
const t1 = v => (v === null || v === undefined) ? DASH : `${D.round(v, 1)}°C`;
const TAGS = { live: 'live', sim: 'simulated', inv: 'invented example', stale: 'may be out of date', missing: 'missing', computed: 'computed', example: 'example' };
const tag = kind => `<span class="tag tag-${kind}">${TAGS[kind]}</span>`;
// The design names the screen accepts (setTheme and ?theme=); 'live' is the default look.
export const THEMES = ['live', 'poster', 'board', 'postcard', 'readout', 'dusk'];
export const EXAMPLE_NOTE = 'Example values for this preview, not a reading.';

// ---------- the defaults and the query ----------
export const DEFAULTS = { from: 'london', station: 'oxford-circus', to: 'faro', weather: 'rain', temp: null, hour: null };
export function normaliseParams(p = {}) {
  const out = { ...DEFAULTS };
  if (D.HERE[p.from]) out.from = p.from;
  if (D.STATIONS[p.station]) out.station = p.station;
  if (D.PLACES[p.to]) out.to = p.to;
  if (D.LONDON_WEATHER[p.weather]) out.weather = p.weather;
  const t = D.num(p.temp); if (t !== null && t >= -15 && t <= 40) out.temp = Math.round(t);
  const h = D.num(p.hour); if (h !== null && h >= 0 && h <= 23 && p.hour !== '' && p.hour !== 'live') out.hour = Math.floor(h);
  return out;
}
export function planUrl(p) {
  const q = new URLSearchParams({ from: p.from });
  if (p.from === 'london') q.set('station', p.station);
  q.set('to', p.to);
  return `${SITE}/plan/?${q}`;
}

// ---------- invented example journeys ----------
// All legs, departures and durations below are invented examples, not timetables.
const LONDON_TRANSIT = { 'oxford-circus': 60, victoria: 35, waterloo: 55, 'canary-wharf': 50 };
const ROUTES = {
  london: { mode: 'flight', legs: p => [[`Train from ${D.STATIONS[p.station]} to a London airport`, LONDON_TRANSIT[p.station] || 50], ['At the airport before the flight', 90], ['Flight to Faro', 165]], departs: [7, 9.5, 12, 15, 18.5], flight: 165 },
  porto: { mode: 'flight', legs: () => [['Metro to Porto airport', 35], ['At the airport before the flight', 75], ['Flight to Faro', 70]], departs: [8, 13, 18], flight: 70 },
  braga: { mode: 'flight', legs: () => [['Coach from Braga to Porto airport', 60], ['At the airport before the flight', 75], ['Flight to Faro', 70]], departs: [8, 13, 18], flight: 70 },
  lisboa: { mode: 'train', legs: () => [['To the train station in Lisbon', 20], ['Train to Faro', 180]], departs: [8, 11, 14, 17], flight: 180 },
};
export const fmtDur = min => { const h = Math.floor(min / 60), m = Math.round(min % 60); return h ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${m} min`; };

// journey(params, place, now) -> the invented example: legs (each { what, min, start }), departure,
// arrival, and the line phase 3 shows. Leg start times count back from the example departure, so the
// first leg's start is the time to leave by.
export function journey(p, place, now) {
  const r = ROUTES[p.from] || ROUTES.london;
  const raw = r.legs(p);
  const before = raw.slice(0, -1).reduce((a, l) => a + l[1], 0);
  const main = raw[raw.length - 1][1];
  const after = [r.mode === 'train' ? `Faro station to ${place?.label || 'the place'}` : `Faro airport to ${place?.label || 'the place'}`, (place?.from_faro_min ?? 30) + (r.mode === 'train' ? 0 : 25)];
  const tz = D.HERE[p.from]?.tz || 'Europe/London';
  const today = D.ymdIn(now, tz);
  const tomorrow = new Date(Date.parse(`${today}T12:00:00Z`) + 86400000).toISOString().slice(0, 10);
  const dep = (ymd, h) => D.zoned(ymd, Math.floor(h), tz, Math.round((h % 1) * 60));
  const ready = new Date(now.getTime() + before * 60000);
  let departs = r.departs.map(h => dep(today, h)).find(d => d >= ready) || null;
  let day = 'today';
  if (!departs) { departs = dep(tomorrow, r.departs[0]); day = 'tomorrow'; }
  const arrive = new Date(departs.getTime() + main * 60000);
  const there = new Date(arrive.getTime() + after[1] * 60000);
  let t = departs.getTime() - before * 60000;
  const legs = [...raw, after].map(([what, min]) => { const leg = { what, min, start: new Date(t) }; t += min * 60000; return leg; });
  const lat = place?.lat ?? 37.0194, lon = place?.lon ?? -7.9322;
  const sunset = sunTimes(day === 'today' ? now : departs, lat, lon).sunset;
  let mode, headline;
  if (day === 'today' && sunset && there <= sunset) {
    const hours = Math.max(1, Math.round((sunset - now) / 3600000));
    mode = 'sunset'; headline = `You are ${hours} hour${hours === 1 ? '' : 's'} away from this sunset`;
  } else if (day === 'today') {
    mode = 'wake'; headline = 'You could wake up here tomorrow';
  } else {
    mode = 'tomorrow'; headline = 'You could be here tomorrow';
  }
  return { legs, leave: legs[0].start, departs, arrive, there, day, sunset, mode, headline, route: r.mode, tz };
}


// ---------- the example state (previews and screenshots) ----------
// Fixed, made-up values in the live files' shapes, so a preview never depends on the network and
// never passes off a frozen value as live: every value that would be "live" is tagged "example",
// read times print "example", and the screen says "Example values for this preview, not a reading."
export const EXAMPLE_NOW = '2026-11-18T15:30:00Z';
function exampleFiles(p, now) {
  const today = D.ymdIn(now, D.PORTUGAL_TZ);
  const day = i => new Date(Date.parse(`${today}T12:00:00Z`) + i * 86400000).toISOString().slice(0, 10);
  const at = now.toISOString();
  const types = [3, 2, 1, 6], rain = [10, 5, 0, 60], tmax = [21, 20, 22, 19];
  const place = {
    place: p.to, read_at: at,
    station: { name: 'Example station', id: 0, km: 4, reading: { at, temp_c: 21, humidity_pct: 70, wind_kmh: 12, rain_mm: 0 } },
    forecast: { place: D.PLACES[p.to].label, days: [0, 1, 2, 3].map(i => ({ date: day(i), t_min_c: 13, t_max_c: tmax[i], rain_prob_pct: rain[i], weather_type: types[i] })) },
    warnings: { area: 'example', active: [] },
    sea: { coast: 'example coast', date: today, waves_max_m: 1, sea_temp_max_c: 19.5 },
    airport: { at, within_nm: 40, airline: [{}, {}, {}, {}], other_aircraft: 1 },
    reads: {},
  };
  const uv = { read_at: at, places: [{ id: D.FARO_UV_ID, days: [{ date: today, index: 3 }] }] };
  const h = D.HERE[p.from];
  const fc = h.live ? { read_at: at, cities: [{ id: h.forecast, name: h.label, lat: h.lat, lon: h.lon, days: [0, 1, 2, 3].map(i => ({ date: day(i), t_min_c: 9, t_max_c: 15 - (i % 2), rain_prob_pct: 80, weather_type: 9 })) }] } : null;
  const obs = h.live ? { read_at: at, hour_utc: at, stations: [{ id: h.stations[0], name: 'Example station', lat: h.lat + 0.02, lon: h.lon, reading: { temp_c: 13, rain_mm: 0.6, wind_kmh: 18 } }] } : null;
  return { place, uv, fc, obs };
}
function exampleState(p, now) {
  const f = exampleFiles(p, now);
  const t = now.getTime();
  const place = D.applyUvToday(D.parsePlace(p.to, f.place, t), f.uv, t);
  const here = D.HERE[p.from].live ? D.parseHere(p.from, f.fc, f.obs, t) : null;
  return { place, placeRes: { ok: true, error: null, url: null, place }, here, hereRes: { ok: true, error: null, here }, aircraft: D.parseAircraft(f.place, t), cards: {} };
}

// ---------- reading everything the screen needs ----------
// buildState(params, { now, example }) -> state. Never rejects; a failed read leaves its values null with
// the reason. example: true builds the fixed example state (no network; now defaults to EXAMPLE_NOW).
export async function buildState(params = {}, { now: nowOpt, example = false } = {}) {
  const realNow = nowOpt instanceof Date ? nowOpt : nowOpt ? new Date(nowOpt) : example ? new Date(EXAMPLE_NOW) : new Date();
  const p = normaliseParams(params);
  const H = D.HERE[p.from];
  // London's clock may be set to a chosen hour (simulated); the Portuguese cities use the real time.
  const now = (p.from === 'london' && p.hour !== null) ? D.zoned(D.ymdIn(realNow, H.tz), p.hour, H.tz) : realNow;
  let read;
  if (example) read = exampleState(p, realNow);
  else {
    const [placeRes, hereRes, aircraft, cardList] = await Promise.all([
      D.getPlace(p.to, { now: realNow.getTime() }),
      D.getHere(p.from, { now: realNow.getTime() }),
      D.getAircraft({ now: realNow.getTime() }),
      Promise.all(['ipma-observations', 'ipma-city-forecasts', 'ipma-sea', 'ipma-uv', 'ipma-warnings', 'adsb-faro'].map(D.getCard)),
    ]);
    read = { place: placeRes.place, placeRes, here: hereRes.here, hereRes, aircraft, cards: Object.fromEntries(cardList.map(c => [c.id, c])) };
  }
  const place = read.place;
  const here = p.from === 'london' ? D.simulatedLondon({ weather: p.weather, temp: p.temp, now: now.getTime() }) : read.here;
  const meta = D.PLACES[p.to];
  const hereSun = sunTimes(now, H.lat, H.lon);
  const algSun = sunTimes(now, meta.lat, meta.lon);
  const daylight = {
    here_sunrise: hereSun.sunrise, here_sunset: hereSun.sunset, algarve_sunrise: algSun.sunrise, algarve_sunset: algSun.sunset,
    here_left: daylightLeft(now, H.lat, H.lon), algarve_left: daylightLeft(now, meta.lat, meta.lon),
  };
  const decision = { ...D.decide(here, place ? { ...place, ok: true } : null, { now: now.getTime(), daylight }) };
  if (example) decision.line = `Example values, not a reading. ${decision.line}`;
  return { params: p, now, realNow, simulatedClock: now !== realNow, example: !!example, here, hereRes: read.hereRes, place, placeRes: read.placeRes, meta, aircraft: read.aircraft, daylight, decision, journey: journey(p, meta, now), plan: planUrl(p), cards: read.cards };
}

// sunInfo(state, at) -> the sun's place in the day, for the root's custom properties and data-night.
// frac: 0 at sunrise, 1 at sunset, clamped (0 before sunrise, 1 after sunset). The Algarve uses the real
// clock (as the scene does); here uses the state's clock (London's may be set by the visitor).
export function sunInfo(s, at = s.realNow) {
  const frac = (t, rise, set) => (!rise || !set) ? null : Math.max(0, Math.min(1, (t - rise) / (set - rise)));
  const m = s.meta, H = D.HERE[s.params.from];
  const algSun = sunTimes(at, m.lat, m.lon);
  const hereAt = s.simulatedClock ? s.now : at;
  const hereSun = sunTimes(hereAt, H.lat, H.lon);
  return {
    fracAlg: frac(at.getTime(), algSun.sunrise, algSun.sunset),
    fracHere: frac(hereAt.getTime(), hereSun.sunrise, hereSun.sunset),
    altAlg: sunPosition(at, m.lat, m.lon).altitude,
    night: isDark(at, m.lat, m.lon),
  };
}

// ---------- drawing the phases ----------
// The tag for a value read live, or "example" in the example state.
const liveTag = s => tag(s.example ? 'example' : 'live');
const readAt = (s, iso) => s.example ? 'example' : esc(D.fmtUTC(iso));
function staleTag(s, v) {
  if (s.example || !v || !v.read_at) return '';
  const cad = s.cards?.[v.source]?.cadence || 'hourly';
  return D.isStale(v.read_at, cad) ? ' ' + tag('stale') : '';
}
const valueTag = (s, v) => (v?.value === null || v?.value === undefined) ? tag('missing') : liveTag(s) + staleTag(s, v);
function smallPrint(s) {
  const pl = s.place;
  const alg = pl ? `Algarve: IPMA via data.promptugal.news, read ${readAt(s, pl.temp_c.read_at || pl.read_at)} ${liveTag(s)}` : `Algarve: no reading (${esc(s.placeRes.error || 'not read')}) ${tag('missing')}`;
  const here = s.here?.simulated
    ? `${esc(s.here.label)}: weather ${s.simulatedClock ? 'and time ' : ''}set by you ${tag('sim')}`
    : s.here ? `${esc(s.here.label)}: IPMA, ${esc(s.here.station?.name || 'no station')}${s.here.station ? ` (${s.here.station.km} km)` : ''}, read ${readAt(s, s.here.temp_c.read_at)} ${liveTag(s)}` : `${esc(D.HERE[s.params.from].label)}: no reading (${esc(s.hereRes?.error || 'not read')}) ${tag('missing')}`;
  return `<footer class="screen-smallprint">
    ${s.example ? `<p class="sp-example"><strong>${esc(EXAMPLE_NOTE)}</strong> ${tag('example')}</p>` : ''}
    <p class="sp-sim"><strong>Simulation.</strong> No real screen or campaign.</p>
    <p class="sp-alg">${alg}.</p>
    <p class="sp-here">${here}.</p>
    <p class="sp-inv">Journeys, flights and times: ${tag('inv')}</p>
    <p class="sp-drawing">${esc(DRAWING_NOTE)}.</p>
  </footer>`;
}
function headlineBand(s) {
  const d = s.decision;
  if (d.mode === 'pause') return `<div class="screen-ribbon screen-ribbon-pause">${esc(d.headline)} (shown here for the demonstration${s.example ? ', with example values' : ''})</div>`;
  return '';
}
const head = inner => `<div class="screen-head"><h1 class="screen-headline">${inner}</h1></div>`;

function obsLine(s) {
  const pl = s.place, t = pl?.temp_c;
  if (!pl || !t) return 'No observation read.';
  if (t.value === null) return `No temperature this hour (${esc(t.why_missing || 'the station sent none')}).`;
  const when = s.example ? 'example time' : t.observed_at ? esc(D.fmtUTC(t.observed_at)) : 'time unknown';
  if (t.fallback) return `${esc(t.own_station || 'The local station')} sent no temperature; ${esc(t.note)}, ${when}.`;
  return `Observed at ${esc(t.station || 'an IPMA station')}${pl.station?.km != null ? ` (${pl.station.km} km)` : ''}, ${when}.`;
}
function fact(key, label, value, tags, src) {
  return `<div class="screen-fact" data-key="${key}"><dt>${esc(label)}</dt><dd><span class="fact-value${key === 'forecast' ? ' screen-words' : ''}">${value}</span> ${tags}<span class="fact-src">${src}</span></dd></div>`;
}
function facts(s) {
  const pl = s.place;
  const fc = pl?.today, sea = pl?.sea_temp_c, uv = pl?.uv, ac = s.aircraft;
  const fv = fc?.value;
  const sunset = s.daylight.algarve_sunset;
  return `<dl class="screen-facts">
    ${fact('forecast', 'Today', fv ? `${esc(fv.words)}${fv.rain_prob_pct != null ? `, ${fv.rain_prob_pct}% chance of rain` : ''}` : DASH, fv ? liveTag(s) + staleTag(s, fc) : tag('missing'),
      pl ? `IPMA forecast for ${esc(pl.forecast?.place || s.meta.label)}, read ${readAt(s, fc.read_at)}` : 'No forecast read.')}
    ${fact('sea', 'Sea', sea?.value != null ? `up to ${esc(t1(sea.value))}` : DASH, valueTag(s, sea),
      sea ? `IPMA sea forecast${sea.coast ? `, ${esc(sea.coast)}` : ''}, read ${readAt(s, sea.read_at)}` : 'No sea forecast read.')}
    ${fact('uv', 'UV today', uv?.value != null ? `${esc(uv.value)} (${esc(uv.band)})` : DASH, valueTag(s, uv),
      uv ? (uv.value != null ? `IPMA UV forecast for Faro, today, read ${readAt(s, uv.read_at)}` : esc(uv.why_missing || 'no UV forecast for today')) : 'No UV forecast read.')}
    ${fact('aircraft', 'Aircraft', ac?.value != null ? `${esc(ac.value)} seen near Faro airport now` : DASH, valueTag(s, ac),
      ac ? `adsb.lol, ODbL 1.0, read ${readAt(s, ac.read_at)}` : 'No aircraft count read.')}
    ${fact('sunset', `Sunset in ${s.meta.label}`, sunset ? esc(D.clock(sunset, D.PORTUGAL_TZ)) : DASH, tag('computed'), 'computed in your browser (NOAA equations)')}
  </dl>`;
}
function phaseNow(s) {
  const pl = s.place;
  const d = s.decision;
  const h = !pl ? head('No live Algarve reading just now.')
    : d.mode === 'switch' ? head(esc(d.headline))
    : head('This is the Algarve right now. <span class="screen-accent">You could be here.</span>');
  const local = D.clock(s.realNow, D.PORTUGAL_TZ);
  const temp = pl?.temp_c?.value ?? null;
  return `<section class="screen-phase phase-now" data-phase="now">
    ${h}
    <div class="screen-now">
      <p class="screen-place">${esc(s.meta.label)}</p>
      <p class="screen-time"><span${s.example ? '' : ` data-clock="${D.PORTUGAL_TZ}"`}>${esc(local)}</span> local time${s.example ? ' (example)' : ''}</p>
      <p class="screen-temp">${temp === null ? DASH : esc(t1(temp))} ${temp === null ? tag('missing') : liveTag(s) + staleTag(s, pl.temp_c)}</p>
      <p class="screen-meta">${obsLine(s)}</p>
      ${facts(s)}
    </div>
  </section>`;
}

function dayRow(label, here, alg, dry) {
  const h = here ? `${t0(here.t_max_c)} <span class="day-words">${esc(here.words || '')}</span>` : DASH;
  const a = alg ? `${t0(alg.t_max_c)} <span class="day-words">${esc(alg.words)}${alg.rain_prob_pct != null ? ` (${alg.rain_prob_pct}% rain)` : ''}</span>` : DASH;
  return `<tr${dry ? ' class="is-dry"' : ''}><th scope="row">${esc(label)}${dry ? ' <span class="day-dry">drier</span>' : ''}</th><td>${h}</td><td>${a}</td></tr>`;
}
function phaseCompare(s) {
  const pl = s.place, h = s.here;
  const hereName = h?.label || D.HERE[s.params.from].label;
  const hTag = h?.simulated ? tag('sim') : h ? liveTag(s) : tag('missing');
  const aTag = pl ? liveTag(s) : tag('missing');
  const hereTemp = h?.temp_c?.value ?? null;
  const algTemp = pl?.temp_c?.value ?? null;
  const dryDate = s.decision.mode === 'switch' ? s.decision.dry?.date : null;
  const days = [0, 1, 2].map(i => {
    const a = pl?.next?.[i] || null;
    const hh = h?.next?.[i] || null;
    const date = a?.date || hh?.date;
    return date ? dayRow(D.fmtDay(date), hh, a, !!dryDate && a?.date === dryDate) : '';
  }).join('');
  const tzH = D.HERE[s.params.from].tz;
  const algSunset = s.daylight.algarve_sunset ? D.clock(s.daylight.algarve_sunset, D.PORTUGAL_TZ) : DASH;
  const hereSunset = s.daylight.here_sunset ? D.clock(s.daylight.here_sunset, tzH) : DASH;
  const ended = s.daylight.here_left === 0 && s.now > s.daylight.here_sunset;
  const src = s.example ? 'example values' : 'IPMA forecast';
  return `<section class="screen-phase phase-compare" data-phase="compare">
    ${head(`${esc(hereName)} or ${esc(s.meta.label)}?`)}
    <div class="screen-vs">
      <div class="screen-side side-here"><p class="side-name">${esc(hereName)} ${hTag}</p><p class="side-temp">${esc(t1(hereTemp))}</p><p class="side-words">${esc(h?.words || 'no reading')}</p></div>
      <div class="screen-side side-alg"><p class="side-name">${esc(s.meta.label)} ${aTag}</p><p class="side-temp">${esc(t1(algTemp))}</p><p class="side-words">${esc(pl?.today?.value?.words || 'no reading')}</p></div>
    </div>
    <table class="screen-days"><caption>Next three days (${h?.simulated ? `${esc(hereName)} simulated, ${esc(s.meta.label)} ${src}` : src})</caption>
      <thead><tr><th></th><th>${esc(hereName)}${h?.simulated ? ` ${tag('sim')}` : ''}</th><th>${esc(s.meta.label)}</th></tr></thead><tbody>${days || `<tr><td colspan="3">No forecast could be read.</td></tr>`}</tbody></table>
    <p class="screen-sunline">${tag('computed')} Sunset in ${esc(s.meta.label)} at <strong>${esc(algSunset)}</strong>. Daylight in ${esc(hereName)} ${ended ? 'ended' : 'ends'} at <strong>${esc(hereSunset)}</strong>.</p>
  </section>`;
}

function qrSvg(text) {
  try {
    const q = qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(), m = 4;
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
    return `<svg class="screen-qr" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" role="img" aria-label="QR code for ${esc(text)}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  } catch (e) { return `<p class="screen-qr-fail">QR code could not be drawn: ${esc(text)}</p>`; }
}
function phaseJourney(s) {
  const j = s.journey;
  const tz = j.tz;
  const legs = j.legs.map(l => `<li><span class="leg-time">${esc(D.clock(l.start, tz))}</span> <span class="leg-what">${esc(l.what)}</span> <span class="leg-dur">about ${esc(fmtDur(l.min))}</span></li>`).join('');
  const depart = `${j.route === 'train' ? 'the train' : 'a flight'} at ${D.clock(j.departs, tz)}`;
  const hereName = esc(s.here?.label || D.HERE[s.params.from].label);
  return `<section class="screen-phase phase-journey" data-phase="journey">
    ${head(esc(j.headline))}
    <div class="screen-itinerary">
      <p class="itin-title">For example ${tag('inv')}${s.simulatedClock ? ` <span class="itin-clock">clock ${esc(D.clock(s.now, tz))} ${tag('sim')}</span>` : ''}</p>
      <p class="itin-depart">Leave ${hereName} ${j.day === 'tomorrow' ? 'tomorrow ' : ''}by ${esc(D.clock(j.leave, tz))}; catch ${esc(depart)}; in ${esc(s.meta.label)} by ${esc(D.clock(j.there, D.PORTUGAL_TZ))}${j.sunset ? `, sunset ${esc(D.clock(j.sunset, D.PORTUGAL_TZ))} (computed)` : ''}.</p>
      <ol>${legs}</ol>
    </div>
    <div class="screen-cta">${qrSvg(s.plan)}<p class="cta-text">Scan to plan<br><span>(a simulation)</span></p></div>
  </section>`;
}

const PHASE_FN = { now: phaseNow, compare: phaseCompare, journey: phaseJourney };

// ---------- sizing ----------
export const MIN_HEIGHT = 480;
// fitWindow(ctx, { belowTop }) -> the screen's height in px so that it, its controls and the decision
// line fit the window. ctx: { top (the frame's top in the page), controls, decision (heights with their
// gaps), floor }. belowTop (true): fit in the window left below the frame's top; if that is under the
// floor, use the floor and let the decision line fall below the fold, but never the controls (in a very
// short window the screen shrinks under the floor, to 240 px at least, to keep its controls in view). belowTop false (a phone, where
// the screen cannot be in the first view anyway): fit one whole window once scrolled to.
export function fitWindow(ctx, { belowTop = true, margin = 16 } = {}) {
  const ih = typeof innerHeight === 'number' ? innerHeight : 1920;
  const floor = ctx.floor ?? MIN_HEIGHT;
  if (!belowTop) return Math.max(floor, ih - ctx.controls - margin);
  const all = ih - ctx.top - ctx.controls - ctx.decision - margin;
  const withControls = ih - ctx.top - ctx.controls - margin;
  return Math.max(240, all >= floor ? all : Math.min(floor, withControls));
}

// ---------- mounting ----------
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// mountScreen(el, state, opts) -> controller.
// opts: theme ('live'), controls (true), decision (true), autoplay (true unless reduced motion),
//       phaseMs (10000), phase (0), maxHeight (px, or a function(ctx) returning px; default fitWindow(ctx)),
//       maxWidth (px or a function; default the parent element's width), minHeight (480),
//       keys ('frame': arrows and Space work with focus in the frame; 'page': anywhere on the page, for kiosk).
export function mountScreen(el, state, opts = {}) {
  const o = { theme: 'live', controls: true, decision: true, phaseMs: PHASE_MS, phase: 0, keys: 'frame', ...opts };
  let st = state, phase = Math.max(0, Math.min(2, Number(o.phase) || 0));
  let playing = o.autoplay ?? !reduced();
  let timer = null, clockTimer = null, sceneTimer = null;
  el.classList.add('screen-frame');
  el.innerHTML = `
    <div class="screen-fit"><div class="screen theme-${esc(o.theme)}" data-theme="${esc(o.theme)}" role="region" aria-roledescription="simulated billboard" aria-label="Simulated billboard screen" tabindex="0">
      <div class="screen-scene"></div><div class="screen-layer"></div>
    </div></div>
    ${o.controls ? `<div class="screen-controls" role="group" aria-label="Screen controls">
      <button type="button" data-act="prev" aria-label="Previous phase">Previous</button>
      <button type="button" data-act="toggle" aria-pressed="false">Pause</button>
      <button type="button" data-act="next" aria-label="Next phase">Next</button>
      <span class="screen-phase-label"></span>
    </div>` : ''}
    ${o.decision ? '<p class="screen-decision" aria-live="polite"></p>' : ''}`;
  const fit = el.querySelector('.screen-fit');
  const root = el.querySelector('.screen');
  const sceneEl = el.querySelector('.screen-scene');
  const layer = el.querySelector('.screen-layer');
  const label = el.querySelector('.screen-phase-label');
  const toggleBtn = el.querySelector('[data-act="toggle"]');
  const controlsEl = el.querySelector('.screen-controls');
  const decisionEl = el.querySelector('.screen-decision');

  const px = v => typeof v === 'function' ? v() : v;
  function scale() {
    const gap = parseFloat(getComputedStyle(el).rowGap) || 0;
    const top = el.getBoundingClientRect().top + (typeof scrollY === 'number' ? scrollY : 0);
    const w = px(o.maxWidth) || el.parentElement?.clientWidth || el.clientWidth || 360;
    // The decision line's height depends on the frame's width, which depends on the scale: settle in a few passes.
    for (let i = 0; i < 3; i++) {
      const ctx = { el, top, floor: o.minHeight ?? MIN_HEIGHT, controls: controlsEl ? controlsEl.offsetHeight + gap : 0, decision: decisionEl ? decisionEl.offsetHeight + gap : 0 };
      const mh = typeof o.maxHeight === 'function' ? o.maxHeight(ctx) : (o.maxHeight || fitWindow(ctx));
      const k = Math.min(w / 1080, mh / 1920);
      const sw = Math.round(1080 * k);
      root.style.transform = `scale(${k})`;
      fit.style.width = `${sw}px`;
      fit.style.height = `${Math.round(1920 * k)}px`;
      if (el.style.getPropertyValue('--screen-w') === `${sw}px`) break;
      el.style.setProperty('--screen-w', `${sw}px`);
    }
  }
  function sunVars() {
    const at = st.example ? st.realNow : new Date();
    const sun = sunInfo(st, at);
    root.style.setProperty('--sun-frac-alg', sun.fracAlg === null ? '' : sun.fracAlg.toFixed(3));
    root.style.setProperty('--sun-frac-here', sun.fracHere === null ? '' : sun.fracHere.toFixed(3));
    root.style.setProperty('--sun-alt-alg', sun.altAlg.toFixed(1));
    root.dataset.night = String(sun.night);
  }
  function drawSceneNow() {
    const pl = st.place;
    const fc = pl?.today?.value;
    sceneEl.innerHTML = drawScene({
      place: st.meta, at: st.example ? st.realNow : new Date(),
      cover: fc?.cover ?? (pl ? 0.3 : 0.5),
      rain: (pl?.rain_mm?.value ?? 0) > 0 || fc?.sky === 'rain',
      windKmh: pl?.wind_kmh?.value ?? 0,
    });
    sunVars();
  }
  function render() {
    const name = PHASES[phase];
    root.dataset.phase = name;
    root.dataset.mode = st.decision.mode;
    root.dataset.here = st.params.from;
    root.dataset.place = st.params.to;
    if (st.simulatedClock) root.dataset.simClock = D.clock(st.now, D.HERE[st.params.from].tz); else delete root.dataset.simClock;
    if (st.example) root.dataset.example = 'true'; else delete root.dataset.example;
    root.classList.toggle('is-paused-decision', st.decision.mode === 'pause');
    layer.innerHTML = headlineBand(st) + PHASE_FN[name](st) + `<div class="screen-dots" aria-hidden="true">${PHASES.map((_, i) => `<span${i === phase ? ' class="on"' : ''}></span>`).join('')}</div>` + smallPrint(st);
    if (label) label.innerHTML = `Phase ${phase + 1} of 3<span class="sr-only">: ${PHASE_NAMES[phase]}</span>`;
    if (toggleBtn) { toggleBtn.textContent = playing ? 'Pause' : 'Play'; toggleBtn.setAttribute('aria-pressed', String(!playing)); }
    if (decisionEl) {
      const verdict = { run: 'Would run', switch: 'Would switch message', pause: 'Would pause' }[st.decision.mode];
      const html = `<strong>${verdict}${st.example ? ' (example)' : ''}.</strong> ${esc(st.decision.line)}`;
      decisionEl.dataset.mode = st.decision.mode;
      // Announced (aria-live) only when it changes, never on a phase change.
      if (decisionEl.innerHTML !== html) { decisionEl.innerHTML = html; scale(); }
    }
  }
  function schedule() {
    clearTimeout(timer);
    if (playing) timer = setTimeout(() => { phase = (phase + 1) % 3; render(); schedule(); }, o.phaseMs);
  }
  const ctl = {
    root, el,
    get phase() { return phase; },
    get playing() { return playing; },
    go(i) { phase = ((i % 3) + 3) % 3; render(); schedule(); },
    next() { ctl.go(phase + 1); },
    prev() { ctl.go(phase - 1); },
    play() { playing = true; render(); schedule(); },
    pause() { playing = false; clearTimeout(timer); render(); },
    toggle() { playing ? ctl.pause() : ctl.play(); },
    update(next) { st = next; drawSceneNow(); render(); },
    // setTheme(name): one of THEMES, or any other lower-case design name a page supplies CSS for.
    setTheme(name) {
      if (!/^[a-z0-9-]{1,32}$/.test(String(name))) return false;
      root.className = root.className.replace(/\btheme-[\w-]+/, `theme-${name}`);
      root.dataset.theme = name;
      return true;
    },
    destroy() { clearTimeout(timer); clearInterval(clockTimer); clearInterval(sceneTimer); ro?.disconnect(); removeEventListener('resize', scale); keyTarget.removeEventListener('keydown', onKey); el.innerHTML = ''; },
  };
  el.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) ctl[b.dataset.act](); });
  function onKey(e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest?.('input,select,textarea,a,[contenteditable]')) return;
    const onButton = !!e.target.closest?.('button');
    if (e.key === 'ArrowRight') { ctl.next(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { ctl.prev(); e.preventDefault(); }
    else if ((e.key === ' ' || e.key === 'k') && !onButton && (o.keys === 'page' || e.target === root)) { ctl.toggle(); e.preventDefault(); }
  }
  const keyTarget = o.keys === 'page' && typeof document !== 'undefined' ? document : el;
  keyTarget.addEventListener('keydown', onKey);
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => scale()) : null;
  ro?.observe(el.parentElement || el);
  addEventListener('resize', scale);
  // The local clock on the screen, and the scene's sun, move with real time (not in the example state).
  clockTimer = setInterval(() => {
    for (const c of root.querySelectorAll('[data-clock]')) c.textContent = D.clock(new Date(), c.dataset.clock);
  }, 15000);
  sceneTimer = setInterval(() => { if (!st.example) drawSceneNow(); }, 5 * 60000);
  scale(); drawSceneNow(); render(); schedule(); scale();
  return ctl;
}

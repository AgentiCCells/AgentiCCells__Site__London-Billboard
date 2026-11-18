// data.js: the live-data module of london-billboard.agenticcells.site.
// Reads, in the browser, the Algarve places' "now" files and IPMA's city forecasts and station
// observations from https://data.promptugal.news, with a timeout and one read per URL per page
// load. Every value it returns carries where it came from: { source, publisher, read_at }.
// Never guesses a value: a file that is missing, slow or stale is said to be so.
// ES module, no dependencies; works in the browser and in Node 22 (tests/data.test.mjs).
//
// Adapted from src/assets/js/data.js in AgentiCCells/AgentiCCells__Site__Algarve-Holiday-Homes
// (developer.algarve-holiday-homes@AgentiCCells.dinis, 2026-11-18, Apache-2.0, same organisation),
// itself from AgentiCCells/AgentiCCells__Site__IPMA-Data: the fetch with a timeout, the cache, the
// read-error words, the staleness rule and IPMA's weather-type words come from there.
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18, round 1. Code Apache-2.0.

export const API = 'https://data.promptugal.news/api/v1';
export const DATA_SITE = 'https://data.promptugal.news';
export const TIMEOUT_MS = 8000;
export const IPMA = 'IPMA, Instituto Português do Mar e da Atmosfera';
export const IPMA_TERMS = 'IPMA: free to copy and use for personal or public use if the use has no profit-making or offensive purpose; always name IPMA as the source.';
export const IPMA_TERMS_URL = 'https://api.ipma.pt/';
export const ADSB = 'adsb.lol (community ADS-B receivers)';

// ---------- small helpers ----------
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const num = v => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v))) ? null : Number(v);
export const round = (v, d = 0) => { const n = num(v); if (n === null) return null; const k = 10 ** d; return Math.round(n * k) / k; };

// "Thu 19 Nov"
export function fmtDay(ymd) {
  const d = new Date(`${ymd}T12:00:00Z`);
  return isNaN(d) ? String(ymd) : `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}
// "17:41 UTC"
export function fmtUTC(iso) {
  const d = iso instanceof Date ? iso : new Date(iso);
  return isNaN(d) ? 'an unknown time' : `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}
// "17:41" in a time zone.
export function clock(at, tz) {
  const d = at instanceof Date ? at : new Date(at);
  if (isNaN(d)) return '--:--';
  try { return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d); }
  catch { return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; }
}
// YYYY-MM-DD in a time zone.
export function ymdIn(at, tz) {
  const d = at instanceof Date ? at : new Date(at);
  try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); }
  catch { return d.toISOString().slice(0, 10); }
}
// The instant that is hour:00 on day ymd in a time zone (two passes settle the offset).
export function zoned(ymd, hour, tz, minute = 0) {
  let t = Date.parse(`${ymd}T${pad(hour)}:${pad(minute)}:00Z`);
  for (let i = 0; i < 2; i++) {
    const [h, m] = clock(new Date(t), tz).split(':').map(Number);
    const shown = Date.parse(`${ymdIn(new Date(t), tz)}T${pad(h)}:${pad(m)}:00Z`);
    t += Date.parse(`${ymd}T${pad(hour)}:${pad(minute)}:00Z`) - shown;
  }
  return new Date(t);
}
export function ago(min) {
  if (min === null || min === undefined) return 'at an unknown time';
  if (min < 1) return 'just now';
  if (min < 90) return `${min} min ago`;
  if (min < 48 * 60) return `${Math.round(min / 60)} hours ago`;
  return `${Math.round(min / 1440)} days ago`;
}
// Distance in km between two points (haversine, mean Earth radius 6371 km).
export function km(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lon2 - lon1) * r / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

// ---------- IPMA weather types ----------
// From IPMA's class file (a lookup table, not data): https://api.ipma.pt/open-data/weather-type-classe.json,
// read 2026-11-18 by the Algarve-Holiday-Homes cell. sky: the drawing's three skies (sun, cloud, rain);
// cover: how much of the sky the drawing fills with cloud (0 to 1).
export const WEATHER_CLASS_URL = 'https://api.ipma.pt/open-data/weather-type-classe.json';
const WEATHER = {
  0: 'no information', 1: 'clear sky', 2: 'partly cloudy', 3: 'sunny intervals', 4: 'cloudy', 5: 'cloudy (high cloud)',
  6: 'showers', 7: 'light showers', 8: 'heavy showers', 9: 'rain and showers', 10: 'light rain', 11: 'heavy rain',
  12: 'intermittent rain', 13: 'intermittent light rain', 14: 'intermittent heavy rain', 15: 'drizzle', 16: 'mist',
  17: 'fog', 18: 'snow', 19: 'thunderstorms', 20: 'showers and thunderstorms', 21: 'hail', 22: 'frost',
  23: 'rain and thunderstorms', 24: 'convective clouds', 25: 'partly cloudy', 26: 'fog', 27: 'cloudy',
  28: 'snow showers', 29: 'rain and snow', 30: 'rain and snow',
};
export const weatherWords = code => {
  const n = num(code);
  if (n === null || n < 0) return 'no information';
  return WEATHER[n] ?? `weather type ${n}`;
};
export function skyOf(code) {
  const n = num(code);
  if (n === null || n <= 0) return { sky: null, cover: null };
  if (n === 1) return { sky: 'sun', cover: 0 };
  if (n === 2 || n === 3 || n === 25) return { sky: 'sun', cover: 0.4 };
  if (n === 4 || n === 5 || n === 24 || n === 27) return { sky: 'cloud', cover: 0.85 };
  if (n === 16 || n === 17 || n === 26) return { sky: 'cloud', cover: 1 };
  if (n === 22) return { sky: 'sun', cover: 0.1 };
  return { sky: 'rain', cover: 1 };
}
export const isWet = code => skyOf(code).sky === 'rain';
export function uvBand(i) {
  const v = num(i);
  if (v === null) return 'unknown';
  return v < 3 ? 'low' : v < 6 ? 'moderate' : v < 8 ? 'high' : v < 11 ? 'very high' : 'extreme';
}

// ---------- places ----------
// The Algarve places with a "now" file. lat/lon: the town centres (for the sun only); scene: what the drawing shows.
export const PLACES = {
  faro: { id: 'faro', label: 'Faro', lat: 37.0194, lon: -7.9322, scene: 'marina', from_faro_min: 15 },
  albufeira: { id: 'albufeira', label: 'Albufeira', lat: 37.0889, lon: -8.2503, scene: 'cliffs', from_faro_min: 40 },
  tavira: { id: 'tavira', label: 'Tavira', lat: 37.1273, lon: -7.6506, scene: 'river', from_faro_min: 35 },
  quarteira: { id: 'quarteira', label: 'Vilamoura (Quarteira)', lat: 37.0695, lon: -8.1006, scene: 'marina', from_faro_min: 30 },
  portimao: { id: 'portimao', label: 'Portimão', lat: 37.1386, lon: -8.5370, scene: 'beach', from_faro_min: 55 },
  lagos: { id: 'lagos', label: 'Lagos', lat: 37.1028, lon: -8.6730, scene: 'cliffs', from_faro_min: 70 },
};
export const PORTUGAL_TZ = 'Europe/Lisbon';

// Where the screen stands. London has no live source on 2026-11-18: its weather is set by the visitor.
// forecast: the IPMA city id (ipma-city-forecasts). lat/lon: the city centre.
export const HERE = {
  london: { id: 'london', label: 'London', tz: 'Europe/London', lat: 51.5074, lon: -0.1278, live: false },
  porto: { id: 'porto', label: 'Porto', tz: PORTUGAL_TZ, lat: 41.158, lon: -8.6294, forecast: 1131200, live: true, stations: [1240903, 1200545] },
  braga: { id: 'braga', label: 'Braga', tz: PORTUGAL_TZ, lat: 41.5475, lon: -8.4227, forecast: 1030300, live: true, stations: [6212124, 1210625] },
  lisboa: { id: 'lisboa', label: 'Lisbon', tz: PORTUGAL_TZ, lat: 38.766, lon: -9.1286, forecast: 1110600, live: true, stations: [1200535, 6215302] },
};
// The stations each city uses, in order (team/rounds/1/data/DATA.md, 2026-11-18): the newest hour of
// ipma-observations is often partial, so the first with a temperature wins. Lisboa, Relógio (1210580)
// is nearer but mostly silent, so it is left out.
export const FARO_STATION = 1200554; // Faro (Aeródromo): the Algarve fallback when a place's own station is silent
export const FARO_UV_ID = 1080500;   // ipma-uv place id for Faro
export const STATIONS = {
  'oxford-circus': 'Oxford Circus', victoria: 'Victoria', waterloo: 'Waterloo', 'canary-wharf': 'Canary Wharf',
};
// London's weather, set by the visitor (simulated). temp_c: the default temperature for each.
export const LONDON_WEATHER = {
  rain: { label: 'Rain', words: 'rain', temp_c: 9, sky: 'rain', cover: 1 },
  drizzle: { label: 'Drizzle', words: 'drizzle', temp_c: 11, sky: 'rain', cover: 1 },
  grey: { label: 'Grey', words: 'grey and overcast', temp_c: 10, sky: 'cloud', cover: 0.9 },
  'cold-clear': { label: 'Cold and clear', words: 'cold and clear', temp_c: 3, sky: 'sun', cover: 0 },
  'mild-sunny': { label: 'Mild and sunny', words: 'mild and sunny', temp_c: 19, sky: 'sun', cover: 0.1 },
};

// ---------- reading files ----------
const cache = new Map();
function readError(e) {
  if (e?.name === 'AbortError') return `no answer within ${TIMEOUT_MS / 1000} seconds`;
  if (e instanceof SyntaxError) return 'the file was read but is not valid JSON';
  if (e instanceof TypeError || /fetch|network|load failed/i.test(e?.message || '')) return 'the network request failed';
  return `the file could not be read (${e?.message || 'unknown error'})`;
}
// getJSON(url) resolves (never rejects) to { ok, data, error, status, url }. One read per URL per page load.
export function getJSON(url, { timeout = TIMEOUT_MS } = {}) {
  if (cache.has(url)) return cache.get(url);
  const p = (async () => {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const kill = ctl ? setTimeout(() => ctl.abort(), timeout) : null;
    try {
      const r = await fetch(url, ctl ? { signal: ctl.signal } : {});
      if (!r.ok) return { ok: false, status: r.status, data: null, error: `the file answered HTTP ${r.status}`, url };
      return { ok: true, status: r.status, data: await r.json(), error: null, url };
    } catch (e) {
      return { ok: false, status: 0, data: null, error: readError(e), url };
    } finally { if (kill) clearTimeout(kill); }
  })();
  cache.set(url, p);
  return p;
}
// For tests: forget every read.
export function clearCache() { cache.clear(); }

export const sourceUrls = id => ({
  latest: `${API}/${id}/latest.json`, card: `${API}/${id}/card.json`, page: `${DATA_SITE}/sources/${id}/`,
});

// Twice the card's cadence, in minutes (hourly: 120; every 6 hours: 720; daily: 2880).
export function staleAfterMin(cadence) {
  const c = String(cadence || '').toLowerCase();
  if (/hourly|every hour/.test(c)) return 120;
  const m = c.match(/every (\d+) hours?/); if (m) return Number(m[1]) * 120;
  const mm = c.match(/every (\d+) min/); if (mm) return Number(mm[1]) * 2;
  if (/daily|every day/.test(c)) return 48 * 60;
  return 120;
}
export function ageMin(read_at, now = Date.now()) {
  const t = Date.parse(read_at);
  return Number.isFinite(t) ? Math.max(0, Math.round((now - t) / 60000)) : null;
}
export function isStale(read_at, cadence, now = Date.now()) {
  const a = ageMin(read_at, now);
  return a === null ? true : a > staleAfterMin(cadence);
}

// getCard(id) -> { id, ok, card, publisher, cadence, terms, page, error }. Never rejects.
const cards = new Map();
export function getCard(id) {
  if (cards.has(id)) return cards.get(id);
  const u = sourceUrls(id);
  const p = getJSON(u.card).then(r => {
    const card = r.ok && r.data && typeof r.data === 'object' ? r.data : null;
    return {
      id, ok: !!card, card,
      publisher: card?.publisher || (id.startsWith('ipma-') ? IPMA : id.startsWith('adsb') ? ADSB : id),
      cadence: card?.schedule?.cadence || null,
      terms: card?.terms?.summary || (id.startsWith('ipma-') ? IPMA_TERMS : null),
      reader_page: card?.reader_page || null,
      card_url: u.card, page: u.page,
      error: card ? null : (r.error || 'the card holds no data'),
    };
  });
  cards.set(id, p);
  return p;
}

// prov(): the provenance carried by every value.
export function prov(source, read_at, extra = {}) {
  const publisher = source.startsWith('ipma-') ? IPMA : source.startsWith('adsb') ? ADSB : source.startsWith('events') ? 'the events\' own sources (municipal and venue agendas)' : source;
  return { source, publisher, read_at: read_at || null, via: 'data.promptugal.news', ...extra };
}
// A value with its provenance: { value, source, publisher, read_at, ... }.
const val = (value, p, extra = {}) => ({ value, ...p, ...extra });

// ---------- the Algarve side ----------
export const placeUrl = id => `${API}/by-place/now/${id}.json`;

// parsePlace(id, data, now) -> the normalised "now" of an Algarve place (pure; tests use fixtures).
export function parsePlace(id, d, now = Date.now()) {
  const meta = PLACES[id] || { id, label: id };
  const reads = d?.reads || {};
  const at = k => reads[k]?.at || d?.read_at || null;
  const st = d?.station || null;
  const rd = st?.reading || null;
  const pObs = prov('ipma-observations', at('observations'), { url: st?.source || null, page: st?.page || null });
  const pFc = prov('ipma-city-forecasts', at('forecasts'), { url: d?.forecast?.source || null, page: d?.forecast?.page || null });
  const pSea = prov('ipma-sea', at('sea'), { url: d?.sea?.source || null, page: d?.sea?.page || null });
  const pUv = prov('ipma-uv', at('uv'), { url: d?.uv?.source || null, page: d?.uv?.page || null });
  const pWarn = prov('ipma-warnings', at('warnings'), { url: d?.warnings?.source || null, page: d?.warnings?.page || null });
  const days = (d?.forecast?.days || []).map(x => ({
    date: x.date, t_min_c: num(x.t_min_c), t_max_c: num(x.t_max_c), rain_prob_pct: num(x.rain_prob_pct),
    weather_type: num(x.weather_type), words: weatherWords(x.weather_type), ...skyOf(x.weather_type),
  }));
  const today = ymdIn(new Date(now), PORTUGAL_TZ);
  const todayFc = days.find(x => x.date === today) || null;
  const obsAt = rd?.at || null;
  return {
    id, label: meta.label, lat: meta.lat, lon: meta.lon, scene: meta.scene, from_faro_min: meta.from_faro_min,
    ok: !!d, read_at: d?.read_at || null, age_min: ageMin(d?.read_at, now),
    station: st ? { name: st.name, km: num(st.km), observed_at: obsAt, ...pObs } : null,
    temp_c: val(num(rd?.temp_c), pObs, { observed_at: obsAt, station: st?.name || null }),
    humidity_pct: val(num(rd?.humidity_pct), pObs, { observed_at: obsAt }),
    wind_kmh: val(num(rd?.wind_kmh), pObs, { observed_at: obsAt }),
    rain_mm: val(num(rd?.rain_mm), pObs, { observed_at: obsAt }),
    forecast: { place: d?.forecast?.place || null, days, ...pFc },
    today: todayFc ? val(todayFc, pFc) : val(null, pFc),
    next: days.filter(x => x.date > today).slice(0, 3),
    sea_temp_c: val(num(d?.sea?.sea_temp_max_c), pSea, { date: d?.sea?.date || null, coast: d?.sea?.coast || null }),
    waves_m: val(num(d?.sea?.waves_max_m), pSea, { date: d?.sea?.date || null }),
    // The place file's uv is IPMA's last forecast day; only today's counts (getPlace reads ipma-uv for today).
    uv: d?.uv?.date === today ? val(num(d.uv.index), pUv, { date: today, band: uvBand(d.uv.index), place: d.uv.place || null }) : val(null, pUv, { date: today, band: 'unknown', why_missing: 'the place file holds a later day, not today' }),
    warnings: val((d?.warnings?.active || []).map(w => ({ type: w.type, level: w.level, start: w.start, end: w.end, text: w.text || null })), pWarn, { area: d?.warnings?.area || null, times: 'Portuguese local time (no zone given)' }),
    aircraft: d?.airport ? parseAircraft(d, now) : null,
  };
}
export function parseAircraft(d, now = Date.now()) {
  const a = d?.airport;
  if (!a) return null;
  const read_at = d?.reads?.adsb?.at || a.at || null;
  return val(Array.isArray(a.airline) ? a.airline.length : null, prov('adsb-faro', read_at, { url: a.source || null, page: a.page || null, licence: 'ODbL 1.0' }), {
    words: 'aircraft seen near Faro airport now (adsb.lol, ODbL)', within_nm: num(a.within_nm), seen_at: a.at || null,
    other: num(a.other_aircraft),
  });
}

// getPlace(id) -> { ok, error, status, url, place } where place is parsePlace(...) or null. Never rejects.
export async function getPlace(id, { now = Date.now() } = {}) {
  if (!PLACES[id]) return { ok: false, error: `unknown place "${id}"`, status: 0, url: null, place: null };
  const url = placeUrl(id);
  const r = await getJSON(url);
  if (!r.ok) return { ok: false, error: r.error, status: r.status, url, place: null };
  const place = parsePlace(id, r.data, now);
  const [obs, uv] = await Promise.all([
    place.temp_c.value === null ? getJSON(sourceUrls('ipma-observations').latest) : null,
    getJSON(sourceUrls('ipma-uv').latest),
  ]);
  if (obs) applyStationFallback(place, obs.ok ? obs.data : null);
  applyUvToday(place, uv.ok ? uv.data : null, now, uv.ok ? null : uv.error);
  return { ok: true, error: null, status: r.status, url, place };
}

// The place files do not fall back when their station is silent (Albufeira, Tavira, Portimão; Loulé (CML),
// used for Vilamoura, never sends a temperature). Fall back to Faro (Aeródromo) in ipma-observations,
// and say so: "nearest reporting station: Faro (Aeródromo), N km". Never fill from a forecast.
export function applyStationFallback(place, obs) {
  if (place.temp_c.value !== null) return place;
  const own = place.station?.name || null;
  const f = (obs?.stations || []).find(x => Number(x.id) === FARO_STATION);
  const t = f?.reading ? num(f.reading.temp_c) : null;
  if (t === null) { place.temp_c.why_missing = own ? `${own} sent no temperature this hour, nor did Faro (Aeródromo)` : 'no station reported a temperature'; return place; }
  const k = round(km(place.lat, place.lon, f.lat, f.lon), 0);
  const p = prov('ipma-observations', obs.read_at, { url: obs?.provenance?.source || null, page: obs?.provenance?.page || null });
  const at = obs.hour_utc || null;
  place.temp_c = val(t, p, { observed_at: at, station: f.name, km: k, fallback: true, own_station: own, note: `nearest reporting station: ${f.name}, ${k} km` });
  if (place.wind_kmh.value === null) place.wind_kmh = val(num(f.reading.wind_kmh), p, { observed_at: at, station: f.name, fallback: true });
  if (place.rain_mm.value === null) place.rain_mm = val(num(f.reading.rain_mm), p, { observed_at: at, station: f.name, fallback: true });
  place.station = { name: f.name, id: f.id, km: k, observed_at: at, fallback: true, own_station: own, ...p };
  return place;
}
// The uv in the place files is the last forecast day, not today: read ipma-uv for Faro (1080500) and pick today.
export function applyUvToday(place, uv, now = Date.now(), error = null) {
  const today = ymdIn(new Date(now), PORTUGAL_TZ);
  const pl = (uv?.places || []).find(x => Number(x.id) === FARO_UV_ID);
  const vals = (pl?.days || []).filter(x => x.date === today).map(x => num(x.index)).filter(x => x !== null);
  const i = vals.length ? Math.max(...vals) : null;
  place.uv = val(i, prov('ipma-uv', uv?.read_at || null, { url: uv?.provenance?.source || null, page: uv?.provenance?.page || null }), {
    date: today, band: uvBand(i), place: 'Faro', why_missing: i === null ? (error || `no UV forecast for Faro for ${today}`) : null,
  });
  return place;
}
// The aircraft count always comes from the Faro file (adsb-faro is collected around Faro airport only).
export async function getAircraft({ now = Date.now() } = {}) {
  const r = await getJSON(placeUrl('faro'));
  return r.ok ? parseAircraft(r.data, now) : null;
}

// ---------- the Portuguese "here" side ----------
// nearestStation(stations, lat, lon) -> the nearest station with a non-null temperature, with its km.
export function nearestStation(stations, lat, lon) {
  let best = null;
  for (const s of stations || []) {
    if (!s || !s.reading || num(s.reading.temp_c) === null || num(s.lat) === null || num(s.lon) === null) continue;
    const k = km(lat, lon, s.lat, s.lon);
    if (!best || k < best.km) best = { ...s, km: k };
  }
  return best;
}
// pickStation(stations, ids, lat, lon) -> the first station in ids with a temperature, with its km
// from (lat, lon) and listed: true; else the nearest station with one (listed: false); else null.
export function pickStation(stations, ids, lat, lon) {
  for (const id of ids || []) {
    const s = (stations || []).find(x => Number(x.id) === Number(id));
    if (s && s.reading && num(s.reading.temp_c) !== null) return { ...s, km: km(lat, lon, s.lat, s.lon), listed: true };
  }
  const n = nearestStation(stations, lat, lon);
  return n ? { ...n, listed: false } : null;
}
// parseHere(id, forecasts, observations, now) -> the normalised "here" of a Portuguese city (pure).
export function parseHere(id, fc, obs, now = Date.now()) {
  const h = HERE[id];
  const city = (fc?.cities || []).find(c => Number(c.id) === Number(h.forecast)) || null;
  const lat = num(city?.lat) ?? h.lat, lon = num(city?.lon) ?? h.lon;
  const pFc = prov('ipma-city-forecasts', city?.read_at || fc?.read_at, { url: city?.source || null, page: fc?.provenance?.page || null });
  const st = obs ? pickStation(obs.stations, h.stations, lat, lon) : null;
  const obsAt = obs?.hour_utc || null;
  const pObs = prov('ipma-observations', obs?.read_at, { url: obs?.provenance?.source || null, page: obs?.provenance?.page || null });
  const days = (city?.days || []).map(x => ({
    date: x.date, t_min_c: num(x.t_min_c), t_max_c: num(x.t_max_c), rain_prob_pct: num(x.rain_prob_pct),
    weather_type: num(x.weather_type), words: weatherWords(x.weather_type), ...skyOf(x.weather_type),
  }));
  const today = ymdIn(new Date(now), h.tz);
  const todayFc = days.find(x => x.date === today) || null;
  return {
    id, label: h.label, tz: h.tz, lat, lon, live: true, simulated: false,
    station: st ? { name: st.name, id: st.id, km: round(st.km, 0), listed: st.listed, observed_at: obsAt, ...pObs } : null,
    temp_c: val(st ? num(st.reading.temp_c) : null, pObs, { observed_at: obsAt, station: st?.name || null, km: st ? round(st.km, 0) : null }),
    rain_mm: val(st ? num(st.reading.rain_mm) : null, pObs, { observed_at: obsAt }),
    wind_kmh: val(st ? num(st.reading.wind_kmh) : null, pObs, { observed_at: obsAt }),
    today: val(todayFc, pFc),
    words: todayFc ? todayFc.words : null,
    sky: todayFc ? todayFc.sky : null,
    next: days.filter(x => x.date > today).slice(0, 3),
    forecast: { place: city?.name || null, days, ...pFc },
  };
}
export async function getHere(id, { now = Date.now() } = {}) {
  const h = HERE[id];
  if (!h) return { ok: false, error: `unknown city "${id}"`, here: null, reads: [] };
  if (!h.live) return { ok: true, error: null, here: null, reads: [] };
  const [fc, obs] = await Promise.all([getJSON(sourceUrls('ipma-city-forecasts').latest), getJSON(sourceUrls('ipma-observations').latest)]);
  const reads = [fc, obs];
  if (!fc.ok && !obs.ok) return { ok: false, error: fc.error, here: null, reads };
  return { ok: true, error: [fc, obs].filter(r => !r.ok).map(r => `${r.url}: ${r.error}`).join('; ') || null, here: parseHere(id, fc.data, obs.data, now), reads };
}

// London, simulated: the visitor's weather, temperature and three days built from the same choice.
export function simulatedLondon({ weather = 'rain', temp = null, now = Date.now() } = {}) {
  const w = LONDON_WEATHER[weather] || LONDON_WEATHER.rain;
  const t = num(temp) ?? w.temp_c;
  const p = { source: 'simulated', publisher: 'you (the control beside the screen)', read_at: null, via: null };
  const today = ymdIn(new Date(now), 'Europe/London');
  const next = [1, 2, 3].map(i => {
    const d = new Date(Date.parse(`${today}T12:00:00Z`) + i * 86400000).toISOString().slice(0, 10);
    // A simple invented pattern around the chosen weather: the same sky, the temperature moving by a degree or two.
    return { date: d, t_max_c: t + [1, -1, 0][i - 1], t_min_c: t - 4 + [1, 0, -1][i - 1], words: w.words, sky: w.sky, cover: w.cover, simulated: true };
  });
  return {
    id: 'london', label: 'London', tz: 'Europe/London', lat: HERE.london.lat, lon: HERE.london.lon, live: false, simulated: true,
    weather, temp_c: val(t, p), words: w.words, sky: w.sky, cover: w.cover,
    today: val({ date: today, t_max_c: t, words: w.words, sky: w.sky }, p), next, station: null,
  };
}

// ---------- events (reference use only) ----------
export async function getEvents(placeId) {
  const r = await getJSON(sourceUrls('events-pt').latest);
  if (!r.ok) return { ok: false, error: r.error, events: [], read_at: null };
  const list = (r.data?.places?.[placeId] || []).map(e => ({
    start: e.startDate || null, end: e.endDate || null, venue: e.location?.name || null, url: e.url || null, source: e.source || null, read_at: e.read_at || null,
  }));
  return { ok: true, error: null, events: list, read_at: r.data?.read_at || null, places: Object.keys(r.data?.places || {}) };
}

// ---------- the decision a real screen would make ----------
const andList = a => a.length < 2 ? (a[0] || '') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`;
// decide(here, place, { now }) -> { run, mode: 'run' | 'switch' | 'pause', reasons, headline, line }
// run: here is colder, wetter or darker than the Algarve place. When the Algarve is wet now too,
// the white paper's answer is to pause or switch message: switch when a drier day is forecast.
export function decide(here, place, { now = Date.now(), daylight = null } = {}) {
  if (!place || !place.ok) {
    return { run: false, mode: 'pause', reasons: [], headline: 'A real screen would pause now.', line: 'A real screen would pause now: no live Algarve reading could be read, and it never shows a guess.' };
  }
  const a = place.temp_c?.value ?? null; // an observation only, never a forecast in its place
  const h = here?.temp_c?.value ?? null;
  const reasons = [];
  if (a !== null && h !== null && h <= a - 3) reasons.push(`colder (${round(h)}°C here, ${round(a)}°C in ${place.label})`);
  const algWetNow = (place.rain_mm?.value ?? 0) > 0 || isWet(place.today?.value?.weather_type);
  const hereWet = here?.sky === 'rain' || (here?.rain_mm?.value ?? 0) > 0;
  if (hereWet && !algWetNow) reasons.push('wetter');
  if (daylight && daylight.here_left === 0 && daylight.algarve_left > 0) reasons.push('darker (the sun has set here, not yet there)');
  else if (daylight && daylight.here_sunset && daylight.algarve_sunset && daylight.algarve_sunset - daylight.here_sunset >= 30 * 60000) reasons.push('darker (daylight ends earlier here)');
  const nameHere = here?.label || 'here';
  if (algWetNow) {
    const dry = (place.next || []).find(x => !isWet(x.weather_type) && (x.rain_prob_pct ?? 100) < 40);
    const why = `${place.label} is wet too (IPMA: ${place.today?.value?.words || 'rain observed'}${place.today?.value?.rain_prob_pct != null ? `, ${place.today.value.rain_prob_pct}% chance of rain today` : ''})`;
    if (dry && (hereWet || reasons.length)) {
      return { run: true, mode: 'switch', reasons, dry, wet: true,
        headline: `Rain in ${place.label} today too. Drier from ${fmtDay(dry.date)}.`,
        line: `A real screen would switch message now: ${why}. It would show the drier days ahead instead (${fmtDay(dry.date)}: ${dry.words}, up to ${round(dry.t_max_c)}°C, IPMA forecast).` };
    }
    return { run: false, mode: 'pause', reasons, wet: true, headline: 'A real screen would pause now.',
      line: `A real screen would pause now: ${why}${dry ? `, and ${nameHere} is not worse` : ', and no drier day is forecast in the next three'}.` };
  }
  if (reasons.length) {
    return { run: true, mode: 'run', reasons, wet: false, headline: null, line: `A real screen would run now: ${nameHere} is ${andList(reasons)}, compared with ${place.label}.` };
  }
  return { run: false, mode: 'pause', reasons, wet: false, headline: 'A real screen would pause now.',
    line: `A real screen would pause now: ${nameHere} is not colder, wetter or darker than ${place.label} at the moment.` };
}

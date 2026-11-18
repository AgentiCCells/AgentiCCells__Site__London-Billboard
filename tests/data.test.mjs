// Tests for src/assets/js/data.js, with hand-written fixtures and a stubbed fetch (no network).
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18. Code Apache-2.0.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as D from '../src/assets/js/data.js';

const fx = name => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const NOW = Date.parse('2026-11-18T18:00:00Z');

function stubFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, opts) => { calls.push(url); return handler(url, opts); };
  return calls;
}
const json = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });

test('getJSON: ok, one read per URL, HTTP error, network error, never rejects', async () => {
  D.clearCache();
  const calls = stubFetch(async url => {
    if (url.endsWith('/a.json')) return json({ a: 1 });
    if (url.endsWith('/b.json')) return json(null, 404);
    throw new TypeError('Failed to fetch');
  });
  const a1 = await D.getJSON('https://x.test/a.json');
  const a2 = await D.getJSON('https://x.test/a.json');
  assert.deepEqual(a1.data, { a: 1 });
  assert.equal(a1.ok, true);
  assert.equal(a2, a1);
  assert.equal(calls.filter(u => u.endsWith('/a.json')).length, 1);
  const b = await D.getJSON('https://x.test/b.json');
  assert.equal(b.ok, false); assert.equal(b.status, 404); assert.match(b.error, /HTTP 404/);
  const c = await D.getJSON('https://x.test/c.json');
  assert.equal(c.ok, false); assert.equal(c.status, 0); assert.match(c.error, /network request failed/);
});

test('getJSON: times out with AbortController', async () => {
  D.clearCache();
  stubFetch((url, opts) => new Promise((_, reject) => opts.signal.addEventListener('abort', () => { const e = new Error('aborted'); e.name = 'AbortError'; reject(e); })));
  const r = await D.getJSON('https://x.test/slow.json', { timeout: 20 });
  assert.equal(r.ok, false);
  assert.match(r.error, /no answer within/);
});

test('staleness: twice the cadence', () => {
  assert.equal(D.staleAfterMin('hourly'), 120);
  assert.equal(D.staleAfterMin('every 6 hours'), 720);
  assert.equal(D.staleAfterMin('daily'), 2880);
  assert.equal(D.isStale('2026-11-18T16:30:00Z', 'hourly', NOW), false);
  assert.equal(D.isStale('2026-11-18T15:30:00Z', 'hourly', NOW), true);
  assert.equal(D.isStale(null, 'hourly', NOW), true);
});

test('getCard: publisher and cadence from the card; a missing card says so', async () => {
  D.clearCache();
  stubFetch(async url => url.includes('ipma-sea') ? json({ publisher: 'P', schedule: { cadence: 'hourly' }, terms: { summary: 'T' } }) : json(null, 404));
  const c = await D.getCard('ipma-sea');
  assert.equal(c.ok, true); assert.equal(c.publisher, 'P'); assert.equal(c.cadence, 'hourly'); assert.equal(c.terms, 'T');
  const m = await D.getCard('ipma-uv');
  assert.equal(m.ok, false); assert.match(m.error, /404/); assert.equal(m.publisher, D.IPMA);
});

test('weather types: words and skies', () => {
  assert.equal(D.weatherWords(10), 'light rain');
  assert.equal(D.weatherWords(-99), 'no information');
  assert.equal(D.weatherWords(null), 'no information');
  assert.equal(D.skyOf(1).sky, 'sun');
  assert.equal(D.skyOf(5).sky, 'cloud');
  assert.equal(D.skyOf(10).sky, 'rain');
  assert.equal(D.isWet(6), true);
  assert.equal(D.uvBand(3), 'moderate');
});

test('parsePlace: every value carries source, publisher and read time', () => {
  const p = D.parsePlace('faro', fx('place-faro.json'), NOW);
  assert.equal(p.temp_c.value, 20.5);
  assert.equal(p.temp_c.source, 'ipma-observations');
  assert.equal(p.temp_c.publisher, D.IPMA);
  assert.equal(p.temp_c.read_at, '2026-11-18T17:41:00Z');
  assert.equal(p.temp_c.observed_at, '2026-11-18T17:00:00Z');
  assert.equal(p.today.value.words, 'light rain');
  assert.equal(p.today.source, 'ipma-city-forecasts');
  assert.equal(p.next.length, 3);
  assert.equal(p.next[0].date, '2026-11-19');
  assert.equal(p.sea_temp_c.value, 19.5); assert.equal(p.sea_temp_c.source, 'ipma-sea');
  assert.equal(p.uv.value, null); assert.match(p.uv.why_missing, /later day/); assert.equal(p.uv.source, 'ipma-uv'); // the file's uv is a later day
  assert.equal(p.warnings.value.length, 1); assert.equal(p.warnings.source, 'ipma-warnings');
  assert.equal(p.aircraft.value, 3);
  assert.equal(p.aircraft.source, 'adsb-faro');
  assert.equal(p.aircraft.words, 'aircraft seen near Faro airport now (adsb.lol, ODbL)');
  const q = D.parsePlace('quarteira', fx('place-faro.json'), NOW);
  assert.equal(q.label, 'Vilamoura (Quarteira)');
});

test('parsePlace: missing values stay null, never guessed', () => {
  const p = D.parsePlace('lagos', { read_at: '2026-11-18T17:00:00Z' }, NOW);
  assert.equal(p.temp_c.value, null);
  assert.equal(p.today.value, null);
  assert.equal(p.sea_temp_c.value, null);
  assert.equal(p.aircraft, null);
});

test('parseHere: Braga uses the nearest station with a reading, with its name and distance', () => {
  const h = D.parseHere('braga', fx('city-forecasts.json'), fx('observations.json'), NOW);
  assert.equal(h.station.name, 'Reporting station 20 km away');
  assert.ok(h.station.km >= 18 && h.station.km <= 22, `km ${h.station.km}`);
  assert.equal(h.temp_c.value, 13.5);
  assert.equal(h.temp_c.source, 'ipma-observations');
  assert.equal(h.today.value.words, 'rain and showers');
  assert.equal(h.sky, 'rain');
  assert.equal(h.live, true);
});

test('getPlace and getHere through a stubbed fetch; failure is reported, not thrown', async () => {
  D.clearCache();
  stubFetch(async url => {
    if (url.endsWith('/by-place/now/faro.json')) return json(fx('place-faro.json'));
    if (url.includes('ipma-city-forecasts')) return json(fx('city-forecasts.json'));
    if (url.includes('ipma-observations')) return json(fx('observations.json'));
    throw new TypeError('Failed to fetch');
  });
  const g = await D.getPlace('faro', { now: NOW });
  assert.equal(g.ok, true); assert.equal(g.place.temp_c.value, 20.5);
  const a = await D.getAircraft({ now: NOW });
  assert.equal(a.value, 3);
  const bad = await D.getPlace('lagos', { now: NOW });
  assert.equal(bad.ok, false); assert.equal(bad.place, null); assert.match(bad.error, /network/);
  const h = await D.getHere('porto', { now: NOW });
  assert.equal(h.ok, true); assert.equal(h.here.label, 'Porto');
  const l = await D.getHere('london');
  assert.equal(l.here, null);
});

test('simulatedLondon: labelled simulated, temperature from the control', () => {
  const l = D.simulatedLondon({ weather: 'drizzle', temp: 7, now: NOW });
  assert.equal(l.simulated, true);
  assert.equal(l.temp_c.value, 7);
  assert.equal(l.temp_c.source, 'simulated');
  assert.equal(l.sky, 'rain');
  assert.equal(l.next.length, 3);
  assert.equal(D.simulatedLondon({ weather: 'grey' }).temp_c.value, 10);
});

test('decide: a wet Algarve switches message, honestly', () => {
  const p = { ...D.parsePlace('faro', fx('place-faro.json'), NOW), ok: true };
  const d = D.decide(D.simulatedLondon({ weather: 'rain', now: NOW }), p, { now: NOW });
  assert.equal(d.mode, 'switch');
  assert.match(d.line, /wet too/);
  assert.match(d.headline, /Drier from Thu 19 Nov/);
});

test('decide: a dry Algarve and a rainy here runs; a warm sunny here pauses; no data pauses', () => {
  const f = fx('place-faro.json');
  f.forecast.days[0].weather_type = 1; f.forecast.days[0].rain_prob_pct = 0;
  const p = { ...D.parsePlace('faro', f, NOW), ok: true };
  const run = D.decide(D.simulatedLondon({ weather: 'rain', now: NOW }), p, { now: NOW });
  assert.equal(run.mode, 'run'); assert.match(run.line, /colder/); assert.match(run.line, /wetter/);
  const pause = D.decide(D.simulatedLondon({ weather: 'mild-sunny', temp: 24, now: NOW }), p, { now: NOW });
  assert.equal(pause.mode, 'pause'); assert.match(pause.line, /not colder, wetter or darker/);
  const none = D.decide(D.simulatedLondon({}), null);
  assert.equal(none.mode, 'pause'); assert.match(none.line, /never shows a guess/);
});

test('helpers: zoned time, clock, distance', () => {
  assert.equal(D.zoned('2026-07-01', 9, 'Europe/London').toISOString(), '2026-07-01T08:00:00.000Z');
  assert.equal(D.zoned('2026-11-18', 9, 'Europe/London').toISOString(), '2026-11-18T09:00:00.000Z');
  assert.equal(D.clock('2026-11-18T17:41:00Z', 'Europe/Lisbon'), '17:41');
  assert.ok(Math.abs(D.km(51.5074, -0.1278, 37.0194, -7.9322) - 1730) < 30);
});

test('fallbacks: city station list, Faro (Aeródromo) for a silent Algarve station, UV for today', () => {
  const obs = fx('observations.json');
  // Braga's listed stations: Braga (CIM) 6212124 silent, then Guimarães 1210625.
  obs.stations.push({ id: 6212124, name: 'Listed silent', lat: 41.5357, lon: -8.4251, reading: null });
  obs.stations.push({ id: 1210625, name: 'Listed second', lat: 41.4289, lon: -8.3178, reading: { temp_c: 16.3 } });
  obs.stations.push({ id: 1200554, name: 'Faro (Aeródromo)', lat: 37.0166, lon: -7.9720, reading: { temp_c: 20.5, wind_kmh: 22, rain_mm: 0 } });
  const h = D.parseHere('braga', fx('city-forecasts.json'), obs, NOW);
  assert.equal(h.station.name, 'Listed second');
  assert.equal(h.station.listed, true);
  assert.equal(h.station.km, 16);
  const f = fx('place-faro.json'); f.station.reading = null; f.station.name = 'Silent own station';
  const p = D.parsePlace('tavira', f, NOW);
  assert.equal(p.temp_c.value, null);
  D.applyStationFallback(p, obs);
  assert.equal(p.temp_c.value, 20.5);
  assert.equal(p.temp_c.fallback, true);
  assert.match(p.temp_c.note, /^nearest reporting station: Faro \(Aeródromo\), \d+ km$/);
  assert.equal(p.uv.value, null);
  D.applyUvToday(p, { read_at: '2026-11-18T17:41:15Z', places: [{ id: 0, days: [{ date: '2026-11-18', index: 9 }] }, { id: 1080500, days: [{ date: '2026-11-18', index: 2 }, { date: '2026-11-19', index: 3 }] }] }, NOW);
  assert.equal(p.uv.value, 2); assert.equal(p.uv.date, '2026-11-18'); assert.equal(p.uv.source, 'ipma-uv');
});

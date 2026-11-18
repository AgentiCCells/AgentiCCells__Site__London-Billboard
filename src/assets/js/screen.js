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
import { sunTimes, daylightLeft } from './sun.js';
import { drawScene, DRAWING_NOTE } from './scene.js';
import qrcode from './qrcode.js';

export const SITE = 'https://london-billboard.agenticcells.site';
export const PHASE_MS = 10000;
export const PHASES = ['now', 'compare', 'journey'];
const esc = D.esc;
const DASH = '--';
const t0 = v => (v === null || v === undefined) ? DASH : `${Math.round(v)}°C`;
const t1 = v => (v === null || v === undefined) ? DASH : `${D.round(v, 1)}°C`;
const tag = kind => ({ live: '<span class="tag tag-live">live</span>', sim: '<span class="tag tag-sim">simulated</span>', inv: '<span class="tag tag-inv">invented example</span>', stale: '<span class="tag tag-stale">may be out of date</span>', missing: '<span class="tag tag-missing">missing</span>' }[kind]);

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
const fmtDur = min => { const h = Math.floor(min / 60), m = Math.round(min % 60); return h ? `${h}h${m ? String(m).padStart(2, '0') : ''}` : `${m} min`; };

// journey(params, place, now) -> the invented example: legs, departure, arrival, and the line phase 3 shows.
export function journey(p, place, now) {
  const r = ROUTES[p.from] || ROUTES.london;
  const legs = r.legs(p);
  const before = legs.slice(0, -1).reduce((a, l) => a + l[1], 0);
  const main = legs[legs.length - 1][1];
  const after = [[r.mode === 'train' ? `Faro station to ${place?.label || 'the place'}` : `Faro airport to ${place?.label || 'the place'}`, (place?.from_faro_min ?? 30) + (r.mode === 'train' ? 0 : 25)]];
  const tz = D.HERE[p.from]?.tz || 'Europe/London';
  const today = D.ymdIn(now, tz);
  const tomorrow = new Date(Date.parse(`${today}T12:00:00Z`) + 86400000).toISOString().slice(0, 10);
  const dep = (ymd, h) => D.zoned(ymd, Math.floor(h), tz, Math.round((h % 1) * 60));
  const ready = new Date(now.getTime() + before * 60000);
  let departs = r.departs.map(h => dep(today, h)).find(d => d >= ready) || null;
  let day = 'today';
  if (!departs) { departs = dep(tomorrow, r.departs[0]); day = 'tomorrow'; }
  const arrive = new Date(departs.getTime() + main * 60000);
  const there = new Date(arrive.getTime() + after[0][1] * 60000);
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
  return { legs: [...legs, ...after], departs, arrive, there, day, sunset, mode, headline, route: r.mode, tz };
}

// ---------- reading everything the screen needs ----------
// buildState(params, { now }) -> state. Never rejects; a failed read leaves its values null with the reason.
export async function buildState(params = {}, { now: realNow = new Date() } = {}) {
  const p = normaliseParams(params);
  const H = D.HERE[p.from];
  // London's clock may be set to a chosen hour (simulated); the Portuguese cities use the real time.
  const now = (p.from === 'london' && p.hour !== null) ? D.zoned(D.ymdIn(realNow, H.tz), p.hour, H.tz) : realNow;
  const [placeRes, hereRes, aircraft, cardList] = await Promise.all([
    D.getPlace(p.to, { now: realNow.getTime() }),
    D.getHere(p.from, { now: realNow.getTime() }),
    D.getAircraft({ now: realNow.getTime() }),
    Promise.all(['ipma-observations', 'ipma-city-forecasts', 'ipma-sea', 'ipma-uv', 'ipma-warnings', 'adsb-faro'].map(D.getCard)),
  ]);
  const place = placeRes.place;
  const here = p.from === 'london' ? D.simulatedLondon({ weather: p.weather, temp: p.temp, now: now.getTime() }) : hereRes.here;
  const meta = D.PLACES[p.to];
  const hereSun = sunTimes(now, H.lat, H.lon);
  const algSun = sunTimes(now, meta.lat, meta.lon);
  const daylight = {
    here_sunset: hereSun.sunset, algarve_sunset: algSun.sunset,
    here_left: daylightLeft(now, H.lat, H.lon), algarve_left: daylightLeft(now, meta.lat, meta.lon),
  };
  const decision = D.decide(here, place ? { ...place, ok: true } : null, { now: now.getTime(), daylight });
  const cards = Object.fromEntries(cardList.map(c => [c.id, c]));
  return { params: p, now, realNow, simulatedClock: now !== realNow, here, hereRes, place, placeRes, meta, aircraft, daylight, decision, journey: journey(p, meta, now), plan: planUrl(p), cards };
}

// ---------- drawing the phases ----------
function staleTag(v, cards) {
  if (!v || !v.read_at) return '';
  const cad = cards?.[v.source]?.cadence || 'hourly';
  return D.isStale(v.read_at, cad) ? ' ' + tag('stale') : '';
}
function smallPrint(s) {
  const pl = s.place;
  const alg = pl ? `Algarve: IPMA via data.promptugal.news, read ${D.fmtUTC(pl.temp_c.read_at || pl.read_at)} ${tag('live')}` : `Algarve: no reading (${esc(s.placeRes.error || 'not read')}) ${tag('missing')}`;
  const here = s.here?.simulated
    ? `${esc(s.here.label)}: weather ${s.simulatedClock ? 'and time ' : ''}set by you ${tag('sim')}`
    : s.here ? `${esc(s.here.label)}: IPMA, ${esc(s.here.station?.name || 'no station')}${s.here.station ? ` (${s.here.station.km} km)` : ''}, read ${D.fmtUTC(s.here.temp_c.read_at)} ${tag('live')}` : `${esc(D.HERE[s.params.from].label)}: no reading (${esc(s.hereRes?.error || 'not read')}) ${tag('missing')}`;
  return `<footer class="screen-smallprint"><p><strong>Simulation.</strong> No real screen or campaign. ${alg}. ${here}. Journeys, flights and times: ${tag('inv')}. ${esc(DRAWING_NOTE)}.</p></footer>`;
}
function headlineBand(s) {
  const d = s.decision;
  if (d.mode === 'pause') return `<div class="screen-ribbon screen-ribbon-pause">${esc(d.headline)} (shown here for the demonstration)</div>`;
  return '';
}

function obsLine(pl) {
  const t = pl?.temp_c;
  if (!pl || !t) return 'No observation read.';
  if (t.value === null) return `No temperature this hour (${esc(t.why_missing || 'the station sent none')}).`;
  const when = t.observed_at ? esc(D.fmtUTC(t.observed_at)) : 'time unknown';
  if (t.fallback) return `${esc(t.own_station || 'The local station')} sent no temperature; ${esc(t.note)}, ${when}.`;
  return `Observed at ${esc(t.station || 'an IPMA station')}${pl.station?.km != null ? ` (${pl.station.km} km)` : ''}, ${when}.`;
}
function phaseNow(s) {
  const pl = s.place;
  const d = s.decision;
  const head = !pl
    ? '<h1 class="screen-headline">No live Algarve reading just now.</h1>'
    : d.mode === 'switch'
    ? `<h1 class="screen-headline">${esc(d.headline)}</h1>`
    : '<h1 class="screen-headline">This is the Algarve right now. <span class="screen-accent">You could be here.</span></h1>';
  const local = D.clock(s.realNow, D.PORTUGAL_TZ);
  const temp = pl?.temp_c?.value ?? null;
  const words = pl?.today?.value?.words || 'no forecast read';
  const ac = s.aircraft?.value;
  return `<section class="screen-phase phase-now" data-phase="now">
    ${head}
    <div class="screen-now">
      <p class="screen-place">${esc(s.meta.label)}</p>
      <p class="screen-time"><span data-clock="${D.PORTUGAL_TZ}">${esc(local)}</span> local time</p>
      <p class="screen-temp">${temp === null ? DASH : esc(t1(temp))} ${temp === null ? tag('missing') : tag('live') + staleTag(pl.temp_c, s.cards)}</p>
      <p class="screen-words">IPMA forecast for ${esc(pl?.forecast?.place || s.meta.label)} today: ${esc(words)}${pl?.today?.value?.rain_prob_pct != null ? `, ${pl.today.value.rain_prob_pct}% chance of rain` : ''}</p>
      <p class="screen-meta">${obsLine(pl)}${pl?.sea_temp_c?.value != null ? ` Sea up to ${esc(t1(pl.sea_temp_c.value))} (IPMA forecast).` : ''}${ac != null ? ` ${ac} ${esc(s.aircraft.words)} ${tag('live')}.` : ''}</p>
    </div>
  </section>`;
}

function dayRow(label, here, alg, hereLive) {
  const h = here ? `${t0(here.t_max_c)} ${esc(here.words || '')}` : DASH;
  const a = alg ? `${t0(alg.t_max_c)} ${esc(alg.words)}${alg.rain_prob_pct != null ? ` (${alg.rain_prob_pct}% rain)` : ''}` : DASH;
  return `<tr><th scope="row">${esc(label)}</th><td>${h}</td><td>${a}</td></tr>`;
}
function phaseCompare(s) {
  const pl = s.place, h = s.here;
  const hereName = h?.label || D.HERE[s.params.from].label;
  const hTag = h?.simulated ? tag('sim') : h ? tag('live') : tag('missing');
  const aTag = pl ? tag('live') : tag('missing');
  const hereTemp = h?.temp_c?.value ?? null;
  const algTemp = pl?.temp_c?.value ?? null;
  const days = [0, 1, 2].map(i => {
    const a = pl?.next?.[i] || null;
    const hh = h?.next?.[i] || null;
    const date = a?.date || hh?.date;
    return date ? dayRow(D.fmtDay(date), hh, a) : '';
  }).join('');
  const tzH = D.HERE[s.params.from].tz;
  const algSunset = s.daylight.algarve_sunset ? D.clock(s.daylight.algarve_sunset, D.PORTUGAL_TZ) : DASH;
  const hereSunset = s.daylight.here_sunset ? D.clock(s.daylight.here_sunset, tzH) : DASH;
  const ended = s.daylight.here_left === 0 && s.now > s.daylight.here_sunset;
  return `<section class="screen-phase phase-compare" data-phase="compare">
    <h1 class="screen-headline">${esc(hereName)} or ${esc(s.meta.label)}?</h1>
    <div class="screen-vs">
      <div class="screen-side side-here"><p class="side-name">${esc(hereName)} ${hTag}</p><p class="side-temp">${esc(t1(hereTemp))}</p><p class="side-words">${esc(h?.words || 'no reading')}</p></div>
      <div class="screen-side side-alg"><p class="side-name">${esc(s.meta.label)} ${aTag}</p><p class="side-temp">${esc(t1(algTemp))}</p><p class="side-words">${esc(pl?.today?.value?.words || 'no reading')}</p></div>
    </div>
    <table class="screen-days"><caption>Next three days (${h?.simulated ? `${esc(hereName)} simulated, ` : ''}IPMA forecast)</caption>
      <thead><tr><th></th><th>${esc(hereName)}</th><th>${esc(s.meta.label)}</th></tr></thead><tbody>${days || `<tr><td colspan="3">No forecast could be read.</td></tr>`}</tbody></table>
    <p class="screen-sunline"><span class="tag tag-computed">computed</span> Sunset in ${esc(s.meta.label)} at <strong>${esc(algSunset)}</strong>. Daylight in ${esc(hereName)} ${ended ? 'ended' : 'ends'} at <strong>${esc(hereSunset)}</strong>.</p>
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
  const legs = j.legs.map(([what, min]) => `<li>${esc(what)}: about ${esc(fmtDur(min))}</li>`).join('');
  const depart = `${j.route === 'train' ? 'the train' : 'a flight'} ${j.day === 'tomorrow' ? 'tomorrow ' : ''}at ${D.clock(j.departs, tz)}`;
  return `<section class="screen-phase phase-journey" data-phase="journey">
    <h1 class="screen-headline">${esc(j.headline)}</h1>
    <div class="screen-itinerary">
      <p class="itin-title">For example ${tag('inv')}</p>
      <p class="itin-depart">Leave ${esc(s.here?.label || D.HERE[s.params.from].label)} ${s.simulatedClock ? `at ${esc(D.clock(s.now, tz))} ${tag('sim')}` : 'now'}; catch ${esc(depart)}; in ${esc(s.meta.label)} by ${esc(D.clock(j.there, D.PORTUGAL_TZ))}${j.sunset ? `, sunset ${esc(D.clock(j.sunset, D.PORTUGAL_TZ))} (computed)` : ''}.</p>
      <ol>${legs}</ol>
    </div>
    <div class="screen-cta">${qrSvg(s.plan)}<p class="cta-text">Scan to plan<br><span>(a simulation)</span></p></div>
  </section>`;
}

const PHASE_FN = { now: phaseNow, compare: phaseCompare, journey: phaseJourney };

// ---------- mounting ----------
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// mountScreen(el, state, opts) -> controller.
// opts: theme ('live'), controls (true), decision (true), autoplay (true unless reduced motion),
//       phaseMs (10000), maxHeight (a px number or a function returning one; default 85% of the window), phase (0).
export function mountScreen(el, state, opts = {}) {
  const o = { theme: 'live', controls: true, decision: true, phaseMs: PHASE_MS, phase: 0, ...opts };
  let st = state, phase = Math.max(0, Math.min(2, Number(o.phase) || 0));
  let playing = o.autoplay ?? !reduced();
  let timer = null, clockTimer = null, sceneTimer = null;
  el.classList.add('screen-frame');
  el.innerHTML = `
    <div class="screen-fit"><div class="screen theme-${esc(o.theme)}" role="region" aria-roledescription="simulated billboard" aria-label="Simulated billboard screen" tabindex="0">
      <div class="screen-scene"></div><div class="screen-layer"></div>
    </div></div>
    ${o.controls ? `<div class="screen-controls" role="group" aria-label="Screen controls">
      <button type="button" data-act="prev" aria-label="Previous phase">Previous</button>
      <button type="button" data-act="toggle" aria-pressed="false">Pause</button>
      <button type="button" data-act="next" aria-label="Next phase">Next</button>
      <span class="screen-phase-label" aria-live="polite"></span>
    </div>` : ''}
    ${o.decision ? '<p class="screen-decision" aria-live="polite"></p>' : ''}`;
  const fit = el.querySelector('.screen-fit');
  const root = el.querySelector('.screen');
  const sceneEl = el.querySelector('.screen-scene');
  const layer = el.querySelector('.screen-layer');
  const label = el.querySelector('.screen-phase-label');
  const toggleBtn = el.querySelector('[data-act="toggle"]');
  const decisionEl = el.querySelector('.screen-decision');

  function scale() {
    const w = fit.parentElement.clientWidth || el.clientWidth || 360;
    const mh = typeof o.maxHeight === 'function' ? o.maxHeight() : (o.maxHeight || (typeof innerHeight === 'number' ? innerHeight * 0.85 : 1920));
    const k = Math.min(w / 1080, mh / 1920);
    root.style.transform = `scale(${k})`;
    fit.style.width = `${Math.round(1080 * k)}px`;
    fit.style.height = `${Math.round(1920 * k)}px`;
  }
  function drawSceneNow() {
    const pl = st.place;
    const fc = pl?.today?.value;
    sceneEl.innerHTML = drawScene({
      place: st.meta, at: new Date(),
      cover: fc?.cover ?? (pl ? 0.3 : 0.5),
      rain: (pl?.rain_mm?.value ?? 0) > 0 || fc?.sky === 'rain',
      windKmh: pl?.wind_kmh?.value ?? 0,
    });
  }
  function render() {
    const name = PHASES[phase];
    root.dataset.phase = name;
    root.classList.toggle('is-paused-decision', st.decision.mode === 'pause');
    layer.innerHTML = headlineBand(st) + PHASE_FN[name](st) + `<div class="screen-dots" aria-hidden="true">${PHASES.map((_, i) => `<span${i === phase ? ' class="on"' : ''}></span>`).join('')}</div>` + smallPrint(st);
    if (label) label.textContent = `Phase ${phase + 1} of 3${playing ? '' : ' (paused)'}`;
    if (toggleBtn) { toggleBtn.textContent = playing ? 'Pause' : 'Play'; toggleBtn.setAttribute('aria-pressed', String(!playing)); }
    if (decisionEl) decisionEl.innerHTML = `<strong>${st.decision.mode === 'run' ? 'Would run' : st.decision.mode === 'switch' ? 'Would switch message' : 'Would pause'}.</strong> ${esc(st.decision.line)}`;
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
    setTheme(name) { root.className = root.className.replace(/\btheme-[\w-]+/, `theme-${name}`); },
    destroy() { clearTimeout(timer); clearInterval(clockTimer); clearInterval(sceneTimer); ro?.disconnect(); removeEventListener('resize', scale); el.innerHTML = ''; },
  };
  el.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) ctl[b.dataset.act](); });
  el.addEventListener('keydown', e => {
    if (e.target.closest('input,select,textarea')) return;
    if (e.key === 'ArrowRight') { ctl.next(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { ctl.prev(); e.preventDefault(); }
    else if ((e.key === ' ' || e.key === 'k') && e.target === root) { ctl.toggle(); e.preventDefault(); }
  });
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(scale) : null;
  ro?.observe(el);
  addEventListener('resize', scale);
  // The local clock on the screen, and the scene's sun, move with real time.
  clockTimer = setInterval(() => {
    for (const c of root.querySelectorAll('[data-clock]')) c.textContent = D.clock(new Date(), c.dataset.clock);
  }, 15000);
  sceneTimer = setInterval(drawSceneNow, 5 * 60000);
  scale(); drawSceneNow(); render(); schedule();
  return ctl;
}

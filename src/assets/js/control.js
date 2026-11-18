// control.js: the panel beside the screen, and the home page's start-up.
// Chooses where the screen stands (London, simulated; Porto, Braga or Lisbon, live IPMA) and
// which Algarve place it shows. Keeps the choice in the page address (shareable) and in this
// browser's localStorage only; sends nothing anywhere. Lists every source with its publisher,
// read time, age, stale or missing flags, a link to its card, and IPMA's terms.
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18. Code Apache-2.0.

import * as D from './data.js';
import { buildState, mountScreen, normaliseParams, fitWindow, DEFAULTS, THEMES, EXAMPLE_NOTE } from './screen.js';

const esc = D.esc;
const KEY = 'london-billboard:screen:v1';
const PARAM_KEYS = ['from', 'station', 'to', 'weather', 'temp', 'hour'];
const SOURCES = ['ipma-observations', 'ipma-city-forecasts', 'ipma-sea', 'ipma-uv', 'ipma-warnings', 'adsb-faro'];

// ---------- state in the address and in localStorage ----------
export function readParams(search = location.search) {
  const q = new URLSearchParams(search);
  const fromUrl = Object.fromEntries(PARAM_KEYS.filter(k => q.has(k)).map(k => [k, q.get(k)]));
  if (Object.keys(fromUrl).length) return normaliseParams(fromUrl);
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') return normaliseParams(s); } catch { /* storage blocked: defaults */ }
  return normaliseParams({});
}
export function writeParams(p) {
  const q = new URLSearchParams(location.search);
  for (const k of PARAM_KEYS) q.delete(k);
  q.set('from', p.from);
  if (p.from === 'london') {
    q.set('station', p.station); q.set('weather', p.weather);
    if (p.temp !== null) q.set('temp', String(p.temp));
    if (p.hour !== null) q.set('hour', String(p.hour));
  }
  q.set('to', p.to);
  try { history.replaceState(null, '', `${location.pathname}?${q}${location.hash}`); } catch { /* file:// or sandboxed */ }
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage blocked: the address still holds it */ }
}

// ---------- the panel ----------
const opt = (v, label, cur) => `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(label)}</option>`;
function formHtml(p, example = false) {
  const live = example ? '<span class="tag tag-example">example</span>' : '<span class="tag tag-live">live</span>';
  const hours = [opt('live', 'Live clock', p.hour === null ? 'live' : '')].concat(Array.from({ length: 24 }, (_, h) => opt(h, `${String(h).padStart(2, '0')}:00`, p.hour))).join('');
  const w = D.LONDON_WEATHER[p.weather];
  return `<form class="control" aria-label="Screen settings" onsubmit="return false">
    <fieldset class="control-from"><legend>Screen location</legend>
      ${Object.values(D.HERE).map(h => `<label class="control-radio"><input type="radio" name="from" value="${h.id}"${p.from === h.id ? ' checked' : ''}> ${esc(h.label)} ${h.live ? live : '<span class="tag tag-sim">simulated</span>'}</label>`).join('')}
    </fieldset>
    <fieldset class="control-london"${p.from === 'london' ? '' : ' hidden'}><legend>London <span class="tag tag-sim">simulated</span></legend>
      <p class="control-note">No live London source is used (none exists on 2026-11-18): every London value is set by you.</p>
      <label>Weather (simulated) <select name="weather">${Object.entries(D.LONDON_WEATHER).map(([k, v]) => opt(k, v.label, p.weather)).join('')}</select></label>
      <label>Temperature (simulated): <output name="tempOut">${p.temp ?? w.temp_c}°C</output>
        <input type="range" name="temp" min="-5" max="30" step="1" value="${p.temp ?? w.temp_c}"></label>
      <label>Time (simulated when set) <select name="hour">${hours}</select></label>
      <label>Station (simulated) <select name="station">${Object.entries(D.STATIONS).map(([k, v]) => opt(k, v, p.station)).join('')}</select></label>
    </fieldset>
    <div class="control-here-live"${p.from === 'london' ? ' hidden' : ''} aria-live="polite"></div>
    <fieldset class="control-to"><legend>Algarve place ${live}</legend>
      <label>Show <select name="to">${Object.values(D.PLACES).map(pl => opt(pl.id, pl.label, p.to)).join('')}</select></label>
    </fieldset>
    <p class="control-share"><a class="control-link" href="">Link to this view</a> <span class="control-note">(the settings are in the address; this browser also remembers them)</span></p>
  </form>
  <section class="provenance" aria-labelledby="prov-h"><h2 id="prov-h">Where each figure comes from</h2><div class="provenance-body"><p>Reading the sources...</p></div></section>`;
}

function hereLiveHtml(s) {
  const h = s.here;
  const name = D.HERE[s.params.from].label;
  if (!h) return `<p class="control-error"><strong>${esc(name)}: IPMA's files could not be read just now</strong> (${esc(s.hereRes?.error || 'unknown reason')}). The screen shows no value for ${esc(name)} rather than a guess.</p>`;
  const st = h.station;
  return `<h3>${esc(name)} now <span class="tag tag-live">live</span></h3>
    <ul class="control-values">
      <li>Temperature: <strong>${h.temp_c.value === null ? 'no reading' : `${D.round(h.temp_c.value, 1)}°C`}</strong>${st ? ` at ${esc(st.name)}, ${st.km} km from the city centre (${st.listed ? 'the first station on this city\'s fixed list that reported a temperature this hour' : 'no listed station reported, so the nearest station that did'}, ${esc(D.fmtUTC(st.observed_at))})` : ' (no station near the city reported this hour)'}. Source: ${esc(D.IPMA)}, <code>ipma-observations</code>, read ${esc(D.fmtUTC(h.temp_c.read_at))}.</li>
      <li>Today: <strong>${esc(h.today.value?.words || 'no forecast read')}</strong>${h.today.value?.t_max_c != null ? `, up to ${D.round(h.today.value.t_max_c)}°C` : ''}${h.today.value?.rain_prob_pct != null ? `, ${h.today.value.rain_prob_pct}% chance of rain` : ''}. Source: IPMA, <code>ipma-city-forecasts</code> (${esc(h.forecast.place || name)}), read ${esc(D.fmtUTC(h.today.read_at))}.</li>
    </ul>`;
}

function readTimes(s) {
  const pl = s.place, h = s.here && !s.here.simulated ? s.here : null;
  return {
    'ipma-observations': pl?.temp_c?.read_at || h?.temp_c?.read_at || null,
    'ipma-city-forecasts': pl?.today?.read_at || h?.today?.read_at || null,
    'ipma-sea': pl?.sea_temp_c?.read_at || null,
    'ipma-uv': pl?.uv?.read_at || null,
    'ipma-warnings': pl?.warnings?.read_at || null,
    'adsb-faro': s.aircraft?.read_at || null,
  };
}
function exampleProvenanceHtml(s) {
  return `<p class="control-example"><strong>${esc(EXAMPLE_NOTE)}</strong> <span class="tag tag-example">example</span></p>
    <p>This view uses fixed, made-up values (the address has <code>example=1</code>), so previews and screenshots do not depend on the network. Nothing was read from data.promptugal.news, and no value on the screen is live: each one that would be read live is tagged "example". ${s.params.from === 'london' ? 'London\'s values are set by you (simulated); ' : ''}journeys, flights and times are invented examples; sunset times are computed in your browser (NOAA equations).</p>
    <p><a href="${esc(location.pathname)}">Show the live screen</a></p>`;
}
function provenanceHtml(s) {
  if (s.example) return exampleProvenanceHtml(s);
  const times = readTimes(s);
  const now = Date.now();
  const rows = SOURCES.map(id => {
    const c = s.cards[id] || {};
    const at = times[id];
    const age = D.ageMin(at, now);
    const stale = at && D.isStale(at, c.cadence || 'hourly', now);
    const flag = !at ? '<span class="tag tag-missing">missing</span>' : stale ? '<span class="tag tag-stale">stale</span>' : '<span class="tag tag-live">live</span>';
    const extra = id === 'adsb-faro' ? (s.aircraft ? ` ${s.aircraft.value} ${esc(s.aircraft.words)}.` : '') : '';
    return `<li><strong>${esc(c.card?.title || id)}</strong> ${flag}<br>
      Publisher: ${esc(c.publisher || id)}. ${at ? `Read ${esc(D.fmtUTC(at))}, ${esc(D.ago(age))}${c.cadence ? ` (collected ${esc(c.cadence)}; stale after ${D.staleAfterMin(c.cadence) / 60} hours)` : ''}.` : 'Not read on this page load.'}${extra}
      <a href="${esc(c.page || D.sourceUrls(id).page)}">Source page</a> · <a href="${esc(c.card_url || D.sourceUrls(id).card)}">Card</a>${c.ok ? '' : ` <em>(card not read: ${esc(c.error || 'unknown')})</em>`}</li>`;
  }).join('');
  const failed = [];
  if (!s.place) failed.push(`<li>${esc(s.meta.label)}: ${esc(s.placeRes.error || 'not read')} (<code>${esc(s.placeRes.url || '')}</code>)</li>`);
  if (s.params.from !== 'london' && !s.here) failed.push(`<li>${esc(D.HERE[s.params.from].label)}: ${esc(s.hereRes?.error || 'not read')}</li>`);
  const pl = s.place;
  const w = pl?.warnings;
  const warn = !pl ? '' : `<h3>Also from IPMA for ${esc(s.meta.label)}</h3><ul class="control-values">
    <li>Station: ${pl.temp_c.value === null ? esc(pl.temp_c.why_missing || 'no temperature this hour') : pl.temp_c.fallback ? `${esc(pl.temp_c.own_station || 'the place\'s own station')} sent no temperature; ${esc(pl.temp_c.note)}` : `${esc(pl.station?.name || '')}, ${pl.station?.km ?? '?'} km`}.</li>
    <li>Forecast place: ${esc(pl.forecast.place || 'not given')} (IPMA's nearest forecast place, which may be another town).</li>
    <li>UV index today (Faro): ${pl.uv.value === null ? esc(pl.uv.why_missing || 'not available') : `${pl.uv.value} (${esc(pl.uv.band)})`}.</li>
    <li>Sea: ${pl.sea_temp_c.value === null ? 'no sea temperature read' : `up to ${D.round(pl.sea_temp_c.value, 1)}°C, ${esc(pl.sea_temp_c.coast || '')}, ${esc(pl.sea_temp_c.date || '')}`}.</li>
    <li>Warnings (${esc(w.area || 'district')}): ${w.value.length ? w.value.map(x => `${esc(x.level)} for ${esc(x.type)}, ${esc((x.start || '').replace('T', ' ').slice(0, 16))} to ${esc((x.end || '').replace('T', ' ').slice(0, 16))} Portuguese local time${x.text ? ` (IPMA's text, in Portuguese: "${esc(x.text)}")` : ''}`).join('; ') : 'none active'}. Not a warning service: follow IPMA.</li>
    <li>Sunset times are computed here with NOAA's solar equations (no source).</li></ul>`;
  return `${warn}${failed.length ? `<div class="control-error"><p><strong>Some files could not be read just now.</strong> The screen leaves those values empty and never guesses them.</p><ul>${failed.join('')}</ul></div>` : ''}
    <ul class="provenance-list">${rows}</ul>
    <p class="provenance-terms">All values are read in your browser from <a href="${D.DATA_SITE}/">data.promptugal.news</a> (CC BY 4.0 for its records), which collects them from their publishers. ${esc(D.IPMA_TERMS)} <a href="${D.IPMA_TERMS_URL}">IPMA's terms</a>. adsb.lol counts are under <a href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL 1.0</a>. London's values are ${s.params.from === 'london' ? 'set by you (simulated)' : 'not shown while a Portuguese city is chosen'}; journeys, flights and times are invented examples. Not a warning service: follow <a href="https://www.ipma.pt/">IPMA</a>.</p>`;
}

// mountControl(panelEl, screenEl, opts) -> { params, screen, refresh }
export async function mountControl(panelEl, screenEl, opts = {}) {
  let p = readParams();
  panelEl.innerHTML = formHtml(p, !!opts.example);
  const form = panelEl.querySelector('form');
  const provBody = panelEl.querySelector('.provenance-body');
  const hereLive = panelEl.querySelector('.control-here-live');
  const link = panelEl.querySelector('.control-link');
  let screen = null, seq = 0;
  async function refresh() {
    const my = ++seq;
    writeParams(p);
    link.href = location.href;
    screenEl.setAttribute('aria-busy', 'true');
    const s = await buildState(p, { example: !!opts.example });
    if (my !== seq) return;
    screenEl.removeAttribute('aria-busy');
    if (!screen) screen = mountScreen(screenEl, s, opts.screen || {});
    else screen.update(s);
    provBody.innerHTML = provenanceHtml(s);
    hereLive.innerHTML = p.from === 'london' ? '' : s.example ? `<p>${esc(D.HERE[p.from].label)}: example values, not a reading <span class="tag tag-example">example</span>.</p>` : hereLiveHtml(s);
  }
  form.addEventListener('input', e => {
    const f = e.target.name;
    if (f === 'temp') { form.tempOut.value = `${e.target.value}°C`; p = normaliseParams({ ...p, temp: e.target.value }); }
    else if (f === 'weather') { p = normaliseParams({ ...p, weather: e.target.value, temp: null }); const t = D.LONDON_WEATHER[p.weather].temp_c; form.temp.value = t; form.tempOut.value = `${t}°C`; }
    else if (f === 'hour') p = normaliseParams({ ...p, hour: e.target.value === 'live' ? null : e.target.value });
    else if (f === 'from' || f === 'to' || f === 'station') p = normaliseParams({ ...p, [f]: e.target.value });
    else return;
    form.querySelector('.control-london').hidden = p.from !== 'london';
    hereLive.hidden = p.from === 'london';
    if (p.from !== 'london') hereLive.innerHTML = '<p>Reading IPMA...</p>';
    refresh();
  });
  await refresh();
  return { get params() { return p; }, get screen() { return screen; }, refresh };
}

// ---------- the home page ----------
// The width the screen may take: the main column, less the panel and the gap when they sit side by side.
function stageWidth(screenEl) {
  const main = screenEl.closest('main');
  const panel = main?.querySelector(':scope > .panel');
  if (!main) return screenEl.parentElement?.clientWidth || innerWidth;
  const cs = getComputedStyle(main);
  const inner = main.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const beside = panel && cs.gridTemplateColumns.trim().split(/\s+/).length > 1;
  return beside ? inner - panel.offsetWidth - (parseFloat(cs.columnGap) || 0) : inner;
}
const wide = () => !matchMedia('(max-width: 900px)').matches;

// Query options: ?kiosk=1 (only the screen and the band), ?theme=<name>, ?example=1 (the fixed example
// state), ?phase=1|2|3 (the phase to start on), ?autoplay=0|1.
export async function boot() {
  const screenEl = document.getElementById('billboard-screen');
  const panelEl = document.getElementById('billboard-control');
  if (!screenEl || !panelEl) return null;
  const q = new URLSearchParams(location.search);
  const kiosk = q.get('kiosk') === '1';
  const example = q.get('example') === '1';
  const themeQ = q.get('theme') || '';
  const theme = THEMES.includes(themeQ) || /^[a-z0-9-]{1,32}$/.test(themeQ) ? themeQ : 'live';
  const phase = Math.max(1, Math.min(3, Number(q.get('phase')) || 1)) - 1;
  const autoplay = q.get('autoplay') === '0' ? false : q.get('autoplay') === '1' ? true : undefined;
  const root = document.documentElement;
  if (kiosk) root.classList.add('is-kiosk');
  if (example) root.classList.add('is-example');
  const screen = kiosk
    ? { theme, phase, autoplay, controls: false, decision: false, keys: 'page', maxWidth: () => innerWidth, maxHeight: ctx => Math.max(240, innerHeight - ctx.top), minHeight: 240 }
    : { theme, phase, autoplay, maxWidth: () => stageWidth(screenEl), maxHeight: ctx => fitWindow(ctx, { belowTop: wide() }) };
  if (kiosk) hidePointer();
  return mountControl(panelEl, screenEl, { example, screen });
}
// Kiosk: hide the mouse pointer after 3 seconds without movement.
function hidePointer() {
  let t = null;
  const show = () => { document.documentElement.classList.remove('is-idle'); clearTimeout(t); t = setTimeout(() => document.documentElement.classList.add('is-idle'), 3000); };
  addEventListener('mousemove', show, { passive: true });
  show();
}
if (typeof document !== 'undefined' && document.getElementById('billboard-screen')) boot();
export { DEFAULTS };

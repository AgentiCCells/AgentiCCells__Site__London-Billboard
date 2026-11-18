// plan.js: the scripted planning assistant behind the billboard's QR code (/plan/).
// A simulation: pre-written intents and answers, matched to the visitor's words in the browser.
// No live model, nothing sent anywhere, nothing kept beyond the page. The weather is IPMA's live
// data via data.js; flights, prices and times are invented examples; events-pt is used for
// reference only, with its source named and linked. The greeting follows the example in
// Dinis Cruz's white paper.
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18. Code Apache-2.0.

import * as D from './data.js';
import { normaliseParams, journey } from './screen.js';

const esc = D.esc;
const log = document.getElementById('plan-log');
const quick = document.getElementById('plan-quick');
const form = document.getElementById('plan-form');
const ctx = document.getElementById('plan-context');

const q = new URLSearchParams(location.search);
const p = normaliseParams({ from: q.get('from'), station: q.get('station'), to: q.get('to') });
const place = D.PLACES[p.to];
const here = D.HERE[p.from];
const fromWords = p.from === 'london' ? `${D.STATIONS[p.station]}, London` : here.label;

const SMALL = 'Simulation: scripted answer, no live model. Nothing you type is sent or kept.';
const INV = '<span class="tag tag-inv">invented example</span>';
const LIVE = '<span class="tag tag-live">live</span>';

function say(who, html, small = '') {
  const li = document.createElement('li');
  li.className = `plan-msg plan-${who}`;
  li.innerHTML = who === 'bot' ? `${html}<p class="plan-small">${esc(SMALL)}${small ? ' ' + small : ''}</p>` : `<p>${esc(html)}</p>`;
  log.appendChild(li);
  li.scrollIntoView?.({ block: 'nearest' });
}

// The next Saturday (or today if it is Saturday) as YYYY-MM-DD, Portuguese time.
function nextDay(dow) {
  const today = D.ymdIn(new Date(), D.PORTUGAL_TZ);
  const d = new Date(`${today}T12:00:00Z`);
  const add = (dow - d.getUTCDay() + 7) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}
const addDays = (ymd, n) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

let placeData = null;
async function getPlace() {
  if (!placeData) placeData = await D.getPlace(p.to);
  return placeData;
}
function srcLine(v, what) {
  if (!v?.read_at) return `${what}: could not be read just now.`;
  return `${what}: IPMA via data.promptugal.news, read ${D.fmtUTC(v.read_at)}${D.isStale(v.read_at, 'hourly') ? ' (may be out of date)' : ''}.`;
}
async function forecastFor(dates) {
  const r = await getPlace();
  if (!r.ok) return { html: `<p>I could not read IPMA's forecast just now (${esc(r.error)}), so I will not guess the weather.</p>`, small: '' };
  const days = r.place.forecast.days;
  const rows = dates.map(d => {
    const x = days.find(y => y.date === d);
    return `<li>${esc(D.fmtDay(d))}: ${x ? `${esc(x.words)}, ${Math.round(x.t_min_c)} to ${Math.round(x.t_max_c)}°C, ${x.rain_prob_pct}% chance of rain` : 'beyond IPMA\'s five-day forecast for now'}</li>`;
  }).join('');
  return { html: `<p>IPMA's forecast for ${esc(r.place.forecast.place || place.label)} ${LIVE}:</p><ul>${rows}</ul>`, small: esc(srcLine(r.place.today, 'Forecast')) };
}

const INTENTS = [
  { id: 'weekend', label: 'This weekend', re: /week ?end|saturday|sunday|friday/i, run: async () => {
    const sat = nextDay(6), sun = addDays(sat, 1);
    const f = await forecastFor([sat, sun]);
    const j = p.from === 'lisboa' ? 'a train on Friday evening, about 3 hours' : `a flight on Friday evening, about ${p.from === 'london' ? '2h45' : '1h10'}`;
    return { html: `<p>A weekend in ${esc(place.label)}, ${esc(D.fmtDay(sat))} and ${esc(D.fmtDay(sun))}.</p>${f.html}<p>For example ${INV}: ${esc(j)}, back on Sunday evening; ${p.from === 'lisboa' ? 'train from €30 each way' : p.from === 'london' ? 'flights from £60 each way' : 'flights from €50 each way'}; two nights in a small hotel from ${p.from === 'london' ? '£70' : '€80'} a night. These prices are made up for this simulation; no fare or room was looked up.</p>`, small: f.small };
  } },
  { id: 'midweek', label: 'Midweek remote work', re: /mid ?week|remote|work|laptop|wifi|wi-fi|office/i, run: async () => {
    const tue = nextDay(2), dates = [tue, addDays(tue, 1), addDays(tue, 2)];
    const f = await forecastFor(dates);
    return { html: `<p>Working from ${esc(place.label)} from ${esc(D.fmtDay(tue))} to ${esc(D.fmtDay(dates[2]))}: midweek travel is usually quieter.</p>${f.html}<p>For example ${INV}: go on Monday evening, three working days, back on Thursday evening; ${p.from === 'london' ? 'flights from £45 each way' : 'travel from €40 each way'}; a room with a desk from ${p.from === 'london' ? '£60' : '€70'} a night. Check the internet connection with wherever you stay before booking. The prices are made up for this simulation.</p>`, small: f.small };
  } },
  { id: 'weather', label: 'What is the weather?', re: /weather|rain|sun|temp|warm|cold|forecast|hot|uv|sea/i, run: async () => {
    const r = await getPlace();
    if (!r.ok) return { html: `<p>I could not read IPMA's data just now (${esc(r.error)}), so I will not guess the weather.</p>` };
    const pl = r.place, t = pl.temp_c;
    const now = t.value === null ? `No temperature this hour (${esc(t.why_missing || 'the station sent none')}).` : `${D.round(t.value, 1)}°C ${LIVE} at ${esc(t.station)}${t.fallback ? `, ${t.km} km away (${esc(t.own_station || 'the local station')} sent no temperature this hour)` : ''}, observed ${esc(D.fmtUTC(t.observed_at))}.`;
    const next = pl.next.map(x => `<li>${esc(D.fmtDay(x.date))}: ${esc(x.words)}, up to ${Math.round(x.t_max_c)}°C, ${x.rain_prob_pct}% chance of rain</li>`).join('');
    const wet = D.isWet(pl.today.value?.weather_type);
    return { html: `<p>In ${esc(place.label)} now: ${now}</p><p>Today (IPMA forecast for ${esc(pl.forecast.place || place.label)}): ${esc(pl.today.value?.words || 'not read')}.${wet ? ' It is wet in the Algarve today too; I would not pretend otherwise.' : ''}</p>${next ? `<p>Next days:</p><ul>${next}</ul>` : ''}${pl.sea_temp_c.value != null ? `<p>Sea up to ${D.round(pl.sea_temp_c.value, 1)}°C (IPMA sea forecast, ${esc(pl.sea_temp_c.coast)}).</p>` : ''}${pl.uv.value != null ? `<p>UV index today in Faro: ${pl.uv.value} (${esc(pl.uv.band)}).</p>` : ''}`,
      small: esc(srcLine(t.value === null ? pl.today : t, 'Weather')) + ' IPMA: free use with no profit-making purpose, IPMA named as the source.' };
  } },
  { id: 'getthere', label: 'How do I get there?', re: /get there|how.*(go|get|travel)|flight|fly|plane|train|airport|price|cost|cheap|book/i, run: async () => {
    const j = journey(p, place, new Date());
    const legs = j.legs.map(([w, m]) => `<li>${esc(w)}: about ${m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}` : `${m} min`}</li>`).join('');
    return { html: `<p>From ${esc(fromWords)} to ${esc(place.label)}, for example ${INV}:</p><ol>${legs}</ol><p>Leaving now, the next example ${j.route === 'train' ? 'train' : 'flight'} would be ${j.day === 'tomorrow' ? 'tomorrow ' : ''}at ${esc(D.clock(j.departs, j.tz))}, and you would be in ${esc(place.label)} by ${esc(D.clock(j.there, D.PORTUGAL_TZ))}. These times and the departures are invented; no timetable or fare was looked up, and no booking can be made here.</p>` };
  } },
  { id: 'events', label: 'What is on?', re: /what.*on|event|concert|theatre|exhibition|show|museum|do there/i, run: async () => {
    const id = p.to === 'quarteira' ? 'quarteira' : p.to;
    const r = await D.getEvents(id);
    const page = `${D.DATA_SITE}/sources/events-pt/`;
    if (!r.ok) return { html: `<p>I could not read the events list just now (${esc(r.error)}). See <a href="${page}">events-pt on data.promptugal.news</a>.</p>` };
    if (!r.events.length) return { html: `<p>No events are collected for ${esc(place.label)} yet (events-pt covers ${esc(r.places.join(', ') || 'no places')} on this read). See <a href="${page}">events-pt</a> for what it covers.</p>`, small: 'Source: events-pt via data.promptugal.news (reference use only).' };
    // Dates and a link only: titles and venue names can name people, and this site names no person but Dinis Cruz.
    const host = u => { try { return new URL(u).hostname; } catch { return 'the source'; } };
    const list = r.events.slice(0, 5).map(e => `<li>${esc((e.start || '').replace('T', ' '))}${e.end ? ` to ${esc(e.end)}` : ''}: <a href="${esc(e.url)}">details on ${esc(host(e.url))}</a></li>`).join('');
    return { html: `<p>${r.events.length} events are listed for ${esc(place.label)} in the next 60 days. The first few:</p><ul>${list}</ul><p>Check with the organiser before travelling: this is a list read by code, not a ticket service.</p>`,
      small: `Source: events-pt via data.promptugal.news, read ${esc(D.fmtUTC(r.read_at))}, from the municipal and venue agendas named on each event; reference use only. <a href="${page}">About this source</a>.` };
  } },
];

async function answer(text, intent) {
  say('you', text);
  const it = intent || INTENTS.find(i => i.re.test(text));
  if (!it) {
    say('bot', '<p>I only have a few scripted answers in this simulation. Try one of the buttons: this weekend, midweek remote work, the weather, how to get there, or what is on.</p>');
    return;
  }
  try { const r = await it.run(); say('bot', r.html, r.small || ''); }
  catch (e) { say('bot', `<p>Something went wrong preparing that answer (${esc(e.message)}).</p>`); }
}

ctx.innerHTML = `You scanned the screen at <strong>${esc(fromWords)}</strong>${p.from === 'london' ? ' <span class="tag tag-sim">simulated</span>' : ''}, showing <strong>${esc(place.label)}</strong>. (From the link: <code>from=${esc(p.from)}${p.from === 'london' ? `&amp;station=${esc(p.station)}` : ''}&amp;to=${esc(p.to)}</code>.)`;
quick.innerHTML = INTENTS.map(i => `<button type="button" data-intent="${i.id}">${esc(i.label)}</button>`).join('');
quick.addEventListener('click', e => { const b = e.target.closest('[data-intent]'); if (b) answer(b.textContent, INTENTS.find(i => i.id === b.dataset.intent)); });
form.addEventListener('submit', e => { e.preventDefault(); const v = form.q.value.trim(); if (v) { answer(v); form.q.value = ''; } });
say('bot', `<p>Hi! Looks like you'd love some Algarve sun. I can help you plan a quick getaway to ${esc(place.label)}. Are you free this weekend, or looking for a midweek work-from-the-beach trip?</p>`);

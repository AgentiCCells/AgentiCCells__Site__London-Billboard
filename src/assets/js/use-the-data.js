// use-the-data.js: fills the "Status now" column on /use-the-data/ when the page opens.
// Reads, with GET only, the catalogue https://data.promptugal.news/api/v1/index.json (each
// source's status, cadence and read_at) and Faro's by-place file (its read_at, for the by-place
// row). Sends nothing and keeps nothing. On a failed read it says so and shows no status.
// Adapted from src/assets/js/use-the-data.js in AgentiCCells/AgentiCCells__Site__Algarve-Holiday-Homes
// (developer.algarve-holiday-homes@AgentiCCells.dinis, Apache-2.0, same organisation) by
// writer.london-billboard@AgentiCCells.dinis, 2026-11-18, round 1. Code Apache-2.0.
import { API, getJSON, placeUrl, fmtUTC, ago, ageMin, staleAfterMin, esc } from './data.js';

const cells = [...document.querySelectorAll('[data-status]')];
const note = document.getElementById('status-note');

function line(status, readAt, cadence, now) {
  const min = ageMin(readAt, now);
  const stale = min === null || min > staleAfterMin(cadence);
  const read = `read ${fmtUTC(readAt)}, ${ago(min)}`;
  return `${esc(status)}; ${stale ? `<strong class="stale">${esc(read)}, may be out of date</strong>` : esc(read)}`;
}

async function fill() {
  if (!cells.length) return;
  for (const c of cells) c.textContent = 'reading...';
  const [cat, faro] = await Promise.all([getJSON(`${API}/index.json`), getJSON(placeUrl('faro'))]);
  const now = Date.now();
  for (const c of cells) {
    const id = c.dataset.status;
    if (id === 'by-place') {
      c.innerHTML = faro.ok
        ? line('Faro file read', faro.data?.read_at, 'hourly', now)
        : `<span class="muted">could not read Faro's file (${esc(faro.error)})</span>`;
      continue;
    }
    if (!cat.ok) { c.innerHTML = '<span class="muted">could not read the catalogue</span>'; continue; }
    const s = (cat.data?.sources || []).find(x => x.id === id);
    c.innerHTML = s ? line(s.status || 'no status', s.read_at, s.cadence, now) : '<span class="muted">not in the catalogue</span>';
  }
  if (note) {
    note.textContent = cat.ok
      ? `Status and read times from the catalogue (api/v1/index.json) and Faro's by-place file, read by your browser at ${fmtUTC(new Date(now))}. Stale here means older than twice the source's cadence.`
      : `The catalogue could not be read just now (${cat.error}); no status is shown in its place.`;
  }
}
fill();

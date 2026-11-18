// draw.mjs: the round 1 design mock-ups, drawn as SVG (team/rounds/1/design/PROPOSAL.md).
// Run: node team/rounds/1/design/mockups/draw.mjs  (writes the .svg files beside this script).
// Every drawing here is our own: simple shapes and system fonts, no photos, no third-party images.
// Values shown are examples of shape only, not readings: the Faro temperature is the 17:00 UTC
// observation of 2026-11-18 (team/rounds/1/data/DATA.md section 8), paired with Faro's forecast words
// for 19 November so the "run" frames show a dry day; the "wet too" frame shows 18 November as read.
// London is simulated; journeys are invented examples. The real screen reads the data live.
// The chooser's previews are drawn in the example state (EX below): every "live" tag reads "example".
// designer.london-billboard@AgentiCCells.dinis, 2026-11-18, round 1 (revised after the design review). Code Apache-2.0; drawings CC BY 4.0.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SANS = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
const SERIF = 'Charter, Iowan Old Style, Palatino Linotype, Georgia, serif';
const MONO = 'ui-monospace, SF Mono, Menlo, Consolas, monospace';
const W = 1080, H = 1920;
let uid = 0; // ids for gradients and clips, deterministic so the files only change when the drawing does

// ---------- primitives ----------
const T = (x, y, s, size, fill, o = {}) => `<text x="${x}" y="${y}" font-family="${o.font || SANS}" font-size="${size}" font-weight="${o.w || 400}" fill="${fill}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.italic ? ' font-style="italic"' : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${esc(s)}</text>`;
const R = (x, y, w, h, fill, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${o.rx ? ` rx="${o.rx}"` : ''} fill="${fill}"${o.op != null ? ` opacity="${o.op}"` : ''}${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}` : ''}/>`;
const tw = (s, size) => s.length * size * 0.56;
// Tags. The word is always printed; the shape tells them apart in greyscale:
// live = filled, rounded, leading dot; simulated = outlined, rounded; invented example = dashed outline, rounded;
// computed = outlined, square corners, thick left edge; example = filled light, square corners, solid edge, leading open ring;
// may be out of date and missing = filled (yellow, grey), rounded.
// EX is the example state (preview images): there a "live" tag is drawn as "example", and read times print "example".
let EX = false;
const WORD = { live: 'live', sim: 'simulated', inv: 'invented example', comp: 'computed', ex: 'example', stale: 'may be out of date', missing: 'missing' };
const lead = k => (k === 'live' || k === 'ex');
const tagW = (kind, size) => { const k = EX && kind === 'live' ? 'ex' : kind; return tw(WORD[k], size) + size * 0.8 + (lead(k) ? size * 0.7 : 0) + (k === 'comp' ? size * 0.25 : 0); };
function tag(x, y, kind, size, pal) {
  if (EX && kind === 'live') kind = 'ex';
  const word = WORD[kind], c = pal.tags[kind];
  const pad = size * 0.4, w = tagW(kind, size), h = size * 1.35, sw = Math.max(2, size / 10), top = y - h * 0.78;
  let s = '';
  if (kind === 'live' || kind === 'stale' || kind === 'missing') s += R(x, top, w, h, c.bg, { rx: h * 0.3 });
  else if (kind === 'comp') s += R(x, top, w, h, c.bg, { stroke: c.ink, sw }) + R(x, top, size * 0.25, h, c.ink);
  else if (kind === 'ex') s += R(x, top, w, h, c.bg, { stroke: c.ink, sw });
  else s += R(x, top, w, h, c.bg, { rx: h * 0.3, stroke: c.ink, sw, dash: kind === 'inv' ? `${size * 0.35} ${size * 0.2}` : null });
  let tx = x + pad + (kind === 'comp' ? size * 0.25 : 0);
  if (kind === 'live') { s += `<circle cx="${tx + size * 0.25}" cy="${y - size * 0.32}" r="${size * 0.2}" fill="${c.ink}"/>`; tx += size * 0.7; }
  if (kind === 'ex') { s += `<circle cx="${tx + size * 0.25}" cy="${y - size * 0.32}" r="${size * 0.17}" fill="none" stroke="${c.ink}" stroke-width="${Math.max(2, size / 12)}"/>`; tx += size * 0.7; }
  s += T(tx, y, word, size, c.ink, { w: 700 });
  return { svg: s, w };
}
// text then a tag after it, on one line
const TT = (x, y, txt, size, fill, kind, tsize, pal, o = {}) => T(x, y, txt, size, fill, o) + tag(x + txt.length * size * (o.font === MONO ? 0.6 : 0.5) + 14, y, kind, tsize, pal).svg;
// read and observation times: "example" in the example state
const RD = () => EX ? 'read: example' : 'read 17:56 UTC';
const OBS = () => EX ? 'observed: example' : '17:00 UTC';
// wrap a line of text to a width (approximate, from tw)
function wrap(text, width, size) { const out = []; let ln = ''; for (const wd of text.split(' ')) { const t = ln ? ln + ' ' + wd : wd; if (tw(t, size) > width && ln) { out.push(ln); ln = wd; } else ln = t; } if (ln) out.push(ln); return out; }
const bars = (x, y, w, n, gap, h, fill) => Array.from({ length: n }, (_, i) => R(x, y + i * gap, i === n - 1 ? w * 0.6 : w, h, fill, { rx: h / 2 })).join('');

// ---------- the drawn scene (our own drawing; a mock-up of what scene.js draws) ----------
function scene(o = {}) {
  const { wet = false, dusk = false, top = 0, h = H, x = 0, w = W } = o;
  const sky1 = dusk ? '#27306b' : wet ? '#6f7c8c' : '#3b8bd4';
  const sky2 = dusk ? '#f2a65e' : wet ? '#b9c1c9' : '#bfe2f4';
  const id = `g${++uid}`;
  const k = h / H, hz = top + 1180 * k;
  let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient><clipPath id="c${id}"><rect x="${x}" y="${top}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#c${id})">`;
  s += R(x, top, w, h, `url(#${id})`);
  if (!wet) s += `<circle cx="${x + w * 0.7}" cy="${dusk ? hz - 40 * k : top + 520 * k}" r="${90 * k}" fill="${dusk ? '#ffb870' : '#ffd36b'}"/>`;
  if (wet) for (let i = 0; i < 5; i++) s += `<ellipse cx="${x + 120 + i * 220}" cy="${top + (300 + (i % 2) * 120) * k}" rx="${190 * k}" ry="${60 * k}" fill="#8b96a3"/>`;
  s += R(x, hz, w, h - (hz - top), dusk ? '#23406b' : wet ? '#5b7283' : '#2f78a8');
  s += `<path d="M${x} ${top + 1420 * k} Q${x + w / 2} ${top + 1360 * k} ${x + w} ${top + 1420 * k} L${x + w} ${top + h} L${x} ${top + h} Z" fill="${dusk ? '#6b5a48' : '#e6cf9e'}"/>`;
  // white houses on the shore
  for (let i = 0; i < 6; i++) {
    const bx = x + 40 + i * 120, bh = (80 + (i * 29) % 50) * k;
    s += R(bx, hz - bh, 100 * k, bh + 40 * k, dusk ? '#c9bfae' : '#f6f2ea');
    s += `<path d="M${bx - 5} ${hz - bh} L${bx + 50 * k} ${hz - bh - 36 * k} L${bx + 105 * k} ${hz - bh} Z" fill="#b5532e"/>`;
  }
  // a palm
  const px = x + w * 0.85, py = top + 1640 * k;
  s += `<path d="M${px} ${py} Q${px + 20 * k} ${py - 170 * k} ${px + 40 * k} ${py - 330 * k}" stroke="#7a5a3a" stroke-width="${20 * k}" fill="none"/>`;
  for (const a of [-150, -110, -60, -20, 20]) { const r = a * Math.PI / 180; s += `<path d="M${px + 40 * k} ${py - 330 * k} l${Math.cos(r) * 150 * k} ${Math.sin(r) * 90 * k + 40 * k}" stroke="#2f6b3a" stroke-width="${16 * k}" stroke-linecap="round"/>`; }
  if (wet) for (let i = 0; i < 40; i++) s += `<line x1="${x + (i * 97) % w}" y1="${top + ((i * 211) % h)}" x2="${x + (i * 97) % w - 10 * k}" y2="${top + ((i * 211) % h) + 40 * k}" stroke="#dfe7ee" stroke-width="${3 * k}" opacity=".7"/>`;
  return s + '</g>';
}

// ---------- palettes (PROPOSAL.md section 3) ----------
const darkTags = { live: { bg: '#7fd39a', ink: '#0d0f12' }, sim: { bg: 'none', ink: '#c9a8f5' }, inv: { bg: 'none', ink: '#ffa36b' }, comp: { bg: 'none', ink: '#8fd3e8' }, ex: { bg: '#f2f2ee', ink: '#0d0f12' }, stale: { bg: '#ffd166', ink: '#0d0f12' }, missing: { bg: '#9aa3ab', ink: '#0d0f12' } };
const P = {
  live: { name: 'Default (the developer\'s theme "live")', bg: '#0b1428', ink: '#ffffff', soft: '#e6e9ee', accent: '#ffd36b', here: '#9fb3c8', alg: '#ffd36b', panel: '#0a1626', panelOp: 0.78, sp: '#000000', spOp: 0.72, spInk: '#f2f2f2', ribbon: ['#fbe7a1', '#3a2e00'], font: SANS, head: SANS, fig: SANS,
    tags: { live: { bg: '#1f7a3f', ink: '#ffffff' }, sim: { bg: '#7a3fb0', ink: '#ffffff' }, inv: { bg: '#a13d1a', ink: '#ffffff' }, comp: { bg: '#2d5f8a', ink: '#ffffff' }, ex: { bg: '#f2f2f2', ink: '#1c1f23' }, stale: { bg: '#ffd166', ink: '#3a2e00' }, missing: { bg: '#555555', ink: '#ffffff' } } },
  poster: { name: 'Poster', bg: '#f4efe6', ink: '#1b1b1b', soft: '#4d4a45', accent: '#0e5a6b', here: '#3f5566', alg: '#8f4200', rule: '#cfc6b6', sp: '#e6dfd2', spInk: '#1b1b1b', ribbon: ['#1b1b1b', '#f4efe6'], font: SANS, head: SERIF, fig: SERIF,
    tags: { live: { bg: '#1d6b3a', ink: '#ffffff' }, sim: { bg: 'none', ink: '#6a3596' }, inv: { bg: 'none', ink: '#8a3410' }, comp: { bg: 'none', ink: '#0e5a6b' }, ex: { bg: '#ffffff', ink: '#1b1b1b' }, stale: { bg: '#ffd166', ink: '#1b1b1b' }, missing: { bg: '#555555', ink: '#ffffff' } } },
  board: { name: 'Departure board', bg: '#0d0f12', ink: '#f2f2ee', soft: '#a9b0b8', accent: '#ffb547', here: '#8fb4d9', alg: '#ffb547', panel: '#1a1e24', sp: '#1a1e24', spInk: '#f2f2ee', ribbon: ['#ffb547', '#0d0f12'], font: SANS, head: SANS, fig: MONO, tags: darkTags },
  postcard: { name: 'Postcard', bg: '#fbf4e6', ink: '#2a1f17', soft: '#5e5048', accent: '#a3402a', here: '#1e5c78', alg: '#a3402a', sp: '#fbf4e6', spInk: '#2a1f17', ribbon: ['#f6d77a', '#2a1f17'], font: SANS, head: SERIF, fig: SERIF,
    tags: { live: { bg: '#1d6b3a', ink: '#ffffff' }, sim: { bg: 'none', ink: '#6a3596' }, inv: { bg: 'none', ink: '#7a3410' }, comp: { bg: 'none', ink: '#245e5a' }, ex: { bg: '#ffffff', ink: '#2a1f17' }, stale: { bg: '#ffd166', ink: '#2a1f17' }, missing: { bg: '#555555', ink: '#ffffff' } } },
  readout: { name: 'Readout', bg: '#0e1a22', ink: '#e9eff3', soft: '#a7b6c0', accent: '#6cc4e8', here: '#a9b8c6', alg: '#ffc872', panel: '#15252f', sp: '#15252f', spInk: '#e9eff3', ribbon: ['#ffc872', '#0e1a22'], font: SANS, head: SANS, fig: MONO,
    tags: { ...darkTags, live: { bg: '#7fd39a', ink: '#0e1a22' }, comp: { bg: 'none', ink: '#6cc4e8' }, ex: { bg: '#e9eff3', ink: '#0e1a22' } } },
  dusk: { name: 'Dusk', bg: '#171b36', ink: '#f5efe6', soft: '#c9c2d6', accent: '#ffb870', here: '#9fb0e0', alg: '#ffb870', rose: '#f59a8b', panel: '#232848', sp: '#232848', spInk: '#f5efe6', ribbon: ['#ffb870', '#171b36'], font: SANS, head: SANS, fig: SANS,
    tags: { ...darkTags, live: { bg: '#7fd39a', ink: '#171b36' }, sim: { bg: 'none', ink: '#d4b8ff' }, comp: { bg: 'none', ink: '#9fd8f0' }, ex: { bg: '#f5efe6', ink: '#171b36' } } },
};

// ---------- shared pieces of a screen ----------
function smallPrint(pal, y0 = 1680) {
  const s = 26, x = 64;
  let out = pal.spOp != null ? R(0, y0, W, H - y0, pal.sp, { op: pal.spOp }) : R(0, y0, W, H - y0, pal.sp);
  if (pal.rule) out += R(0, y0, W, 3, pal.rule);
  out += T(x, y0 + 44, 'Simulation. No real screen or campaign.', s, pal.spInk, { w: 700, font: pal.font });
  let y = y0 + 84;
  out += TT(x, y, `Faro: IPMA via data.promptugal.news, ${RD()}`, s, pal.spInk, 'live', s, pal, { font: pal.font });
  y += 40;
  out += T(x, y, 'London: weather set by you', s, pal.spInk, { font: pal.font });
  const t = tag(x + tw('London: weather set by you', s) + 12, y, 'sim', s, pal); out += t.svg;
  const jx = x + tw('London: weather set by you', s) + 24 + t.w;
  out += T(jx, y, 'Journeys:', s, pal.spInk, { font: pal.font });
  out += tag(jx + tw('Journeys:', s) + 10, y, 'inv', s, pal).svg;
  y += 40;
  if (EX) {
    out += T(x, y, 'Drawing, not a camera (live.promptugal.news has none yet).', s, pal.spInk, { font: pal.font });
    out += T(x, y + 38, 'Example values for this preview, not a reading.', s, pal.spInk, { font: pal.font, w: 700 });
  } else {
    out += T(x, y, 'Drawing, not a camera: live.promptugal.news offers no cameras yet', s, pal.spInk, { font: pal.font });
    out += T(x, y + 38, '(checked 2026-11-18).', s, pal.spInk, { font: pal.font });
  }
  return out;
}
const dots = (pal, i, y = 1640) => [0, 1, 2].map(k => `<circle cx="${W / 2 - 40 + k * 40}" cy="${y}" r="11" fill="${k === i ? pal.ink : pal.soft}" opacity="${k === i ? 1 : 0.5}"/>`).join('');
function qr(x, y, size) {
  // A drawn stand-in for the QR code (not a working code): finder squares and a module pattern.
  let s = R(x, y, size, size, '#ffffff', { rx: 10 });
  const m = size / 33, q = x + 4 * m, r = y + 4 * m;
  const finder = (fx, fy) => R(fx, fy, 7 * m, 7 * m, '#000') + R(fx + m, fy + m, 5 * m, 5 * m, '#fff') + R(fx + 2 * m, fy + 2 * m, 3 * m, 3 * m, '#000');
  s += finder(q, r) + finder(q + 18 * m, r) + finder(q, r + 18 * m);
  for (let i = 0; i < 25; i++) for (let j = 0; j < 25; j++) {
    if ((i < 8 && j < 8) || (i < 8 && j > 16) || (i > 16 && j < 8)) continue;
    if (((i * 7 + j * 13 + i * j) % 5) < 2) s += R(q + j * m, r + i * m, m, m, '#000');
  }
  return s;
}
const scrim = (y, h, op = 0.72) => R(0, y, W, h, '#0a1626', { op });

// ---------- the default screen, three phases and the pause state (section 2) ----------
function defaultPhase(i, o = {}) {
  const pal = P.live; let s = '';
  const wet = o.wet;
  s += scene({ wet });
  if (o.ribbon) { s += R(0, 0, W, 150, pal.ribbon[0]); s += T(64, 62, 'A real screen would pause now:', 38, pal.ribbon[1], { w: 800 }); s += T(64, 112, 'rain in Faro today too. Shown for the demonstration.', 32, pal.ribbon[1], { w: 600 }); }
  const top = o.ribbon ? 150 : 0;
  if (i === 0) {
    s += scrim(top, 380);
    if (o.switchMsg) { s += T(64, top + 130, 'Rain in Faro today too.', 84, pal.ink, { w: 800 }); s += T(64, top + 240, 'Drier from Thu 19 Nov.', 84, pal.accent, { w: 800 }); }
    else { s += T(64, top + 130, 'This is the Algarve', 92, pal.ink, { w: 800 }); s += T(64, top + 235, 'right now.', 92, pal.ink, { w: 800 }); s += T(64, top + 330, 'You could be here.', 72, pal.accent, { w: 800 }); }
    s += R(64, 1020, W - 128, 590, pal.panel, { rx: 28, op: pal.panelOp });
    s += T(112, 1100, 'Faro', 64, pal.ink, { w: 800 }); s += T(290, 1100, '18:02 local time', 40, pal.soft);
    s += T(112, 1290, '20.6°C', 180, pal.accent, { w: 800 }); s += tag(790, 1200, 'live', 40, pal).svg;
    s += T(112, 1370, o.wet ? 'IPMA today: light rain, 100% chance of rain' : 'IPMA today: partly cloudy, 6% chance of rain', 40, pal.ink);
    s += T(112, 1430, `Observed at Faro (Aeródromo), 4 km, ${OBS()}.`, 32, pal.soft);
    s += T(112, 1490, 'Sea up to 19.8°C (IPMA forecast)', 32, pal.soft); s += tag(992 - tagW('live', 30), 1490, 'live', 30, pal).svg;
    s += T(112, 1550, '4 aircraft seen near Faro airport now', 32, pal.soft); s += T(112, 1590, '(adsb.lol, ODbL)', 28, pal.soft); s += tag(992 - tagW('live', 30), 1550, 'live', 30, pal).svg;
  } else if (i === 1) {
    s += R(0, 0, W, H, '#050c19', { op: 0.6 });
    s += T(64, top + 150, 'London or Faro?', 92, pal.ink, { w: 800 });
    for (const [k, nm, t, wd, col, tg] of [[0, 'London', '9.0°C', 'rain', pal.here, 'sim'], [1, 'Faro', '20.6°C', 'partly cloudy', pal.alg, 'live']]) {
      const x = 64 + k * 488;
      s += R(x, top + 220, 464, 380, pal.panel, { rx: 28, op: pal.panelOp }); s += R(x, top + 220, 464, 14, col, { rx: 6 });
      s += T(x + 36, top + 300, nm, 46, pal.ink, { w: 700 }); s += tag(x + 36, top + 360, tg, 32, pal).svg;
      s += T(x + 36, top + 490, t, 120, k ? pal.alg : pal.ink, { w: 800 }); s += T(x + 36, top + 560, wd, 40, pal.ink);
    }
    const ty = top + 660;
    s += T(64, ty + 20, 'Next three days', 30, pal.soft, { w: 700 });
    s += R(64, ty + 44, W - 128, 380, pal.panel, { rx: 28, op: pal.panelOp });
    s += T(100, ty + 110, 'Day', 30, pal.soft, { w: 700 });
    s += TT(300, ty + 110, 'London', 30, pal.soft, 'sim', 26, pal, { w: 700 }); s += TT(620, ty + 110, 'Faro', 30, pal.soft, 'live', 26, pal, { w: 700 });
    [['Thu 19', '8°C showers', '21°C partly cloudy'], ['Fri 20', '10°C grey', '20°C high cloud'], ['Sat 21', '9°C rain', '19°C sunny intervals']].forEach((r, j) => {
      const y = ty + 198 + j * 88;
      s += T(100, y, r[0], 36, pal.ink, { w: 700 }); s += T(300, y, r[1], 36, pal.ink); s += T(620, y, r[2], 36, pal.alg);
    });
    s += R(64, ty + 470, W - 128, 210, pal.panel, { rx: 28, op: pal.panelOp });
    s += T(104, ty + 545, 'Sunset in Faro at 17:21.', 46, pal.ink); s += T(104, ty + 610, 'Daylight in London ended at 16:08.', 46, pal.ink);
    s += tag(104, ty + 660, 'comp', 26, pal).svg; s += T(104 + tagW('comp', 26) + 14, ty + 660, 'both times, in the browser (NOAA equations)', 24, pal.soft);
  } else {
    s += R(0, 0, W, H, '#050c19', { op: 0.55 });
    s += T(64, top + 150, 'You are 5 hours', 100, pal.ink, { w: 800 }); s += T(64, top + 250, 'away from this sunset', 72, pal.accent, { w: 800 });
    s += R(64, top + 330, W - 128, 640, pal.panel, { rx: 28, op: pal.panelOp });
    s += T(108, top + 410, 'For example', 36, pal.ink, { w: 700 }); s += tag(330, top + 410, 'inv', 32, pal).svg;
    s += T(108, top + 480, 'Leave Oxford Circus at 09:00; flight at 11:00;', 34, pal.ink); s += TT(108, top + 528, 'in Faro by 14:40, sunset 17:21', 34, pal.ink, 'comp', 30, pal);
    ['1. Train to a London airport: about 1h', '2. At the airport before the flight: 1h30', '3. Flight to Faro: 2h45', '4. Faro airport to the marina: 40 min'].forEach((l, j) => { s += T(108, top + 610 + j * 70, l, 34, pal.ink); });
    s += R(64, 1180, W - 128, 420, pal.panel, { rx: 28, op: pal.panelOp });
    s += qr(104, 1220, 340); s += T(484, 1360, 'Scan to plan', 72, pal.ink, { w: 800 }); s += T(484, 1430, '(a simulation)', 44, pal.soft);
    s += T(484, 1500, 'scripted answers, no live model', 28, pal.soft);
  }
  s += dots(pal, i); s += smallPrint(pal);
  return s;
}

// The safe areas and type scale, drawn on an empty frame (sizes and distances as in PROPOSAL.md 2.1).
function gridFrame() {
  const pal = P.live; let s = R(0, 0, W, H, '#f4f6f8');
  s += R(0, 0, W, H, 'none', { stroke: '#c0392b', sw: 4 });
  s += R(48, 48, W - 96, H - 96, 'none', { stroke: '#c0392b', sw: 3, dash: '18 12' });
  s += R(64, 64, W - 128, H - 128, 'none', { stroke: '#1f5f8b', sw: 3, dash: '6 8' });
  s += R(0, 1680, W, 240, '#d7dde3');
  s += R(0, 0, W, 150, '#fbe7a1', { op: 0.7 });
  const L = (y, txt, size, c = '#1c1f23') => T(84, y, txt, size, c, { w: 700 });
  s += T(84, 110, 'Ribbon (pause or switch), 150 px', 34, '#3a2e00', { w: 700 });
  s += L(300, 'Headline 92 px', 92); s += T(800, 300, '7 to 8 m', 30, '#1c1f23');
  s += L(500, '20.6°C', 180); s += T(780, 500, 'figure 180 px', 30, '#1c1f23');
  s += L(600, 'Place, side names 64 px', 64);
  s += L(700, 'Body 40 px (3.4 to 3.9 m)', 40);
  s += L(780, 'Secondary 34 px (3 m)', 34);
  s += L(850, 'Tags: 40 px beside the hero figure,', 32); s += L(895, 'at least 30 px elsewhere', 32);
  s += L(960, 'Small print 26 px (2 m)', 26);
  s += T(84, 1060, 'Red dashed: 48 px bezel and case margin.', 30, '#c0392b');
  s += T(84, 1110, 'Blue dashed: 64 px safe margin for all text.', 30, '#1f5f8b');
  s += T(84, 1160, 'Grey band: small print, 240 px, always on, opaque.', 30, '#1c1f23');
  s += T(84, 1210, 'At 1 px = about 1 mm (86-inch portrait panel, computed).', 30, '#1c1f23');
  s += T(84, 1290, 'Tag shapes:', 30, '#1c1f23', { w: 700 });
  let x = 84; for (const k of ['live', 'sim', 'inv']) { s += tag(x, 1350, k, 30, pal).svg; x += tagW(k, 30) + 16; }
  x = 84; for (const k of ['comp', 'ex', 'stale', 'missing']) { s += tag(x, 1410, k, 30, pal).svg; x += tagW(k, 30) + 16; }
  s += T(84, 1620, 'Phase dots at 1640 px', 28, '#1c1f23');
  s += dots({ ink: '#1c1f23', soft: '#5b6670' }, 0);
  s += T(84, 1760, 'Small print: Simulation, sources, read times,', 26, '#1c1f23', { w: 700 }); s += T(84, 1800, 'the tags and the drawing note.', 26, '#1c1f23', { w: 700 });
  return s;
}

// ---------- the five designs (section 3), each in its three phases ----------
const D = {};
D.poster = i => {
  const pal = P.poster; let s = R(0, 0, W, H, pal.bg);
  s += T(64, 110, 'THE ALGARVE, RIGHT NOW', 30, pal.soft, { w: 700, ls: 4 }); s += R(64, 130, W - 128, 3, pal.ink);
  if (i === 0) {
    s += scene({ top: 170, h: 760, x: 64, w: W - 128 });
    s += T(64, 970, 'Drawing, not a camera', 26, pal.soft, { italic: true, font: SERIF });
    s += T(64, 1100, 'This is Faro', 96, pal.ink, { font: SERIF, w: 700 }); s += T(64, 1200, 'right now.', 96, pal.ink, { font: SERIF, w: 700 });
    s += T(64, 1440, '20.6°C', 210, pal.alg, { font: SERIF, w: 700 }); s += tag(760, 1360, 'live', 40, pal).svg;
    s += T(64, 1520, 'Partly cloudy today, IPMA. 18:02 in Faro.', 40, pal.ink); s += T(64, 1580, `Faro (Aeródromo) station, 4 km, ${OBS()}`, 32, pal.soft);
  } else if (i === 1) {
    s += T(64, 260, 'London or Faro?', 100, pal.ink, { font: SERIF, w: 700 });
    s += R(538, 320, 3, 560, pal.rule);
    for (const [k, nm, t, wd, col, tg] of [[0, 'London', '9.0°C', 'rain', pal.here, 'sim'], [1, 'Faro', '20.6°C', 'partly cloudy', pal.alg, 'live']]) {
      const x = 64 + k * 500; s += T(x, 400, nm, 56, col, { font: SERIF, w: 700 }); s += tag(x, 470, tg, 32, pal).svg;
      s += T(x, 660, t, 150, col, { font: SERIF, w: 700 }); s += T(x, 740, wd, 40, pal.ink);
    }
    s += R(64, 920, W - 128, 3, pal.ink);
    s += T(64, 975, 'Day', 30, pal.soft, { w: 700 }); s += TT(260, 975, 'London', 30, pal.here, 'sim', 26, pal, { w: 700 }); s += TT(590, 975, 'Faro', 30, pal.alg, 'live', 26, pal, { w: 700 });
    [['Thu 19', '8°C showers', '21°C partly cloudy'], ['Fri 20', '10°C grey', '20°C high cloud'], ['Sat 21', '9°C rain', '19°C sunny intervals']].forEach((r, j) => { const y = 1050 + j * 85; s += T(64, y, r[0], 38, pal.ink, { w: 700 }); s += T(260, y, r[1], 38, pal.here); s += T(590, y, r[2], 38, pal.alg); s += R(64, y + 28, W - 128, 1, pal.rule); });
    s += T(64, 1350, 'Sunset in Faro at 17:21.', 50, pal.ink, { font: SERIF }); s += T(64, 1425, 'Daylight in London ended at 16:08.', 50, pal.ink, { font: SERIF });
    s += tag(64, 1490, 'comp', 30, pal).svg; s += T(64 + tagW('comp', 30) + 14, 1490, 'both sun times (NOAA equations). Forecast: IPMA.', 28, pal.soft);
  } else {
    s += T(64, 270, 'You are 5 hours', 104, pal.ink, { font: SERIF, w: 700 }); s += T(64, 380, 'from this sunset.', 104, pal.alg, { font: SERIF, w: 700 });
    s += T(64, 470, 'For example', 36, pal.ink, { w: 700 }); s += tag(290, 470, 'inv', 36, pal).svg;
    [['09:00', 'Leave Oxford Circus'], ['11:00', 'Flight to Faro'], ['14:40', 'Faro marina'], ['17:21', 'Sunset']].forEach((r, j) => { const y = 580 + j * 100; s += T(64, y, r[0], 52, pal.alg, { font: SERIF, w: 700 }); s += T(260, y, r[1], 44, pal.ink); if (j === 3) s += tag(260 + tw(r[1], 44) + 20, y, 'comp', 30, pal).svg; s += R(64, y + 30, W - 128, 1, pal.rule); });
    s += qr(64, 1080, 380); s += T(490, 1230, 'Scan to plan', 70, pal.ink, { font: SERIF, w: 700 }); s += T(490, 1300, '(a simulation)', 44, pal.soft, { font: SERIF, italic: true });
  }
  s += dots(pal, i); s += smallPrint(pal); return s;
};
D.board = i => {
  const pal = P.board; let s = R(0, 0, W, H, pal.bg);
  s += scene({ top: 0, h: i === 0 ? 720 : 360, wet: false });
  const y0 = i === 0 ? 720 : 360;
  s += R(0, y0, W, 90, pal.accent); s += T(64, y0 + 62, ['ALGARVE NOW', 'HERE OR THERE', 'EXAMPLE JOURNEY'][i], 48, pal.bg, { w: 900, ls: 6 });
  const row = (y, a, b, c, col = pal.ink, big = 52, extra = '') => R(48, y - 64, W - 96, 96, pal.panel, { rx: 6 }) + T(80, y, a, big, col, { font: MONO, w: 700 }) + T(420, y, b, big, col, { font: MONO, w: 700 }) + (c ? T(W - 80, y, c, big, col, { font: MONO, w: 700, anchor: 'end' }) : '') + extra;
  if (i === 0) {
    s += T(64, y0 + 190, 'FARO', 110, pal.ink, { w: 900, ls: 4 }); s += tag(400, y0 + 180, 'live', 40, pal).svg; s += T(64, y0 + 370, '20.6°C', 200, pal.accent, { font: MONO, w: 700 });
    s += row(y0 + 500, 'TODAY', 'PART CLOUD', '6%', pal.ink, 52, tag(80 + 5 * 52 * 0.6 + 16, y0 + 496, 'live', 26, pal).svg);
    s += row(y0 + 600, 'SEA', 'UP TO', '19.8°C', pal.ink, 52, tag(80 + 3 * 52 * 0.6 + 16, y0 + 596, 'live', 26, pal).svg);
    s += row(y0 + 700, 'LOCAL', 'TIME', '18:02');
    s += T(64, y0 + 790, `AIR: IPMA, Faro (Aeródromo) 4 km, ${OBS()}.`, 26, pal.soft);
    s += T(64, y0 + 828, 'TODAY: IPMA forecast for Faro. SEA: IPMA sea forecast,', 26, pal.soft);
    s += T(64, y0 + 866, 'Faro coast (a forecast, not the station reading).', 26, pal.soft);
  } else if (i === 1) {
    s += T(80, y0 + 180, 'DAY', 34, pal.soft, { font: MONO, w: 700 }); s += T(330, y0 + 180, 'LONDON', 34, pal.here, { font: MONO, w: 700 }); s += tag(500, y0 + 180, 'sim', 28, pal).svg; s += T(680, y0 + 180, 'FARO', 34, pal.alg, { font: MONO, w: 700 }); s += tag(800, y0 + 180, 'live', 28, pal).svg;
    [['NOW', '9°C', '21°C'], ['THU', '8°C', '21°C'], ['FRI', '10°C', '20°C'], ['SAT', '9°C', '19°C']].forEach((r, j) => { const y = y0 + 300 + j * 120; s += R(48, y - 70, W - 96, 104, pal.panel, { rx: 6 }); s += T(80, y, r[0], 56, pal.ink, { font: MONO, w: 700 }); s += T(330, y, r[1], 56, pal.here, { font: MONO, w: 700 }); s += T(680, y, r[2], 56, pal.alg, { font: MONO, w: 700 }); });
    s += row(y0 + 860, 'SUNSET', 'FARO', '17:21', pal.alg, 52, tag(580, y0 + 856, 'comp', 28, pal).svg); s += row(y0 + 970, 'DAYLIGHT', 'LONDON', '16:08', pal.here, 52, tag(640, y0 + 966, 'comp', 28, pal).svg);
    s += T(64, y0 + 1060, 'Forecast: IPMA. Weather words go under each row on the real screen.', 26, pal.soft);
  } else {
    s += T(64, y0 + 200, '5 HOURS TO', 96, pal.ink, { w: 900 }); s += T(64, y0 + 300, 'THIS SUNSET', 96, pal.accent, { w: 900 });
    s += tag(64, y0 + 390, 'inv', 44, pal).svg;
    [['09:00', 'OXFORD CIRCUS', 'DEP'], ['11:00', 'EXAMPLE FLIGHT', '2H45'], ['14:40', 'FARO MARINA', 'ARR'], ['17:21', 'SUNSET', '']].forEach((r, j) => { const y = y0 + 520 + j * 110; s += row(y, r[0], r[1], r[2], j === 3 ? pal.accent : pal.ink, 46, j === 3 ? tag(W - 80 - tagW('comp', 30), y - 4, 'comp', 30, pal).svg : ''); });
    s += qr(64, 1290, 330); s += T(450, 1420, 'SCAN TO PLAN', 64, pal.ink, { w: 900 }); s += T(450, 1480, '(a simulation)', 40, pal.soft);
  }
  s += dots(pal, i); s += smallPrint(pal); return s;
};
// The Postcard's stamp: a solid double rule (dashed edges mean "invented example" in every design).
const stamp = (x, y, w, h, pal) => R(x, y, w, h, '#ffffff', { stroke: pal.accent, sw: 6 }) + R(x + 12, y + 12, w - 24, h - 24, 'none', { stroke: pal.accent, sw: 3 });
D.postcard = i => {
  const pal = P.postcard; let s = R(0, 0, W, H, '#e9dcc4');
  s += R(40, 40, W - 80, 1620, pal.bg, { rx: 8 });
  if (i === 0) {
    s += scene({ top: 80, h: 1260, x: 80, w: W - 160 });
    s += stamp(700, 120, 300, 340, pal);
    s += T(850, 210, 'Faro', 48, pal.ink, { anchor: 'middle', font: SERIF, w: 700 }); s += T(850, 320, '20.6°', 110, pal.accent, { anchor: 'middle', font: SERIF, w: 700 }); s += tag(850 - tagW('live', 32) / 2, 410, 'live', 32, pal).svg;
    s += T(80, 1440, 'Faro, right now.', 92, pal.ink, { font: SERIF, italic: true, w: 700 });
    s += T(80, 1520, 'Partly cloudy today (IPMA). 18:02 local time.', 40, pal.ink); s += T(80, 1580, 'Drawing, not a camera.', 32, pal.soft, { italic: true });
  } else if (i === 1) {
    s += R(539, 120, 2, 1460, pal.soft, { op: 0.5 });
    s += T(80, 220, 'Dear London,', 72, pal.ink, { font: SERIF, italic: true });
    s += T(80, 330, 'Here: 9.0°C, rain', 44, pal.here, { w: 700 }); s += tag(80, 400, 'sim', 30, pal).svg;
    s += T(80, 520, 'Faro: 20.6°C,', 44, pal.accent, { w: 700 }); s += T(80, 575, 'partly cloudy', 44, pal.accent, { w: 700 }); s += tag(80, 640, 'live', 30, pal).svg;
    s += T(80, 800, 'Sunset in Faro 17:21.', 44, pal.ink, { font: SERIF, italic: true }); s += T(80, 860, 'Yours ended 16:08.', 44, pal.ink, { font: SERIF, italic: true });
    s += tag(80, 925, 'comp', 30, pal).svg;
    s += stamp(800, 140, 200, 230, pal); s += T(900, 270, '3 days', 40, pal.accent, { anchor: 'middle', font: SERIF, w: 700 });
    s += TT(580, 430, 'Faro', 30, pal.accent, 'live', 26, pal, { w: 700 }); s += TT(580, 478, 'London', 30, pal.here, 'sim', 26, pal, { w: 700 });
    [['Thu 19', '21° partly cloudy', '8° showers'], ['Fri 20', '20° high cloud', '10° grey'], ['Sat 21', '19° sunny intervals', '9° rain']].forEach((r, j) => { const y = 560 + j * 160; s += T(580, y, r[0], 40, pal.ink, { w: 700 }); s += T(580, y + 50, `Faro ${r[1]}`, 30, pal.accent); s += T(580, y + 92, `London ${r[2]}`, 30, pal.here); s += R(580, y + 114, 420, 2, pal.soft, { op: 0.6 }); });
    s += T(580, 1060, 'Faro forecast: IPMA.', 26, pal.soft);
  } else {
    s += R(539, 120, 2, 1460, pal.soft, { op: 0.5 });
    s += T(80, 220, 'You are', 72, pal.ink, { font: SERIF, italic: true }); s += T(80, 320, '5 hours away', 72, pal.accent, { font: SERIF, italic: true, w: 700 }); s += T(80, 410, 'from this sunset.', 60, pal.ink, { font: SERIF, italic: true });
    s += tag(80, 505, 'inv', 36, pal).svg;
    ['Leave 09:00,', 'fly at 11:00,', 'Faro marina 14:40,', 'sunset 17:21.'].forEach((l, j) => { s += T(80, 620 + j * 70, l, 42, pal.ink, { font: SERIF, italic: true }); });
    s += tag(80, 900, 'comp', 30, pal).svg;
    s += qr(640, 140, 340); s += T(580, 600, 'Scan to plan', 56, pal.ink, { font: SERIF, w: 700 }); s += T(580, 660, '(a simulation)', 38, pal.soft, { italic: true });
    [0, 1, 2].forEach(j => { s += R(580, 820 + j * 110, 420, 2, pal.soft, { op: 0.6 }); });
  }
  s += dots({ ink: pal.ink, soft: pal.soft }, i, 1630); s += smallPrint(pal); return s;
};
D.readout = i => {
  const pal = P.readout; let s = R(0, 0, W, H, pal.bg);
  s += scene({ top: 0, h: 540 });
  s += R(0, 470, W, 70, '#0e1a22', { op: 0.8 }); s += T(64, 518, 'Drawing, not a camera', 28, pal.soft);
  // a tile: label and its tag on the top line, the value below, the source line at the foot
  const tile = (x, y, w, h, label, value, src, col, tg, vsize) => { let t = R(x, y, w, h, pal.panel, { rx: 16 }) + T(x + 32, y + 56, label, 32, pal.soft, { w: 700 }) + T(x + 32, y + h - 90, value, vsize || Math.min(120, h * 0.45), col, { font: MONO, w: 700 }) + T(x + 32, y + h - 32, src, 24, pal.soft); if (tg) t += tag(x + w - 32 - tagW(tg, 28), y + 56, tg, 28, pal).svg; return t; };
  if (i === 0) {
    s += tile(48, 580, W - 96, 380, 'FARO, AIR NOW', '20.6°C', `IPMA, Faro (Aeródromo) 4 km, obs. ${OBS()}, ${RD()}`, pal.alg, 'live');
    s += tile(48, 990, 480, 300, 'TODAY', '6%', 'rain chance, IPMA forecast', pal.ink, 'live');
    s += tile(552, 990, 480, 300, 'SEA', '19.8°', 'Faro coast, IPMA forecast', pal.ink, 'live');
    s += tile(48, 1320, 480, 300, 'AIRCRAFT', '4', 'near Faro airport now, adsb.lol, ODbL', pal.ink, 'live');
    s += tile(552, 1320, 480, 300, 'SUNSET', '17:21', 'Faro, NOAA equations', pal.accent, 'comp');
  } else if (i === 1) {
    s += T(64, 640, 'London', 52, pal.here, { w: 700 }); s += tag(260, 640, 'sim', 30, pal).svg; s += T(600, 640, 'Faro', 52, pal.alg, { w: 700 }); s += tag(740, 640, 'live', 30, pal).svg;
    s += T(64, 790, '9.0°', 140, pal.here, { font: MONO, w: 700 }); s += T(600, 790, '20.6°', 140, pal.alg, { font: MONO, w: 700 });
    // a three-day bar chart of maxima, each bar named under it, London's column tagged
    s += R(48, 850, W - 96, 540, pal.panel, { rx: 16 }); s += T(80, 905, 'Maximum, next three days', 30, pal.soft, { w: 700 });
    s += TT(500, 905, 'London', 26, pal.here, 'sim', 24, pal, { w: 700 }); s += TT(800, 905, 'Faro', 26, pal.alg, 'live', 24, pal, { w: 700 });
    [['Thu', 8, 21], ['Fri', 10, 20], ['Sat', 9, 19]].forEach(([d, a, b], j) => {
      const x = 140 + j * 300, base = 1290;
      s += R(x, base - a * 15, 90, a * 15, pal.here); s += R(x + 100, base - b * 15, 90, b * 15, pal.alg);
      s += T(x + 45, base - a * 15 - 14, `${a}°`, 34, pal.here, { anchor: 'middle', font: MONO }); s += T(x + 145, base - b * 15 - 14, `${b}°`, 34, pal.alg, { anchor: 'middle', font: MONO });
      s += T(x + 45, base + 32, 'London', 22, pal.here, { anchor: 'middle', w: 700 }); s += T(x + 145, base + 32, 'Faro', 22, pal.alg, { anchor: 'middle', w: 700 });
      s += T(x + 95, base + 76, d, 34, pal.ink, { anchor: 'middle', w: 700 });
    });
    s += tile(48, 1410, 480, 220, 'SUNSET FARO', '17:21', 'NOAA equations', pal.alg, 'comp', 90); s += tile(552, 1410, 480, 220, 'DARK, LONDON', '16:08', 'NOAA equations', pal.here, 'comp', 90);
  } else {
    s += T(64, 650, '5 h to this sunset', 84, pal.ink, { w: 800 }); s += tag(64, 735, 'inv', 36, pal).svg;
    // a timeline from now to the sunset
    const x0 = 64, x1 = W - 64, y = 860, seg = [[60, '#a9b8c6', 'train'], [90, '#6c8a9c', 'airport'], [165, '#6cc4e8', 'flight'], [40, '#ffc872', 'to the marina']];
    let x = x0; const tot = seg.reduce((a, b) => a + b[0], 0) + 160;
    seg.forEach(([m, c, l]) => { const w = (x1 - x0) * m / tot; s += R(x, y, w - 6, 70, c, { rx: 8 }); s += T(x, y + 110, l, 28, pal.soft); x += w; });
    s += R(x, y, x1 - x, 70, 'none', { stroke: pal.alg, sw: 4, dash: '10 8', rx: 8 }); s += T(x1, y - 20, 'sunset 17:21', 30, pal.alg, { anchor: 'end', w: 700 }); s += T(x0, y - 20, 'now 09:00', 30, pal.ink, { w: 700 });
    s += tag(x1 - tagW('comp', 26), y + 110, 'comp', 26, pal).svg;
    s += tile(48, 1010, W - 96, 260, 'DEPARTURE', '11:00 flight', 'not a timetable: no airline or airport named', pal.ink, 'inv', 96);
    s += qr(64, 1300, 310); s += T(420, 1430, 'Scan to plan', 64, pal.ink, { w: 800 }); s += T(420, 1490, '(a simulation)', 40, pal.soft);
  }
  s += dots(pal, i); s += smallPrint(pal); return s;
};
D.dusk = i => {
  const pal = P.dusk; let s = R(0, 0, W, H, pal.bg);
  s += scene({ dusk: true, top: 0, h: 1700 });
  const dk = `dk${++uid}`;
  s += `<defs><linearGradient id="${dk}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171b36" stop-opacity=".92"/><stop offset="1" stop-color="#171b36" stop-opacity=".2"/></linearGradient></defs>`;
  s += R(0, 0, W, 900, `url(#${dk})`);
  const arc = (cx, cy, r, f, col, label) => `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>` + `<circle cx="${cx - r * Math.cos(Math.PI * f)}" cy="${cy - r * Math.sin(Math.PI * f)}" r="26" fill="${col}"/>` + T(cx, cy + 56, label, 34, pal.ink, { anchor: 'middle', w: 600 }) + tag(cx - tagW('comp', 28) / 2, cy + 104, 'comp', 28, pal).svg;
  if (i === 0) {
    s += T(64, 220, 'Faro, 17:05', 84, pal.ink, { w: 300 }); s += T(64, 470, '20.6°C', 220, pal.accent, { w: 200 }); s += tag(64, 560, 'live', 40, pal).svg;
    s += T(64, 650, 'Partly cloudy today, IPMA', 44, pal.ink, { w: 300 });
    s += R(48, 1160, W - 96, 440, pal.panel, { rx: 28, op: 0.88 });
    s += arc(W / 2, 1430, 300, 0.97, pal.accent, 'the sun in Faro now');
  } else if (i === 1) {
    s += T(64, 200, 'Daylight', 96, pal.ink, { w: 300 });
    s += R(48, 260, W - 96, 620, pal.panel, { rx: 28, op: 0.9 });
    s += arc(300, 620, 200, 1, pal.here, 'London: ended 16:08'); s += arc(780, 620, 200, 0.95, pal.accent, 'Faro: sunset 17:21');
    s += T(W / 2, 830, 'NOAA equations, in the browser', 26, pal.soft, { anchor: 'middle' });
    s += R(48, 920, W - 96, 660, pal.panel, { rx: 28, op: 0.9 });
    s += T(96, 1010, 'London 9.0°C rain', 46, pal.here, { w: 500 }); s += tag(560, 1008, 'sim', 30, pal).svg; s += T(96, 1080, 'Faro 20.6°C partly cloudy', 46, pal.accent, { w: 500 }); s += tag(720, 1078, 'live', 30, pal).svg;
    s += T(96, 1160, 'Day', 30, pal.soft, { w: 600 }); s += TT(300, 1160, 'London', 30, pal.here, 'sim', 26, pal, { w: 600 }); s += TT(600, 1160, 'Faro', 30, pal.accent, 'live', 26, pal, { w: 600 });
    [['Thu 19', '8° showers', '21° partly cloudy'], ['Fri 20', '10° grey', '20° high cloud'], ['Sat 21', '9° rain', '19° sunny intervals']].forEach((r, j) => { const y = 1240 + j * 95; s += T(96, y, r[0], 38, pal.ink, { w: 600 }); s += T(300, y, r[1], 38, pal.here); s += T(600, y, r[2], 38, pal.accent); });
    s += T(96, 1540, 'IPMA forecast for Faro; London simulated.', 26, pal.soft);
  } else {
    s += T(64, 220, 'You could', 80, pal.ink, { w: 300 }); s += T(64, 380, 'wake up here', 140, pal.accent, { w: 200 }); s += T(64, 490, 'tomorrow', 80, pal.ink, { w: 300 });
    s += R(48, 600, W - 96, 520, pal.panel, { rx: 28, op: 0.9 });
    s += T(96, 690, 'For example', 38, pal.ink, { w: 700 }); s += tag(330, 690, 'inv', 36, pal).svg;
    ['05:00 leave Oxford Circus', '07:00 flight to Faro', '10:40 Faro marina', '17:21 sunset'].forEach((l, j) => { s += T(96, 780 + j * 80, l, 40, j === 3 ? pal.accent : pal.ink); if (j === 3) s += tag(96 + tw(l, 40) + 16, 780 + j * 80, 'comp', 30, pal).svg; });
    s += R(48, 1180, W - 96, 420, pal.panel, { rx: 28, op: 0.9 }); s += qr(96, 1220, 340); s += T(480, 1360, 'Scan to plan', 64, pal.ink, { w: 600 }); s += T(480, 1430, '(a simulation)', 40, pal.soft);
  }
  s += dots(pal, i); s += smallPrint(pal); return s;
};

// ---------- the page layouts (section 1) ----------
function frameScreen(x, y, h, phase = 0) {
  const k = h / H;
  return `<g transform="translate(${x} ${y}) scale(${k})">${R(-24, -24, W + 48, H + 48, '#111111', { rx: 30 })}${defaultPhase(phase)}</g>`;
}
const BAND = 'Simulation. This billboard does not exist: no screen, campaign or booking is real. The Algarve weather is real, read live from IPMA via data.promptugal.news; London\'s weather is set by you; flights, prices and times are invented examples. Idea: Dinis Cruz.';
// The band, whole and wrapping (never clipped or cut short). Returns { svg, h }.
function band(w, size, centre) {
  const lines = wrap(BAND, w - 32, size), lh = Math.round(size * 1.45), h = 16 + lines.length * lh;
  let s = R(0, 0, w, h, '#ffe9a8');
  lines.forEach((l, i) => { s += centre ? T(w / 2, 8 + (i + 1) * lh - 4, l, size, '#332600', { anchor: 'middle', w: i === 0 ? 400 : 400 }) : T(16, 8 + (i + 1) * lh - 4, l, size, '#332600'); });
  return { svg: s, h };
}
const NAV = ['The screen', 'The idea', 'Planning assistant (simulation)', 'Designs', 'Use the data', 'Use with AI', 'Behind the scenes'];
const note = (x, y, lines, anchor) => lines.map((l, i) => T(x, y + i * 16, l, 12, '#8a3410', { anchor, italic: true })).join('');
function provenance(x, y, width) {
  let s = ''; let yy = y;
  ['Faro 20.6°C: IPMA, Faro (Aeródromo) 4 km, obs 17:00 UTC, read 17:56, live', 'Faro today: IPMA forecast, read 17:54, live', 'Sea: IPMA sea forecast, Faro coast, read 17:56, live', 'Aircraft seen near Faro airport now: adsb.lol (ODbL), read 17:53, live', 'London: set by you, simulated', 'Sunset times: computed in your browser (NOAA equations)', 'Journey: invented example'].forEach(l => { wrap('- ' + l, width, 12).forEach(ln => { s += T(x, yy, ln, 12, '#1c1f23'); yy += 16; }); yy += 3; });
  return { svg: s, y: yy };
}
function layoutWide() {
  // 1366 x 900. Band (two lines at 14 px) and header take 154 px, as measured in the review. The rule of PROPOSAL.md 1.1:
  // screen height = min(column width x 16/9, window height - stage top - controls - decision line - gaps), floor 480.
  const w = 1366, h = 900; let s = R(0, 0, w, h, '#f7f7f4');
  const b = band(w, 14, true); s += b.svg;
  const headTop = b.h, headH = 154 - b.h;
  s += R(0, headTop, w, headH, '#ffffff'); s += R(0, 153, w, 1, '#d8dad6');
  s += T(40, headTop + headH / 2 + 6, 'London billboard (a simulation)', 18, '#1c1f23', { w: 700 });
  let nx = 370; NAV.forEach((n, i) => { s += T(nx, headTop + headH / 2 + 6, n, 14, i ? '#0b5c8a' : '#1c1f23', { w: i ? 400 : 700 }); nx += tw(n, 14) * 0.95 + 26; });
  const stageTop = 178, scrH = 542, scrW = Math.round(scrH * 9 / 16), col = 320, panelW = 384, gap = 32;
  const gx = Math.round((w - (col + gap + panelW)) / 2), sx = gx + (col - scrW) / 2;
  s += frameScreen(sx, stageTop, scrH);
  const cy = stageTop + scrH + 12; // controls
  ['Previous', 'Pause', 'Next'].forEach((t, i) => { s += R(gx + i * 84, cy, 76, 44, 'none', { rx: 6, stroke: '#1c1f23', sw: 1 }); s += T(gx + 38 + i * 84, cy + 27, t, 13, '#1c1f23', { anchor: 'middle' }); }); s += T(gx + col, cy + 27, '1 of 3', 13, '#4f565e', { anchor: 'end' });
  const dy = cy + 44 + 12; // decision line, as wide as the stage column
  s += R(gx, dy, col, 96, '#fff3c4', { rx: 4 }); s += R(gx, dy, 4, 96, '#8a6d00');
  s += T(gx + 14, dy + 20, 'Would switch message.', 14, '#1c1f23', { w: 800 });
  wrap('It is raining in Faro today too, and London is colder (simulated). It would show the drier days ahead instead (Thu 19 Nov, IPMA forecast).', col - 28, 13).forEach((l, i) => { s += T(gx + 14, dy + 37 + i * 16, l, 12.5, '#1c1f23'); });
  // the panel, beside the stage, one gap away; the pair is centred as a group
  const px = gx + col + gap;
  s += R(px, stageTop, panelW, h - stageTop - 16, '#ffffff', { rx: 6, stroke: '#d8dad6', sw: 1 });
  s += T(px + 20, stageTop + 32, 'Set the screen', 18, '#1c1f23', { w: 700 });
  const fs = (y, h2, title, lines) => R(px + 16, y, panelW - 32, h2, 'none', { rx: 6, stroke: '#c9ccc8', sw: 1 }) + T(px + 30, y + 22, title, 14, '#1c1f23', { w: 700 }) + lines.map((l, i) => T(px + 30, y + 42 + i * 19, l, 12.5, '#4f565e')).join('');
  s += fs(stageTop + 48, 86, 'Where the screen stands', ['( ) London  ( ) Porto  ( ) Braga  ( ) Lisbon', 'Station: [ Oxford Circus v ]', 'London weather is set by you: simulated']);
  s += fs(stageTop + 142, 86, 'London (simulated)', ['Weather: [ Rain v ]   Temperature: 9°C', 'Time: [ live clock v ]', 'Each London value carries "simulated"']);
  s += fs(stageTop + 236, 48, 'The Algarve', ['Place: [ Faro v ]']);
  s += fs(stageTop + 292, 48, 'Design', ['[ Default v ]  (the five designs, see /d/)']);
  s += T(px + 20, stageTop + 372, 'Where each figure comes from', 15, '#1c1f23', { w: 700 });
  const pv = provenance(px + 24, stageTop + 396, panelW - 48); s += pv.svg;
  wrap('Terms: IPMA free use, no profit-making purpose, always named. adsb.lol ODbL 1.0. Not a warning service: follow IPMA.', panelW - 48, 12).forEach((l, i) => { s += T(px + 24, pv.y + 8 + i * 16, l, 12, '#4f565e'); });
  s += R(px + panelW - 8, stageTop + 8, 4, 380, '#c9ccc8', { rx: 2 }); // the panel scrolls inside itself when taller than the window
  // notes (not part of the page)
  s += note(gx - 16, stageTop + 40, ['Screen 305 x 542 px:', 'height = window 900 - stage top 178', '- controls 44 - decision 96', '- gaps 12 + 12 - foot 16.', 'At 1366 x 768 the floor of 480 px', 'applies (270 x 480): controls stay', 'in view, the decision line falls', 'under the fold.'], 'end');
  s += note(gx - 16, stageTop + 220, ['Stage column = max(screen, 20 rem).', 'Stage and panel sit together as', 'one centred group, one 2 rem gap.'], 'end');
  s += note(px + panelW + 16, stageTop + 40, ['Panel 24 rem,', 'sticky, scrolls', 'inside itself.'], 'start');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Mock-up: the home page at 1366 x 900">${s}</svg>`;
}
function layoutPhone() {
  // 390 px wide, window 844 px tall (a dashed line marks the first view). Screen: width-bound, 358 x 636.
  const w = 390, h = 1720; let s = R(0, 0, w, h, '#f7f7f4');
  const b = band(w, 14, false); s += b.svg;
  let y = b.h; s += R(0, y, w, 56, '#ffffff'); s += T(16, y + 34, 'London billboard (a simulation)', 15, '#1c1f23', { w: 700 }); s += T(374, y + 34, 'Menu', 14, '#0b5c8a', { anchor: 'end' }); y += 56;
  y += 16; const scrH = 636; s += frameScreen(16 + 3, y, scrH); // 358 wide incl. a thin frame
  const scrTop = y; y += scrH + 12;
  ['Previous', 'Pause', 'Next'].forEach((t, i) => { s += R(16 + i * 104, y, 96, 44, 'none', { rx: 6, stroke: '#1c1f23', sw: 1 }); s += T(64 + i * 104, y + 28, t, 14, '#1c1f23', { anchor: 'middle' }); }); s += T(374, y + 28, '1 of 3', 13, '#4f565e', { anchor: 'end' });
  y += 44 + 12;
  const dl = wrap('It is raining in Faro today too, and London is colder (simulated). It would show the drier days ahead instead (Thu 19 Nov, IPMA forecast).', w - 60, 13);
  const dh = 34 + dl.length * 18; s += R(16, y, w - 32, dh, '#fff3c4', { rx: 4 }); s += R(16, y, 5, dh, '#8a6d00'); s += T(32, y + 24, 'Would switch message.', 15, '#1c1f23', { w: 800 }); dl.forEach((l, i) => { s += T(32, y + 44 + i * 18, l, 13, '#1c1f23'); });
  y += dh + 20;
  s += R(16, y, w - 32, 360, '#ffffff', { rx: 6, stroke: '#d8dad6', sw: 1 }); s += T(32, y + 30, 'Set the screen', 16, '#1c1f23', { w: 700 });
  ['Where the screen stands', 'London (simulated)', 'The Algarve', 'Design'].forEach((t, i) => { s += R(32, y + 46 + i * 76, w - 64, 66, 'none', { rx: 6, stroke: '#c9ccc8', sw: 1 }); s += T(46, y + 70 + i * 76, t, 13, '#1c1f23', { w: 700 }); s += R(46, y + 82 + i * 76, w - 92, 18, '#eef0ee', { rx: 3 }); });
  y += 380;
  s += T(16, y + 10, 'Where each figure comes from', 15, '#1c1f23', { w: 700 });
  const pv = provenance(16, y + 34, w - 32); s += pv.svg; y = pv.y + 10;
  s += T(16, y + 10, 'Then "What you are looking at", then the footer.', 13, '#4f565e');
  // the first view, and the view once scrolled to the screen
  s += R(0, 844, w, 0.01, 'none'); s += `<line x1="0" y1="844" x2="${w}" y2="844" stroke="#8a3410" stroke-width="1.5" stroke-dasharray="6 4"/>`;
  s += R(w - 160, 848, 156, 20, '#ffffff', { op: 0.9 }); s += note(w - 8, 862, ['first view ends (844 px)'], 'end');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${Math.max(h, y + 30)}" width="${w}" height="${Math.max(h, y + 30)}" role="img" aria-label="Mock-up: the home page at 390 px wide">${s}</svg>`;
}
function layoutKiosk() {
  const w = 1366, h = 768; let s = R(0, 0, w, h, '#000000');
  s += frameScreen(467, 0, 768);
  ['Simulation.', 'This billboard does not exist:', 'no screen, campaign or', 'booking is real. The Algarve', 'weather is real, read live', 'from IPMA via', 'data.promptugal.news;', 'London\'s weather is set by', 'you; flights, prices and', 'times are invented examples.', 'Idea: Dinis Cruz.'].forEach((l, i) => { s += T(60, 300 + i * 22, l, 15, '#d9d9d9', { w: i ? 400 : 800 }); });
  s += T(60, 270, '?kiosk=1, landscape window', 13, '#8a8a8a');
  s += T(1340, 712, 'No controls on screen. Space pauses or plays; the arrow keys step a phase.', 12, '#8a8a8a', { anchor: 'end' });
  s += T(1340, 732, 'Reduced motion: phase 1 held, no cycling. Leave with the address bar or Back.', 12, '#8a8a8a', { anchor: 'end' });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Mock-up: the kiosk view in a landscape window">${s}</svg>`;
}
function chooser() {
  const w = 1366, h = 900; let s = R(0, 0, w, h, '#f7f7f4');
  const b = band(w, 14, true); s += b.svg;
  const y0 = b.h + 20;
  s += T(40, y0 + 40, 'Designs', 36, '#1c1f23', { w: 800 });
  s += T(40, y0 + 74, 'Five ways to draw the same screen and the same live data. Every label and the small print stay in each.', 16, '#4f565e');
  const cards = [['live', 'Default', 'The screen as on the home page. Opens /.'], ['poster', P.poster.name, 'A calm printed poster: the drawing as a plate, serif type on paper.'], ['board', P.board.name, 'Station-board rows, amber on near-black, figures in monospace.'], ['postcard', P.postcard.name, 'A postcard from the Algarve: picture side, then the written back.'], ['readout', P.readout.name, 'Data first: tiles with the source under every figure.'], ['dusk', P.dusk.name, 'Light type on deep blue, led by the sun and daylight.']];
  const cw = 201, g = 16, pw = 169, ph = Math.round(pw * 16 / 9);
  EX = true; // previews are drawn in the example state: no "live" tag on a frozen value
  cards.forEach(([id, name, idea], i) => {
    const x = 40 + i * (cw + g), y = y0 + 100;
    s += R(x, y, cw, 600, '#ffffff', { rx: 8, stroke: '#d8dad6', sw: 1 });
    s += `<g transform="translate(${x + 16} ${y + 16}) scale(${pw / W})">${id === 'live' ? defaultPhase(0) : D[id](0)}</g>`;
    let yy = y + 16 + ph + 30;
    s += T(x + 16, yy, name, 18, '#0b5c8a', { w: 700 }); yy += 22;
    wrap(idea, pw, 13).forEach(l => { s += T(x + 16, yy, l, 13, '#4f565e'); yy += 18; });
    const pal = P[id]; [pal.bg, pal.ink, pal.accent, pal.here, pal.alg].forEach((c, j) => { s += R(x + 16 + j * 33, y + 520, 29, 14, c, { stroke: '#9aa3ab', sw: 1 }); });
    s += T(x + 16, y + 560, id === 'live' ? 'Open the screen' : 'Open the design', 14, '#0b5c8a');
    s += T(x + 16, y + 582, 'Preview: example values', 12, '#4f565e');
  });
  EX = false;
  s += T(40, y0 + 730, 'Each card is one link: preview, name, idea, palette. Previews show phase 1 in the example state: every "live" tag reads "example", read times say "example".', 14, '#4f565e');
  s += T(40, y0 + 752, 'Six across at 1366 px, two at 390 px, one under 360 px. Focus ring on each card: 3 px, 3 px offset, the site\'s focus colour.', 14, '#4f565e');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Mock-up: the design chooser at /d/">${s}</svg>`;
}

// ---------- write ----------
const strip = (frames, label, gap = 60) => {
  const k = 0.25, fw = W * k, fh = H * k;
  const w = frames.length * (fw + gap) + gap, h = fh + 140;
  let s = R(0, 0, w, h, '#ffffff');
  frames.forEach(([title, body], i) => { const x = gap + i * (fw + gap); s += T(x, 44, title, 22, '#1c1f23', { w: 700 }); s += `<g transform="translate(${x} 70) scale(${k})">${R(0, 0, W, H, '#ffffff', { stroke: '#1c1f23', sw: 8 })}${body}</g>`; });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">${s}</svg>`;
};
const files = {
  'layout-wide.svg': layoutWide(),
  'layout-phone.svg': layoutPhone(),
  'layout-kiosk.svg': layoutKiosk(),
  'screen-phases.svg': strip([['Safe areas, type, tags', gridFrame()], ['1. The Algarve now', defaultPhase(0)], ['2. The comparison', defaultPhase(1)], ['3. The journey', defaultPhase(2)], ['Today: Algarve wet too', defaultPhase(0, { wet: true, ribbon: true, switchMsg: true })]], 'Mock-up: the screen at 1080 x 1920, phase by phase, and the pause state'),
  'chooser.svg': chooser(),
};
for (const id of ['poster', 'board', 'postcard', 'readout', 'dusk']) files[`design-${id}.svg`] = strip([0, 1, 2].map(i => [`${P[id].name}: phase ${i + 1}`, D[id](i)]), `Mock-up: design ${P[id].name}, three phases`);
for (const [n, svg] of Object.entries(files)) { writeFileSync(join(OUT, n), svg); console.log(n, (svg.length / 1024).toFixed(1), 'KB'); }

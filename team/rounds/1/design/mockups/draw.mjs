// draw.mjs: the round 1 design mock-ups, drawn as SVG (team/rounds/1/design/PROPOSAL.md).
// Run: node team/rounds/1/design/mockups/draw.mjs  (writes the .svg files beside this script).
// Every drawing here is our own: simple shapes and system fonts, no photos, no third-party images.
// Values shown are examples of shape only, not readings: the Faro temperature is the 17:00 UTC
// observation of 2026-11-18 (team/rounds/1/data/DATA.md section 8), paired with Faro's forecast words
// for 19 November so the "run" frames show a dry day; the "wet too" frame shows 18 November as read.
// London is simulated; journeys are invented examples. The real screen reads the data live.
// designer.london-billboard@AgentiCCells.dinis, 2026-11-18, round 1. Code Apache-2.0; drawings CC BY 4.0.
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
// A tag: live = filled with a dot; simulated = outlined; invented example = dashed outline. The word is always there.
function tag(x, y, kind, size, pal) {
  const word = { live: 'live', sim: 'simulated', inv: 'invented example', stale: 'may be out of date', missing: 'missing' }[kind];
  const c = pal.tags[kind];
  const pad = size * 0.4, w = tw(word, size) + pad * 2 + (kind === 'live' ? size * 0.7 : 0), h = size * 1.35;
  let s = '';
  if (kind === 'live' || kind === 'stale' || kind === 'missing') s += R(x, y - h * 0.78, w, h, c.bg, { rx: h * 0.3 });
  else s += R(x, y - h * 0.78, w, h, c.bg, { rx: h * 0.3, stroke: c.ink, sw: Math.max(2, size / 10), dash: kind === 'inv' ? `${size * 0.35} ${size * 0.2}` : null });
  let tx = x + pad;
  if (kind === 'live') { s += `<circle cx="${tx + size * 0.25}" cy="${y - size * 0.32}" r="${size * 0.2}" fill="${c.ink}"/>`; tx += size * 0.7; }
  s += T(tx, y, word, size, c.ink, { w: 700 });
  return { svg: s, w };
}
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
const darkTags = { live: { bg: '#7fd39a', ink: '#0d0f12' }, sim: { bg: 'none', ink: '#c9a8f5' }, inv: { bg: 'none', ink: '#ffa36b' }, stale: { bg: '#ffd166', ink: '#0d0f12' }, missing: { bg: '#9aa3ab', ink: '#0d0f12' } };
const P = {
  live: { name: 'Default (the developer\'s theme "live")', bg: '#0b1428', ink: '#ffffff', soft: '#e6e9ee', accent: '#ffd36b', here: '#9fb3c8', alg: '#ffd36b', panel: '#0a1626', panelOp: 0.78, sp: '#000000', spOp: 0.72, spInk: '#f2f2f2', ribbon: ['#fbe7a1', '#3a2e00'], font: SANS, head: SANS, fig: SANS,
    tags: { live: { bg: '#1f7a3f', ink: '#ffffff' }, sim: { bg: '#7a3fb0', ink: '#ffffff' }, inv: { bg: '#a13d1a', ink: '#ffffff' }, stale: { bg: '#ffd166', ink: '#3a2e00' }, missing: { bg: '#555555', ink: '#ffffff' } } },
  poster: { name: 'Poster', bg: '#f4efe6', ink: '#1b1b1b', soft: '#4d4a45', accent: '#0e5a6b', here: '#3f5566', alg: '#8f4200', rule: '#cfc6b6', sp: '#e6dfd2', spInk: '#1b1b1b', ribbon: ['#1b1b1b', '#f4efe6'], font: SANS, head: SERIF, fig: SERIF,
    tags: { live: { bg: '#1d6b3a', ink: '#ffffff' }, sim: { bg: 'none', ink: '#6a3596' }, inv: { bg: 'none', ink: '#8a3410' }, stale: { bg: '#ffd166', ink: '#1b1b1b' }, missing: { bg: '#555555', ink: '#ffffff' } } },
  board: { name: 'Departure board', bg: '#0d0f12', ink: '#f2f2ee', soft: '#a9b0b8', accent: '#ffb547', here: '#8fb4d9', alg: '#ffb547', panel: '#1a1e24', sp: '#1a1e24', spInk: '#f2f2ee', ribbon: ['#ffb547', '#0d0f12'], font: SANS, head: SANS, fig: MONO, tags: darkTags },
  postcard: { name: 'Postcard', bg: '#fbf4e6', ink: '#2a1f17', soft: '#5e5048', accent: '#a3402a', here: '#1e5c78', alg: '#a3402a', sp: '#fbf4e6', spInk: '#2a1f17', ribbon: ['#f6d77a', '#2a1f17'], font: SANS, head: SERIF, fig: SERIF,
    tags: { live: { bg: '#1d6b3a', ink: '#ffffff' }, sim: { bg: 'none', ink: '#6a3596' }, inv: { bg: 'none', ink: '#7a3410' }, stale: { bg: '#ffd166', ink: '#2a1f17' }, missing: { bg: '#555555', ink: '#ffffff' } } },
  readout: { name: 'Readout', bg: '#0e1a22', ink: '#e9eff3', soft: '#a7b6c0', accent: '#6cc4e8', here: '#a9b8c6', alg: '#ffc872', panel: '#15252f', sp: '#15252f', spInk: '#e9eff3', ribbon: ['#ffc872', '#0e1a22'], font: SANS, head: SANS, fig: MONO,
    tags: { ...darkTags, live: { bg: '#7fd39a', ink: '#0e1a22' } } },
  dusk: { name: 'Dusk', bg: '#171b36', ink: '#f5efe6', soft: '#c9c2d6', accent: '#ffb870', here: '#9fb0e0', alg: '#ffb870', rose: '#f59a8b', panel: '#232848', sp: '#232848', spInk: '#f5efe6', ribbon: ['#ffb870', '#171b36'], font: SANS, head: SANS, fig: SANS,
    tags: { ...darkTags, live: { bg: '#7fd39a', ink: '#171b36' }, sim: { bg: 'none', ink: '#d4b8ff' } } },
};

// ---------- shared pieces of a screen ----------
function smallPrint(pal, y0 = 1680) {
  const s = 26, x = 64;
  let out = pal.spOp != null ? R(0, y0, W, H - y0, pal.sp, { op: pal.spOp }) : R(0, y0, W, H - y0, pal.sp);
  if (pal.rule) out += R(0, y0, W, 3, pal.rule);
  out += T(x, y0 + 44, 'Simulation. No real screen or campaign.', s, pal.spInk, { w: 700, font: pal.font });
  let y = y0 + 84;
  out += T(x, y, 'Faro: IPMA via data.promptugal.news, read 17:56 UTC', s, pal.spInk, { font: pal.font });
  out += tag(x + tw('Faro: IPMA via data.promptugal.news, read 17:56 UTC', s) + 12, y, 'live', s, pal).svg;
  y += 40;
  out += T(x, y, 'London: weather set by you', s, pal.spInk, { font: pal.font });
  let t = tag(x + tw('London: weather set by you', s) + 12, y, 'sim', s, pal); out += t.svg;
  const jx = x + tw('London: weather set by you', s) + 24 + t.w;
  out += T(jx, y, 'Journeys:', s, pal.spInk, { font: pal.font });
  out += tag(jx + tw('Journeys:', s) + 10, y, 'inv', s, pal).svg;
  y += 40;
  out += T(x, y, 'Drawing, not a camera: live.promptugal.news offers no cameras yet', s, pal.spInk, { font: pal.font });
  out += T(x, y + 38, '(checked 2026-11-18).', s, pal.spInk, { font: pal.font });
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
    s += R(64, 1050, W - 128, 560, pal.panel, { rx: 28, op: pal.panelOp });
    s += T(112, 1140, 'Faro', 64, pal.ink, { w: 800 }); s += T(290, 1140, '18:02 local time', 40, pal.soft);
    s += T(112, 1340, '20.6°C', 180, pal.accent, { w: 800 }); s += tag(820, 1250, 'live', 40, pal).svg;
    s += T(112, 1430, o.wet ? 'IPMA today: light rain, 100% chance of rain' : 'IPMA today: partly cloudy, 6% chance of rain', 40, pal.ink);
    s += T(112, 1490, 'Observed at Faro (Aeródromo), 4 km, 17:00 UTC.', 32, pal.soft);
    s += T(112, 1540, 'Sea up to 19.8°C. 4 airliners near Faro (adsb.lol)', 32, pal.soft);
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
    s += T(64, ty + 20, 'Next three days (London simulated, Faro IPMA forecast)', 30, pal.soft);
    s += R(64, ty + 44, W - 128, 380, pal.panel, { rx: 28, op: pal.panelOp });
    [['', 'London', 'Faro'], ['Thu 19', '8°C showers', '21°C partly cloudy'], ['Fri 20', '10°C grey', '20°C high cloud'], ['Sat 21', '9°C rain', '19°C sunny intervals']].forEach((r, j) => {
      const y = ty + 110 + j * 88; const sz = j ? 36 : 30; const c = j ? pal.ink : pal.soft;
      s += T(100, y, r[0], sz, c, { w: 700 }); s += T(300, y, r[1], sz, c); s += T(620, y, r[2], sz, j ? pal.alg : c);
    });
    s += R(64, ty + 470, W - 128, 200, pal.panel, { rx: 28, op: pal.panelOp });
    s += T(104, ty + 550, 'Sunset in Faro at 17:21.', 46, pal.ink); s += T(104, ty + 620, 'Daylight in London ended at 16:08.', 46, pal.ink);
    s += T(104, ty + 660, 'computed in the browser (NOAA equations)', 24, pal.soft);
  } else {
    s += R(0, 0, W, H, '#050c19', { op: 0.55 });
    s += T(64, top + 150, 'You are 5 hours', 100, pal.ink, { w: 800 }); s += T(64, top + 250, 'away from this sunset', 72, pal.accent, { w: 800 });
    s += R(64, top + 330, W - 128, 640, pal.panel, { rx: 28, op: pal.panelOp });
    s += T(108, top + 410, 'For example', 36, pal.ink, { w: 700 }); s += tag(330, top + 410, 'inv', 32, pal).svg;
    s += T(108, top + 480, 'Leave Oxford Circus at 09:00; flight at 11:00;', 34, pal.ink); s += T(108, top + 528, 'in Faro by 14:40, sunset 17:21.', 34, pal.ink);
    ['1. Train to a London airport: about 1h', '2. At the airport before the flight: 1h30', '3. Flight to Faro: 2h45', '4. Faro airport to the marina: 40 min'].forEach((l, j) => { s += T(108, top + 610 + j * 70, l, 34, pal.ink); });
    s += R(64, 1180, W - 128, 420, pal.panel, { rx: 28, op: pal.panelOp });
    s += qr(104, 1220, 340); s += T(484, 1360, 'Scan to plan', 72, pal.ink, { w: 800 }); s += T(484, 1430, '(a simulation)', 44, pal.soft);
    s += T(484, 1500, 'scripted answers, no live model', 28, pal.soft);
  }
  s += dots(pal, i); s += smallPrint(pal);
  return s;
}

// The safe areas and type scale, drawn on an empty frame.
function gridFrame() {
  const pal = P.live; let s = R(0, 0, W, H, '#f4f6f8');
  s += R(0, 0, W, H, 'none', { stroke: '#c0392b', sw: 4 });
  s += R(48, 48, W - 96, H - 96, 'none', { stroke: '#c0392b', sw: 3, dash: '18 12' });
  s += R(64, 64, W - 128, H - 128, 'none', { stroke: '#1f5f8b', sw: 3, dash: '6 8' });
  s += R(0, 1680, W, 240, '#d7dde3');
  s += R(0, 0, W, 150, '#fbe7a1', { op: 0.7 });
  const L = (y, txt, size, c = '#1c1f23') => T(84, y, txt, size, c, { w: 700 });
  s += T(84, 110, 'Ribbon (pause or switch), 150 px', 34, '#3a2e00', { w: 700 });
  s += L(300, 'Headline 92 px (5 m)', 92);
  s += L(500, '20.6°C', 180); s += T(780, 500, 'figure 180 px', 30, '#1c1f23');
  s += L(600, 'Place, side names 64 px', 64);
  s += L(700, 'Body 40 px (3 to 4 m)', 40);
  s += L(780, 'Secondary 34 px (3 m)', 34);
  s += L(850, 'Tags beside figures at least 32 px', 32);
  s += L(920, 'Small print 26 px (1 to 2 m)', 26);
  s += T(84, 1060, 'Red dashed: 48 px bezel and case margin.', 30, '#c0392b');
  s += T(84, 1110, 'Blue dashed: 64 px safe margin for all text.', 30, '#1f5f8b');
  s += T(84, 1160, 'Grey band: small print, 240 px, always on, opaque.', 30, '#1c1f23');
  s += T(84, 1210, 'At 1 px = about 1 mm (86-inch portrait panel, computed).', 30, '#1c1f23');
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
    s += T(64, 1520, 'Partly cloudy today, IPMA. 18:02 in Faro.', 40, pal.ink); s += T(64, 1580, 'Faro (Aeródromo) station, 4 km, 17:00 UTC', 32, pal.soft);
  } else if (i === 1) {
    s += T(64, 260, 'London or Faro?', 100, pal.ink, { font: SERIF, w: 700 });
    s += R(538, 320, 3, 560, pal.rule);
    for (const [k, nm, t, wd, col, tg] of [[0, 'London', '9.0°C', 'rain', pal.here, 'sim'], [1, 'Faro', '20.6°C', 'partly cloudy', pal.alg, 'live']]) {
      const x = 64 + k * 500; s += T(x, 400, nm, 56, col, { font: SERIF, w: 700 }); s += tag(x, 470, tg, 32, pal).svg;
      s += T(x, 660, t, 150, col, { font: SERIF, w: 700 }); s += T(x, 740, wd, 40, pal.ink);
    }
    s += R(64, 920, W - 128, 3, pal.ink);
    [['Thu 19', '8°C showers', '21°C partly cloudy'], ['Fri 20', '10°C grey', '20°C high cloud'], ['Sat 21', '9°C rain', '19°C sunny intervals']].forEach((r, j) => { const y = 1010 + j * 90; s += T(64, y, r[0], 38, pal.ink, { w: 700 }); s += T(260, y, r[1], 38, pal.here); s += T(590, y, r[2], 38, pal.alg); s += R(64, y + 30, W - 128, 1, pal.rule); });
    s += T(64, 1340, 'Sunset in Faro at 17:21.', 54, pal.ink, { font: SERIF }); s += T(64, 1420, 'Daylight in London ended at 16:08.', 54, pal.ink, { font: SERIF });
    s += T(64, 1480, 'Sun times computed (NOAA equations). Forecast: IPMA.', 28, pal.soft);
  } else {
    s += T(64, 270, 'You are 5 hours', 104, pal.ink, { font: SERIF, w: 700 }); s += T(64, 380, 'from this sunset.', 104, pal.alg, { font: SERIF, w: 700 });
    s += T(64, 470, 'For example', 36, pal.ink, { w: 700 }); s += tag(290, 470, 'inv', 32, pal).svg;
    [['09:00', 'Leave Oxford Circus'], ['11:00', 'Flight to Faro'], ['14:40', 'Faro marina'], ['17:21', 'Sunset (computed)']].forEach((r, j) => { const y = 580 + j * 100; s += T(64, y, r[0], 52, pal.alg, { font: SERIF, w: 700 }); s += T(260, y, r[1], 44, pal.ink); s += R(64, y + 30, W - 128, 1, pal.rule); });
    s += qr(64, 1080, 380); s += T(490, 1230, 'Scan to plan', 70, pal.ink, { font: SERIF, w: 700 }); s += T(490, 1300, '(a simulation)', 44, pal.soft, { font: SERIF, italic: true });
  }
  s += dots(pal, i); s += smallPrint(pal); return s;
};
D.board = i => {
  const pal = P.board; let s = R(0, 0, W, H, pal.bg);
  s += scene({ top: 0, h: i === 0 ? 720 : 360, wet: false });
  const y0 = i === 0 ? 720 : 360;
  s += R(0, y0, W, 90, pal.accent); s += T(64, y0 + 62, ['ALGARVE NOW', 'HERE OR THERE', 'NEXT WAY SOUTH'][i], 48, pal.bg, { w: 900, ls: 6 });
  const row = (y, a, b, c, col = pal.ink, big = 52) => R(48, y - 64, W - 96, 96, pal.panel, { rx: 6 }) + T(80, y, a, big, col, { font: MONO, w: 700 }) + T(420, y, b, big, col, { font: MONO, w: 700 }) + (c ? T(W - 80, y, c, big, col, { font: MONO, w: 700, anchor: 'end' }) : '');
  if (i === 0) {
    s += T(64, y0 + 200, 'FARO', 110, pal.ink, { w: 900, ls: 4 }); s += tag(400, y0 + 190, 'live', 40, pal).svg; s += T(64, y0 + 400, '20.6°C', 200, pal.accent, { font: MONO, w: 700 });
    s += row(y0 + 540, 'TODAY', 'PART CLOUD', '6%'); s += row(y0 + 650, 'SEA', 'UP TO', '19.8°C'); s += row(y0 + 760, 'LOCAL', 'TIME', '18:02');
    s += T(64, y0 + 850, 'IPMA, Faro (Aeródromo) 4 km, 17:00 UTC', 30, pal.soft);
  } else if (i === 1) {
    s += T(80, y0 + 180, 'DAY', 34, pal.soft, { font: MONO, w: 700 }); s += T(330, y0 + 180, 'LONDON', 34, pal.here, { font: MONO, w: 700 }); s += tag(500, y0 + 180, 'sim', 28, pal).svg; s += T(680, y0 + 180, 'FARO', 34, pal.alg, { font: MONO, w: 700 }); s += tag(800, y0 + 180, 'live', 28, pal).svg;
    [['NOW', '9°C', '21°C'], ['THU', '8°C', '21°C'], ['FRI', '10°C', '20°C'], ['SAT', '9°C', '19°C']].forEach((r, j) => { const y = y0 + 300 + j * 120; s += R(48, y - 70, W - 96, 104, pal.panel, { rx: 6 }); s += T(80, y, r[0], 56, pal.ink, { font: MONO, w: 700 }); s += T(330, y, r[1], 56, pal.here, { font: MONO, w: 700 }); s += T(680, y, r[2], 56, pal.alg, { font: MONO, w: 700 }); });
    s += row(y0 + 860, 'SUNSET', 'FARO', '17:21', pal.alg); s += row(y0 + 970, 'DAYLIGHT', 'LONDON', '16:08', pal.here);
    s += T(64, y0 + 1060, 'Forecast IPMA. Sun times computed. Weather words under each row on the real screen.', 26, pal.soft);
  } else {
    s += T(64, y0 + 200, '5 HOURS TO', 96, pal.ink, { w: 900 }); s += T(64, y0 + 300, 'THIS SUNSET', 96, pal.accent, { w: 900 });
    s += tag(64, y0 + 380, 'inv', 32, pal).svg;
    [['09:00', 'OXFORD CIRCUS', 'DEP'], ['11:00', 'FLIGHT FARO', '2H45'], ['14:40', 'FARO MARINA', 'ARR'], ['17:21', 'SUNSET', '']].forEach((r, j) => { s += row(y0 + 500 + j * 110, r[0], r[1], r[2], j === 3 ? pal.accent : pal.ink, 46); });
    s += qr(64, 1260, 360); s += T(470, 1400, 'SCAN TO PLAN', 64, pal.ink, { w: 900 }); s += T(470, 1460, '(a simulation)', 40, pal.soft);
  }
  s += dots(pal, i); s += smallPrint(pal); return s;
};
D.postcard = i => {
  const pal = P.postcard; let s = R(0, 0, W, H, '#e9dcc4');
  s += R(40, 40, W - 80, 1620, pal.bg, { rx: 8 });
  if (i === 0) {
    s += scene({ top: 80, h: 1260, x: 80, w: W - 160 });
    s += R(700, 120, 300, 340, '#ffffff', { stroke: pal.accent, sw: 6, dash: '14 8' });
    s += T(850, 210, 'Faro', 48, pal.ink, { anchor: 'middle', font: SERIF, w: 700 }); s += T(850, 320, '20.6°', 110, pal.accent, { anchor: 'middle', font: SERIF, w: 700 }); s += tag(782, 410, 'live', 32, pal).svg;
    s += T(80, 1440, 'Faro, right now.', 92, pal.ink, { font: SERIF, italic: true, w: 700 });
    s += T(80, 1520, 'Partly cloudy today (IPMA). 18:02 local time.', 40, pal.ink); s += T(80, 1580, 'Drawing, not a camera.', 32, pal.soft, { italic: true });
  } else if (i === 1) {
    s += R(539, 120, 2, 1460, pal.soft, { op: 0.5 });
    s += T(80, 220, 'Dear London,', 72, pal.ink, { font: SERIF, italic: true });
    s += T(80, 330, 'Here: 9.0°C, rain', 44, pal.here, { w: 700 }); s += tag(80, 400, 'sim', 30, pal).svg;
    s += T(80, 520, 'Faro: 20.6°C,', 44, pal.accent, { w: 700 }); s += T(80, 575, 'partly cloudy', 44, pal.accent, { w: 700 }); s += tag(80, 640, 'live', 30, pal).svg;
    s += T(80, 800, 'Sunset here 17:21.', 44, pal.ink, { font: SERIF, italic: true }); s += T(80, 860, 'Yours ended 16:08.', 44, pal.ink, { font: SERIF, italic: true });
    s += T(80, 910, 'computed (NOAA)', 26, pal.soft);
    s += R(800, 140, 200, 230, '#ffffff', { stroke: pal.accent, sw: 5, dash: '12 7' }); s += T(900, 270, '3 days', 40, pal.accent, { anchor: 'middle', font: SERIF, w: 700 });
    [['Thu 19', '21° / 8°'], ['Fri 20', '20° / 10°'], ['Sat 21', '19° / 9°']].forEach((r, j) => { const y = 560 + j * 130; s += T(580, y, r[0], 40, pal.ink, { w: 700 }); s += T(580, y + 56, `Faro ${r[1].split(' / ')[0]}, London ${r[1].split(' / ')[1]}`, 32, pal.ink); s += R(580, y + 76, 420, 2, pal.soft, { op: 0.6 }); });
    s += T(580, 1000, 'Faro: IPMA forecast. London: simulated.', 26, pal.soft);
  } else {
    s += R(539, 120, 2, 1460, pal.soft, { op: 0.5 });
    s += T(80, 220, 'You are', 72, pal.ink, { font: SERIF, italic: true }); s += T(80, 320, '5 hours away', 72, pal.accent, { font: SERIF, italic: true, w: 700 }); s += T(80, 410, 'from this sunset.', 60, pal.ink, { font: SERIF, italic: true });
    s += tag(80, 500, 'inv', 30, pal).svg;
    ['Leave 09:00,', 'fly at 11:00,', 'Faro marina 14:40,', 'sunset 17:21.'].forEach((l, j) => { s += T(80, 620 + j * 70, l, 42, pal.ink, { font: SERIF, italic: true }); });
    s += qr(640, 140, 340); s += T(580, 600, 'Scan to plan', 56, pal.ink, { font: SERIF, w: 700 }); s += T(580, 660, '(a simulation)', 38, pal.soft, { italic: true });
    [0, 1, 2].forEach(j => { s += R(580, 820 + j * 110, 420, 2, pal.soft, { op: 0.6 }); });
  }
  s += dots({ ink: pal.ink, soft: pal.soft }, i, 1630); s += smallPrint(pal); return s;
};
D.readout = i => {
  const pal = P.readout; let s = R(0, 0, W, H, pal.bg);
  s += scene({ top: 0, h: 540 });
  s += R(0, 470, W, 70, '#0e1a22', { op: 0.8 }); s += T(64, 518, 'Drawing, not a camera', 28, pal.soft);
  const tile = (x, y, w, h, label, value, src, col, tg) => { let t = R(x, y, w, h, pal.panel, { rx: 16 }) + T(x + 32, y + 56, label, 32, pal.soft, { w: 700 }) + T(x + 32, y + h - 90, value, Math.min(120, h * 0.45), col, { font: MONO, w: 700 }) + T(x + 32, y + h - 32, src, 24, pal.soft); if (tg) t += tag(x + w - 32 - tw(tg === 'live' ? 'live' : tg === 'sim' ? 'simulated' : 'invented example', 28) - 40, y + 56, tg, 28, pal).svg; return t; };
  if (i === 0) {
    s += tile(48, 580, W - 96, 380, 'FARO, AIR NOW', '20.6°C', 'IPMA, Faro (Aeródromo) 4 km, obs. 17:00 UTC, read 17:56', pal.alg, 'live');
    s += tile(48, 990, 480, 300, 'TODAY', '6%', 'rain chance, IPMA forecast', pal.ink, 'live');
    s += tile(552, 990, 480, 300, 'SEA', '19.8°', 'Faro coast, IPMA', pal.ink, 'live');
    s += tile(48, 1320, 480, 300, 'AIRCRAFT', '4', 'near Faro, adsb.lol (ODbL)', pal.ink, 'live');
    s += tile(552, 1320, 480, 300, 'SUNSET', '17:21', 'computed (NOAA)', pal.accent, null);
  } else if (i === 1) {
    s += T(64, 640, 'London', 52, pal.here, { w: 700 }); s += tag(260, 640, 'sim', 30, pal).svg; s += T(600, 640, 'Faro', 52, pal.alg, { w: 700 }); s += tag(740, 640, 'live', 30, pal).svg;
    s += T(64, 790, '9.0°', 140, pal.here, { font: MONO, w: 700 }); s += T(600, 790, '20.6°', 140, pal.alg, { font: MONO, w: 700 });
    // a three-day bar chart of maxima
    s += R(48, 850, W - 96, 520, pal.panel, { rx: 16 }); s += T(80, 910, 'Maximum, next three days', 32, pal.soft, { w: 700 });
    [['Thu', 8, 21], ['Fri', 10, 20], ['Sat', 9, 19]].forEach(([d, a, b], j) => { const x = 140 + j * 300, base = 1300; s += R(x, base - a * 15, 90, a * 15, pal.here); s += R(x + 100, base - b * 15, 90, b * 15, pal.alg); s += T(x + 45, base - a * 15 - 14, `${a}°`, 34, pal.here, { anchor: 'middle', font: MONO }); s += T(x + 145, base - b * 15 - 14, `${b}°`, 34, pal.alg, { anchor: 'middle', font: MONO }); s += T(x + 95, base + 50, d, 34, pal.ink, { anchor: 'middle', w: 700 }); });
    s += tile(48, 1400, 480, 230, 'SUNSET FARO', '17:21', 'computed', pal.alg, null); s += tile(552, 1400, 480, 230, 'DARK IN LONDON', '16:08', 'computed', pal.here, null);
  } else {
    s += T(64, 660, '5 h to this sunset', 84, pal.ink, { w: 800 }); s += tag(64, 740, 'inv', 32, pal).svg;
    // a timeline from now to the sunset
    const x0 = 64, x1 = W - 64, y = 900, seg = [[60, '#a9b8c6', 'train'], [90, '#6c8a9c', 'airport'], [165, '#6cc4e8', 'flight'], [40, '#ffc872', 'to the marina']];
    let x = x0; const tot = seg.reduce((a, b) => a + b[0], 0) + 160;
    seg.forEach(([m, c, l]) => { const w = (x1 - x0) * m / tot; s += R(x, y, w - 6, 70, c, { rx: 8 }); s += T(x, y + 120, l, 28, pal.soft); x += w; });
    s += R(x, y, x1 - x, 70, 'none', { stroke: pal.alg, sw: 4, dash: '10 8', rx: 8 }); s += T(x1, y - 20, 'sunset 17:21', 30, pal.alg, { anchor: 'end', w: 700 }); s += T(x0, y - 20, 'now 09:00', 30, pal.ink, { w: 700 });
    s += tile(48, 1060, W - 96, 230, 'DEPARTURE', '11:00 flight', 'invented example, not a timetable', pal.ink, 'inv');
    s += qr(64, 1320, 320); s += T(430, 1450, 'Scan to plan', 64, pal.ink, { w: 800 }); s += T(430, 1510, '(a simulation)', 40, pal.soft);
  }
  s += dots(pal, i); s += smallPrint(pal); return s;
};
D.dusk = i => {
  const pal = P.dusk; let s = R(0, 0, W, H, pal.bg);
  s += scene({ dusk: true, top: 0, h: 1700 });
  const dk = `dk${++uid}`;
  s += `<defs><linearGradient id="${dk}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171b36" stop-opacity=".92"/><stop offset="1" stop-color="#171b36" stop-opacity=".2"/></linearGradient></defs>`;
  s += R(0, 0, W, 900, `url(#${dk})`);
  const arc = (cx, cy, r, f, col, label) => `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>` + `<circle cx="${cx - r * Math.cos(Math.PI * f)}" cy="${cy - r * Math.sin(Math.PI * f)}" r="26" fill="${col}"/>` + T(cx, cy + 56, label, 34, pal.ink, { anchor: 'middle', w: 600 });
  if (i === 0) {
    s += T(64, 220, 'Faro, 17:05', 84, pal.ink, { w: 300 }); s += T(64, 470, '20.6°C', 220, pal.accent, { w: 200 }); s += tag(64, 560, 'live', 40, pal).svg;
    s += T(64, 650, 'Partly cloudy today, IPMA', 44, pal.ink, { w: 300 });
    s += R(48, 1180, W - 96, 420, pal.panel, { rx: 28, op: 0.88 });
    s += arc(W / 2, 1450, 300, 0.97, pal.accent, 'the sun in Faro now (computed)');
  } else if (i === 1) {
    s += T(64, 200, 'Daylight', 96, pal.ink, { w: 300 });
    s += R(48, 260, W - 96, 620, pal.panel, { rx: 28, op: 0.9 });
    s += arc(300, 640, 200, 1, pal.here, 'London: ended 16:08'); s += arc(780, 640, 200, 0.95, pal.accent, 'Faro: sunset 17:21');
    s += T(W / 2, 820, 'both computed in the browser (NOAA equations)', 28, pal.soft, { anchor: 'middle' });
    s += R(48, 920, W - 96, 660, pal.panel, { rx: 28, op: 0.9 });
    s += T(96, 1010, 'London 9.0°C rain', 46, pal.here, { w: 500 }); s += tag(560, 1008, 'sim', 30, pal).svg; s += T(96, 1080, 'Faro 20.6°C partly cloudy', 46, pal.accent, { w: 500 }); s += tag(720, 1078, 'live', 30, pal).svg;
    [['Thu 19', '8° showers', '21° partly cloudy'], ['Fri 20', '10° grey', '20° high cloud'], ['Sat 21', '9° rain', '19° sunny intervals']].forEach((r, j) => { const y = 1200 + j * 110; s += T(96, y, r[0], 38, pal.ink, { w: 600 }); s += T(300, y, r[1], 38, pal.here); s += T(600, y, r[2], 38, pal.accent); });
    s += T(96, 1540, 'IPMA forecast for Faro; London simulated; sun computed.', 26, pal.soft);
  } else {
    s += T(64, 220, 'You could', 80, pal.ink, { w: 300 }); s += T(64, 380, 'wake up here', 140, pal.accent, { w: 200 }); s += T(64, 490, 'tomorrow', 80, pal.ink, { w: 300 });
    s += R(48, 600, W - 96, 520, pal.panel, { rx: 28, op: 0.9 });
    s += T(96, 690, 'For example', 38, pal.ink, { w: 700 }); s += tag(330, 690, 'inv', 30, pal).svg;
    ['05:00 leave Oxford Circus', '07:00 flight to Faro', '10:40 Faro marina', '17:21 sunset (computed)'].forEach((l, j) => { s += T(96, 780 + j * 80, l, 40, j === 3 ? pal.accent : pal.ink); });
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
function layoutWide() {
  const w = 1366, h = 900; let s = R(0, 0, w, h, '#f7f7f4');
  s += R(0, 0, w, 44, '#ffe9a8'); s += T(w / 2, 28, BAND.slice(0, 150) + ' ...', 12, '#332600', { anchor: 'middle' });
  s += R(0, 44, w, 56, '#ffffff'); s += T(40, 80, 'London billboard (a simulation)', 18, '#1c1f23', { w: 700 });
  ['The screen', 'The idea', 'Planning assistant', 'Designs', 'Use the data', 'Use with AI', 'Behind the scenes'].forEach((n, i) => { s += T(430 + [0, 100, 180, 330, 410, 520, 620][i], 80, n, 14, i ? '#0b5c8a' : '#1c1f23', { w: i ? 400 : 700 }); });
  s += frameScreen(330, 130, 560); // 315 x 560
  s += R(250, 712, 480, 40, '#ffffff', { rx: 6, stroke: '#d8dad6', sw: 1 }); ['Previous', 'Pause', 'Next'].forEach((b, i) => { s += R(300 + i * 100, 718, 86, 28, 'none', { rx: 5, stroke: '#1c1f23', sw: 1 }); s += T(343 + i * 100, 737, b, 13, '#1c1f23', { anchor: 'middle' }); }); s += T(610, 737, 'Phase 1 of 3', 13, '#4f565e');
  s += R(200, 764, 580, 64, '#fbeee8', { rx: 4 }); s += R(200, 764, 6, 64, '#a13d1a'); s += T(220, 790, 'Would switch message.', 15, '#1c1f23', { w: 800 }); s += T(220, 814, 'Rain in Faro today too; London is colder (simulated). Drier in Faro from Thu.', 13, '#1c1f23');
  s += R(930, 130, 400, 740, '#ffffff', { rx: 6, stroke: '#d8dad6', sw: 1 });
  s += T(952, 166, 'Set the screen', 18, '#1c1f23', { w: 700 });
  const fs = (y, h2, title, lines) => R(950, y, 360, h2, 'none', { rx: 6, stroke: '#c9ccc8', sw: 1 }) + T(966, y + 24, title, 14, '#1c1f23', { w: 700 }) + lines.map((l, i) => T(966, y + 48 + i * 22, l, 13, '#4f565e')).join('');
  s += fs(182, 96, 'Where the screen stands', ['( ) London   ( ) Porto   ( ) Braga   ( ) Lisbon', 'Station: [ Oxford Circus v ]', 'London weather is set by you: simulated']);
  s += fs(290, 96, 'London (simulated)', ['Weather: [ Rain v ]   Temperature: 9°C', 'Time: [ live clock v ]', 'Each London value carries "simulated"']);
  s += fs(398, 52, 'The Algarve', ['Place: [ Faro v ]']);
  s += fs(462, 52, 'Design', ['[ Default v ]  (the five designs, see /d/)']);
  s += T(952, 550, 'Where each figure comes from', 15, '#1c1f23', { w: 700 });
  ['Faro 20.6°C: IPMA, Faro (Aeródromo) 4 km, obs 17:00 UTC, read 17:56  live', 'Faro today: IPMA forecast Faro 1080500, read 17:54  live', 'Sea: IPMA, Faro coast, read 17:56  live', 'Aircraft near Faro: adsb.lol (ODbL), read 17:53  live', 'London: set by you  simulated', 'Sunset times: computed in your browser', 'Journey: invented example'].forEach((l, i) => { s += T(966, 578 + i * 26, '- ' + l, 12, '#1c1f23'); });
  s += T(966, 778, 'Terms: IPMA free use, no profit-making purpose,', 12, '#4f565e'); s += T(966, 796, 'always named. Not a warning service.', 12, '#4f565e');
  s += T(40, 880, 'Below the fold: "What you are looking at" (the three phases, the labels, the idea credited to Dinis Cruz).', 14, '#4f565e');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Mock-up: the home page at 1366 px wide">${s}</svg>`;
}
function layoutPhone() {
  const w = 390, h = 1500; let s = R(0, 0, w, h, '#f7f7f4');
  s += R(0, 0, w, 92, '#ffe9a8'); ['Simulation. This billboard does not exist: no screen,', 'campaign or booking is real. The Algarve weather is real,', 'read live from IPMA via data.promptugal.news; London\'s', 'weather is set by you; flights, prices ... Idea: Dinis Cruz.'].forEach((l, i) => { s += T(16, 20 + i * 19, l, 11.5, '#332600'); });
  s += R(0, 92, w, 48, '#ffffff'); s += T(16, 122, 'London billboard (a simulation)', 15, '#1c1f23', { w: 700 }); s += T(374, 122, 'Menu', 14, '#0b5c8a', { anchor: 'end' });
  s += frameScreen(48, 168, 520); // ~292 x 520
  ['Previous', 'Pause', 'Next'].forEach((b, i) => { s += R(40 + i * 104, 716, 96, 44, 'none', { rx: 6, stroke: '#1c1f23', sw: 1 }); s += T(88 + i * 104, 744, b, 14, '#1c1f23', { anchor: 'middle' }); });
  s += R(16, 776, w - 32, 92, '#fbeee8', { rx: 4 }); s += R(16, 776, 5, 92, '#a13d1a'); s += T(32, 802, 'Would switch message.', 15, '#1c1f23', { w: 800 }); s += T(32, 826, 'Rain in Faro today too; London is', 13, '#1c1f23'); s += T(32, 846, 'colder (simulated). Drier from Thu.', 13, '#1c1f23');
  s += R(16, 888, w - 32, 400, '#ffffff', { rx: 6, stroke: '#d8dad6', sw: 1 }); s += T(32, 918, 'Set the screen', 16, '#1c1f23', { w: 700 });
  ['Where the screen stands', 'London (simulated)', 'The Algarve', 'Design'].forEach((t, i) => { s += R(32, 934 + i * 78, w - 64, 66, 'none', { rx: 6, stroke: '#c9ccc8', sw: 1 }); s += T(46, 958 + i * 78, t, 13, '#1c1f23', { w: 700 }); s += R(46, 970 + i * 78, w - 92, 18, '#eef0ee', { rx: 3 }); });
  s += T(16, 1320, 'Where each figure comes from', 15, '#1c1f23', { w: 700 });
  s += bars(16, 1336, w - 32, 6, 20, 9, '#c9ccc8');
  s += T(16, 1480, 'Then "What you are looking at", then the footer.', 13, '#4f565e');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Mock-up: the home page at 390 px wide">${s}</svg>`;
}
function layoutKiosk() {
  const w = 1366, h = 768; let s = R(0, 0, w, h, '#000000');
  s += frameScreen(467, 0, 768);
  ['Simulation.', 'This billboard does not exist:', 'no screen, campaign or', 'booking is real. The Algarve', 'weather is real, read live', 'from IPMA via', 'data.promptugal.news;', 'London\'s weather is set by', 'you; flights, prices and', 'times are invented examples.', 'Idea: Dinis Cruz.'].forEach((l, i) => { s += T(60, 300 + i * 22, l, 15, '#d9d9d9', { w: i ? 400 : 800 }); });
  s += T(60, 270, '?kiosk=1, landscape window', 13, '#8a8a8a');
  s += T(1300, 740, 'no controls; Esc or the address bar to leave', 12, '#8a8a8a', { anchor: 'end' });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Mock-up: the kiosk view in a landscape window">${s}</svg>`;
}
function chooser() {
  const w = 1366, h = 900; let s = R(0, 0, w, h, '#f7f7f4');
  s += R(0, 0, w, 44, '#ffe9a8'); s += T(w / 2, 28, BAND.slice(0, 150) + ' ...', 12, '#332600', { anchor: 'middle' });
  s += T(80, 120, 'Designs', 36, '#1c1f23', { w: 800 });
  s += T(80, 156, 'Five ways to draw the same screen and the same live data. Every label and the small print stay in each.', 16, '#4f565e');
  const ids = ['poster', 'board', 'postcard', 'readout', 'dusk'];
  const lines = { poster: 'A calm printed poster: the drawing as a plate, serif type on paper.', board: 'Station-board rows, amber on near-black, figures in monospace.', postcard: 'A postcard from the Algarve: picture side, then the written back.', readout: 'Data first: tiles with the source under every figure.', dusk: 'Light type on deep blue, led by the sun and daylight.' };
  ids.forEach((id, i) => {
    const x = 80 + i * 248, y = 190;
    s += R(x, y, 232, 640, '#ffffff', { rx: 8, stroke: '#d8dad6', sw: 1 });
    s += `<g transform="translate(${x + 16} ${y + 16}) scale(${200 / W})">${D[id](0)}</g>`;
    s += T(x + 16, y + 400, P[id].name, 20, '#0b5c8a', { w: 700 });
    const words = lines[id].split(' '); let ln = '', k = 0; for (const wd of words) { if ((ln + wd).length > 30) { s += T(x + 16, y + 428 + k * 20, ln.trim(), 14, '#4f565e'); ln = ''; k++; } ln += wd + ' '; } s += T(x + 16, y + 428 + k * 20, ln.trim(), 14, '#4f565e');
    const pal = P[id]; [pal.bg, pal.ink, pal.accent, pal.here, pal.alg].forEach((c, j) => { s += R(x + 16 + j * 40, y + 520, 36, 16, c, { stroke: '#9aa3ab', sw: 1 }); });
    s += T(x + 16, y + 570, 'Open the design', 14, '#0b5c8a'); s += T(x + 16, y + 594, 'Preview: screenshot, phase 1', 12, '#4f565e');
  });
  s += T(80, 870, 'Each card is one link: preview, name, idea, palette. Previews are screenshots of phase 1, under 300 KB each.', 14, '#4f565e');
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
  'screen-phases.svg': strip([['Safe areas and type', gridFrame()], ['1. The Algarve now', defaultPhase(0)], ['2. The comparison', defaultPhase(1)], ['3. The journey', defaultPhase(2)], ['Today: Algarve wet too', defaultPhase(0, { wet: true, ribbon: true, switchMsg: true })]], 'Mock-up: the screen at 1080 x 1920, phase by phase, and the pause state'),
  'chooser.svg': chooser(),
};
for (const id of ['poster', 'board', 'postcard', 'readout', 'dusk']) files[`design-${id}.svg`] = strip([0, 1, 2].map(i => [`${P[id].name}: phase ${i + 1}`, D[id](i)]), `Mock-up: design ${P[id].name}, three phases`);
for (const [n, svg] of Object.entries(files)) { writeFileSync(join(OUT, n), svg); console.log(n, (svg.length / 1024).toFixed(1), 'KB'); }

// scene.js: the drawn Algarve scene behind the screen (an SVG, 1080 x 1920).
// It is a drawing, not a camera: live.promptugal.news offers no cameras yet (checked 2026-11-18).
// The drawing follows the place's real local time (the sun's height from sun.js, night after
// sunset) and the live weather from IPMA (cloud, rain, wind). It never embeds a third-party stream.
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18. Code Apache-2.0.

import { sunPosition, isDark } from './sun.js';

export const DRAWING_NOTE = 'Drawing, not a camera: live.promptugal.news offers no cameras yet (checked 2026-11-18)';

// The camera hook. The one place that may later read a camera list, and only from
// live.promptugal.news (Dinis Cruz asked the data team on 2026-11-18 whether it can collect the
// region's public cameras). On 2026-11-18 that site says "First version coming" and offers no
// cameras or API, so this returns "none" without a network call. It checks nothing else, and the
// screen never embeds any third-party stream.
export async function findCamera(placeId) {
  return { available: false, place: placeId, checked: '2026-11-18', where: 'https://live.promptugal.news', note: DRAWING_NOTE };
}

const W = 1080, H = 1920, HORIZON = 1180;
const mix = (a, b, t) => {
  const p = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16));
  const A = p(a), B = p(b), k = Math.max(0, Math.min(1, t));
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
// A small fixed random sequence, so the same scene draws the same way each time.
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// Sky colours by the sun's height (degrees).
function skyColours(alt, cover) {
  let top, bottom;
  if (alt < -12) { top = '#0a1230'; bottom = '#1b2a52'; }
  else if (alt < -4) { const t = (alt + 12) / 8; top = mix('#0a1230', '#243a78', t); bottom = mix('#1b2a52', '#b86a5a', t); }
  else if (alt < 2) { const t = (alt + 4) / 6; top = mix('#243a78', '#4a78bd', t); bottom = mix('#b86a5a', '#f2a65e', t); }
  else if (alt < 12) { const t = (alt - 2) / 10; top = mix('#4a78bd', '#3b8bd4', t); bottom = mix('#f2a65e', '#bfe2f4', t); }
  else { top = '#3b8bd4'; bottom = '#bfe2f4'; }
  const grey = alt < -4 ? '#2a3140' : '#8e98a4';
  const g = (cover || 0) * 0.75;
  return { top: mix(top, grey, g), bottom: mix(bottom, mix(grey, '#c9ced4', alt < -4 ? 0 : 0.5), g) };
}

function cloud(x, y, s, fill, op) {
  return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})" fill="${fill}" opacity="${op}">`
    + '<ellipse cx="0" cy="0" rx="120" ry="48"/><ellipse cx="-70" cy="10" rx="80" ry="38"/><ellipse cx="80" cy="12" rx="90" ry="36"/><ellipse cx="10" cy="-30" rx="80" ry="45"/></g>';
}

function palm(x, y, lean, night) {
  const trunk = night ? '#2a2018' : '#7a5a3a', leaf = night ? '#16261c' : '#2f6b3a';
  const tx = x + lean * 60, ty = y - 330;
  let s = `<path d="M${x} ${y} Q${x + lean * 25} ${y - 170} ${tx} ${ty}" stroke="${trunk}" stroke-width="22" fill="none" stroke-linecap="round"/>`;
  for (const a of [-150, -110, -60, -20, 20, 60]) {
    const r = (a + lean * 25) * Math.PI / 180, L = 150;
    const ex = tx + Math.cos(r) * L, ey = ty + Math.sin(r) * L * 0.6 + 40;
    s += `<path d="M${tx} ${ty} Q${(tx + ex) / 2} ${ty - 50} ${ex.toFixed(0)} ${ey.toFixed(0)}" stroke="${leaf}" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  }
  return `<g class="scene-palm">${s}</g>`;
}

function foreground(kind, night, wind) {
  const lean = Math.min(1, (wind || 0) / 50);
  const sand = night ? '#4b4234' : '#e6cf9e', cliff = night ? '#4a2c1c' : '#c46a33', cliffDark = night ? '#331e14' : '#9c4f24';
  const white = night ? '#5b6170' : '#f6f2ea', roof = night ? '#4a2a22' : '#b5532e', lamp = '#ffd27a';
  let s = '';
  if (kind === 'cliffs') {
    s += `<path d="M0 1050 L170 1030 L260 1090 L300 1230 L330 1420 L0 1480 Z" fill="${cliff}"/>`;
    s += `<path d="M120 1240 Q170 1150 220 1240 L220 1420 L120 1420 Z" fill="${cliffDark}"/>`;
    s += `<path d="M1080 1000 L900 1010 L820 1100 L770 1260 L740 1440 L1080 1480 Z" fill="${cliff}"/>`;
    s += `<path d="M860 1250 Q900 1180 940 1250 L940 1430 L860 1430 Z" fill="${cliffDark}"/>`;
    s += `<path d="M560 1235 L600 1170 L640 1235 Z" fill="${cliffDark}"/>`;
    s += `<path d="M0 1460 Q540 1380 1080 1460 L1080 1920 L0 1920 Z" fill="${sand}"/>`;
  } else if (kind === 'marina') {
    s += `<rect x="0" y="1390" width="1080" height="40" fill="${night ? '#3a3a3a' : '#8a8178'}"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 90 + i * 170, y = 1360 + (i % 2) * 12;
      s += `<path d="M${x - 60} ${y} L${x + 60} ${y} L${x + 45} ${y + 30} L${x - 45} ${y + 30} Z" fill="${white}"/>`;
      s += `<line x1="${x}" y1="${y}" x2="${x + lean * 6}" y2="${y - 230 - (i % 3) * 30}" stroke="${night ? '#777' : '#d8d8d8'}" stroke-width="5"/>`;
      if (night) s += `<circle cx="${x + lean * 6}" cy="${y - 230 - (i % 3) * 30}" r="6" fill="${lamp}"/>`;
    }
    s += `<path d="M0 1430 L1080 1430 L1080 1920 L0 1920 Z" fill="${night ? '#2b2620' : '#d9c7a4'}"/>`;
    s += palm(160, 1600, lean, night) + palm(900, 1640, lean * 0.9, night);
    if (night) for (const x of [380, 700]) s += `<rect x="${x}" y="1470" width="10" height="130" fill="#333"/><circle cx="${x + 5}" cy="1465" r="16" fill="${lamp}"/>`;
  } else if (kind === 'river') {
    s += `<path d="M0 1080 L1080 1080 L1080 1250 L0 1250 Z" fill="${night ? '#1f2a33' : '#9fb5a0'}"/>`;
    for (let i = 0; i < 9; i++) {
      const x = 20 + i * 120, h = 90 + (i * 37) % 60;
      s += `<rect x="${x}" y="${1180 - h}" width="110" height="${h + 70}" fill="${white}"/>`;
      s += `<path d="M${x - 6} ${1180 - h} L${x + 55} ${1140 - h} L${x + 116} ${1180 - h} Z" fill="${roof}"/>`;
      s += `<rect x="${x + 25}" y="${1200 - h}" width="22" height="30" fill="${night ? lamp : '#3d5a73'}"/><rect x="${x + 65}" y="${1200 - h}" width="22" height="30" fill="${night && i % 2 ? lamp : '#3d5a73'}"/>`;
    }
    s += `<path d="M0 1330 L1080 1330 L1080 1380 L0 1380 Z" fill="${night ? '#4a4038' : '#d8c3a0'}"/>`;
    for (let i = 0; i < 7; i++) s += `<path d="M${i * 160 - 20} 1380 Q${i * 160 + 60} 1290 ${i * 160 + 140} 1380 Z" fill="${night ? '#1d2a38' : '#5a7f97'}"/>`;
    s += `<path d="M0 1500 L1080 1500 L1080 1920 L0 1920 Z" fill="${night ? '#2b2620' : '#d6c09a'}"/>`;
    s += palm(900, 1700, lean, night);
  } else {
    s += `<path d="M0 1420 Q540 1360 1080 1420 L1080 1920 L0 1920 Z" fill="${sand}"/>`;
    for (const [x, y] of [[160, 1400], [880, 1395], [960, 1410]]) s += `<ellipse cx="${x}" cy="${y}" rx="70" ry="35" fill="${cliffDark}"/>`;
    for (const x of [380, 620]) s += `<line x1="${x}" y1="1610" x2="${x + lean * 10}" y2="1480" stroke="${night ? '#555' : '#6b5a48'}" stroke-width="8"/><path d="M${x - 15 + lean * 10} 1480 L${x + 15 + lean * 10} 1480 L${x + lean * 10} 1560 Z" fill="${night ? '#3a3a50' : '#d9493a'}"/>`;
  }
  return `<g class="scene-ground">${s}</g>`;
}

// drawScene(opts) -> an SVG string (viewBox 1080 x 1920).
// opts: { place: { id, label, lat, lon, scene }, at (Date), cover (0..1), rain (bool), windKmh, reducedMotion }
export function drawScene({ place, at = new Date(), cover = 0, rain = false, windKmh = 0 } = {}) {
  const lat = place?.lat ?? 37.0194, lon = place?.lon ?? -7.9322;
  const { altitude, hourAngle } = sunPosition(at, lat, lon);
  const night = isDark(at, lat, lon);
  const c = skyColours(altitude, cover);
  const R = rng(String(place?.id || 'x').split('').reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7));
  const id = `sc-${place?.id || 'x'}`;
  let s = `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${night ? 'Night' : 'Day'} drawing of ${place?.label || 'the Algarve'} with ${rain ? 'rain' : cover > 0.6 ? 'cloud' : 'a clear sky'}. A drawing, not a camera." data-night="${night}" data-altitude="${altitude.toFixed(1)}">`;
  s += `<defs><linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.top}"/><stop offset="1" stop-color="${c.bottom}"/></linearGradient>`;
  const seaTop = night ? '#14203a' : mix('#2f87a8', '#6b7d88', cover * 0.6), seaBottom = night ? '#0b1428' : mix('#0f5a78', '#3e4f5a', cover * 0.6);
  s += `<linearGradient id="${id}-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${seaTop}"/><stop offset="1" stop-color="${seaBottom}"/></linearGradient>`;
  s += `<radialGradient id="${id}-sun"><stop offset="0" stop-color="#fff6cf"/><stop offset=".45" stop-color="#ffd36b"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect class="scene-sky" width="${W}" height="${HORIZON + 10}" fill="url(#${id}-sky)"/>`;
  // Stars and moon after dark when the sky is fairly clear.
  if (night && cover < 0.7) {
    for (let i = 0; i < 70; i++) s += `<circle cx="${(R() * W).toFixed(0)}" cy="${(R() * 900).toFixed(0)}" r="${(R() * 2.4 + 0.8).toFixed(1)}" fill="#fff" opacity="${(0.4 + R() * 0.5).toFixed(2)}"/>`;
    s += `<circle cx="820" cy="300" r="46" fill="#f1ecd8"/><circle cx="840" cy="288" r="42" fill="${c.top}"/>`;
  }
  // The sun, placed by its hour angle and height; hidden by thick cloud.
  if (altitude > -2) {
    const x = Math.max(80, Math.min(1000, 540 + hourAngle * 6));
    const y = HORIZON - Math.max(-2, altitude) * 22;
    const op = cover > 0.8 ? 0.25 : 1;
    s += `<circle class="scene-sun" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="160" fill="url(#${id}-sun)" opacity="${op}"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="58" fill="#fff1b8" opacity="${op}"/>`;
  }
  // Clouds: how many follows the cover; they drift faster in stronger wind.
  const n = Math.round((cover || 0) * 9);
  if (n) {
    const dur = Math.max(30, 160 - (windKmh || 0) * 3);
    const fill = night ? '#3a4255' : rain || cover > 0.8 ? '#a4abb4' : '#ffffff';
    s += `<g class="scene-clouds"><g class="scene-drift" style="animation-duration:${dur}s">`;
    for (let i = 0; i < n; i++) s += cloud(R() * 1200 - 60, 120 + R() * 760, 0.8 + R() * 1.3, fill, (0.75 + R() * 0.25).toFixed(2));
    s += '</g></g>';
  }
  // The sea and its waves; the low sun lays a path on the water.
  s += `<rect class="scene-sea" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#${id}-sea)"/>`;
  const sx = Math.max(80, Math.min(1000, 540 + hourAngle * 6));
  if (altitude > -1 && altitude < 15 && cover < 0.8) s += `<path d="M${sx - 50} ${HORIZON} L${sx + 50} ${HORIZON} L${sx + 160} 1500 L${sx - 160} 1500 Z" fill="#ffd38a" opacity=".35"/>`;
  s += '<g class="scene-waves">';
  for (let i = 0; i < 14; i++) {
    const y = HORIZON + 25 + i * 22 + R() * 10, x = R() * W;
    s += `<path d="M${(x - 80).toFixed(0)} ${y.toFixed(0)} q40 -${(6 + windKmh / 6).toFixed(0)} 80 0 t80 0" stroke="#ffffff" stroke-opacity="${night ? 0.15 : 0.45}" stroke-width="4" fill="none"/>`;
  }
  s += '</g>';
  s += foreground(place?.scene || 'beach', night, windKmh);
  // Rain: slanted by the wind.
  if (rain) {
    const slant = Math.min(60, (windKmh || 0) * 1.5);
    s += `<g class="scene-rain" stroke="${night ? '#8fa0c0' : '#dfe8f2'}" stroke-width="3" stroke-opacity=".6">`;
    for (let i = 0; i < 140; i++) {
      const x = R() * (W + 100) - 50, y = R() * H;
      s += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - slant * 0.6).toFixed(0)}" y2="${(y + 46).toFixed(0)}"/>`;
    }
    s += '</g>';
  }
  if (night) s += `<rect width="${W}" height="${H}" fill="#050a1a" opacity=".18"/>`;
  return s + '</svg>';
}

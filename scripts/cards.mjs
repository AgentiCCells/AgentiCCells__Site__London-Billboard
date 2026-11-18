// cards.mjs: render the 1200x630 PNG share cards (link previews) into src/assets/share/, one per
// section: home, idea, plan, designs, use-the-data, use-with-ai, behind-the-scenes. A card holds
// no live figure (it would go stale): the word "Simulation" in the band, the title, one line, a
// drawing, and "Idea: Dinis Cruz". System fonts only; nothing is loaded from another host.
// Run: node scripts/cards.mjs (needs Playwright's Chromium). Each card must be 300 KB or under.
// Adapted from scripts/cards.mjs in AgentiCCells/AgentiCCells__Site__Algarve-Holiday-Homes
// (developer.algarve-holiday-homes@AgentiCCells.dinis, Apache-2.0, same organisation), itself from
// AgentiCCells__Site__IPMA-Data: the card frame and the render loop. Drawings and text by
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18, round 1.
// Code Apache-2.0; the cards' text and drawings CC BY 4.0.
import { createRequire } from 'node:module';
import { writeFileSync, statSync, mkdirSync } from 'node:fs';
import { SITE_NAME } from './lib.mjs';
const require = createRequire(import.meta.url);
const OUT = 'src/assets/share';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const TOKENS = '--bg:#F7F7F4;--surface:#FFFFFF;--ink:#1C1F23;--ink-2:#4F565E;--line:#D8DAD6;--accent:#0B5C8A;--sun:#E8A33D;--sea:#7FC3EC;--sea-2:#3E8FB8;--sand:#F1DDB0;--grey:#9AA3AB;--band-bg:#FFE9A8;--band-ink:#332600';

// The screen: a portrait billboard on a post, Algarve sun and sea on it, a grey London sky behind.
const screen = (x, y, w) => {
  const h = w * 16 / 9;
  return `<g transform="translate(${x} ${y})">
<rect x="${w / 2 - 6}" y="${h}" width="12" height="${w * 0.45}" fill="var(--ink)"/>
<rect x="-8" y="-8" width="${w + 16}" height="${h + 16}" rx="10" fill="var(--ink)"/>
<rect width="${w}" height="${h}" fill="#BFE6F7"/>
<circle cx="${w * 0.68}" cy="${h * 0.22}" r="${w * 0.16}" fill="var(--sun)"/>
<path d="M0 ${h * 0.62} Q${w * 0.3} ${h * 0.57} ${w * 0.55} ${h * 0.61} T${w} ${h * 0.6} V${h} H0Z" fill="var(--sea-2)"/>
<path d="M0 ${h * 0.8} Q${w * 0.4} ${h * 0.74} ${w} ${h * 0.79} V${h} H0Z" fill="var(--sand)"/>
<rect x="${w * 0.1}" y="${h * 0.38}" width="${w * 0.5}" height="${w * 0.07}" rx="${w * 0.035}" fill="#FFFFFF"/>
<rect x="${w * 0.1}" y="${h * 0.47}" width="${w * 0.34}" height="${w * 0.05}" rx="${w * 0.025}" fill="#FFFFFF" opacity=".85"/>
</g>`;
};
const rain = Array.from({ length: 18 }, (_, i) => `<path d="M${20 + (i * 53) % 400} ${20 + (i * 37) % 160}l-8 18" stroke="var(--grey)" stroke-width="3" stroke-linecap="round"/>`).join('');
const homeArt = `<svg viewBox="0 0 420 470" aria-hidden="true"><rect width="420" height="470" rx="14" fill="#DCE1E5"/>${rain}<path d="M0 360h420v110H0z" fill="#B9C0C6"/><path d="M20 360V250h50v110M300 360V210h60v150" fill="#C9CFD4"/>${screen(150, 40, 150)}</svg>`;
const ideaArt = `<svg viewBox="0 0 420 470" aria-hidden="true"><rect x="70" y="30" width="280" height="380" rx="10" fill="var(--surface)" stroke="var(--ink)" stroke-width="4"/><path d="M110 90h200M110 125h160M110 160h200M110 195h120" stroke="var(--ink-2)" stroke-width="10" stroke-linecap="round"/><rect x="110" y="240" width="90" height="130" fill="var(--sea)"/><circle cx="175" cy="270" r="18" fill="var(--sun)"/><rect x="220" y="240" width="90" height="130" fill="#DCE1E5"/><path d="M235 270l-6 14M260 260l-6 14M285 275l-6 14" stroke="var(--grey)" stroke-width="4" stroke-linecap="round"/><text x="210" y="450" text-anchor="middle" font-size="22" fill="var(--ink-2)" font-family="system-ui,sans-serif">white paper</text></svg>`;
const planArt = `<svg viewBox="0 0 420 470" aria-hidden="true"><rect x="110" y="20" width="200" height="400" rx="26" fill="var(--surface)" stroke="var(--ink)" stroke-width="5"/><rect x="130" y="70" width="140" height="56" rx="14" fill="#E6EEF3"/><path d="M146 92h100M146 110h70" stroke="var(--ink-2)" stroke-width="7" stroke-linecap="round"/><rect x="150" y="146" width="140" height="56" rx="14" fill="var(--accent)"/><path d="M166 168h100M166 186h60" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/><rect x="130" y="222" width="140" height="56" rx="14" fill="#E6EEF3"/><path d="M146 244h110M146 262h50" stroke="var(--ink-2)" stroke-width="7" stroke-linecap="round"/><g transform="translate(160 300)">${[[0, 0], [60, 0], [0, 60], [30, 30], [70, 50], [40, 80]].map(([a, b]) => `<rect x="${a}" y="${b}" width="30" height="30" fill="var(--ink)"/>`).join('')}<rect width="100" height="100" fill="none" stroke="var(--ink)" stroke-width="4"/></g></svg>`;
const designsArt = `<svg viewBox="0 0 420 470" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => { const x = 14 + i * 80, w = 66, h = w * 16 / 9; const sky = ['#BFE6F7', '#FCE3B8', '#D9EAF2', '#1F3A52', '#F6D2C4'][i]; return `<g transform="translate(${x} ${110 + (i % 2) * 40})"><rect x="-4" y="-4" width="${w + 8}" height="${h + 8}" rx="6" fill="var(--ink)"/><rect width="${w}" height="${h}" fill="${sky}"/><circle cx="${w * 0.65}" cy="${h * 0.25}" r="${w * 0.16}" fill="var(--sun)"/><path d="M0 ${h * 0.65}h${w}V${h}H0z" fill="var(--sea-2)"/><rect x="${w * 0.12}" y="${h * 0.42}" width="${w * 0.6}" height="7" rx="3" fill="#FFFFFF"/></g>`; }).join('')}</svg>`;
const dataArt = `<svg viewBox="0 0 420 470" aria-hidden="true"><rect x="30" y="90" width="160" height="210" rx="10" fill="var(--surface)" stroke="var(--ink)" stroke-width="4"/><path d="M55 135h110M55 170h80M55 205h110M55 240h60" stroke="var(--accent)" stroke-width="9" stroke-linecap="round"/><path d="M205 195h45" stroke="var(--ink)" stroke-width="5"/><path d="M240 180l18 15-18 15" fill="none" stroke="var(--ink)" stroke-width="5"/><rect x="270" y="120" width="130" height="150" rx="10" fill="var(--band-bg)" stroke="var(--ink)" stroke-width="4"/><text x="335" y="212" text-anchor="middle" font-size="50" font-weight="700" fill="var(--band-ink)" font-family="ui-monospace,monospace">{ }</text><text x="210" y="370" text-anchor="middle" font-size="22" fill="var(--ink-2)" font-family="ui-monospace,monospace">latest.json, card.json</text></svg>`;
const aiArt = `<svg viewBox="0 0 420 470" aria-hidden="true"><rect x="40" y="70" width="200" height="260" rx="10" fill="var(--surface)" stroke="var(--ink)" stroke-width="4"/><text x="64" y="126" font-size="40" font-weight="700" fill="var(--accent)" font-family="ui-monospace,monospace">#</text><path d="M100 114h110M64 160h150M64 195h120M64 230h150M64 265h90" stroke="var(--ink-2)" stroke-width="9" stroke-linecap="round"/><rect x="270" y="150" width="120" height="120" rx="60" fill="none" stroke="var(--accent)" stroke-width="5"/><path d="M300 210h60M330 180v60" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/><text x="210" y="390" text-anchor="middle" font-size="22" fill="var(--ink-2)" font-family="ui-monospace,monospace">index.md, llms.txt</text></svg>`;
// Six steps in a snake: left to right, down, right to left, down, left to right.
const col = i => (Math.floor(i / 2) % 2 ? 1 - (i % 2) : i % 2);
const flowArt = `<svg viewBox="0 0 420 470" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${20 + col(i) * 210}" y="${40 + Math.floor(i / 2) * 140}" width="170" height="90" rx="12" fill="var(--surface)" stroke="var(--accent)" stroke-width="4"/><text x="${105 + col(i) * 210}" y="${95 + Math.floor(i / 2) * 140}" text-anchor="middle" font-size="34" font-weight="700" fill="var(--accent)" font-family="system-ui,sans-serif">${i + 1}</text>`).join('')}<path d="M190 85h40M315 130v50M190 225h40M105 270v50M190 365h40" stroke="var(--ink-2)" stroke-width="5"/></svg>`;

const PAGES = [
  ['home', 'A London billboard, live from the Algarve', 'A screen in London or another city shows the Algarve weather, read live from IPMA, beside the weather where it stands.', homeArt],
  ['idea', 'The idea', 'A weather-driven billboard campaign: when it rains here and the sun is out in the Algarve, the screen says so.', ideaArt],
  ['plan', 'Planning assistant', 'Scan the code on the screen and plan a trip. Scripted answers, no live model; flights and prices are invented examples.', planArt],
  ['designs', 'Five designs', 'Five ways the same screen could look, on the same live Algarve weather.', designsArt],
  ['use-the-data', 'Use the data', 'How this site reads IPMA data from data.promptugal.news in the browser, and how you can.', dataArt],
  ['use-with-ai', 'Use with AI', 'Markdown twins of every page, llms.txt and the data addresses, with each source\'s terms.', aiArt],
  ['behind-the-scenes', 'Behind the scenes', 'The agent team that makes this site: the brief, the roles, the rounds and every commit.', flowArt],
];

function card(title, line, art) {
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><style>
:root{${TOKENS}}*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;display:grid;grid-template-rows:auto 1fr auto}
.band{background:var(--band-bg);color:var(--band-ink);padding:16px 56px;font-size:25px;line-height:1.3}
.band strong{font-weight:800}
.top{display:grid;grid-template-columns:1fr 380px;gap:40px;padding:24px 56px 0;align-items:center;min-height:0}
.name{font-size:22px;font-weight:600;color:var(--accent);margin:0 0 16px}
h1{font-size:${title.length > 30 ? 54 : 66}px;line-height:1.05;margin:0 0 20px}
.line{font-size:27px;line-height:1.35;color:var(--ink-2);margin:0 0 22px}
.idea{font-size:26px;font-weight:700;margin:0}
.art svg{display:block;width:100%;height:auto;max-height:430px}
.foot{padding:12px 56px 18px;font-size:17px;color:var(--ink-2);border-top:2px solid var(--line)}
</style></head><body>
<div class="band"><strong>Simulation.</strong> This billboard does not exist. The Algarve weather is real, read live from IPMA.</div>
<div class="top"><div><p class="name">${esc(SITE_NAME)}</p><h1>${esc(title)}</h1><p class="line">${esc(line)}</p><p class="idea">Idea: Dinis Cruz</p></div><div class="art">${art}</div></div>
<div class="foot">london-billboard.agenticcells.site · Weather: IPMA via data.promptugal.news · No tourism body, operator, airline or advertiser involved</div>
</body></html>`;
}

const { chromium } = require('playwright');
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
let bad = 0;
for (const [name, title, line, art] of PAGES) {
  const html = card(title, line, art);
  if (!/Simulation\./.test(html) || !/Idea: Dinis Cruz/.test(html)) { console.error(`${name}: no "Simulation" or no "Idea: Dinis Cruz"`); bad++; }
  await page.setContent(html, { waitUntil: 'load' });
  const f = `${OUT}/${name}.png`;
  writeFileSync(f, await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } }));
  const kb = Math.round(statSync(f).size / 1024);
  if (statSync(f).size > 300 * 1024) bad++;
  console.log(`${f} ${kb} KB${statSync(f).size > 300 * 1024 ? ' (too big: over 300 KB)' : ''}`);
}
await browser.close();
if (bad) { console.error(`FAILED: ${bad} card(s) over 300 KB or without "Simulation" and "Idea: Dinis Cruz"`); process.exit(1); }
console.log(`OK: ${PAGES.length} cards`);

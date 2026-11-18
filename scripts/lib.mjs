// Shared layout for every page of the London billboard simulation: the <head> extras
// (canonical, link previews, styles, icon, Markdown twin), the simulation band, the header with
// the navigation, and the footer with the data attribution and the version.
// scripts/layout.mjs applies it to every built page: a page in src/ writes <!--HEAD-->,
// <!--HEADER--> and <!--FOOTER--> where these go (team/rounds/1.md, the contract). Node built-ins only.
// Adapted from scripts/lib.mjs in AgentiCCells/AgentiCCells__Site__Algarve-Holiday-Homes
// (developer.algarve-holiday-homes@AgentiCCells.dinis, Apache-2.0, same organisation), itself
// from AgentiCCells__Site__IPMA-Data. Changed for this site by
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18, round 1: the band, navigation and
// footer of the round 1 contract; no company branding.
// Code Apache-2.0; text CC BY 4.0.

export const SITE = 'https://london-billboard.agenticcells.site';
export const REPO = 'https://github.com/AgentiCCells/AgentiCCells__Site__London-Billboard';
export const SITE_NAME = 'London billboard (a simulation)';
export const API = 'https://data.promptugal.news/api/v1';
export const IPMA_TERMS_URL = 'https://api.ipma.pt/';
// The band, first thing on every page, word for word from team/rounds/1.md (the contract).
export const BAND = 'Simulation. This billboard does not exist: no screen, campaign or booking is real. The Algarve weather is real, read live from IPMA via data.promptugal.news; London\'s weather is set by you; flights, prices and times are invented examples. Idea: Dinis Cruz.';
// The same without its first word, which the header sets in <strong>.
export const BAND_TEXT = BAND.replace(/^Simulation\. /, '');
// For the Markdown twins.
export const DISCLAIMER = BAND;
export const IDEA = 'Idea: Dinis Cruz, from his white paper Dynamic Weather-Driven Algarve Tourism Campaign';
export const NOT_INVOLVED = 'No tourism body, operator, airline or advertiser is involved';
export const IPMA_TERMS = "IPMA's terms: free to use with no profit-making or offensive purpose; always name IPMA, Instituto Português do Mar e da Atmosfera, as the source.";
// Navigation, from the contract.
export const NAV = [
  ['/', 'The screen'],
  ['/idea/', 'The idea'],
  ['/plan/', 'Planning assistant (simulation)'],
  // ['/d/', 'Designs'], (round 1 stopped at Dinis's word before the designs were built; restore when src/d/ exists)
  ['/use-the-data/', 'Use the data'],
  ['/use-with-ai/', 'Use with AI'],
  ['/behind-the-scenes/', 'Behind the scenes'],
];
// The share card a page gets when it names none: by its first path segment, else home.png.
export const SHARE_BY_SECTION = { '': 'home', idea: 'idea', plan: 'plan', d: 'designs', 'use-the-data': 'use-the-data', 'use-with-ai': 'use-with-ai', 'behind-the-scenes': 'behind-the-scenes' };

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const twin = path => (path.endsWith('/') ? path + 'index.md' : path.replace(/\.html$/, '.md'));

// path: the page's URL path, e.g. /idea/. title, description: from the page itself.
// image: the share card's path under /assets/share/ (a 1200x630 PNG).
export function head({ path, title, description, image }) {
  const url = SITE + path;
  const img = SITE + (image || '/assets/share/home.png');
  const alt = `${title}: a drawn card with the word Simulation and the credit Idea: Dinis Cruz`;
  return [
    `<link rel="canonical" href="${esc(url)}">`,
    `<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">`,
    `<link rel="stylesheet" href="/assets/site.css">`,
    `<link rel="alternate" type="text/markdown" href="${esc(twin(path))}" title="This page as Markdown">`,
    `<meta name="color-scheme" content="light dark">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${esc(img)}">`,
    `<meta name="twitter:image:alt" content="${esc(alt)}">`,
    `<script type="module" src="/assets/js/site.js"></script>`,
  ].join('\n');
}

export function header(path) {
  const here = p => (p === '/' ? path === '/' || path === '/index.html' : path.startsWith(p));
  const links = NAV.map(([p, t]) => `<li><a href="${p}"${here(p) ? ' aria-current="page"' : ''}>${esc(t)}</a></li>`).join('');
  return `<a class="skip" href="#main">Skip to the content</a>
<p class="band" role="note"><strong>Simulation.</strong> ${esc(BAND_TEXT)} <a href="/behind-the-scenes/#what">What is this site?</a></p>
<header class="site-head">
<div class="bar">
<a class="brand" href="/"><svg width="18" height="30" viewBox="0 0 18 30" aria-hidden="true" focusable="false"><rect x="1" y="1" width="16" height="22" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7" r="2.5" fill="currentColor"/><path d="M4 18h10M4 14h7" stroke="currentColor" stroke-width="2"/><path d="M9 23v6" stroke="currentColor" stroke-width="2"/></svg><span>${esc(SITE_NAME)}<small>London and other cities, live Algarve weather</small></span></a>
<button class="menu" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
<nav class="nav" id="site-nav" aria-label="Site"><ul>${links}</ul></nav>
</div>
</header>`;
}

export function footer(path) {
  return `<footer class="site-foot">
<div class="in">
<div>
<p><strong>A simulation.</strong> This billboard does not exist: no screen, campaign or booking is real. ${esc(NOT_INVOLVED)}. Flights, prices and travel times are invented examples. The scene on the screen is a drawing, not a camera.</p>
<p>Weather: <strong>IPMA, Instituto Português do Mar e da Atmosfera</strong>, read live in your browser via <a href="https://data.promptugal.news">data.promptugal.news</a>. IPMA allows free use with no profit-making or offensive purpose and asks to be named as the source (<a href="${IPMA_TERMS_URL}">IPMA's terms</a>). This site has no ads, no tracking, no payments and no profit-making purpose. The data files' structure: CC BY 4.0, PrompTugal.news; every value keeps its source's terms.</p>
<p>${esc(IDEA)}.</p>
</div>
<div>
<ul class="foot-links">
<li><a href="/idea/">The idea</a></li>
<li><a href="/use-the-data/">Use the data</a></li>
<li><a href="/use-with-ai/">Use with AI</a></li>
<li><a href="/behind-the-scenes/">Behind the scenes</a></li>
<li><a href="${esc(twin(path))}">This page as Markdown</a></li>
</ul>
</div>
<div>
<p>Made by an AgentiCCells agent team, at Dinis Cruz's word. <a href="${REPO}">Source on GitHub</a>. Code Apache-2.0, text and drawings CC BY 4.0.</p>
<p>Version <a href="/version.json">__VERSION__</a></p>
</div>
</div>
</footer>`;
}

// Gate: fails the build on any problem. Never weaken a check to get a release out.
// From scripts/validate.mjs in the site repositories made by sites@AgentiCCells.dinis
// (2026-11-16); factory@ added the hub.json fields, the description check and the
// placeholder check (a seeded site must hold no __SITE_*__ placeholder).
// Checks added for this site by developer.london-billboard@AgentiCCells.dinis, 2026-11-18,
// round 1, at the conductor's brief (several adapted from AgentiCCells__Site__Algarve-Holiday-Homes,
// Apache-2.0, same organisation): em dashes and hype words in team/**/*.md; no unreplaced layout
// marker or version stamp; every page has a link preview image that is an absolute https URL to a
// PNG in _site/ of 300 KB or under and 1200x630 (read from the PNG header), and the other link
// preview tags; every page says "simulation"; behind the scenes, llms.txt and index.md exist;
// no code that sends data; forms send nothing; no iframes.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
const walk = d => (existsSync(d) ? readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const problems = [];
const fail = m => problems.push(m);
const EM = '\u2014';
const hype = /\b(revolutionary|cutting[- ]edge|seamless(?:ly)?|world[- ]class|game[- ]changing|game[- ]changer|groundbreaking|best[- ]in[- ]class|state[- ]of[- ]the[- ]art|unparalleled)\b/i;
const sends = /sendBeacon|method\s*:\s*['"`](?:POST|PUT|PATCH)['"`]|\.open\(\s*['"`](?:POST|PUT|PATCH)/i;
const isTemplate = existsSync('.factory-template');
const SITE_HOST = 'london-billboard.agenticcells.site';
if (!existsSync('_site')) { console.error('FAILED: _site/ is not built: run node scripts/build.mjs'); process.exit(1); }

// A PNG's size from its IHDR chunk (bytes 16 to 23), or null if the file is not a PNG.
function pngSize(f) {
  const b = readFileSync(f);
  if (b.length < 24 || b[0] !== 0x89 || b.toString('ascii', 1, 4) !== 'PNG' || b.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

// The team's own files: the same wording rules as the site.
for (const f of walk('team').filter(f => f.endsWith('.md'))) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (line.includes(EM)) fail(`${f}:${i + 1}: em dash`);
    const m = line.match(hype); if (m) fail(`${f}:${i + 1}: hype word "${m[0]}"`);
  });
}

const files = walk('_site');
const checkedImages = new Map();
for (const f of [...files, 'hub.json', 'README.md']) {
  if (!existsSync(f) || !/\.(html|js|css|json|md|txt)$/.test(f)) continue;
  const s = readFileSync(f, 'utf8');
  s.split('\n').forEach((line, i) => {
    if (line.includes(EM)) fail(`${f}:${i + 1}: em dash`);
    const m = line.match(hype); if (m) fail(`${f}:${i + 1}: hype word "${m[0]}"`);
    if (!isTemplate && /__SITE_[A-Z]+__/.test(line)) fail(`${f}:${i + 1}: template placeholder left in a seeded site`);
    if (f.startsWith('_site') && line.includes('__VERSION__')) fail(`${f}:${i + 1}: version stamp __VERSION__ left unreplaced`);
    if (/\.(m?js)$/.test(f) && sends.test(line)) fail(`${f}:${i + 1}: code that sends data (the site keeps and sends nothing)`);
  });
  if (f.endsWith('.html')) {
    if (!/<title>[^<]+<\/title>/.test(s)) fail(`${f}: no <title>`);
    if (!/<meta name="description" content="[^"]+"/.test(s)) fail(`${f}: no description`);
    if (!/<html lang="/.test(s)) fail(`${f}: no lang on <html>`);
    if (/<!--\s*(HEAD|HEADER|FOOTER)\s*-->/.test(s)) fail(`${f}: layout marker left unreplaced`);
    if (!/simulation/i.test(s.replace(/<[^>]+>/g, ' '))) fail(`${f}: the word "Simulation" is missing from the page's text`);
    // Link preview: every tag, and the image an absolute https URL to a PNG in _site/, 1200x630, 300 KB or under.
    for (const [k, re] of [['canonical', /<link rel="canonical" href="https:\/\//], ['og:title', /<meta property="og:title" content="[^"]+"/], ['og:description', /<meta property="og:description" content="[^"]+"/], ['og:url', /<meta property="og:url" content="https:\/\//], ['og:image:alt', /<meta property="og:image:alt" content="[^"]+"/], ['twitter:card', /<meta name="twitter:card" content="summary_large_image"/], ['twitter:image', /<meta name="twitter:image" content="https:\/\//], ['markdown alternate', /<link rel="alternate" type="text\/markdown" href="[^"]+"/]]) if (!re.test(s)) fail(`${f}: no ${k} link preview tag`);
    const og = s.match(/<meta property="og:image" content="([^"]*)"/);
    if (!og) fail(`${f}: no link preview image (og:image)`);
    else {
      let u = null; try { u = new URL(og[1]); } catch { /* reported below */ }
      if (!u || u.protocol !== 'https:') fail(`${f}: og:image ${og[1]} is not an absolute https URL`);
      else if (u.host !== SITE_HOST) fail(`${f}: og:image ${og[1]} is not on ${SITE_HOST}`);
      else if (!u.pathname.endsWith('.png')) fail(`${f}: og:image ${u.pathname} is not a .png`);
      else {
        const p = join('_site', decodeURIComponent(u.pathname));
        if (!checkedImages.has(p)) {
          let why = '';
          if (!existsSync(p)) why = 'is missing from _site/';
          else if (statSync(p).size > 300 * 1024) why = `is ${Math.round(statSync(p).size / 1024)} KB, over 300 KB`;
          else { const sz = pngSize(p); if (!sz) why = 'is not a PNG'; else if (sz.w !== 1200 || sz.h !== 630) why = `is ${sz.w}x${sz.h}, not 1200x630`; }
          checkedImages.set(p, why);
        }
        if (checkedImages.get(p)) fail(`${f}: link preview image ${u.pathname} ${checkedImages.get(p)}`);
      }
    }
    // Inline scripts follow the same rule as script files: nothing is sent.
    for (const m of s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) if (sends.test(m[1])) fail(`${f}: an inline script sends data (the site keeps and sends nothing)`);
    // Forms keep nothing and send nothing: no form may name an action or post.
    for (const m of s.matchAll(/<form\b[^>]*>/gi)) if (/\baction\s*=|method\s*=\s*["']?post/i.test(m[0])) fail(`${f}: a form with an action or method="post" (forms must send nothing)`);
    if (/<iframe\b/i.test(s)) fail(`${f}: an iframe (the site embeds nothing)`);
    for (const m of s.matchAll(/<script[^>]+src="([^"]+)"/g)) if (/^(https?:)?\/\//.test(m[1])) fail(`${f}: third-party script ${m[1]}`);
    for (const m of s.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) if (/^(https?:)?\/\//.test(m[1])) fail(`${f}: third-party stylesheet ${m[1]}`);
    for (const m of s.matchAll(/(?:href|src)="([^"#?]+)/g)) {
      const u = m[1]; if (/^(https?:|mailto:|data:|\/\/)/.test(u)) continue;
      const target = u.startsWith('/') ? join('_site', u) : join(dirname(f), u);
      if (!existsSync(target) && !existsSync(join(target, 'index.html'))) fail(`${f}: broken link ${u}`);
    }
  }
}
if (!existsSync('_site/version.json')) fail('no version.json');
if (!existsSync('_site/index.html')) fail('no index.html');
if (!existsSync('_site/behind-the-scenes/index.html')) fail('no behind-the-scenes/index.html');
if (!existsSync('_site/llms.txt')) fail('no llms.txt');
if (!existsSync('_site/index.md')) fail('no index.md');
try {
  const h = JSON.parse(readFileSync('hub.json', 'utf8'));
  for (const k of ['name', 'what_it_does', 'owner', 'repository', 'live_address', 'version_from']) if (typeof h[k] !== 'string' || !h[k].trim()) fail(`hub.json: ${k} must be a non-empty string`);
  if (h.version_from !== `${h.live_address}/version.json`) fail(`hub.json: version_from must be ${h.live_address}/version.json (the hub copies it verbatim)`);
  if (h.owner !== 'AgentiCCells') fail('hub.json: owner must be AgentiCCells');
  if (!h.licence || h.licence.code !== 'Apache-2.0' || h.licence.text !== 'CC BY 4.0') fail('hub.json: licence must be code Apache-2.0, text CC BY 4.0');
} catch (e) { fail(`hub.json is missing or not JSON (${e.message})`); }
if (problems.length) { console.error(problems.join('\n')); console.error(`FAILED: ${problems.length} problem(s)`); process.exit(1); }
console.log(`OK${isTemplate ? ' (template)' : ''}`);

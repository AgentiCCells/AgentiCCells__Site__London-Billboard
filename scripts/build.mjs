// Build: copy src/ to _site/, run the generated sections and the shared layout, stamp the
// version, write version.json. SITE_VERSION is set by CI only (v0.1.N); a local build says "dev".
// Steps: behind.mjs (behind the scenes), designs.mjs (optional, absent until a role writes it),
// then layout.mjs (header, band, footer, link previews and the Markdown twins).
// Adapted from scripts/build.mjs in AgentiCCells/AgentiCCells__Site__Algarve-Holiday-Homes
// (developer.algarve-holiday-homes@AgentiCCells.dinis, Apache-2.0, same organisation) by
// developer.london-billboard@AgentiCCells.dinis, 2026-11-18, round 1. Code Apache-2.0.
import { cpSync, rmSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const version = process.env.SITE_VERSION || 'dev';
rmSync('_site', { recursive: true, force: true });
cpSync('src', '_site', { recursive: true });
for (const step of ['./behind.mjs', './designs.mjs']) { try { await import(step); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND' || !String(e.message).includes(step.slice(2))) throw e; } }
await import('./layout.mjs');
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
for (const f of walk('_site')) {
  if (!/\.(html|js|css|json|md|txt)$/.test(f)) continue;
  const s = readFileSync(f, 'utf8');
  if (s.includes('__VERSION__')) writeFileSync(f, s.replaceAll('__VERSION__', version));
}
writeFileSync('_site/version.json', JSON.stringify({ version, commit: process.env.GITHUB_SHA || 'local', built: new Date().toISOString() }, null, 2) + '\n');
writeFileSync('_site/.nojekyll', '');
console.log(`built _site/ (${version})`);

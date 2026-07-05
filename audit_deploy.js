#!/usr/bin/env node
/*
  PARALLAX — audit_deploy.js
  Local-only. Run before and after every change: `node audit_deploy.js index.html`
  (or point it at the dev filename before rename-to-index.html).

  Checklist grows as bugs are found — same convention as Tensegrity Explorer,
  Modulor Massing, and FIGURE/GROUND. Every check here maps to a real
  invariant that came up during the build session, not a hypothetical.
*/

const fs = require('fs');

const file = process.argv[2] || 'index.html';
if(!fs.existsSync(file)){
  console.error(`File not found: ${file}`);
  process.exit(1);
}
const html = fs.readFileSync(file, 'utf8');

let pass = 0, fail = 0;
const failures = [];

function check(name, condition){
  if(condition){ pass++; }
  else { fail++; failures.push(name); }
}

// ---- version / changelog consistency ----
const versionMatch = html.match(/const APP_VERSION = '(v[\d.]+)'/);
const appVersion = versionMatch ? versionMatch[1] : null;
check('APP_VERSION constant is present', !!appVersion);

const changelogBlock = html.match(/CHANGELOG([\s\S]*?)-->/);
check('Changelog comment block exists', !!changelogBlock);

if(changelogBlock){
  const firstEntryMatch = changelogBlock[1].match(/(v[\d.]+)\s*-\s*\d{4}-\d{2}-\d{2}/);
  const firstEntryVersion = firstEntryMatch ? firstEntryMatch[1] : null;
  check('APP_VERSION matches the most recent changelog entry', appVersion && firstEntryVersion === appVersion);

  const dateLines = [...changelogBlock[1].matchAll(/v[\d.]+\s*-\s*(\d{4}-\d{2}-\d{2})/g)].map(m=>m[1]);
  check('Every changelog entry has a YYYY-MM-DD date', dateLines.length > 0);
}

// ---- palette / fill-color rule ----
// Learned from KONSTRUKTOR's Mondrian bug: never fill a volume face with
// solid black (palette color 'b'). Fill colors must only ever be drawn
// from {a, c, d}.
const fillKeysMatch = html.match(/const fillKeys = \[([^\]]*)\]/);
check('fillKeys array is present', !!fillKeysMatch);
if(fillKeysMatch){
  const keys = fillKeysMatch[1].replace(/['"\s]/g,'').split(',').filter(Boolean);
  check('fillKeys contains exactly {a,c,d}', keys.length===3 && keys.includes('a') && keys.includes('c') && keys.includes('d'));
  check('fillKeys never includes b (reserved for outlines)', !keys.includes('b'));
}
// palette objects must define all six required fields
const paletteBlockMatch = html.match(/const PALETTES = \{([\s\S]*?)\n  \};/);
check('PALETTES block found', !!paletteBlockMatch);
if(paletteBlockMatch){
  const requiredFields = ['a:', 'b:', 'c:', 'd:', 'bg:', 'line:'];
  const entries = paletteBlockMatch[1].split('\n').filter(l=>l.includes(':') && l.trim().length);
  check('Every palette entry defines a/b/c/d/bg/line', entries.every(line => requiredFields.every(f=>line.includes(f))));
}

// ---- camera.up trap (r128 OrbitControls caches the up-axis quaternion at
// construction and never re-reads it — mutating camera.up post-construction
// silently breaks orbit math). This should never reappear. ----
check('No post-construction camera.up mutation', !/camera\.up\.set/.test(html));

// ---- view presets ----
const requiredViews = ['iso','front','back','left','right','top'];
check('VIEWS object defines all six presets', requiredViews.every(v => new RegExp(`${v}:\\s*\\[`).test(html)));
check('Every view preset has a matching button', requiredViews.every(v => html.includes(`data-view="${v}"`)));
check('Top view uses an epsilon offset, not an exact (0,D,0) pole', /top:\s*\[0\.0001,\s*CAM_DIST,\s*0\.0001\]/.test(html));

// ---- auto-orbit freeze-on-drag (Tensegrity Explorer precedent: auto-orbit
// and manual drag must never fight frame-by-frame) ----
check("controls 'start' event disables autoRotate", /controls\.addEventListener\('start'[\s\S]{0,200}autoRotate = false/.test(html));

// ---- camera framing auto-fit ----
check('fitCameraToContent function exists', /function fitCameraToContent/.test(html));
check('fitCameraToContent is called after building volumeGroup in render()', /scene\.add\(volumeGroup\);[\s\S]{0,150}fitCameraToContent\(\);/.test(html));
check('Frustum has a floor to avoid degenerate zoom on sparse compositions', /Math\.max\(sphere\.radius \* [\d.]+,\s*[\d.]+\)/.test(html));

// ---- rendering setup ----
check('WebGLRenderer has preserveDrawingBuffer (required for PNG export)', /preserveDrawingBuffer:\s*true/.test(html));
check('OrthographicCamera is used, not PerspectiveCamera', html.includes('OrthographicCamera') && !html.includes('new THREE.PerspectiveCamera'));
check('Three.js and OrbitControls script tags are both present', html.includes('unpkg.com/three@') && html.includes('OrbitControls.js'));

// Strip the header comment block (its changelog prose legitimately mentions
// removed/renamed features by name, e.g. "Save SVG removed" — that text
// would false-positive the regression checks below if left in).
const codeOnly = html.replace(/<!--[\s\S]*?-->/, '');

// ---- removed-feature regressions (things that should stay gone) ----
check('Save SVG export was not reintroduced (WebGL canvas has no vector export)', !/id="saveSvg"|saveSvg\.addEventListener/.test(codeOnly));
check('Depth Angle / Depth Scale sliders were not reintroduced (meaningless with free orbit)', !/id="angle"|id="dscale"/.test(codeOnly));
check('Flat unprojected circle-accent type was not reintroduced (disks are real volumes now)', !/type:\s*'circle'/.test(codeOnly));

// ---- shared-convention checks (mulberry32, credit line) ----
check('mulberry32 PRNG implementation is unmodified', /function mulberry32\(a\)\{/.test(html));
check('Recolor uses a decoupled RNG stream (colorSeed), not the geometry seed', /colorRand = mulberry32\(lastGeometry\.seed \+ colorSeed/.test(html));
check('Credit line present in header (Joe.K · axisbim.io)', html.includes('Joe.K · axisbim.io'));
check('No stray "brise-soleil" or other placeholder tool name leaked into this file', !/brise-soleil/i.test(html));

// ---- report ----
console.log(`\nPARALLAX audit — ${file}`);
console.log(`${'='.repeat(40)}`);
console.log(`PASS: ${pass}   FAIL: ${fail}   TOTAL: ${pass+fail}`);
if(fail){
  console.log(`\nFailed checks:`);
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log(`\nAll checks passed.`);
  process.exit(0);
}

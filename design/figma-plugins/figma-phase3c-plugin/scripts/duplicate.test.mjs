import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('resolution UI starts disabled and requires an explicit confirmation after analysis', async () => {
  const ui = await readFile(resolve(root, 'dist/ui.html'), 'utf8');
  assert.match(ui, /data-action="analyze-duplicates">Analyze 11\/12 Duplicates/);
  assert.match(ui, /id="resolve-duplicates" data-action="resolve-duplicates" disabled/);
  assert.match(ui, /window\.confirm\('Archive the two non-selected duplicate section names/);
  assert.match(ui, /resolveButton\.disabled = data\.kind !== 'report' \|\| data\.canResolve !== true/);
});
async function loadSource(path) {
  const output = await build({ entryPoints: [resolve(root, path)], bundle: true, write: false, platform: 'node', format: 'esm', target: 'es2022' });
  return import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
}

async function fixture() {
  const { SECTIONS } = await loadSource('src/constants.ts');
  const state = { writes: [] };
  let sequence = 0;
  function node(type, name, children = [], extra = {}) {
    let value = name;
    const item = { id: `test-${++sequence}`, type, children, parent: null, ...extra };
    Object.defineProperty(item, 'name', {
      get: () => value,
      set: next => { state.writes.push({ id: item.id, from: value, to: next }); value = next; },
      enumerable: true,
    });
    if (type === 'FRAME') item.findAll = () => item.children.flatMap(walk);
    for (const child of children) child.parent = item;
    return item;
  }
  function walk(item) { return [item, ...(item.children ?? []).flatMap(walk)]; }
  const text = value => node('TEXT', 'Copy', [], { characters: value });
  const analyticsLatest = node('FRAME', SECTIONS.analytics, [
    text('Missing period / unavailable observation'), text('VALID EMPTY'), text('PERMISSION DENIED'),
    text('HISTORICAL ANALYTICS'), text('REQUEST FORECAST'), text('ACTUAL'), text('Dependency Unavailable'),
    node('FRAME', 'ACTUAL / continuous joint 1'), node('FRAME', 'Missing observation / visible gap'),
    node('COMPONENT', 'State=Missing-data Gap'), node('COMPONENT', 'State=Incomplete Data'),
    node('COMPONENT', 'State=Stale Data'), node('FRAME', 'DS / Analytics / Historical to Forecast Request'),
    node('COMPONENT_SET', 'Component / Analytics / KPI'), node('COMPONENT_SET', 'Component / Analytics / Freshness'),
  ], { width: 6320, height: 780 });
  const analyticsOld = node('FRAME', SECTIONS.analytics, [text('ACTUAL historical metrics'), node('COMPONENT', 'Old KPI')], { width: 1080, height: 600 });
  const forecastLatest = node('FRAME', SECTIONS.forecast, [
    text('CUTOFF / last observed'), text('MODEL_NOT_READY'), text('INCOMPLETE HISTORY'),
    text('PERMISSION DENIED'), text('TARGET PRODUCT UX'), text('ACTUAL'), text('PREDICTED'),
    text('Insufficient History'), text('Unsupported Horizon'),
    node('FRAME', 'ACTUAL / continuous joint 1'), node('FRAME', 'ACTUAL / solid segment 1'),
    node('FRAME', 'PREDICTED / dash 1'), node('COMPONENT', 'Component / Forecast / Actual vs Predicted Chart'),
    node('FRAME', 'DS / Forecast / TARGET Ready Composition'),
    node('COMPONENT', 'Component / Forecast / Actual Series'),
    node('COMPONENT', 'Component / Forecast / Predicted Series'),
    node('COMPONENT', 'Component / Forecast / MODEL_NOT_READY'),
  ], { width: 7370, height: 880 });
  const forecastOld = node('FRAME', SECTIONS.forecast, [text('MODEL_NOT_READY'), text('ACTUAL'), text('PREDICTED')], { width: 1080, height: 600 });
  const otherSections = Object.values(SECTIONS).filter(name => name !== SECTIONS.analytics && name !== SECTIONS.forecast)
    .map(name => node('FRAME', name));
  const componentNames = [
    'Component / Button', 'Component / Input', 'Component / Badge / Status / OUTCOME_UNKNOWN',
    'Component / Alert / State Banner', 'Component / Navigation / Primary Item',
    'Component / Conversation / List Item', 'Component / Conversation / Active Handler',
    'Component / Conversation / Handoff Event', 'Component / Business / Order State',
    'Component / Business / Reservation State', 'Component / Escalation / Human Decision Panel',
    'Component / Escalation / Decision Block', 'Component / Web Chat / Confirmation Request',
    'Component / Web Chat / Delivery Failure',
  ];
  for (const name of componentNames) {
    const section = name.includes('Navigation') ? SECTIONS.navigation : name.includes('Conversation') ? SECTIONS.conversation
      : name.includes('Business') ? SECTIONS.business : name.includes('Escalation') ? SECTIONS.escalation
      : name.includes('Web Chat') ? SECTIONS.webchat : name.includes('Badge / Status') ? SECTIONS.states : SECTIONS.core;
    const parent = otherSections.find(item => item.name === section);
    const child = node('COMPONENT', name); child.parent = parent; parent.children.push(child);
  }
  for (const value of ['4-point base', '4 small', 'Subtle dividers', 'known not to have completed',
    'Reconcile authoritative state', 'RESERVATION STATE', 'dashed line', 'CURRENT: no validated model',
    'confirmed business effect is unchanged', 'WCAG 2.2 AA-level', 'English, Russian, Kazakh']) {
    const child = text(value); child.parent = otherSections[0]; otherSections[0].children.push(child);
  }
  const nested = node('FRAME', 'Section 1', [analyticsLatest, forecastOld, ...otherSections.filter(item => Number(item.name.slice(0, 2)) <= 10 || item.name === SECTIONS.accessibility)]);
  const pageA = node('PAGE', '03A — Low-Fi Wireframes', [node('FRAME', 'Approved 03A')]);
  const pageB = node('PAGE', '03B — UX Review & Revisions', [node('FRAME', 'Approved 03B')]);
  const pageC = node('PAGE', '03C — Design System', [nested, analyticsOld, forecastLatest,
    ...otherSections.filter(item => Number(item.name.slice(0, 2)) >= 13 && item.name !== SECTIONS.accessibility)]);
  pageC.loadAsync = async () => {};
  pageC.findAll = () => pageC.children.flatMap(walk);
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    createPage: () => { throw new Error('Unexpected page write'); },
    setCurrentPageAsync: () => { throw new Error('Unexpected page switch'); },
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => [
        { name: 'primitive/color/white', variableCollectionId: 'collection' },
        { name: 'semantic/status/unknown', variableCollectionId: 'collection' },
      ],
    },
    getLocalTextStylesAsync: async () => [{ name: 'Phase 3C / Type /Body' }],
  };
  return { SECTIONS, state, pageA, pageB, pageC, nested, analyticsLatest, analyticsOld, forecastLatest, forecastOld, node };
}

test('analysis is read-only and selects only multi-signature latest candidates, independent of ID and nesting', async () => {
  const f = await fixture();
  const { analyzeDuplicates, resolveDuplicates } = await loadSource('src/duplicate-cleanup.ts');
  assert.match(await resolveDuplicates(), /BLOCKED/);
  const result = await analyzeDuplicates();
  assert.equal(result.canResolve, true);
  assert.match(result.text, /ANALYTICS[\s\S]*Candidate A:[\s\S]*Candidate B:[\s\S]*Selected canonical candidate/);
  assert.match(result.text, /FORECAST[\s\S]*Candidate A:[\s\S]*Candidate B:[\s\S]*Selected canonical candidate/);
  assert.match(result.text, /refinement signature score: 11\/11/);
  assert.match(result.text, /refinement signature score: 13\/13/);
  assert(result.text.includes(`Section 1 / ${f.SECTIONS.analytics}`));
  assert(result.text.includes(`03C — Design System / ${f.SECTIONS.forecast}`));
  assert.deepEqual(f.state.writes, []);
  f.analyticsOld.children[0].characters = 'ACTUAL historical metrics — edited after analysis';
  assert.match(await resolveDuplicates(), /BLOCKED/);
  assert.deepEqual(f.state.writes, []);
  assert.deepEqual(f.pageA.children.map(n => n.name), ['Approved 03A']);
  assert.deepEqual(f.pageB.children.map(n => n.name), ['Approved 03B']);
});

test('resolution archives only old names, preserves descendants, becomes 49/49 and is idempotent', async () => {
  const f = await fixture();
  const { analyzeDuplicates, resolveDuplicates } = await loadSource('src/duplicate-cleanup.ts');
  const { validate } = await loadSource('src/validator.ts');
  assert.match(await validate(), /Structural checks: 47\/49 PASS/);
  assert.equal((await analyzeDuplicates()).canResolve, true);
  const oldAnalyticsChildren = [...f.analyticsOld.children], oldForecastChildren = [...f.forecastOld.children];
  const unrelated = f.pageC.findAll().filter(n => n !== f.analyticsOld && n !== f.forecastOld).map(n => [n.id, n.name]);
  const report = await resolveDuplicates();
  assert.match(report, /DUPLICATE RESOLUTION COMPLETE/);
  assert.match(report, /Analytics canonical:[\s\S]*Analytics archived:[\s\S]*Forecast canonical:[\s\S]*Forecast archived:/);
  assert.equal(f.analyticsLatest.name, f.SECTIONS.analytics);
  assert.equal(f.forecastLatest.name, f.SECTIONS.forecast);
  assert.equal(f.analyticsOld.name, `ARCHIVE — ${f.SECTIONS.analytics} — pre-refinement`);
  assert.equal(f.forecastOld.name, `ARCHIVE — ${f.SECTIONS.forecast} — pre-refinement`);
  assert.deepEqual(f.analyticsOld.children, oldAnalyticsChildren);
  assert.deepEqual(f.forecastOld.children, oldForecastChildren);
  assert.deepEqual(f.pageC.findAll().filter(n => n !== f.analyticsOld && n !== f.forecastOld).map(n => [n.id, n.name]), unrelated);
  assert.deepEqual(f.state.writes.map(write => write.id).sort(), [f.analyticsOld.id, f.forecastOld.id].sort());
  assert.match(await validate(), /Structural checks: 49\/49 PASS/);
  const count = f.state.writes.length;
  assert.match(await resolveDuplicates(), /ALREADY RESOLVED/);
  assert.equal(f.state.writes.length, count);
  assert.deepEqual(f.pageA.children.map(n => n.name), ['Approved 03A']);
  assert.deepEqual(f.pageB.children.map(n => n.name), ['Approved 03B']);
});

test('ambiguous and missing candidates block resolution without writes', async () => {
  const ambiguous = await fixture();
  ambiguous.analyticsOld.children = [...ambiguous.analyticsLatest.children];
  const a = await loadSource('src/duplicate-cleanup.ts');
  assert.equal((await a.analyzeDuplicates()).canResolve, false);
  assert.match(await a.resolveDuplicates(), /BLOCKED/);
  assert.deepEqual(ambiguous.state.writes, []);

  const missing = await fixture();
  missing.nested.children = missing.nested.children.filter(n => n !== missing.forecastOld);
  const b = await loadSource('src/duplicate-cleanup.ts');
  const report = await b.analyzeDuplicates();
  assert.equal(report.canResolve, false);
  assert.match(report.text, /Expected exactly two canonical FRAME candidates; found 1/);
  assert.match(await b.resolveDuplicates(), /BLOCKED/);
  assert.deepEqual(missing.state.writes, []);

  const collision = await fixture();
  const archive = collision.node('FRAME', `ARCHIVE — ${collision.SECTIONS.analytics} — pre-refinement`);
  archive.parent = collision.pageC;
  collision.pageC.children.push(archive);
  const c = await loadSource('src/duplicate-cleanup.ts');
  const collisionReport = await c.analyzeDuplicates();
  assert.equal(collisionReport.canResolve, false);
  assert.match(collisionReport.text, /Archive name collision/);
  assert.match(await c.resolveDuplicates(), /BLOCKED/);
  assert.deepEqual(collision.state.writes, []);
});

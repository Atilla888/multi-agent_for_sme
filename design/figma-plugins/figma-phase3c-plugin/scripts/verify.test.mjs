import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
async function loadSource(path) {
  const output = await build({ entryPoints: [resolve(root, path)], bundle: true, write: false, platform: 'node', format: 'esm', target: 'es2022' });
  return import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
}
async function loadBuilderRuntime(builderName) {
  const output = await build({
    stdin: {
      contents: `export { replaceSections } from './src/figma-utils.ts'; export { ${builderName} } from './src/builders.ts';`,
      resolveDir: root,
      sourcefile: 'core-runtime.ts',
      loader: 'ts',
    },
    bundle: true, write: false, platform: 'node', format: 'esm', target: 'es2022',
  });
  return import('data:text/javascript;base64,' + Buffer.from(output.outputFiles[0].text).toString('base64'));
}
async function files(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? files(resolve(path, e.name)) : [resolve(path, e.name)]))).flat();
}

test('manifest is local, without fabricated ID or network', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8'));
  assert.equal(manifest.name, 'Diploma Design System — Phase 3C');
  assert.equal(manifest.id, undefined);
  assert.deepEqual(manifest.networkAccess.allowedDomains, ['none']);
  assert.equal(manifest.documentAccess, 'dynamic-page');
});

test('exact file/page guard and explicit owned names protect 03A and 03B', async () => {
  const m = await loadSource('src/ownership.ts');
  assert.doesNotThrow(() => m.assertFile('Diplom — Multi-Agent Platform UX/UI', 'OFXTN83nFl3RqukrEYQrFy'));
  assert.throws(() => m.assertFile('Other file', undefined));
  assert.throws(() => m.assertFile('Diplom — Multi-Agent Platform UX/UI', 'wrong'));
  assert.throws(() => m.assertTargetPage('03A — Low-Fi Wireframes'));
  assert.throws(() => m.assertTargetPage('03B — UX Review & Revisions'));
  assert.doesNotThrow(() => m.assertTargetPage('03C — Design System'));
  assert.deepEqual(m.planReplacement('build-states', ['Manual / Notes', '05 — Semantic States', '03B / Conversations']), ['05 — Semantic States']);
  assert.throws(() => m.planReplacement('build-states', ['05 — Semantic States', '05 — Semantic States']));
  assert(!m.ownedNames('build-webchat').some(n => n.startsWith('03A') || n.startsWith('03B')));
});

test('validator finds canonical nested section frames, rejects missing/aliased sections, and never writes', async () => {
  const { SECTIONS } = await loadSource('src/constants.ts');
  const { inspect, validate } = await loadSource('src/validator.ts');
  const canonical = Object.values(SECTIONS);
  assert.equal(canonical.length, 17);
  const sectionFrames = canonical.map((name, i) => ({ id: `section-${i}`, type: 'FRAME', name, children: [] }));
  const components = [
    'Component / Button', 'Component / Input', 'Component / Badge / Status / OUTCOME_UNKNOWN',
    'Component / Alert / State Banner', 'Component / Navigation / Primary Item',
    'Component / Conversation / List Item', 'Component / Conversation / Active Handler',
    'Component / Conversation / Handoff Event', 'Component / Business / Order State',
    'Component / Business / Reservation State', 'Component / Escalation / Human Decision Panel',
    'Component / Escalation / Decision Block', 'Component / Analytics / KPI',
    'Component / Analytics / Freshness', 'Component / Forecast / Actual Series',
    'Component / Forecast / Predicted Series', 'Component / Forecast / MODEL_NOT_READY',
    'Component / Web Chat / Confirmation Request', 'Component / Web Chat / Delivery Failure',
  ];
  for (const name of components) {
    const index = name.includes('Badge / Status') ? 5 : name.includes('Navigation') ? 7
      : name.includes('Conversation') ? 8 : name.includes('Business') ? 9
      : name.includes('Escalation') ? 10 : name.includes('Analytics') ? 11
      : name.includes('Forecast') ? 12 : name.includes('Web Chat') ? 13 : 6;
    sectionFrames[index].children.push({ type: 'COMPONENT', name, children: [] });
  }
  const needles = [
    '4-point base', '4 small', 'Subtle dividers', 'known not to have completed',
    'Reconcile authoritative state', 'RESERVATION STATE', 'dashed line',
    'CURRENT: no validated model', 'confirmed business effect is unchanged',
    'WCAG 2.2 AA-level', 'English, Russian, Kazakh',
  ];
  needles.forEach((characters, i) => sectionFrames[i].children.push({ type: 'TEXT', name: `Evidence ${i}`, characters, children: [] }));
  const nested = { type: 'FRAME', name: 'Legacy phase 3C layout wrapper', children: sectionFrames.filter((_, i) => i <= 10 || i === 14) };
  const pageA = { name: '03A — Low-Fi Wireframes', children: [{ name: 'approved 03A' }] };
  const pageB = { name: '03B — UX Review & Revisions', children: [{ name: 'approved 03B' }] };
  const pageC = {
    name: '03C — Design System',
    children: [nested, ...sectionFrames.filter((_, i) => i > 10 && i !== 14)],
    loadAsync: async () => {},
    findAll() {
      const walk = n => [n, ...(n.children ?? []).flatMap(walk)];
      return this.children.flatMap(walk);
    },
  };
  function bindParents(node, parent) {
    node.parent = parent;
    for (const child of node.children ?? []) bindParents(child, node);
  }
  for (const child of pageC.children) bindParents(child, pageC);
  let writes = 0;
  const write = () => { writes++; throw new Error('Validation attempted a write'); };
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    createPage: write, createFrame: write, createText: write, setCurrentPageAsync: write,
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => [
        { name: 'primitive/color/white', variableCollectionId: 'collection' },
        { name: 'semantic/status/unknown', variableCollectionId: 'collection' },
      ],
      createVariable: write,
    },
    getLocalTextStylesAsync: async () => [{ name: 'Phase 3C / Type /Body' }],
  };
  const all = await validate();
  for (const name of canonical) assert(all.includes(`${name}: PASS`), name);
  assert(all.includes('Structural checks: 49/49 PASS'));
  const firstInspect = await inspect();
  for (const name of canonical) assert(firstInspect.includes(`${name}: PASS\nExact FRAME matches: 1`), name);
  assert(firstInspect.includes(`name="${SECTIONS.analytics}"; type=FRAME; id=section-11; path=03C — Design System / ${SECTIONS.analytics}`));
  assert(firstInspect.includes(`name="${SECTIONS.direction}"; type=FRAME; id=section-0; path=03C — Design System / Legacy phase 3C layout wrapper / ${SECTIONS.direction}`));
  assert.equal(writes, 0);

  // Even with its components still present elsewhere, a missing section fails.
  const missing = sectionFrames[8];
  nested.children = nested.children.filter(n => n !== missing);
  pageC.children.push({ type: 'FRAME', name: 'Detached component work', children: [...missing.children] });
  const without = await validate();
  assert(without.includes(`${SECTIONS.conversation}: MISSING`));
  assert(without.includes(`${SECTIONS.conversation}: MISSING\nExact FRAME matches: 0\nExact-name OTHER node types: 0`));
  assert(without.includes('Component / Conversation / Handoff Event: PASS'));
  assert(without.includes('Structural checks: 48/49 PASS'));

  // A previous alias or a text layer with the canonical name is not a section.
  const alias = { id: 'alias', type: 'FRAME', name: '08 - Conversation / AI Components', children: [] };
  const wrongType = { id: 'wrong-type', type: 'TEXT', name: SECTIONS.conversation, characters: SECTIONS.conversation, children: [] };
  pageC.children.push(alias, wrongType);
  bindParents(alias, pageC); bindParents(wrongType, pageC);
  const wrong = await validate();
  assert(wrong.includes(`${SECTIONS.conversation}: WRONG_TYPE`));
  assert(wrong.includes('Exact FRAME matches: 0\nExact-name OTHER node types: 1 (TEXT)'));
  assert(wrong.includes('Near/legacy name matches: 1'));
  assert(wrong.includes('type=TEXT; id=wrong-type'));
  const duplicate = { id: 'duplicate', type: 'FRAME', name: SECTIONS.conversation, children: [] };
  nested.children.push(missing, duplicate);
  bindParents(missing, nested); bindParents(duplicate, nested);
  const duplicates = await validate();
  assert(duplicates.includes(`${SECTIONS.conversation}: DUPLICATE`));
  assert(duplicates.includes('Exact FRAME matches: 2'));
  assert(duplicates.includes('id=section-8'));
  assert(duplicates.includes('id=duplicate'));

  // Mirror the reported 47/49 shape without assuming the live cause of either failure.
  nested.children = nested.children.filter(n => n !== duplicate);
  pageC.children = pageC.children.filter(n => n !== alias && n !== wrongType);
  const secondAnalytics = { id: 'analytics-copy', type: 'FRAME', name: SECTIONS.analytics, children: [] };
  pageC.children.push(secondAnalytics);
  bindParents(secondAnalytics, pageC);
  const forecast = sectionFrames[12];
  pageC.children = pageC.children.filter(n => n !== forecast);
  const forecastText = { id: 'forecast-text', type: 'TEXT', name: SECTIONS.forecast, characters: SECTIONS.forecast, children: [] };
  pageC.children.push(forecastText);
  bindParents(forecastText, pageC);
  pageC.children.find(n => n.name === 'Detached component work').children.push(...forecast.children);
  const focused = await validate();
  assert(focused.includes(`${SECTIONS.analytics}: DUPLICATE`));
  assert(focused.includes(`${SECTIONS.forecast}: WRONG_TYPE`));
  assert(focused.includes('Component / Analytics / KPI: PASS'));
  assert(focused.includes('Component / Forecast / Actual Series: PASS'));
  assert(focused.includes('Structural checks: 47/49 PASS'));
  assert.equal(writes, 0);
  assert.deepEqual(pageA.children.map(n => n.name), ['approved 03A']);
  assert.deepEqual(pageB.children.map(n => n.name), ['approved 03B']);
});

test('Build Design Direction creates three raw style tiles and is idempotent without touching 03A/03B', async () => {
  const pageA = { id: 'a', name: '03A — Low-Fi Wireframes', children: [{ id: 'a1', name: 'approved' }] };
  const pageB = { id: 'b', name: '03B — UX Review & Revisions', children: [{ id: 'b1', name: 'Conversations' }] };
  const pageC = { id: 'c', name: '03C — Design System', children: [{ id: 'manual', name: 'Manual / AI composition' }] };
  let seq = 0;
  function appendChild(child) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.push(child); child.parent = this;
  }
  function node(type) {
    const n = {
      id: 'node-' + ++seq, type, name: '', children: [], height: 16,
      appendChild, resize(w, h) { this.width = w; this.height = h; },
      remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    };
    n.parent = globalThis.figma.currentPage;
    n.parent.children.push(n);
    return n;
  }
  const rootNode = { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] };
  globalThis.figma = {
    root: rootNode, fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    setCurrentPageAsync: async p => { globalThis.figma.currentPage = p; },
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [],
      createVariableCollection: () => { throw new Error('Direction must not create Variables'); },
    },
    createFrame: () => node('FRAME'), createText: () => node('TEXT'),
    createComponent: () => { throw new Error('Direction must not create production components'); },
  };
  pageC.loadAsync = async () => {};
  pageC.appendChild = appendChild;
  const { replaceSections } = await loadSource('src/figma-utils.ts');
  const { buildDirection } = await loadSource('src/builders.ts');
  await replaceSections('build-direction', buildDirection);
  await replaceSections('build-direction', buildDirection);
  assert.deepEqual(pageC.children.map(n => n.name), ['Manual / AI composition', '00 — Design Direction']);
  const section = pageC.children[1];
  const all = function walk(n) { return [n, ...(n.children ?? []).flatMap(walk)]; };
  const names = new Set(all(section).map(n => n.name));
  for (const id of ['calm-operational-saas', 'modern-ai-workspace', 'data-forward-console']) {
    assert(names.has(`DS / Direction / ${id} / Style Tile`));
  }
  for (const name of ['Primary accent swatch', 'Heading sample', 'Body sample', 'Secondary text sample', 'Primary action button sample',
    'Status sample / Success', 'Status sample / Pending', 'Status sample / OUTCOME_UNKNOWN', 'Status sample / Waiting Human',
    'Handler sample / Sales Agent', 'Handler sample / Human Operator', 'Business entity sample / Order and Reservation',
    'ACTUAL / solid line', 'PREDICTED / dash 1']) assert(names.has(name), name);
  assert(all(section).some(n => n.type === 'TEXT' && n.characters === 'SELECTED FOR REVIEW'));
  assert.deepEqual(pageA.children.map(n => n.name), ['approved']);
  assert.deepEqual(pageB.children.map(n => n.name), ['Conversations']);
});

test('Build Core Components is idempotent, labelled, stateful and semantically bound', async () => {
  const pageA = { id: 'a', name: '03A — Low-Fi Wireframes', children: [{ id: 'a1', name: 'approved 03A' }] };
  const pageB = { id: 'b', name: '03B — UX Review & Revisions', children: [{ id: 'b1', name: 'approved 03B' }] };
  const manual = { id: 'manual', name: 'Manual / AI composition' };
  const direction = { id: 'direction', name: '00 — Design Direction' };
  const pageC = { id: 'c', name: '03C — Design System', children: [manual, direction] };
  let seq = 0;
  const bindings = [];
  function appendChild(child) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.push(child); child.parent = this;
  }
  function node(type) {
    const n = {
      id: 'node-' + ++seq, type, name: '', children: [], height: 16,
      appendChild, resize(w, h) { this.width = w; this.height = h; },
      remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    };
    n.parent = globalThis.figma.currentPage;
    n.parent.children.push(n);
    return n;
  }
  const { semantic } = await loadSource('src/tokens.ts');
  const variables = Object.keys(semantic).map(name => ({ id: 'v-' + name, name: 'semantic/' + name, variableCollectionId: 'collection' }));
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    setCurrentPageAsync: async p => { globalThis.figma.currentPage = p; },
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => variables,
      setBoundVariableForPaint: (paint, field, variable) => { bindings.push(variable.name); return { ...paint, boundVariableId: variable.id }; },
    },
    createFrame: () => node('FRAME'), createText: () => node('TEXT'), createComponent: () => node('COMPONENT'),
    combineAsVariants: (parts, parent) => {
      const set = node('COMPONENT_SET'); parent.appendChild(set);
      parts.forEach(part => set.appendChild(part)); return set;
    },
  };
  pageC.loadAsync = async () => {};
  pageC.appendChild = appendChild;
  const { replaceSections, buildCore } = await loadBuilderRuntime('buildCore');
  await replaceSections('build-core', buildCore);
  await replaceSections('build-core', buildCore);
  assert.deepEqual(pageC.children.map(n => n.name), ['Manual / AI composition', '00 — Design Direction', '06 — Core Components']);
  assert.equal(pageC.children[0], manual);
  assert.equal(pageC.children[1], direction);
  assert.deepEqual(pageA.children.map(n => n.name), ['approved 03A']);
  assert.deepEqual(pageB.children.map(n => n.name), ['approved 03B']);
  const all = function walk(n) { return [n, ...(n.children ?? []).flatMap(walk)]; };
  const nodes = all(pageC.children[2]);
  const names = new Set(nodes.map(n => n.name));
  for (const label of ['Primary', 'Secondary', 'Tertiary / Ghost', 'Destructive']) assert(names.has(`Button column / ${label}`));
  for (const label of ['Default', 'Hover', 'Pressed', 'Focus', 'Disabled', 'Loading']) assert(names.has(`Button row / ${label}`));
  assert(names.has('Component / Button'));
  assert(names.has('Component / Input / State Matrix'));
  for (const state of ['Default', 'Focused', 'Filled', 'Error', 'Disabled', 'Read-only']) assert(names.has(`State=${state}`));
  assert(names.has('Error icon / structural cue'));
  assert(nodes.some(n => n.type === 'TEXT' && n.characters === 'Enter a valid customer reference.'));
  for (const label of ['Customer reference', 'Message to customer', 'Search orders', 'Reservation status']) {
    assert(nodes.some(n => n.name === 'Persistent field label' && n.characters === label), label);
  }
  assert(names.has('Accessible icon button / Focus'));
  assert(names.has('Selection mark'));
  assert(bindings.includes('semantic/status/error'));
  assert(bindings.includes('semantic/focus/ring'));
  assert(bindings.every(name => name.startsWith('semantic/')));
});

test('Build Navigation preserves six-area IA, visual variants, unowned nodes and semantic bindings', async () => {
  const pageA = { id: 'a', name: '03A — Low-Fi Wireframes', children: [{ id: 'a1', name: 'approved 03A' }] };
  const pageB = { id: 'b', name: '03B — UX Review & Revisions', children: [{ id: 'b1', name: 'approved 03B' }] };
  const manual = { id: 'manual', name: 'Manual / AI composition' };
  const core = { id: 'core', name: '06 — Core Components' };
  const pageC = { id: 'c', name: '03C — Design System', children: [manual, core] };
  let seq = 0;
  const bindings = [];
  function appendChild(child) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.push(child); child.parent = this;
  }
  function node(type) {
    const n = {
      id: 'node-' + ++seq, type, name: '', children: [], height: 16,
      appendChild, resize(w, h) { this.width = w; this.height = h; },
      remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    };
    n.parent = globalThis.figma.currentPage;
    n.parent.children.push(n);
    return n;
  }
  const { semantic } = await loadSource('src/tokens.ts');
  const variables = Object.keys(semantic).map(name => ({ id: 'v-' + name, name: 'semantic/' + name, variableCollectionId: 'collection' }));
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    setCurrentPageAsync: async p => { globalThis.figma.currentPage = p; },
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => variables,
      setBoundVariableForPaint: (paint, field, variable) => { bindings.push(variable.name); return { ...paint, boundVariableId: variable.id }; },
    },
    createFrame: () => node('FRAME'), createText: () => node('TEXT'), createComponent: () => node('COMPONENT'),
    combineAsVariants: (parts, parent) => {
      const set = node('COMPONENT_SET'); parent.appendChild(set);
      parts.forEach(part => set.appendChild(part)); return set;
    },
  };
  pageC.loadAsync = async () => {};
  pageC.appendChild = appendChild;
  const { replaceSections, buildNavigation } = await loadBuilderRuntime('buildNavigation');
  await replaceSections('build-navigation', buildNavigation);
  await replaceSections('build-navigation', buildNavigation);
  assert.deepEqual(pageC.children.map(n => n.name), ['Manual / AI composition', '06 — Core Components', '07 — Navigation Components']);
  assert.equal(pageC.children[0], manual);
  assert.equal(pageC.children[1], core);
  assert.deepEqual(pageA.children.map(n => n.name), ['approved 03A']);
  assert.deepEqual(pageB.children.map(n => n.name), ['approved 03B']);
  const all = function walk(n) { return [n, ...(n.children ?? []).flatMap(walk)]; };
  const nodes = all(pageC.children[2]);
  const names = new Set(nodes.map(n => n.name));
  const set = name => nodes.find(n => n.name === name && n.type === 'COMPONENT_SET');
  assert.deepEqual(set('Component / Navigation / Primary Item').children.map(n => n.name), ['State=Default', 'State=Hover', 'State=Active', 'State=Focus']);
  assert.deepEqual(set('Component / Navigation / Nested Item').children.map(n => n.name), ['State=Default', 'State=Active', 'State=Focus']);
  assert.deepEqual(set('Component / Navigation / Expand').children.map(n => n.name), ['State=Expanded', 'State=Collapsed']);
  for (const name of ['Component / Navigation / Business Context', 'Component / Navigation / Breadcrumb',
    'Component / Navigation / Account', 'Component / Navigation / Restricted Link', 'DS / Navigation / Approved Hierarchy Demo']) assert(names.has(name));
  for (const name of ['Component / Navigation / Business Context', 'Component / Navigation / Breadcrumb', 'Component / Navigation / Account']) {
    assert.equal(nodes.find(n => n.name === name).height, 110, name);
  }
  const topLevel = nodes.filter(n => n.name.startsWith('Demo / Top-level / ')).map(n => n.characters);
  assert.deepEqual(topLevel, ['Overview', 'Conversations', 'Business', 'Knowledge', 'Analytics', 'Administration']);
  for (const path of ['Conversations/Escalations', 'Business/Customers', 'Business/Orders', 'Business/Products', 'Business/Inventory',
    'Knowledge/Documents', 'Analytics/Forecasts', 'Administration/Integrations', 'Administration/Settings',
    'Administration/Audit', 'Administration/Agent Runs']) assert(names.has('Demo / Nested / ' + path), path);
  assert(names.has('Selected marker'));
  assert(names.has('Non-color selection cue'));
  assert(bindings.includes('semantic/focus/ring'));
  assert(bindings.includes('semantic/status/restricted'));
  assert(bindings.every(name => name.startsWith('semantic/')));
  assert(nodes.some(n => n.type === 'TEXT' && n.characters === 'Contextual / permitted case only'));
  assert(nodes.some(n => n.type === 'TEXT' && n.characters === 'Disabled / unavailable'));
  assert(nodes.some(n => n.type === 'TEXT' && n.characters.includes('Frontend visibility ≠ backend authorization')));
  assert(nodes.some(n => n.type === 'TEXT' && n.characters.includes('English, Russian and Kazakh expansion')));
});

test('Build Conversation creates bounded visual families and preserves unrelated pages/nodes on repeat', async () => {
  const pageA = { id: 'a', name: '03A — Low-Fi Wireframes', children: [{ id: 'a1', name: 'approved 03A' }] };
  const pageB = { id: 'b', name: '03B — UX Review & Revisions', children: [{ id: 'b1', name: 'approved Conversations' }] };
  const manual = { id: 'manual', name: 'Manual / AI composition' };
  const navigation = { id: 'navigation', name: '07 — Navigation Components' };
  const pageC = { id: 'c', name: '03C — Design System', children: [manual, navigation] };
  let seq = 0;
  const bindings = [];
  function appendChild(child) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.push(child); child.parent = this;
  }
  function node(type) {
    const n = {
      id: 'node-' + ++seq, type, name: '', children: [], height: 16,
      appendChild, resize(w, h) { this.width = w; this.height = h; },
      remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    };
    n.parent = globalThis.figma.currentPage;
    n.parent.children.push(n);
    return n;
  }
  const { semantic } = await loadSource('src/tokens.ts');
  const variables = Object.keys(semantic).map(name => ({ id: 'v-' + name, name: 'semantic/' + name, variableCollectionId: 'collection' }));
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    setCurrentPageAsync: async p => { globalThis.figma.currentPage = p; },
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => variables,
      setBoundVariableForPaint: (paint, field, variable) => { bindings.push(variable.name); return { ...paint, boundVariableId: variable.id }; },
    },
    createFrame: () => node('FRAME'), createText: () => node('TEXT'), createComponent: () => node('COMPONENT'),
    combineAsVariants: (parts, parent) => {
      const set = node('COMPONENT_SET'); parent.appendChild(set);
      parts.forEach(part => set.appendChild(part)); return set;
    },
  };
  pageC.loadAsync = async () => {};
  pageC.appendChild = appendChild;
  const { replaceSections, buildConversation } = await loadBuilderRuntime('buildConversation');
  await replaceSections('build-conversation', buildConversation);
  await replaceSections('build-conversation', buildConversation);
  assert.deepEqual(pageC.children.map(n => n.name), ['Manual / AI composition', '07 — Navigation Components', '08 — Conversation / AI Components']);
  assert.equal(pageC.children[0], manual);
  assert.equal(pageC.children[1], navigation);
  assert.deepEqual(pageA.children.map(n => n.name), ['approved 03A']);
  assert.deepEqual(pageB.children.map(n => n.name), ['approved Conversations']);
  const all = function walk(n) { return [n, ...(n.children ?? []).flatMap(walk)]; };
  const section = pageC.children[2];
  const nodes = all(section);
  const names = new Set(nodes.map(n => n.name));
  const set = name => nodes.find(n => n.name === name && n.type === 'COMPONENT_SET');
  const required = [
    'List Item', 'Message Row', 'Composer', 'Customer Context', 'Order Context', 'Active Handler',
    'Agent Status', 'Human Status', 'Handoff Event', 'Action Proposal', 'Action Result',
    'Execution Summary', 'Escalation State', 'Delivery State',
  ];
  for (const name of required) assert(names.has('Component / Conversation / ' + name), name);
  assert.deepEqual(set('Component / Conversation / List Item').children.map(n => n.name),
    ['State=Default', 'State=Attention Needed', 'State=Active', 'State=Waiting Human']);
  assert.deepEqual(set('Component / Conversation / Active Handler').children.map(n => n.name),
    ['Handler=Sales Agent', 'Handler=Support Agent', 'Handler=Analytics Agent', 'Handler=Human Operator']);
  assert.deepEqual(set('Component / Conversation / Action Result').children.map(n => n.name),
    ['Outcome=Confirmed', 'Outcome=Known Failure', 'Outcome=OUTCOME_UNKNOWN']);
  assert.deepEqual(set('Component / Conversation / Delivery State').children.map(n => n.name),
    ['State=Delivered', 'State=Sending / Pending', 'State=Delivery Failed']);
  for (const name of ['Previous handler', 'Current handler', 'Reason', 'Verified context', 'Completed work', 'Remaining task', 'Permission boundary']) assert(names.has(name), name);
  const proposal = nodes.find(n => n.name === 'Component / Conversation / Action Proposal');
  const results = set('Component / Conversation / Action Result').children;
  assert.equal(proposal.fills[0].boundVariableId, 'v-surface/subtle');
  assert.equal(results[0].fills[0].boundVariableId, 'v-status/success-bg');
  assert.equal(results[2].fills[0].boundVariableId, 'v-status/unknown-bg');
  assert(nodes.some(n => n.type === 'TEXT' && n.characters === 'Permissions do not transfer with the handoff.'));
  assert(nodes.some(n => n.type === 'TEXT' && n.characters === 'OUTCOME_UNKNOWN'));
  assert(nodes.some(n => n.type === 'TEXT' && n.characters === 'Reservation confirmed'));
  assert(nodes.some(n => n.type === 'TEXT' && n.characters === 'Delivery failed'));
  for (const label of ['A / Active AI handling', 'B / Support → Sales handoff', 'C / Confirmed + Delivery Failed', 'D / Unknown + Escalation']) {
    assert(names.has('DS / Conversation / Composition / ' + label));
  }
  assert(bindings.includes('semantic/status/unknown'));
  assert(bindings.includes('semantic/status/waiting-human'));
  assert(bindings.every(name => name.startsWith('semantic/')));
  for (const parent of nodes) {
    if (!['FRAME', 'COMPONENT'].includes(parent.type) || typeof parent.width !== 'number') continue;
    for (const child of parent.children) {
      if (typeof child.width !== 'number' || typeof child.height !== 'number') continue;
      assert(child.x >= -0.01 && child.y >= -0.01, `${parent.name} / ${child.name} negative position`);
      assert(child.x + child.width <= parent.width + 1, `${parent.name} / ${child.name} exceeds width`);
      assert(child.y + child.height <= parent.height + 1, `${parent.name} / ${child.name} exceeds height`);
    }
  }
});

test('Build Business creates reusable entity variants and preserves independent facts on repeat', async () => {
  const pageA = { id: 'a', name: '03A — Low-Fi Wireframes', children: [{ id: 'a1', name: 'approved 03A' }] };
  const pageB = { id: 'b', name: '03B — UX Review & Revisions', children: [{ id: 'b1', name: 'approved 03B' }] };
  const manual = { id: 'manual', name: 'Manual / AI entity work' };
  const conversation = { id: 'conversation', name: '08 — Conversation / AI Components' };
  const pageC = { id: 'c', name: '03C — Design System', children: [manual, conversation] };
  let seq = 0;
  const bindings = [];
  function appendChild(child) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.push(child); child.parent = this;
  }
  function node(type) {
    const n = {
      id: 'node-' + ++seq, type, name: '', children: [], height: 16,
      appendChild, resize(w, h) { this.width = w; this.height = h; },
      remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    };
    n.parent = globalThis.figma.currentPage;
    n.parent.children.push(n);
    return n;
  }
  const { semantic } = await loadSource('src/tokens.ts');
  const variables = Object.keys(semantic).map(name => ({ id: 'v-' + name, name: 'semantic/' + name, variableCollectionId: 'collection' }));
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    setCurrentPageAsync: async p => { globalThis.figma.currentPage = p; },
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => variables,
      setBoundVariableForPaint: (paint, field, variable) => { bindings.push(variable.name); return { ...paint, boundVariableId: variable.id }; },
    },
    createFrame: () => node('FRAME'), createText: () => node('TEXT'), createComponent: () => node('COMPONENT'),
    combineAsVariants: (parts, parent) => {
      const set = node('COMPONENT_SET'); parent.appendChild(set);
      parts.forEach(part => set.appendChild(part)); return set;
    },
  };
  pageC.loadAsync = async () => {};
  pageC.appendChild = appendChild;
  const { replaceSections, buildBusiness } = await loadBuilderRuntime('buildBusiness');
  await replaceSections('build-business', buildBusiness);
  await replaceSections('build-business', buildBusiness);
  assert.deepEqual(pageC.children.map(n => n.name), ['Manual / AI entity work', '08 — Conversation / AI Components', '09 — Business Entity Components']);
  assert.equal(pageC.children[0], manual);
  assert.equal(pageC.children[1], conversation);
  assert.deepEqual(pageA.children.map(n => n.name), ['approved 03A']);
  assert.deepEqual(pageB.children.map(n => n.name), ['approved 03B']);
  const all = function walk(n) { return [n, ...(n.children ?? []).flatMap(walk)]; };
  const section = pageC.children[2];
  const nodes = all(section);
  const named = name => nodes.find(n => n.name === name);
  const set = name => nodes.find(n => n.name === 'Component / Business / ' + name && n.type === 'COMPONENT_SET');
  for (const name of ['Customer Summary', 'Product Summary', 'E02 Restricted']) {
    assert.equal(named('Component / Business / ' + name)?.type, 'COMPONENT', name);
  }
  for (const name of ['Inventory Status', 'Order Summary', 'Order State', 'Reservation State', 'Order Delivery Status', 'Freshness']) {
    assert(set(name), name);
  }
  assert.equal(named('Component / Business / Delivery Status'), undefined);
  const messageDelivery = named('Component / Communication / Message Delivery Status');
  assert.equal(messageDelivery?.type, 'COMPONENT_SET');
  assert.deepEqual(set('Inventory Status').children.map(n => n.name), [
    'State=Available', 'State=Zero Stock', 'State=Stale', 'State=Dependency Unavailable', 'State=Conflicting / Revalidation Required',
  ]);
  const dependency = all(set('Inventory Status').children[3]);
  assert(dependency.some(n => n.characters === 'Quantity: unavailable (not zero)'));
  assert(!dependency.some(n => n.characters === 'Quantity: 0 confirmed'));
  const product = all(named('Component / Business / Product Summary'));
  assert(product.some(n => n.characters === 'Catalog: Current. Stock must be checked separately.'));
  assert(!product.some(n => n.name === 'Inventory state'));
  for (const order of set('Order Summary').children) {
    const fields = all(order);
    assert(fields.some(n => n.characters === 'ORDER STATE'));
    assert(fields.some(n => n.characters === 'RESERVATION STATE'));
  }
  assert.deepEqual(set('Order Summary').children.map(n => n.name), ['Reservation=Confirmed', 'Reservation=Known Failure', 'Reservation=OUTCOME_UNKNOWN']);
  assert.deepEqual(set('Reservation State').children.map(n => n.name), ['State=Confirmed', 'State=Known Failure', 'State=OUTCOME_UNKNOWN']);
  assert.equal(set('Reservation State').children[1].fills[0].boundVariableId, 'v-status/error-bg');
  assert.equal(set('Reservation State').children[2].fills[0].boundVariableId, 'v-status/unknown-bg');
  assert(all(set('Reservation State').children[2]).some(n => n.characters === 'Reconcile first; no blind retry'));
  assert.deepEqual(set('Order Delivery Status').children.map(n => n.name), ['Example=In Transit', 'Example=Dependency Unavailable']);
  for (const example of set('Order Delivery Status').children) {
    const content = all(example);
    assert(content.some(n => n.characters === 'DESIGN-SYSTEM EXAMPLE / not a backend enum'));
    assert(content.some(n => n.characters === 'ORDER #1042 / logistics delivery'));
    assert(content.some(n => n.name === 'Order delivery source and freshness'));
    assert(!content.some(n => n.characters?.includes('Message delivered')));
  }
  const orderDeliveryComposition = all(named('DS / Business / Order + Reservation + Order Delivery'));
  for (const value of ['ORDER STATE', 'Created', 'RESERVATION STATE', 'Confirmed', 'ORDER DELIVERY', 'In Transit / example']) {
    assert(orderDeliveryComposition.some(n => n.characters === value), value);
  }
  assert.deepEqual(messageDelivery.children.map(n => n.name), ['State=Delivered', 'State=Pending / Sending', 'State=Delivery Failed']);
  assert(!all(messageDelivery).some(n => n.characters?.includes('get_delivery_status')));
  const confirmedDelivery = all(named('DS / Business / Confirmed Effect + Message Delivery Failed'));
  assert(confirmedDelivery.some(n => n.characters === 'BUSINESS EFFECT'));
  assert(confirmedDelivery.some(n => n.characters === 'Reservation confirmed'));
  assert(confirmedDelivery.some(n => n.characters === 'COMMUNICATION'));
  assert(confirmedDelivery.some(n => n.characters === 'Message delivery failed'));
  assert(nodes.some(n => n.characters?.includes('Retry communication only; never replay reserve_inventory')));
  assert.deepEqual(set('Freshness').children.map(n => n.name), ['State=Fresh / Current', 'State=Observed at 10:41', 'State=Stale', 'State=Requires Revalidation']);
  const partial = all(named('DS / Business / Partial Result Composition'));
  for (const value of ['Created', 'Failed (known)', 'Message delivery failed', 'Do not create the same Order again.']) {
    assert(partial.some(n => n.characters === value), value);
  }
  const unknown = all(named('DS / Business / Unknown Reservation Composition'));
  for (const value of ['Created', 'OUTCOME_UNKNOWN', 'Current Order facts', 'Reconcile authoritative reservation state before retry.']) {
    assert(unknown.some(n => n.characters === value), value);
  }
  const e02 = all(named('Component / Business / E02 Restricted'));
  assert(e02.some(n => n.characters?.includes('automatic update_order mutation remains unavailable')));
  assert(e02.some(n => n.characters?.includes('authorized human/policy handling')));
  assert(e02.some(n => n.characters?.includes('Not Permission Denied')));
  assert(bindings.includes('semantic/focus/ring'));
  assert(bindings.includes('semantic/status/unknown'));
  assert(bindings.every(name => name.startsWith('semantic/')));
  for (const parent of nodes) {
    if (!['FRAME', 'COMPONENT'].includes(parent.type) || typeof parent.width !== 'number') continue;
    for (const child of parent.children) {
      if (typeof child.width !== 'number' || typeof child.height !== 'number') continue;
      assert(child.x >= -0.01 && child.y >= -0.01, `${parent.name} / ${child.name} negative position`);
      assert(child.x + child.width <= parent.width + 1, `${parent.name} / ${child.name} exceeds width`);
      assert(child.y + child.height <= parent.height + 1, `${parent.name} / ${child.name} exceeds height`);
    }
  }
});

test('Build Escalation creates bounded decision components and preserves unrelated pages/nodes on repeat', async () => {
  const pageA = { id: 'a', name: '03A — Low-Fi Wireframes', children: [{ id: 'a1', name: 'approved 03A' }] };
  const pageB = { id: 'b', name: '03B — UX Review & Revisions', children: [{ id: 'b1', name: 'approved Escalations' }] };
  const manual = { id: 'manual', name: 'Manual / AI escalation work' };
  const business = { id: 'business', name: '09 — Business Entity Components' };
  const pageC = { id: 'c', name: '03C — Design System', children: [manual, business] };
  let seq = 0;
  const bindings = [];
  function appendChild(child) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.push(child); child.parent = this;
  }
  function node(type) {
    const n = {
      id: 'node-' + ++seq, type, name: '', children: [], height: 16,
      appendChild, resize(w, h) { this.width = w; this.height = h; },
      remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    };
    n.parent = globalThis.figma.currentPage;
    n.parent.children.push(n);
    return n;
  }
  const { semantic } = await loadSource('src/tokens.ts');
  const variables = Object.keys(semantic).map(name => ({ id: 'v-' + name, name: 'semantic/' + name, variableCollectionId: 'collection' }));
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    setCurrentPageAsync: async p => { globalThis.figma.currentPage = p; },
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => variables,
      setBoundVariableForPaint: (paint, field, variable) => { bindings.push(variable.name); return { ...paint, boundVariableId: variable.id }; },
    },
    createFrame: () => node('FRAME'), createText: () => node('TEXT'), createComponent: () => node('COMPONENT'),
    combineAsVariants: (parts, parent) => {
      const set = node('COMPONENT_SET'); parent.appendChild(set);
      parts.forEach(part => set.appendChild(part)); return set;
    },
  };
  pageC.loadAsync = async () => {};
  pageC.appendChild = appendChild;
  const { replaceSections, buildEscalation } = await loadBuilderRuntime('buildEscalation');
  await replaceSections('build-escalation', buildEscalation);
  await replaceSections('build-escalation', buildEscalation);
  assert.deepEqual(pageC.children.map(n => n.name), ['Manual / AI escalation work', '09 — Business Entity Components', '10 — Escalation Components']);
  assert.equal(pageC.children[0], manual);
  assert.equal(pageC.children[1], business);
  assert.deepEqual(pageA.children.map(n => n.name), ['approved 03A']);
  assert.deepEqual(pageB.children.map(n => n.name), ['approved Escalations']);
  const all = function walk(n) { return [n, ...(n.children ?? []).flatMap(walk)]; };
  const section = pageC.children[2];
  const nodes = all(section);
  const named = name => nodes.find(n => n.name === name);
  const queue = named('Component / Escalation / Queue Item');
  assert.equal(queue?.type, 'COMPONENT_SET');
  assert.deepEqual(queue.children.map(n => n.name), [
    'State=Waiting Assignment', 'State=Assigned', 'State=OUTCOME_UNKNOWN / Reconciliation Required', 'State=Resume Pending — TARGET M12',
  ]);
  for (const name of ['Reason', 'Confirmed Facts', 'Uncertain Effect', 'Constraints', 'Human Decision Panel',
    'Decision Block', 'Reconciliation Warning', 'Resume Revalidation', 'Stale Context', 'Authorization Changed', 'E02 Restricted']) {
    assert.equal(named('Component / Escalation / ' + name)?.type, 'COMPONENT', name);
  }
  assert.equal(named('Component / Escalation / Next Safe Step')?.type, 'COMPONENT_SET');
  assert.deepEqual(named('Component / Escalation / Next Safe Step').children.map(n => n.name),
    ['Step=Reconcile', 'Step=Refresh', 'Step=Clarify', 'Step=Human / Policy']);
  const uncertain = all(named('Component / Escalation / Uncertain Effect'));
  for (const value of ['UNCERTAIN EFFECT / OUTCOME_UNKNOWN', 'Reservation effect may have committed.',
    'Reconciliation required against authoritative reservation state.', 'NO BLIND RETRY / no mutation action here']) {
    assert(uncertain.some(n => n.characters === value), value);
  }
  assert.equal(named('Component / Escalation / Uncertain Effect').fills[0].boundVariableId, 'v-status/unknown-bg');
  const decision = all(named('Component / Escalation / Human Decision Panel'));
  for (const value of ['Approve proposed continuation', 'Reject proposed continuation', 'Request clarification',
    'Revalidate → Resume request', 'Close escalation']) assert(decision.some(n => n.characters === value), value);
  assert(!decision.some(n => n.characters === 'Approve' || n.characters === 'Reject'));
  assert(decision.some(n => n.name === 'TARGET M12 resume request / unavailable'));
  assert(decision.some(n => n.name === 'Primary decision / focus' && n.strokeWeight === 2));
  const resume = all(named('Component / Escalation / Resume Revalidation'));
  for (const phrase of ['TARGET M12 / Not currently implemented / No mutation replay',
    'Human decision → Revalidation → Controlled Resume request']) assert(resume.some(n => n.characters === phrase), phrase);
  assert(resume.some(n => n.characters?.includes('Authorization + current state + revisions checked')));
  assert(resume.some(n => n.characters?.includes('must not immediately replay')));
  const e02 = all(named('Component / Escalation / E02 Restricted'));
  assert(e02.some(n => n.characters?.includes('update_order automatic mutation unavailable')));
  assert(e02.some(n => n.characters?.includes('Known Order state: Created')));
  assert(e02.some(n => n.characters?.includes('Not OUTCOME_UNKNOWN')));
  const hierarchy = named('Component / Escalation / Decision Block');
  assert.deepEqual(hierarchy.children.filter(n => n.name.startsWith('Hierarchy / ')).map(n => n.name), [
    'Hierarchy / WHY AUTOMATION STOPPED', 'Hierarchy / CONFIRMED FACTS', 'Hierarchy / UNCERTAIN EFFECT',
    'Hierarchy / CONSTRAINTS', 'Hierarchy / NEXT SAFE STEP', 'Hierarchy / HUMAN DECISION',
  ]);
  for (const title of ['A / Unknown → Reconciliation → Human Decision', 'B / Stale Context → Refresh',
    'C / E02 → Human/Policy', 'D / Resume Pending — TARGET M12']) {
    assert(named('DS / Escalation / Composition / ' + title), title);
  }
  assert(bindings.includes('semantic/status/unknown'));
  assert(bindings.includes('semantic/focus/ring'));
  assert(!bindings.includes('semantic/status/error'));
  assert(bindings.every(name => name.startsWith('semantic/')));
  for (const parent of nodes) {
    if (!['FRAME', 'COMPONENT'].includes(parent.type) || typeof parent.width !== 'number') continue;
    for (const child of parent.children) {
      if (typeof child.width !== 'number' || typeof child.height !== 'number') continue;
      assert(child.x >= -0.01 && child.y >= -0.01, `${parent.name} / ${child.name} negative position`);
      assert(child.x + child.width <= parent.width + 1, `${parent.name} / ${child.name} exceeds width`);
      assert(child.y + child.height <= parent.height + 1, `${parent.name} / ${child.name} exceeds height`);
    }
  }
});

test('Build Analytics/Forecast separates observed data from conditional prediction and preserves unrelated nodes', async () => {
  const pageA = { id: 'a', name: '03A — Low-Fi Wireframes', children: [{ id: 'a1', name: 'approved 03A' }] };
  const pageB = { id: 'b', name: '03B — UX Review & Revisions', children: [{ id: 'b1', name: 'approved Analytics/Forecasts' }] };
  const manual = { id: 'manual', name: 'Manual / AI data work' };
  const escalation = { id: 'escalation', name: '10 — Escalation Components' };
  const pageC = { id: 'c', name: '03C — Design System', children: [manual, escalation] };
  let seq = 0;
  const bindings = [];
  function appendChild(child) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.push(child); child.parent = this;
  }
  function node(type) {
    const n = {
      id: 'node-' + ++seq, type, name: '', children: [], height: 16,
      appendChild, resize(w, h) { this.width = w; this.height = h; },
      remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    };
    n.parent = globalThis.figma.currentPage;
    n.parent.children.push(n);
    return n;
  }
  const { semantic } = await loadSource('src/tokens.ts');
  const variables = Object.keys(semantic).map(name => ({ id: 'v-' + name, name: 'semantic/' + name, variableCollectionId: 'collection' }));
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    setCurrentPageAsync: async p => { globalThis.figma.currentPage = p; },
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => variables,
      setBoundVariableForPaint: (paint, field, variable) => { bindings.push(variable.name); return { ...paint, boundVariableId: variable.id }; },
    },
    createFrame: () => node('FRAME'), createText: () => node('TEXT'), createComponent: () => node('COMPONENT'),
    combineAsVariants: (parts, parent) => {
      const set = node('COMPONENT_SET'); parent.appendChild(set);
      parts.forEach(part => set.appendChild(part)); return set;
    },
  };
  pageC.loadAsync = async () => {};
  pageC.appendChild = appendChild;
  const { replaceSections, buildAnalyticsForecast } = await loadBuilderRuntime('buildAnalyticsForecast');
  await replaceSections('build-analytics-forecast', buildAnalyticsForecast);
  await replaceSections('build-analytics-forecast', buildAnalyticsForecast);
  assert.deepEqual(pageC.children.map(n => n.name), [
    'Manual / AI data work', '10 — Escalation Components', '11 — Analytics / Data Components', '12 — Forecast Components',
  ]);
  assert.equal(pageC.children[0], manual);
  assert.equal(pageC.children[1], escalation);
  assert.deepEqual(pageA.children.map(n => n.name), ['approved 03A']);
  assert.deepEqual(pageB.children.map(n => n.name), ['approved Analytics/Forecasts']);
  const all = function walk(n) { return [n, ...(n.children ?? []).flatMap(walk)]; };
  const analytics = all(pageC.children[2]);
  const forecast = all(pageC.children[3]);
  const get = (nodes, name) => nodes.find(n => n.name === name);
  for (const name of ['KPI', 'Period Selector', 'Freshness', 'Completeness', 'Historical Chart']) {
    assert.equal(get(analytics, 'Component / Analytics / ' + name)?.type, 'COMPONENT_SET', name);
  }
  for (const name of ['Data Table', 'Valid Empty', 'Incomplete', 'Stale', 'Dependency Unavailable', 'Permission Denied']) {
    assert.equal(get(analytics, 'Component / Analytics / ' + name)?.type, 'COMPONENT', name);
  }
  assert.deepEqual(get(analytics, 'Component / Analytics / KPI').children.map(n => n.name),
    ['Metric=Orders', 'Metric=Confirmed order value', 'Metric=Average order value']);
  const periodFocus = all(get(analytics, 'Component / Analytics / Period Selector').children[1]);
  assert(periodFocus.some(n => n.name === 'Period control' && n.strokeWeight === 2));
  const historicalCharts = get(analytics, 'Component / Analytics / Historical Chart').children;
  assert.deepEqual(historicalCharts.map(n => n.name), ['State=Valid Historical Data', 'State=Missing-data Gap', 'State=Incomplete Data', 'State=Stale Data']);
  const ends = n => {
    const [[cos, minusSin, x], [sin, otherCos, y]] = n.relativeTransform;
    const start = [x + minusSin * n.height / 2, y + otherCos * n.height / 2];
    return { start, end: [start[0] + cos * n.width, start[1] + sin * n.width] };
  };
  const close = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.01;
  const actualSegments = n => n.children.filter(child => child.name.startsWith('ACTUAL / solid segment'));
  const assertContinuous = n => {
    const segments = actualSegments(n);
    assert.equal(segments.length, 4);
    for (let i = 0; i < segments.length - 1; i++) {
      assert(close(ends(segments[i]).end, ends(segments[i + 1]).start), `${n.name}: ACTUAL gap after segment ${i + 1}`);
    }
  };
  assertContinuous(historicalCharts[0]);
  assertContinuous(historicalCharts[2]);
  assertContinuous(historicalCharts[3]);
  assert(!all(historicalCharts[0]).some(n => n.name === 'Missing observation / visible gap'));
  const gap = all(historicalCharts[1]);
  assert(gap.some(n => n.characters === 'Missing period / unavailable observation'));
  assert(gap.some(n => n.name === 'Missing observation / visible gap'));
  assert.deepEqual(gap.filter(n => n.name.startsWith('ACTUAL / solid segment')).map(n => n.name),
    ['ACTUAL / solid segment 1', 'ACTUAL / solid segment 4']);
  assert(Math.hypot(...ends(actualSegments(historicalCharts[1])[0]).end.map((v, i) => v - ends(actualSegments(historicalCharts[1])[1]).start[i])) > 100);
  assert(!all(historicalCharts[3]).some(n => n.name === 'Missing observation / visible gap'));
  assert(!analytics.some(n => n.name.startsWith('PREDICTED / dash')));
  const unavailable = all(get(analytics, 'Component / Analytics / Dependency Unavailable'));
  assert(unavailable.some(n => n.characters?.includes('never render zero activity')));
  assert(!unavailable.some(n => n.name === 'Observed value'));
  assert(all(get(analytics, 'Component / Analytics / Incomplete')).some(n => n.characters?.includes('coverage partial')));
  assert(all(get(analytics, 'Component / Analytics / Stale')).some(n => n.characters?.includes('may be old')));
  assert(all(get(analytics, 'Component / Analytics / Permission Denied')).some(n => n.characters?.includes('lacks report access')));
  assert(get(analytics, 'DS / Analytics / Historical to Forecast Request'));
  for (const name of ['Request Summary', 'Target', 'Cutoff', 'Horizon', 'Actual vs Predicted Chart',
    'Actual Series', 'Predicted Series', 'Provenance', 'Limitations', 'Result', 'MODEL_NOT_READY',
    'Insufficient History', 'Unsupported Horizon', 'Model Unavailable', 'Timeout', 'Incomplete History', 'Permission Denied']) {
    assert.equal(get(forecast, 'Component / Forecast / ' + name)?.type, 'COMPONENT', name);
  }
  const chart = all(get(forecast, 'Component / Forecast / Actual vs Predicted Chart'));
  const cutoff = chart.find(n => n.name === 'CUTOFF / vertical marker');
  assert(cutoff);
  assertContinuous(get(forecast, 'Component / Forecast / Actual vs Predicted Chart'));
  assert(close(ends(actualSegments(get(forecast, 'Component / Forecast / Actual vs Predicted Chart')).at(-1)).end, [505, 211]));
  assert(close(ends(cutoff).start, [505, 90]));
  assert(close(ends(cutoff).end, [505, 305]));
  assert(ends(cutoff).start[0] > 58 && ends(cutoff).start[0] < 917);
  assert(ends(cutoff).start[1] >= 89 && ends(cutoff).end[1] <= 305);
  assert.equal(chart.filter(n => n.name.startsWith('ACTUAL / solid segment')).length, 4);
  assert.equal(chart.filter(n => n.name.startsWith('PREDICTED / dash')).length, 11);
  assert(chart.filter(n => n.name.startsWith('PREDICTED / dash')).every(n => ends(n).start[0] > 505));
  assert(chart.some(n => n.characters === 'ACTUAL — solid line'));
  assert(chart.some(n => n.characters === 'PREDICTED - dashed line'));
  assert.equal(all(get(forecast, 'Component / Forecast / Predicted Series')).filter(n => n.name.startsWith('PREDICTED / dash')).length, 11);
  assert(get(forecast, 'DS / Forecast / TARGET Ready Composition'));
  const notReady = all(get(forecast, 'Component / Forecast / MODEL_NOT_READY'));
  for (const value of ['CURRENT: no validated model / MODEL_NOT_READY', 'Validated forecast artifact is not ready.',
    'No prediction has been produced.']) assert(notReady.some(n => n.characters === value), value);
  assert(!notReady.some(n => n.name.startsWith('PREDICTED / dash')));
  assert(!notReady.some(n => n.name === 'Observed value'));
  const insufficient = all(get(forecast, 'Component / Forecast / Insufficient History'));
  const incomplete = all(get(forecast, 'Component / Forecast / Incomplete History'));
  assert(insufficient.some(n => n.characters?.includes('not long enough')));
  assert(incomplete.some(n => n.characters?.includes('data is missing')));
  assert(all(get(forecast, 'Component / Forecast / Permission Denied')).some(n => n.characters?.includes('not authorized')));
  assert(bindings.includes('semantic/chart/actual'));
  assert(bindings.includes('semantic/chart/predicted'));
  assert(bindings.includes('semantic/focus/ring'));
  assert(bindings.every(name => name.startsWith('semantic/')));
  for (const parent of [...analytics, ...forecast]) {
    if (!['FRAME', 'COMPONENT'].includes(parent.type) || typeof parent.width !== 'number') continue;
    for (const child of parent.children) {
      if (typeof child.width !== 'number' || typeof child.height !== 'number') continue;
      assert(child.x >= -0.01 && child.y >= -0.01, `${parent.name} / ${child.name} negative position`);
      assert(child.x + child.width <= parent.width + 1, `${parent.name} / ${child.name} exceeds width`);
      assert(child.y + child.height <= parent.height + 1, `${parent.name} / ${child.name} exceeds height`);
    }
  }
});

test('Build Web Chat creates narrow customer components while preserving approved pages and existing Usage/Validation', async () => {
  const pageA = { id: 'a', name: '03A — Low-Fi Wireframes', children: [{ id: 'a1', name: 'approved 03A' }] };
  const pageB = { id: 'b', name: '03B — UX Review & Revisions', children: [{ id: 'b1', name: 'approved Web Chat' }] };
  const manual = { id: 'manual', name: 'Manual / AI web chat work' };
  const usage = { id: 'usage', type: 'FRAME', name: '15 — Usage Examples', children: [{ id: 'usage-manual', name: 'manual usage note' }] };
  const validation = { id: 'validation', type: 'FRAME', name: '16 — Validation', children: [{ id: 'validation-manual', name: 'manual validation note' }] };
  const pageC = { id: 'c', name: '03C — Design System', children: [manual, usage, validation] };
  let seq = 0;
  const bindings = [];
  function appendChild(child) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.push(child); child.parent = this;
  }
  function node(type) {
    const n = {
      id: 'node-' + ++seq, type, name: '', children: [], height: 16,
      appendChild, resize(w, h) { this.width = w; this.height = h; },
      remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    };
    n.parent = globalThis.figma.currentPage;
    n.parent.children.push(n);
    return n;
  }
  const { semantic } = await loadSource('src/tokens.ts');
  const variables = Object.keys(semantic).map(name => ({ id: 'v-' + name, name: 'semantic/' + name, variableCollectionId: 'collection' }));
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    setCurrentPageAsync: async p => { globalThis.figma.currentPage = p; },
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => variables,
      setBoundVariableForPaint: (paint, field, variable) => { bindings.push(variable.name); return { ...paint, boundVariableId: variable.id }; },
    },
    createFrame: () => node('FRAME'), createText: () => node('TEXT'), createComponent: () => node('COMPONENT'),
    combineAsVariants: (parts, parent) => {
      const set = node('COMPONENT_SET'); parent.appendChild(set);
      parts.forEach(part => set.appendChild(part)); return set;
    },
  };
  pageC.loadAsync = async () => {};
  pageC.appendChild = appendChild;
  const { replaceSections, buildWebChat } = await loadBuilderRuntime('buildWebChat');
  const preserve = ['15 — Usage Examples', '16 — Validation'];
  const firstBuild = await replaceSections('build-webchat', buildWebChat, preserve);
  const secondBuild = await replaceSections('build-webchat', buildWebChat, preserve);
  assert.deepEqual(firstBuild, ['13 — Customer Web Chat Components']);
  assert.deepEqual(secondBuild, ['13 — Customer Web Chat Components']);
  assert.deepEqual(pageC.children.map(n => n.name), [
    'Manual / AI web chat work', '15 — Usage Examples', '16 — Validation', '13 — Customer Web Chat Components',
  ]);
  assert.equal(pageC.children[0], manual);
  assert.equal(pageC.children[1], usage);
  assert.equal(pageC.children[2], validation);
  assert.deepEqual(usage.children.map(n => n.name), ['manual usage note']);
  assert.deepEqual(validation.children.map(n => n.name), ['manual validation note']);
  assert.deepEqual(pageA.children.map(n => n.name), ['approved 03A']);
  assert.deepEqual(pageB.children.map(n => n.name), ['approved Web Chat']);
  const all = function walk(n) { return [n, ...(n.children ?? []).flatMap(walk)]; };
  const section = pageC.children[3];
  const nodes = all(section);
  const named = name => nodes.find(n => n.name === name);
  for (const name of ['Customer Message', 'Business Reply', 'Clarification Request', 'Confirmation Request', 'Processing',
    'Confirmed Result', 'Known Failure', 'Waiting Human', 'Confirmation Pending', 'Delivery Failure']) {
    assert.equal(named('Component / Web Chat / ' + name)?.type, 'COMPONENT', name);
  }
  const composer = named('Component / Web Chat / Composer');
  assert.equal(composer?.type, 'COMPONENT_SET');
  assert.deepEqual(composer.children.map(n => n.name), ['State=Ready', 'State=Sending', 'State=Delivery Failed']);
  for (const variant of composer.children) {
    assert(variant.width <= 310);
    assert(all(variant).some(n => n.name === 'Visible message input'));
    assert(all(variant).some(n => n.height === 44 && n.name.includes('action') || n.name === 'Sending status / unavailable action'));
  }
  const confirmation = all(named('Component / Web Chat / Confirmation Request'));
  assert(confirmation.some(n => n.characters === 'Confirm order'));
  assert(confirmation.some(n => n.characters === 'Change details'));
  assert(!confirmation.some(n => n.characters === 'Confirm'));
  const primary = confirmation.find(n => n.name === 'Confirm order / focus');
  const secondary = confirmation.find(n => n.name === 'Change details action');
  assert(primary.height >= 44 && secondary.height >= 44 && primary.y + primary.height < secondary.y);
  assert(primary.children.some(n => n.name === 'Action label' && n.height === 40 && n.textAlignVertical === 'CENTER'));
  assert(secondary.children.some(n => n.name === 'Action label' && n.height === 40 && n.textAlignVertical === 'CENTER'));
  const confirmed = all(named('Component / Web Chat / Confirmed Result'));
  assert(confirmed.some(n => n.name === 'Order state separate fact'));
  assert(confirmed.some(n => n.name === 'Reservation state separate fact'));
  const known = all(named('Component / Web Chat / Known Failure'));
  for (const value of ['Your order was created, but the item was not reserved.',
    "Please don't place the same order again.", "We'll help you with the next step."]) {
    assert(known.some(n => n.characters === value), value);
  }
  const processing = all(named('Component / Web Chat / Processing'));
  assert(processing.some(n => n.characters === "We'll update you here when the result is available."));
  assert(!processing.some(n => n.name.includes('action')));
  const waiting = all(named('Component / Web Chat / Waiting Human'));
  assert(waiting.some(n => n.characters === 'A person is reviewing this.'));
  assert(waiting.some(n => n.characters === 'You can still send a message.'));
  const pending = all(named('Component / Web Chat / Confirmation Pending'));
  assert(pending.some(n => n.characters === 'Please do not submit the same request again.'));
  assert(!pending.some(n => /Retry order|Retry reservation|Submit again/.test(n.characters ?? '')));
  const delivery = all(named('Component / Web Chat / Delivery Failure'));
  assert(delivery.some(n => n.characters === 'Not delivered'));
  assert(delivery.some(n => n.characters === 'Reservation remains confirmed'));
  assert(delivery.some(n => n.characters === 'Retry message'));
  for (const title of ['A / Clarification → Response', 'B / Confirmation → Confirm order', 'C / Processing → Confirmed',
    'D / Order Created + Reservation Failed', 'E / Confirmation Pending', 'F / Confirmed + Message Not Delivered']) {
    assert(named('DS / Web Chat / Composition / ' + title));
  }
  const allText = nodes.filter(n => n.type === 'TEXT').map(n => n.characters).join('\n');
  assert(!/create_order|reserve_inventory|update_order|ToolCall|Agent Run|LangGraph|OUTCOME_UNKNOWN|MODEL_NOT_READY|M12|E02|internal confidence/i.test(allText));
  assert(bindings.includes('semantic/focus/ring'));
  assert(bindings.every(name => name.startsWith('semantic/')));
  for (const parent of nodes) {
    if (!['FRAME', 'COMPONENT'].includes(parent.type) || typeof parent.width !== 'number') continue;
    for (const child of parent.children) {
      if (typeof child.width !== 'number' || typeof child.height !== 'number') continue;
      assert(child.x >= -0.01 && child.y >= -0.01, `${parent.name} / ${child.name} negative position`);
      assert(child.x + child.width <= parent.width + 1, `${parent.name} / ${child.name} exceeds width`);
      assert(child.y + child.height <= parent.height + 1, `${parent.name} / ${child.name} exceeds height`);
    }
  }
});

test('Build Usage Examples creates six small semantic compositions and replaces only section 15', async () => {
  const pageA = { id: 'a', name: '03A — Low-Fi Wireframes', children: [{ id: 'a1', name: 'approved 03A' }] };
  const pageB = { id: 'b', name: '03B — UX Review & Revisions', children: [{ id: 'b1', name: 'approved 03B' }] };
  const manual = { id: 'manual', name: 'Manual / AI work' };
  const webchat = { id: 'webchat', name: '13 — Customer Web Chat Components' };
  const validation = { id: 'validation', name: '16 — Validation' };
  const pageC = { id: 'c', name: '03C — Design System', children: [manual, webchat, validation] };
  let seq = 0;
  const bindings = [];
  function appendChild(child) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    this.children.push(child); child.parent = this;
  }
  function node(type) {
    const n = {
      id: 'node-' + ++seq, type, name: '', children: [], height: 16,
      appendChild, resize(w, h) { this.width = w; this.height = h; },
      remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; },
    };
    n.parent = globalThis.figma.currentPage;
    n.parent.children.push(n);
    return n;
  }
  const { semantic } = await loadSource('src/tokens.ts');
  const variables = Object.keys(semantic).map(name => ({ id: 'v-' + name, name: 'semantic/' + name, variableCollectionId: 'collection' }));
  globalThis.figma = {
    root: { name: 'Diplom — Multi-Agent Platform UX/UI', children: [pageA, pageB, pageC] },
    fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: pageA,
    setCurrentPageAsync: async p => { globalThis.figma.currentPage = p; },
    loadFontAsync: async () => {},
    variables: {
      getLocalVariableCollectionsAsync: async () => [{ id: 'collection', name: 'Phase 3C / Light' }],
      getLocalVariablesAsync: async () => variables,
      setBoundVariableForPaint: (paint, field, variable) => { bindings.push(variable.name); return { ...paint, boundVariableId: variable.id }; },
    },
    createFrame: () => node('FRAME'), createText: () => node('TEXT'), createComponent: () => node('COMPONENT'),
  };
  pageC.loadAsync = async () => {};
  pageC.appendChild = appendChild;
  const { replaceSections, buildUsage } = await loadBuilderRuntime('buildUsage');
  for (let run = 0; run < 2; run++) {
    assert.deepEqual(await replaceSections('build-usage', buildUsage), ['15 — Usage Examples']);
    assert.deepEqual(pageC.children.map(n => n.name), [manual.name, webchat.name, validation.name, '15 — Usage Examples']);
  }
  assert.equal(pageC.children[0], manual);
  assert.equal(pageC.children[1], webchat);
  assert.equal(pageC.children[2], validation);
  assert.deepEqual(pageA.children.map(n => n.name), ['approved 03A']);
  assert.deepEqual(pageB.children.map(n => n.name), ['approved 03B']);
  const section = pageC.children[3];
  const walk = n => [n, ...(n.children ?? []).flatMap(walk)];
  const all = walk(section);
  const specs = section.children.filter(n => n.type === 'COMPONENT');
  assert.deepEqual(specs.map(n => n.name), [
    'DS / Usage / Order + Reservation', 'DS / Usage / OUTCOME_UNKNOWN',
    'DS / Usage / Confirmed + Delivery Failed', 'DS / Usage / Actual + Predicted',
    'DS / Usage / Forecast Readiness', 'DS / Usage / Customer Confirmation',
  ]);
  assert(specs.every(n => n.width === 990 && n.height === 230));
  assert(section.height === 650 && section.width === 3090);
  const content = n => walk(n).filter(x => x.type === 'TEXT').map(x => x.characters).join('\n');
  assert.match(content(specs[0]), /Created[\s\S]*Failed \(known\)[\s\S]*Review current inventory/);
  assert.match(content(specs[0]), /Choose an authorized recovery/);
  assert.match(content(specs[1]), /OUTCOME_UNKNOWN[\s\S]*Required[\s\S]*Do not retry mutation/);
  assert.match(content(specs[1]), /Effect may have committed\. Confirmation unavailable\./);
  assert.match(content(specs[2]), /Reservation confirmed[\s\S]*Message delivery failed[\s\S]*Retry communication only/);
  assert.match(content(specs[2]), /Do NOT replay reserve_inventory/);
  assert.match(content(specs[3]), /TARGET PRODUCT UX[\s\S]*ACTUAL[\s\S]*PREDICTED/);
  assert(walk(specs[3]).some(n => n.name === 'ACTUAL / solid historical line'));
  assert(walk(specs[3]).some(n => n.name === 'CUTOFF / last observed boundary'));
  assert.equal(walk(specs[3]).filter(n => n.name.startsWith('PREDICTED / dash')).length, 6);
  assert.match(content(specs[4]), /CURRENT ENGINEERING STATE[\s\S]*MODEL_NOT_READY[\s\S]*No prediction produced/);
  assert.match(content(specs[4]), /TARGET PRODUCT UX[\s\S]*Forecast result composition/);
  assert.match(content(specs[5]), /Item: Slate lamp[\s\S]*Quantity: 1[\s\S]*Confirm order[\s\S]*Change details/);
  assert(!/create_order|reserve_inventory|ToolCall|OUTCOME_UNKNOWN/.test(content(specs[5])));
  const narrow = walk(specs[5]).find(n => n.name === 'Mobile-width customer confirmation');
  assert.equal(narrow.width, 390);
  assert(walk(narrow).filter(n => n.name.startsWith('Primary /') || n.name.startsWith('Secondary /')).every(n => n.height === 44));
  for (const key of ['semantic/status/success', 'semantic/status/warning', 'semantic/status/unknown',
    'semantic/status/model-not-ready', 'semantic/chart/actual', 'semantic/chart/predicted', 'semantic/focus/ring']) {
    assert(bindings.includes(key), key);
  }
  assert(bindings.every(name => name.startsWith('semantic/')));
});

test('color contrast targets and semantic aliases', async () => {
  const m = await loadSource('src/tokens.ts');
  assert(m.contrast(m.primitive.neutral900, m.primitive.white) >= 4.5);
  assert(m.contrast(m.primitive.neutral600, m.primitive.white) >= 4.5);
  assert(m.contrast(m.primitive.white, m.primitive.navy700) >= 4.5);
  assert.notEqual(m.semantic['status/unknown'], m.semantic['status/error']);
  assert.notEqual(m.semantic['status/unknown'], m.semantic['status/success']);
  assert.notEqual(m.semantic['chart/actual'], m.semantic['chart/predicted']);
});

test('source and bundle have no private plugin data or Figma MCP dependency', async () => {
  const sourceFiles = (await files(resolve(root, 'src'))).filter(p => p.endsWith('.ts') || p.endsWith('.html'));
  for (const path of [...sourceFiles, resolve(root, 'dist/code.js')]) {
    const content = await readFile(path, 'utf8');
    assert(!/getPluginData|setPluginData|create_new_file|use_figma/.test(content), path);
  }
  assert((await readFile(resolve(root, 'dist/ui.html'), 'utf8')).includes('Copy Validation Report'));
});

test('customer-facing component descriptions avoid internal implementation words', async () => {
  const content = await readFile(resolve(root, 'src/builders.ts'), 'utf8');
  const part = content.split('export async function buildWebChat')[1].split('const usage =')[0];
  assert(!/create_order|reserve_inventory|update_order|ToolCall|Agent Run|LangGraph|OUTCOME_UNKNOWN|MODEL_NOT_READY|M12|E02/.test(part));
  assert(part.includes('Confirm order'));
  assert(part.includes("Please don't place the same order again"));
});

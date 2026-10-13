import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');
const core = require(resolve(root, 'dist/constants.cjs'));
const bundle = readFileSync(resolve(root, 'dist/code.js'), 'utf8');

function environment() {
  let counter = 0;
  let currentPage;
  class Node {
    constructor(type, name) {
      this.type = type; this.name = name; this.id = String(++counter);
      this.children = []; this.parent = null; this.x = 0; this.y = 0;
      this.width = 1600; this.height = 900; this.fills = [];
      this.reactions = []; this.characters = ''; this.removed = false;
      this.visible = true; this.opacity = 1;
    }
    appendChild(child) {
      if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
      child.parent = this; this.children.push(child);
    }
    findAll(predicate) {
      const result = [];
      const walk = n => { for (const child of n.children) { if (predicate(child)) result.push(child); walk(child); } };
      walk(this); return result;
    }
    clone() {
      const copy = new Node(this.type, this.name);
      copy.x = this.x; copy.y = this.y;
      copy.width = this.width; copy.height = this.height; copy.fills = structuredClone(this.fills);
      copy.visible = this.visible; copy.opacity = this.opacity;
      copy.characters = this.characters;
      copy.reactions = structuredClone(this.reactions);
      for (const child of this.children) copy.appendChild(cloneNested(child));
      currentPage.appendChild(copy);
      return copy;
    }
    async setReactionsAsync(value) { this.reactions = structuredClone(value); }
    resize(width, height) { this.width = width; this.height = height; }
    remove() {
      if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
      this.parent = null; this.removed = true;
    }
    async loadAsync() {}
  }
  function cloneNested(original) {
    const n = new Node(original.type, original.name);
    n.x = original.x; n.y = original.y;
    n.width = original.width; n.height = original.height; n.fills = structuredClone(original.fills);
    n.visible = original.visible; n.opacity = original.opacity;
    n.characters = original.characters;
    n.reactions = structuredClone(original.reactions);
    for (const child of original.children) n.appendChild(cloneNested(child));
    return n;
  }
  const rootNode = new Node('DOCUMENT', 'Root');
  const names = [...core.PROTECTED_PAGES];
  for (const name of names) rootNode.appendChild(new Node('PAGE', name));
  const sourcePage = rootNode.children.find(p => p.name === core.SOURCE_PAGE);
  currentPage = sourcePage;
  const sections = new Map();
  for (const entry of Object.values(core.SOURCES)) {
    if (!sections.has(entry.section)) {
      const s = new Node('FRAME', entry.section); sourcePage.appendChild(s); sections.set(entry.section, s);
    }
    const frame = new Node('FRAME', entry.name);
    sections.get(entry.section).appendChild(frame);
  }
  const sourceFrames = () => Object.fromEntries(Object.entries(core.SOURCES).map(([key, value]) => [key, sections.get(value.section).children.find(n => n.name === value.name)]));
  const sources = sourceFrames();
  sources.conversationDefault.appendChild(new Node('FRAME', 'Conversation row / 1'));
  for (const flow of core.FLOWS) for (const edge of flow.edges) {
    if (flow.id <= 8) continue;
    const item = flow.frames.find(f => f.key === edge.from);
    const frame = sources[item.source];
    if (!frame.findAll(n => n.name === edge.control).length) frame.appendChild(new Node('FRAME', edge.control));
  }
  const semantic = {
    conversationSupport: 'Support Agent active. Support is answering from verified Order facts; it does not perform Sales writes. Sales handoff is available only when an authorized Sales task is required. Latest known availability: 4 units.',
    conversationSales: 'Sales Agent active. Sales owns the current case. Any consequential action still requires trusted authorization. Current Order and stock facts remain adjacent in context.',
    conversationConfirmation: 'PROPOSED · NOT EXECUTED. Awaiting customer confirmation before action can proceed.',
    conversationProcessing: 'Processing · result pending. No completed effect yet.',
    conversationConfirmed: 'ORDER STATE Created. Reservation confirmed. Order #1042.',
    orderConfirmed: 'ORDER STATE Created. RESERVATION STATE Confirmed. Message delivery is separate.',
    conversationFailure: 'ORDER STATE Created. RESERVATION STATE Known Failure. Reservation failed. Inventory was not reserved. Review current inventory. Choose an authorized recovery.',
    orderFailed: 'ORDER STATE Created. RESERVATION STATE Known Failure. Reservation failed — known result. Inventory is not reserved. Review current inventory. Choose an authorized recovery path.',
    conversationHandoff: 'Support Agent → Sales Agent. Reason: Sales-authorized mutation required. Verified customer and Order context carried forward; Order retrieval complete. Remaining: Sales reviews current facts. Permissions do not transfer.',
    conversationUnknown: 'Reconcile authoritative reservation state. Do not retry mutation blindly.',
    escalationUnknown: 'RECONCILIATION REQUIRED · NO BLIND RETRY',
    escalationDecision: 'Awaiting Decision. Human Operator assigned. Known failed reservation needs an authorized recovery decision.',
    escalationResume: 'Resume Pending · TARGET M12. TARGET M12 · Not currently implemented. No mutation replay is allowed. Any prior OUTCOME_UNKNOWN must be reconciled before continuation. No new reservation or Order effect is claimed. Revalidate authorization, current state and revision. Human decision → Revalidation → Controlled Resume request. No live resume action.',
    analyticsValid: 'VALID HISTORICAL RESULT. HISTORICAL CHART · ACTUAL ONLY. Observed confirmed-order counts for the past period.',
    forecastNotReady: 'CURRENT ENGINEERING STATE: MODEL_NOT_READY. No validated forecast artifact exists in the current engineering state. This is not a zero or valid-empty forecast. No prediction produced.',
    forecastTarget: 'TARGET PRODUCT UX. CURRENT ENGINEERING STATE: MODEL_NOT_READY. The result below is a design example only. TARGET Ready is an illustrative future composition.',
    chatConfirmation: 'CONFIRMATION REQUIRED. If you confirm, we will place this order. Change details.',
    chatProcessing: 'PROCESSING / awaiting result. We are processing your request. No further action is needed right now.',
    chatConfirmed: 'YOUR ORDER UPDATE. Order created. Item reserved. Order ORD-1042.',
    chatDelivery: 'MESSAGE DELIVERY ISSUE. Your order was created and the item was reserved. Message not delivered. Reservation remains confirmed. Only your message needs attention.',
  };
  for (const [key, text] of Object.entries(semantic)) {
    const child = new Node('TEXT', 'Semantic copy'); child.characters = text; sources[key].appendChild(child);
  }
  const addText = (parent, name, value) => {
    const node = new Node('TEXT', name); node.characters = value; parent.appendChild(node); return node;
  };
  for (const [key, componentName, buttonName, buttonLabel] of [
    ['chatConfirmation', 'Confirmation Request component', 'Confirm order / focus', 'Confirm order'],
    ['chatProcessing', 'Processing component', null, null],
    ['chatConfirmed', 'Confirmed Result component', null, null],
    ['chatDelivery', 'Delivery Failure component', 'Retry message action / focus', 'Retry message'],
  ]) {
    const screen = sources[key]; screen.width = 414; screen.height = 820;
    const state = new Node('FRAME', 'Customer State'); state.x = 12; state.y = 300; state.width = 390; state.height = 370;
    screen.appendChild(state);
    const component = new Node('INSTANCE', componentName); component.width = 390; component.height = 340;
    state.appendChild(component);
    if (buttonName) {
      const button = new Node('FRAME', buttonName); button.x = 14; button.y = 199; button.width = 362; button.height = 44;
      component.appendChild(button); addText(button, 'Action label', buttonLabel);
    }
    if (key === 'chatConfirmation') {
      const change = new Node('FRAME', 'Change details action'); change.x = 14; change.y = 257; change.width = 362; change.height = 44;
      component.appendChild(change); addText(change, 'Action label', 'Change details');
    }
  }
  const historicalChart = new Node('FRAME', 'Historical Chart'); sources.analyticsValid.appendChild(historicalChart);
  addText(historicalChart, 'Chart heading', 'HISTORICAL CHART · ACTUAL ONLY');
  const forecastLink = new Node('FRAME', 'Forecast Contextual Link'); sources.analyticsValid.appendChild(forecastLink);
  const openForecasts = new Node('FRAME', 'Open Forecasts'); forecastLink.appendChild(openForecasts);
  addText(openForecasts, 'Action label', 'Open Forecasts →');
  const notReadyResult = new Node('FRAME', 'Forecast Result'); sources.forecastNotReady.appendChild(notReadyResult);
  const noPrediction = new Node('FRAME', 'No prediction result'); notReadyResult.appendChild(noPrediction);
  addText(noPrediction, 'Result meaning', 'No validated forecast artifact exists in the current engineering state. This is not a zero or valid-empty forecast.');
  const returnLink = new Node('FRAME', 'Historical Analytics Return'); sources.forecastNotReady.appendChild(returnLink);
  const backToAnalytics = new Node('FRAME', 'Open Historical Analytics'); returnLink.appendChild(backToAnalytics);
  addText(backToAnalytics, 'Action label', 'Open Historical Analytics →');
  const targetResult = new Node('FRAME', 'Forecast Result'); sources.forecastTarget.appendChild(targetResult);
  targetResult.appendChild(new Node('INSTANCE', 'Predicted Series component'));
  targetResult.appendChild(new Node('INSTANCE', 'Actual vs Predicted Chart component'));
  const seriesReading = new Node('FRAME', 'Series reading'); targetResult.appendChild(seriesReading);
  addText(seriesReading, 'Explanation', 'ACTUAL = solid, observed, before cutoff. CUTOFF = last observed point. PREDICTED = dashed, future-only, illustrative TARGET UX. No numeric prediction is claimed.');
  const requestSummary = new Node('INSTANCE', 'Request Summary component'); sources.forecastTarget.appendChild(requestSummary);
  for (const [name, value] of [['Target', 'TARGET: Confirmed-order units / DESIGN EXAMPLE'],
    ['Scope', 'SCOPE: North Shop / demo business'], ['Cutoff', 'CUTOFF: Last observed point / illustrative'],
    ['Horizon', 'HORIZON: Requested future span / validate']]) addText(requestSummary, name, value);
  const evidence = new Node('FRAME', 'Provenance and Limitations'); sources.forecastTarget.appendChild(evidence);
  const provenance = new Node('INSTANCE', 'Provenance component'); evidence.appendChild(provenance);
  addText(provenance, 'Run reference', 'Forecast run: [real run only]');
  addText(provenance, 'Model reference', 'Validated artifact: [real evidence only]');
  evidence.appendChild(new Node('INSTANCE', 'Limitations component'));
  const unknownResult = new Node('FRAME', 'Business Action Result'); sources.conversationUnknown.appendChild(unknownResult);
  addText(unknownResult, 'Result state', 'OUTCOME_UNKNOWN');
  addText(unknownResult, 'Possible effect', 'Reservation may have committed.');
  addText(unknownResult, 'Missing confirmation', 'Confirmation unavailable.');
  addText(unknownResult, 'Reconciliation rule', 'Required before any mutation retry.');
  addText(unknownResult, 'Safe retry rule', 'Reconcile authoritative reservation state. Do not retry mutation blindly.');
  addText(sources.conversationUnknown, 'Escalation link', 'Open Escalation  ↗');
  const decisionContext = new Node('FRAME', 'Decision Context'); sources.escalationUnknown.appendChild(decisionContext);
  addText(decisionContext, 'Selected case relationship', 'Amina S. · Conversation C-42 · Order ORD-1042');
  addText(decisionContext, 'Conversation reference', 'Open Conversation C-42 ↗');
  addText(decisionContext, 'Order reference', 'Open Order ORD-1042 ↗');
  addText(decisionContext, 'Run access', 'Agent Run · permitted case only ↗');
  const hierarchy = [
    ['Why Automation Stopped', 'WHY AUTOMATION STOPPED. Reservation confirmation unavailable after the request.'],
    ['Confirmed Facts', 'CONFIRMED FACTS. Order ORD-1042 exists. create_order — confirmed. Customer Amina S. verified.'],
    ['Uncertain Effect', 'UNCERTAIN EFFECT. OUTCOME_UNKNOWN · effect may have committed. Confirmation unavailable. RECONCILIATION REQUIRED. NO BLIND RETRY.'],
    ['Constraints', 'CONSTRAINTS. Do not retry reserve_inventory before reconciliation. Recheck current authorization.'],
    ['Next Safe Step', 'NEXT SAFE STEP. Reconcile authoritative reservation state first.'],
    ['Human Decision', 'HUMAN DECISION. Request reconciliation. Approval and mutation retry remain unavailable until the effect is known.'],
  ];
  hierarchy.forEach(([name, copy], index) => {
    const block = new Node('FRAME', name); block.y = 100 + index * 120; decisionContext.appendChild(block);
    addText(block, 'Hierarchy copy', copy);
  });
  const resumeContext = new Node('FRAME', 'Decision Context'); sources.escalationDecision.appendChild(resumeContext);
  hierarchy.forEach(([name, copy], index) => {
    const block = new Node('FRAME', name); block.y = 100 + index * 120; resumeContext.appendChild(block);
    addText(block, 'Hierarchy copy', name === 'Human Decision'
      ? 'HUMAN DECISION. Approve proposed continuation. Human Operator / Order ORD-1042 / current authorization required. Decision records intent only.'
      : copy);
  });
  addText(sources.escalationUnknown, 'Queue owner', 'CASE OWNER · Human Operator · reconciliation');
  for (const [key, handler] of [['conversationSupport', 'Support Agent'], ['conversationHandoff', 'Sales Agent'], ['conversationSales', 'Sales Agent']]) {
    const frame = sources[key];
    const context = new Node('FRAME', 'Persistent Context Panel'); frame.appendChild(context);
    for (const [name, value] of [['Handler name', handler], ['Customer identity', 'Amina S. · C-1042'],
      ['Order heading', 'ORDER · ORD-1042'], ['Availability', 'Latest known availability: 4 units'],
      ['Freshness', 'Observed 10:41 · revalidate before action']]) {
      const node = new Node('TEXT', name); node.characters = value; context.appendChild(node);
    }
    frame.appendChild(new Node('FRAME', 'Message Thread'));
  }
  const orderLink = new Node('TEXT', 'Order link'); orderLink.characters = 'Open Order record  ↗';
  sources.conversationConfirmed.appendChild(orderLink);
  const failedOrderLink = new Node('TEXT', 'Order link'); failedOrderLink.characters = 'Open Order record  ↗';
  sources.conversationFailure.appendChild(failedOrderLink);
  const messages = [];
  const figma = {
    root: rootNode,
    get currentPage() { return currentPage; },
    ui: { onmessage: null, postMessage: value => messages.push(value) },
    showUI() {},
    async setCurrentPageAsync(page) { currentPage = page; },
    async loadFontAsync() {},
    async getNodeByIdAsync(id) {
      if (rootNode.id === id) return rootNode;
      return rootNode.findAll(n => n.id === id)[0] ?? null;
    },
    createPage() { const p = new Node('PAGE', 'New Page'); rootNode.appendChild(p); return p; },
    createSection() { const s = new Node('SECTION', 'Section'); currentPage.appendChild(s); return s; },
    createFrame() { const f = new Node('FRAME', 'Frame'); currentPage.appendChild(f); return f; },
    createText() { const t = new Node('TEXT', 'Text'); t.width = 100; t.height = 20; currentPage.appendChild(t); return t; },
  };
  vm.runInNewContext(bundle, { figma, __html__: '<html></html>', console });
  async function send(message) { const start = messages.length; await figma.ui.onmessage(message); return messages.slice(start).find(m => m.type === 'report')?.text ?? ''; }
  const page = () => rootNode.children.find(n => n.name === core.TARGET_PAGE);
  return { figma, rootNode, sourcePage, sources, sourceFrames, sections, page, send, Node };
}

test('exact writable page guard and all eight specifications', () => {
  assert.equal(core.FLOWS.length, 8);
  for (const page of core.PROTECTED_PAGES) assert.throws(() => core.assertWritablePageName(page));
  assert.doesNotThrow(() => core.assertWritablePageName(core.TARGET_PAGE));
  for (const flow of core.FLOWS) assert.deepEqual(core.graphErrors(flow), []);
  assert.equal(core.FLOWS[6].edges.some(e => e.to === 'target'), false);
  assert.equal(core.FLOWS[0].edges[0].control, core.FLOW1_BOARD.continue.name);
});

test('Inspect actions are read-only and source resolver uses exact names', async () => {
  const env = environment();
  const before = env.rootNode.children.length;
  assert.match(await env.send({ type: 'inspect-sources' }), /FOUND 3D \/ Conversations \/ Default/);
  assert.match(await env.send({ type: 'inspect-api' }), /Write formal flow starts: UNSUPPORTED/);
  assert.equal(env.rootNode.children.length, before);
  assert.equal(env.page(), undefined);
});

test('missing, duplicate and wrong-type sources block before write', async () => {
  for (const mutation of ['missing', 'duplicate', 'wrong']) {
    const env = environment();
    const source = env.sources.conversationDefault;
    if (mutation === 'missing') source.remove();
    if (mutation === 'duplicate') env.sections.get('02 — Conversations').appendChild(source.clone());
    if (mutation === 'wrong') source.type = 'TEXT';
    const report = await env.send({ type: 'build-flow', id: 1 });
    assert.match(report, /BLOCKED/);
    assert.equal(env.page(), undefined);
  }
});

test('all eight flows build with reactions, rerun safely, and validate', async () => {
  const env = environment();
  const protectedSnapshot = env.rootNode.children.map(p => [p.id, p.children.length]);
  for (let id = 1; id <= 8; id++) assert.match(await env.send({ type: 'build-flow', id }), /Built/);
  const page = env.page();
  assert.ok(page);
  const flow1 = page.children.find(n => n.name === core.flowSectionName(1));
  const manual = new env.Node('TEXT', 'Manual user note'); flow1.appendChild(manual);
  const old = flow1.children.find(n => n.name === core.cloneName(1, 'default'));
  const priorControl = flow1.children.find(n => n.name === core.FLOW1_BOARD.continue.name);
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /Built/);
  const replacement = page.children.find(n => n.name === core.flowSectionName(1));
  assert.notEqual(replacement.id, flow1.id);
  assert.equal(replacement.children.filter(n => n.name === core.cloneName(1, 'default')).length, 1);
  assert.equal(replacement.children.filter(n => n.name === core.FLOW1_BOARD.continue.name).length, 1);
  assert.match(flow1.name, /^ARCHIVE/);
  assert.ok(flow1.children.includes(manual));
  assert.ok(flow1.children.includes(old));
  assert.equal(old.removed, false);
  assert.equal(priorControl.removed, false);
  const report = await env.send({ type: 'validate' });
  assert.match(report, /Overall: PASS/);
  assert.match(report, /Broken\/prohibited destinations: 0/);
  for (const [id, count] of protectedSnapshot) assert.equal(env.rootNode.children.find(p => p.id === id).children.length, count);
});

test('Flow 2 stages four 03D clones and uses external authorization/result controls plus real Open Order link', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const flow1 = env.page().children.find(n => n.name === core.flowSectionName(1));
  const flow1Ids = [flow1.id, ...flow1.children.map(n => n.id)];
  const protectedDigest = () => JSON.stringify(env.rootNode.children.filter(p => core.PROTECTED_PAGES.includes(p.name))
    .map(p => [p.id, p.name, p.children.map(n => [n.id, n.name, n.children.map(c => [c.id, c.name])])]));
  const before = protectedDigest();
  const result = await env.send({ type: 'build-flow', id: 2 });
  assert.match(result, /Open Order → Reservation Confirmed: PRODUCT CONTROL/);
  const section = env.page().children.find(n => n.name === core.flowSectionName(2));
  const frames = ['Awaiting Confirmation', 'Processing', 'Confirmed Result', 'Reservation Confirmed']
    .map(key => section.children.find(n => n.name === core.cloneName(2, key)));
  assert.ok(frames.every(Boolean));
  for (let i = 0; i < frames.length - 1; i++) assert.ok(frames[i].x + frames[i].width < frames[i + 1].x);
  const confirmation = section.children.find(n => n.name === core.FLOW2_BOARD.confirmation.name);
  const processing = section.children.find(n => n.name === core.FLOW2_BOARD.processingComplete.name);
  const link = frames[2].findAll(n => n.name === 'Order link')[0];
  assert.equal(confirmation.reactions[0].actions[0].destinationId, frames[1].id);
  assert.equal(processing.reactions[0].actions[0].destinationId, frames[2].id);
  assert.equal(link.reactions[0].actions[0].destinationId, frames[3].id);
  assert.equal(env.sources.conversationConfirmed.findAll(n => n.name === 'Order link')[0].reactions.length, 0);
  assert.equal(section.children.some(n => n.name === core.FLOW2_BOARD.orderControl.name), false);
  for (const item of [core.FLOW2_BOARD.step1, core.FLOW2_BOARD.proposalBoundary, core.FLOW2_BOARD.step2,
    core.FLOW2_BOARD.processingNote, core.FLOW2_BOARD.step3, core.FLOW2_BOARD.step4,
    core.FLOW2_BOARD.orderBoundary, core.FLOW2_BOARD.deliveryBoundary, core.FLOW2_BOARD.backendBoundary, core.FLOW2_BOARD.end]) {
    assert.equal(section.children.find(n => n.name === item.name)?.characters, item.text);
  }
  const report = await env.send({ type: 'validate' });
  assert.match(report, /Flow 1 — Product Availability: PASS/);
  assert.match(report, /Flow 2 — Purchase Success: PASS/);
  assert.match(report, /Open Order source: PRODUCT CONTROL/);
  assert.match(report, /Broken\/prohibited destinations: 0/);
  for (let id = 3; id <= 8; id++) assert.match(report, new RegExp(`Flow ${id} .*: NOT BUILT`));
  assert.match(report, /Overall: INCOMPLETE/);
  assert.deepEqual([flow1.id, ...flow1.children.map(n => n.id)], flow1Ids);
  assert.equal(protectedDigest(), before);
});

test('Flow 2 resolves only its four exact canonical 03D source frames before writing', async () => {
  for (const problem of ['missing', 'duplicate', 'wrong type']) {
    const env = environment();
    const source = env.sources.conversationProcessing;
    if (problem === 'missing') source.remove();
    if (problem === 'duplicate') env.sections.get('02 — Conversations').appendChild(source.clone());
    if (problem === 'wrong type') source.type = 'TEXT';
    assert.match(await env.send({ type: 'build-flow', id: 2 }), /BLOCKED: 03D preflight conversationProcessing/);
    assert.equal(env.page(), undefined);
  }
  const env = environment();
  env.sources.conversationDefault.remove(); // Not a Flow 2 input.
  assert.match(await env.send({ type: 'build-flow', id: 2 }), /Built/);
});

test('Flow 2 falls back to an external Open Order control when the source link is absent, hidden, or already reacts', async () => {
  for (const reason of ['absent', 'hidden', 'source reaction']) {
    const env = environment();
    const sourceLink = env.sources.conversationConfirmed.findAll(n => n.name === 'Order link')[0];
    if (reason === 'absent') sourceLink.remove();
    else if (reason === 'hidden') sourceLink.visible = false;
    else sourceLink.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.orderConfirmed.id, transition: null },
    ] }];
    await env.send({ type: 'build-flow', id: 1 });
    assert.match(await env.send({ type: 'build-flow', id: 2 }), /Open Order → Reservation Confirmed: PROTOTYPE CONTROL/);
    const section = env.page().children.find(n => n.name === core.flowSectionName(2));
    const order = section.children.find(n => n.name === core.cloneName(2, 'Reservation Confirmed'));
    const control = section.children.find(n => n.name === core.FLOW2_BOARD.orderControl.name);
    assert.equal(control.reactions[0].actions[0].destinationId, order.id);
    assert.equal(section.children.some(n => n.name === core.FLOW2_BOARD.orderSource.name), false);
    if (reason === 'source reaction') assert.deepEqual(section.children.find(n => n.name === core.cloneName(2, 'Confirmed Result'))
      .findAll(n => n.name === 'Order link')[0].reactions, sourceLink.reactions);
    assert.match(await env.send({ type: 'validate' }), /Open Order source: PROTOTYPE CONTROL/);
  }
});

test('Flow 2 post-swap failure restores old canonical and removes only staging', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  await env.send({ type: 'build-flow', id: 2 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(2));
  const lookup = env.figma.getNodeByIdAsync;
  env.figma.getNodeByIdAsync = async id => {
    const current = env.page().children.find(n => n.name === core.flowSectionName(2));
    if (current && current.id !== old.id && current.children.some(n => n.id === id && n.name === core.cloneName(2, 'Processing'))) return null;
    return lookup(id);
  };
  assert.match(await env.send({ type: 'build-flow', id: 2 }), /BLOCKED: Flow 2 canonical validation failed/);
  env.figma.getNodeByIdAsync = lookup;
  assert.equal(old.name, core.flowSectionName(2));
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(2)).length, 1);
  assert.equal(env.page().children.some(n => n.name === `${core.flowSectionName(2)} / staging`), false);
});

test('Flow 2 writes no node in 03A–03D and does not change Flow 1 or its archive', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const flow1 = env.page().children.find(n => n.name === core.flowSectionName(1));
  const manual = new env.Node('TEXT', 'Manual Flow 1 archive marker'); flow1.appendChild(manual);
  await env.send({ type: 'build-flow', id: 1 });
  const digest = node => [node.id, node.type, node.name, node.x, node.y, node.width, node.height,
    node.characters, node.fills, node.reactions, node.children.map(digest)];
  const protectedBefore = JSON.stringify(env.rootNode.children.filter(p => core.PROTECTED_PAGES.includes(p.name)).map(digest));
  const flow1Before = JSON.stringify(env.page().children.filter(n => n.name === core.flowSectionName(1) || n.name.startsWith('ARCHIVE — Flow 1')).map(digest));
  assert.match(await env.send({ type: 'build-flow', id: 2 }), /Built/);
  const archive = env.page().children.find(n => n.name.startsWith('ARCHIVE — Flow 1'));
  const flow2 = env.page().children.find(n => n.name === core.flowSectionName(2));
  assert.ok(flow2.y >= archive.y + archive.height + 180);
  assert.equal(JSON.stringify(env.rootNode.children.filter(p => core.PROTECTED_PAGES.includes(p.name)).map(digest)), protectedBefore);
  assert.equal(JSON.stringify(env.page().children.filter(n => n.name === core.flowSectionName(1) || n.name.startsWith('ARCHIVE — Flow 1')).map(digest)), flow1Before);
});

test('Flow 2 accepts Figma-normalized no-animation reactions on all progression controls', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const setter = env.Node.prototype.setReactionsAsync;
  env.Node.prototype.setReactionsAsync = async function(value) {
    if (![core.FLOW2_BOARD.confirmation.name, core.FLOW2_BOARD.processingComplete.name, 'Order link'].includes(this.name)) return setter.call(this, value);
    const reaction = structuredClone(value[0]);
    delete reaction.actions[0].transition;
    reaction.action = { ...reaction.actions[0], preserveScrollPosition: false };
    this.reactions = [reaction];
  };
  assert.match(await env.send({ type: 'build-flow', id: 2 }), /Built/);
  env.Node.prototype.setReactionsAsync = setter;
  assert.match(await env.send({ type: 'validate' }), /Flow 2 — Purchase Success: PASS/);
});

test('Flow 2 staging rejection leaves previous canonical untouched and removes staging', async () => {
  for (const problem of ['wrong destination', 'animated', 'mixed actions']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 1 });
    await env.send({ type: 'build-flow', id: 2 });
    const old = env.page().children.find(n => n.name === core.flowSectionName(2));
    const oldIds = old.children.map(n => n.id);
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (this.name !== core.FLOW2_BOARD.confirmation.name) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (problem === 'wrong destination') reaction.actions[0].destinationId = old.children.find(n => n.name === core.cloneName(2, 'Processing')).id;
      if (problem === 'animated') reaction.actions[0].transition = { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.2 };
      if (problem === 'mixed actions') reaction.actions.push({ type: 'BACK' });
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 2 }), /BLOCKED: Flow 2 staging validation failed/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.equal(old.name, core.flowSectionName(2));
    assert.deepEqual(old.children.map(n => n.id), oldIds);
    assert.equal(env.page().children.some(n => n.name === `${core.flowSectionName(2)} / staging`), false);
  }
});

test('Flow 2 archives manual or mixed old content; clean rerun removes only prior generated section', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  await env.send({ type: 'build-flow', id: 2 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(2));
  const manual = new env.Node('TEXT', 'Manual Flow 2 note'); old.appendChild(manual);
  const oldLink = old.children.find(n => n.name === core.cloneName(2, 'Confirmed Result')).findAll(n => n.name === 'Order link')[0];
  oldLink.reactions[0].actions.push({ type: 'BACK' });
  const oldReaction = structuredClone(oldLink.reactions);
  assert.match(await env.send({ type: 'build-flow', id: 2 }), /old section archived/);
  assert.match(old.name, /^ARCHIVE — Flow 2/);
  assert.ok(old.children.includes(manual));
  assert.deepEqual(oldLink.reactions, oldReaction);
  const current = env.page().children.find(n => n.name === core.flowSectionName(2));
  assert.notEqual(current.id, old.id);
  assert.match(await env.send({ type: 'build-flow', id: 2 }), /removed after validation/);
  assert.equal(current.removed, true);
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(2)).length, 1);
  assert.ok(env.page().children.includes(old));
});

test('Flow 2 validation rejects lost authorization, order distinction, and Order destination without writes', async () => {
  for (const problem of ['authorization', 'order distinction', 'destination']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 1 });
    await env.send({ type: 'build-flow', id: 2 });
    const section = env.page().children.find(n => n.name === core.flowSectionName(2));
    if (problem === 'authorization') section.children.find(n => n.name === core.FLOW2_BOARD.confirmation.name).remove();
    if (problem === 'order distinction') section.children.find(n => n.name === core.FLOW2_BOARD.orderBoundary.name).remove();
    if (problem === 'destination') section.children.find(n => n.name === core.cloneName(2, 'Confirmed Result')).findAll(n => n.name === 'Order link')[0].reactions[0].actions[0].destinationId = env.sources.orderConfirmed.id;
    const before = section.children.map(n => n.id).join(',');
    assert.match(await env.send({ type: 'validate' }), /Flow 2 — Purchase Success: FAIL/);
    assert.equal(section.children.map(n => n.id).join(','), before);
  }
});

test('Flow 1 uses fresh 03D clones and archives manual old content', async () => {
  const env = environment();
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /fresh 03D product clones/);
  const page = env.page();
  assert.deepEqual(page.children.map(n => n.name).sort(), ['00 — Prototype Principles', core.flowSectionName(1), '09 — Prototype Validation'].sort());
  const section = page.children.find(n => n.name === core.flowSectionName(1));
  const first = section.children.find(n => n.name === core.cloneName(1, 'default'));
  const second = section.children.find(n => n.name === core.cloneName(1, 'support'));
  const row = first.findAll(n => n.name === 'Conversation row / 1')[0];
  const productDigest = node => JSON.stringify([node.type, node.name, node.width, node.height, node.characters, node.fills,
    node.children.map(productDigest)]);
  assert.equal(productDigest(first).replace(core.cloneName(1, 'default'), env.sources.conversationDefault.name), productDigest(env.sources.conversationDefault));
  assert.equal(productDigest(second).replace(core.cloneName(1, 'support'), env.sources.conversationSupport.name), productDigest(env.sources.conversationSupport));
  const originalIds = [first.id, second.id];
  const control = section.children.find(n => n.name === core.FLOW1_BOARD.continue.name);
  assert.equal(control.type, 'FRAME');
  assert.equal(control.visible, true);
  assert.equal(control.reactions[0].trigger.type, 'ON_CLICK');
  assert.equal(control.reactions[0].actions[0].destinationId, second.id);
  assert.equal(control.reactions[0].actions[0].transition, null);
  assert.ok(control.x >= first.x + first.width && control.x + control.width <= second.x);
  assert.equal(row.reactions.length, 0);
  for (const item of [core.FLOW1_BOARD.step1, core.FLOW1_BOARD.step1Note, core.FLOW1_BOARD.step2,
    core.FLOW1_BOARD.productBoundary, core.FLOW1_BOARD.inventoryBoundary, core.FLOW1_BOARD.end]) {
    assert.equal(section.children.find(n => n.name === item.name)?.characters, item.text);
  }
  const manual = new env.Node('TEXT', 'Manual 03E note'); section.appendChild(manual);
  row.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: second.id, navigation: 'NAVIGATE', transition: null }] }];
  const legacy = new env.Node('TEXT', core.FLOW1_BOARD.legacyNote); section.appendChild(legacy);
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /archived with manual/);
  const replacement = page.children.find(n => n.name === core.flowSectionName(1));
  const freshFirst = replacement.children.find(n => n.name === core.cloneName(1, 'default'));
  assert.notDeepEqual([freshFirst.id, replacement.children.find(n => n.name === core.cloneName(1, 'support')).id], originalIds);
  assert.equal(freshFirst.findAll(n => n.name === 'Conversation row / 1')[0].reactions.length, 0);
  assert.equal(row.reactions[0].actions[0].destinationId, second.id);
  assert.equal(productDigest(first).replace(core.cloneName(1, 'default'), env.sources.conversationDefault.name), productDigest(env.sources.conversationDefault));
  assert.equal(productDigest(second).replace(core.cloneName(1, 'support'), env.sources.conversationSupport.name), productDigest(env.sources.conversationSupport));
  assert.ok(section.children.includes(manual));
  assert.match(section.name, /^ARCHIVE/);
  assert.equal(replacement.children.some(n => n.name === core.FLOW1_BOARD.legacyNote), false);
  assert.match(await env.send({ type: 'validate' }), /Flow 1 — Product Availability: PASS/);
});

test('Flow 1 reaction-setter failure leaves old clone and row reaction intact', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const section = env.page().children.find(n => n.name === core.flowSectionName(1));
  const first = section.children.find(n => n.name === core.cloneName(1, 'default'));
  const second = section.children.find(n => n.name === core.cloneName(1, 'support'));
  const row = first.findAll(n => n.name === 'Conversation row / 1')[0];
  row.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: second.id, navigation: 'NAVIGATE', transition: null }] }];
  const previousControl = section.children.find(n => n.name === core.FLOW1_BOARD.continue.name);
  const originalSetter = env.Node.prototype.setReactionsAsync;
  env.Node.prototype.setReactionsAsync = async () => { throw new Error('Figma reaction unavailable'); };
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /BLOCKED/);
  env.Node.prototype.setReactionsAsync = originalSetter;
  assert.ok(section.children.includes(first));
  assert.ok(section.children.includes(second));
  assert.ok(section.children.includes(previousControl));
  assert.equal(row.reactions[0].actions[0].destinationId, second.id);
  assert.equal(section.children.some(n => n.name.startsWith('STAGING /')), false);
});

test('Flow 1 never calls row reaction setter and safely removes clean old section', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const section = env.page().children.find(n => n.name === core.flowSectionName(1));
  const first = section.children.find(n => n.name === core.cloneName(1, 'default'));
  const second = section.children.find(n => n.name === core.cloneName(1, 'support'));
  const row = first.findAll(n => n.name === 'Conversation row / 1')[0];
  row.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: second.id, navigation: 'NAVIGATE', transition: null }] }];
  const oldControl = section.children.find(n => n.name === core.FLOW1_BOARD.continue.name);
  const originalSetter = env.Node.prototype.setReactionsAsync;
  env.Node.prototype.setReactionsAsync = async function(value) {
    if (this.name === 'Conversation row / 1') throw new Error('row setter unavailable');
    return originalSetter.call(this, value);
  };
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /removed after validation/);
  env.Node.prototype.setReactionsAsync = originalSetter;
  assert.equal(section.removed, true);
  assert.ok(section.children.includes(oldControl));
  assert.equal(row.reactions[0].actions[0].destinationId, second.id);
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(1)).length, 1);
});

test('mixed old row reaction is never edited and its section is archived after fresh replacement', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(1));
  const oldDefault = old.children.find(n => n.name === core.cloneName(1, 'default'));
  const oldSupport = old.children.find(n => n.name === core.cloneName(1, 'support'));
  const row = oldDefault.findAll(n => n.name === 'Conversation row / 1')[0];
  row.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', destinationId: oldSupport.id, navigation: 'NAVIGATE', transition: null },
    { type: 'NODE', destinationId: env.sources.conversationSupport.id, navigation: 'NAVIGATE', transition: null },
  ] }];
  const before = structuredClone(row.reactions);
  const setter = env.Node.prototype.setReactionsAsync;
  env.Node.prototype.setReactionsAsync = async function(value) {
    if (this === row) throw new Error('Old row must not be edited');
    return setter.call(this, value);
  };
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /archived with manual\/ambiguous content/);
  env.Node.prototype.setReactionsAsync = setter;
  assert.deepEqual(row.reactions, before);
  assert.match(old.name, /^ARCHIVE/);
  const fresh = env.page().children.find(n => n.name === core.flowSectionName(1));
  assert.notEqual(fresh.id, old.id);
  assert.equal(fresh.children.find(n => n.name === core.cloneName(1, 'default')).findAll(n => n.name === 'Conversation row / 1')[0].reactions.length, 0);
  assert.match(await env.send({ type: 'validate' }), /Broken\/prohibited destinations: 0/);
});

test('Flow 1 accepts Figma readback with absent/null transition and deprecated action mirror', async () => {
  for (const shape of ['absent', 'null', 'mirror', 'legacy action only']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 1 });
    const old = env.page().children.find(n => n.name === core.flowSectionName(1));
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (this.name !== core.FLOW1_BOARD.continue.name) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (shape !== 'null') delete reaction.actions[0].transition;
      if (shape === 'mirror') reaction.action = { ...reaction.actions[0], preserveScrollPosition: false, resetScrollPosition: true };
      if (shape === 'legacy action only') { reaction.action = reaction.actions[0]; delete reaction.actions; }
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 1 }), /Built/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.equal(old.removed, true);
    assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(1)).length, 1);
    assert.match(await env.send({ type: 'validate' }), /Flow 1 — Product Availability: PASS/);
  }
});

test('Flow 1 staging rejects animated, wrong-destination, wrong-trigger, wrong-action, and competing reactions', async () => {
  for (const problem of ['DISSOLVE', 'SMART_ANIMATE', 'destination', 'trigger', 'navigation', 'overlay', 'scroll', 'back', 'multiple', 'multiple actions', 'conflicting mirror']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 1 });
    const old = env.page().children.find(n => n.name === core.flowSectionName(1));
    const oldIds = old.children.map(n => n.id);
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (this.name !== core.FLOW1_BOARD.continue.name) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      const action = reaction.actions[0];
      if (problem === 'DISSOLVE' || problem === 'SMART_ANIMATE') action.transition = { type: problem, easing: { type: 'EASE_OUT' }, duration: 0.2 };
      if (problem === 'destination') action.destinationId = env.sources.conversationSupport.id;
      if (problem === 'trigger') reaction.trigger.type = 'ON_HOVER';
      if (problem === 'navigation') action.navigation = 'SWAP';
      if (problem === 'overlay') action.navigation = 'OVERLAY';
      if (problem === 'scroll') action.navigation = 'SCROLL_TO';
      if (problem === 'back') reaction.actions[0] = { type: 'BACK' };
      if (problem === 'multiple actions') reaction.actions.push({ type: 'BACK' });
      if (problem === 'multiple') this.reactions = [reaction, structuredClone(reaction)];
      else {
        if (problem === 'conflicting mirror') reaction.action = { ...action, destinationId: env.sources.conversationSupport.id };
        this.reactions = [reaction];
      }
    };
    const result = await env.send({ type: 'build-flow', id: 1 });
    env.Node.prototype.setReactionsAsync = setter;
    assert.match(result, /BLOCKED: Flow 1 staging validation failed/);
    assert.match(result, /FLOW 1 STAGING REACTION DIAGNOSTIC/);
    assert.match(result, /Failure reason:/);
    assert.match(result, /Raw Figma reactions:/);
    assert.match(result, /trigger.type=/);
    assert.match(result, /actions.count=/);
    assert.match(result, /destinationId=/);
    assert.match(result, /transition=/);
    assert.equal(old.name, core.flowSectionName(1));
    assert.deepEqual(old.children.map(n => n.id), oldIds);
    assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  }
});

test('Phase 3E scenario reaction on staging product row is rejected without editing old Flow 1', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(1));
  const setter = env.Node.prototype.setReactionsAsync;
  env.Node.prototype.setReactionsAsync = async function(value) {
    if (this.name === core.FLOW1_BOARD.continue.name) {
      const stage = this.parent;
      const first = stage.children.find(n => n.name === core.cloneName(1, 'default'));
      const second = stage.children.find(n => n.name === core.cloneName(1, 'support'));
      first.findAll(n => n.name === 'Conversation row / 1')[0].reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
        { type: 'NODE', navigation: 'NAVIGATE', destinationId: second.id, transition: null },
      ] }];
    }
    return setter.call(this, value);
  };
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /BLOCKED: Flow 1 staging validation failed/);
  env.Node.prototype.setReactionsAsync = setter;
  assert.equal(old.name, core.flowSectionName(1));
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
});

test('fresh Flow 1 clones preserve legitimate 03D reactions but add no product reaction', async () => {
  const env = environment();
  const sourceRow = env.sources.conversationDefault.findAll(n => n.name === 'Conversation row / 1')[0];
  sourceRow.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', destinationId: env.sources.conversationSupport.id, navigation: 'NAVIGATE', transition: null },
  ] }];
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /Built/);
  const section = env.page().children.find(n => n.name === core.flowSectionName(1));
  const cloneRow = section.children.find(n => n.name === core.cloneName(1, 'default')).findAll(n => n.name === 'Conversation row / 1')[0];
  const support = section.children.find(n => n.name === core.cloneName(1, 'support'));
  assert.deepEqual(cloneRow.reactions, sourceRow.reactions);
  assert.notEqual(cloneRow.reactions[0].actions[0].destinationId, support.id);
  assert.match(await env.send({ type: 'validate' }), /Flow 1 — Product Availability: PASS/);
});

test('staging validation failure removes only staging and preserves old canonical Flow 1', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(1));
  const oldIds = old.children.map(n => n.id);
  const lookup = env.figma.getNodeByIdAsync;
  env.figma.getNodeByIdAsync = async id => oldIds.includes(id) ? lookup(id) : null;
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /BLOCKED: Flow 1 staging validation failed/);
  env.figma.getNodeByIdAsync = lookup;
  assert.equal(old.name, core.flowSectionName(1));
  assert.deepEqual(old.children.map(n => n.id), oldIds);
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
});

test('post-swap validation failure restores the previous canonical section', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(1));
  const lookup = env.figma.getNodeByIdAsync;
  env.figma.getNodeByIdAsync = async id => {
    const canonical = env.page().children.find(n => n.name === core.flowSectionName(1));
    if (canonical && canonical.id !== old.id && canonical.children.some(n => n.id === id && n.name === core.cloneName(1, 'support'))) return null;
    return lookup(id);
  };
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /BLOCKED: Flow 1 canonical validation failed/);
  env.figma.getNodeByIdAsync = lookup;
  assert.equal(old.name, core.flowSectionName(1));
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(1)).length, 1);
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
});

test('incremental validator reports unbuilt flows without treating them as broken destinations', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const before = JSON.stringify(env.page().children.map(s => [s.id, s.name, s.children.map(n => n.id)]));
  const report = await env.send({ type: 'validate' });
  assert.match(report, /Flow 1 — Product Availability: PASS/);
  for (let id = 2; id <= 8; id++) assert.match(report, new RegExp(`Flow ${id} .*: NOT BUILT`));
  assert.match(report, /Broken\/prohibited destinations: 0/);
  assert.match(report, /Overall: INCOMPLETE/);
  assert.equal(JSON.stringify(env.page().children.map(s => [s.id, s.name, s.children.map(n => n.id)])), before);
});

test('manual node nested in old product clone is archived rather than deleted', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(1));
  const oldClone = old.children.find(n => n.name === core.cloneName(1, 'default'));
  const manual = new env.Node('TEXT', 'Manual nested annotation'); oldClone.appendChild(manual);
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /archived with manual/);
  assert.match(old.name, /^ARCHIVE/);
  assert.ok(oldClone.children.includes(manual));
  assert.equal(manual.removed, false);
});

test('Flow 1 changes no node in protected 03A–03D source pages', async () => {
  const env = environment();
  const digest = node => [node.id, node.type, node.name, node.x, node.y, node.width, node.height,
    node.characters, node.fills, node.reactions, node.children.map(digest)];
  const snapshot = () => JSON.stringify(env.rootNode.children.filter(p => core.PROTECTED_PAGES.includes(p.name)).map(digest));
  const before = snapshot();
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /Built/);
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /Built/);
  assert.equal(snapshot(), before);
});

test('Flow 1 read-only validator rejects missing annotations, hidden control, and old row link', async () => {
  for (const problem of ['step1', 'hidden', 'row', 'destination']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 1 });
    const section = env.page().children.find(n => n.name === core.flowSectionName(1));
    const first = section.children.find(n => n.name === core.cloneName(1, 'default'));
    const second = section.children.find(n => n.name === core.cloneName(1, 'support'));
    const control = section.children.find(n => n.name === core.FLOW1_BOARD.continue.name);
    if (problem === 'step1') section.children.find(n => n.name === core.FLOW1_BOARD.step1.name).remove();
    if (problem === 'hidden') control.visible = false;
    if (problem === 'row') first.findAll(n => n.name === 'Conversation row / 1')[0].reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: second.id, navigation: 'NAVIGATE', transition: null }] }];
    if (problem === 'destination') control.reactions[0].actions[0].destinationId = first.id;
    const before = section.children.map(n => n.id).join(',');
    assert.match(await env.send({ type: 'validate' }), /Flow 1 — Product Availability: FAIL/);
    assert.equal(section.children.map(n => n.id).join(','), before);
  }
});

test('Flow 1 rerun does not build or modify other flow sections or protected pages', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  const page = env.page();
  const unrelated = new env.Node('SECTION', core.flowSectionName(2));
  const manual = new env.Node('FRAME', 'Manual Flow 2 specimen'); unrelated.appendChild(manual); page.appendChild(unrelated);
  const protectedBefore = env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name)).map(n => [n.id, n.name, n.children.map(c => [c.id, c.name])]);
  const otherBefore = [unrelated.id, unrelated.name, manual.id, manual.name, unrelated.children.length];
  assert.match(await env.send({ type: 'build-flow', id: 1 }), /Built/);
  assert.deepEqual([unrelated.id, unrelated.name, manual.id, manual.name, unrelated.children.length], otherBefore);
  assert.ok(unrelated.children.includes(manual));
  assert.equal(page.children.some(n => n.name === core.flowSectionName(3)), false);
  assert.deepEqual(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name)).map(n => [n.id, n.name, n.children.map(c => [c.id, c.name])]), protectedBefore);
});

test('validator catches broken destination and unsafe TARGET/delivery links without writes', async () => {
  const env = environment();
  for (let id = 1; id <= 8; id++) await env.send({ type: 'build-flow', id });
  const page = env.page();
  const section7 = page.children.find(n => n.name === core.flowSectionName(7));
  const analytics = section7.children.find(n => n.name === core.cloneName(7, 'Analytics Valid'));
  const target = section7.children.find(n => n.name === core.cloneName(7, 'TARGET Ready'));
  analytics.findAll(n => n.name === 'Open Forecasts')[0].reactions[0].actions[0].destinationId = target.id;
  const before = JSON.stringify(page.children.map(s => [s.id, s.name, s.children.map(n => [n.id, n.name]) ]));
  const report = await env.send({ type: 'validate' });
  assert.match(report, /Flow 7 — Analytics → Forecasts: FAIL/);
  assert.match(report, /Broken \/ prohibited destinations: FAIL/);
  assert.equal(JSON.stringify(page.children.map(s => [s.id, s.name, s.children.map(n => [n.id, n.name]) ])), before);
});

test('message retry cannot navigate to processing or repeat mutation', async () => {
  const env = environment();
  for (let id = 1; id <= 8; id++) await env.send({ type: 'build-flow', id });
  const section = env.page().children.find(n => n.name === core.flowSectionName(8));
  const delivery = section.children.find(n => n.name === core.cloneName(8, 'Message Delivery Failure'));
  const processing = section.children.find(n => n.name === core.cloneName(8, 'Processing'));
  delivery.findAll(n => n.name === 'Retry message action / focus')[0].reactions[0].actions[0].destinationId = processing.id;
  assert.match(await env.send({ type: 'validate' }), /Flow 8 — Customer Web Chat: FAIL/);
});

test('Flow 3 uses two fresh approved sources, a visible product Order link, and known-failure annotations', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  await env.send({ type: 'build-flow', id: 2 });
  const before = env.page().children.filter(n => [core.flowSectionName(1), core.flowSectionName(2)].includes(n.name))
    .map(n => [n.id, n.name, n.children.map(c => c.id)]);
  assert.match(await env.send({ type: 'build-flow', id: 3 }), /Open Order → Reservation Failed: PRODUCT CONTROL/);
  const section = env.page().children.find(n => n.name === core.flowSectionName(3));
  const known = section.children.find(n => n.name === core.cloneName(3, 'Known Failure'));
  const failed = section.children.find(n => n.name === core.cloneName(3, 'Reservation Failed'));
  assert.ok(known && failed && known.x + known.width < failed.x);
  assert.equal(known.findAll(n => n.name === 'Order link')[0].reactions[0].actions[0].destinationId, failed.id);
  assert.equal(env.sources.conversationFailure.findAll(n => n.name === 'Order link')[0].reactions.length, 0);
  assert.equal(section.children.some(n => n.name === core.FLOW3_BOARD.orderControl.name), false);
  for (const item of [core.FLOW3_BOARD.start, core.FLOW3_BOARD.step1, core.FLOW3_BOARD.confirmedFailure,
    core.FLOW3_BOARD.knownBoundary, core.FLOW3_BOARD.noReconciliation, core.FLOW3_BOARD.step2,
    core.FLOW3_BOARD.orderBoundary, core.FLOW3_BOARD.inventoryBoundary, core.FLOW3_BOARD.recovery, core.FLOW3_BOARD.end]) {
    assert.equal(section.children.find(n => n.name === item.name)?.characters, item.text);
  }
  const report = await env.send({ type: 'validate' });
  assert.match(report, /Flow 1 — Product Availability: PASS/);
  assert.match(report, /Flow 2 — Purchase Success: PASS/);
  assert.match(report, /Flow 3 — Reservation Failure: PASS/);
  assert.match(report, /Known Failure ≠ OUTCOME_UNKNOWN: PASS/);
  assert.match(report, /No reconciliation requirement: PASS/);
  assert.match(report, /Order State ≠ Reservation State: PASS/);
  assert.match(report, /Safe authorized recovery: PASS/);
  assert.match(report, /No automatic retry: PASS/);
  assert.match(report, /Open Order source: PRODUCT CONTROL/);
  for (let id = 4; id <= 8; id++) assert.match(report, new RegExp(`Flow ${id} .*: NOT BUILT`));
  assert.match(report, /Overall: INCOMPLETE/);
  assert.deepEqual(env.page().children.filter(n => [core.flowSectionName(1), core.flowSectionName(2)].includes(n.name))
    .map(n => [n.id, n.name, n.children.map(c => c.id)]), before);
});

test('Flow 3 falls back to an external prototype control if Order link is missing, hidden, or pre-reactive', async () => {
  for (const state of ['missing', 'hidden', 'reactive']) {
    const env = environment();
    const link = env.sources.conversationFailure.findAll(n => n.name === 'Order link')[0];
    if (state === 'missing') link.remove();
    if (state === 'hidden') link.visible = false;
    if (state === 'reactive') link.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.orderFailed.id, transition: null },
    ] }];
    assert.match(await env.send({ type: 'build-flow', id: 3 }), /PROTOTYPE CONTROL/);
    const section = env.page().children.find(n => n.name === core.flowSectionName(3));
    const control = section.children.find(n => n.name === core.FLOW3_BOARD.orderControl.name);
    const order = section.children.find(n => n.name === core.cloneName(3, 'Reservation Failed'));
    assert.equal(control.reactions[0].actions[0].destinationId, order.id);
    assert.match(await env.send({ type: 'validate' }), /Flow 3 — Reservation Failure: PASS/);
  }
});

test('Flow 3 accepts Figma no-animation reaction readback shapes', async () => {
  for (const shape of ['absent', 'null', 'mirror', 'legacy action only']) {
    const env = environment();
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (this.name !== 'Order link') return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (shape !== 'null') delete reaction.actions[0].transition;
      if (shape === 'mirror') reaction.action = { ...reaction.actions[0], preserveScrollPosition: false };
      if (shape === 'legacy action only') { reaction.action = reaction.actions[0]; delete reaction.actions; }
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 3 }), /Built/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.match(await env.send({ type: 'validate' }), /Flow 3 — Reservation Failure: PASS/);
  }
});

test('Flow 3 staging rejects wrong or prohibited destinations, animations, and automatic mutation retry without replacing old canonical', async () => {
  for (const problem of ['unknown', 'reconcile', 'processing', 'confirmed', 'wrong destination', 'animation', 'retry']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 3 });
    const old = env.page().children.find(n => n.name === core.flowSectionName(3));
    const oldIds = old.children.map(n => n.id);
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (this.name !== 'Order link') return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (problem === 'animation') reaction.actions[0].transition = { type: 'DISSOLVE', duration: 0.2 };
      if (problem === 'wrong destination') reaction.actions[0].destinationId = env.sources.orderFailed.id;
      if (problem === 'unknown') reaction.actions[0].destinationId = env.sources.conversationUnknown.id;
      if (problem === 'reconcile') reaction.actions[0].destinationId = env.sources.escalationUnknown.id;
      if (problem === 'processing') reaction.actions[0].destinationId = env.sources.conversationProcessing.id;
      if (problem === 'confirmed') reaction.actions[0].destinationId = env.sources.orderConfirmed.id;
      this.reactions = [reaction];
      if (problem === 'retry') this.parent.parent.children.find(n => n.name === core.FLOW3_BOARD.recovery.name).characters += ' Retry reservation automatically';
    };
    assert.match(await env.send({ type: 'build-flow', id: 3 }), /BLOCKED: Flow 3 staging validation failed/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.equal(old.name, core.flowSectionName(3));
    assert.deepEqual(old.children.map(n => n.id), oldIds);
    assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  }
});

test('Flow 3 archives ambiguous/manual prior content but removes only clean generated prior section', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 3 });
  const first = env.page().children.find(n => n.name === core.flowSectionName(3));
  assert.match(await env.send({ type: 'build-flow', id: 3 }), /removed after validation/);
  assert.equal(first.removed, true);
  const second = env.page().children.find(n => n.name === core.flowSectionName(3));
  const manual = new env.Node('TEXT', 'Manual note'); second.appendChild(manual);
  assert.match(await env.send({ type: 'build-flow', id: 3 }), /old section archived/);
  assert.match(second.name, /^ARCHIVE — Flow 3/);
  assert.equal(manual.removed, false);
  assert.ok(second.children.includes(manual));
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(3)).length, 1);
});

test('Flow 3 archives a mixed old reaction without editing it and preserves legitimate 03D reactions', async () => {
  const env = environment();
  const sourceContext = new env.Node('FRAME', 'Approved context link');
  sourceContext.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.orderFailed.id, transition: null },
  ] }];
  env.sources.conversationFailure.appendChild(sourceContext);
  await env.send({ type: 'build-flow', id: 3 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(3));
  const known = old.children.find(n => n.name === core.cloneName(3, 'Known Failure'));
  const inherited = known.findAll(n => n.name === 'Approved context link')[0];
  assert.deepEqual(inherited.reactions, sourceContext.reactions);
  inherited.reactions[0].actions.push({ type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.conversationUnknown.id, transition: null });
  const before = structuredClone(inherited.reactions);
  assert.match(await env.send({ type: 'build-flow', id: 3 }), /old section archived/);
  assert.match(old.name, /^ARCHIVE — Flow 3/);
  assert.deepEqual(inherited.reactions, before);
  const fresh = env.page().children.find(n => n.name === core.flowSectionName(3));
  const freshInherited = fresh.children.find(n => n.name === core.cloneName(3, 'Known Failure'))
    .findAll(n => n.name === 'Approved context link')[0];
  assert.deepEqual(freshInherited.reactions, sourceContext.reactions);
});

test('Flow 3 post-swap failure restores old canonical; source pages and Flows 1/2 stay unchanged', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 1 });
  await env.send({ type: 'build-flow', id: 2 });
  await env.send({ type: 'build-flow', id: 3 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(3));
  const digest = node => [node.id, node.type, node.name, node.x, node.y, node.width, node.height,
    node.characters, node.fills, node.reactions, node.children.map(digest)];
  const protectedBefore = JSON.stringify(env.rootNode.children.filter(p => core.PROTECTED_PAGES.includes(p.name)).map(digest));
  const otherBefore = JSON.stringify(env.page().children.filter(s => [core.flowSectionName(1), core.flowSectionName(2)].includes(s.name)).map(digest));
  const lookup = env.figma.getNodeByIdAsync;
  env.figma.getNodeByIdAsync = async id => {
    const canonical = env.page().children.find(n => n.name === core.flowSectionName(3));
    if (canonical && canonical.id !== old.id && canonical.children.some(n => n.id === id && n.name === core.cloneName(3, 'Reservation Failed'))) return null;
    return lookup(id);
  };
  assert.match(await env.send({ type: 'build-flow', id: 3 }), /BLOCKED: Flow 3 canonical validation failed/);
  env.figma.getNodeByIdAsync = lookup;
  assert.equal(old.name, core.flowSectionName(3));
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(3)).length, 1);
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  assert.equal(JSON.stringify(env.rootNode.children.filter(p => core.PROTECTED_PAGES.includes(p.name)).map(digest)), protectedBefore);
  assert.equal(JSON.stringify(env.page().children.filter(s => [core.flowSectionName(1), core.flowSectionName(2)].includes(s.name)).map(digest)), otherBefore);
});

test('Flow 3 validator is read-only and rejects source-semantic loss and unauthorized product reactions', async () => {
  for (const problem of ['known boundary', 'reconciliation', 'order distinction', 'retry', 'direct confirmed']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 3 });
    const section = env.page().children.find(n => n.name === core.flowSectionName(3));
    const known = section.children.find(n => n.name === core.cloneName(3, 'Known Failure'));
    const order = section.children.find(n => n.name === core.cloneName(3, 'Reservation Failed'));
    if (problem === 'known boundary') section.children.find(n => n.name === core.FLOW3_BOARD.knownBoundary.name).characters = 'Unknown outcome';
    if (problem === 'reconciliation') section.children.find(n => n.name === core.FLOW3_BOARD.noReconciliation.name).characters = 'Reconciliation required';
    if (problem === 'order distinction') section.children.find(n => n.name === core.FLOW3_BOARD.orderBoundary.name).remove();
    if (problem === 'retry') section.children.find(n => n.name === core.FLOW3_BOARD.recovery.name).characters += ' Retry reservation automatically';
    if (problem === 'direct confirmed') order.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.orderConfirmed.id, transition: null },
    ] }];
    const before = JSON.stringify(env.page().children.map(digest => [digest.id, digest.name, digest.children.map(n => [n.id, n.name, n.reactions])]));
    assert.match(await env.send({ type: 'validate' }), /Flow 3 — Reservation Failure: FAIL/);
    assert.equal(JSON.stringify(env.page().children.map(digest => [digest.id, digest.name, digest.children.map(n => [n.id, n.name, n.reactions])])), before);
    assert.ok(known);
  }
});

test('Flow 4 stages three fresh sources with external handoff controls and leaves Flows 1–3 unchanged', async () => {
  const env = environment();
  for (let id = 1; id <= 3; id++) await env.send({ type: 'build-flow', id });
  const digest = node => [node.id, node.type, node.name, node.characters, node.reactions, node.children.map(digest)];
  const prior = JSON.stringify(env.page().children.filter(n => [1, 2, 3].some(id => n.name === core.flowSectionName(id))).map(digest));
  const protectedPrior = JSON.stringify(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name)).map(digest));
  const result = await env.send({ type: 'build-flow', id: 4 });
  assert.match(result, /Support → Handoff: PROTOTYPE CONTROL; Handoff → Sales: PROTOTYPE CONTROL/);
  const section = env.page().children.find(n => n.name === core.flowSectionName(4));
  const [support, handoff, sales] = ['Support Active', 'Handoff', 'Sales Active']
    .map(key => section.children.find(n => n.name === core.cloneName(4, key)));
  assert.ok(support.x + support.width < handoff.x && handoff.x + handoff.width < sales.x);
  const request = section.children.find(n => n.name === core.FLOW4_BOARD.requestControl.name);
  const accept = section.children.find(n => n.name === core.FLOW4_BOARD.acceptControl.name);
  assert.equal(request.reactions[0].actions[0].destinationId, handoff.id);
  assert.equal(accept.reactions[0].actions[0].destinationId, sales.id);
  for (const item of [core.FLOW4_BOARD.start, core.FLOW4_BOARD.step1, core.FLOW4_BOARD.supportNote,
    core.FLOW4_BOARD.step2, core.FLOW4_BOARD.handlerBoundary, core.FLOW4_BOARD.contextNote,
    core.FLOW4_BOARD.permissionBoundary, core.FLOW4_BOARD.step3, core.FLOW4_BOARD.salesNote,
    core.FLOW4_BOARD.authorizationNote, core.FLOW4_BOARD.end]) {
    assert.equal(section.children.find(n => n.name === item.name)?.characters, item.text);
  }
  const report = await env.send({ type: 'validate' });
  for (let id = 1; id <= 4; id++) assert.match(report, new RegExp(`Flow ${id} .*: PASS`));
  for (let id = 5; id <= 8; id++) assert.match(report, new RegExp(`Flow ${id} .*: NOT BUILT`));
  for (const check of ['Support current handler', 'Previous handler Support', 'Next handler Sales', 'Context preserved',
    'Handoff ≠ Permission Transfer', 'Sales current handler', 'Authorization independently enforced']) {
    assert.ok(report.includes(`${check}: PASS`));
  }
  assert.match(report, /Support → Handoff source: PROTOTYPE CONTROL/);
  assert.match(report, /Handoff → Sales source: PROTOTYPE CONTROL/);
  assert.match(report, /Broken\/prohibited destinations: 0/);
  assert.match(report, /Overall: INCOMPLETE/);
  assert.equal(JSON.stringify(env.page().children.filter(n => [1, 2, 3].some(id => n.name === core.flowSectionName(id))).map(digest)), prior);
  assert.equal(JSON.stringify(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name)).map(digest)), protectedPrior);
});

test('Flow 4 prefers only explicitly labeled product handoff actions and preserves source reactions', async () => {
  const env = environment();
  const request = new env.Node('TEXT', 'Request Sales handoff'); request.characters = 'Request Sales handoff';
  const accept = new env.Node('TEXT', 'Accept handoff'); accept.characters = 'Accept handoff';
  env.sources.conversationSupport.appendChild(request);
  env.sources.conversationHandoff.appendChild(accept);
  for (const key of ['conversationSupport', 'conversationSales']) {
    const componentLabel = new env.Node('TEXT', 'Handler name');
    componentLabel.characters = key === 'conversationSupport' ? 'Support Agent' : 'Sales Agent';
    env.sources[key].appendChild(componentLabel); // A nested Active Handler specimen may repeat this name outside context.
  }
  const unrelated = new env.Node('FRAME', 'Approved context link');
  unrelated.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.conversationSales.id, transition: null },
  ] }];
  env.sources.conversationHandoff.appendChild(unrelated);
  assert.match(await env.send({ type: 'build-flow', id: 4 }), /Support → Handoff: PRODUCT CONTROL; Handoff → Sales: PRODUCT CONTROL/);
  const section = env.page().children.find(n => n.name === core.flowSectionName(4));
  const handoff = section.children.find(n => n.name === core.cloneName(4, 'Handoff'));
  const sales = section.children.find(n => n.name === core.cloneName(4, 'Sales Active'));
  const support = section.children.find(n => n.name === core.cloneName(4, 'Support Active'));
  assert.equal(support.findAll(n => n.name === 'Request Sales handoff')[0].reactions[0].actions[0].destinationId, handoff.id);
  assert.equal(handoff.findAll(n => n.name === 'Accept handoff')[0].reactions[0].actions[0].destinationId, sales.id);
  assert.deepEqual(handoff.findAll(n => n.name === 'Approved context link')[0].reactions, unrelated.reactions);
  assert.equal(request.reactions.length, 0);
  assert.equal(accept.reactions.length, 0);
  assert.equal(section.children.some(n => n.name === core.FLOW4_BOARD.requestControl.name || n.name === core.FLOW4_BOARD.acceptControl.name), false);
  assert.match(await env.send({ type: 'validate' }), /Flow 4 — Support → Sales Handoff: PASS/);
});

test('Flow 4 falls back when a candidate product action is hidden, pre-reactive, or semantically unrelated', async () => {
  for (const state of ['hidden request', 'reactive request', 'hidden acceptance', 'unrelated text']) {
    const env = environment();
    const request = new env.Node('TEXT', 'Request Sales handoff'); request.characters = 'Request Sales handoff';
    const accept = new env.Node('TEXT', 'Accept handoff'); accept.characters = 'Accept handoff';
    env.sources.conversationSupport.appendChild(request);
    env.sources.conversationHandoff.appendChild(accept);
    if (state === 'hidden request') request.visible = false;
    if (state === 'reactive request') request.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.conversationHandoff.id, transition: null },
    ] }];
    if (state === 'hidden acceptance') accept.visible = false;
    if (state === 'unrelated text') request.characters = 'Next safe step';
    const result = await env.send({ type: 'build-flow', id: 4 });
    assert.match(result, /Built/);
    if (state === 'hidden acceptance') assert.match(result, /Handoff → Sales: PROTOTYPE CONTROL/);
    else assert.match(result, /Support → Handoff: PROTOTYPE CONTROL/);
    assert.match(await env.send({ type: 'validate' }), /Flow 4 — Support → Sales Handoff: PASS/);
  }
});

test('Flow 4 accepts Figma no-animation reaction normalization on both external controls', async () => {
  for (const shape of ['absent', 'null', 'mirror', 'legacy action only']) {
    const env = environment();
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (![core.FLOW4_BOARD.requestControl.name, core.FLOW4_BOARD.acceptControl.name].includes(this.name)) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (shape !== 'null') delete reaction.actions[0].transition;
      if (shape === 'mirror') reaction.action = { ...reaction.actions[0], preserveScrollPosition: false };
      if (shape === 'legacy action only') { reaction.action = reaction.actions[0]; delete reaction.actions; }
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 4 }), /Built/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.match(await env.send({ type: 'validate' }), /Flow 4 — Support → Sales Handoff: PASS/);
  }
});

test('Flow 4 staging rejects wrong destinations, animation, permission grant, and unrelated internal reaction', async () => {
  for (const problem of ['skip handoff', 'wrong sales', 'animation', 'permission grant', 'unrelated product node']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 4 });
    const old = env.page().children.find(n => n.name === core.flowSectionName(4));
    const oldIds = old.children.map(n => n.id);
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (![core.FLOW4_BOARD.requestControl.name, core.FLOW4_BOARD.acceptControl.name].includes(this.name)) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (problem === 'skip handoff' && this.name === core.FLOW4_BOARD.requestControl.name) reaction.actions[0].destinationId =
        this.parent.children.find(n => n.name === core.cloneName(4, 'Sales Active')).id;
      if (problem === 'wrong sales' && this.name === core.FLOW4_BOARD.acceptControl.name) reaction.actions[0].destinationId = env.sources.conversationSales.id;
      if (problem === 'animation') reaction.actions[0].transition = { type: 'DISSOLVE', duration: 0.2 };
      this.reactions = [reaction];
      if (this.name === core.FLOW4_BOARD.acceptControl.name && problem === 'permission grant')
        this.parent.children.find(n => n.name === core.FLOW4_BOARD.permissionBoundary.name).characters = 'Handoff grants Sales permissions.';
      if (this.name === core.FLOW4_BOARD.acceptControl.name && problem === 'unrelated product node') {
        const support = this.parent.children.find(n => n.name === core.cloneName(4, 'Support Active'));
        support.findAll(n => n.name === 'Order heading')[0].reactions = structuredClone(value);
      }
    };
    assert.match(await env.send({ type: 'build-flow', id: 4 }), /BLOCKED: Flow 4 staging validation failed/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.equal(old.name, core.flowSectionName(4));
    assert.deepEqual(old.children.map(n => n.id), oldIds);
    assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  }
});

test('Flow 4 validator is read-only and rejects missing Handoff, handler/context loss, and permission escalation', async () => {
  for (const problem of ['handoff missing', 'support handler', 'previous handler', 'context', 'conversation thread', 'sales handler', 'permission']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 4 });
    const section = env.page().children.find(n => n.name === core.flowSectionName(4));
    const support = section.children.find(n => n.name === core.cloneName(4, 'Support Active'));
    const handoff = section.children.find(n => n.name === core.cloneName(4, 'Handoff'));
    const sales = section.children.find(n => n.name === core.cloneName(4, 'Sales Active'));
    if (problem === 'handoff missing') handoff.remove();
    if (problem === 'support handler') support.findAll(n => n.name === 'Handler name')[0].characters = 'Sales Agent';
    if (problem === 'previous handler') handoff.findAll(n => n.name === 'Semantic copy')[0].characters = 'Sales Agent → Sales Agent. Reason unclear.';
    if (problem === 'context') handoff.findAll(n => n.name === 'Customer identity')[0].characters = 'Different customer';
    if (problem === 'conversation thread') handoff.findAll(n => n.name === 'Message Thread')[0].remove();
    if (problem === 'sales handler') sales.findAll(n => n.name === 'Handler name')[0].characters = 'Support Agent';
    if (problem === 'permission') section.children.find(n => n.name === core.FLOW4_BOARD.permissionBoundary.name).characters = 'Handoff grants Sales permissions.';
    const snapshot = JSON.stringify(env.page().children.map(s => [s.id, s.name, s.children.map(n => [n.id, n.name, n.reactions])]));
    assert.match(await env.send({ type: 'validate' }), /Flow 4 — Support → Sales Handoff: FAIL/);
    assert.equal(JSON.stringify(env.page().children.map(s => [s.id, s.name, s.children.map(n => [n.id, n.name, n.reactions])])), snapshot);
  }
});

test('Flow 4 staging blocks a source that claims transferred permissions or loses the handoff reason', async () => {
  for (const problem of ['permission transfer', 'missing reason']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 4 });
    const old = env.page().children.find(n => n.name === core.flowSectionName(4));
    const sourceText = env.sources.conversationHandoff.findAll(n => n.name === 'Semantic copy')[0];
    sourceText.characters = problem === 'permission transfer'
      ? sourceText.characters.replace('Permissions do not transfer.', 'Handoff grants Sales permissions.')
      : sourceText.characters.replace('Reason: Sales-authorized mutation required.', 'No reason supplied.');
    assert.match(await env.send({ type: 'build-flow', id: 4 }), /BLOCKED: Flow 4 staging validation failed/);
    assert.equal(old.name, core.flowSectionName(4));
    assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  }
});

test('Flow 4 rerun archives mixed/manual old content; clean rerun removes only its prior generated section', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 4 });
  const first = env.page().children.find(n => n.name === core.flowSectionName(4));
  assert.match(await env.send({ type: 'build-flow', id: 4 }), /removed after validation/);
  assert.equal(first.removed, true);
  const second = env.page().children.find(n => n.name === core.flowSectionName(4));
  const manual = new env.Node('TEXT', 'Manual note'); second.appendChild(manual);
  const mixed = second.children.find(n => n.name === core.cloneName(4, 'Support Active')).findAll(n => n.name === 'Order heading')[0];
  mixed.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.conversationSales.id, transition: null },
  ] }];
  const oldReaction = structuredClone(mixed.reactions);
  assert.match(await env.send({ type: 'build-flow', id: 4 }), /old section archived/);
  assert.match(second.name, /^ARCHIVE — Flow 4/);
  assert.equal(manual.removed, false);
  assert.deepEqual(mixed.reactions, oldReaction);
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(4)).length, 1);
});

test('Flow 4 post-swap rollback preserves canonical Flow 4, Flows 1–3, and 03A–03D', async () => {
  const env = environment();
  for (let id = 1; id <= 4; id++) await env.send({ type: 'build-flow', id });
  const old = env.page().children.find(n => n.name === core.flowSectionName(4));
  const digest = node => [node.id, node.type, node.name, node.characters, node.reactions, node.children.map(digest)];
  const prior = JSON.stringify(env.page().children.filter(n => [1, 2, 3].some(id => n.name === core.flowSectionName(id))).map(digest));
  const protectedPrior = JSON.stringify(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name)).map(digest));
  const lookup = env.figma.getNodeByIdAsync;
  env.figma.getNodeByIdAsync = async id => {
    const canonical = env.page().children.find(n => n.name === core.flowSectionName(4));
    if (canonical && canonical.id !== old.id && canonical.children.some(n => n.id === id && n.name === core.cloneName(4, 'Sales Active'))) return null;
    return lookup(id);
  };
  assert.match(await env.send({ type: 'build-flow', id: 4 }), /BLOCKED: Flow 4 canonical validation failed/);
  env.figma.getNodeByIdAsync = lookup;
  assert.equal(old.name, core.flowSectionName(4));
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(4)).length, 1);
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  assert.equal(JSON.stringify(env.page().children.filter(n => [1, 2, 3].some(id => n.name === core.flowSectionName(id))).map(digest)), prior);
  assert.equal(JSON.stringify(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name)).map(digest)), protectedPrior);
});

test('Flow 5 uses fresh OUTCOME_UNKNOWN sources, product Open Escalation, and ends before M12', async () => {
  const env = environment();
  for (let id = 1; id <= 4; id++) await env.send({ type: 'build-flow', id });
  const digest = node => [node.id, node.type, node.name, node.characters, node.reactions, node.children.map(digest)];
  const earlier = JSON.stringify(env.page().children.filter(n => [1, 2, 3, 4].some(id => n.name === core.flowSectionName(id))).map(digest));
  const protectedEarlier = JSON.stringify(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name)).map(digest));
  assert.match(await env.send({ type: 'build-flow', id: 5 }), /Open Escalation → Reconciliation: PRODUCT CONTROL/);
  const section = env.page().children.find(n => n.name === core.flowSectionName(5));
  const conversation = section.children.find(n => n.name === core.cloneName(5, 'Conversation OUTCOME_UNKNOWN'));
  const escalation = section.children.find(n => n.name === core.cloneName(5, 'Escalation Reconciliation'));
  assert.ok(conversation.x + conversation.width < escalation.x);
  assert.equal(conversation.findAll(n => n.name === 'Escalation link')[0].reactions[0].actions[0].destinationId, escalation.id);
  assert.equal(env.sources.conversationUnknown.findAll(n => n.name === 'Escalation link')[0].reactions.length, 0);
  assert.equal(section.children.some(n => n.name === core.FLOW5_BOARD.escalationControl.name), false);
  for (const item of [core.FLOW5_BOARD.start, core.FLOW5_BOARD.step1, core.FLOW5_BOARD.uncertain,
    core.FLOW5_BOARD.unknownBoundary, core.FLOW5_BOARD.noBlindRetry, core.FLOW5_BOARD.reconcileFirst,
    core.FLOW5_BOARD.step2, core.FLOW5_BOARD.reconciliation, core.FLOW5_BOARD.knownBoundary,
    core.FLOW5_BOARD.e02Boundary, core.FLOW5_BOARD.m12Boundary, core.FLOW5_BOARD.end]) {
    assert.equal(section.children.find(n => n.name === item.name)?.characters, item.text);
  }
  const report = await env.send({ type: 'validate' });
  for (let id = 1; id <= 5; id++) assert.match(report, new RegExp(`Flow ${id} .*: PASS`));
  for (let id = 6; id <= 8; id++) assert.match(report, new RegExp(`Flow ${id} .*: NOT BUILT`));
  for (const check of ['Uncertain business effect', 'OUTCOME_UNKNOWN ≠ Known Failure', 'No blind retry',
    'Reconcile before mutation', 'E02 ≠ OUTCOME_UNKNOWN', 'Decision Context hierarchy',
    'Confirmed Facts ≠ Uncertain Effect', 'Reconciliation Required', 'No automatic replay', 'M12 kept outside Flow 5']) {
    assert.ok(report.includes(`${check}: PASS`));
  }
  assert.match(report, /Open Escalation source: PRODUCT CONTROL/);
  assert.match(report, /Flow 5 broken destinations: 0/);
  assert.match(report, /Broken\/prohibited destinations: 0/);
  assert.match(report, /Overall: INCOMPLETE/);
  assert.equal(JSON.stringify(env.page().children.filter(n => [1, 2, 3, 4].some(id => n.name === core.flowSectionName(id))).map(digest)), earlier);
  assert.equal(JSON.stringify(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name)).map(digest)), protectedEarlier);
});

test('Flow 5 falls back to an external prototype control if Open Escalation is absent, hidden, or pre-reactive', async () => {
  for (const state of ['absent', 'hidden', 'reactive']) {
    const env = environment();
    const link = env.sources.conversationUnknown.findAll(n => n.name === 'Escalation link')[0];
    if (state === 'absent') link.remove();
    if (state === 'hidden') link.visible = false;
    if (state === 'reactive') link.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.escalationUnknown.id, transition: null },
    ] }];
    assert.match(await env.send({ type: 'build-flow', id: 5 }), /PROTOTYPE CONTROL/);
    const section = env.page().children.find(n => n.name === core.flowSectionName(5));
    const control = section.children.find(n => n.name === core.FLOW5_BOARD.escalationControl.name);
    const escalation = section.children.find(n => n.name === core.cloneName(5, 'Escalation Reconciliation'));
    assert.equal(control.reactions[0].actions[0].destinationId, escalation.id);
    if (state === 'reactive') assert.deepEqual(section.children.find(n => n.name === core.cloneName(5, 'Conversation OUTCOME_UNKNOWN'))
      .findAll(n => n.name === 'Escalation link')[0].reactions, link.reactions);
    assert.match(await env.send({ type: 'validate' }), /Flow 5 — OUTCOME_UNKNOWN → Escalation: PASS/);
  }
});

test('Flow 5 accepts Figma-normalized no-animation reactions', async () => {
  for (const shape of ['absent', 'null', 'mirror', 'legacy action only']) {
    const env = environment();
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (this.name !== 'Escalation link') return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (shape !== 'null') delete reaction.actions[0].transition;
      if (shape === 'mirror') reaction.action = { ...reaction.actions[0], preserveScrollPosition: false };
      if (shape === 'legacy action only') { reaction.action = reaction.actions[0]; delete reaction.actions; }
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 5 }), /Built/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.match(await env.send({ type: 'validate' }), /Flow 5 — OUTCOME_UNKNOWN → Escalation: PASS/);
  }
});

test('Flow 5 external prototype control accepts equivalent no-animation readback', async () => {
  for (const shape of ['absent', 'mirror', 'legacy action only']) {
    const env = environment();
    env.sources.conversationUnknown.findAll(n => n.name === 'Escalation link')[0].visible = false;
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (this.name !== core.FLOW5_BOARD.escalationControl.name) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      delete reaction.actions[0].transition;
      if (shape === 'mirror') reaction.action = { ...reaction.actions[0], resetScrollPosition: true };
      if (shape === 'legacy action only') { reaction.action = reaction.actions[0]; delete reaction.actions; }
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 5 }), /PROTOTYPE CONTROL/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.match(await env.send({ type: 'validate' }), /Flow 5 — OUTCOME_UNKNOWN → Escalation: PASS/);
  }
});

test('Flow 5 does not touch Flow 1–4 archive sections', async () => {
  const env = environment();
  for (let id = 1; id <= 4; id++) await env.send({ type: 'build-flow', id });
  const archives = [];
  for (let id = 1; id <= 4; id++) {
    const section = new env.Node('SECTION', `ARCHIVE — Flow ${id} — retained prior work`);
    const manual = new env.Node('TEXT', `Manual archived note ${id}`);
    section.appendChild(manual); env.page().appendChild(section); archives.push(section);
  }
  const before = archives.map(section => [section.id, section.name, section.children.map(n => [n.id, n.name, n.removed])]);
  assert.match(await env.send({ type: 'build-flow', id: 5 }), /Built/);
  assert.deepEqual(archives.map(section => [section.id, section.name, section.children.map(n => [n.id, n.name, n.removed])]), before);
});

test('Flow 5 staging rejects bypass destinations, animation, extra product navigation, and automatic replay', async () => {
  for (const problem of ['processing', 'confirmed', 'reservation confirmed', 'known failure', 'E02', 'retry mutation', 'resume',
    'wrong exact', 'animation', 'extra product reaction', 'automatic replay']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 5 });
    const old = env.page().children.find(n => n.name === core.flowSectionName(5));
    const oldIds = old.children.map(n => n.id);
    const restricted = problem === 'E02' ? new env.Node('FRAME', '3D / Orders / E02 Restricted') : null;
    const retry = problem === 'retry mutation' ? new env.Node('FRAME', 'Retry reserve_inventory mutation') : null;
    if (restricted) env.sourcePage.appendChild(restricted);
    if (retry) env.sourcePage.appendChild(retry);
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (this.name !== 'Escalation link') return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      const target = {
        processing: env.sources.conversationProcessing,
        confirmed: env.sources.conversationConfirmed,
        'reservation confirmed': env.sources.orderConfirmed,
        'known failure': env.sources.conversationFailure,
        E02: restricted,
        'retry mutation': retry,
        resume: env.sources.escalationResume,
        'wrong exact': env.sources.escalationUnknown,
      }[problem];
      if (target) reaction.actions[0].destinationId = target.id;
      if (problem === 'animation') reaction.actions[0].transition = { type: 'SMART_ANIMATE', duration: 0.2 };
      this.reactions = [reaction];
      const stage = this.parent.parent;
      if (problem === 'extra product reaction') stage.children.find(n => n.name === core.cloneName(5, 'Conversation OUTCOME_UNKNOWN'))
        .findAll(n => n.name === 'Business Action Result')[0].reactions = structuredClone(value);
      if (problem === 'automatic replay') stage.children.find(n => n.name === core.FLOW5_BOARD.m12Boundary.name).characters =
        'Reconciliation automatically retries reserve_inventory.';
    };
    assert.match(await env.send({ type: 'build-flow', id: 5 }), /BLOCKED: Flow 5 staging validation failed/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.equal(old.name, core.flowSectionName(5));
    assert.deepEqual(old.children.map(n => n.id), oldIds);
    assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  }
});

test('Flow 5 validator is read-only and rejects semantic loss, hierarchy changes, context loss, and Resume path', async () => {
  for (const problem of ['known failure', 'E02 distinction', 'confirmed uncertainty', 'hierarchy',
    'reconciliation', 'context', 'M12 boundary', 'direct resume']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 5 });
    const section = env.page().children.find(n => n.name === core.flowSectionName(5));
    const conversation = section.children.find(n => n.name === core.cloneName(5, 'Conversation OUTCOME_UNKNOWN'));
    const escalation = section.children.find(n => n.name === core.cloneName(5, 'Escalation Reconciliation'));
    const context = escalation.findAll(n => n.name === 'Decision Context')[0];
    if (problem === 'known failure') conversation.findAll(n => n.name === 'Result state')[0].characters = 'Known Failure';
    if (problem === 'E02 distinction') section.children.find(n => n.name === core.FLOW5_BOARD.e02Boundary.name).characters = 'E02 and OUTCOME_UNKNOWN are the same.';
    if (problem === 'confirmed uncertainty') context.children.find(n => n.name === 'Confirmed Facts').findAll(n => n.name === 'Hierarchy copy')[0].characters += ' Reservation confirmed.';
    if (problem === 'hierarchy') context.children.find(n => n.name === 'Confirmed Facts').y = 999;
    if (problem === 'reconciliation') context.children.find(n => n.name === 'Uncertain Effect').findAll(n => n.name === 'Hierarchy copy')[0].characters = 'OUTCOME_UNKNOWN; no known result.';
    if (problem === 'context') context.children.find(n => n.name === 'Selected case relationship').characters = 'No linked case';
    if (problem === 'M12 boundary') section.children.find(n => n.name === core.FLOW5_BOARD.m12Boundary.name).remove();
    if (problem === 'direct resume') escalation.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.escalationResume.id, transition: null },
    ] }];
    const before = JSON.stringify(env.page().children.map(s => [s.id, s.name, s.children.map(n => [n.id, n.name, n.reactions])]));
    assert.match(await env.send({ type: 'validate' }), /Flow 5 — OUTCOME_UNKNOWN → Escalation: FAIL/);
    assert.equal(JSON.stringify(env.page().children.map(s => [s.id, s.name, s.children.map(n => [n.id, n.name, n.reactions])])), before);
  }
});

test('Flow 5 archive and rollback preserve previous canonical and mixed reactions', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 5 });
  const clean = env.page().children.find(n => n.name === core.flowSectionName(5));
  assert.match(await env.send({ type: 'build-flow', id: 5 }), /removed after validation/);
  assert.equal(clean.removed, true);
  const prior = env.page().children.find(n => n.name === core.flowSectionName(5));
  const manual = new env.Node('TEXT', 'Manual note'); prior.appendChild(manual);
  const row = prior.children.find(n => n.name === core.cloneName(5, 'Conversation OUTCOME_UNKNOWN'))
    .findAll(n => n.name === 'Business Action Result')[0];
  row.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.escalationResume.id, transition: null },
  ] }];
  const oldReaction = structuredClone(row.reactions);
  assert.match(await env.send({ type: 'build-flow', id: 5 }), /old section archived/);
  assert.match(prior.name, /^ARCHIVE — Flow 5/);
  assert.equal(manual.removed, false);
  assert.deepEqual(row.reactions, oldReaction);
  const canonical = env.page().children.find(n => n.name === core.flowSectionName(5));
  const lookup = env.figma.getNodeByIdAsync;
  env.figma.getNodeByIdAsync = async id => {
    const current = env.page().children.find(n => n.name === core.flowSectionName(5));
    if (current && current.id !== canonical.id && current.children.some(n => n.id === id && n.name === core.cloneName(5, 'Escalation Reconciliation'))) return null;
    return lookup(id);
  };
  assert.match(await env.send({ type: 'build-flow', id: 5 }), /BLOCKED: Flow 5 canonical validation failed/);
  env.figma.getNodeByIdAsync = lookup;
  assert.equal(canonical.name, core.flowSectionName(5));
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(5)).length, 1);
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
});

test('Flow 5 source semantic loss blocks staging and leaves prior canonical intact', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 5 });
  const old = env.page().children.find(n => n.name === core.flowSectionName(5));
  env.sources.escalationUnknown.findAll(n => n.name === 'Uncertain Effect')[0]
    .findAll(n => n.name === 'Hierarchy copy')[0].characters = 'Known failed reservation. Retry now.';
  assert.match(await env.send({ type: 'build-flow', id: 5 }), /BLOCKED: Flow 5 staging validation failed/);
  assert.equal(old.name, core.flowSectionName(5));
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
});

function flowSixNodes(env) {
  const section = env.page().children.find(n => n.name === core.flowSectionName(6));
  const decision = section.children.find(n => n.name === core.cloneName(6, 'Awaiting Decision'));
  const target = section.children.find(n => n.name === core.cloneName(6, 'Resume Pending'));
  const gate = section.children.find(n => n.name === core.FLOW6_BOARD.gate.name);
  const decisionControl = section.children.find(n => n.name === core.FLOW6_BOARD.decisionControl.name);
  const request = gate.children.find(n => n.name === core.FLOW6_BOARD.resumeControl.name);
  return { section, decision, target, gate, decisionControl, request };
}

test('Flow 6 builds exact fresh 03D TARGET clones through an external revalidation gate and preserves Flows 1–5', async () => {
  const env = environment();
  for (let id = 1; id <= 5; id++) assert.match(await env.send({ type: 'build-flow', id }), /Built/);
  const prior = env.page().children.filter(n => /^0[1-5] /.test(n.name));
  const snapshots = prior.map(n => [n.id, n.name, n.children.map(child => child.id)]);
  const archives = [];
  for (let id = 1; id <= 5; id++) {
    const archive = new env.Node('SECTION', `ARCHIVE — Flow ${id} — previous manual work`);
    archive.appendChild(new env.Node('TEXT', `Manual archive ${id}`));
    env.page().appendChild(archive); archives.push(archive);
  }
  const archiveSnapshot = archives.map(n => [n.id, n.name, n.children.map(child => child.id)]);
  const protectedSnapshot = env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.name, n.children.map(child => child.id)]);
  assert.match(await env.send({ type: 'build-flow', id: 6 }), /Decision → Revalidation Gate: PROTOTYPE CONTROL/);
  const { section, decision, target, gate, decisionControl, request } = flowSixNodes(env);
  assert.equal(decision.type, 'FRAME'); assert.equal(target.type, 'FRAME');
  assert.equal(decision.name, '3E / Flow 06 / Awaiting Decision');
  assert.equal(target.name, '3E / Flow 06 / Resume Pending');
  assert.ok(section.children.find(n => n.name === core.FLOW6_BOARD.targetBanner.name).width >= 1200);
  assert.equal(decisionControl.reactions[0].actions[0].destinationId, gate.id);
  assert.equal(request.reactions[0].actions[0].destinationId, target.id);
  assert.equal(decision.reactions.length, env.sources.escalationDecision.reactions.length);
  assert.equal(target.reactions.length, env.sources.escalationResume.reactions.length);
  const report = await env.send({ type: 'validate' });
  for (let id = 1; id <= 6; id++) assert.match(report, new RegExp(`Flow ${id} .*: PASS`));
  assert.match(report, /Flow 7 .*: NOT BUILT/); assert.match(report, /Flow 8 .*: NOT BUILT/);
  assert.match(report, /Flow 6 broken destinations: 0/);
  assert.match(report, /Overall: INCOMPLETE/);
  assert.deepEqual(prior.map(n => [n.id, n.name, n.children.map(child => child.id)]), snapshots);
  assert.deepEqual(archives.map(n => [n.id, n.name, n.children.map(child => child.id)]), archiveSnapshot);
  assert.deepEqual(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.name, n.children.map(child => child.id)]), protectedSnapshot);
});

test('Flow 6 resolves exact 03D sources before writing and rejects missing, duplicate or wrong type', async () => {
  for (const sourceKey of ['escalationDecision', 'escalationResume']) for (const problem of ['missing', 'duplicate', 'wrong']) {
    const env = environment();
    const source = env.sources[sourceKey];
    if (problem === 'missing') source.remove();
    if (problem === 'duplicate') source.parent.appendChild(source.clone());
    if (problem === 'wrong') source.type = 'TEXT';
    assert.match(await env.send({ type: 'build-flow', id: 6 }), /BLOCKED/);
    assert.equal(env.page(), undefined);
  }
});

test('Flow 6 rejects a source that turns human decision into mutation execution', async () => {
  const env = environment();
  const decision = env.sources.escalationDecision.findAll(n => n.name === 'Human Decision')[0];
  decision.findAll(n => n.name === 'Hierarchy copy')[0].characters =
    'HUMAN DECISION. Approve proposed continuation. Current authorization required. Mutation executed.';
  assert.match(await env.send({ type: 'build-flow', id: 6 }), /BLOCKED: Flow 6 staging validation failed/);
  assert.equal(env.page().children.some(n => n.name === core.flowSectionName(6)), false);
});

test('Flow 6 preserves a legitimate 03D source reaction without treating it as scenario progression', async () => {
  const env = environment();
  const link = new env.Node('FRAME', 'Existing case-history link');
  link.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.conversationDefault.id, transition: null },
  ] }];
  env.sources.escalationDecision.appendChild(link);
  assert.match(await env.send({ type: 'build-flow', id: 6 }), /Built/);
  assert.deepEqual(flowSixNodes(env).decision.findAll(n => n.name === link.name)[0].reactions, link.reactions);
  assert.match(await env.send({ type: 'validate' }), /Flow 6 .*: PASS/);
});

test('Flow 6 prefers only a visible semantically approved standalone product decision control', async () => {
  for (const problem of ['approved', 'hidden', 'already reactive', 'unrelated', 'nested instance']) {
    const env = environment();
    const human = env.sources.escalationDecision.findAll(n => n.name === 'Human Decision')[0];
    const parent = problem === 'nested instance' ? new env.Node('INSTANCE', 'Phase 3C panel') : human;
    if (parent !== human) human.appendChild(parent);
    const button = new env.Node('FRAME', 'Primary decision'); parent.appendChild(button);
    const caption = new env.Node('TEXT', 'Action label'); caption.characters = problem === 'unrelated' ? 'Open Queue' : 'Approve proposed continuation'; button.appendChild(caption);
    if (problem === 'hidden') button.visible = false;
    if (problem === 'already reactive') button.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.escalationResume.id, transition: null }] }];
    const sourceReactions = structuredClone(button.reactions);
    assert.match(await env.send({ type: 'build-flow', id: 6 }), problem === 'approved' ? /PRODUCT CONTROL/ : /PROTOTYPE CONTROL/);
    const { decision, gate, decisionControl } = flowSixNodes(env);
    const clonedButton = decision.findAll(n => n.name === 'Primary decision')[0];
    assert.deepEqual(button.reactions, sourceReactions);
    assert.equal(decisionControl === undefined, problem === 'approved');
    assert.equal(clonedButton.reactions.length, problem === 'approved' ? 1 : sourceReactions.length);
    if (problem === 'approved') assert.equal(clonedButton.reactions[0].actions[0].destinationId, gate.id);
    assert.match(await env.send({ type: 'validate' }), /Flow 6 .*: PASS/);
  }
});

test('Flow 6 accepts normalized no-animation reactions on both progression controls', async () => {
  for (const shape of ['absent transition', 'deprecated mirror', 'null transition']) {
    const env = environment();
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (![core.FLOW6_BOARD.decisionControl.name, core.FLOW6_BOARD.resumeControl.name].includes(this.name)) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (shape === 'absent transition') delete reaction.actions[0].transition;
      if (shape === 'deprecated mirror') reaction.action = structuredClone(reaction.actions[0]);
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 6 }), /Built/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.match(await env.send({ type: 'validate' }), /Flow 6 .*: PASS/);
  }
});

test('Flow 6 staging rejects bypass, prohibited destinations, animation, replay and missing revalidation', async () => {
  for (const problem of ['decision bypass', 'processing', 'confirmed', 'reservation confirmed', 'mutation retry',
    'wrong target', 'animation', 'missing principal', 'missing scope', 'missing authorization',
    'missing state', 'missing revision', 'missing replay boundary', 'missing unknown', 'missing E02',
    'current claim', 'confirmed claim', 'extra product reaction']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 6 });
    const old = flowSixNodes(env).section;
    const oldIds = old.children.map(n => n.id);
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      const isDecision = this.name === core.FLOW6_BOARD.decisionControl.name;
      const isRequest = this.name === core.FLOW6_BOARD.resumeControl.name;
      if (!isDecision && !isRequest) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      const stage = isRequest ? this.parent.parent : this.parent;
      const target = stage.children.find(n => n.name === core.cloneName(6, 'Resume Pending'));
      if (problem === 'decision bypass' && isDecision) reaction.actions[0].destinationId = target.id;
      if (isRequest) {
        const forbidden = {
          processing: env.sources.conversationProcessing,
          confirmed: env.sources.conversationConfirmed,
          'reservation confirmed': env.sources.orderConfirmed,
          'mutation retry': new env.Node('FRAME', 'Retry reserve_inventory mutation'),
          'wrong target': env.sources.escalationResume,
        }[problem];
        if (problem === 'mutation retry') env.sourcePage.appendChild(forbidden);
        if (forbidden) reaction.actions[0].destinationId = forbidden.id;
        if (problem === 'animation') reaction.actions[0].transition = { type: 'SMART_ANIMATE', duration: 0.2 };
        const drop = {
          'missing principal': core.FLOW6_BOARD.principal.name,
          'missing scope': core.FLOW6_BOARD.scope.name,
          'missing authorization': core.FLOW6_BOARD.authorization.name,
          'missing state': core.FLOW6_BOARD.state.name,
          'missing revision': core.FLOW6_BOARD.revision.name,
          'missing replay boundary': core.FLOW6_BOARD.replayBoundary.name,
          'missing unknown': core.FLOW6_BOARD.unknownBoundary.name,
          'missing E02': core.FLOW6_BOARD.e02Boundary.name,
        }[problem];
        if (drop) this.parent.children.find(n => n.name === drop).remove();
        if (problem === 'current claim') stage.children.find(n => n.name === core.FLOW6_BOARD.currentTarget.name).characters = 'CURRENT: durable resume is implemented.';
        if (problem === 'confirmed claim') target.findAll(n => n.name === 'Semantic copy')[0].characters = 'Reservation confirmed.';
        if (problem === 'extra product reaction') stage.children.find(n => n.name === core.cloneName(6, 'Awaiting Decision')).reactions = [reaction];
      }
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 6 }), /BLOCKED: Flow 6 staging validation failed/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.equal(old.name, core.flowSectionName(6));
    assert.deepEqual(old.children.map(n => n.id), oldIds);
    assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  }
});

test('Flow 6 validator is read-only and reports explicit semantic failures', async () => {
  for (const problem of ['target banner', 'decision hierarchy', 'decision boundary', 'step two', 'principal',
    'scope', 'authorization', 'state', 'revision', 'replay boundary', 'unknown', 'E02', 'current target',
    'resume semantics', 'END', 'broken decision reaction']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 6 });
    const { section, decision, gate, decisionControl, target } = flowSixNodes(env);
    const drop = {
      'target banner': core.FLOW6_BOARD.targetBanner.name,
      'decision boundary': core.FLOW6_BOARD.decisionBoundary.name,
      'step two': core.FLOW6_BOARD.step2.name,
      principal: core.FLOW6_BOARD.principal.name,
      scope: core.FLOW6_BOARD.scope.name,
      authorization: core.FLOW6_BOARD.authorization.name,
      state: core.FLOW6_BOARD.state.name,
      revision: core.FLOW6_BOARD.revision.name,
      'replay boundary': core.FLOW6_BOARD.replayBoundary.name,
      unknown: core.FLOW6_BOARD.unknownBoundary.name,
      E02: core.FLOW6_BOARD.e02Boundary.name,
      'current target': core.FLOW6_BOARD.currentTarget.name,
      END: core.FLOW6_BOARD.end.name,
    }[problem];
    if (drop) (section.children.find(n => n.name === drop) ?? gate.children.find(n => n.name === drop)).remove();
    if (problem === 'decision hierarchy') decision.findAll(n => n.name === 'Confirmed Facts')[0].y = 999;
    if (problem === 'resume semantics') target.findAll(n => n.name === 'Semantic copy')[0].characters = 'Reservation confirmed.';
    if (problem === 'broken decision reaction') decisionControl.reactions[0].actions[0].destinationId = 'missing-node';
    const before = JSON.stringify(section, (key, value) => key === 'parent' ? undefined : value);
    const report = await env.send({ type: 'validate' });
    assert.match(report, /Flow 6 .*: FAIL/);
    assert.equal(JSON.stringify(section, (key, value) => key === 'parent' ? undefined : value), before);
  }
});

test('Flow 6 clean rerun removes only prior generated section; ambiguous old content is archived', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 6 });
  const clean = flowSixNodes(env).section;
  assert.match(await env.send({ type: 'build-flow', id: 6 }), /removed after validation/);
  assert.equal(clean.removed, true);
  const prior = flowSixNodes(env).section;
  const manual = new env.Node('TEXT', 'Manual review note'); prior.appendChild(manual);
  const mixed = prior.children.find(n => n.name === core.cloneName(6, 'Awaiting Decision'));
  mixed.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.conversationProcessing.id, transition: null }] }];
  const oldReaction = structuredClone(mixed.reactions);
  assert.match(await env.send({ type: 'build-flow', id: 6 }), /old section archived/);
  assert.match(prior.name, /^ARCHIVE — Flow 6/);
  assert.equal(manual.removed, false);
  assert.deepEqual(mixed.reactions, oldReaction);
});

test('Flow 6 staging and post-swap failures roll back without changing prior canonical or protected pages', async () => {
  const env = environment();
  for (let id = 1; id <= 5; id++) await env.send({ type: 'build-flow', id });
  await env.send({ type: 'build-flow', id: 6 });
  const canonical = flowSixNodes(env).section;
  const before = env.page().children.map(n => [n.id, n.name, n.children.map(c => c.id)]);
  const sources = env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name)).map(n => [n.id, n.children.map(c => c.id)]);
  const setter = env.Node.prototype.setReactionsAsync;
  env.Node.prototype.setReactionsAsync = async function(value) {
    if (this.name === core.FLOW6_BOARD.resumeControl.name) throw new Error('Prototype reaction API failure');
    return setter.call(this, value);
  };
  assert.match(await env.send({ type: 'build-flow', id: 6 }), /BLOCKED: (?:Error: )?Prototype reaction API failure/);
  env.Node.prototype.setReactionsAsync = setter;
  assert.deepEqual(env.page().children.map(n => [n.id, n.name, n.children.map(c => c.id)]), before);
  const lookup = env.figma.getNodeByIdAsync;
  env.figma.getNodeByIdAsync = async id => {
    if (env.page().children.some(n => n.name === core.flowSectionName(6) && n.id !== canonical.id &&
      n.children.some(c => c.name === core.cloneName(6, 'Resume Pending') && c.id === id))) return null;
    return lookup(id);
  };
  assert.match(await env.send({ type: 'build-flow', id: 6 }), /BLOCKED: Flow 6 canonical validation failed/);
  env.figma.getNodeByIdAsync = lookup;
  assert.equal(canonical.name, core.flowSectionName(6));
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(6)).length, 1);
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  assert.deepEqual(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.children.map(c => c.id)]), sources);
});

function flowSevenNodes(env) {
  const section = env.page().children.find(n => n.name === core.flowSectionName(7));
  const analytics = section.children.find(n => n.name === core.cloneName(7, 'Analytics Valid'));
  const notReady = section.children.find(n => n.name === core.cloneName(7, 'MODEL_NOT_READY'));
  const target = section.children.find(n => n.name === core.cloneName(7, 'TARGET Ready'));
  const open = section.children.find(n => n.name === core.FLOW7_BOARD.openControl.name) ?? analytics.findAll(n => n.name === 'Open Forecasts')[0];
  const back = section.children.find(n => n.name === core.FLOW7_BOARD.returnControl.name) ?? notReady.findAll(n => n.name === 'Open Historical Analytics')[0];
  return { section, analytics, notReady, target, open, back };
}

test('Flow 7 stages exact 03D clones, closes CURRENT path, isolates non-interactive TARGET, and preserves Flows 1–6', async () => {
  const env = environment();
  for (let id = 1; id <= 6; id++) assert.match(await env.send({ type: 'build-flow', id }), /Built/);
  const oldSections = env.page().children.filter(n => [1, 2, 3, 4, 5, 6].some(id => n.name === core.flowSectionName(id)));
  const archive = new env.Node('SECTION', 'ARCHIVE — Flow 5 — previous review');
  archive.appendChild(new env.Node('TEXT', 'Manual note')); env.page().appendChild(archive);
  const before = [...oldSections, archive].map(n => [n.id, n.name, n.children.map(child => child.id)]);
  const sourceBefore = env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.name, n.children.map(c => c.id)]);
  assert.match(await env.send({ type: 'build-flow', id: 7 }), /Analytics → Forecasts: PRODUCT CONTROL; Forecasts → Analytics: PRODUCT CONTROL; TARGET entry: NON-INTERACTIVE SPECIMEN/);
  const { section, analytics, notReady, target, open, back } = flowSevenNodes(env);
  assert.equal(analytics.name, '3E / Flow 07 / Analytics Valid');
  assert.equal(notReady.name, '3E / Flow 07 / MODEL_NOT_READY');
  assert.equal(target.name, '3E / Flow 07 / TARGET Ready');
  assert.equal(open.reactions[0].actions[0].destinationId, notReady.id);
  assert.equal(back.reactions[0].actions[0].destinationId, analytics.id);
  assert.ok(target.y > Math.max(analytics.y + analytics.height, notReady.y + notReady.height));
  assert.equal(section.children.some(n => n.name.includes('TARGET Entry')), false);
  const report = await env.send({ type: 'validate' });
  for (let id = 1; id <= 7; id++) assert.match(report, new RegExp(`Flow ${id} .*: PASS`));
  assert.match(report, /Flow 8 .*: NOT BUILT/);
  assert.match(report, /Flow 7 broken destinations: 0/);
  assert.match(report, /Overall: INCOMPLETE/);
  assert.deepEqual([...oldSections, archive].map(n => [n.id, n.name, n.children.map(child => child.id)]), before);
  assert.deepEqual(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.name, n.children.map(c => c.id)]), sourceBefore);
});

test('Flow 7 exact source resolution rejects missing, duplicate, or wrong-type 03D frames before writing', async () => {
  for (const key of ['analyticsValid', 'forecastNotReady', 'forecastTarget']) for (const problem of ['missing', 'duplicate', 'wrong']) {
    const env = environment();
    const source = env.sources[key];
    if (problem === 'missing') source.remove();
    if (problem === 'duplicate') source.parent.appendChild(source.clone());
    if (problem === 'wrong') source.type = 'TEXT';
    assert.match(await env.send({ type: 'build-flow', id: 7 }), /BLOCKED/);
    assert.equal(env.page(), undefined);
  }
});

test('Flow 7 falls back only when a visible semantically correct product navigation control is unavailable', async () => {
  for (const key of ['analyticsValid', 'forecastNotReady']) for (const problem of ['hidden', 'unrelated', 'reactive', 'nested instance']) {
    const env = environment();
    const name = key === 'analyticsValid' ? 'Open Forecasts' : 'Open Historical Analytics';
    const button = env.sources[key].findAll(n => n.name === name)[0];
    if (problem === 'hidden') button.visible = false;
    if (problem === 'unrelated') button.findAll(n => n.name === 'Action label')[0].characters = 'Open unrelated report';
    if (problem === 'reactive') button.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.conversationDefault.id, transition: null },
    ] }];
    if (problem === 'nested instance') {
      const parent = button.parent;
      const instance = new env.Node('INSTANCE', 'Approved component instance');
      parent.appendChild(instance); instance.appendChild(button);
    }
    const original = structuredClone(button.reactions);
    assert.match(await env.send({ type: 'build-flow', id: 7 }), /PROTOTYPE CONTROL/);
    const { section, analytics, notReady } = flowSevenNodes(env);
    const external = section.children.find(n => n.name === (key === 'analyticsValid' ? core.FLOW7_BOARD.openControl.name : core.FLOW7_BOARD.returnControl.name));
    assert.ok(external);
    assert.equal(external.reactions[0].actions[0].destinationId, key === 'analyticsValid' ? notReady.id : analytics.id);
    assert.deepEqual(button.reactions, original);
    assert.match(await env.send({ type: 'validate' }), /Flow 7 .*: PASS/);
  }
});

test('Flow 7 accepts no-animation reaction readback with action mirror and absent transition', async () => {
  for (const shape of ['absent', 'mirror', 'null']) {
    const env = environment();
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (!['Open Forecasts', 'Open Historical Analytics'].includes(this.name)) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (shape === 'absent') delete reaction.actions[0].transition;
      if (shape === 'mirror') reaction.action = structuredClone(reaction.actions[0]);
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 7 }), /Built/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.match(await env.send({ type: 'validate' }), /Flow 7 .*: PASS/);
  }
});

test('Flow 7 external fallback controls accept equivalent no-animation readback and preserve source reactions', async () => {
  for (const shape of ['absent', 'mirror']) {
    const env = environment();
    const sourceOpen = env.sources.analyticsValid.findAll(n => n.name === 'Open Forecasts')[0];
    const sourceBack = env.sources.forecastNotReady.findAll(n => n.name === 'Open Historical Analytics')[0];
    for (const control of [sourceOpen, sourceBack]) control.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.conversationDefault.id, transition: null },
    ] }];
    const originals = [structuredClone(sourceOpen.reactions), structuredClone(sourceBack.reactions)];
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (![core.FLOW7_BOARD.openControl.name, core.FLOW7_BOARD.returnControl.name].includes(this.name)) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (shape === 'absent') delete reaction.actions[0].transition;
      if (shape === 'mirror') reaction.action = structuredClone(reaction.actions[0]);
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 7 }), /Analytics → Forecasts: PROTOTYPE CONTROL; Forecasts → Analytics: PROTOTYPE CONTROL/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.deepEqual([sourceOpen.reactions, sourceBack.reactions], originals);
    assert.match(await env.send({ type: 'validate' }), /Flow 7 .*: PASS/);
  }
});

test('Flow 7 staging rejects current-to-TARGET, wrong destinations, animation, fake prediction and missing boundaries', async () => {
  for (const problem of ['target from Analytics', 'target from MODEL_NOT_READY', 'Model Unavailable', 'wrong exact',
    'animation', 'fake prediction', 'zero forecast', 'predicted Analytics', 'missing current banner',
    'missing target banner', 'missing ACTUAL boundary', 'missing M13', 'target beside current', 'extra target reaction']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 7 });
    const old = flowSevenNodes(env).section;
    const oldIds = old.children.map(n => n.id);
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (!['Open Forecasts', 'Open Historical Analytics'].includes(this.name)) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      const stage = this.parent.parent.parent;
      const analytics = stage.children.find(n => n.name === core.cloneName(7, 'Analytics Valid'));
      const notReady = stage.children.find(n => n.name === core.cloneName(7, 'MODEL_NOT_READY'));
      const target = stage.children.find(n => n.name === core.cloneName(7, 'TARGET Ready'));
      if (this.name === 'Open Forecasts' && problem === 'target from Analytics') reaction.actions[0].destinationId = target.id;
      if (this.name === 'Open Historical Analytics') {
        if (problem === 'target from MODEL_NOT_READY') reaction.actions[0].destinationId = target.id;
        if (problem === 'Model Unavailable') {
          const unavailable = new env.Node('FRAME', '3D / Forecasts / Model Unavailable');
          env.sourcePage.appendChild(unavailable); reaction.actions[0].destinationId = unavailable.id;
        }
        if (problem === 'wrong exact') reaction.actions[0].destinationId = env.sources.analyticsValid.id;
        if (problem === 'animation') reaction.actions[0].transition = { type: 'SMART_ANIMATE', duration: 0.2 };
        if (problem === 'fake prediction') notReady.findAll(n => n.name === 'Semantic copy')[0].characters = 'MODEL_NOT_READY. Predicted value: 25.';
        if (problem === 'zero forecast') notReady.findAll(n => n.name === 'Semantic copy')[0].characters = 'MODEL_NOT_READY means zero forecast.';
        if (problem === 'predicted Analytics') analytics.appendChild(new env.Node('FRAME', 'Predicted Series component'));
        const missing = {
          'missing current banner': core.FLOW7_BOARD.currentBanner.name,
          'missing target banner': core.FLOW7_BOARD.targetBanner.name,
          'missing ACTUAL boundary': core.FLOW7_BOARD.seriesBoundary.name,
          'missing M13': core.FLOW7_BOARD.m13Boundary.name,
        }[problem];
        if (missing) stage.children.find(n => n.name === missing).remove();
        if (problem === 'target beside current') target.y = notReady.y;
        if (problem === 'extra target reaction') notReady.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
          { type: 'NODE', navigation: 'NAVIGATE', destinationId: target.id, transition: null },
        ] }];
      }
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 7 }), /BLOCKED: Flow 7 staging validation failed/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.equal(old.name, core.flowSectionName(7));
    assert.deepEqual(old.children.map(n => n.id), oldIds);
    assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  }
});

test('Flow 7 read-only validator rejects semantic and boundary loss', async () => {
  for (const problem of ['observed', 'not ready', 'zero conflation', 'model unavailable conflation', 'target semantics', 'series', 'provenance',
    'current target', 'M13', 'current banner', 'TARGET banner', 'END', 'direct target']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 7 });
    const { section, analytics, notReady, target, back } = flowSevenNodes(env);
    if (problem === 'observed') analytics.findAll(n => n.name === 'Chart heading')[0].characters = 'PREDICTED SERIES';
    if (problem === 'not ready') notReady.findAll(n => n.name === 'Result meaning')[0].characters = 'A zero forecast.';
    if (problem === 'zero conflation') notReady.findAll(n => n.name === 'Semantic copy')[0].characters += ' MODEL_NOT_READY means zero forecast.';
    if (problem === 'model unavailable conflation') notReady.findAll(n => n.name === 'Semantic copy')[0].characters += ' MODEL_NOT_READY is Model Unavailable.';
    if (problem === 'target semantics') target.findAll(n => n.name === 'Semantic copy')[0].characters = 'Forecast model validated: yes.';
    if (problem === 'series') target.findAll(n => n.name === 'Series reading')[0].findAll(n => n.name === 'Explanation')[0].characters = 'One undifferentiated chart.';
    if (problem === 'provenance') target.findAll(n => n.name === 'Provenance component')[0].remove();
    const missing = {
      'current target': core.FLOW7_BOARD.currentTarget.name,
      M13: core.FLOW7_BOARD.m13Boundary.name,
      'current banner': core.FLOW7_BOARD.currentBanner.name,
      'TARGET banner': core.FLOW7_BOARD.targetBanner.name,
      END: core.FLOW7_BOARD.currentEnd.name,
    }[problem];
    if (missing) section.children.find(n => n.name === missing).remove();
    if (problem === 'direct target') back.reactions[0].actions[0].destinationId = target.id;
    const before = JSON.stringify(section, (key, value) => key === 'parent' ? undefined : value);
    assert.match(await env.send({ type: 'validate' }), /Flow 7 .*: FAIL/);
    assert.equal(JSON.stringify(section, (key, value) => key === 'parent' ? undefined : value), before);
  }
});

test('Flow 7 clean rerun replaces only generated section; mixed/manual old content is archived', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 7 });
  const clean = flowSevenNodes(env).section;
  assert.match(await env.send({ type: 'build-flow', id: 7 }), /removed after validation/);
  assert.equal(clean.removed, true);
  const prior = flowSevenNodes(env).section;
  const manual = new env.Node('TEXT', 'Manual Flow 7 note'); prior.appendChild(manual);
  const clone = prior.children.find(n => n.name === core.cloneName(7, 'MODEL_NOT_READY'));
  clone.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.forecastTarget.id, transition: null },
  ] }];
  const original = structuredClone(clone.reactions);
  assert.match(await env.send({ type: 'build-flow', id: 7 }), /old section archived/);
  assert.match(prior.name, /^ARCHIVE — Flow 7/);
  assert.equal(manual.removed, false);
  assert.deepEqual(clone.reactions, original);
});

test('Flow 7 reaction failure and post-swap validation failure preserve prior canonical and protected pages', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 7 });
  const canonical = flowSevenNodes(env).section;
  const before = env.page().children.map(n => [n.id, n.name, n.children.map(c => c.id)]);
  const sourceBefore = env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.children.map(c => c.id)]);
  const setter = env.Node.prototype.setReactionsAsync;
  env.Node.prototype.setReactionsAsync = async function(value) {
    if (this.name === 'Open Historical Analytics') throw new Error('Reaction API failure');
    return setter.call(this, value);
  };
  assert.match(await env.send({ type: 'build-flow', id: 7 }), /BLOCKED: (?:Error: )?Reaction API failure/);
  env.Node.prototype.setReactionsAsync = setter;
  assert.deepEqual(env.page().children.map(n => [n.id, n.name, n.children.map(c => c.id)]), before);
  const lookup = env.figma.getNodeByIdAsync;
  env.figma.getNodeByIdAsync = async id => {
    if (env.page().children.some(n => n.name === core.flowSectionName(7) && n.id !== canonical.id &&
      n.children.some(c => c.name === core.cloneName(7, 'MODEL_NOT_READY') && c.id === id))) return null;
    return lookup(id);
  };
  assert.match(await env.send({ type: 'build-flow', id: 7 }), /BLOCKED: Flow 7 canonical validation failed/);
  env.figma.getNodeByIdAsync = lookup;
  assert.equal(canonical.name, core.flowSectionName(7));
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(7)).length, 1);
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  assert.deepEqual(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.children.map(c => c.id)]), sourceBefore);
});

function flowEightNodes(env) {
  const section = env.page().children.find(n => n.name === core.flowSectionName(8));
  const confirmation = section.children.find(n => n.name === core.cloneName(8, 'Confirmation Required'));
  const processing = section.children.find(n => n.name === core.cloneName(8, 'Processing'));
  const confirmed = section.children.find(n => n.name === core.cloneName(8, 'Confirmed Result'));
  const delivery = section.children.find(n => n.name === core.cloneName(8, 'Message Delivery Failure'));
  const confirm = confirmation.findAll(n => n.name === 'Confirm order / focus')[0];
  const result = section.children.find(n => n.name === core.FLOW8_BOARD.resultControl.name);
  const branch = section.children.find(n => n.name === core.FLOW8_BOARD.branchControl.name);
  const retry = section.children.find(n => n.name === core.FLOW8_BOARD.retryControl.name) ??
    delivery.findAll(n => n.name === 'Retry message action / focus')[0];
  return { section, confirmation, processing, confirmed, delivery, confirm, result, branch, retry };
}

test('Flow 8 uses four fresh customer clones, explicit product confirmation and separate communication recovery', async () => {
  const env = environment();
  for (let id = 1; id <= 7; id++) assert.match(await env.send({ type: 'build-flow', id }), /Built/);
  const prior = env.page().children.filter(n => [1, 2, 3, 4, 5, 6, 7].some(id => n.name === core.flowSectionName(id)));
  const archive = new env.Node('SECTION', 'ARCHIVE — Flow 7 — retained manual work');
  archive.appendChild(new env.Node('TEXT', 'Manual note')); env.page().appendChild(archive);
  const before = [...prior, archive].map(n => [n.id, n.name, n.children.map(c => c.id)]);
  const sources = env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.name, n.children.map(c => c.id)]);
  assert.match(await env.send({ type: 'build-flow', id: 8 }), /Confirm order: PRODUCT CONTROL; Processing result: PROTOTYPE CONTROL; delivery branch: PROTOTYPE CONTROL; Retry message: PRODUCT CONTROL/);
  const { section, confirmation, processing, confirmed, delivery, confirm, result, branch, retry } = flowEightNodes(env);
  assert.equal(section.children.filter(n => n.name.startsWith('3E / Flow 08 / ') && n.type === 'FRAME' &&
    ['Confirmation Required', 'Processing', 'Confirmed Result', 'Message Delivery Failure'].some(key => n.name === core.cloneName(8, key))).length, 4);
  assert.equal(confirm.reactions[0].actions[0].destinationId, processing.id);
  assert.equal(result.reactions[0].actions[0].destinationId, confirmed.id);
  assert.equal(branch.reactions[0].actions[0].destinationId, delivery.id);
  assert.equal(retry.reactions[0].actions[0].destinationId, confirmed.id);
  assert.ok(delivery.y > confirmed.y + confirmed.height);
  assert.ok(confirmation.findAll(n => n.name === 'Change details action').length === 1);
  assert.equal(section.children.some(n => n.name === core.cloneName(8, 'Confirmation Pending')), false);
  const report = await env.send({ type: 'validate' });
  for (let id = 1; id <= 8; id++) assert.match(report, new RegExp(`Flow ${id} .*: PASS`));
  assert.match(report, /Flow 8 broken destinations: 0/);
  assert.match(report, /Overall: PASS/);
  assert.deepEqual([...prior, archive].map(n => [n.id, n.name, n.children.map(c => c.id)]), before);
  assert.deepEqual(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.name, n.children.map(c => c.id)]), sources);
});

test('Flow 8 exact source resolution and missing or ambiguous Confirm order block before writing', async () => {
  for (const key of ['chatConfirmation', 'chatProcessing', 'chatConfirmed', 'chatDelivery']) for (const problem of ['missing', 'duplicate', 'wrong']) {
    const env = environment(); const source = env.sources[key];
    if (problem === 'missing') source.remove();
    if (problem === 'duplicate') source.parent.appendChild(source.clone());
    if (problem === 'wrong') source.type = 'TEXT';
    assert.match(await env.send({ type: 'build-flow', id: 8 }), /BLOCKED/);
    assert.equal(env.page(), undefined);
  }
  for (const problem of ['missing', 'hidden', 'wrong label', 'duplicate', 'pre-reactive']) {
    const env = environment();
    const button = env.sources.chatConfirmation.findAll(n => n.name === 'Confirm order / focus')[0];
    if (problem === 'missing') button.remove();
    if (problem === 'hidden') button.visible = false;
    if (problem === 'wrong label') button.findAll(n => n.name === 'Action label')[0].characters = 'Continue';
    if (problem === 'duplicate') button.parent.appendChild(button.clone());
    if (problem === 'pre-reactive') button.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.chatProcessing.id, transition: null },
    ] }];
    assert.match(await env.send({ type: 'build-flow', id: 8 }), /BLOCKED: Approved visible Confirm order PRODUCT CONTROL/);
    assert.equal(env.page().children.some(n => n.name === core.flowSectionName(8)), false);
  }
});

test('Flow 8 Retry message falls back to an external prototype control while preserving approved source reactions', async () => {
  for (const problem of ['missing', 'hidden', 'pre-reactive']) {
    const env = environment();
    const button = env.sources.chatDelivery.findAll(n => n.name === 'Retry message action / focus')[0];
    if (problem === 'missing') button.remove();
    if (problem === 'hidden') button.visible = false;
    if (problem === 'pre-reactive') button.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
      { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.chatConfirmed.id, transition: null },
    ] }];
    const original = structuredClone(button.reactions);
    assert.match(await env.send({ type: 'build-flow', id: 8 }), /Retry message: PROTOTYPE CONTROL/);
    const { section, confirmed, retry } = flowEightNodes(env);
    assert.equal(retry.name, core.FLOW8_BOARD.retryControl.name);
    assert.equal(retry.parent.id, section.id);
    assert.equal(retry.reactions[0].actions[0].destinationId, confirmed.id);
    assert.deepEqual(button.reactions, original);
    assert.match(await env.send({ type: 'validate' }), /Flow 8 .*: PASS/);
  }
});

test('Flow 8 blocks a retry control whose copy implies repeating the Order', async () => {
  const env = environment();
  env.sources.chatDelivery.findAll(n => n.name === 'Retry message action / focus')[0]
    .findAll(n => n.name === 'Action label')[0].characters = 'Repeat order';
  assert.match(await env.send({ type: 'build-flow', id: 8 }), /BLOCKED: Flow 8 staging validation failed/);
  assert.equal(env.page().children.some(n => n.name === core.flowSectionName(8)), false);
});

test('Flow 8 accepts normalized non-animated reactions on all product and prototype controls', async () => {
  for (const shape of ['absent transition', 'deprecated mirror', 'null transition']) {
    const env = environment();
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (!['Confirm order / focus', 'Retry message action / focus', core.FLOW8_BOARD.resultControl.name,
        core.FLOW8_BOARD.branchControl.name].includes(this.name)) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (shape === 'absent transition') delete reaction.actions[0].transition;
      if (shape === 'deprecated mirror') reaction.action = structuredClone(reaction.actions[0]);
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 8 }), /Built/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.match(await env.send({ type: 'validate' }), /Flow 8 .*: PASS/);
  }
});

test('Flow 8 external Retry message fallback accepts normalized reaction readback', async () => {
  for (const shape of ['absent transition', 'deprecated mirror']) {
    const env = environment();
    const sourceRetry = env.sources.chatDelivery.findAll(n => n.name === 'Retry message action / focus')[0];
    sourceRetry.visible = false;
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      if (this.name !== core.FLOW8_BOARD.retryControl.name) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      if (shape === 'absent transition') delete reaction.actions[0].transition;
      if (shape === 'deprecated mirror') reaction.action = structuredClone(reaction.actions[0]);
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 8 }), /Retry message: PROTOTYPE CONTROL/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.match(await env.send({ type: 'validate' }), /Flow 8 .*: PASS/);
  }
});

test('Flow 8 preserves legitimate 03D reactions on unrelated customer controls', async () => {
  const env = environment();
  const details = env.sources.chatConfirmation.findAll(n => n.name === 'Change details action')[0];
  details.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.conversationDefault.id, transition: null },
  ] }];
  const original = structuredClone(details.reactions);
  assert.match(await env.send({ type: 'build-flow', id: 8 }), /Built/);
  const clone = flowEightNodes(env).confirmation.findAll(n => n.name === 'Change details action')[0];
  assert.deepEqual(details.reactions, original);
  assert.deepEqual(clone.reactions, original);
  assert.match(await env.send({ type: 'validate' }), /Flow 8 .*: PASS/);
});

test('Flow 8 staging rejects confirmation bypass, business replay, animation, unsafe copy and geometry', async () => {
  for (const problem of ['confirm bypass', 'result bypass', 'branch wrong', 'retry processing', 'retry mutation',
    'animation', 'wrong trigger', 'extra product reaction', 'missing proposal', 'missing processing',
    'missing business boundary', 'missing no-replay', 'internal term', 'duplicate order', 'duplicate reservation',
    'narrow touch target', 'branch before confirmed']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 8 });
    const old = flowEightNodes(env).section;
    const oldIds = old.children.map(n => n.id);
    const setter = env.Node.prototype.setReactionsAsync;
    env.Node.prototype.setReactionsAsync = async function(value) {
      const isProgression = ['Confirm order / focus', 'Retry message action / focus', core.FLOW8_BOARD.resultControl.name,
        core.FLOW8_BOARD.branchControl.name].includes(this.name);
      if (!isProgression) return setter.call(this, value);
      const reaction = structuredClone(value[0]);
      let stage = this;
      while (stage && stage.type !== 'SECTION') stage = stage.parent;
      const confirmation = stage.children.find(n => n.name === core.cloneName(8, 'Confirmation Required'));
      const processing = stage.children.find(n => n.name === core.cloneName(8, 'Processing'));
      const confirmed = stage.children.find(n => n.name === core.cloneName(8, 'Confirmed Result'));
      const delivery = stage.children.find(n => n.name === core.cloneName(8, 'Message Delivery Failure'));
      if (this.name === 'Confirm order / focus' && problem === 'confirm bypass') reaction.actions[0].destinationId = confirmed.id;
      if (this.name === core.FLOW8_BOARD.resultControl.name && problem === 'result bypass') reaction.actions[0].destinationId = delivery.id;
      if (this.name === core.FLOW8_BOARD.branchControl.name && problem === 'branch wrong') reaction.actions[0].destinationId = processing.id;
      if (this.name === 'Retry message action / focus') {
        if (problem === 'retry processing') reaction.actions[0].destinationId = processing.id;
        if (problem === 'retry mutation') {
          const mutation = new env.Node('FRAME', 'Retry create_order mutation');
          env.sourcePage.appendChild(mutation); reaction.actions[0].destinationId = mutation.id;
        }
        if (problem === 'animation') reaction.actions[0].transition = { type: 'SMART_ANIMATE', duration: 0.2 };
        if (problem === 'wrong trigger') reaction.trigger.type = 'AFTER_TIMEOUT';
        if (problem === 'extra product reaction') delivery.reactions = [reaction];
        const missing = {
          'missing proposal': core.FLOW8_BOARD.proposalBoundary.name,
          'missing processing': core.FLOW8_BOARD.processingBoundary.name,
          'missing business boundary': core.FLOW8_BOARD.businessBoundary.name,
          'missing no-replay': core.FLOW8_BOARD.noReplay.name,
        }[problem];
        if (missing) stage.children.find(n => n.name === missing).remove();
        if (problem === 'internal term') delivery.findAll(n => n.name === 'Semantic copy')[0].characters += ' OUTCOME_UNKNOWN.';
        if (problem === 'duplicate order') delivery.findAll(n => n.name === 'Semantic copy')[0].characters += ' Repeat the order.';
        if (problem === 'duplicate reservation') delivery.findAll(n => n.name === 'Semantic copy')[0].characters += ' Repeat the reservation.';
        if (problem === 'narrow touch target') confirmation.findAll(n => n.name === 'Confirm order / focus')[0].width = 30;
        if (problem === 'branch before confirmed') delivery.y = processing.y;
      }
      this.reactions = [reaction];
    };
    assert.match(await env.send({ type: 'build-flow', id: 8 }), /BLOCKED: Flow 8 staging validation failed/);
    env.Node.prototype.setReactionsAsync = setter;
    assert.equal(old.name, core.flowSectionName(8));
    assert.deepEqual(old.children.map(n => n.id), oldIds);
    assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  }
});

test('Flow 8 validator stays read-only and catches customer, branch, replay and mobile violations', async () => {
  for (const problem of ['customer term', 'confirmation wording', 'processing success', 'confirmed result',
    'delivery fact', 'recovery note', 'primary END', 'recovery END', 'mobile clipping',
    'confirm destination', 'retry destination']) {
    const env = environment();
    await env.send({ type: 'build-flow', id: 8 });
    const { section, confirmation, processing, confirmed, delivery, confirm, retry } = flowEightNodes(env);
    if (problem === 'customer term') delivery.findAll(n => n.name === 'Semantic copy')[0].characters += ' ToolCall.';
    if (problem === 'confirmation wording') confirmation.findAll(n => n.name === 'Semantic copy')[0].characters = 'Order already created.';
    if (problem === 'processing success') processing.findAll(n => n.name === 'Semantic copy')[0].characters += ' Item reserved.';
    if (problem === 'confirmed result') confirmed.findAll(n => n.name === 'Semantic copy')[0].characters = 'No result.';
    if (problem === 'delivery fact') delivery.findAll(n => n.name === 'Semantic copy')[0].characters = 'Order failed.';
    if (problem === 'mobile clipping') confirm.x = 390;
    if (problem === 'confirm destination') confirm.reactions[0].actions[0].destinationId = confirmed.id;
    if (problem === 'retry destination') retry.reactions[0].actions[0].destinationId = processing.id;
    const missing = {
      'recovery note': core.FLOW8_BOARD.recoveryNote.name,
      'primary END': core.FLOW8_BOARD.primaryEnd.name,
      'recovery END': core.FLOW8_BOARD.recoveryEnd.name,
    }[problem];
    if (missing) section.children.find(n => n.name === missing).remove();
    const before = JSON.stringify(section, (key, value) => key === 'parent' ? undefined : value);
    assert.match(await env.send({ type: 'validate' }), /Flow 8 .*: FAIL/);
    assert.equal(JSON.stringify(section, (key, value) => key === 'parent' ? undefined : value), before);
  }
});

test('Flow 8 clean rerun removes generated prior section; manual/mixed content is archived', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 8 });
  const clean = flowEightNodes(env).section;
  assert.match(await env.send({ type: 'build-flow', id: 8 }), /removed after validation/);
  assert.equal(clean.removed, true);
  const prior = flowEightNodes(env).section;
  const manual = new env.Node('TEXT', 'Manual Web Chat annotation'); prior.appendChild(manual);
  const clone = prior.children.find(n => n.name === core.cloneName(8, 'Message Delivery Failure'));
  clone.reactions = [{ trigger: { type: 'ON_CLICK' }, actions: [
    { type: 'NODE', navigation: 'NAVIGATE', destinationId: env.sources.chatProcessing.id, transition: null },
  ] }];
  const original = structuredClone(clone.reactions);
  assert.match(await env.send({ type: 'build-flow', id: 8 }), /old section archived/);
  assert.match(prior.name, /^ARCHIVE — Flow 8/);
  assert.equal(manual.removed, false);
  assert.deepEqual(clone.reactions, original);
});

test('Flow 8 reaction failure and post-swap validation failure preserve prior canonical and protected pages', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 8 });
  const canonical = flowEightNodes(env).section;
  const before = env.page().children.map(n => [n.id, n.name, n.children.map(c => c.id)]);
  const sources = env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.children.map(c => c.id)]);
  const setter = env.Node.prototype.setReactionsAsync;
  env.Node.prototype.setReactionsAsync = async function(value) {
    if (this.name === 'Retry message action / focus') throw new Error('Reaction API failure');
    return setter.call(this, value);
  };
  assert.match(await env.send({ type: 'build-flow', id: 8 }), /BLOCKED: (?:Error: )?Reaction API failure/);
  env.Node.prototype.setReactionsAsync = setter;
  assert.deepEqual(env.page().children.map(n => [n.id, n.name, n.children.map(c => c.id)]), before);
  const lookup = env.figma.getNodeByIdAsync;
  env.figma.getNodeByIdAsync = async id => {
    if (env.page().children.some(n => n.name === core.flowSectionName(8) && n.id !== canonical.id &&
      n.children.some(c => c.name === core.cloneName(8, 'Processing') && c.id === id))) return null;
    return lookup(id);
  };
  assert.match(await env.send({ type: 'build-flow', id: 8 }), /BLOCKED: Flow 8 canonical validation failed/);
  env.figma.getNodeByIdAsync = lookup;
  assert.equal(canonical.name, core.flowSectionName(8));
  assert.equal(env.page().children.filter(n => n.name === core.flowSectionName(8)).length, 1);
  assert.equal(env.page().children.some(n => n.name.endsWith('/ staging')), false);
  assert.deepEqual(env.rootNode.children.filter(n => core.PROTECTED_PAGES.includes(n.name))
    .map(n => [n.id, n.children.map(c => c.id)]), sources);
});

test('source loss on rerun preserves the previously built flow', async () => {
  const env = environment();
  assert.match(await env.send({ type: 'build-flow', id: 3 }), /Built/);
  const section = env.page().children.find(n => n.name === core.flowSectionName(3));
  const old = section.children.find(n => n.name === core.cloneName(3, 'Known Failure'));
  env.sources.conversationFailure.remove();
  assert.match(await env.send({ type: 'build-flow', id: 3 }), /BLOCKED/);
  assert.ok(section.children.includes(old));
});

test('runtime rejection preserves previous approved flow and manual nodes', async () => {
  const env = environment();
  await env.send({ type: 'build-flow', id: 5 });
  const section = env.page().children.find(n => n.name === core.flowSectionName(5));
  const previous = section.children.find(n => n.name === core.cloneName(5, 'Conversation OUTCOME_UNKNOWN'));
  const manual = new env.Node('TEXT', 'Manual note'); section.appendChild(manual);
  const originalSetter = env.Node.prototype.setReactionsAsync;
  env.Node.prototype.setReactionsAsync = async () => { throw new Error('Runtime API unavailable'); };
  assert.match(await env.send({ type: 'build-flow', id: 5 }), /BLOCKED: (?:Error: )?Runtime API unavailable/);
  env.Node.prototype.setReactionsAsync = originalSetter;
  assert.ok(section.children.includes(previous));
  assert.ok(section.children.includes(manual));
  assert.equal(section.children.filter(n => n.name.startsWith('STAGING /')).length, 0);
});

test('static safety rules reject unknown bypass, delivery replay, and missing M12/M13 boundaries', () => {
  const purchase = structuredClone(core.FLOWS[1]); purchase.edges[0].to = 'Confirmed Result';
  assert.match(core.graphErrors(purchase).join(' '), /Flow 2 must follow customer confirmation/);
  const unknown = structuredClone(core.FLOWS[4]); unknown.edges[0].to = 'unknown';
  assert.match(core.graphErrors(unknown).join(' '), /OUTCOME_UNKNOWN bypasses reconciliation/);
  const delivery = structuredClone(core.FLOWS[7]); delivery.edges[3].to = 'Processing';
  assert.match(core.graphErrors(delivery).join(' '), /Delivery recovery may replay business mutation/);
  const m12 = structuredClone(core.FLOWS[5]); m12.notes = [];
  assert.match(core.graphErrors(m12).join(' '), /M12 TARGET boundary missing/);
  const m13 = structuredClone(core.FLOWS[6]); m13.frames = m13.frames.filter(f => f.key !== 'TARGET Ready');
  assert.match(core.graphErrors(m13).join(' '), /M13 current\/TARGET boundary missing/);
});

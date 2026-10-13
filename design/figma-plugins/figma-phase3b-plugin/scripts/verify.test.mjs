import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFile(resolve(root, path), 'utf8');

test('manifest points to built classic-plugin artifacts', async () => {
  const manifest = JSON.parse(await read('manifest.json'));
  assert.equal(manifest.name, 'Diploma UX — Phase 3B');
  assert.equal('id' in manifest, false);
  assert.equal(manifest.documentAccess, 'dynamic-page');
  assert.deepEqual(manifest.editorType, ['figma']);
  assert.deepEqual(manifest.networkAccess.allowedDomains, ['none']);
  await stat(resolve(root, manifest.main));
  await stat(resolve(root, manifest.ui));
  assert.equal(await read(manifest.ui), await read('src/ui.html'));
});

test('bundle and UI have Figma message plumbing without Node imports', async () => {
  const code = await read('dist/code.js');
  const ui = await read('dist/ui.html');
  assert.match(code, /figma\.ui\.onmessage/);
  assert.match(code, /figma\.ui\.postMessage/);
  assert.match(ui, /parent\.postMessage/);
  assert.match(ui, /event\.data\.pluginMessage/);
  assert.doesNotMatch(code, /require\(["']node:|from ["']node:/);
  assert.doesNotMatch(code, /getPluginData|setPluginData/);
  assert.doesNotMatch(await read('src/figma-utils.ts'), /getPluginData|setPluginData/);
  assert.doesNotMatch(ui, /Build All/);
});

function createFigmaMock() {
  let nextId = 0;
  const node = (type, name) => {
    const item = {
      id: String(++nextId), type, name, parent: null, children: [], x: 0, y: 0, width: 100, height: 100,
      resize(width, height) { this.width = width; this.height = height; },
      appendChild(child) {
        if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
        this.children.push(child);
        child.parent = this;
      },
      remove() {
        if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
        this.parent = null;
      },
      findAll(predicate = () => true) {
        const found = [];
        for (const child of this.children) {
          if (predicate(child)) found.push(child);
          found.push(...child.findAll(predicate));
        }
        return found;
      },
      get absoluteBoundingBox() { return { x: this.x, y: this.y, width: this.width, height: this.height }; },
      async loadAsync() {},
    };
    return item;
  };
  const root = { name: 'Diplom — Multi-Agent Platform UX/UI', children: [] };
  const baseline = node('PAGE', '03A — Low-Fi Wireframes');
  const target = node('PAGE', '03B — UX Review & Revisions');
  baseline.parent = root;
  target.parent = root;
  root.children.push(baseline, target);
  const conversation = node('FRAME', '02 — Conversations Revised');
  target.appendChild(conversation);
  const manual = node('FRAME', 'Manual Escalations partial');
  target.appendChild(manual);
  const messages = [];
  const figma = {
    root, fileKey: 'OFXTN83nFl3RqukrEYQrFy', currentPage: baseline,
    ui: { onmessage: null, postMessage(message) { messages.push(message); } },
    showUI() {}, notify() {},
    viewport: { scrollAndZoomIntoView() {} },
    async setCurrentPageAsync(page) { this.currentPage = page; },
    async loadFontAsync() {},
    createFrame() { const result = node('FRAME', 'Frame'); this.currentPage.appendChild(result); return result; },
    createText() { const result = node('TEXT', 'Text'); this.currentPage.appendChild(result); return result; },
    createRectangle() { const result = node('RECTANGLE', 'Rectangle'); this.currentPage.appendChild(result); return result; },
  };
  return { figma, target, baseline, conversation, manual, messages, node };
}

test('all builder paths are idempotent without plugin ID; 03A, Conversations and manual nodes survive', async () => {
  const mock = createFigmaMock();
  runInNewContext(await read('dist/code.js'), { figma: mock.figma, __html__: '' });
  const invoke = async action => {
    await mock.figma.ui.onmessage({ action });
    return mock.messages.at(-1);
  };
  const before = mock.target.findAll().length;
  assert.equal((await invoke('inspect')).ok, true);
  assert.equal(mock.target.findAll().length, before);
  assert.equal((await invoke('validate')).ok, true);
  assert.equal(mock.target.findAll().length, before);

  const cases = [
    ['escalations', '03 — Escalations Revised', 8],
    ['orders', '04 — Orders Revised', 8],
    ['webChat', '05 — Customer Web Chat Revised', 10],
    ['analytics', '06 — Analytics Revised', 7],
    ['forecasts', '07 — Forecasts Revised', 8],
    ['walkthroughs', '08 — Scenario Walkthroughs', 6],
  ];
  for (const [action, label, count] of cases) {
    assert.equal((await invoke(action)).ok, true, `${action} first run`);
    const sectionName = `3B / Plugin / ${label}`;
    const sections = mock.target.children.filter(item => item.name === sectionName);
    assert.equal(sections.length, 1);
    const section = sections[0];
    const generated = section.children.filter(item => item.type === 'FRAME' && item.name.startsWith('3B / '));
    assert.equal(generated.length, count);
    if (action === 'escalations') {
      const frame = name => generated.find(item => item.name === `3B / Escalations / ${name}`);
      const content = item => item.findAll(layer => layer.type === 'TEXT').map(layer => layer.characters).join('\n');
      const queue = content(frame('Queue Revised'));
      const decision = content(frame('Decision Context'));
      const unknownOutcome = content(frame('OUTCOME_UNKNOWN'));
      const e02 = content(frame('E02 Update Restricted'));
      const resume = content(frame('Resume Pending'));
      for (const label of ['WHY AUTOMATION STOPPED', 'CONFIRMED FACTS', 'UNCERTAIN EFFECT', 'CONSTRAINTS', 'NEXT SAFE STEP', 'HUMAN DECISION']) {
        assert.ok(decision.includes(label), `Decision Context missing ${label}`);
      }
      assert.ok(decision.indexOf('WHY AUTOMATION STOPPED') < decision.indexOf('CONFIRMED FACTS'));
      assert.ok(decision.indexOf('CONFIRMED FACTS') < decision.indexOf('UNCERTAIN EFFECT'));
      assert.ok(decision.indexOf('UNCERTAIN EFFECT') < decision.indexOf('CONSTRAINTS'));
      assert.ok(decision.indexOf('CONSTRAINTS') < decision.indexOf('NEXT SAFE STEP'));
      assert.doesNotMatch(decision, /E02/);
      assert.doesNotMatch(unknownOutcome, /E02/);
      assert.match(unknownOutcome, /Reconciliation required|Reconciliation Required/);
      assert.match(unknownOutcome, /DO NOT retry mutation/);
      assert.match(e02, /E02 — UPDATE RESTRICTED/);
      assert.match(e02, /update_order mutation remains restricted/);
      for (const label of ['approve proposed continuation', 'Reject proposed continuation', 'Request clarification', 'Revalidate → Resume request', 'Close escalation']) {
        assert.ok(decision.includes(label), `Contextual action missing ${label}`);
      }
      const actionNames = frame('Decision Context').findAll(layer => layer.type === 'FRAME' && layer.name.startsWith('Action / ')).map(layer => layer.name);
      assert.ok(actionNames.every(name => !['Action / Approve', 'Action / Reject', 'Action / Clarify'].includes(name)));
      assert.match(resume, /Human decision → Revalidation → Safe resume request/);
      assert.match(resume, /No mutation replay/);
      assert.match(resume, /TARGET M12/);
      assert.match(queue, /Waiting assignment/);
      assert.match(queue, /Assigned/);
      assert.match(queue, /OUTCOME_UNKNOWN/);
      assert.match(queue, /Resume pending — TARGET M12/);
      const dividers = section.findAll(item => item.type === 'RECTANGLE');
      assert.ok(dividers.every(item => item.name === 'Low-fi divider' && item.width > 100), 'No tiny isolated divider artifacts');
      generated[0].findAll(item => item.type === 'TEXT')[0].name = 'Auto-named from characters';
    }
    if (action === 'orders') {
      const orderFrame = name => generated.find(item => item.name === `3B / Orders / Detail / ${name}`);
      const content = item => item.findAll(layer => layer.type === 'TEXT').map(layer => layer.characters).join('\n');
      const failed = content(orderFrame('Reservation Failed'));
      const uncertain = content(orderFrame('OUTCOME_UNKNOWN'));
      assert.match(failed, /RESERVATION STATE\nFailed\nInventory is not reserved\./);
      assert.match(failed, /NEXT STEP\nReview current inventory\.\nChoose an authorized recovery path\./);
      assert.doesNotMatch(failed, /reconcil/i);
      assert.doesNotMatch(failed, /Reconcile state/);
      assert.match(uncertain, /Effect may have committed/);
      assert.match(uncertain, /Confirmation unavailable/);
      assert.match(uncertain, /Reconcile against source of truth/);
      assert.match(uncertain, /Do not retry reserve_inventory until outcome is known/);
    }
    if (action === 'webChat') {
      const chatFrame = name => generated.find(item => item.name === `3B / Web Chat / ${name}`);
      const content = item => item.findAll(layer => layer.type === 'TEXT').map(layer => layer.characters).join('\n');
      const actions = item => item.findAll(layer => layer.type === 'FRAME' && layer.name.startsWith('Action / ')).map(layer => layer.name);
      const confirmation = chatFrame('Confirmation Required');
      assert.deepEqual(actions(confirmation), ['Action / Confirm order', 'Action / Change details']);
      assert.equal(actions(chatFrame('Processing')).length, 0);
      assert.match(content(chatFrame('Processing')), /We'll update you here when the result is available/);
      const failure = content(chatFrame('Known Failure'));
      assert.match(failure, /Your order was created, but the item was not reserved/);
      assert.match(failure, /Please don't place the same order again/);
      assert.match(failure, /We will help you with the next step/);
      assert.match(content(chatFrame('Confirmation Pending')), /Please do not submit the same request again/);
      assert.match(content(chatFrame('Delivery or Connection Failure')), /Your reservation remains confirmed/);
      assert.match(content(chatFrame('Delivery or Connection Failure')), /Message not delivered/);
      for (const frame of generated) {
        assert.doesNotMatch(content(frame), /create_order|reserve_inventory|OUTCOME_UNKNOWN|ToolCall|Agent Run|LangGraph|Audit|internal confidence|tool schemas/i);
      }
    }
    const unknown = mock.node('FRAME', `Manual note inside ${label}`);
    section.appendChild(unknown);
    if (action === 'escalations') {
      const nested = mock.node('FRAME', 'Manual nested frame');
      generated[0].appendChild(nested);
      assert.equal((await invoke(action)).ok, false, 'unknown nested frame must block replacement');
      assert.equal(nested.parent, generated[0]);
      nested.remove();
    }
    assert.equal((await invoke(action)).ok, true, `${action} rerun`);
    assert.equal(mock.target.children.filter(item => item.name === sectionName).length, 1);
    assert.equal(section.children.filter(item => item.type === 'FRAME' && item.name.startsWith('3B / ')).length, count);
    assert.equal(unknown.parent, section);
  }
  assert.equal(mock.baseline.children.length, 0);
  assert.equal(mock.conversation.parent, mock.target);
  assert.equal(mock.manual.parent, mock.target);
  assert.match((await invoke('validate')).report, /Scenario Walkthroughs: 6\/6/);

  const collision = mock.node('FRAME', '3B / Orders / Detail / Reservation Confirmed');
  mock.target.appendChild(collision);
  const countBeforeCollision = mock.target.findAll().length;
  assert.equal((await invoke('orders')).ok, false);
  assert.equal(mock.target.findAll().length, countBeforeCollision);
  assert.equal(collision.parent, mock.target);
});

test('inspection is read-only and validation reports exact scenario coverage', async () => {
  const result = await build({
    absWorkingDir: root,
    entryPoints: ['./src/validators/phase3b.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
    logLevel: 'silent',
  });
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`;
  const { inspectPage, validatePage } = await import(moduleUrl);
  const names = [
    '02 — Conversations Revised',
    '3B / Escalations / Queue Revised', '3B / Escalations / Decision Context',
    '3B / Orders / Detail / Reservation Confirmed', '3B / Orders / Detail / Reservation Failed',
    '3B / Orders / Detail / OUTCOME_UNKNOWN', '3B / Orders / E02 Restricted',
    '3B / Web Chat / Initial', '3B / Web Chat / Active',
    '3B / Analytics / Valid Result', '3B / Analytics / Dependency Unavailable',
    '3B / Forecasts / TARGET Ready', '3B / Forecasts / MODEL_NOT_READY',
    '3B / Scenario / 1 Product Availability',
    '3B / Scenario / 2 Purchase Successful Reservation',
    '3B / Scenario / 3 Purchase Reservation Failure',
    '3B / Scenario / 4 Support Sales Handoff',
    '3B / Scenario / 5 OUTCOME_UNKNOWN Escalation',
    '3B / Scenario / 6 Analytics Forecast',
  ];
  const nodes = names.map(name => ({ name, type: 'FRAME' }));
  nodes.push({ name: 'semantic text', type: 'TEXT', characters: 'ORDER STATE / RESERVATION STATE / restricted / Resume / Reconciliation' });
  const page = { findAll: () => nodes };
  assert.match(inspectPage(page), /Conversations: FOUND/);
  assert.match(inspectPage(page), /Reconciliation: FOUND/);
  const report = validatePage(page);
  assert.match(report, /Scenario Walkthroughs: 6\/6/);
  assert.match(report, /Structural checks: 17\/17 PASS/);
  const partial = { findAll: () => [{ name: 'Existing Escalations partial', type: 'FRAME' }] };
  assert.match(inspectPage(partial), /Escalations: PARTIAL/);
  assert.match(validatePage(partial), /Escalations Queue present: PARTIAL/);
});

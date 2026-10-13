import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundled = await build({
  absWorkingDir: root, entryPoints: ['./scripts/test-entry.ts'],
  bundle: true, platform: 'node', format: 'esm', write: false, outdir: 'test-bundle',
});
const apiModule = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const { ownership: own, figmaUtils: utils, designSystem: ds, sharedShell: shell, conversations, escalations, orders, webChat, analytics, forecasts, inspector, validator, escalationValidator, orderValidator, webChatValidator, analyticsValidator, forecastValidator, aggregateValidator, constants } = apiModule;

let id = 0;
class Node {
  constructor(type, name = '') { this.type = type; this.name = name; this.id = String(++id); this.children = []; this.parent = null; this.width = 0; this.height = type === 'TEXT' ? 22 : 0; this._characters = ''; }
  get characters() { return this._characters; }
  set characters(value) { this._characters = this.textTransform ? this.textTransform(value) : value; this.reflow(); }
  reflow() {
    if (this.type !== 'TEXT' || this.textAutoResize !== 'HEIGHT' || !this.width) return;
    const size = this.fontSize || 12;
    const width = [...this._characters].reduce((sum, c) => sum + size * (c === ' ' ? 0.33 : /[А-Яа-яЁёІіҚқҢңҒғҮүҰұӨөҺһ]/u.test(c) ? 0.64 : 0.54), 0);
    this.height = Math.max(1, Math.ceil(width / this.width)) * (this.lineHeight?.value || 20);
  }
  appendChild(node) { if (node.parent) node.parent.children = node.parent.children.filter(n => n !== node); this.children.push(node); node.parent = this; }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(n => n !== this); this.parent = null; }
  resize(w, h) { this.width = w; this.height = h; this.reflow(); }
  findAll(predicate) { const out = []; const visit = n => { for (const child of n.children) { if (predicate(child)) out.push(child); visit(child); } }; visit(this); return out; }
  async loadAsync() {}
  createInstance() {
    const clone = (source, type = source.type) => {
      const n = new Node(type, source.name); n.x = source.x; n.y = source.y; n.resize(source.width, source.height);
      n._characters = source.characters; n.fontSize = source.fontSize; n.lineHeight = source.lineHeight; n.textAutoResize = source.textAutoResize;
      for (const child of source.children) n.appendChild(clone(child));
      return n;
    };
    const instance = clone(this, 'INSTANCE');
    if (this.protectInstanceChildren) for (const child of instance.findAll(() => true)) {
      for (const property of ['x', 'y', 'relativeTransform', 'layoutPositioning', 'textAutoResize']) {
        let value = child[property];
        Object.defineProperty(child, property, {
          configurable: true, get() { return value; },
          set() { throw new Error('This property cannot be overridden in an instance: relative-transform'); },
        });
      }
      child.resize = () => { throw new Error('This property cannot be overridden in an instance: relative-transform'); };
    }
    return instance;
  }
}
function createMock(options = {}) {
  const rootNode = new Node('DOCUMENT', constants.FILE_NAME);
  const historical = ['03A — Low-Fi Wireframes', '03B — UX Review & Revisions', constants.DESIGN_PAGE].map(name => {
    const p = new Node('PAGE', name); rootNode.appendChild(p); p.appendChild(new Node('FRAME', `Manual / ${name}`)); return p;
  });
  const design = historical[2];
  const appendDirect = design.appendChild.bind(design);
  for (const name of Object.values(constants.DESIGN_SECTIONS)) appendDirect(new Node('FRAME', name));
  design.appendChild = node => {
    if (node.name.startsWith('Component / ')) {
      const section = design.children.find(n => n.name === constants.designSectionFor(node.name));
      section.appendChild(node);
    } else appendDirect(node);
  };
  const api = {
    root: rootNode, fileKey: constants.FILE_KEY, currentPage: historical[0],
    createPage() { const p = new Node('PAGE'); rootNode.appendChild(p); return p; },
    createFrame() { return new Node('FRAME'); }, createText() { const n = new Node('TEXT'); n.textTransform = options.textTransform; return n; },
    async setCurrentPageAsync(page) { api.currentPage = page; }, async loadFontAsync() {},
    variables: { async getLocalVariableCollectionsAsync() { return []; }, async getLocalVariablesAsync() { return []; }, setBoundVariableForPaint(p) { return p; } },
  };
  return { api, historical };
}

test('canonical file and target-page guards protect 03A/03B/03C', () => {
  assert.throws(() => own.assertCanonicalFile('Other file', constants.FILE_KEY));
  assert.throws(() => own.assertCanonicalFile(constants.FILE_NAME, 'wrong-key'));
  for (const name of ['03A — Low-Fi Wireframes', '03B — UX Review & Revisions', constants.DESIGN_PAGE]) assert.throws(() => own.assertWritablePage(name));
  assert.doesNotThrow(() => own.assertWritablePage(constants.TARGET_PAGE));
});

test('exact-name replacement is idempotent, retains manual nodes and rejects ambiguous ownership', () => {
  const parent = new Node('FRAME');
  const old = new Node('FRAME', '3D / Shell / Staff Desktop'); parent.appendChild(old);
  const custom = new Node('FRAME', 'Manual note'); old.appendChild(custom);
  const unrelated = new Node('FRAME', 'Manual sibling'); parent.appendChild(unrelated);
  const staged = new Node('FRAME', '3D / Shell / Staff Desktop / staging'); parent.appendChild(staged);
  own.replaceOwned(parent, ['3D / Shell / Staff Desktop'], [staged]);
  assert.equal(parent.children.filter(n => n.name === '3D / Shell / Staff Desktop').length, 1);
  assert.equal(custom.parent, staged);
  assert.equal(unrelated.parent, parent);
  const duplicate = new Node('FRAME', '3D / Shell / Staff Desktop'); parent.appendChild(duplicate);
  assert.throws(() => own.preflightOwned(parent, ['3D / Shell / Staff Desktop']), /Duplicate/);
  duplicate.remove();
  const wrong = new Node('TEXT', '3D / Conversations / Default'); parent.appendChild(wrong);
  assert.throws(() => own.preflightOwned(parent, ['3D / Conversations / Default']), /non-FRAME/);
});

test('Shared Shell alone renders Audit/Agent Runs as restricted links, not Disabled', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const restrictedSource = new Node('COMPONENT', 'Component / Navigation / Restricted Link');
  restrictedSource.resize(470, 66); historical[2].appendChild(restrictedSource);
  const originalHistorical = historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}`));
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage();
  shell.buildSharedShell(page);
  assert.equal(page.children.some(n => n.name === constants.SECTIONS.conversations), false);
  const section = page.children.find(n => n.name === constants.SECTIONS.shell);
  const specimen = section.children.find(n => n.name === constants.SHELL_NAME);
  for (const [destination, marker] of [['Audit', 'Restricted / permissioned'], ['Agent Runs', 'Contextual / restricted']]) {
    const row = specimen.findAll(n => n.name === `Restricted link / Administration / ${destination}`)[0];
    assert.equal(row?.type, 'FRAME');
    assert.match(utils.allText(row), new RegExp(marker));
    assert.ok(row.strokes.length, `${destination} has a restricted border, not disabled styling`);
    assert.doesNotMatch(utils.allText(row), /Disabled/);
  }
  assert.equal(specimen.findAll(n => n.name === 'Nested / Administration / Settings')[0]?.type, 'TEXT');
  assert.ok(specimen.findAll(n => n.type === 'INSTANCE' && n.name === 'Phase 3C / Restricted Link reference').length);
  assert.match(utils.allText(specimen), /BUSINESS SWITCH[\s\S]*North Shop[\s\S]*CURRENT BUSINESS/);
  assert.match(utils.allText(specimen), /Visible navigation does not grant backend access/);
  assert.equal(validator.validateSharedShell(page).pass, true);
  const manual = new Node('TEXT', 'Manual shell note'); specimen.appendChild(manual);
  shell.buildSharedShell(page);
  assert.equal(section.children.filter(n => n.name === constants.SHELL_NAME).length, 1);
  assert.ok(section.findAll(n => n.name === 'Manual shell note').length);
  assert.equal(page.children.some(n => n.name === constants.SECTIONS.conversations), false);
  assert.deepEqual(historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}`)), originalHistorical);
});

test('inspectors are read-only and builders create only 03D with 13 safe variants', async () => {
  const { api, historical } = createMock();
  globalThis.figma = api;
  const before = historical.map(p => p.children.map(c => c.name));
  const emptyInspection = await inspector.inspectPhase3D();
  assert.equal(emptyInspection.pageExists, false);
  assert.equal(api.root.children.length, 3);
  await ds.inspectDesignSystem();
  assert.deepEqual(historical.map(p => p.children.map(c => c.name)), before);

  await ds.loadDesignAssets();
  await utils.loadFonts();
  const page = await utils.writablePage();
  shell.buildSharedShell(page);
  conversations.buildConversations(page);
  assert.equal(api.root.children.length, 4);
  assert.deepEqual(historical.map(p => p.children.map(c => c.name)), before);
  assert.equal(inspector.formatInspection(await inspector.inspectPhase3D()).includes('13/13'), true);
  const shellSection = page.children.find(n => n.name === constants.SECTIONS.shell);
  const conversationSection = page.children.find(n => n.name === constants.SECTIONS.conversations);
  assert.equal(conversationSection.children.filter(n => n.name.startsWith('3D / Conversations / ')).length, 13);
  const shellFrame = shellSection.children.find(n => n.name === constants.SHELL_NAME);
  shellFrame.appendChild(new Node('TEXT', 'Manual annotation'));
  conversationSection.appendChild(new Node('FRAME', 'Manual / review')); 
  shell.buildSharedShell(page);
  conversations.buildConversations(page);
  assert.equal(shellSection.children.filter(n => n.name === constants.SHELL_NAME).length, 1);
  assert.equal(conversationSection.children.filter(n => n.name.startsWith('3D / Conversations / ')).length, 13);
  assert.ok(shellSection.findAll(n => n.name === 'Manual annotation').length);
  assert.ok(conversationSection.children.some(n => n.name === 'Manual / review'));
  assert.deepEqual(historical.map(p => p.children.map(c => c.name)), before);

  const shellValidation = validator.validateSharedShell(page);
  const conversationValidation = validator.validateConversations(page);
  const validationSnapshot = page.findAll(() => true).map(n => `${n.id}:${n.name}`);
  validator.validateSharedShell(page); validator.validateConversations(page);
  assert.deepEqual(page.findAll(() => true).map(n => `${n.id}:${n.name}`), validationSnapshot);
  assert.equal(shellValidation.pass, true, shellValidation.checks.filter(c => !c.pass).map(c => c.label).join(', '));
  assert.equal(conversationValidation.pass, true, conversationValidation.checks.filter(c => !c.pass).map(c => c.label).join(', '));
  const report = validator.formatValidation(shellValidation, conversationValidation);
  assert.match(report, /OUTCOME_UNKNOWN.*PASS/);
  assert.match(report, /Delivery \/ Business Effect separation: PASS/);
  const unknown = conversationSection.children.find(n => n.name === constants.conversationName('OUTCOME_UNKNOWN'));
  const confirmed = conversationSection.children.find(n => n.name === constants.conversationName('Confirmed Result'));
  const failure = conversationSection.children.find(n => n.name === constants.conversationName('Known Failure'));
  const handoff = conversationSection.children.find(n => n.name === constants.conversationName('Support to Sales Handoff'));
  const proposal = conversationSection.children.find(n => n.name === constants.conversationName('Awaiting Confirmation'));
  const delivery = conversationSection.children.find(n => n.name === constants.conversationName('Delivery Failure'));
  assert.match(utils.allText(unknown), /may have committed[\s\S]*Confirmation unavailable[\s\S]*OPERATION REFERENCE[\s\S]*RECONCILIATION[\s\S]*Reconcile authoritative reservation state[\s\S]*Do not retry mutation blindly/);
  assert.match(utils.allText(failure), /Inventory was not reserved[\s\S]*Review current inventory/);
  assert.match(utils.allText(handoff), /Permissions do not transfer/);
  assert.match(utils.allText(proposal), /NOT EXECUTED/);
  assert.match(utils.allText(proposal), /Awaiting customer confirmation before action can proceed/);
  assert.doesNotMatch(utils.allText(proposal), /Reply paused while the result is checked/);
  assert.equal(proposal.findAll(n => n.name === 'Send message').length, 1);
  for (const screen of [confirmed, failure, unknown]) {
    const workspace = screen.findAll(n => n.name === 'Conversation Workspace')[0];
    const regions = workspace.children.filter(n => n.name === 'Business Action Result');
    assert.equal(regions.length, 1);
    assert.equal(workspace.findAll(n => n.name === 'Business-result message').length, 0);
    assert.ok(regions[0].children.every(n => n.type === 'TEXT'));
    assert.equal(workspace.findAll(n => n.type === 'INSTANCE' && n.name.includes('Action Result')).length, 0);
  }
  const deliveryRegion = delivery.findAll(n => n.name === 'Delivery State')[0];
  assert.equal(delivery.findAll(n => n.name === 'Business-result message').length, 0);
  assert.ok(deliveryRegion.children.every(n => n.type === 'TEXT'));
  assert.match(utils.allText(deliveryRegion), /BUSINESS EFFECT[\s\S]*Reservation confirmed[\s\S]*COMMUNICATION[\s\S]*Message delivery failed[\s\S]*NEXT SAFE STEP[\s\S]*Retry communication only[\s\S]*Do not repeat reserve_inventory/);
  assert.ok(conversationValidation.checks.find(c => c.label === 'Message delivery layout fits')?.pass);
});

test('result validator rejects duplicate, overlapping and overflowing compositions', async () => {
  const { api } = createMock(); globalThis.figma = api;
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); conversations.buildConversations(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.conversations);
  const cases = [
    ['Confirmed Result', 'Confirmed result region unique', 'Confirmed result layout fits', 'Business Action Result'],
    ['Known Failure', 'Known failure result region unique', 'Known failure result layout fits', 'Business Action Result'],
    ['OUTCOME_UNKNOWN', 'OUTCOME_UNKNOWN result region unique', 'OUTCOME_UNKNOWN result layout fits', 'Business Action Result'],
    ['Delivery Failure', 'Message delivery result region unique', 'Message delivery layout fits', 'Delivery State'],
  ];
  const passed = label => validator.validateConversations(page).checks.find(c => c.label === label)?.pass;
  for (const [key, uniqueLabel, layoutLabel, regionName] of cases) {
    const screen = section.children.find(n => n.name === constants.conversationName(key));
    const workspace = screen.findAll(n => n.name === 'Conversation Workspace')[0];
    const region = workspace.children.find(n => n.name === regionName);
    assert.equal(passed(uniqueLabel), true, key);
    assert.equal(passed(layoutLabel), true, key);
    const duplicate = new Node('FRAME', regionName); duplicate.resize(20, 20); workspace.appendChild(duplicate);
    assert.equal(passed(uniqueLabel), false, `${key} duplicate detected`);
    duplicate.remove();
    const first = region.children[0], second = region.children[1], originalY = second.y;
    second.y = first.y;
    assert.equal(passed(layoutLabel), false, `${key} text overlap detected`);
    second.y = originalY;
    const originalHeight = region.height; region.resize(region.width, 20);
    assert.equal(passed(layoutLabel), false, `${key} text overflow detected`);
    region.resize(region.width, originalHeight);
    const sibling = new Node('FRAME', 'Unowned semantic card'); sibling.resize(40, 40); sibling.x = region.x + 20; sibling.y = region.y + 20; workspace.appendChild(sibling);
    assert.equal(passed(layoutLabel), false, `${key} sibling overlap detected`);
    sibling.remove();
    assert.equal(passed(layoutLabel), true, `${key} restored`);
  }
});

test('long RU/KZ copy wraps, expands its result and leaves later variant rows separated', async () => {
  const longCopy = 'Reconcile authoritative reservation state. Do not retry mutation blindly. ' +
    'Сначала проверьте актуальное состояние резервации в надёжном источнике. ' +
    'Растау қолжетімсіз болса, қайталама әрекет жасамаңыз. ' +
    'Сообщите оператору ссылку на заказ и результат сверки.';
  const { api } = createMock({ textTransform: value => value === 'Reconcile authoritative reservation state. Do not retry mutation blindly.' ? longCopy : value });
  globalThis.figma = api;
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); conversations.buildConversations(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.conversations);
  const unknown = section.children.find(n => n.name === constants.conversationName('OUTCOME_UNKNOWN'));
  const delivery = section.children.find(n => n.name === constants.conversationName('Delivery Failure'));
  const region = unknown.findAll(n => n.name === 'Business Action Result')[0];
  const workspace = unknown.findAll(n => n.name === 'Conversation Workspace')[0];
  const composer = workspace.children.find(n => n.name === 'Composer');
  assert.ok(region.height > 190);
  assert.ok(composer.y >= region.y + region.height + 20);
  assert.ok(unknown.y + unknown.height + 32 <= delivery.y);
  assert.equal(validator.validateConversations(page).checks.find(c => c.label === 'OUTCOME_UNKNOWN result layout fits')?.pass, true);
});

test('rebuild removes only legacy generated result layers while preserving manual descendants', async () => {
  const { api } = createMock(); globalThis.figma = api;
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); conversations.buildConversations(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.conversations);
  for (const [key, regionName, legacyName] of [
    ['Confirmed Result', 'Business Action Result', 'Authoritative result'],
    ['Known Failure', 'Business Action Result', 'Authoritative result'],
    ['OUTCOME_UNKNOWN', 'Business Action Result', 'Phase 3C / Authoritative Action Result'],
    ['Delivery Failure', 'Delivery State', 'Business Effect'],
  ]) {
    const screen = section.children.find(n => n.name === constants.conversationName(key));
    const workspace = screen.findAll(n => n.name === 'Conversation Workspace')[0];
    const region = screen.findAll(n => n.name === regionName)[0];
    const thread = workspace.children.find(n => n.name === 'Message Thread');
    const oldEvent = new Node('FRAME', 'Business-result message'); oldEvent.resize(608, 58); thread.appendChild(oldEvent);
    oldEvent.appendChild(new Node('TEXT', 'Result sender'));
    const legacy = new Node(legacyName.startsWith('Phase 3C') ? 'INSTANCE' : 'FRAME', legacyName);
    legacy.resize(310, 178); region.appendChild(legacy);
    const oldLabel = new Node('TEXT', legacyName === 'Business Effect' ? 'Business effect label' : 'Result label');
    legacy.appendChild(oldLabel);
    const manual = new Node('TEXT', `Manual note / ${key}`); legacy.appendChild(manual);
    region.appendChild(new Node('TEXT', 'Result metadata heading'));
    if (key === 'Confirmed Result') {
      const adjacent = new Node('INSTANCE', 'Phase 3C / Authoritative Action Result'); adjacent.resize(310, 178); workspace.appendChild(adjacent);
    }
  }
  conversations.buildConversations(page);
  for (const key of ['Confirmed Result', 'Known Failure', 'OUTCOME_UNKNOWN', 'Delivery Failure']) {
    const screen = section.children.find(n => n.name === constants.conversationName(key));
    assert.equal(screen.findAll(n => n.name === `Manual note / ${key}`).length, 1);
    assert.equal(screen.findAll(n => n.name === 'Authoritative result' || n.name === 'Phase 3C / Authoritative Action Result' || n.name === 'Business Effect' || n.name === 'Result metadata heading' || n.name === 'Business-result message').length, 0);
  }
});

test('matching Phase 3C component sets are instantiated on 03D, never edited', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const designPage = historical[2];
  const set = new Node('COMPONENT_SET', 'Component / Conversation / Active Handler'); designPage.appendChild(set);
  const variant = new Node('COMPONENT', 'Handler=Sales Agent'); variant.resize(225, 145); set.appendChild(variant);
  const proposal = new Node('COMPONENT', 'Component / Conversation / Action Proposal'); proposal.resize(470, 178); designPage.appendChild(proposal);
  const results = new Node('COMPONENT_SET', 'Component / Conversation / Action Result'); designPage.appendChild(results);
  for (const outcome of ['Confirmed', 'Known Failure', 'OUTCOME_UNKNOWN']) {
    const result = new Node('COMPONENT', `Outcome=${outcome}`); result.resize(310, 178); results.appendChild(result);
  }
  const originals = designPage.findAll(() => true).map(n => `${n.id}:${n.name}:${n.width}`);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage();
  const screen = api.createFrame(); page.appendChild(screen); screen.resize(1600, 900);
  const sales = constants.VARIANTS.find(v => v.key === 'Sales Active');
  conversations.drawConversation(screen, sales);
  assert.ok(screen.findAll(n => n.type === 'INSTANCE' && n.name.includes('Active Handler')).length);
  const proposalScreen = api.createFrame(); page.appendChild(proposalScreen); proposalScreen.resize(1600, 900);
  conversations.drawConversation(proposalScreen, constants.VARIANTS.find(v => v.key === 'Awaiting Confirmation'));
  assert.ok(proposalScreen.findAll(n => n.type === 'INSTANCE' && n.name === 'Business Action Proposal').length);
  for (const key of ['Confirmed Result', 'Known Failure', 'OUTCOME_UNKNOWN']) {
    const resultScreen = api.createFrame(); page.appendChild(resultScreen); resultScreen.resize(1600, 900);
    conversations.drawConversation(resultScreen, constants.VARIANTS.find(v => v.key === key));
    const workspace = resultScreen.findAll(n => n.name === 'Conversation Workspace')[0];
    const regions = workspace.children.filter(n => n.name === 'Business Action Result');
    assert.equal(regions.length, 1);
    assert.ok(regions[0].children.every(n => n.type === 'TEXT'));
    assert.equal(workspace.findAll(n => n.type === 'INSTANCE' && n.name.includes('Action Result')).length, 0);
  }
  assert.deepEqual(designPage.findAll(() => true).map(n => `${n.id}:${n.name}:${n.width}`), originals);
  const duplicate = new Node('COMPONENT', 'Component / Conversation / Action Proposal'); duplicate.resize(470, 178); designPage.appendChild(duplicate);
  const report = await ds.inspectDesignSystem();
  assert.equal(report.components.find(c => c.name === 'Conversation / Action Proposal').found, false);
  assert.ok(report.gaps.some(g => g.includes('Duplicate Component / Conversation / Action Proposal')));
});

test('Escalations builds eight owned variants without changing approved screens or historical pages', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const historyBefore = historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}`));
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page);
  const approved = [constants.SECTIONS.shell, constants.SECTIONS.conversations].map(name => {
    const section = page.children.find(n => n.name === name);
    return section.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}`);
  });
  escalations.buildEscalations(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.escalations);
  assert.equal(section?.children.filter(n => n.name.startsWith('3D / Escalations / ')).length, 8);
  const report = escalationValidator.validateEscalations(page);
  assert.equal(report.pass, true, report.checks.filter(c => !c.pass).map(c => c.label).join(', '));
  assert.deepEqual([constants.SECTIONS.shell, constants.SECTIONS.conversations].map(name => page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}`)), approved);
  assert.deepEqual(historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}`)), historyBefore);
  const manual = new Node('FRAME', 'Manual / Escalation note'); section.appendChild(manual);
  escalations.buildEscalations(page);
  assert.equal(section.children.filter(n => n.name.startsWith('3D / Escalations / ')).length, 8);
  assert.equal(manual.parent, section);
  assert.equal(escalationValidator.validateEscalations(page).pass, true);
});

test('Escalations uses approved Phase 3C queue, unknown and decision components without editing sources', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const design = historical[2];
  const addText = (parent, name, value, x, y, width, height = 18) => {
    const t = new Node('TEXT', name); t.characters = value; t.x = x; t.y = y; t.fontSize = 12; t.lineHeight = { value: height }; t.textAutoResize = 'HEIGHT'; t.resize(width, height); parent.appendChild(t);
  };
  const queueSet = new Node('COMPONENT_SET', 'Component / Escalation / Queue Item'); design.appendChild(queueSet);
  for (const state of ['Waiting Assignment', 'Assigned', 'OUTCOME_UNKNOWN / Reconciliation Required', 'Resume Pending — TARGET M12']) {
    const variant = new Node('COMPONENT', `State=${state}`); variant.resize(470, 213); queueSet.appendChild(variant);
    addText(variant, 'Escalation reference', 'ESC-204 / Conversation C-42', 15, 13, 440);
    addText(variant, 'Affected object', 'Order ORD-1042 / reservation', 15, 40, 440);
    const marker = new Node('FRAME', 'Queue status marker'); marker.x = 13; marker.y = 69; marker.resize(444, 40); variant.appendChild(marker);
    addText(marker, 'Meaning', state, 11, 10, 422);
    addText(variant, 'Reason', 'Reason: human attention', 15, 121, 440);
    addText(variant, 'Owner', 'Owner: Human Operator', 15, 151, 440);
    addText(variant, 'Time or target note', 'Observed 10:43', 15, 180, 440);
  }
  const restricted = new Node('COMPONENT', 'Component / Navigation / Restricted Link'); restricted.resize(470, 66); design.appendChild(restricted);
  addText(restricted, 'Contextual destination', 'Agent Runs ↗', 14, 9, 442);
  addText(restricted, 'Restriction label', 'Contextual / permitted case only', 14, 31, 442);
  addText(restricted, 'Authorization rule', 'Visible link still requires server authorization.', 14, 49, 442, 16);
  const uncertain = new Node('COMPONENT', 'Component / Escalation / Uncertain Effect'); uncertain.resize(970, 257); design.appendChild(uncertain);
  for (const [i, value] of ['UNCERTAIN EFFECT / OUTCOME_UNKNOWN', 'Reservation effect may have committed.', 'Confirmation unavailable; this is not a Known Failure.', 'Operation ref RI-1042 / Order #1042', 'Reconciliation required against authoritative reservation state.', 'NO BLIND RETRY / no mutation action here'].entries()) addText(uncertain, `Unknown / ${i}`, value, 17, 15 + i * 38, 936);
  const decision = new Node('COMPONENT', 'Component / Escalation / Human Decision Panel'); decision.resize(970, 292); design.appendChild(decision);
  for (const [i, value] of ['HUMAN DECISION', 'Proposal summary', 'Decision scope', 'Approve proposed continuation', 'Reject proposed continuation', 'Request clarification', 'Revalidate → Resume request', 'Close escalation'].entries()) addText(decision, i === 1 || i === 2 ? value : `Decision / ${i}`, value, 16, 14 + i * 29, 938);
  const sourceBefore = design.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}`);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.escalations);
  for (const key of ['Waiting Assignment', 'Awaiting Decision', 'OUTCOME_UNKNOWN', 'Resume Pending']) {
    const screen = section.children.find(n => n.name === constants.escalationName(key));
    assert.equal(screen.findAll(n => n.name === 'Selected Queue Item')[0]?.type, 'INSTANCE');
  }
  assert.equal(section.findAll(n => n.name === 'Uncertain Effect' && n.type === 'INSTANCE').length, 1);
  assert.equal(section.findAll(n => n.name === 'Human Decision' && n.type === 'INSTANCE').length, 1);
  assert.equal(escalationValidator.validateEscalations(page).pass, true);
  assert.deepEqual(design.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}`), sourceBefore);
});

test('OUTCOME_UNKNOWN semantic check requires authoritative reconciliation and no blind retry in its own nested text', () => {
  const semanticPass = (unknownLines, otherLines = []) => {
    const page = new Node('PAGE', constants.TARGET_PAGE);
    const section = new Node('FRAME', constants.SECTIONS.escalations); page.appendChild(section);
    const unknown = new Node('FRAME', constants.escalationName('OUTCOME_UNKNOWN')); section.appendChild(unknown);
    const instance = new Node('INSTANCE', 'Uncertain Effect'); unknown.appendChild(instance);
    for (const value of unknownLines) { const t = new Node('TEXT', 'Nested state text'); t.characters = value; instance.appendChild(t); }
    const other = new Node('FRAME', constants.escalationName('Awaiting Decision')); section.appendChild(other);
    for (const value of otherLines) { const t = new Node('TEXT', 'Other variant text'); t.characters = value; other.appendChild(t); }
    const before = page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.parent?.id}`);
    const result = escalationValidator.validateEscalations(page).checks.find(c => c.label === 'OUTCOME_UNKNOWN reconciliation / no blind retry')?.pass;
    assert.deepEqual(page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.parent?.id}`), before, 'validation is read-only');
    return result;
  };
  const label = 'OUTCOME_UNKNOWN';
  const reconciliation = 'Reconciliation required against authoritative reservation state.';
  assert.equal(semanticPass([label, reconciliation, 'NO BLIND RETRY / no mutation action here']), true, 'approved Phase 3C wording');
  assert.equal(semanticPass([label, '  RECONCILIATION  REQUIRED\nagainst authoritative reservation state.', 'Do not retry mutation blindly.']), true, 'case and whitespace only');
  assert.equal(semanticPass([label, 'Reconcile authoritative reservation state first.', 'No mutation action here.']), true, 'generated safe-step wording');
  assert.equal(semanticPass([label, reconciliation, 'Retry allowed.']), false, 'reconciliation without retry prohibition');
  assert.equal(semanticPass([label, 'NO BLIND RETRY.']), false, 'retry prohibition without reconciliation');
  assert.equal(semanticPass([label]), false, 'generic state label only');
  assert.equal(semanticPass([label], [reconciliation, 'NO BLIND RETRY.']), false, 'another variant cannot satisfy this frame');
});

test('Escalations validator catches overlap, duplicate selection and text overflow without writing', async () => {
  const { api } = createMock(); globalThis.figma = api;
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.escalations);
  const screen = section.children.find(n => n.name === constants.escalationName('E02 Restricted'));
  const layout = () => escalationValidator.validateEscalations(page).checks.find(c => c.label === 'E02 Restricted / geometry')?.pass;
  assert.equal(layout(), true);
  const snapshot = page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.x}:${n.y}:${n.width}:${n.height}`);
  escalationValidator.validateEscalations(page);
  assert.deepEqual(page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.x}:${n.y}:${n.width}:${n.height}`), snapshot);
  const context = screen.findAll(n => n.name === 'Decision Context')[0];
  const reason = context.children.find(n => n.name === 'Why Automation Stopped');
  const facts = context.children.find(n => n.name === 'Confirmed Facts');
  const factsY = facts.y; facts.y = reason.y;
  assert.equal(layout(), false, 'overlapping major blocks'); facts.y = factsY;
  const queue = screen.findAll(n => n.name === 'Escalation Queue')[0];
  const selected = queue.children.find(n => n.name === 'Selected Queue Item');
  const duplicate = new Node('FRAME', 'Selected Queue Item'); duplicate.resize(20, 20); queue.appendChild(duplicate);
  assert.equal(layout(), false, 'duplicate selected item'); duplicate.remove();
  const body = reason.children.find(n => n.name === 'Content / 1');
  const originalY = body.y; body.y = reason.height;
  assert.equal(layout(), false, 'text escapes parent'); body.y = originalY;
  assert.equal(layout(), true);
});

test('Escalations grows for long EN/RU/KZ copy without queue or detail collisions', async () => {
  const long = 'E02 automatic Order update is restricted by current policy. ' +
    'Проверьте действующую политику и область полномочий перед следующим решением. ' +
    'Ағымдағы рұқсат пен тапсырыс күйін қайта тексеріңіз. ' +
    'Keep the selected case and its business context visible.';
  const { api } = createMock({ textTransform: value => value.includes('E02 automatic Order update is restricted by current policy.') ? value.replace('E02 automatic Order update is restricted by current policy.', long) : value });
  globalThis.figma = api;
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.escalations);
  const e02 = section.children.find(n => n.name === constants.escalationName('E02 Restricted'));
  const q = e02.findAll(n => n.name === 'Escalation Queue')[0];
  const selected = q.children.find(n => n.name === 'Selected Queue Item');
  const next = q.children.find(n => n.name === 'Queue row / 2');
  assert.ok(selected.height > 213);
  assert.ok(next.y >= selected.y + selected.height + 12);
  assert.equal(escalationValidator.validateEscalations(page).checks.find(c => c.label === 'E02 Restricted / geometry')?.pass, true);
});

test('Orders builds seven owned variants, validates and preserves all approved sections and historical pages', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const historyBefore = historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}`));
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page);
  const approved = [constants.SECTIONS.shell, constants.SECTIONS.conversations, constants.SECTIONS.escalations].map(name =>
    page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}`));
  orders.buildOrders(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.orders);
  assert.equal(section.children.filter(n => n.name.startsWith('3D / Orders / ')).length, 7);
  const report = orderValidator.validateOrders(page);
  assert.equal(report.pass, true, report.checks.filter(c => !c.pass).map(c => c.label).join(', '));
  assert.deepEqual([constants.SECTIONS.shell, constants.SECTIONS.conversations, constants.SECTIONS.escalations].map(name =>
    page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}`)), approved);
  assert.deepEqual(historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}`)), historyBefore);
  const manual = new Node('FRAME', 'Manual / Orders note'); section.appendChild(manual);
  orders.buildOrders(page);
  assert.equal(section.children.filter(n => n.name.startsWith('3D / Orders / ')).length, 7);
  assert.equal(manual.parent, section);
  assert.equal(orderValidator.validateOrders(page).pass, true);
});

test('Orders instantiates approved Phase 3C business components without editing their sources', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const design = historical[2];
  const addText = (parent, name, value, x, y, width) => {
    const t = new Node('TEXT', name); t.characters = value; t.x = x; t.y = y; t.resize(width, 20); parent.appendChild(t);
  };
  const makeComponent = (name, width, height, contents = [['Meaning', name]]) => {
    const component = new Node('COMPONENT', `Component / ${name}`); component.resize(width, height); design.appendChild(component);
    contents.forEach(([label, value], i) => addText(component, label, value, 14, 13 + i * 34, width - 28));
    return component;
  };
  const makeSet = (name, width, height, variants) => {
    const set = new Node('COMPONENT_SET', `Component / ${name}`); design.appendChild(set);
    for (const value of variants) {
      const component = new Node('COMPONENT', value); component.resize(width, height); set.appendChild(component);
      addText(component, 'State', value, 14, 14, width - 28);
    }
  };
  makeComponent('Business / Customer Summary', 470, 268, [['Identity', 'Amina S.'], ['Reference value', 'C-1042'], ['Channel value', 'Web Chat']]);
  makeSet('Business / Order State', 310, 172, ['State=Created', 'State=Needs Attention', 'State=Stale / Conflict']);
  makeSet('Business / Reservation State', 310, 224, ['State=Confirmed', 'State=Known Failure', 'State=OUTCOME_UNKNOWN']);
  makeSet('Business / Freshness', 470, 150, ['State=Fresh / Current', 'State=Observed at 10:41', 'State=Stale', 'State=Requires Revalidation']);
  makeSet('Business / Order Delivery Status', 470, 153, ['Example=In Transit', 'Example=Dependency Unavailable']);
  makeSet('Communication / Message Delivery Status', 310, 178, ['State=Delivery Failed']);
  makeComponent('Business / E02 Restricted', 970, 234, [['Restriction heading', 'E02 / AUTOMATIC ORDER UPDATE RESTRICTED'], ['Requested change value', 'Change Order #1042 details'], ['Known Order state value', 'Created / verified']]);
  const sourcesBefore = design.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page); orders.buildOrders(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.orders);
  const confirmed = section.children.find(n => n.name === constants.orderName('Reservation Confirmed'));
  const e02 = section.children.find(n => n.name === constants.orderName('E02 Restricted'));
  for (const name of ['Order State component', 'Reservation State component', 'Customer Summary', 'Freshness component'])
    assert.equal(confirmed.findAll(n => n.name === name)[0]?.type, 'INSTANCE', name);
  assert.equal(confirmed.findAll(n => n.name === 'Order Delivery Status component')[0]?.type, 'INSTANCE');
  assert.equal(confirmed.findAll(n => n.name === 'Message Delivery Status component')[0]?.type, 'INSTANCE');
  assert.equal(e02.findAll(n => n.name === 'E02 Restricted component')[0]?.type, 'INSTANCE');
  const report = orderValidator.validateOrders(page);
  assert.equal(report.pass, true, report.checks.filter(c => !c.pass).map(c => c.label).join(', '));
  assert.deepEqual(design.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`), sourcesBefore);
});

test('Orders validator rejects unsafe semantic regressions and geometry changes without writing', async () => {
  const { api } = createMock(); globalThis.figma = api;
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page); orders.buildOrders(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.orders);
  const screen = key => section.children.find(n => n.name === constants.orderName(key));
  const result = label => orderValidator.validateOrders(page).checks.find(c => c.label === label)?.pass;
  const snapshot = page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.x}:${n.y}:${n.width}:${n.height}`);
  orderValidator.validateOrders(page);
  assert.deepEqual(page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.x}:${n.y}:${n.width}:${n.height}`), snapshot);
  const unknown = screen('OUTCOME_UNKNOWN');
  const unknownTexts = unknown.findAll(n => n.type === 'TEXT' && n.characters.includes('NO BLIND RETRY'));
  const oldUnknown = unknownTexts.map(n => n.characters);
  unknownTexts.forEach(n => { n.characters = n.characters.replaceAll('NO BLIND RETRY', 'Retry allowed'); });
  assert.equal(result('OUTCOME_UNKNOWN reconciles before retry'), false);
  unknownTexts.forEach((n, i) => { n.characters = oldUnknown[i]; });
  const failed = screen('Reservation Failed');
  const step = failed.findAll(n => n.name === 'Step explanation')[0];
  const oldStep = step.characters; step.characters += ' Reconciliation required.';
  assert.equal(result('Known Failure is known and has authorized recovery'), false);
  step.characters = oldStep;
  const e02 = screen('E02 Restricted');
  const action = e02.findAll(n => n.name === 'Primary safe action / label')[0];
  const oldAction = action.characters; action.characters = 'Update Order';
  assert.equal(result('E02 update restricted and separate'), false);
  action.characters = oldAction;
  const confirmed = screen('Reservation Confirmed');
  const orderDelivery = confirmed.findAll(n => n.name === 'Order Delivery')[0];
  const oldX = orderDelivery.x; orderDelivery.x = 24 + 722;
  assert.equal(result('Reservation Confirmed / geometry'), false, 'delivery panels overlap');
  orderDelivery.x = oldX;
  assert.equal(orderValidator.validateOrders(page).pass, true);
});

test('Orders long EN/RU/KZ safe-step copy expands without overlap or clipping', async () => {
  const original = 'Inspect the retained operation and authoritative effect first. Do not retry mutation blindly.';
  const extended = original + ' Проверьте подтверждённый результат и полномочия перед следующим шагом. ' +
    'Келесі әрекетке дейін тапсырыс күйін және рұқсатты қайта тексеріңіз. '.repeat(6);
  const { api } = createMock({ textTransform: value => value.includes(original) ? value.replace(original, extended) : value });
  globalThis.figma = api;
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page); orders.buildOrders(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.orders);
  const unknown = section.children.find(n => n.name === constants.orderName('OUTCOME_UNKNOWN'));
  const main = unknown.children.find(n => n.name === 'Orders Workspace');
  const next = main.children.find(n => n.name === 'Next Safe Step');
  const related = main.children.find(n => n.name === 'Related Work');
  assert.ok(next.height > 96);
  assert.ok(related.y >= next.y + next.height + 24);
  assert.equal(orderValidator.validateOrders(page).checks.find(c => c.label === 'OUTCOME_UNKNOWN / geometry')?.pass, true);
});

function addWebChatSources(design, strictInstanceGeometry = false) {
  const addText = (parent, name, value, x = 14, y = 14, width = 360) => {
    const n = new Node('TEXT', name); n.x = x; n.y = y; n.resize(width, 24); n.characters = value; parent.appendChild(n); return n;
  };
  const component = (name, height, texts, actions = []) => {
    const n = new Node('COMPONENT', `Component / Web Chat / ${name}`); n.resize(390, height); design.appendChild(n);
    texts.forEach(([label, value], i) => addText(n, label, value, 14, 12 + i * 25));
    actions.forEach(([name, value, y]) => {
      const action = new Node('FRAME', name); action.x = 14; action.y = y; action.resize(362, 44); n.appendChild(action);
      addText(action, 'Action label', value, 12, 2, 338);
    });
    return n;
  };
  component('Customer Message', 153, [['Sender', 'You'], ['Message content', 'A customer message'], ['Timestamp and delivery', '10:41 · Sent']]);
  component('Business Reply', 153, [['Sender', 'Business'], ['Reply content', 'A business reply'], ['Timestamp and delivery', '10:42 · Delivered']]);
  component('Clarification Request', 258, [['State label', 'ONE DETAIL NEEDED'], ['Customer question', 'Which size would you like?']], [['Send details action', 'Send details', 191]]);
  component('Confirmation Request', 320, [['State label', 'CONFIRMATION REQUIRED'], ['Item details', 'Desk Lamp / Slate'], ['Quantity', 'Quantity: 1']], [['Confirm order / focus', 'Confirm order', 199], ['Change details action', 'Change details', 257]]);
  component('Processing', 210, [['Processing message', 'We are processing your request.'], ['Update message', "We'll update you here when the result is available."]]);
  component('Confirmed Result', 320, [['Order state label', 'ORDER'], ['Order state value', 'Order created'], ['Reservation state label', 'RESERVATION'], ['Reservation state value', 'Item reserved'], ['Order reference', 'Order #1042']]);
  component('Known Failure', 300, [['Known result', 'Your order was created, but the item was not reserved.'], ['Order reference', 'Order #1042 already exists.'], ['Duplicate warning', "Please don't place the same order again."], ['Next step', "We'll help you with the next step."]], [['Ask for help action / focus', 'Ask for help', 246]]);
  component('Waiting Human', 249, [['Customer message', 'A person is reviewing this.'], ['Update message', "We'll update you here."]], [['Write a message action', 'Write a message', 191]]);
  component('Confirmation Pending', 282, [['Unknown result in plain language', 'Your request may have gone through, but we cannot confirm it yet.'], ['Duplicate request warning', 'Please do not submit the same request again.'], ['Update promise', 'We will update you when confirmation is available.']], [['Contact support action / focus', 'Contact support', 227]]);
  component('Delivery Failure', 331, [['State label', 'MESSAGE DELIVERY ISSUE'], ['Message label', 'MESSAGE'], ['Message value', 'Not delivered'], ['Business label', 'BUSINESS RESULT'], ['Business value', 'Reservation remains confirmed'], ['Recovery scope', 'Only your message needs attention.']], [['Retry message action / focus', 'Retry message', 231], ['Contact support action', 'Contact support', 281]]);
  const set = new Node('COMPONENT_SET', 'Component / Web Chat / Composer'); design.appendChild(set);
  const ready = new Node('COMPONENT', 'State=Ready'); ready.resize(310, 222); set.appendChild(ready);
  addText(ready, 'Composer state', 'Ready to send', 14, 11, 282);
  const input = new Node('FRAME', 'Visible message input'); input.x = 13; input.y = 40; input.resize(284, 65); ready.appendChild(input);
  addText(input, 'Input text', 'Write a message…', 11, 16, 262);
  const send = new Node('FRAME', 'Send action / focus'); send.x = 13; send.y = 119; send.resize(284, 44); ready.appendChild(send);
  addText(send, 'Action label', 'Send', 12, 2, 260);
  if (strictInstanceGeometry) for (const source of design.findAll(n => n.type === 'COMPONENT' && (n.name.startsWith('Component / Web Chat /') || n.name === 'State=Ready'))) source.protectInstanceChildren = true;
  return design.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`);
}

test('Customer Web Chat creates ten native-component mobile variants, idempotently, without touching approved work', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const sourceSnapshot = addWebChatSources(historical[2]);
  const historySnapshot = historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`));
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page); orders.buildOrders(page);
  const approved = [constants.SECTIONS.shell, constants.SECTIONS.conversations, constants.SECTIONS.escalations, constants.SECTIONS.orders].map(name =>
    page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`));
  const names = webChat.buildWebChat(page);
  assert.deepEqual(names, constants.WEB_CHAT_VARIANTS.map(v => constants.webChatName(v.key)));
  const section = page.children.find(n => n.name === constants.SECTIONS.webChat);
  assert.equal(section.children.filter(n => n.name.startsWith('3D / Web Chat / ')).length, 10);
  assert.equal(webChatValidator.validateWebChat(page).pass, true, webChatValidator.validateWebChat(page).checks.filter(c => !c.pass).map(c => c.label).join(', '));
  assert.equal((await inspector.inspectPhase3D()).webChatCount, 10);
  const manual = new Node('FRAME', 'Manual / customer annotation'); section.appendChild(manual);
  const preservedInside = new Node('TEXT', 'Manual / inside active'); section.children.find(n => n.name === constants.webChatName('Active')).appendChild(preservedInside);
  webChat.buildWebChat(page);
  assert.equal(section.children.filter(n => n.name.startsWith('3D / Web Chat / ')).length, 10);
  assert.equal(manual.parent, section);
  assert.ok(section.findAll(n => n.name === 'Manual / inside active').length);
  assert.equal(webChatValidator.validateWebChat(page).pass, true);
  assert.deepEqual([constants.SECTIONS.shell, constants.SECTIONS.conversations, constants.SECTIONS.escalations, constants.SECTIONS.orders].map(name =>
    page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`)), approved);
  assert.deepEqual(historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`)), historySnapshot);
  assert.deepEqual(historical[2].findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`), sourceSnapshot);
});

test('Customer Web Chat validator rejects unsafe copy and mobile geometry changes without writes', async () => {
  const { api, historical } = createMock(); globalThis.figma = api; addWebChatSources(historical[2]);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); webChat.buildWebChat(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.webChat);
  const screen = key => section.children.find(n => n.name === constants.webChatName(key));
  const result = label => webChatValidator.validateWebChat(page).checks.find(c => c.label === label)?.pass;
  const snapshot = page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.x}:${n.y}:${n.width}:${n.height}`);
  webChatValidator.validateWebChat(page);
  assert.deepEqual(page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.x}:${n.y}:${n.width}:${n.height}`), snapshot);
  const change = (key, name, value, label) => {
    const node = screen(key).findAll(n => n.type === 'TEXT' && n.name === name)[0];
    const original = node.characters; node.characters = value;
    assert.equal(result(label), false, label); node.characters = original;
  };
  change('Confirmation Required', 'Action label', 'Confirm', 'Confirmation Request / explicit business authorization');
  change('Known Failure', 'Duplicate warning', 'Place the order again.', 'Known Failure / existing order and duplicate protection');
  change('Confirmation Pending', 'Duplicate request warning', 'Submit again now.', 'Confirmation Pending / unknown result in customer language');
  change('Message Delivery Failure', 'Business value', 'Reservation status unknown', 'Message Delivery Failure / transport and business effect separate');
  change('Waiting Human', 'Customer message', 'We are processing your request.', 'Waiting Human / person, not automated processing');
  change('Active', 'Reply content', 'ToolCall create_order', 'Active / customer-only surface');
  const active = screen('Active'); const state = active.children.find(n => n.name === 'Customer State');
  const originalY = state.y; state.y = 90;
  assert.equal(result('Active / mobile geometry'), false); state.y = originalY;
  assert.equal(webChatValidator.validateWebChat(page).pass, true);
});

test('Customer Web Chat keeps Phase 3C controls atomic and wraps long EN/RU/KZ screen-owned guidance', async () => {
  const original = 'Ask us a question or tell us what you need.';
  const extended = original + ' Пожалуйста, напишите ваш вопрос подробно. Сұрағыңызды осында жазыңыз. '.repeat(16);
  const { api, historical } = createMock({ textTransform: value => value === original ? extended : value }); globalThis.figma = api; addWebChatSources(historical[2]);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); webChat.buildWebChat(page);
  const initial = page.findAll(n => n.name === constants.webChatName('Initial'))[0];
  const guidance = initial.findAll(n => n.name === 'Conversation guidance')[0];
  const composer = initial.findAll(n => n.name === 'Customer Composer')[0];
  assert.ok(guidance.height > 80);
  assert.ok(composer.y >= guidance.parent.y + guidance.height + 18);
  const confirmation = page.findAll(n => n.name === constants.webChatName('Confirmation Required'))[0];
  const card = confirmation.findAll(n => n.name === 'Confirmation Request component')[0];
  const action = card.findAll(n => n.name === 'Confirm order / focus')[0];
  const label = action.children.find(n => n.name === 'Action label');
  assert.equal(action.height, 44);
  assert.ok(card.height >= action.y + action.height);
  assert.equal(label.characters, 'Confirm order');
  const secondary = card.findAll(n => n.name === 'Change details action')[0];
  assert.ok(secondary.y >= action.y + action.height);
  assert.equal(webChatValidator.validateWebChat(page).checks.find(c => c.label === 'Initial / mobile geometry')?.pass, true);
  assert.equal(webChatValidator.validateWebChat(page).checks.find(c => c.label === 'Confirmation Required / mobile geometry')?.pass, true);
});

test('Customer Web Chat generation never overrides geometry of Phase 3C instance descendants', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  addWebChatSources(historical[2], true);
  const historyBefore = historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`));
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page); orders.buildOrders(page);
  const approved = [constants.SECTIONS.shell, constants.SECTIONS.conversations, constants.SECTIONS.escalations, constants.SECTIONS.orders].map(name =>
    page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`));
  const failedSection = new Node('FRAME', constants.SECTIONS.webChat); page.appendChild(failedSection);
  const manualNote = new Node('TEXT', 'Manual / Web Chat review note'); failedSection.appendChild(manualNote);
  assert.equal(webChat.buildWebChat(page).length, 10);
  const section = page.children.find(n => n.name === constants.SECTIONS.webChat);
  assert.equal(section, failedSection);
  assert.equal(manualNote.parent, section);
  const composer = section.findAll(n => n.name === 'Composer / Ready')[0];
  const label = composer.findAll(n => n.name === 'Action label')[0];
  assert.throws(() => { label.y = 10; }, /relative-transform/);
  assert.throws(() => label.resize(100, 50), /relative-transform/);
  assert.equal(webChat.buildWebChat(page).length, 10);
  assert.equal(section.children.filter(n => constants.WEB_CHAT_VARIANTS.some(v => n.name === constants.webChatName(v.key))).length, 10);
  assert.equal(webChatValidator.validateWebChat(page).pass, true);
  assert.deepEqual([constants.SECTIONS.shell, constants.SECTIONS.conversations, constants.SECTIONS.escalations, constants.SECTIONS.orders].map(name =>
    page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`)), approved);
  assert.deepEqual(historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`)), historyBefore);
});

function addAnalyticsSources(design, strictInstanceGeometry = true) {
  const addText = (parent, name, value, x = 14, y = 14, width = Math.max(20, parent.width - 28)) => {
    const n = new Node('TEXT', name); n.x = x; n.y = y; n.resize(width, 20); n.characters = value; parent.appendChild(n); return n;
  };
  const component = (name, width, height, texts = []) => {
    const n = new Node('COMPONENT', name); n.resize(width, height); design.appendChild(n);
    texts.forEach(([key, value], i) => addText(n, key, value, 14, 12 + i * 28));
    if (strictInstanceGeometry) n.protectInstanceChildren = true;
    return n;
  };
  const set = (name, variants) => {
    const n = new Node('COMPONENT_SET', `Component / Analytics / ${name}`); design.appendChild(n);
    for (const [key, width, height, texts] of variants) {
      const variant = new Node('COMPONENT', key); variant.resize(width, height); n.appendChild(variant);
      texts.forEach(([label, value], i) => addText(variant, label, value, 14, 12 + i * 28));
      if (strictInstanceGeometry) variant.protectInstanceChildren = true;
    }
    return n;
  };
  const coreSelect = component('Component / Select', 238, 142, [['Component name', 'Select'], ['Usage', 'Label and selected value.'], ['Persistent field label', 'Reservation status'], ['Example value or placeholder', 'All statuses  ▾'], ['Helper text', 'Filter by known state']]);
  assert.equal(coreSelect.width, 238);
  set('KPI', [['Metric=Orders', 310, 206, [['Sample qualifier', 'EXAMPLE / not live data'], ['Metric name', 'Orders'], ['Observed value', '24'], ['Unit', 'orders'], ['Period', 'Historical period: May'], ['Source and completeness', 'Source: report / Complete / observed 10:42']]]]);
  set('Period Selector', [['State=Focus', 470, 202, [['Field label', 'HISTORICAL PERIOD'], ['Selected period', 'May / selected'], ['Granularity label', 'Granularity: Monthly'], ['Scope helper', 'Selected past period only; no forecast query here.']]]]);
  set('Freshness', [
    ['State=Current', 470, 145, [['Freshness state', 'Current'], ['Freshness meaning', 'Current observed snapshot'], ['Source note', 'Historical report / no invented TTL']]],
    ['State=Stale', 470, 145, [['Freshness state', 'Stale'], ['Freshness meaning', 'Data exists; refresh before current decision'], ['Source note', 'Historical report / no invented TTL']]],
    ['State=Requires Refresh', 470, 145, [['Freshness state', 'Requires Refresh'], ['Freshness meaning', 'Recheck trusted source'], ['Source note', 'Historical report / no invented TTL']]],
  ]);
  set('Completeness', [
    ['State=Complete', 310, 170, [['Completeness state', 'Complete'], ['Meaning', 'Source coverage complete'], ['Decision note', 'Use within declared scope.']]],
    ['State=Incomplete', 310, 170, [['Completeness state', 'Incomplete'], ['Meaning', 'Partial coverage ≠ zero activity'], ['Decision note', 'Investigate coverage before conclusion.']]],
    ['State=Unavailable', 310, 170, [['Completeness state', 'Unavailable'], ['Meaning', 'No trusted result; do not show zero'], ['Decision note', 'Investigate coverage before conclusion.']]],
  ]);
  const chartSet = set('Historical Chart', [
    ['State=Valid Historical Data', 470, 264, [['Chart title', 'Historical orders / example'], ['Period and state', 'Past periods / valid'], ['Actual legend', 'ACTUAL ━ solid / observed only']]],
    ['State=Missing-data Gap', 470, 264, [['Chart title', 'Historical orders / example'], ['Period and state', 'Past periods / missing'], ['Actual legend', 'ACTUAL ━ solid / observed only']]],
    ['State=Stale Data', 470, 264, [['Chart title', 'Historical orders / example'], ['Period and state', 'Past periods / stale'], ['Actual legend', 'ACTUAL ━ solid / observed only']]],
  ]);
  for (const chart of chartSet.children) {
    const gap = chart.name === 'State=Missing-data Gap';
    for (const i of (gap ? [1, 4] : [1, 2, 3, 4])) {
      const line = new Node('FRAME', `ACTUAL / solid segment ${i}`); line.x = 42 + i * 72; line.y = 94 + i * 10; line.resize(68, 3); chart.appendChild(line);
    }
    if (gap) {
      const missing = new Node('FRAME', 'Missing observation / visible gap'); missing.x = 194; missing.y = 83; missing.resize(64, 86); chart.appendChild(missing);
      addText(missing, 'Gap label', 'MISSING', 6, 34, 52);
    }
  }
  const table = component('Component / Analytics / Data Table', 970, 430, [['Table title', 'Historical order summary / example only'], ['Table context', 'Period: past month / source: report / observed 10:42'], ['Table note', 'Missing cells use an explicit unavailable annotation, never an invented zero.']]);
  const header = new Node('FRAME', 'Header row'); header.x = 14; header.y = 79; header.resize(942, 42); table.appendChild(header);
  ['Period', 'Orders (count)', 'Value (currency units)', 'Coverage'].forEach((value, i) => addText(header, `Column ${i + 1}`, value, 12 + i * 230, 13, 220));
  [['Week A', '8', '420', 'Complete'], ['Week B', '10', '510', 'Complete'], ['Week C', '6', '310', 'Incomplete']].forEach((values, i) => {
    const row = new Node('FRAME', `Observed row ${i + 1}`); row.x = 14; row.y = 129 + i * 51; row.resize(942, 44); table.appendChild(row);
    values.forEach((value, j) => addText(row, `Cell ${j + 1}`, value, 12 + j * 230, 12, 220));
  });
  const empty = new Node('FRAME', 'Valid empty table treatment'); empty.x = 14; empty.y = 297; empty.resize(942, 87); table.appendChild(empty);
  addText(empty, 'Empty label', 'ALTERNATE VALID EMPTY STATE / query succeeded', 14, 13, 912);
  addText(empty, 'Empty meaning', 'No records in the selected historical scope.', 14, 44, 912);
  for (const [name, meaning, next] of [
    ['Valid Empty', 'Query succeeded; no records for this period.', 'Not a source failure.'],
    ['Incomplete', 'Some observed data is present; coverage partial.', 'Do not claim a complete total or zero activity.'],
    ['Stale', 'Historical snapshot exists but may be old.', 'Refresh before current decision.'],
    ['Dependency Unavailable', 'Trusted report source unavailable.', 'No data; never render zero activity.'],
    ['Permission Denied', 'Current principal lacks report access.', 'Request authorized access; do not expose data.'],
  ]) component(`Component / Analytics / ${name}`, 470, 173, [['State name', name.toUpperCase()], ['Meaning', meaning], ['Next or distinction', next]]);
}

function addArchivedAnalyticsDuplicates(design) {
  const archive = new Node('FRAME', 'ARCHIVE — 11 — Analytics / Data Components — pre-refinement');
  design.appendChild(archive);
  const active = design.children.find(n => n.name === constants.DESIGN_SECTIONS.analytics);
  for (const source of active.findAll(n => n.name.startsWith('Component / Analytics / ')))
    archive.appendChild(new Node(source.type, source.name));
  return archive;
}

test('active section wins over archives; missing, duplicate and wrong-type diagnostics stay strict', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const design = historical[2]; addAnalyticsSources(design);
  const archive = addArchivedAnalyticsDuplicates(design);
  const active = design.children.find(n => n.name === constants.DESIGN_SECTIONS.analytics);
  const kpi = active.findAll(n => n.name === 'Component / Analytics / KPI')[0];
  const original = design.findAll(() => true).map(n => `${n.id}:${n.name}:${n.parent?.id}`);
  let result = ds.resolveDesignAsset(design, 'Analytics / KPI');
  assert.equal(result.diagnostic.status, 'FOUND');
  assert.equal(result.node, kpi);
  assert.equal(result.diagnostic.archivedMatches.length, 1);
  const report = await ds.inspectDesignSystem();
  assert.equal(report.components.find(c => c.name === 'Analytics / KPI').status, 'FOUND');
  assert.equal(report.gaps.some(g => g.includes('Analytics / KPI')), false);
  assert.match(inspector.formatAssets(report), /Component \/ Analytics \/ KPI: FOUND[\s\S]*archived matches: 1 \(ignored for generation\)/);
  assert.deepEqual(design.findAll(() => true).map(n => `${n.id}:${n.name}:${n.parent?.id}`), original);

  const extra = new Node('COMPONENT_SET', 'Component / Analytics / KPI'); active.appendChild(extra);
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'DUPLICATE'); extra.remove();
  kpi.remove();
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'MISSING');
  assert.equal(archive.findAll(n => n.name === 'Component / Analytics / KPI').length, 1);
  const wrong = new Node('TEXT', 'Component / Analytics / KPI'); active.appendChild(wrong);
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'WRONG_TYPE'); wrong.remove();
  active.appendChild(kpi);

  active.remove();
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'MISSING_SECTION');
  design.appendChild(active);
  const second = new Node('FRAME', constants.DESIGN_SECTIONS.analytics); design.appendChild(second);
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'DUPLICATE_SECTION'); second.remove();
  active.remove();
  const wrongSection = new Node('TEXT', constants.DESIGN_SECTIONS.analytics); design.appendChild(wrongSection);
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'WRONG_TYPE');
});

test('Forecast source scoping and Core cross-section dependency ignore archived siblings', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const design = historical[2];
  const forecast = design.children.find(n => n.name === constants.DESIGN_SECTIONS.forecast);
  const activeSeries = new Node('COMPONENT_SET', 'Component / Forecast / Actual Series'); forecast.appendChild(activeSeries);
  const archive = new Node('FRAME', 'ARCHIVE — 12 — Forecast Components — pre-refinement'); design.appendChild(archive);
  archive.appendChild(new Node('COMPONENT_SET', 'Component / Forecast / Actual Series'));
  const result = ds.resolveDesignAsset(design, 'Forecast / Actual Series');
  assert.equal(result.diagnostic.status, 'FOUND'); assert.equal(result.node, activeSeries);
  assert.equal(result.diagnostic.archivedMatches.length, 1);
  const core = design.children.find(n => n.name === constants.DESIGN_SECTIONS.core);
  const select = new Node('COMPONENT', 'Component / Select'); select.resize(238, 142); core.appendChild(select);
  const coreArchive = new Node('FRAME', 'ARCHIVE — 06 — Core Components — pre-refinement'); design.appendChild(coreArchive);
  coreArchive.appendChild(new Node('COMPONENT', 'Component / Select'));
  assert.equal(ds.resolveDesignAsset(design, 'Select', constants.DESIGN_SECTIONS.core).node, select);
  await ds.loadDesignAssets();
  assert.doesNotThrow(() => ds.requireDesignAssets([{ section: constants.DESIGN_SECTIONS.core, name: 'Select', maxWidth: 238 }]));
});

test('Analytics builds all six variants with archived duplicates and preserves existing screens and 03A/03B/03C', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const design = historical[2]; addAnalyticsSources(design); addArchivedAnalyticsDuplicates(design);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage();
  const previous = new Node('FRAME', constants.SECTIONS.orders); page.appendChild(previous);
  const archiveBefore = historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.type}:${n.name}:${n.parent?.id}`));
  const previousBefore = page.findAll(n => n === previous).map(n => n.id);
  assert.equal(analytics.buildAnalytics(page).length, 6);
  assert.equal(analyticsValidator.validateAnalytics(page).pass, true);
  assert.equal(page.children.find(n => n.name === constants.SECTIONS.analytics).children.filter(n => n.name.startsWith('3D / Analytics / ')).length, 6);
  assert.deepEqual(page.findAll(n => n === previous).map(n => n.id), previousBefore);
  assert.deepEqual(historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.type}:${n.name}:${n.parent?.id}`)), archiveBefore);
});

test('Phase 3C Analytics resolver finds nested components and reports exact type, ID and path without writes', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const design = historical[2];
  const section = design.children.find(n => n.name === constants.DESIGN_SECTIONS.analytics);
  const group = new Node('FRAME', 'Nested approved library'); section.appendChild(group);
  const set = new Node('COMPONENT_SET', 'Component / Analytics / KPI'); group.appendChild(set);
  const variant = new Node('COMPONENT', 'Metric=Orders'); set.appendChild(variant);
  const table = new Node('COMPONENT', 'Component / Analytics / Data Table'); group.appendChild(table);
  const before = design.findAll(() => true).map(n => `${n.id}:${n.type}:${n.name}:${n.parent?.id}`);
  const found = ds.resolveDesignAsset(design, 'Analytics / KPI');
  assert.equal(found.diagnostic.status, 'FOUND');
  assert.equal(found.node, set);
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / Data Table').diagnostic.status, 'FOUND');
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / Data Table').node, table);
  assert.equal(found.diagnostic.matches[0].id, set.id);
  assert.match(found.diagnostic.matches[0].path, /11 — Analytics \/ Data Components \/ Nested approved library \/ Component \/ Analytics \/ KPI$/);
  const report = await ds.inspectDesignSystem();
  assert.equal(report.components.find(c => c.canonicalName === 'Component / Analytics / KPI').status, 'FOUND');
  assert.match(inspector.formatAssets(report), /ANALYTICS DESIGN SYSTEM ASSETS[\s\S]*Component \/ Analytics \/ KPI: FOUND; section=11 — Analytics \/ Data Components; active matches=1[\s\S]*type=COMPONENT_SET; id=/);
  assert.deepEqual(design.findAll(() => true).map(n => `${n.id}:${n.type}:${n.name}:${n.parent?.id}`), before);

  variant.name = 'Figma variant option'; variant.variantProperties = { Metric: 'Orders' };
  await ds.loadDesignAssets();
  assert.doesNotThrow(() => ds.requireDesignAssets([{ section: constants.DESIGN_SECTIONS.analytics, name: 'Analytics / KPI', variant: 'Metric=Orders' }]));

  set.remove();
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'MISSING');
  const wrong = new Node('TEXT', 'Component / Analytics / KPI'); group.appendChild(wrong);
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'WRONG_TYPE');
  group.appendChild(set);
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'DUPLICATE');
  wrong.remove();
  const second = new Node('COMPONENT_SET', 'Component / Analytics / KPI'); group.appendChild(second);
  assert.equal(ds.resolveDesignAsset(design, 'Analytics / KPI').diagnostic.status, 'DUPLICATE');
});

test('Analytics asset preflight rejects missing, duplicate, wrong-type and missing variants before any replacement', async () => {
  for (const fault of ['missing', 'missing-last-asset', 'duplicate', 'wrong-type', 'missing-variant']) {
    const { api, historical } = createMock(); globalThis.figma = api;
    const design = historical[2]; addAnalyticsSources(design);
    const kpi = design.findAll(n => n.name === 'Component / Analytics / KPI')[0];
    if (fault === 'missing' || fault === 'wrong-type') kpi.remove();
    if (fault === 'missing-last-asset') design.findAll(n => n.name === 'Component / Analytics / Permission Denied')[0].remove();
    if (fault === 'duplicate') design.appendChild(new Node('COMPONENT_SET', 'Component / Analytics / KPI'));
    if (fault === 'wrong-type') design.appendChild(new Node('TEXT', 'Component / Analytics / KPI'));
    if (fault === 'missing-variant') kpi.children[0].name = 'Metric=Other';
    await ds.loadDesignAssets(); await utils.loadFonts();
    const page = await utils.writablePage();
    const approved = new Node('FRAME', constants.SECTIONS.orders); page.appendChild(approved);
    const existing = new Node('FRAME', constants.SECTIONS.analytics); page.appendChild(existing);
    const manual = new Node('FRAME', 'Manual / Analytics note'); existing.appendChild(manual);
    const previous = page.findAll(() => true).map(n => `${n.id}:${n.type}:${n.name}:${n.parent?.id}`);
    const history = historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.type}:${n.name}:${n.parent?.id}`));
    assert.throws(() => analytics.buildAnalytics(page), fault === 'missing-variant' ? /MISSING approved Phase 3C variant.*Metric=Orders/ : new RegExp(`${fault === 'wrong-type' ? 'WRONG_TYPE' : fault === 'duplicate' ? 'DUPLICATE' : 'MISSING'} approved Phase 3C asset.*Analytics \/ ${fault === 'missing-last-asset' ? 'Permission Denied' : 'KPI'}`));
    assert.deepEqual(page.findAll(() => true).map(n => `${n.id}:${n.type}:${n.name}:${n.parent?.id}`), previous);
    assert.deepEqual(historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.type}:${n.name}:${n.parent?.id}`)), history);
    assert.equal(manual.parent, existing);
  }
});

test('Analytics builds six historical-only variants idempotently and preserves approved sections', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  addWebChatSources(historical[2]); addAnalyticsSources(historical[2]);
  const historicalBefore = historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`));
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); shell.buildSharedShell(page); conversations.buildConversations(page); escalations.buildEscalations(page); orders.buildOrders(page); webChat.buildWebChat(page);
  const protectedSections = [constants.SECTIONS.shell, constants.SECTIONS.conversations, constants.SECTIONS.escalations, constants.SECTIONS.orders, constants.SECTIONS.webChat];
  const approved = protectedSections.map(name => page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`));
  assert.deepEqual(analytics.buildAnalytics(page), constants.ANALYTICS_VARIANTS.map(v => constants.analyticsName(v.key)));
  const section = page.children.find(n => n.name === constants.SECTIONS.analytics);
  assert.equal(section.children.filter(n => n.name.startsWith('3D / Analytics / ')).length, 6);
  const result = analyticsValidator.validateAnalytics(page);
  assert.equal(result.pass, true, result.checks.filter(c => !c.pass).map(c => c.label).join(', '));
  assert.equal((await inspector.inspectPhase3D()).analyticsCount, 6);
  const manual = new Node('FRAME', 'Manual / Analytics note'); section.appendChild(manual);
  const inside = new Node('TEXT', 'Manual / inside Analytics'); section.children.find(n => n.name === constants.analyticsName('Valid')).appendChild(inside);
  analytics.buildAnalytics(page);
  assert.equal(section.children.filter(n => n.name.startsWith('3D / Analytics / ')).length, 6);
  assert.equal(manual.parent, section);
  assert.ok(section.findAll(n => n.name === 'Manual / inside Analytics').length);
  assert.equal(analyticsValidator.validateAnalytics(page).pass, true);
  assert.deepEqual(protectedSections.map(name => page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`)), approved);
  assert.deepEqual(historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.width}:${n.height}`)), historicalBefore);
});

test('Analytics validator rejects forecast leakage, false zeros, missing gaps, stale omission and denied values read-only', async () => {
  const { api, historical } = createMock(); globalThis.figma = api; addAnalyticsSources(historical[2]);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); analytics.buildAnalytics(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.analytics);
  const screen = key => section.children.find(n => n.name === constants.analyticsName(key));
  const result = label => analyticsValidator.validateAnalytics(page).checks.find(c => c.label === label)?.pass;
  const snapshot = page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.x}:${n.y}:${n.width}:${n.height}`);
  analyticsValidator.validateAnalytics(page);
  assert.deepEqual(page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.x}:${n.y}:${n.width}:${n.height}`), snapshot);
  const forecastText = new Node('TEXT', 'Unsafe forecast value'); forecastText.characters = 'PREDICTED 42'; screen('Valid').appendChild(forecastText);
  assert.equal(result('Valid / observed-only boundary'), false); forecastText.remove();
  const incomplete = screen('Incomplete');
  const gap = incomplete.findAll(n => n.name === 'Missing observation / visible gap')[0];
  const parent = gap.parent; parent.children = parent.children.filter(n => n !== gap);
  assert.equal(result('Incomplete / visible gap, not zero'), false); parent.appendChild(gap);
  const stale = screen('Stale');
  const refresh = stale.findAll(n => n.type === 'TEXT' && n.characters.includes('Refresh before a current operational decision.'))[0];
  const oldRefresh = refresh.characters; refresh.characters = 'No refresh needed.';
  assert.equal(result('Stale / retains observed values and requests refresh'), false); refresh.characters = oldRefresh;
  const unavailable = screen('Dependency Unavailable');
  const zero = new Node('TEXT', 'False zero'); zero.characters = 'Orders = 0'; unavailable.appendChild(zero);
  assert.equal(result('Dependency Unavailable / observed-only boundary'), false); zero.remove();
  const denied = screen('Permission Denied');
  const leaked = new Node('TEXT', 'Protected value'); leaked.characters = '24 confirmed orders'; denied.appendChild(leaked);
  assert.equal(result('Permission Denied / no protected report values'), false); leaked.remove();
  const empty = screen('Valid Empty');
  const falseKpi = new Node('INSTANCE', 'KPI component'); empty.appendChild(falseKpi);
  assert.equal(result('Valid Empty / successful no-record result'), false); falseKpi.remove();
  const valid = screen('Valid'); const chart = valid.findAll(n => n.name === 'Historical Chart')[0];
  const oldY = chart.y; chart.y = 400;
  assert.equal(result('Valid / geometry'), false); chart.y = oldY;
  assert.equal(analyticsValidator.validateAnalytics(page).pass, true);
});

test('Analytics long EN/RU/KZ contextual action wraps and grows without overlap', async () => {
  const original = 'Open Forecasts  →';
  const expanded = 'Open Forecasts → Открыть прогнозы → Болжамдарды ашу. '.repeat(7);
  const { api, historical } = createMock({ textTransform: value => value === original ? expanded : value }); globalThis.figma = api;
  addAnalyticsSources(historical[2]);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); analytics.buildAnalytics(page);
  const valid = page.findAll(n => n.name === constants.analyticsName('Valid'))[0];
  const link = valid.findAll(n => n.name === 'Forecast Contextual Link')[0];
  const button = valid.findAll(n => n.name === 'Open Forecasts')[0];
  const label = button.children.find(n => n.name === 'Action label');
  assert.ok(button.height > 44);
  assert.ok(link.height >= button.y + button.height + 16);
  assert.ok(label.height <= button.height - 10);
  assert.equal(analyticsValidator.validateAnalytics(page).checks.find(c => c.label === 'Valid / geometry')?.pass, true);
});

function addForecastSources(design) {
  const component = (name, width, height) => {
    const n = new Node('COMPONENT', `Component / Forecast / ${name}`); n.resize(width, height); design.appendChild(n); return n;
  };
  const label = (parent, name, value, x = 16, y = 14, width = Math.max(30, parent.width - 32)) => {
    const n = new Node('TEXT', name); n.x = x; n.y = y; n.resize(width, 20); n.characters = value; parent.appendChild(n); return n;
  };
  const request = component('Request Summary', 970, 212);
  label(request, 'Target annotation', 'TARGET PRODUCT UX', 16, 13, 938);
  for (const [i, fieldName] of ['TARGET', 'SCOPE', 'CUTOFF', 'HORIZON'].entries()) {
    const field = new Node('FRAME', `Request field / ${fieldName}`); field.x = 16 + i % 2 * 475; field.y = 45 + Math.floor(i / 2) * 70; field.resize(455, 62); request.appendChild(field);
    label(field, 'Field label', fieldName, 12, 8, 429); label(field, 'Field value', 'Example value', 12, 30, 429);
  }
  label(request, 'Eligibility', 'Eligibility requires validation.', 16, 186, 938);
  const target = component('Target', 310, 185);
  label(target, 'Heading', 'TARGET', 14, 13, 282); label(target, 'Value', 'Configured sales series', 14, 49, 282);
  label(target, 'Rule', 'Unit required.', 14, 106, 282); label(target, 'Scope', 'No invented metric contract.', 14, 145, 282);
  const cutoff = component('Cutoff', 310, 185); label(cutoff, 'Heading', 'CUTOFF', 14, 13, 282);
  label(cutoff, 'Historical side', 'ACTUAL / last observed', 14, 128, 141);
  const horizon = component('Horizon', 310, 185); label(horizon, 'Heading', 'HORIZON', 14, 13, 282);
  label(horizon, 'Requested span', 'Requested future span', 14, 49, 282); label(horizon, 'Eligibility', 'Validate supported horizon.', 14, 106, 282);
  const actual = component('Actual Series', 470, 157); label(actual, 'Series title', 'ACTUAL / historical observed', 15, 14, 438);
  const solid = new Node('FRAME', 'ACTUAL / solid line'); solid.x = 16; solid.y = 69; solid.resize(422, 3); actual.appendChild(solid);
  const predicted = component('Predicted Series', 470, 157); label(predicted, 'Series title', 'PREDICTED / TARGET PRODUCT UX', 15, 14, 438);
  for (let i = 0; i < 11; i++) { const dash = new Node('FRAME', `PREDICTED / dash ${i + 1}`); dash.x = 16 + i * 39; dash.y = 69; dash.resize(21, 3); predicted.appendChild(dash); }
  const chart = component('Actual vs Predicted Chart', 970, 420);
  label(chart, 'Target annotation', 'TARGET PRODUCT UX / illustrative series only', 16, 13, 938);
  label(chart, 'Cutoff label', 'CUTOFF / last observed', 430, 68, 184);
  label(chart, 'Actual legend', 'ACTUAL — solid line', 16, 359, 250);
  label(chart, 'Predicted legend', 'PREDICTED - dashed line', 290, 359, 280);
  for (const [i, x] of [90, 188, 283, 381].entries()) { const line = new Node('FRAME', `ACTUAL / solid segment ${i + 1}`); line.x = x; line.y = 198; line.resize(124, 3); chart.appendChild(line); }
  for (const [i, x] of [188, 283, 381].entries()) { const joint = new Node('FRAME', `ACTUAL / continuous joint ${i + 1}`); joint.x = x - 3; joint.y = 198; joint.resize(6, 6); chart.appendChild(joint); }
  const boundary = new Node('FRAME', 'CUTOFF / vertical marker'); boundary.x = 505; boundary.y = 90; boundary.resize(2, 215); chart.appendChild(boundary);
  for (let i = 0; i < 11; i++) { const dash = new Node('FRAME', `PREDICTED / dash ${i + 1}`); dash.x = 530 + i * 33; dash.y = 205 - i * 5; dash.resize(19, 3); chart.appendChild(dash); }
  const provenance = component('Provenance', 470, 246);
  for (const [i, name] of ['Source', 'Run reference', 'Model reference', 'Cutoff', 'Time'].entries()) label(provenance, name, 'Placeholder from real run only', 15, 50 + i * 36, 438);
  component('Limitations', 470, 246);
  component('Result', 970, 212);
  const notReady = component('MODEL_NOT_READY', 970, 331);
  label(notReady, 'Current banner', 'CURRENT: no validated model / MODEL_NOT_READY', 17, 17, 936);
  label(notReady, 'Prediction state', 'No prediction has been produced.', 17, 113, 936);
  for (const name of ['Insufficient History', 'Unsupported Horizon', 'Model Unavailable', 'Timeout', 'Incomplete History', 'Permission Denied']) {
    const state = component(name, 470, 204); label(state, 'State name', name.toUpperCase(), 15, 14, 440);
    label(state, 'Result boundary', 'No predicted value is shown.', 15, 165, 440);
  }
}

function addArchivedForecastDuplicates(design) {
  const archive = new Node('FRAME', 'ARCHIVE — 12 — Forecast Components — pre-refinement'); design.appendChild(archive);
  const active = design.children.find(n => n.name === constants.DESIGN_SECTIONS.forecast);
  for (const node of active.findAll(n => n.name.startsWith('Component / Forecast / '))) archive.appendChild(new Node(node.type, node.name));
  return archive;
}

test('Forecasts builds eight safe variants from active assets, ignores archives and preserves approved sections', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  addForecastSources(historical[2]); addArchivedForecastDuplicates(historical[2]);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage();
  const protectedNames = [constants.SECTIONS.shell, constants.SECTIONS.conversations, constants.SECTIONS.escalations, constants.SECTIONS.orders, constants.SECTIONS.webChat, constants.SECTIONS.analytics];
  for (const name of protectedNames) { const section = new Node('FRAME', name); page.appendChild(section); section.appendChild(new Node('TEXT', `Approved / ${name}`)); }
  const protectedBefore = protectedNames.map(name => page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.parent?.id}`));
  const historyBefore = historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.parent?.id}`));
  assert.deepEqual(forecasts.buildForecasts(page), constants.FORECAST_VARIANTS.map(v => constants.forecastName(v.key)));
  const section = page.children.find(n => n.name === constants.SECTIONS.forecasts);
  assert.equal(section.children.filter(n => n.name.startsWith('3D / Forecasts / ')).length, 8);
  const result = forecastValidator.validateForecasts(page);
  assert.equal(result.pass, true, result.checks.filter(c => !c.pass).map(c => c.label).join(', '));
  const manual = new Node('FRAME', 'Manual / Forecast note'); section.appendChild(manual);
  const inside = new Node('TEXT', 'Manual / within TARGET'); section.children.find(n => n.name === constants.forecastName('TARGET Ready')).appendChild(inside);
  forecasts.buildForecasts(page);
  assert.equal(section.children.filter(n => n.name.startsWith('3D / Forecasts / ')).length, 8);
  assert.equal(manual.parent, section);
  assert.ok(section.findAll(n => n.name === 'Manual / within TARGET').length);
  assert.equal(forecastValidator.validateForecasts(page).pass, true);
  assert.equal((await inspector.inspectPhase3D()).forecastCount, 8);
  assert.deepEqual(protectedNames.map(name => page.children.find(n => n.name === name).findAll(() => true).map(n => `${n.id}:${n.name}:${n.parent?.id}`)), protectedBefore);
  assert.deepEqual(historical.map(p => p.findAll(() => true).map(n => `${n.id}:${n.name}:${n.parent?.id}`)), historyBefore);
});

test('Forecast asset preflight stops before writing when an active asset is missing despite an archive copy', async () => {
  const { api, historical } = createMock(); globalThis.figma = api;
  const design = historical[2]; addForecastSources(design); addArchivedForecastDuplicates(design);
  const active = design.children.find(n => n.name === constants.DESIGN_SECTIONS.forecast);
  active.findAll(n => n.name === 'Component / Forecast / Permission Denied')[0].remove();
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage();
  const approved = new Node('FRAME', constants.SECTIONS.analytics); page.appendChild(approved);
  const existing = new Node('FRAME', constants.SECTIONS.forecasts); page.appendChild(existing);
  const previous = new Node('FRAME', constants.forecastName('TARGET Ready')); existing.appendChild(previous);
  const manual = new Node('TEXT', 'Manual / preserve prior forecast'); previous.appendChild(manual);
  const before = page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.parent?.id}`);
  assert.throws(() => forecasts.buildForecasts(page), /MISSING approved Phase 3C asset: Component \/ Forecast \/ Permission Denied/);
  assert.deepEqual(page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.parent?.id}`), before);
  assert.equal(previous.parent, existing);
  assert.equal(manual.parent, previous);
});

test('Forecast validator rejects predicted output in current/failure states, broken cutoff and overlaps read-only', async () => {
  const { api, historical } = createMock(); globalThis.figma = api; addForecastSources(historical[2]);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); forecasts.buildForecasts(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.forecasts);
  const board = key => section.children.find(n => n.name === constants.forecastName(key));
  const get = label => forecastValidator.validateForecasts(page).checks.find(c => c.label === label)?.pass;
  const snapshot = page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.x}:${n.y}:${n.width}:${n.height}`);
  forecastValidator.validateForecasts(page);
  assert.deepEqual(page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.characters}:${n.x}:${n.y}:${n.width}:${n.height}`), snapshot);
  const fake = new Node('INSTANCE', 'Predicted Series component'); board('MODEL_NOT_READY').appendChild(fake);
  assert.equal(get('MODEL_NOT_READY / no fake predicted result'), false); fake.remove();
  const fakeValue = new Node('TEXT', 'Invented prediction'); fakeValue.characters = 'PREDICTED 42 orders'; board('Model Unavailable').appendChild(fakeValue);
  assert.equal(get('Model Unavailable / no fake predicted result'), false); fakeValue.remove();
  const chart = board('TARGET Ready').findAll(n => n.name === 'Actual vs Predicted Chart component')[0];
  const dash = chart.findAll(n => n.name === 'PREDICTED / dash 1')[0]; dash.remove();
  assert.equal(get('TARGET Ready / ACTUAL, cutoff and dashed PREDICTED'), false); chart.appendChild(dash);
  const cutoff = chart.findAll(n => n.name === 'CUTOFF / vertical marker')[0]; const oldX = cutoff.x; cutoff.x = 800;
  assert.equal(get('TARGET Ready / ACTUAL, cutoff and dashed PREDICTED'), false); cutoff.x = oldX;
  const earlyDash = chart.findAll(n => n.name === 'PREDICTED / dash 2')[0]; const oldDashX = earlyDash.x; earlyDash.x = 420;
  assert.equal(get('TARGET Ready / ACTUAL, cutoff and dashed PREDICTED'), false); earlyDash.x = oldDashX;
  const predictedCard = board('TARGET Ready').findAll(n => n.name === 'Predicted Series component')[0]; const oldCardX = predictedCard.x; predictedCard.x = 900;
  assert.equal(get('TARGET Ready / geometry'), false); predictedCard.x = oldCardX;
  const request = board('Timeout').findAll(n => n.name === 'Forecast Request Summary')[0]; const oldY = request.y; request.y += 700;
  assert.equal(get('Timeout / geometry'), false); request.y = oldY;
  const leaked = new Node('INSTANCE', 'Provenance component'); board('Permission Denied').appendChild(leaked);
  assert.equal(get('Permission Denied / protected result withheld'), false); leaked.remove();
  const protectedValue = new Node('TEXT', 'Protected value'); protectedValue.characters = '24 orders'; board('Permission Denied').appendChild(protectedValue);
  assert.equal(get('Permission Denied / protected result withheld'), false); protectedValue.remove();
  assert.equal(forecastValidator.validateForecasts(page).pass, true);
});

test('Forecast TARGET chart uses visible rotated-cutoff geometry and rejects misleading line semantics', async () => {
  const { api, historical } = createMock(); globalThis.figma = api; addForecastSources(historical[2]);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); forecasts.buildForecasts(page);
  const section = page.children.find(n => n.name === constants.SECTIONS.forecasts);
  const ready = section.children.find(n => n.name === constants.forecastName('TARGET Ready'));
  const chart = ready.findAll(n => n.name === 'Actual vs Predicted Chart component')[0];
  const mark = name => chart.findAll(n => n.name === name)[0];
  const passes = () => forecastValidator.validateForecasts(page).checks.find(c => c.label === 'TARGET Ready / ACTUAL, cutoff and dashed PREDICTED')?.pass;
  const snapshot = () => page.findAll(() => true).map(n => `${n.id}:${n.name}:${n.parent?.id}:${n.x}:${n.y}:${n.width}:${n.height}:${n.characters}`);
  assert.equal(passes(), true, 'solid ACTUAL and separated PREDICTED dashes pass');
  const cutoff = mark('CUTOFF / vertical marker');
  cutoff.resize(215, 2);
  cutoff.relativeTransform = [[0, -1, 506], [1, 0, 90]];
  assert.equal(passes(), true, 'a 215px rotated cutoff is only 2px wide on screen');
  const before = snapshot(); passes(); assert.deepEqual(snapshot(), before, 'validation is read-only');

  const earlyDash = mark('PREDICTED / dash 2'); const oldDashX = earlyDash.x; earlyDash.x = 420;
  assert.equal(passes(), false, 'PREDICTED before cutoff fails despite labels'); earlyDash.x = oldDashX;
  cutoff.remove(); assert.equal(passes(), false, 'missing cutoff fails'); chart.appendChild(cutoff);

  const dashes = chart.findAll(n => /^PREDICTED \/ dash \d+$/.test(n.name));
  dashes.forEach(n => n.remove());
  const solidPrediction = new Node('FRAME', 'PREDICTED / solid line'); solidPrediction.x = 530; solidPrediction.y = 205; solidPrediction.resize(350, 3); chart.appendChild(solidPrediction);
  assert.equal(passes(), false, 'one solid PREDICTED line is not a dashed series');
  solidPrediction.remove(); dashes.forEach(n => chart.appendChild(n));

  const actual = mark('ACTUAL / solid segment 1'); actual.dashPattern = [6, 4];
  assert.equal(passes(), false, 'dashed ACTUAL is not a solid historical series'); delete actual.dashPattern;
  const lastActual = mark('ACTUAL / solid segment 4'); const oldActualX = lastActual.x; lastActual.x = 560;
  assert.equal(passes(), false, 'labels cannot rescue ACTUAL geometry beyond cutoff'); lastActual.x = oldActualX;

  const targetLabel = mark('Target annotation'); const oldTarget = targetLabel.characters;
  targetLabel.characters = 'Illustrative series only';
  assert.match(utils.allText(ready), /TARGET PRODUCT UX/, 'TARGET wording still exists elsewhere in this board');
  assert.equal(passes(), false, 'TARGET wording elsewhere cannot substitute for chart annotation');
  targetLabel.characters = oldTarget;
  assert.equal(passes(), true);
});

test('Forecasts keeps long EN/RU/KZ safe guidance and return label inside expandable regions', async () => {
  const next = 'Inspect Historical Analytics or wait for validated forecast capability.';
  const returnLabel = 'Open Historical Analytics  →';
  const extended = 'Review history · Проверьте историю · Тарихи деректерді қарау. '.repeat(5);
  const { api, historical } = createMock({ textTransform: value => value === returnLabel ? extended : value.includes(next) ? value.replace(next, extended) : value });
  globalThis.figma = api; addForecastSources(historical[2]);
  await ds.loadDesignAssets(); await utils.loadFonts();
  const page = await utils.writablePage(); forecasts.buildForecasts(page);
  const board = page.findAll(n => n.name === constants.forecastName('MODEL_NOT_READY'))[0];
  const link = board.findAll(n => n.name === 'Open Historical Analytics')[0];
  const label = link.children.find(n => n.name === 'Action label');
  const state = board.findAll(n => n.name === 'Availability State')[0];
  const guidance = state.findAll(n => n.name === 'Current safe path')[0];
  assert.ok(link.height > 48);
  assert.ok(label.y + label.height <= link.height);
  assert.ok(guidance.y + guidance.height <= state.height);
  assert.equal(forecastValidator.validateForecasts(page).checks.find(c => c.label === 'MODEL_NOT_READY / geometry')?.pass, true);
});

function aggregateFixture() {
  const { api, historical } = createMock(); globalThis.figma = api;
  const page = new Node('PAGE', constants.TARGET_PAGE); api.root.appendChild(page);
  const names = [
    ['Shared Staff Shell', constants.SECTIONS.shell], ['Conversations', constants.SECTIONS.conversations],
    ['Escalations', constants.SECTIONS.escalations], ['Orders', constants.SECTIONS.orders],
    ['Customer Web Chat', constants.SECTIONS.webChat], ['Analytics', constants.SECTIONS.analytics],
    ['Forecasts', constants.SECTIONS.forecasts],
  ];
  const sections = Object.fromEntries(names.map(([name, canonical]) => {
    const section = new Node('FRAME', canonical); section.fills = [{ type: 'SOLID', boundVariables: { color: { id: 'semantic-color' } } }]; page.appendChild(section);
    return [name, section];
  }));
  const shellFrame = new Node('FRAME', constants.SHELL_NAME); sections['Shared Staff Shell'].appendChild(shellFrame);
  const nav = new Node('FRAME', 'Staff navigation'); shellFrame.appendChild(nav);
  for (const area of constants.NAV_PRIMARY) nav.appendChild(new Node('FRAME', `Primary / ${area}`));
  const addInstance = (area, name) => sections[area].appendChild(new Node('INSTANCE', name));
  addInstance('Shared Staff Shell', 'Phase 3C / Active Primary Item'); addInstance('Shared Staff Shell', 'Phase 3C / Restricted Link reference');
  addInstance('Conversations', 'Phase 3C / Customer message'); addInstance('Conversations', 'Phase 3C / Business reply');
  for (const name of ['Selected Queue Item', 'Human Decision', 'Uncertain Effect']) addInstance('Escalations', name);
  addInstance('Customer Web Chat', 'Confirmation Request component');
  addInstance('Analytics', 'Historical Chart component'); addInstance('Forecasts', 'Actual vs Predicted Chart component');
  for (const v of constants.VARIANTS) {
    const frame = new Node('FRAME', constants.conversationName(v.key)); sections.Conversations.appendChild(frame);
    if (['Support Active', 'Sales Active', 'Human Takeover'].includes(v.key)) {
      const owner = new Node('TEXT', 'Active handler'); owner.characters = v.handler; frame.appendChild(owner);
    }
  }
  const required = {
    'Shared Staff Shell': ['Audit restricted/contextual navigation', 'Agent Runs restricted/contextual navigation', 'No prohibited architecture navigation'],
    Conversations: ['Handoff does not transfer permissions', 'Proposal is not executed', 'Known failure · no hold', 'OUTCOME_UNKNOWN · reconcile / no blind retry', 'Message delivery failure after confirmed effect', ...constants.VARIANTS.map(v => v.title),
      'Confirmed result region unique', 'Confirmed result layout fits', 'Known failure result region unique', 'Known failure result layout fits', 'OUTCOME_UNKNOWN result region unique', 'OUTCOME_UNKNOWN result layout fits', 'Message delivery result region unique', 'Message delivery layout fits'],
    Escalations: ['OUTCOME_UNKNOWN reconciliation / no blind retry', 'E02 update_order restricted, not unknown', 'TARGET M12 decision → revalidation → request, no replay', 'Resolved distinct from Closed', ...constants.ESCALATION_VARIANTS.map(v => v.title), ...constants.ESCALATION_VARIANTS.map(v => `${v.key} / geometry`)],
    Orders: ['Known Failure is known and has authorized recovery', 'OUTCOME_UNKNOWN reconciles before retry', 'Stale / Conflict requires refresh and revalidation', 'E02 update restricted and separate', 'Order Delivery remains separate from Message Delivery', ...constants.ORDER_VARIANTS.map(v => v.title), ...constants.ORDER_VARIANTS.map(v => `${v.key} / geometry`)],
    'Customer Web Chat': ['Confirmation Request / explicit business authorization', 'Confirmation Pending / unknown result in customer language', 'Message Delivery Failure / transport and business effect separate', ...constants.WEB_CHAT_VARIANTS.map(v => `Variant / ${v.key}`), ...constants.WEB_CHAT_VARIANTS.map(v => `${v.key} / mobile geometry`)],
    Analytics: ['Valid Empty / successful no-record result', 'Incomplete / visible gap, not zero', 'Dependency Unavailable / no substitute zero', 'Permission Denied / no protected report values', ...constants.ANALYTICS_VARIANTS.map(v => `Variant / ${v.key}`), ...constants.ANALYTICS_VARIANTS.map(v => `${v.key} / geometry`)],
    Forecasts: ['TARGET Ready / illustrative and separate from current', 'TARGET Ready / ACTUAL, cutoff and dashed PREDICTED', 'MODEL_NOT_READY / current and no result', 'Insufficient History / short but available', 'Incomplete History / missing coverage, not zero', 'Permission Denied / protected result withheld', ...constants.FORECAST_VARIANTS.map(v => `Variant / ${v.key}`), ...constants.FORECAST_VARIANTS.map(v => `${v.key} / geometry`)],
  };
  const children = Object.fromEntries(names.map(([name]) => [name, { section: name, pass: true, checks: [...new Set(required[name])].map(label => ({ label, pass: true })) }]));
  const sourceNames = ['Navigation / Primary Item', 'Conversation / Message Row', 'Business / Order State', 'Business / Reservation State', 'Web Chat / Confirmation Request', 'Analytics / Historical Chart', 'Forecast / Actual vs Predicted Chart'];
  const assets = { pageExists: true, variables: 24, components: sourceNames.map(name => ({ canonicalName: `Component / ${name}`, found: true })), treatments: [], gaps: [] };
  return { api, historical, page, sections, children, assets };
}

test('Phase 3D aggregate passes seven exact sections and fails when any child or source gate fails', () => {
  const { api, page, sections, children, assets } = aggregateFixture();
  const aggregate = () => aggregateValidator.aggregatePhase3DResults(page, assets, children);
  let result = aggregate();
  assert.equal(result.pass, true, aggregateValidator.formatAggregateValidation(result));
  assert.match(aggregateValidator.formatAggregateValidation(result), /P0 high-fi screens: 6\/6 PASS\nplus Shared Shell PASS/);
  assert.match(aggregateValidator.formatAggregateValidation(result), /Semantic consistency: PASS[\s\S]*Geometry: PASS[\s\S]*Phase 3C asset usage: PASS[\s\S]*Source-page protection: PASS/);
  children.Forecasts.pass = false;
  assert.equal(aggregate().pass, false, 'one failed child makes aggregate FAIL');
  children.Forecasts.pass = true;
  const chartGeometry = children.Forecasts.checks.find(c => c.label === 'TARGET Ready / ACTUAL, cutoff and dashed PREDICTED');
  chartGeometry.pass = false;
  assert.equal(aggregate().geometry, false, 'a failed chart geometry check fails the geometry gate');
  assert.equal(aggregate().pass, false);
  chartGeometry.pass = true;
  const duplicate = new Node('FRAME', constants.SECTIONS.analytics); page.appendChild(duplicate);
  result = aggregate(); assert.equal(result.sections.find(s => s.name === 'Analytics').pass, false, 'duplicate exact FRAME fails'); duplicate.remove();
  const wrongType = new Node('TEXT', constants.SECTIONS.orders); page.appendChild(wrongType);
  assert.equal(aggregate().sections.find(s => s.name === 'Orders').pass, false, 'exact-name TEXT cannot count as section'); wrongType.remove();
  const extra = new Node('FRAME', 'Primary / Tools'); sections['Shared Staff Shell'].findAll(n => n.name === 'Staff navigation')[0].appendChild(extra);
  assert.equal(aggregate().semantic, false, 'seventh top-level destination fails'); extra.remove();
  sections.Forecasts.fills = [];
  assert.equal(aggregate().assetUsage, false, 'missing generated semantic color binding fails');
  sections.Forecasts.fills = [{ type: 'SOLID', boundVariables: { color: { id: 'semantic-color' } } }];
  const source = api.root.children.find(p => p.name === '03A — Low-Fi Wireframes'); source.remove();
  assert.equal(aggregate().sourceProtection, false, 'missing protected source page fails');
});

test('Phase 3D aggregate runs existing validators read-only without invoking builders', () => {
  const { api, historical, page, assets } = aggregateFixture();
  const snapshot = () => api.root.findAll(() => true).map(n => `${n.id}:${n.name}:${n.type}:${n.parent?.id}:${n.characters}:${n.width}:${n.height}`);
  const before = snapshot();
  api.createFrame = () => { throw new Error('builder or scenegraph write attempted'); };
  api.createText = () => { throw new Error('builder or scenegraph write attempted'); };
  const result = aggregateValidator.validatePhase3DAggregate(page, assets);
  assert.equal(result.pass, false, 'incomplete synthetic screens must not be hardcoded PASS');
  assert.deepEqual(snapshot(), before, '03D and 03A/03B/03C are unchanged');
  assert.equal(historical.length, 3);
  const report = aggregateValidator.formatAggregateValidation(result);
  assert.match(report, /^PHASE 3D HIGH-FIDELITY VALIDATION\nPage: 03D/m);
  assert.match(report, /Scope:\nstructural, semantic and generated-node geometry validation;\nmanual visual review remains separate and has been performed externally\./);
  assert.doesNotMatch(report, /certified|WCAG certification|usability certification/i);
});

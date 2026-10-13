import { FLOWS, PROTECTED_PAGES, TARGET_PAGE, cloneName, flowSectionName, graphErrors, type FlowSpec } from './constants';
import { inspectPrototypeApi } from './builders';
import { checkFlowOne } from './flow1-validation';
import { checkFlowTwo } from './flow2-validation';
import { checkFlowThree } from './flow3-validation';
import { checkFlowFour } from './flow4-validation';
import { checkFlowFive } from './flow5-validation';
import { checkFlowSix } from './flow6-validation';
import { checkFlowSeven } from './flow7-validation';
import { checkFlowEight } from './flow8-validation';
import { findUniqueControl, ownedNames, visualSignature } from './prototype-utils';
import { exactPage, inspectSources } from './source-inspector';

export type Validation = { report: string; passed: boolean };

export async function validatePrototype(): Promise<Validation> {
  const lines = ['PHASE 3E INTERACTIVE PROTOTYPE VALIDATION', `Page: ${TARGET_PAGE}`];
  let passed = true;
  let incomplete = false;
  let broken = 0;
  const sourceInspection = await inspectSources();
  const sourcePass = sourceInspection.issues.length === 0 && sourceInspection.findings.length > 0 && sourceInspection.findings.every(f => f.status === 'FOUND');
  lines.push(`03D source inspection: ${sourcePass ? 'PASS' : 'FAIL'}`);
  if (!sourcePass) passed = false;
  const api = await inspectPrototypeApi();
  lines.push(`Prototype API: ${api.includes('Create reactions: SUPPORTED') ? 'PARTIAL (reactions supported; formal starts read-only)' : 'BLOCKED'}`);
  if (!api.includes('Create reactions: SUPPORTED')) passed = false;
  const page = exactPage(TARGET_PAGE);
  if (!page) {
    lines.push('03E page: MISSING', 'Overall: FAIL', 'Scope: structure/reaction checks only; no backend implementation claim.');
    return { report: lines.join('\n'), passed: false };
  }
  await page.loadAsync();
  const principles = page.children.filter(n => n.name === '00 — Prototype Principles' && n.type === 'SECTION');
  const validation = page.children.filter(n => n.name === '09 — Prototype Validation' && n.type === 'SECTION');
  const sectionNames = new Set(page.children.map(n => n.name));
  const structurePass = principles.length === 1 && validation.length === 1;
  lines.push(`Principles/Validation sections: ${structurePass ? 'PASS' : 'FAIL'}`);
  if (!structurePass) passed = false;
  const sourceMap = new Map(sourceInspection.findings.map(f => [f.key, f.exactFrames[0]]));
  let visualPass = true;
  for (const flow of FLOWS) {
    const issues = graphErrors(flow);
    const sectionMatches = page.children.filter(n => n.name === flowSectionName(flow.id));
    if (sectionMatches.length === 0) {
      lines.push(`Flow ${flow.id} — ${flow.title}: NOT BUILT`);
      incomplete = true;
      continue;
    }
    if (sectionMatches.length !== 1 || sectionMatches[0].type !== 'SECTION') {
      lines.push(`Flow ${flow.id} — ${flow.title}: FAIL (section missing/duplicate/wrong type)`);
      passed = false;
      continue;
    }
    const section = sectionMatches[0] as SectionNode;
    let flowTwoChecks: { name: string; passed: boolean }[] = [];
    let flowTwoStrategy: string | null = null;
    let flowThreeChecks: { name: string; passed: boolean }[] = [];
    let flowThreeStrategy: string | null = null;
    let flowThreeBroken = 0;
    let flowFourChecks: { name: string; passed: boolean }[] = [];
    let flowFourStrategies: { request: string | null; accept: string | null } = { request: null, accept: null };
    let flowFourBroken = 0;
    let flowFiveChecks: { name: string; passed: boolean }[] = [];
    let flowFiveStrategy: string | null = null;
    let flowFiveBroken = 0;
    let flowSixChecks: { name: string; passed: boolean }[] = [];
    let flowSixStrategy: string | null = null;
    let flowSixBroken = 0;
    let flowSevenChecks: { name: string; passed: boolean }[] = [];
    let flowSevenStrategies: { open: string | null; back: string | null; target: string } = { open: null, back: null, target: 'NON-INTERACTIVE SPECIMEN' };
    let flowSevenBroken = 0;
    let flowEightChecks: { name: string; passed: boolean }[] = [];
    let flowEightRetry: string | null = null;
    let flowEightBroken = 0;
    const clones = new Map<string, FrameNode>();
    for (const item of flow.frames) {
      const exact = section.children.filter(n => n.name === cloneName(flow.id, item.key));
      if (exact.length !== 1 || exact[0].type !== 'FRAME') issues.push(`${item.key}: clone missing/duplicate/wrong type`);
      else clones.set(item.key, exact[0] as FrameNode);
    }
    for (const name of ownedNames(flow)) if (section.children.filter(n => n.name === name).length > 1) issues.push(`Duplicate plugin-owned ${name}`);
    const prefix = `3E / Flow ${String(flow.id).padStart(2, '0')}`;
    if (flow.id !== 1 && flow.id !== 3 && flow.id !== 4 && flow.id !== 5 && flow.id !== 6 && flow.id !== 7 && flow.id !== 8 && (section.children.filter(n => n.name === `${prefix} / START`).length !== 1 || section.children.filter(n => n.name === `${prefix} / END`).length !== 1)) issues.push('START/END annotation missing');
    if (clones.size === flow.frames.length) {
      for (const item of flow.frames) {
        const source = sourceMap.get(item.source);
        if (!source || visualSignature(clones.get(item.key)!) !== visualSignature(source)) { issues.push(`Visual-source preservation failed: ${item.key}`); visualPass = false; }
      }
      if (flow.id === 1) {
        const one = await checkFlowOne(section, new Map([['default', sourceMap.get('conversationDefault')!], ['support', sourceMap.get('conversationSupport')!]]));
        issues.push(...one.issues);
        broken += one.broken;
      } else if (flow.id === 2) {
        const two = await checkFlowTwo(section, new Map(flow.frames.map(item => [item.key, sourceMap.get(item.source)!])));
        issues.push(...two.issues);
        broken += two.broken;
        flowTwoChecks = two.checks;
        flowTwoStrategy = two.strategy;
      } else if (flow.id === 3) {
        const three = await checkFlowThree(section, new Map(flow.frames.map(item => [item.key, sourceMap.get(item.source)!])));
        issues.push(...three.issues);
        broken += three.broken;
        flowThreeChecks = three.checks;
        flowThreeStrategy = three.strategy;
        flowThreeBroken = three.broken;
      } else if (flow.id === 4) {
        const four = await checkFlowFour(section, new Map(flow.frames.map(item => [item.key, sourceMap.get(item.source)!])));
        issues.push(...four.issues);
        broken += four.broken;
        flowFourChecks = four.checks;
        flowFourStrategies = four.strategies;
        flowFourBroken = four.broken;
      } else if (flow.id === 5) {
        const five = await checkFlowFive(section, new Map(flow.frames.map(item => [item.key, sourceMap.get(item.source)!])));
        issues.push(...five.issues);
        broken += five.broken;
        flowFiveChecks = five.checks;
        flowFiveStrategy = five.strategy;
        flowFiveBroken = five.broken;
      } else if (flow.id === 6) {
        const six = await checkFlowSix(section, new Map(flow.frames.map(item => [item.key, sourceMap.get(item.source)!])));
        issues.push(...six.issues);
        broken += six.broken;
        flowSixChecks = six.checks;
        flowSixStrategy = six.strategy;
        flowSixBroken = six.broken;
      } else if (flow.id === 7) {
        const seven = await checkFlowSeven(section, new Map(flow.frames.map(item => [item.key, sourceMap.get(item.source)!])));
        issues.push(...seven.issues);
        broken += seven.broken;
        flowSevenChecks = seven.checks;
        flowSevenStrategies = seven.strategies;
        flowSevenBroken = seven.broken;
      } else if (flow.id === 8) {
        const eight = await checkFlowEight(section, new Map(flow.frames.map(item => [item.key, sourceMap.get(item.source)!])));
        issues.push(...eight.issues);
        broken += eight.broken;
        flowEightChecks = eight.checks;
        flowEightRetry = eight.retryStrategy;
        flowEightBroken = eight.broken;
      } else for (const edge of flow.edges) {
        try {
          const control = findUniqueControl(clones.get(edge.from)!, edge.control);
          const reactions = control.reactions;
          const valid = reactions.length === 1 && reactions[0].trigger?.type === 'ON_CLICK' && reactions[0].actions?.length === 1 && reactions[0].actions[0].type === 'NODE' && reactions[0].actions[0].navigation === 'NAVIGATE' && reactions[0].actions[0].destinationId === clones.get(edge.to)!.id;
          if (!valid) { issues.push(`Missing/wrong reaction ${edge.from} → ${edge.to}`); broken++; }
        } catch (error) { issues.push(String(error)); broken++; }
      }
      if (flow.id !== 1 && flow.id !== 2 && flow.id !== 3 && flow.id !== 4 && flow.id !== 5 && flow.id !== 6 && flow.id !== 7 && flow.id !== 8) {
        const permitted = new Map<string, string>();
        for (const edge of flow.edges) {
          try { permitted.set(findUniqueControl(clones.get(edge.from)!, edge.control).id, clones.get(edge.to)!.id); }
          catch { /* The missing-control error was recorded above. */ }
        }
        for (const clone of clones.values()) {
          for (const node of [clone, ...clone.findAll(n => 'reactions' in n)] as (SceneNode & ReactionMixin)[]) {
            for (const reaction of node.reactions) for (const action of reaction.actions ?? []) {
              if (action.type !== 'NODE' || !action.destinationId || permitted.get(node.id) !== action.destinationId) { issues.push(`Prohibited/broken destination on ${node.name}`); broken++; }
            }
          }
        }
      }
    }
    lines.push(`Flow ${flow.id} — ${flow.title}: ${issues.length ? 'FAIL' : 'PASS'}`);
    if (flow.id === 2) {
      for (const check of flowTwoChecks) lines.push(`  ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
      lines.push('  Customer confirmation → Processing source: PROTOTYPE CONTROL');
      lines.push('  Processing → Confirmed Result source: PROTOTYPE CONTROL');
      lines.push(`  Open Order source: ${flowTwoStrategy ?? 'UNRESOLVED'}`);
    }
    if (flow.id === 3) {
      for (const check of flowThreeChecks) lines.push(`  ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
      lines.push(`  Open Order source: ${flowThreeStrategy ?? 'UNRESOLVED'}`);
      lines.push(`  Flow 3 broken destinations: ${flowThreeBroken}`);
    }
    if (flow.id === 4) {
      for (const check of flowFourChecks) lines.push(`  ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
      lines.push(`  Support → Handoff source: ${flowFourStrategies.request ?? 'UNRESOLVED'}`);
      lines.push(`  Handoff → Sales source: ${flowFourStrategies.accept ?? 'UNRESOLVED'}`);
      lines.push(`  Flow 4 broken destinations: ${flowFourBroken}`);
    }
    if (flow.id === 5) {
      for (const check of flowFiveChecks) lines.push(`  ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
      lines.push(`  Open Escalation source: ${flowFiveStrategy ?? 'UNRESOLVED'}`);
      lines.push(`  Flow 5 broken destinations: ${flowFiveBroken}`);
    }
    if (flow.id === 6) {
      for (const check of flowSixChecks) lines.push(`  ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
      lines.push(`  Human Decision progression source: ${flowSixStrategy ?? 'UNRESOLVED'}`);
      lines.push('  Controlled Resume request source: PROTOTYPE CONTROL');
      lines.push(`  Flow 6 broken destinations: ${flowSixBroken}`);
    }
    if (flow.id === 7) {
      for (const check of flowSevenChecks) lines.push(`  ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
      lines.push(`  Analytics → Forecasts source: ${flowSevenStrategies.open ?? 'UNRESOLVED'}`);
      lines.push(`  Forecasts → Analytics source: ${flowSevenStrategies.back ?? 'UNRESOLVED'}`);
      lines.push(`  TARGET specimen entry: ${flowSevenStrategies.target}`);
      lines.push(`  Flow 7 broken destinations: ${flowSevenBroken}`);
    }
    if (flow.id === 8) {
      for (const check of flowEightChecks) lines.push(`  ${check.name}: ${check.passed ? 'PASS' : 'FAIL'}`);
      const eightPass = (name: string): boolean => flowEightChecks.some(check => check.name === name && check.passed);
      lines.push(`  Confirm order source: ${eightPass('Explicit Confirm order') && eightPass('Confirm order → Processing') ? 'PRODUCT CONTROL' : 'UNRESOLVED'}`);
      lines.push(`  Processing → Confirmed Result source: ${eightPass('Processing → Confirmed Result') ? 'PROTOTYPE CONTROL' : 'UNRESOLVED'}`);
      lines.push(`  Delivery failure branch source: ${eightPass('Message-delivery branch') && eightPass('Confirmed Result → Message Delivery Failure') ? 'PROTOTYPE CONTROL' : 'UNRESOLVED'}`);
      lines.push(`  Message retry source: ${flowEightRetry ?? 'UNRESOLVED'}`);
      lines.push(`  Flow 8 broken destinations: ${flowEightBroken}`);
    }
    for (const issue of issues) lines.push(`  - ${issue}`);
    if (issues.length) passed = false;
  }
  const protectedPass = PROTECTED_PAGES.every(n => Boolean(exactPage(n)));
  lines.push(`Source-page protection: ${protectedPass ? 'PASS (guards and page presence)' : 'FAIL'}`);
  if (!protectedPass) passed = false;
  lines.push(`Visual-source preservation: ${visualPass ? 'PASS' : 'FAIL'}`);
  lines.push(`Broken/prohibited destinations: ${broken}`);
  lines.push(`Overall: ${passed ? incomplete ? 'INCOMPLETE' : 'PASS' : 'FAIL'}`);
  lines.push('Scope: structure, clone equivalence and prototype reactions; not backend execution, usability or manual visual approval.');
  return { report: lines.join('\n'), passed: passed && !incomplete };
}

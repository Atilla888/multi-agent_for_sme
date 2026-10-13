import { PLUGIN_NAME, SECTION_LABELS, TARGET_PAGE } from '../constants';

type Status = 'PASS' | 'PARTIAL' | 'FAIL';

interface Snapshot {
  names: string[];
  text: string[];
}

function snapshot(page: PageNode): Snapshot {
  const nodes = page.findAll();
  return {
    names: nodes.map(node => node.name),
    text: nodes.filter((node): node is TextNode => node.type === 'TEXT').map(node => node.characters),
  };
}

const contains = (items: string[], term: string): boolean => items.some(value => value.toLowerCase().includes(term.toLowerCase()));
const exact = (items: string[], name: string): boolean => items.includes(name);
const every = (items: string[], names: string[]): boolean => names.every(name => exact(items, name));

function status(s: Snapshot, required: string[], partialHint: string): Status {
  if (every(s.names, required)) return 'PASS';
  if (contains(s.names, partialHint)) return 'PARTIAL';
  return 'FAIL';
}

export function inspectPage(page: PageNode): string {
  const s = snapshot(page);
  const concepts = [...s.names, ...s.text];
  const conversations = contains(s.names, 'Conversations Revised') || contains(s.names, '3B / Conversations /');
  const escalation = status(s, ['3B / Escalations / Queue Revised', '3B / Escalations / Decision Context'], 'Escalation');
  const orders = status(s, ['3B / Orders / List Revised', '3B / Orders / Detail / Reservation Confirmed'], 'Order');
  const simple = (label: string) => contains(s.names, label) ? 'FOUND' : 'MISSING';
  return [
    `PHASE 3B INSPECTION — READ ONLY`,
    `Page: ${TARGET_PAGE}`,
    `Conversations: ${conversations ? 'FOUND' : 'MISSING'}`,
    `Escalations: ${escalation === 'PASS' ? 'FOUND' : escalation === 'PARTIAL' ? 'PARTIAL' : 'MISSING'}`,
    `Orders: ${orders === 'PASS' ? 'FOUND' : orders === 'PARTIAL' ? 'PARTIAL' : 'MISSING'}`,
    `Web Chat: ${simple('Web Chat')}`,
    `Analytics: ${simple('Analytics')}`,
    `Forecasts: ${simple('Forecast')}`,
    `Walkthroughs: ${simple('Scenario')}`,
    '',
    'Concepts / names:',
    ...['OUTCOME_UNKNOWN', 'MODEL_NOT_READY', 'E02', 'Resume', 'Reconciliation'].map(term => `${term}: ${contains(concepts, term) ? 'FOUND' : 'MISSING'}`),
    '',
    'Existing manual/AI layers are not changed by inspection.',
  ].join('\n');
}

export function validatePage(page: PageNode): string {
  const s = snapshot(page);
  const concepts = [...s.names, ...s.text];
  const checks: Array<[string, Status]> = [
    ['Conversations present', contains(s.names, 'Conversations Revised') || contains(s.names, '3B / Conversations /') ? 'PASS' : 'FAIL'],
    ['Escalations Queue present', status(s, ['3B / Escalations / Queue Revised'], 'Escalation')],
    ['Escalations Detail present', status(s, ['3B / Escalations / Decision Context'], 'Escalation')],
    ['Orders present', status(s, ['3B / Orders / Detail / Reservation Confirmed', '3B / Orders / Detail / Reservation Failed', '3B / Orders / Detail / OUTCOME_UNKNOWN'], 'Order')],
    ['Web Chat present', status(s, ['3B / Web Chat / Initial', '3B / Web Chat / Active'], 'Web Chat')],
    ['Analytics present', status(s, ['3B / Analytics / Valid Result', '3B / Analytics / Dependency Unavailable'], 'Analytics')],
    ['Forecasts present', status(s, ['3B / Forecasts / TARGET Ready', '3B / Forecasts / MODEL_NOT_READY'], 'Forecast')],
    ['OUTCOME_UNKNOWN present', contains(concepts, 'OUTCOME_UNKNOWN') ? 'PASS' : 'FAIL'],
    ['MODEL_NOT_READY present', contains(concepts, 'MODEL_NOT_READY') ? 'PASS' : 'FAIL'],
    ['E02 restriction present', contains(concepts, 'E02') && contains(concepts, 'restricted') ? 'PASS' : contains(concepts, 'E02') ? 'PARTIAL' : 'FAIL'],
    ['Order / Reservation separation present', contains(concepts, 'ORDER STATE') && contains(concepts, 'RESERVATION STATE') ? 'PASS' : contains(s.names, 'Order') ? 'PARTIAL' : 'FAIL'],
  ];
  for (let index = 1; index <= 6; index++) {
    checks.push([`Scenario ${index} present`, status(s, [`3B / Scenario / ${[
      '1 Product Availability', '2 Purchase Successful Reservation', '3 Purchase Reservation Failure',
      '4 Support Sales Handoff', '5 OUTCOME_UNKNOWN Escalation', '6 Analytics Forecast',
    ][index - 1]}`], SECTION_LABELS.walkthroughs)]);
  }
  const passed = checks.filter(([, result]) => result === 'PASS').length;
  const scenarios = checks.slice(-6).filter(([, result]) => result === 'PASS').length;
  return [
    'PHASE 3B FIGMA VALIDATION',
    `Page: ${TARGET_PAGE}`,
    `Plugin: ${PLUGIN_NAME}`,
    '',
    ...checks.map(([name, result]) => `${name}: ${result}`),
    '',
    `Scenario Walkthroughs: ${scenarios}/6`,
    `Structural checks: ${passed}/${checks.length} PASS`,
    'Scope: structural presence only; not semantic review or visual approval.',
  ].join('\n');
}

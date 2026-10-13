import { FILE_KEY, FILE_NAME, TARGET_PAGE, SHELL_NAME, VARIANTS, conversationName, ESCALATION_VARIANTS, escalationName, ORDER_VARIANTS, orderName, WEB_CHAT_VARIANTS, webChatName, ANALYTICS_VARIANTS, analyticsName, FORECAST_VARIANTS, forecastName } from './constants';

export function assertCanonicalFile(name: string, key: string | undefined): void {
  if (name !== FILE_NAME) throw new Error(`Wrong file: expected ${FILE_NAME}. Nothing was changed.`);
  if (key && key !== FILE_KEY) throw new Error(`Wrong Figma file key. Nothing was changed.`);
}

export function assertWritablePage(name: string): void {
  if (name !== TARGET_PAGE) throw new Error(`Writes are allowed only on ${TARGET_PAGE}.`);
}

export const SHELL_OWNED = [SHELL_NAME] as const;
export const CONVERSATIONS_OWNED = VARIANTS.map(v => conversationName(v.key));
export const ESCALATIONS_OWNED = ESCALATION_VARIANTS.map(v => escalationName(v.key));
export const ORDERS_OWNED = ORDER_VARIANTS.map(v => orderName(v.key));
export const WEB_CHAT_OWNED = WEB_CHAT_VARIANTS.map(v => webChatName(v.key));
export const ANALYTICS_OWNED = ANALYTICS_VARIANTS.map(v => analyticsName(v.key));
export const FORECASTS_OWNED = FORECAST_VARIANTS.map(v => forecastName(v.key));

type NamedNode = { name: string; type: string; remove(): void; children?: readonly NamedNode[]; appendChild?(node: NamedNode): void };
type Container = { children: readonly NamedNode[] };

export function preflightOwned(container: Container, owned: readonly string[]): void {
  for (const name of owned) {
    const exact = container.children.filter(n => n.name === name);
    if (exact.length > 1) throw new Error(`Duplicate owned frame name: ${name}. Resolve manually.`);
    if (exact.some(n => n.type !== 'FRAME')) throw new Error(`Owned name belongs to a non-FRAME node: ${name}. Resolve manually.`);
  }
}

export function replaceOwned(container: Container, owned: readonly string[], staged: readonly NamedNode[]): void {
  preflightOwned(container, owned);
  if (staged.length !== owned.length) throw new Error('Builder did not stage every owned frame.');
  const staging = owned.map(name => `${name} / staging`);
  if (staged.some((n, i) => n.name !== staging[i] || n.type !== 'FRAME')) throw new Error('Builder staged unexpected names/types.');
  for (let i = 0; i < owned.length; i++) {
    const previous = container.children.find(n => n.name === owned[i]);
    if (previous) preserveManualChildren(previous, staged[i]);
  }
  for (const n of [...container.children]) if (owned.includes(n.name)) n.remove();
  staged.forEach((n, i) => { n.name = owned[i]; });
}

function preserveManualChildren(previous: NamedNode, next: NamedNode): void {
  if (previous.type !== 'FRAME' || next.type !== 'FRAME' || !previous.children || !next.children || !next.appendChild) return;
  for (const child of [...previous.children]) {
    const generated = next.children.find(n => n.name === child.name && n.type === child.type);
    if (generated) preserveManualChildren(child, generated);
    else next.appendChild(child);
  }
}

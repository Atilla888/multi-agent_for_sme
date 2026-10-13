import type { PanelSpec, ScreenSpec } from '../types';

export const panel = (heading: string, ...lines: string[]): PanelSpec => ({ heading, lines });
export const attention = (heading: string, ...lines: string[]): PanelSpec => ({ heading, lines, tone: 'attention' });

export const unknownOutcome = (operation: string): PanelSpec => attention(
  'OUTCOME UNKNOWN (OUTCOME_UNKNOWN) — confirmation pending',
  'Effect may have committed.',
  'Confirmation unavailable.',
  'Reconciliation required.',
  'DO NOT retry mutation.',
  `Operation: ${operation}`,
);

export const screen = (
  name: string, title: string, subtitle: string, surface: ScreenSpec['surface'], status: string,
  columns: PanelSpec[][], extras: Pick<ScreenSpec, 'actions' | 'annotation' | 'references'> = {},
): ScreenSpec => ({ name, title, subtitle, surface, status, columns, ...extras });

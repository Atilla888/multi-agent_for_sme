export interface PanelSpec {
  heading: string;
  lines: string[];
  tone?: 'normal' | 'attention';
  kind?: 'panel' | 'table' | 'chart' | 'flow';
}

export interface ScreenSpec {
  name: string;
  title: string;
  subtitle: string;
  surface: 'staff' | 'customer' | 'flow';
  status: string;
  columns: PanelSpec[][];
  actions?: string[];
  annotation?: string;
  references?: string[];
}

export interface SectionSpec {
  key: string;
  label: string;
  intro: string;
  screens: ScreenSpec[];
}

export type Command = 'inspect' | 'escalations' | 'orders' | 'webChat' | 'analytics' | 'forecasts' | 'walkthroughs' | 'validate';

export interface PluginMessage {
  kind: 'result';
  action: Command;
  ok: boolean;
  message: string;
  report?: string;
}

import type { ProductState } from "@/types/states";

export type AdministrationViewState = "fixture" | "loading" | "empty" | "restricted" | "unavailable";

export type IntegrationChannel = "Instagram" | "WhatsApp" | "Telegram" | "Web Chat";
export type IntegrationReadiness = "NOT_CONFIGURED" | "DEFERRED" | "UNAVAILABLE";

export interface IntegrationView {
  readonly id: string;
  readonly channel: IntegrationChannel;
  readonly readiness: IntegrationReadiness;
  readonly mode: null;
  readonly capability: string;
  readonly observation: string;
  readonly impact: string;
}

export interface IntegrationsScreenModel {
  readonly mode: "sample";
  readonly state: AdministrationViewState;
  readonly items: readonly IntegrationView[];
}

export interface SettingFieldView {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly description: string;
  readonly editable: false;
}

export interface SettingsSectionView {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly fields: readonly SettingFieldView[];
}

export interface SettingsScreenModel {
  readonly mode: "sample";
  readonly state: AdministrationViewState;
  readonly sections: readonly SettingsSectionView[];
}

export interface AuditEventView {
  readonly id: string;
  readonly occurredAt: string;
  readonly actor: string;
  readonly scope: string;
  readonly action: string;
  readonly resource: string;
  readonly result: string;
  readonly badge: ProductState;
  readonly correlationRef: string;
  readonly provenance: string;
  readonly safeSummary: string;
}

export interface AuditScreenModel {
  readonly mode: "sample";
  readonly state: AdministrationViewState;
  readonly query: string;
  readonly items: readonly AuditEventView[];
  readonly selected: AuditEventView | null;
}

export type SafeAgentRole = "Sales Agent" | "Support Agent" | "Analytics Agent";

/** The stages of one AI run, in order: the agent proposes, the system checks, the work is done. */
export type AgentRunPhase = "Agent proposed" | "Permission checked" | "Carried out" | "Result recorded" | "Person needed";

export interface AgentRunStepView {
  readonly id: string;
  readonly phase: AgentRunPhase;
  readonly title: string;
  readonly safeSummary: string;
  readonly status: ProductState;
  readonly reference: string | null;
}

export interface AgentRunView {
  readonly id: string;
  readonly correlationRef: string;
  readonly role: SafeAgentRole;
  readonly status: ProductState;
  readonly statusLabel: string;
  readonly currentHandler: string;
  readonly previousHandler: string | null;
  readonly startedAt: string;
  readonly stopReason: string;
  readonly toolName: string;
  readonly modelProvider: string;
  readonly modelStatus: string;
  readonly latency: string;
  readonly usage: string;
  readonly steps: readonly AgentRunStepView[];
}

export interface AgentRunsScreenModel {
  readonly mode: "sample";
  readonly state: AdministrationViewState;
  readonly items: readonly AgentRunView[];
  readonly selected: AgentRunView | null;
}

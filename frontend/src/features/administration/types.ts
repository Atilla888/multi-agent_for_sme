import type { StaffRole } from "@/types/auth";
import type { ProductState } from "@/types/states";

export type AdministrationViewState = "fixture" | "loading" | "empty" | "restricted" | "unavailable";

export type IntegrationChannel = "Instagram" | "WhatsApp" | "Telegram" | "Web Chat";
export type IntegrationReadiness = "NOT_CONFIGURED" | "DEFERRED" | "UNAVAILABLE";
/** What a channel is for. The screen words it (administration.integrations.uses). */
export type IntegrationUse = "customer-messages" | "website-chat";
/** What the last look at a channel found. "not-configured" is worded by the states vocabulary. */
export type IntegrationObservation = "not-connected" | "not-configured";

export interface IntegrationView {
  readonly id: string;
  readonly channel: IntegrationChannel;
  readonly readiness: IntegrationReadiness;
  readonly mode: null;
  readonly capability: IntegrationUse;
  readonly observation: IntegrationObservation;
}

export interface IntegrationsScreenModel {
  readonly mode: "sample";
  readonly state: AdministrationViewState;
  readonly items: readonly IntegrationView[];
}

/** Section and field ids double as message keys (administration.settings.sections / .fields). */
export type SettingsSectionId = "business-context" | "effective-access" | "capability-boundaries";
export type SettingFieldId = "business-name" | "business-timezone" | "configuration-version" | "identity-provider" | "staff-roles" | "order-update" | "human-resume";
/** A fixed answer the screen words, e.g. "Blocked by policy". */
export type SettingAnswer = "single-sign-on" | "blocked-by-policy" | "not-available-yet";

/** Record content shown as is (a name, a time zone, a number), a worded answer, or a list of staff roles. */
export type SettingValue =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "answer"; readonly answer: SettingAnswer }
  | { readonly kind: "roles"; readonly roles: readonly StaffRole[] };

export interface SettingFieldView {
  readonly id: SettingFieldId;
  readonly value: SettingValue;
  readonly editable: false;
}

export interface SettingsSectionView {
  readonly id: SettingsSectionId;
  readonly fields: readonly SettingFieldView[];
}

export interface SettingsScreenModel {
  readonly mode: "sample";
  readonly state: AdministrationViewState;
  readonly sections: readonly SettingsSectionView[];
}

/** Activity-log vocabulary. The screen words each value (administration.audit). */
export type AuditActor = "operator" | "system";
export type AuditAction = "reserve-stock" | "change-order" | "check-reservation";
export type AuditResourceType = "order" | "reservation";
/** A state word from the states vocabulary, or the policy block. */
export type AuditResult = "success" | "outcome-unknown" | "blocked-by-policy";
export type AuditProvenance = "system" | "policy";
export type AuditSummary = "stock-reserved" | "change-blocked" | "check-first";

export interface AuditEventView {
  readonly id: string;
  /** ISO 8601 with offset; the screen formats it for the chosen language. */
  readonly occurredAt: string;
  readonly actor: AuditActor;
  /** The business the entry belongs to, shown as is. */
  readonly scope: string;
  readonly action: AuditAction;
  readonly resource: { readonly type: AuditResourceType; readonly ref: string };
  readonly result: AuditResult;
  readonly badge: ProductState;
  readonly correlationRef: string;
  readonly provenance: AuditProvenance;
  readonly summary: AuditSummary;
}

export interface AuditScreenModel {
  readonly mode: "sample";
  readonly state: AdministrationViewState;
  readonly query: string;
  readonly items: readonly AuditEventView[];
  readonly selected: AuditEventView | null;
}

/** The AI agents by role. The screen words them (administration.runs.roles). */
export type SafeAgentRole = "sales" | "support" | "analytics";
/** Who has a run: one of the agents or a person on the team. */
export type AgentRunHandler = SafeAgentRole | "human-operator";

/** The stages of one AI run, in order: the agent proposes, the system checks, the work is done. */
export type AgentRunPhase = "proposed" | "checked" | "carried-out" | "recorded" | "person-needed";
export type AgentRunTool = "look-up-order" | "check-stock";
/** How a run stands: "waiting-human" is worded by the states vocabulary. */
export type AgentRunOutcome = "waiting-human" | "completed";
export type AgentRunStopReason = "needs-decision" | "answered-from-records";
export type AgentRunStepTitle = "look-up-order" | "access-checked" | "order-read" | "stopped-for-review" | "check-stock" | "stock-read" | "answer-prepared";
export type AgentRunStepSummary = "support-asked-for-order" | "access-and-policy" | "order-read-unchanged" | "decision-with-person" | "sales-asked-for-stock" | "read-only-approved" | "count-as-last-checked" | "answer-kept-source";

export interface AgentRunStepView {
  readonly id: string;
  readonly phase: AgentRunPhase;
  readonly title: AgentRunStepTitle;
  readonly summary: AgentRunStepSummary;
  readonly status: ProductState;
  readonly reference: string | null;
}

export interface AgentRunView {
  readonly id: string;
  readonly correlationRef: string;
  readonly role: SafeAgentRole;
  readonly status: ProductState;
  readonly outcome: AgentRunOutcome;
  readonly currentHandler: AgentRunHandler;
  readonly previousHandler: AgentRunHandler | null;
  /** ISO 8601 with offset; the screen formats it for the chosen language. */
  readonly startedAt: string;
  readonly stopReason: AgentRunStopReason;
  readonly tool: AgentRunTool;
  /** Model brand name, shown as is. */
  readonly modelProvider: string;
  readonly modelStage: "development";
  readonly modelStatus: "not-approved";
  /** null when not recorded. */
  readonly latencyMs: number | null;
  readonly usageTokens: number | null;
  readonly steps: readonly AgentRunStepView[];
}

export interface AgentRunsScreenModel {
  readonly mode: "sample";
  readonly state: AdministrationViewState;
  readonly items: readonly AgentRunView[];
  readonly selected: AgentRunView | null;
}

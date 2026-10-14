import type { AgentRunsScreenModel, AuditScreenModel, IntegrationsScreenModel, SettingsScreenModel } from "../types";

export interface IntegrationsDataAdapter { getScreen(query: Record<string, string | string[] | undefined>): IntegrationsScreenModel; }
export interface SettingsDataAdapter { getScreen(query: Record<string, string | string[] | undefined>): SettingsScreenModel; }
export interface AuditDataAdapter { getScreen(query: Record<string, string | string[] | undefined>): AuditScreenModel; }
export interface AgentRunsDataAdapter { getScreen(query: Record<string, string | string[] | undefined>): AgentRunsScreenModel; }

export const administrationApiContracts = {
  integrations: { publicEndpoint: null, read: "LOCAL UI FIXTURE ONLY", configure: "UNAVAILABLE", validate: "UNAVAILABLE", activate: "UNAVAILABLE", m08: "PARTIAL / BLOCKED / DEFERRED" },
  settings: { publicEndpoint: null, read: "READ-ONLY CONTRACT", write: "UNAVAILABLE" },
  audit: { publicEndpoint: null, read: "LOCAL UI FIXTURE ONLY", access: "RESTRICTED" },
  agentRuns: { publicEndpoint: null, read: "LOCAL UI FIXTURE ONLY", access: "CONTEXTUAL / RESTRICTED", resume: "TARGET-ONLY" },
} as const;

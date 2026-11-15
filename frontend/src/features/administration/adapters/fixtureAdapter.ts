import { locales } from "@/i18n/locales";
import { administration } from "@/i18n/messages/administration";
import { states as stateWords } from "@/i18n/messages/states";
import { demoAgentRuns, demoAuditEvents, demoIntegrations, demoSettings } from "../fixtures/demoAdministration";
import type { AdministrationViewState, AgentRunsScreenModel, AuditEventView, AuditScreenModel, IntegrationsScreenModel, SettingsScreenModel } from "../types";
import type { AgentRunsDataAdapter, AuditDataAdapter, IntegrationsDataAdapter, SettingsDataAdapter } from "./contracts";

const states: readonly AdministrationViewState[] = ["fixture", "loading", "empty", "restricted", "unavailable"];
function first(value: string | string[] | undefined): string { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }
function state(query: Record<string, string | string[] | undefined>, fallback: AdministrationViewState): AdministrationViewState {
  const requested = first(query.state);
  return states.includes(requested as AdministrationViewState) ? requested as AdministrationViewState : fallback;
}

/**
 * The safe fields a person can search: references as stored, and who / what / result in every
 * interface language, because the sample adapter does not know which language the viewer reads.
 */
function searchableText(item: AuditEventView): string[] {
  const worded = locales.flatMap((locale) => {
    const words = administration[locale];
    const result = item.result === "blocked-by-policy" ? words.blockedByPolicy : stateWords[locale][item.result].label;
    return [words.audit.actors[item.actor], words.audit.actions[item.action], words.audit.resources[item.resource.type].replace("{ref}", item.resource.ref), result];
  });
  return [item.id, item.correlationRef, item.resource.ref, ...worded];
}

export const integrationsFixtureAdapter: IntegrationsDataAdapter = {
  getScreen(query): IntegrationsScreenModel { const viewState = state(query, "fixture"); return { mode: "sample", state: viewState, items: viewState === "fixture" ? demoIntegrations : [] }; },
};
export const settingsFixtureAdapter: SettingsDataAdapter = {
  getScreen(query): SettingsScreenModel { const viewState = state(query, "fixture"); return { mode: "sample", state: viewState, sections: viewState === "fixture" ? demoSettings : [] }; },
};
export const auditFixtureAdapter: AuditDataAdapter = {
  getScreen(query): AuditScreenModel {
    const viewState = state(query, "restricted");
    const q = first(query.q).trim().toLowerCase();
    const items = viewState === "fixture" ? demoAuditEvents.filter((item) => !q || searchableText(item).some((value) => value.toLowerCase().includes(q))) : [];
    const selectedId = first(query.event);
    return { mode: "sample", state: viewState, query: q, items, selected: items.find((item) => item.id === selectedId) ?? items[0] ?? null };
  },
};
export const agentRunsFixtureAdapter: AgentRunsDataAdapter = {
  getScreen(query): AgentRunsScreenModel {
    const viewState = state(query, "restricted");
    const items = viewState === "fixture" ? demoAgentRuns : [];
    const selectedId = first(query.run);
    return { mode: "sample", state: viewState, items, selected: items.find((item) => item.id === selectedId) ?? items[0] ?? null };
  },
};

export const getIntegrationsFixtureScreen = integrationsFixtureAdapter.getScreen;
export const getSettingsFixtureScreen = settingsFixtureAdapter.getScreen;
export const getAuditFixtureScreen = auditFixtureAdapter.getScreen;
export const getAgentRunsFixtureScreen = agentRunsFixtureAdapter.getScreen;

import type { AgentRunView, AuditEventView, IntegrationView, SettingsSectionView } from "../types";

/** Sample channel connections. None are connected yet. */
export const demoIntegrations: readonly IntegrationView[] = [
  { id: "integration-instagram", channel: "Instagram", readiness: "DEFERRED", mode: null, capability: "Customer messages", observation: "Not connected", impact: "Customers can't message you on Instagram yet." },
  { id: "integration-whatsapp", channel: "WhatsApp", readiness: "DEFERRED", mode: null, capability: "Customer messages", observation: "Not connected", impact: "Customers can't message you on WhatsApp yet." },
  { id: "integration-telegram", channel: "Telegram", readiness: "DEFERRED", mode: null, capability: "Customer messages", observation: "Not connected", impact: "Customers can't message you on Telegram yet." },
  { id: "integration-web", channel: "Web Chat", readiness: "NOT_CONFIGURED", mode: null, capability: "Chat on your website", observation: "Not set up", impact: "The chat window on your website can't send messages yet." },
];

export const demoSettings: readonly SettingsSectionView[] = [
  { id: "business-context", title: "Business", description: "How your business appears across the workspace.", fields: [
    { id: "business-name", label: "Business name", value: "North Shop", description: "Shown to customers and staff.", editable: false },
    { id: "business-timezone", label: "Time zone", value: "Asia/Qyzylorda", description: "Used for dates and report periods.", editable: false },
    { id: "configuration-version", label: "Settings version", value: "7", description: "Goes up each time settings change.", editable: false },
  ] },
  { id: "effective-access", title: "Access", description: "How people sign in and what roles exist.", fields: [
    { id: "identity-provider", label: "Sign-in", value: "Company account (single sign-on)", description: "Passwords are handled by your company's sign-in service.", editable: false },
    { id: "staff-roles", label: "Roles", value: "Owner, Operator, Platform admin", description: "What each person can see is decided by their role.", editable: false },
  ] },
  { id: "capability-boundaries", title: "What is switched off", description: "Features that are blocked or not built yet. They can't be turned on here.", fields: [
    { id: "order-update", label: "Editing orders", value: "Blocked by policy", description: "Can't be turned on from Settings.", editable: false },
    { id: "human-resume", label: "Resuming paused cases", value: "Not available yet", description: "Planned, not built yet.", editable: false },
  ] },
];

export const demoAuditEvents: readonly AuditEventView[] = [
  { id: "AUD-1042", occurredAt: "14 Oct 2026, 10:42", actor: "Operator", scope: "North Shop", action: "Reserve stock", resource: "Order ORD-1042", result: "Done", badge: "confirmed", correlationRef: "corr-demo-1042", provenance: "Recorded by the system", safeSummary: "Stock was reserved for the order." },
  { id: "AUD-1043", occurredAt: "14 Oct 2026, 10:45", actor: "Operator", scope: "North Shop", action: "Change order", resource: "Order ORD-1042", result: "Blocked by policy", badge: "restricted", correlationRef: "corr-demo-1043", provenance: "Policy decision", safeSummary: "The order change was blocked before anything changed." },
  { id: "AUD-1044", occurredAt: "14 Oct 2026, 10:48", actor: "System", scope: "North Shop", action: "Check reservation", resource: "Reservation op-demo-7", result: "Needs checking", badge: "outcome-unknown", correlationRef: "corr-demo-1044", provenance: "Recorded by the system", safeSummary: "The reservation must be checked before any further action." },
];

export const demoAgentRuns: readonly AgentRunView[] = [
  { id: "RUN-1042", correlationRef: "corr-demo-1042", role: "Support Agent", status: "waiting-human", statusLabel: "Needs a person", currentHandler: "Human Operator", previousHandler: "Support Agent", startedAt: "14 Oct 2026, 10:40", stopReason: "A person needs to decide before this can continue.", toolName: "Look up order", modelProvider: "Gemini (development)", modelStatus: "Not yet approved for live use", latency: "Not recorded", usage: "Not recorded", steps: [
    { id: "step-1", phase: "Agent proposed", title: "Look up the order", safeSummary: "The Support agent asked to read the order.", status: "pending", reference: null },
    { id: "step-2", phase: "Permission checked", title: "Access and policy checked", safeSummary: "The system checked the role, the business and what the tool is allowed to do.", status: "confirmed", reference: "tool-demo-1042" },
    { id: "step-3", phase: "Carried out", title: "Order read", safeSummary: "The order was read. Nothing was changed.", status: "confirmed", reference: "order:ORD-1042" },
    { id: "step-4", phase: "Person needed", title: "Stopped for review", safeSummary: "The next decision is with a person on your team.", status: "waiting-human", reference: "case:ESC-1042" },
  ] },
  { id: "RUN-1045", correlationRef: "corr-demo-1045", role: "Sales Agent", status: "confirmed", statusLabel: "Completed", currentHandler: "Sales Agent", previousHandler: null, startedAt: "14 Oct 2026, 11:02", stopReason: "Answered from the records without changing anything.", toolName: "Check stock", modelProvider: "Gemini (development)", modelStatus: "Not yet approved for live use", latency: "Not recorded", usage: "Not recorded", steps: [
    { id: "step-5", phase: "Agent proposed", title: "Check current stock", safeSummary: "The Sales agent asked to read the stock level.", status: "pending", reference: null },
    { id: "step-6", phase: "Permission checked", title: "Access and policy checked", safeSummary: "The system approved a read-only check.", status: "confirmed", reference: "tool-demo-1045" },
    { id: "step-7", phase: "Carried out", title: "Stock level read", safeSummary: "The count is as last checked, not a live count or a reservation.", status: "confirmed", reference: "inventory:SKU-LAMP-SLATE" },
    { id: "step-8", phase: "Result recorded", title: "Answer prepared", safeSummary: "The answer kept the source and the time of the count.", status: "confirmed", reference: "result:demo-1045" },
  ] },
];

"use strict";
(() => {
  // ../figma-phase3c-plugin/src/constants.ts
  var SECTIONS = {
    direction: "00 \u2014 Design Direction",
    foundations: "01 \u2014 Foundations",
    color: "02 \u2014 Color System",
    typography: "03 \u2014 Typography",
    spacing: "04 \u2014 Spacing / Sizing / Layout",
    states: "05 \u2014 Semantic States",
    core: "06 \u2014 Core Components",
    navigation: "07 \u2014 Navigation Components",
    conversation: "08 \u2014 Conversation / AI Components",
    business: "09 \u2014 Business Entity Components",
    escalation: "10 \u2014 Escalation Components",
    analytics: "11 \u2014 Analytics / Data Components",
    forecast: "12 \u2014 Forecast Components",
    webchat: "13 \u2014 Customer Web Chat Components",
    accessibility: "14 \u2014 Accessibility / Localization",
    usage: "15 \u2014 Usage Examples",
    validation: "16 \u2014 Validation"
  };
  var ACTION_SECTIONS = {
    "build-direction": [SECTIONS.direction],
    "build-foundations": [SECTIONS.foundations, SECTIONS.color, SECTIONS.typography, SECTIONS.spacing, SECTIONS.accessibility],
    "build-states": [SECTIONS.states],
    "build-core": [SECTIONS.core],
    "build-navigation": [SECTIONS.navigation],
    "build-conversation": [SECTIONS.conversation],
    "build-business": [SECTIONS.business],
    "build-escalation": [SECTIONS.escalation],
    "build-analytics-forecast": [SECTIONS.analytics, SECTIONS.forecast],
    "build-webchat": [SECTIONS.webchat, SECTIONS.usage, SECTIONS.validation],
    "build-usage": [SECTIONS.usage]
  };
  var BUILD_ACTIONS = Object.keys(ACTION_SECTIONS);

  // src/constants.ts
  function designSectionFor(name) {
    const short = name.startsWith("Component / ") ? name.slice("Component / ".length) : name;
    if (short.startsWith("Navigation / ")) return SECTIONS.navigation;
    if (short.startsWith("Conversation / ")) return SECTIONS.conversation;
    if (short.startsWith("Business / ") || short.startsWith("Communication / ")) return SECTIONS.business;
    if (short.startsWith("Escalation / ")) return SECTIONS.escalation;
    if (short.startsWith("Analytics / ")) return SECTIONS.analytics;
    if (short.startsWith("Forecast / ")) return SECTIONS.forecast;
    if (short.startsWith("Web Chat / ")) return SECTIONS.webchat;
    return SECTIONS.core;
  }
  var FILE_NAME = "Diplom \u2014 Multi-Agent Platform UX/UI";
  var FILE_KEY = "OFXTN83nFl3RqukrEYQrFy";
  var TARGET_PAGE = "03D \u2014 High-Fidelity Screens";
  var DESIGN_PAGE = "03C \u2014 Design System";
  var COLLECTION_NAME = "Phase 3C / Light";
  var SECTIONS2 = {
    principles: "00 \u2014 High-Fi Principles",
    shell: "01 \u2014 Shared Staff Shell",
    conversations: "02 \u2014 Conversations",
    escalations: "03 \u2014 Escalations",
    orders: "04 \u2014 Orders",
    webChat: "05 \u2014 Customer Web Chat",
    analytics: "06 \u2014 Analytics",
    forecasts: "07 \u2014 Forecasts"
  };
  var SHELL_NAME = "3D / Shell / Staff Desktop";
  var NAV_PRIMARY = ["Overview", "Conversations", "Business", "Knowledge", "Analytics", "Administration"];
  var NAV_NESTED = [
    ["Conversations", "Escalations"],
    ["Business", "Customers"],
    ["Business", "Orders"],
    ["Business", "Products"],
    ["Business", "Inventory"],
    ["Knowledge", "Documents"],
    ["Analytics", "Forecasts"],
    ["Administration", "Integrations"],
    ["Administration", "Settings"],
    ["Administration", "Audit"],
    ["Administration", "Agent Runs"]
  ];
  var PROHIBITED_NAV = ["Orchestrator", "Business Brain", "LangGraph", "Tools", "Database", "Customer Web Chat"];
  var VARIANTS = [
    { key: "Default", title: "Default / Active", status: "Active", handler: "Support Agent", kind: "default" },
    { key: "Support Active", title: "Support Active", status: "Support active", handler: "Support Agent", kind: "support" },
    { key: "Sales Active", title: "Sales Active", status: "Sales active", handler: "Sales Agent", kind: "sales" },
    { key: "Support to Sales Handoff", title: "Support \u2192 Sales Handoff", status: "Handoff", handler: "Sales Agent", kind: "handoff" },
    { key: "Human Takeover", title: "Human Takeover", status: "Human active", handler: "Human Operator", kind: "human" },
    { key: "Waiting Human", title: "Waiting Human / Escalation", status: "Waiting Human", handler: "Human Operator", kind: "waiting" },
    { key: "Awaiting Confirmation", title: "Awaiting Customer Confirmation", status: "Awaiting confirmation", handler: "Sales Agent", kind: "proposal" },
    { key: "Processing", title: "Processing / Executing", status: "Processing", handler: "Sales Agent", kind: "processing" },
    { key: "Confirmed Result", title: "Confirmed Business Result", status: "Confirmed", handler: "Sales Agent", kind: "confirmed" },
    { key: "Known Failure", title: "Known Failure", status: "Known Failure", handler: "Sales Agent", kind: "failure" },
    { key: "OUTCOME_UNKNOWN", title: "OUTCOME_UNKNOWN", status: "OUTCOME_UNKNOWN", handler: "Sales Agent", kind: "unknown" },
    { key: "Dependency Unavailable", title: "Dependency Unavailable", status: "Dependency unavailable", handler: "Support Agent", kind: "dependency" },
    { key: "Delivery Failure", title: "Message Delivery Failure After Confirmed Effect", status: "Message delivery failed", handler: "Sales Agent", kind: "delivery" }
  ];
  var conversationName = (key) => `3D / Conversations / ${key}`;
  var ESCALATION_VARIANTS = [
    { key: "Waiting Assignment", title: "Queue / Waiting Assignment", kind: "waiting" },
    { key: "Awaiting Decision", title: "Assigned / Awaiting Decision", kind: "assigned" },
    { key: "OUTCOME_UNKNOWN", title: "OUTCOME_UNKNOWN / Reconciliation Required", kind: "unknown" },
    { key: "Stale", title: "Stale Context", kind: "stale" },
    { key: "Authorization Changed", title: "Authorization Changed", kind: "authorization" },
    { key: "E02 Restricted", title: "E02 Update Restricted", kind: "e02" },
    { key: "Resume Pending", title: "Resume Pending \u2014 TARGET M12", kind: "resume" },
    { key: "Resolved Closed", title: "Resolved / Closed", kind: "resolved" }
  ];
  var escalationName = (key) => `3D / Escalations / ${key}`;
  var ORDER_VARIANTS = [
    { key: "List", title: "Orders List / Mixed States", kind: "list" },
    { key: "Reservation Confirmed", title: "Order Created + Reservation Confirmed", kind: "confirmed" },
    { key: "Reservation Failed", title: "Order Created + Reservation Failed", kind: "failed" },
    { key: "OUTCOME_UNKNOWN", title: "Order Created + Reservation OUTCOME_UNKNOWN", kind: "unknown" },
    { key: "Needs Attention", title: "Needs Human Attention", kind: "attention" },
    { key: "Stale Conflict", title: "Stale / Conflicting", kind: "stale" },
    { key: "E02 Restricted", title: "E02 Update Restricted", kind: "e02" }
  ];
  var orderName = (key) => `3D / Orders / ${key}`;
  var WEB_CHAT_VARIANTS = [
    { key: "Initial", title: "Initial", component: void 0 },
    { key: "Active", title: "Active Conversation", component: void 0 },
    { key: "Clarification", title: "Clarification Requested", component: "Clarification Request" },
    { key: "Confirmation Required", title: "Confirmation Required", component: "Confirmation Request" },
    { key: "Processing", title: "Processing", component: "Processing" },
    { key: "Confirmed Result", title: "Confirmed Result", component: "Confirmed Result" },
    { key: "Known Failure", title: "Known Failure", component: "Known Failure" },
    { key: "Waiting Human", title: "Waiting for Human", component: "Waiting Human" },
    { key: "Confirmation Pending", title: "Confirmation Pending", component: "Confirmation Pending" },
    { key: "Message Delivery Failure", title: "Message Delivery / Connection Failure", component: "Delivery Failure" }
  ];
  var webChatName = (key) => `3D / Web Chat / ${key}`;
  var ANALYTICS_VARIANTS = [
    { key: "Valid", title: "Valid Historical Result", kind: "valid" },
    { key: "Valid Empty", title: "Valid Empty", kind: "empty" },
    { key: "Incomplete", title: "Incomplete Data", kind: "incomplete" },
    { key: "Stale", title: "Stale Data", kind: "stale" },
    { key: "Dependency Unavailable", title: "Dependency Unavailable", kind: "unavailable" },
    { key: "Permission Denied", title: "Permission Denied", kind: "denied" }
  ];
  var analyticsName = (key) => `3D / Analytics / ${key}`;
  var FORECAST_VARIANTS = [
    { key: "TARGET Ready", kind: "ready" },
    { key: "MODEL_NOT_READY", kind: "not-ready" },
    { key: "Insufficient History", kind: "insufficient" },
    { key: "Incomplete History", kind: "incomplete" },
    { key: "Unsupported Horizon", kind: "unsupported" },
    { key: "Model Unavailable", kind: "unavailable" },
    { key: "Timeout", kind: "timeout" },
    { key: "Permission Denied", kind: "denied" }
  ];
  var forecastName = (key) => `3D / Forecasts / ${key}`;
  var FORECAST_ASSETS = {
    request: "Forecast / Request Summary",
    target: "Forecast / Target",
    cutoff: "Forecast / Cutoff",
    horizon: "Forecast / Horizon",
    actual: "Forecast / Actual Series",
    predicted: "Forecast / Predicted Series",
    chart: "Forecast / Actual vs Predicted Chart",
    provenance: "Forecast / Provenance",
    limitations: "Forecast / Limitations",
    result: "Forecast / Result",
    notReady: "Forecast / MODEL_NOT_READY",
    insufficient: "Forecast / Insufficient History",
    unsupported: "Forecast / Unsupported Horizon",
    unavailable: "Forecast / Model Unavailable",
    timeout: "Forecast / Timeout",
    incomplete: "Forecast / Incomplete History",
    denied: "Forecast / Permission Denied"
  };
  var FORECAST_ASSET_REQUIREMENTS = [
    ...[FORECAST_ASSETS.request, FORECAST_ASSETS.chart, FORECAST_ASSETS.result, FORECAST_ASSETS.notReady].map((name) => ({ section: SECTIONS.forecast, name, maxWidth: 970 })),
    ...[FORECAST_ASSETS.target, FORECAST_ASSETS.cutoff, FORECAST_ASSETS.horizon].map((name) => ({ section: SECTIONS.forecast, name, maxWidth: 310 })),
    ...[
      FORECAST_ASSETS.actual,
      FORECAST_ASSETS.predicted,
      FORECAST_ASSETS.provenance,
      FORECAST_ASSETS.limitations,
      FORECAST_ASSETS.insufficient,
      FORECAST_ASSETS.unsupported,
      FORECAST_ASSETS.unavailable,
      FORECAST_ASSETS.timeout,
      FORECAST_ASSETS.incomplete,
      FORECAST_ASSETS.denied
    ].map((name) => ({ section: SECTIONS.forecast, name, maxWidth: 470 }))
  ];
  var ANALYTICS_ASSETS = {
    kpi: "Analytics / KPI",
    period: "Analytics / Period Selector",
    freshness: "Analytics / Freshness",
    completeness: "Analytics / Completeness",
    chart: "Analytics / Historical Chart",
    table: "Analytics / Data Table",
    empty: "Analytics / Valid Empty",
    incomplete: "Analytics / Incomplete",
    stale: "Analytics / Stale",
    unavailable: "Analytics / Dependency Unavailable",
    denied: "Analytics / Permission Denied"
  };
  var ANALYTICS_ASSET_REQUIREMENTS = [
    { section: SECTIONS.core, name: "Select", maxWidth: 238 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.kpi, variant: "Metric=Orders", maxWidth: 310 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.period, variant: "State=Focus", maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.freshness, variant: "State=Current", maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.freshness, variant: "State=Stale", maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.freshness, variant: "State=Requires Refresh", maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.completeness, variant: "State=Complete", maxWidth: 310 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.completeness, variant: "State=Incomplete", maxWidth: 310 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.completeness, variant: "State=Unavailable", maxWidth: 310 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.chart, variant: "State=Valid Historical Data", maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.chart, variant: "State=Missing-data Gap", maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.chart, variant: "State=Stale Data", maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.table, maxWidth: 970 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.empty, maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.incomplete, maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.stale, maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.unavailable, maxWidth: 470 },
    { section: SECTIONS.analytics, name: ANALYTICS_ASSETS.denied, maxWidth: 470 }
  ];
  var REQUIRED_COMPONENTS = [
    "Select",
    "Navigation / Primary Item",
    "Navigation / Nested Item",
    "Navigation / Business Context",
    "Navigation / Breadcrumb",
    "Navigation / Account",
    "Conversation / List Item",
    "Conversation / Message Row",
    "Conversation / Composer",
    "Conversation / Customer Context",
    "Conversation / Order Context",
    "Conversation / Active Handler",
    "Conversation / Agent Status",
    "Conversation / Human Status",
    "Conversation / Handoff Event",
    "Conversation / Action Proposal",
    "Conversation / Action Result",
    "Conversation / Execution Summary",
    "Conversation / Escalation State",
    "Conversation / Delivery State",
    "Business / Customer Summary",
    "Business / Order State",
    "Business / Reservation State",
    "Business / Order Delivery Status",
    "Communication / Message Delivery Status",
    "Business / Inventory Status",
    "Business / Freshness",
    "Business / E02 Restricted",
    "Web Chat / Customer Message",
    "Web Chat / Business Reply",
    "Web Chat / Composer",
    "Web Chat / Clarification Request",
    "Web Chat / Confirmation Request",
    "Web Chat / Processing",
    "Web Chat / Confirmed Result",
    "Web Chat / Known Failure",
    "Web Chat / Waiting Human",
    "Web Chat / Confirmation Pending",
    "Web Chat / Delivery Failure",
    ...Object.values(ANALYTICS_ASSETS),
    ...Object.values(FORECAST_ASSETS)
  ];

  // ../figma-phase3c-plugin/src/tokens.ts
  var primitive = {
    white: "#FFFFFF",
    neutral50: "#F8FAFC",
    neutral100: "#F1F5F9",
    neutral200: "#E2E8F0",
    neutral400: "#94A3B8",
    neutral600: "#475569",
    neutral800: "#1E293B",
    neutral900: "#0F172A",
    navy600: "#174A7E",
    navy700: "#123D69",
    blue50: "#EFF6FF",
    blue700: "#1D4ED8",
    green50: "#ECFDF5",
    green700: "#047857",
    amber50: "#FFFBEB",
    amber800: "#92400E",
    red50: "#FEF2F2",
    red700: "#B91C1C",
    violet50: "#F5F3FF",
    violet700: "#6D28D9",
    teal700: "#0F766E",
    indigo50: "#EEF2FF",
    indigo700: "#4338CA"
  };
  var semantic = {
    "surface/default": "white",
    "surface/subtle": "neutral50",
    "surface/elevated": "white",
    "surface/selected": "blue50",
    "text/primary": "neutral900",
    "text/secondary": "neutral600",
    "text/muted": "neutral600",
    "text/inverse": "white",
    "border/default": "neutral200",
    "border/strong": "neutral400",
    "border/interactive": "navy600",
    "action/primary": "navy700",
    "action/secondary": "neutral100",
    "action/destructive": "red700",
    "focus/ring": "blue700",
    "status/success": "green700",
    "status/success-bg": "green50",
    "status/pending": "blue700",
    "status/pending-bg": "blue50",
    "status/warning": "amber800",
    "status/warning-bg": "amber50",
    "status/error": "red700",
    "status/error-bg": "red50",
    "status/unknown": "violet700",
    "status/unknown-bg": "violet50",
    "status/stale": "amber800",
    "status/stale-bg": "amber50",
    "status/restricted": "neutral800",
    "status/restricted-bg": "neutral100",
    "status/waiting-human": "indigo700",
    "status/waiting-human-bg": "indigo50",
    "status/dependency": "neutral600",
    "status/dependency-bg": "neutral100",
    "status/model-not-ready": "neutral600",
    "status/model-not-ready-bg": "neutral100",
    "status/info": "teal700",
    "status/info-bg": "neutral50",
    "chart/actual": "navy700",
    "chart/predicted": "violet700",
    "chart/grid": "neutral200"
  };
  var typeScale = {
    "Page Title": [28, 36, "Bold"],
    "Section Heading": [20, 28, "Semi Bold"],
    "Card Heading": [16, 24, "Semi Bold"],
    "Body": [14, 22, "Regular"],
    "Body Strong": [14, 22, "Semi Bold"],
    "Small": [13, 20, "Regular"],
    "Caption": [12, 18, "Regular"],
    "Label": [12, 18, "Semi Bold"],
    "Metric": [24, 32, "Semi Bold"]
  };
  function rgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16 & 255) / 255, g: (n >> 8 & 255) / 255, b: (n & 255) / 255 };
  }

  // src/design-system.ts
  var palette = { primitive, semantic, typeScale };
  function canonicalName(name) {
    return name.startsWith("Component / ") ? name : `Component / ${name}`;
  }
  function nodePath(node, page) {
    const parts = [node.name];
    for (let parent = node.parent; parent && parent !== page; parent = parent.parent) parts.unshift(parent.name);
    return [page.name, ...parts].join(" / ");
  }
  function matchDetails(node, page) {
    return { name: node.name, type: node.type, id: node.id || "unavailable", path: nodePath(node, page) };
  }
  function isArchived(node, page) {
    for (let parent = node.parent; parent && parent !== page; parent = parent.parent) {
      if (/^ARCHIVE\s*[—-]\s*/i.test(parent.name)) return true;
    }
    return false;
  }
  function resolveDesignSection(page, name) {
    const exact = page ? page.findAll((n) => n.name === name && !isArchived(n, page)) : [];
    const frames = exact.filter((n) => n.type === "FRAME");
    const status = frames.length > 1 ? "DUPLICATE_SECTION" : frames.length === 1 ? "FOUND" : exact.length ? "WRONG_TYPE" : "MISSING_SECTION";
    return { status, frame: status === "FOUND" ? frames[0] : void 0, matches: page ? exact.map((n) => matchDetails(n, page)) : [] };
  }
  function resolveDesignAsset(page, name, section = designSectionFor(name)) {
    const exact = canonicalName(name);
    const source = resolveDesignSection(page, section);
    const matches = source.frame ? source.frame.findAll((n) => n.name === exact) : [];
    const archived = page ? page.findAll((n) => n.name === exact && isArchived(n, page)) : [];
    const valid = matches.length === 1 && (matches[0].type === "COMPONENT" || matches[0].type === "COMPONENT_SET");
    const status = source.status !== "FOUND" ? source.status : matches.length === 0 ? "MISSING" : matches.length > 1 ? "DUPLICATE" : valid ? "FOUND" : "WRONG_TYPE";
    return {
      diagnostic: {
        name: exact,
        canonicalName: exact,
        section,
        status,
        found: status === "FOUND",
        type: matches.length === 1 ? matches[0].type : void 0,
        count: matches.length,
        matches: page ? matches.map((n) => matchDetails(n, page)) : [],
        archivedMatches: page ? archived.map((n) => matchDetails(n, page)) : [],
        sectionMatches: source.matches
      },
      node: status === "FOUND" && valid ? matches[0] : void 0
    };
  }
  var components = /* @__PURE__ */ new Map();
  var variables = /* @__PURE__ */ new Map();
  async function findDesignPage() {
    const found = figma.root.children.filter((p) => p.name === DESIGN_PAGE);
    if (found.length > 1) throw new Error(`Duplicate ${DESIGN_PAGE} pages; inspect manually.`);
    if (found[0]) await found[0].loadAsync();
    return found[0];
  }
  async function inspectDesignSystem() {
    const page = await findDesignPage();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const matchingCollections = collections.filter((c) => c.name === COLLECTION_NAME);
    const collection = matchingCollections.length === 1 ? matchingCollections[0] : void 0;
    const colorVars = collection ? (await figma.variables.getLocalVariablesAsync("COLOR")).filter((v) => v.variableCollectionId === collection.id) : [];
    const semanticVars = colorVars.filter((v) => v.name.startsWith("semantic/"));
    const entries = REQUIRED_COMPONENTS.map((name) => ({ ...resolveDesignAsset(page, name).diagnostic, name }));
    const treatmentTexts = page ? page.findAll((n) => n.type === "TEXT").map((n) => n.characters).join(" ") : "";
    const treatments = [
      { name: "OUTCOME_UNKNOWN", found: treatmentTexts.includes("OUTCOME_UNKNOWN") && semanticVars.some((v) => v.name === "semantic/status/unknown") },
      { name: "Waiting Human", found: /Waiting for Human|Waiting Human/.test(treatmentTexts) && semanticVars.some((v) => v.name === "semantic/status/waiting-human") },
      { name: "Known Failure", found: treatmentTexts.includes("Known Failure") && semanticVars.some((v) => v.name === "semantic/status/error") },
      { name: "Confirmed", found: treatmentTexts.includes("Confirmed") && semanticVars.some((v) => v.name === "semantic/status/success") }
    ];
    return {
      pageExists: Boolean(page),
      components: entries,
      treatments,
      variables: semanticVars.length,
      gaps: [
        ...matchingCollections.length > 1 ? [`Duplicate ${COLLECTION_NAME} collections`] : [],
        ...entries.filter((e) => !e.found).map((e) => `${e.status === "DUPLICATE" ? "Duplicate" : e.status === "WRONG_TYPE" ? "Wrong type" : e.status} ${e.canonicalName} in ${e.section}`),
        ...treatments.filter((t) => !t.found).map((t) => `${t.name} treatment`)
      ]
    };
  }
  async function loadDesignAssets() {
    const report = await inspectDesignSystem();
    components.clear();
    variables.clear();
    const page = await findDesignPage();
    if (page) {
      const names = /* @__PURE__ */ new Set([...REQUIRED_COMPONENTS.map(canonicalName), ...page.findAll((n) => n.name.startsWith("Component / ")).map((n) => n.name)]);
      for (const name of names) {
        const resolved = resolveDesignAsset(page, name);
        if (resolved.node) components.set(name, resolved.node);
      }
    }
    const matches = (await figma.variables.getLocalVariableCollectionsAsync()).filter((c) => c.name === COLLECTION_NAME);
    const collection = matches.length === 1 ? matches[0] : void 0;
    if (collection) for (const v of await figma.variables.getLocalVariablesAsync("COLOR")) {
      if (v.variableCollectionId === collection.id && v.name.startsWith("semantic/")) variables.set(v.name.slice(9), v);
    }
    return report;
  }
  function paint(token) {
    const base = { type: "SOLID", color: rgb(primitive[semantic[token]]) };
    const variable = variables.get(token);
    return variable ? figma.variables.setBoundVariableForPaint(base, "color", variable) : base;
  }
  function fill(node, token) {
    node.fills = [paint(token)];
  }
  function stroke(node, token) {
    node.strokes = [paint(token)];
  }
  function matchesVariant(node, variant) {
    if (!variant) return true;
    if (node.name === variant) return true;
    const separator = variant.indexOf("=");
    if (separator < 1) return false;
    const key = variant.slice(0, separator).trim();
    const value = variant.slice(separator + 1).trim();
    return node.variantProperties?.[key] === value;
  }
  function instantiate(parent, component, variant, name, x, y, maxWidth) {
    const base = components.get(canonicalName(component));
    if (!base) return void 0;
    const target = base.type === "COMPONENT_SET" ? base.children.find((n) => n.type === "COMPONENT" && matchesVariant(n, variant)) : base;
    if (!target || maxWidth && target.width > maxWidth) return void 0;
    const instance2 = target.createInstance();
    parent.appendChild(instance2);
    instance2.name = name;
    instance2.x = x;
    instance2.y = y;
    return instance2;
  }
  function componentAvailable(name, variant, maxWidth) {
    const base = components.get(canonicalName(name));
    if (!base) return false;
    if (base.type === "COMPONENT") return !maxWidth || base.width <= maxWidth;
    return base.children.some((n) => n.type === "COMPONENT" && matchesVariant(n, variant) && (!maxWidth || n.width <= maxWidth));
  }
  function requireDesignAssets(requirements) {
    const page = figma.root.children.find((p) => p.name === DESIGN_PAGE);
    for (const requirement of requirements) {
      const { diagnostic, node } = resolveDesignAsset(page, requirement.name, requirement.section);
      if (!node) throw new Error(`${diagnostic.status} approved Phase 3C asset: ${diagnostic.name} in ${diagnostic.section}. Exact active matches: ${diagnostic.count}. ${diagnostic.matches.map((m) => `${m.type} ${m.id} at ${m.path}`).join("; ")}${diagnostic.sectionMatches.length ? ` Section matches: ${diagnostic.sectionMatches.map((m) => `${m.type} ${m.id} at ${m.path}`).join("; ")}.` : ""} Nothing was replaced.`);
      const candidates = node.type === "COMPONENT_SET" ? node.children.filter((n) => n.type === "COMPONENT" && matchesVariant(n, requirement.variant)) : requirement.variant ? [] : [node];
      if (candidates.length !== 1) throw new Error(`${candidates.length ? "DUPLICATE" : "MISSING"} approved Phase 3C variant: ${diagnostic.name}${requirement.variant ? ` / ${requirement.variant}` : ""}. Available: ${node.type === "COMPONENT_SET" ? node.children.map((n) => n.name).join(", ") : "none"}. Nothing was replaced.`);
      if (requirement.maxWidth && candidates[0].width > requirement.maxWidth) throw new Error(`Approved Phase 3C asset exceeds available width: ${diagnostic.name} (${candidates[0].width} > ${requirement.maxWidth}). Nothing was replaced.`);
      if (components.get(diagnostic.name) !== node) throw new Error(`Phase 3C asset cache is not loaded: ${diagnostic.name}. Nothing was replaced.`);
    }
  }

  // src/ownership.ts
  function assertCanonicalFile(name, key) {
    if (name !== FILE_NAME) throw new Error(`Wrong file: expected ${FILE_NAME}. Nothing was changed.`);
    if (key && key !== FILE_KEY) throw new Error(`Wrong Figma file key. Nothing was changed.`);
  }
  function assertWritablePage(name) {
    if (name !== TARGET_PAGE) throw new Error(`Writes are allowed only on ${TARGET_PAGE}.`);
  }
  var SHELL_OWNED = [SHELL_NAME];
  var CONVERSATIONS_OWNED = VARIANTS.map((v) => conversationName(v.key));
  var ESCALATIONS_OWNED = ESCALATION_VARIANTS.map((v) => escalationName(v.key));
  var ORDERS_OWNED = ORDER_VARIANTS.map((v) => orderName(v.key));
  var WEB_CHAT_OWNED = WEB_CHAT_VARIANTS.map((v) => webChatName(v.key));
  var ANALYTICS_OWNED = ANALYTICS_VARIANTS.map((v) => analyticsName(v.key));
  var FORECASTS_OWNED = FORECAST_VARIANTS.map((v) => forecastName(v.key));
  function preflightOwned(container, owned) {
    for (const name of owned) {
      const exact = container.children.filter((n) => n.name === name);
      if (exact.length > 1) throw new Error(`Duplicate owned frame name: ${name}. Resolve manually.`);
      if (exact.some((n) => n.type !== "FRAME")) throw new Error(`Owned name belongs to a non-FRAME node: ${name}. Resolve manually.`);
    }
  }
  function replaceOwned(container, owned, staged) {
    preflightOwned(container, owned);
    if (staged.length !== owned.length) throw new Error("Builder did not stage every owned frame.");
    const staging = owned.map((name) => `${name} / staging`);
    if (staged.some((n, i) => n.name !== staging[i] || n.type !== "FRAME")) throw new Error("Builder staged unexpected names/types.");
    for (let i = 0; i < owned.length; i++) {
      const previous = container.children.find((n) => n.name === owned[i]);
      if (previous) preserveManualChildren(previous, staged[i]);
    }
    for (const n of [...container.children]) if (owned.includes(n.name)) n.remove();
    staged.forEach((n, i) => {
      n.name = owned[i];
    });
  }
  function preserveManualChildren(previous, next) {
    if (previous.type !== "FRAME" || next.type !== "FRAME" || !previous.children || !next.children || !next.appendChild) return;
    for (const child of [...previous.children]) {
      const generated = next.children.find((n) => n.name === child.name && n.type === child.type);
      if (generated) preserveManualChildren(child, generated);
      else next.appendChild(child);
    }
  }

  // src/figma-utils.ts
  function assertFile() {
    assertCanonicalFile(figma.root.name, figma.fileKey ?? void 0);
  }
  async function readPage() {
    assertFile();
    const matches = figma.root.children.filter((p) => p.name === TARGET_PAGE);
    if (matches.length > 1) throw new Error(`Duplicate ${TARGET_PAGE} pages; resolve manually.`);
    if (matches[0]) await matches[0].loadAsync();
    return matches[0];
  }
  async function writablePage() {
    assertFile();
    let page = await readPage();
    if (!page) {
      page = figma.createPage();
      page.name = TARGET_PAGE;
      await page.loadAsync();
    }
    assertWritablePage(page.name);
    await figma.setCurrentPageAsync(page);
    if (figma.currentPage.id !== page.id) throw new Error(`Could not activate ${TARGET_PAGE}; no frame was generated.`);
    return page;
  }
  async function loadFonts() {
    for (const style of ["Regular", "Medium", "Semi Bold", "Bold"]) await figma.loadFontAsync({ family: "Inter", style });
  }
  function frame(parent, name, x, y, w, h, bg = "surface/default") {
    const n = figma.createFrame();
    parent.appendChild(n);
    n.name = name;
    n.x = x;
    n.y = y;
    n.resize(w, h);
    n.clipsContent = false;
    fill(n, bg);
    return n;
  }
  function box(parent, name, x, y, w, h, bg = "surface/default", border = "border/default", radius = 8) {
    const n = frame(parent, name, x, y, w, h, bg);
    stroke(n, border);
    n.strokeWeight = 1;
    n.cornerRadius = radius;
    return n;
  }
  function text(parent, name, value, x, y, w, type = "Body", color = "text/primary") {
    const [size, line3, weight] = palette.typeScale[type];
    const n = figma.createText();
    parent.appendChild(n);
    n.name = name;
    n.fontName = { family: "Inter", style: weight };
    n.fontSize = size;
    n.lineHeight = { unit: "PIXELS", value: line3 };
    n.characters = value;
    n.textAutoResize = "HEIGHT";
    n.resize(w, n.height);
    n.x = x;
    n.y = y;
    fill(n, color);
    return n;
  }
  function chip(parent, name, value, x, y, w, color, bg) {
    const n = box(parent, name, x, y, w, 28, bg, color, 6);
    text(n, `${name} / label`, value, 9, 5, w - 18, "Caption", color);
    return n;
  }
  function line(parent, name, x, y, w) {
    const n = frame(parent, name, x, y, w, 1, "border/default");
    return n;
  }
  function button(parent, name, label, x, y, w, primary = false) {
    const n = box(parent, name, x, y, w, 36, primary ? "action/primary" : "surface/default", primary ? "action/primary" : "border/default", 6);
    text(n, `${name} / label`, label, 12, 8, w - 24, "Small", primary ? "text/inverse" : "text/primary");
    return n;
  }
  function descendants(node) {
    return node.findAll(() => true);
  }
  function allText(node) {
    return descendants(node).filter((n) => n.type === "TEXT").map((n) => n.characters).join("\n");
  }
  function exactFrame(parent, name) {
    const matches = parent.children.filter((n) => n.name === name);
    if (matches.length > 1 || matches.some((n) => n.type !== "FRAME")) throw new Error(`Ambiguous section: ${name}. Resolve manually.`);
    return matches[0];
  }

  // src/builders/page-setup.ts
  function ensureSection(page, name, x, y, w, h) {
    assertWritablePage(page.name);
    const existing = exactFrame(page, name);
    if (existing) return existing;
    const section = box(page, name, x, y, w, h, "surface/subtle", "border/default", 8);
    return section;
  }
  function ensurePrinciples(page) {
    const existing = exactFrame(page, SECTIONS2.principles);
    if (existing) return existing;
    const n = ensureSection(page, SECTIONS2.principles, 0, 0, 1600, 166);
    text(n, "Principles / title", "Phase 3D \xB7 High-fidelity principles", 24, 20, 900, "Section Heading");
    text(n, "Principles / authority", "Phase 3B controls UX \xB7 Phase 3C controls visual language \xB7 Phase 3D applies both", 24, 59, 1500, "Body Strong");
    text(n, "Principles / rules", "Calm Operational SaaS \xB7 No feature invention \xB7 AI visible but restrained \xB7 Business state before technical detail", 24, 91, 1500, "Body");
    text(n, "Principles / unknown", "OUTCOME_UNKNOWN is neither success nor known failure: reconcile authoritative state; never retry a mutation blindly.", 24, 122, 1500, "Body", "status/unknown");
    return n;
  }

  // src/builders/shared-shell.ts
  var TOP_Y = 160;
  function drawStaffChrome(screen, completeTree = false) {
    const nav = frame(screen, "Staff navigation", 0, 0, 244, 900, "surface/default");
    frame(nav, "Navigation divider", 243, 0, 1, 900, "border/default");
    text(nav, "Brand", "Diplom  /  Operations", 20, 22, 205, "Card Heading");
    text(nav, "Staff scope", "STAFF WORKSPACE", 20, 54, 205, "Label", "text/secondary");
    const tenant = box(nav, "Business Context", 16, 88, 212, 64, "surface/subtle", "border/default", 6);
    text(tenant, "Business Context / label", completeTree ? "BUSINESS SWITCH" : "ACTIVE BUSINESS", 12, 8, 185, "Label", "text/secondary");
    text(tenant, "Business Context / name", "North Shop   \u25BE", 12, 30, 185, "Body Strong");
    let y = TOP_Y;
    for (const area of NAV_PRIMARY) {
      const active = area === "Conversations";
      const row = box(nav, `Primary / ${area}`, 16, y, 212, 36, active ? "surface/selected" : "surface/default", active ? "border/interactive" : "border/default", 6);
      if (!active) row.strokes = [];
      if (active) frame(row, "Active marker", 0, 5, 3, 26, "action/primary");
      text(row, `Primary label / ${area}`, area, 14, 8, 165, "Small", active ? "action/primary" : "text/primary");
      if (active) text(row, "Current state", "\u2022", 184, 8, 16, "Small", "action/primary");
      y += 39;
      const children = NAV_NESTED.filter((pair) => pair[0] === area);
      if (completeTree || area === "Conversations") for (const [, child] of children) {
        if (completeTree && area === "Administration" && (child === "Audit" || child === "Agent Runs")) {
          const restricted = box(nav, `Restricted link / Administration / ${child}`, 28, y, 200, 43, "status/restricted-bg", "status/restricted", 6);
          text(restricted, `Nested / Administration / ${child}`, `\u2514  ${child}`, 10, 4, 180, "Small", "text/primary");
          text(restricted, `Access marker / ${child}`, child === "Audit" ? "Restricted / permissioned" : "Contextual / restricted", 25, 23, 165, "Caption", "status/restricted");
          y += 47;
        } else {
          text(nav, `Nested / ${area} / ${child}`, `\u2514  ${child}`, 30, y + 2, 192, "Caption");
          y += 26;
        }
      }
    }
    const bottom = box(nav, "Account/session", 16, 820, 212, 62, "surface/subtle", "border/default", 6);
    text(bottom, "Account / name", "A. Operator", 12, 10, 185, "Small");
    text(bottom, "Account / status", "Operator \xB7 Session active", 12, 33, 185, "Caption", "text/secondary");
    const top = frame(screen, "Page/context header", 244, 0, 1356, 72, "surface/default");
    line(top, "Header divider", 0, 71, 1356);
    text(top, "Breadcrumb/page context", "Conversations   /   Amina S.   /   ORD-1042", 24, 13, 800, "Small", "text/secondary");
    text(top, "Current active area", "Conversations", 24, 36, 700, "Card Heading");
    if (completeTree) text(top, "Header business / role", "CURRENT BUSINESS", 1007, 6, 125, "Label", "text/secondary");
    chip(top, "Header business", "North Shop", 1007, completeTree ? 34 : 22, 125, "action/primary", "surface/selected");
    chip(top, "Header session", "Session active", 1150, 22, 174, "status/success", "status/success-bg");
  }
  function drawShellSpecimen(screen) {
    drawStaffChrome(screen, true);
    const main = frame(screen, "Main content region", 244, 72, 1356, 828, "surface/subtle");
    text(main, "Main heading", "Shared staff workspace", 32, 30, 800, "Page Title");
    text(main, "Main description", "One desktop shell keeps business scope, account state and the current task visible.", 32, 77, 1130, "Body", "text/secondary");
    const card = box(main, "Shell state specimen", 32, 132, 820, 296, "surface/default", "border/default", 8);
    text(card, "Specimen heading", "Conversations active", 24, 20, 500, "Section Heading");
    chip(card, "Active area badge", "Current area", 652, 22, 132, "action/primary", "surface/selected");
    text(card, "Specimen body", "The conversation workspace, selected case and persistent context panel appear here when a case is open.", 24, 68, 760, "Body");
    const list = box(card, "Example conversation list region", 24, 121, 215, 141, "surface/subtle");
    text(list, "List label", "CONVERSATION LIST", 14, 15, 182, "Label", "text/secondary");
    text(list, "Selected case", "Amina S. \xB7 WhatsApp", 14, 51, 182, "Small");
    const thread = box(card, "Example workspace region", 252, 121, 292, 141, "surface/subtle");
    text(thread, "Workspace label", "MESSAGE THREAD", 14, 15, 264, "Label", "text/secondary");
    text(thread, "Workspace sample", "Customer request and trusted business result", 14, 51, 264, "Small");
    const context = box(card, "Example persistent context region", 558, 121, 238, 141, "surface/subtle");
    text(context, "Context label", "PERSISTENT CONTEXT", 14, 15, 210, "Label", "text/secondary");
    text(context, "Context sample", "Customer \xB7 Order \xB7 Reservation \xB7 Handler", 14, 51, 210, "Small");
    const aside = box(main, "Shell identity guidance", 876, 132, 448, 296, "surface/default");
    text(aside, "Identity heading", "Scope and session", 24, 20, 380, "Card Heading");
    text(aside, "Identity body", "North Shop is the active business. A. Operator is signed in. These are separate from the selected conversation.", 24, 58, 398, "Body");
    chip(aside, "Current session", "Active session", 24, 140, 142, "status/success", "status/success-bg");
    text(aside, "Permission note", "Visible navigation does not grant backend access.", 24, 197, 390, "Small", "text/secondary");
    const next = box(main, "Shell navigation guidance", 32, 454, 1292, 310, "surface/default");
    text(next, "Navigation heading", "Approved hierarchy", 24, 20, 500, "Section Heading");
    text(next, "Navigation body", "Six primary areas. Escalations nests under Conversations; Forecasts nests under Analytics. Agent Runs and Audit stay restricted/contextual.", 24, 64, 1190, "Body");
    line(next, "Rule divider", 24, 115, 1244);
    text(next, "Shell rule label", "CONTEXT FIRST", 24, 142, 300, "Label", "text/secondary");
    text(next, "Shell rule", "Current business, page and owner remain legible while the work changes.", 24, 166, 790, "Body");
    button(next, "Example contextual link", "Open selected conversation  \u2192", 830, 202, 382, true);
    text(next, "Reference note", "1600 px is a design reference, not a product breakpoint.", 24, 278, 790, "Caption", "text/secondary");
    instantiate(next, "Navigation / Primary Item", "State=Active", "Phase 3C / Active Primary Item", 24, 198, 215);
    instantiate(next, "Navigation / Restricted Link", void 0, "Phase 3C / Restricted Link reference", 277, 196, 470);
  }
  function buildSharedShell(page) {
    assertWritablePage(page.name);
    ensurePrinciples(page);
    const section = ensureSection(page, SECTIONS2.shell, 0, 190, 1648, 1030);
    const staged = frame(section, `${SHELL_NAME} / staging`, 24, 92, 1600, 900, "surface/default");
    try {
      if (!section.children.some((n) => n.name === "Shell section title")) {
        text(section, "Shell section title", "01 \xB7 Shared Staff Shell", 24, 20, 1100, "Section Heading");
        text(section, "Shell section subtitle", "Desktop reference \xB7 high-fidelity shell specimen \xB7 not a complete business screen", 24, 51, 1400, "Small", "text/secondary");
      }
      drawShellSpecimen(staged);
      replaceOwned(section, SHELL_OWNED, [staged]);
      return [...SHELL_OWNED];
    } catch (error) {
      staged.remove();
      throw error;
    }
  }

  // src/builders/conversations.ts
  var W = 1600;
  var H = 900;
  function stateTone(kind) {
    if (kind === "confirmed") return { fg: "status/success", bg: "status/success-bg" };
    if (kind === "failure") return { fg: "status/error", bg: "status/error-bg" };
    if (kind === "unknown") return { fg: "status/unknown", bg: "status/unknown-bg" };
    if (kind === "waiting" || kind === "human") return { fg: "status/waiting-human", bg: "status/waiting-human-bg" };
    if (kind === "dependency") return { fg: "status/dependency", bg: "status/dependency-bg" };
    if (kind === "delivery") return { fg: "status/error", bg: "status/error-bg" };
    return { fg: "status/pending", bg: "status/pending-bg" };
  }
  function reservationFor(kind) {
    if (kind === "confirmed" || kind === "delivery" || kind === "default" || kind === "support" || kind === "sales") return "Confirmed";
    if (kind === "failure") return "Known Failure";
    if (kind === "unknown" || kind === "waiting") return "OUTCOME_UNKNOWN";
    if (kind === "dependency") return "Not checked \u2014 source unavailable";
    if (kind === "proposal") return "Not started";
    if (kind === "processing") return "Processing \u2014 not confirmed";
    return "Pending review";
  }
  function drawList(screen, v) {
    const list = frame(screen, "Conversation List", 244, 72, 318, 828, "surface/default");
    frame(list, "List divider", 317, 0, 1, 828, "border/default");
    text(list, "List title", "Conversations", 18, 20, 277, "Section Heading");
    text(list, "List count", "3 in this business", 18, 55, 270, "Caption", "text/secondary");
    const search = box(list, "Search field", 18, 91, 282, 40, "surface/subtle", "border/default", 6);
    text(search, "Search label", "Search conversations", 12, 10, 252, "Small", "text/secondary");
    chip(list, "All filter", "All", 18, 147, 54, "action/primary", "surface/selected");
    chip(list, "Attention filter", "Attention", 80, 147, 97, "text/secondary", "surface/subtle");
    chip(list, "Waiting filter", "Waiting Human", 185, 147, 115, "status/waiting-human", "status/waiting-human-bg");
    const rows = [
      { name: "Amina S.", channel: "Web Chat", handler: v.handler, state: v.status, time: "10:42", selected: true },
      { name: "Mira K.", channel: "WhatsApp", handler: "Human Operator", state: "Waiting Human", time: "09:58", selected: false },
      { name: "Dana R.", channel: "Telegram", handler: "Support Agent", state: "Attention needed \xB7 unread", time: "09:34", selected: false }
    ];
    rows.forEach((r, i) => {
      const row = box(list, `Conversation row / ${i + 1}`, 12, 191 + i * 112, 294, 102, r.selected ? "surface/selected" : "surface/default", r.selected ? "border/interactive" : "border/default", 6);
      if (r.selected) frame(row, "Selected marker", 0, 9, 3, 84, "action/primary");
      text(row, "Customer", r.name, 14, 10, 185, "Body Strong");
      text(row, "Last activity", r.time, 224, 10, 56, "Caption", "text/secondary");
      text(row, "Channel", r.channel, 14, 36, 115, "Caption", "text/secondary");
      text(row, "Current handler", r.handler, 133, 36, 145, "Caption", "text/secondary");
      text(row, "Conversation state", r.state, 14, 69, 266, "Small", r.state.includes("Waiting") ? "status/waiting-human" : r.state.includes("Attention") ? "status/warning" : r.selected ? stateTone(v.kind).fg : "text/secondary");
    });
    line(list, "List foot divider", 18, 763, 282);
    text(list, "Scope note", "North Shop \xB7 scoped case list", 18, 781, 282, "Caption", "text/secondary");
  }
  function drawMessageThread(workspace, kind) {
    const thread = frame(workspace, "Message Thread", 0, 94, 650, 333, "surface/default");
    const m1 = instantiate(thread, "Conversation / Message Row", "Sender=Customer", "Phase 3C / Customer message", 20, 17, 480);
    if (!m1) {
      const a = box(thread, "Customer message", 20, 17, 476, 93, "surface/subtle");
      text(a, "Customer sender", "Amina S. \xB7 Customer   10:40", 14, 10, 438, "Small", "text/secondary");
      text(a, "Customer content", "Is the Desk Lamp / Slate still available?", 14, 40, 438, "Body");
    }
    const m2 = instantiate(thread, "Conversation / Message Row", "Sender=Business Assistant", "Phase 3C / Business reply", 158, 139, 480);
    if (!m2) {
      const b = box(thread, "Business reply", 158, 139, 470, 94, "surface/default");
      text(b, "Business sender", "Business assistant \xB7 AI-assisted   10:41", 14, 10, 438, "Small", "text/secondary");
      text(b, "Business content", "I found the current product details.", 14, 40, 438, "Body");
    }
    if (kind === "confirmed" || kind === "failure" || kind === "unknown" || kind === "delivery") return;
    const result = box(thread, "Business-result message", 20, 264, 608, 58, "surface/subtle", "border/default", 6);
    text(result, "Result sender", "BUSINESS RESULT \xB7 10:42", 12, 8, 550, "Label", "text/secondary");
    const message = kind === "proposal" ? "Proposal recorded \xB7 action not executed" : kind === "processing" ? "Reservation processing \xB7 no confirmed effect yet" : kind === "dependency" ? "Stock source unavailable \xB7 availability not zero" : "Order and reservation facts are shown separately in context.";
    text(result, "Result content", message, 12, 29, 570, "Small");
  }
  function resultColumn(region, x, width, startY, lines) {
    let y = startY;
    for (const entry of lines) {
      const node = text(region, entry.name, entry.value, x, y, width, entry.type, entry.color);
      node.textAutoResize = "HEIGHT";
      y += node.height + (entry.gap ?? 8);
    }
    return y - (lines[lines.length - 1]?.gap ?? 8);
  }
  function drawBusinessResult(workspace, kind) {
    const { fg } = stateTone(kind);
    const region = box(workspace, "Business Action Result", 20, 440, 610, 1, "surface/default", "border/default", 8);
    let left;
    let right;
    if (kind === "confirmed") {
      left = [
        { name: "Result label", value: "BUSINESS RESULT", type: "Label", color: fg },
        { name: "Result state", value: "Reservation confirmed", type: "Card Heading" },
        { name: "Order reference", value: "Order #1042", type: "Small" }
      ];
      right = [
        { name: "Evidence label", value: "TRUSTED RESERVATION REFERENCE", type: "Label", color: "text/secondary" },
        { name: "Evidence reference", value: "R-1042", type: "Body Strong" },
        { name: "Observed label", value: "OBSERVED", type: "Label", color: "text/secondary" },
        { name: "Observed time", value: "10:43", type: "Small" }
      ];
    } else if (kind === "failure") {
      left = [
        { name: "Result label", value: "BUSINESS RESULT", type: "Label", color: fg },
        { name: "Result state", value: "Reservation failed", type: "Card Heading" },
        { name: "Result meaning", value: "Inventory was not reserved.", type: "Small" }
      ];
      right = [
        { name: "Next step label", value: "NEXT SAFE STEP", type: "Label", color: fg },
        { name: "Inventory review", value: "Review current inventory.", type: "Small" },
        { name: "Authorized recovery", value: "Choose an authorized recovery.", type: "Small" }
      ];
    } else {
      left = [
        { name: "Result label", value: "BUSINESS RESULT", type: "Label", color: fg },
        { name: "Result state", value: "OUTCOME_UNKNOWN", type: "Card Heading" },
        { name: "Possible effect", value: "Reservation may have committed.", type: "Small" },
        { name: "Missing confirmation", value: "Confirmation unavailable.", type: "Small" }
      ];
      right = [
        { name: "Operation label", value: "OPERATION REFERENCE", type: "Label", color: "text/secondary", gap: 4 },
        { name: "Operation reference", value: "R-1042 / Order #1042", type: "Small" },
        { name: "Reconciliation label", value: "RECONCILIATION", type: "Label", color: fg, gap: 4 },
        { name: "Reconciliation rule", value: "Required before any mutation retry.", type: "Small" },
        { name: "Next step label", value: "NEXT SAFE STEP", type: "Label", color: fg, gap: 4 },
        { name: "Safe retry rule", value: "Reconcile authoritative reservation state. Do not retry mutation blindly.", type: "Small" }
      ];
    }
    const leftBottom = resultColumn(region, 16, 270, 16, left);
    const rightBottom = resultColumn(region, 310, 284, 16, right);
    region.resize(610, Math.max(154, leftBottom, rightBottom) + 16);
    return region;
  }
  function drawMessageDeliveryState(workspace) {
    const region = box(workspace, "Delivery State", 20, 440, 610, 1, "surface/default", "border/default", 8);
    const businessBottom = resultColumn(region, 16, 270, 16, [
      { name: "Business effect label", value: "BUSINESS EFFECT", type: "Label", color: "status/success" },
      { name: "Business effect value", value: "Reservation confirmed", type: "Body Strong" },
      { name: "Business effect meaning", value: "Trusted business effect remains valid.", type: "Small" }
    ]);
    const communicationBottom = resultColumn(region, 310, 284, 16, [
      { name: "Communication label", value: "COMMUNICATION", type: "Label", color: "status/error" },
      { name: "Communication value", value: "Message delivery failed", type: "Body Strong" },
      { name: "Communication meaning", value: "Customer message was not delivered.", type: "Small" }
    ]);
    const nextY = Math.max(businessBottom, communicationBottom) + 12;
    const nextBottom = resultColumn(region, 16, 578, nextY, [
      { name: "Next step label", value: "NEXT SAFE STEP", type: "Label", color: "text/secondary", gap: 4 },
      { name: "Communication recovery", value: "Retry communication only. Do not repeat reserve_inventory.", type: "Small" }
    ]);
    region.resize(610, nextBottom + 16);
    return region;
  }
  function drawStatePanel(workspace, v) {
    if (v.kind === "confirmed" || v.kind === "failure" || v.kind === "unknown") {
      return drawBusinessResult(workspace, v.kind);
    }
    if (v.kind === "delivery") {
      return drawMessageDeliveryState(workspace);
    }
    const { fg, bg } = stateTone(v.kind);
    const name = v.kind === "handoff" ? "Handoff Event" : v.kind === "processing" ? "Execution Summary" : v.kind === "proposal" ? "Business Action Proposal" : v.kind === "waiting" || v.kind === "human" ? "Human Status" : "Agent Status";
    if (v.kind === "proposal" || v.kind === "processing") {
      const source = v.kind === "proposal" ? "Conversation / Action Proposal" : "Conversation / Execution Summary";
      if (instantiate(workspace, source, void 0, name, 90, 446, 470)) return;
    }
    const panel = box(workspace, name, 20, 440, 610, 190, bg, fg, 8);
    text(panel, "State heading", v.title, 18, 12, 570, "Card Heading", fg);
    let title = "", detail = "", next = "";
    switch (v.kind) {
      case "handoff":
        title = "Support Agent \u2192 Sales Agent";
        detail = "Reason: Sales-authorized mutation required. Verified customer and Order context carried forward; Order retrieval complete.";
        next = "Remaining: Sales reviews current facts. Permissions do not transfer.";
        break;
      case "human":
        title = "Human Operator owns this case";
        detail = "AI response ownership paused. Verified context remains available for the operator.";
        next = "Next: operator reviews the current case and replies when authorized.";
        break;
      case "waiting":
        title = "Human decision required";
        detail = "Reservation result remains uncertain. The case is waiting for assigned operator review.";
        next = "Open Escalation \xB7 reconcile authoritative state before any retry.";
        break;
      case "proposal":
        title = "PROPOSED \xB7 NOT EXECUTED";
        detail = "Reserve inventory for Order ORD-1042. Customer confirmation is required before an authorized action.";
        next = "No reservation effect has been claimed.";
        break;
      case "processing":
        title = "Processing \xB7 result pending";
        detail = "Sales Agent is performing approved work; the reservation result is not yet known.";
        next = "Do not present a completed effect while execution is pending.";
        break;
      case "dependency":
        title = "Dependency unavailable";
        detail = "The trusted stock source cannot provide a reliable result.";
        next = "Availability is unknown, not zero. Wait or route to support.";
        break;
      case "sales":
        title = "Sales Agent active";
        detail = "Sales owns the current case. Any consequential action still requires trusted authorization.";
        next = "Current Order and stock facts remain adjacent in context.";
        break;
      case "support":
        title = "Support Agent active";
        detail = "Support is answering from verified Order facts; it does not perform Sales writes.";
        next = "Sales handoff is available only when an authorized Sales task is required.";
        break;
      default:
        title = "Active conversation";
        detail = "Support is handling Amina\u2019s product and Order question using verified context.";
        next = "One current handler; the next response remains grounded in known facts.";
    }
    text(panel, "State summary", title, 18, 46, 572, "Body Strong");
    text(panel, "State detail", detail, 18, 82, 572, "Small");
    text(panel, "Next safe step", next, 18, 139, 572, "Small", fg);
    const native3 = v.kind === "default" || v.kind === "support" ? ["Conversation / Active Handler", "Handler=Support Agent"] : v.kind === "sales" ? ["Conversation / Active Handler", "Handler=Sales Agent"] : v.kind === "human" ? ["Conversation / Active Handler", "Handler=Human Operator"] : v.kind === "waiting" ? ["Conversation / Human Status", "State=Waiting for Human"] : v.kind === "processing" ? ["Conversation / Agent Status", "State=Executing"] : void 0;
    if (native3) {
      const narrow = native3[0] === "Conversation / Active Handler";
      const instance2 = instantiate(workspace, native3[0], native3[1], `Phase 3C / ${native3[0]} / ${native3[1]}`, narrow ? 380 : 322, 448, narrow ? 225 : 310);
      if (instance2) {
        panel.resize(292, 198);
        const texts = panel.findAll((n) => n.type === "TEXT");
        const shorter = {
          waiting: "Human decision required for this case.",
          processing: "Approved work is active; no result yet."
        };
        for (const t of texts) {
          if (t.name === "State detail") {
            t.characters = shorter[v.kind] ?? t.characters;
            t.y = 82;
          }
          if (t.name === "Next safe step") t.y = 128;
          t.resize(Math.min(t.width, 260), t.height);
        }
      }
    }
  }
  function drawComposer(workspace, kind, y = 650) {
    const active = kind === "human";
    const composer = box(workspace, "Composer", 20, y, 610, 158, "surface/default", "border/default", 8);
    text(composer, "Composer heading", "Reply to customer", 16, 10, 290, "Small", "text/secondary");
    const input = box(composer, "Draft input area", 16, 37, 575, 60, "surface/default", "border/default", 6);
    text(input, "Draft placeholder", "Write a message to Amina\u2026", 12, 13, 540, "Small", "text/secondary");
    const helper = kind === "proposal" ? "Awaiting customer confirmation before action can proceed. Message only." : kind === "unknown" ? "Message only; reconciliation is still required. No mutation retry." : kind === "waiting" ? "Message only; human decision remains pending." : kind === "processing" ? "Message only; business result remains pending." : kind === "delivery" ? "Message delivery failed; retry communication only." : active ? "Human Operator is the current reply owner." : "Message delivery is separate from business effects.";
    text(composer, "Composer rule", helper, 16, 109, 414, "Caption", "text/secondary");
    button(composer, "Send message", "Send message", 453, 109, 138, true);
    return composer;
  }
  function drawWorkspace(screen, v) {
    const w = frame(screen, "Conversation Workspace", 562, 72, 650, 828, "surface/default");
    frame(w, "Workspace divider", 649, 0, 1, 828, "border/default");
    text(w, "Case title", "Amina S.  \xB7  Desk Lamp / Slate", 20, 15, 520, "Card Heading");
    text(w, "Case metadata", "Web Chat  \xB7  ORD-1042  \xB7  Last activity 10:42", 20, 46, 490, "Small", "text/secondary");
    chip(w, "Case state", v.status, v.kind === "delivery" ? 439 : 465, 21, v.kind === "delivery" ? 188 : 162, stateTone(v.kind).fg, stateTone(v.kind).bg);
    line(w, "Workspace header divider", 0, 93, 650);
    drawMessageThread(w, v.kind);
    const resultRegion = drawStatePanel(w, v);
    const composer = drawComposer(w, v.kind, resultRegion ? Math.max(650, resultRegion.y + resultRegion.height + 20) : 650);
    if (resultRegion && composer.y + composer.height + 20 > w.height) {
      w.resize(w.width, composer.y + composer.height + 20);
      const divider = w.children.find((n) => n.name === "Workspace divider");
      divider.resize(divider.width, w.height);
      screen.resize(screen.width, Math.max(screen.height, w.y + w.height));
    }
  }
  function drawContext(screen, v) {
    const c = frame(screen, "Persistent Context Panel", 1212, 72, 388, 828, "surface/subtle");
    text(c, "Context heading", "Case context", 18, 18, 310, "Card Heading");
    text(c, "Context subtitle", "Verified facts \xB7 current business", 18, 48, 340, "Caption", "text/secondary");
    const customer = box(c, "Customer Context", 16, 83, 356, 132, "surface/default");
    text(customer, "Customer heading", "CUSTOMER", 14, 12, 310, "Label", "text/secondary");
    text(customer, "Customer identity", "Amina S. \xB7 C-1042", 14, 37, 315, "Body Strong");
    text(customer, "Customer source", "Web Chat \xB7 verified in North Shop", 14, 64, 315, "Small");
    text(customer, "Customer freshness", "Observed 10:40 \xB7 current source", 14, 88, 315, "Caption", "text/secondary");
    text(customer, "Customer link", "Open Customer record  \u2197", 14, 108, 310, "Caption", "action/primary");
    const order = box(c, "Order Context", 16, 226, 356, 177, "surface/default");
    text(order, "Order heading", "ORDER \xB7 ORD-1042", 14, 11, 315, "Label", "text/secondary");
    text(order, "Order State label", "ORDER STATE", 14, 41, 160, "Label", "text/secondary");
    text(order, "Order State value", "Created", 189, 40, 145, "Body Strong", "status/success");
    line(order, "Order separation", 14, 75, 327);
    text(order, "Reservation State label", "RESERVATION STATE", 14, 86, 180, "Label", "text/secondary");
    text(order, "Reservation State value", reservationFor(v.kind), 14, 111, 320, "Small", v.kind === "failure" ? "status/error" : v.kind === "unknown" || v.kind === "waiting" ? "status/unknown" : v.kind === "dependency" ? "status/dependency" : v.kind === "confirmed" || v.kind === "delivery" ? "status/success" : "text/primary");
    text(order, "Order link", "Open Order record  \u2197", 14, 146, 310, "Caption", "action/primary");
    const stock = box(c, "Inventory/Freshness", 16, 414, 356, 108, "surface/default");
    text(stock, "Inventory heading", "INVENTORY \xB7 DESK LAMP / SLATE", 14, 10, 324, "Label", "text/secondary");
    text(stock, "Availability", v.kind === "dependency" ? "Source unavailable \xB7 not zero stock" : "Latest known availability: 4 units", 14, 38, 324, "Small", v.kind === "dependency" ? "status/dependency" : "text/primary");
    text(stock, "Freshness", v.kind === "dependency" ? "Refresh when trusted source recovers" : "Observed 10:41 \xB7 revalidate before action", 14, 70, 324, "Caption", "text/secondary");
    const handler = box(c, "Active Handler", 16, 533, 356, 113, "surface/default");
    text(handler, "Handler heading", "CURRENT HANDLER", 14, 10, 324, "Label", "text/secondary");
    const human = v.handler === "Human Operator";
    chip(handler, "Handler identity", human ? "HUMAN" : "AI SPECIALIST", 14, 37, human ? 91 : 126, human ? "status/waiting-human" : "status/info", human ? "status/waiting-human-bg" : "surface/selected");
    text(handler, "Handler name", v.handler, 155, 39, 177, "Small");
    text(handler, "Handler ownership", "One current owner \xB7 previous in history", 14, 80, 324, "Caption", "text/secondary");
    const escalation = box(c, "Escalation State", 16, 657, 356, 100, v.kind === "waiting" || v.kind === "unknown" ? "status/unknown-bg" : "surface/default", "border/default", 8);
    text(escalation, "Escalation heading", "ESCALATION", 14, 10, 324, "Label", "text/secondary");
    text(escalation, "Escalation status", v.kind === "waiting" ? "Waiting for Human \xB7 decision required" : v.kind === "unknown" ? "Reconciliation needed \xB7 pending review" : "No active escalation for this case", 14, 35, 324, "Small", v.kind === "waiting" ? "status/waiting-human" : v.kind === "unknown" ? "status/unknown" : "text/primary");
    text(escalation, "Escalation link", "Open Escalation  \u2197", 14, 69, 230, "Caption", "action/primary");
    text(c, "Context source note", "Case facts are scoped; links recheck access.", 18, 781, 350, "Caption", "text/secondary");
  }
  var LEGACY_RESULT_LAYERS = /* @__PURE__ */ new Set([
    "Authoritative result",
    "Phase 3C / Authoritative Action Result",
    "Result metadata heading",
    "Result reference",
    "Result observation",
    "Result entity",
    "Result business",
    "Result customer",
    "Order remains",
    "Failure observation",
    "Next safe step",
    "Case customer",
    "Escalation route",
    "Business Effect",
    "Communication",
    "Delivery heading",
    "Result label",
    "Result state",
    "Result meaning",
    "Result evidence or next step",
    "Business effect label",
    "Business effect value",
    "Communication label",
    "Communication value",
    "Result sender",
    "Result content"
  ]);
  var LEGACY_ROOT_LAYERS = /* @__PURE__ */ new Set([
    "Authoritative result",
    "Phase 3C / Authoritative Action Result",
    "Result metadata heading",
    "Result reference",
    "Result observation",
    "Result entity",
    "Result business",
    "Result customer",
    "Order remains",
    "Failure observation",
    "Next safe step",
    "Case customer",
    "Escalation route",
    "Business Effect",
    "Communication",
    "Delivery heading"
  ]);
  function discardLegacyLayer(node, region) {
    if ("children" in node) for (const child of [...node.children]) {
      if (LEGACY_RESULT_LAYERS.has(child.name)) discardLegacyLayer(child, region);
      else region.appendChild(child);
    }
    node.remove();
  }
  function pruneLegacyResultLayers(screen, kind) {
    if (kind !== "confirmed" && kind !== "failure" && kind !== "unknown" && kind !== "delivery") return;
    const workspace = screen.children.find((n) => n.type === "FRAME" && n.name === "Conversation Workspace");
    const name = kind === "delivery" ? "Delivery State" : "Business Action Result";
    const region = workspace?.children.find((n) => n.type === "FRAME" && n.name === name);
    if (!workspace || !region) return;
    for (const child of [...workspace.children]) if (child !== region && (child.name === "Authoritative result" || child.name === "Phase 3C / Authoritative Action Result")) discardLegacyLayer(child, region);
    for (const child of [...region.children]) if (LEGACY_ROOT_LAYERS.has(child.name)) discardLegacyLayer(child, region);
    const thread = workspace.children.find((n) => n.type === "FRAME" && n.name === "Message Thread");
    if (thread) {
      for (const child of [...thread.children]) if (child.type === "FRAME" && child.name === "Business-result message") discardLegacyLayer(child, thread);
    }
  }
  function drawConversation(screen, v) {
    drawStaffChrome(screen);
    drawList(screen, v);
    drawWorkspace(screen, v);
    drawContext(screen, v);
  }
  function buildConversations(page) {
    assertWritablePage(page.name);
    const section = ensureSection(page, SECTIONS2.conversations, 0, 1240, 4940, 4810);
    const staged = [];
    try {
      let rowY = 92;
      let rowHeight = 0;
      for (const [i, v] of VARIANTS.entries()) {
        if (i > 0 && i % 3 === 0) {
          rowY += rowHeight + 32;
          rowHeight = 0;
        }
        const x = 24 + i % 3 * 1628;
        const n = frame(section, `${conversationName(v.key)} / staging`, x, rowY, W, H, "surface/default");
        staged.push(n);
        drawConversation(n, v);
        rowHeight = Math.max(rowHeight, n.height);
      }
      section.resize(section.width, Math.max(section.height, rowY + rowHeight + 24));
      replaceOwned(section, CONVERSATIONS_OWNED, staged);
      for (const [i, v] of VARIANTS.entries()) pruneLegacyResultLayers(staged[i], v.kind);
      return [...CONVERSATIONS_OWNED];
    } catch (error) {
      staged.forEach((n) => n.remove());
      throw error;
    }
  }

  // src/builders/escalations.ts
  var WIDTH = 1760;
  var CONTENT = 970;
  var GAP = 12;
  function tone(kind) {
    if (kind === "unknown") return { fg: "status/unknown", bg: "status/unknown-bg" };
    if (kind === "stale") return { fg: "status/stale", bg: "status/stale-bg" };
    if (kind === "authorization") return { fg: "status/warning", bg: "status/warning-bg" };
    if (kind === "e02") return { fg: "status/restricted", bg: "status/restricted-bg" };
    if (kind === "resolved") return { fg: "status/success", bg: "status/success-bg" };
    if (kind === "waiting") return { fg: "status/waiting-human", bg: "status/waiting-human-bg" };
    return { fg: "status/pending", bg: "status/pending-bg" };
  }
  function copyFor(kind) {
    const shared = ["Order ORD-1042 exists \xB7 Order record observed 10:43.", "create_order \u2014 confirmed \xB7 operation CO-1042.", "Customer Amina S. verified \xB7 inventory last observed 10:42."];
    switch (kind) {
      case "waiting":
        return { reason: "Reservation confirmation unavailable; assignment is pending.", status: "Waiting Assignment", owner: "Unassigned \xB7 human queue", age: "Opened 10:43 \xB7 age 4 min", facts: shared, effect: ["OUTCOME_UNKNOWN \xB7 reservation may have committed.", "Confirmation unavailable \xB7 operation RI-1042 retained."], constraints: ["No blind retry while the effect is unknown.", "No decision before an authorized Human Operator is assigned."], safe: "Assign an eligible Human Operator for reconciliation.", decision: "Review eligible assignment", decisionNote: "Assignment policy and case access are checked by the backend; no autonomous bypass." };
      case "assigned":
        return { reason: "Known failed reservation needs an authorized recovery decision.", status: "Awaiting Decision", owner: "Human Operator \xB7 assigned", age: "Assigned 10:47 \xB7 age 2 min", facts: [...shared, "Reservation failed \u2014 known result; inventory was not reserved."], effect: ["No uncertain effect remains in this case.", "Known failure is not OUTCOME_UNKNOWN."], constraints: ["Review current inventory before any new proposal.", "Approval does not transfer Sales permissions or bypass policy."], safe: "Review current inventory and choose authorized recovery.", decision: "Approve proposed continuation", decisionNote: "Decision concerns a proposed continuation only; backend authorization and current state still apply." };
      case "unknown":
        return { reason: "Reservation confirmation unavailable after the request.", status: "OUTCOME_UNKNOWN", owner: "Human Operator \xB7 reconciliation", age: "Observed 10:43 \xB7 unresolved 4 min", facts: shared, effect: ["OUTCOME_UNKNOWN \xB7 effect may have committed.", "Confirmation unavailable \xB7 operation RI-1042 retained.", "RECONCILIATION REQUIRED \xB7 NO BLIND RETRY."], constraints: ["Do not retry reserve_inventory before reconciliation.", "Recheck current authorization before any continuation."], safe: "Reconcile authoritative reservation state first.", decision: "Request reconciliation", decisionNote: "Approval and mutation retry remain unavailable until the effect is known." };
      case "stale":
        return { reason: "Previously observed business facts may no longer be decision-safe.", status: "Stale Context", owner: "Human Operator \xB7 assigned", age: "Inventory observed 10:42 \xB7 refresh needed", facts: ["Order ORD-1042 exists \xB7 source observed 10:43.", "Inventory observation exists from 10:42; it is not current enough for action.", "Customer Amina S. verified in Conversation C-42."], effect: ["No uncertain mutation effect is asserted.", "This is stale evidence, not missing data or Permission Denied."], constraints: ["Do not decide from an outdated Order or inventory revision.", "Refresh source facts and revalidate before consequential action."], safe: "Refresh authoritative business facts.", decision: "Request refreshed facts", decisionNote: "A new decision follows the refreshed evidence and current case revision." };
      case "authorization":
        return { reason: "Previous authorization assumption is no longer sufficient.", status: "Authorization Changed", owner: "Human Operator \xB7 review required", age: "Scope changed after 10:43 observation", facts: ["Order ORD-1042 exists in the recorded case context.", "The earlier operator scope was observed before this change.", "No new business mutation is claimed."], effect: ["No uncertain mutation effect is asserted.", "Authorization changed is not automatically Permission Denied."], constraints: ["Check current principal, business scope and case assignment again.", "A visible control never grants backend access."], safe: "Recheck current principal and scope.", decision: "Recheck authorization", decisionNote: "If access is denied, do not reveal protected details; reassign an authorized Operator." };
      case "e02":
        return { reason: "E02 automatic Order update is restricted by current policy.", status: "E02 Restricted", owner: "Human Operator \xB7 policy handling", age: "Requested 10:43 \xB7 pending policy review", facts: ["Requested update: change Order ORD-1042 details.", "Known current Order State: Created \xB7 verified.", "update_order did not execute; no changed Order is claimed."], effect: ["No uncertain reservation effect is asserted.", "E02 is not OUTCOME_UNKNOWN, Reservation Failure or Permission Denied."], constraints: ["Automatic update_order mutation remains restricted.", "A human click cannot bypass unresolved business policy."], safe: "Route to authorized human/policy handling.", decision: "Request policy clarification", decisionNote: "No Approve update action is available until an approved policy exists." };
      case "resume":
        return { reason: "Human decision recorded; a safe continuation would need fresh checks.", status: "Resume Pending \xB7 TARGET M12", owner: "Human Operator \xB7 target review", age: "Target design \xB7 no live resume", facts: ["Order ORD-1042 and decision D-204 remain linked to ESC-204.", "Human decision is recorded in this target UX illustration.", "No new reservation or Order effect is claimed."], effect: ["No mutation replay is allowed.", "Any prior OUTCOME_UNKNOWN must be reconciled before continuation."], constraints: ["TARGET M12 \xB7 Not currently implemented.", "Revalidate authorization, current state and revision.", "Human decision \u2192 Revalidation \u2192 Controlled Resume request."], safe: "Revalidate current rights, facts and pending effects.", decision: "No live resume action", decisionNote: "TARGET M12 \xB7 Not currently implemented \xB7 No mutation replay." };
      case "resolved":
        return { reason: "Reconciliation completed and the case is ready for closure.", status: "Resolved", owner: "Human Operator \xB7 disposition recorded", age: "Resolved 10:54 \xB7 history retained", facts: ["Order ORD-1042 exists \xB7 create_order confirmed.", "Reservation effect verified from authoritative state at 10:54.", "Customer Amina S. remains linked to Conversation C-42."], effect: ["No uncertain effect remains after reconciliation.", "Verified reservation outcome is recorded separately from case closure."], constraints: ["Resolved means the effect/decision is verified.", "Closed means no further active work; history remains available."], safe: "Close the escalation after recording the disposition.", decision: "Close escalation", decisionNote: "RESOLVED \xB7 verified outcome. CLOSED \xB7 no active work; case history retained." };
    }
  }
  function flowText(parent, name, value, y, type = "Small", color = "text/primary", width = CONTENT - 36) {
    const node = text(parent, name, value, 18, y, width, type, color);
    node.textAutoResize = "HEIGHT";
    return y + node.height;
  }
  function infoBlock(parent, name, label, values, y, accent, background = "surface/default") {
    const card = box(parent, name, 0, y, CONTENT, 1, background, accent, 8);
    let cursor = flowText(card, "Hierarchy label", label, 14, "Label", accent) + 8;
    values.forEach((value, i) => {
      cursor = flowText(card, `Content / ${i + 1}`, value, cursor, i === 0 ? "Body Strong" : "Small") + 5;
    });
    card.resize(CONTENT, cursor + 11);
    return card;
  }
  function setInstanceText(instance2, name, value) {
    const node = instance2.findAll((n) => n.type === "TEXT" && n.name === name)[0];
    if (node) node.characters = value;
  }
  function drawSelected(queue, kind, c) {
    const variant = kind === "waiting" ? "State=Waiting Assignment" : kind === "assigned" ? "State=Assigned" : kind === "unknown" ? "State=OUTCOME_UNKNOWN / Reconciliation Required" : kind === "resume" ? "State=Resume Pending \u2014 TARGET M12" : void 0;
    const native3 = variant ? instantiate(queue, "Escalation / Queue Item", variant, "Selected Queue Item", 0, 102, 470) : void 0;
    if (native3) {
      stroke(native3, "border/interactive");
      setInstanceText(native3, "Escalation reference", "ESC-204 / Conversation C-42");
      setInstanceText(native3, "Affected object", "Order ORD-1042 / Desk Lamp / Slate");
      setInstanceText(native3, "Owner", `Owner: ${c.owner}`);
      setInstanceText(native3, "Time or target note", c.age);
      const marker = native3.findAll((n) => n.type === "FRAME" && n.name === "Queue status marker")[0];
      if (marker) {
        const { fg, bg } = tone(kind);
        fill(marker, bg);
        stroke(marker, fg);
        const meaning = marker.findAll((n) => n.type === "TEXT" && n.name === "Meaning")[0];
        if (meaning) meaning.characters = c.status;
      }
    } else {
      const selected2 = box(queue, "Selected Queue Item", 0, 102, 470, 213, "surface/selected", "border/interactive", 8);
      flowText(selected2, "Escalation reference", "ESC-204 / Conversation C-42", 13, "Body Strong", "text/primary", 438);
      flowText(selected2, "Affected object", "Order ORD-1042 / Desk Lamp / Slate", 41, "Small", "text/secondary", 438);
      chip(selected2, "Queue status marker", c.status, 14, 70, 440, tone(kind).fg, tone(kind).bg);
      const reasonBottom = flowText(selected2, "Reason", `Reason: ${c.reason}`, 113, "Small", "text/primary", 438);
      const ownerBottom = flowText(selected2, "Owner", `Owner: ${c.owner}`, reasonBottom + 8, "Caption", "text/secondary", 438);
      const timeBottom = flowText(selected2, "Time or target note", c.age, ownerBottom + 8, "Caption", "text/secondary", 438);
      selected2.resize(470, Math.max(213, timeBottom + 12));
    }
    const selected = queue.children.find((n) => n.name === "Selected Queue Item");
    frame(queue, "Selected queue marker", 0, 109, 4, selected.height - 14, "action/primary");
    return 102 + selected.height;
  }
  function queueSummary(parent, name, ref, detail, status, y) {
    const row = box(parent, name, 0, y, 470, 90, "surface/default", "border/default", 8);
    flowText(row, "Reference", ref, 10, "Body Strong", "text/primary", 420);
    flowText(row, "Reason", detail, 35, "Small", "text/secondary", 420);
    flowText(row, "Status", status, 64, "Caption", "status/waiting-human", 420);
  }
  function drawQueue(main, kind, c) {
    const q = frame(main, "Escalation Queue", 24, 24, 470, 680, "surface/subtle");
    text(q, "Queue heading", "Escalation Queue", 0, 0, 350, "Section Heading");
    text(q, "Queue scope", "TRIAGE \xB7 North Shop \xB7 one selected case", 0, 35, 460, "Label", "text/secondary");
    text(q, "Queue filter", "Needs attention  /  Assigned  /  Reconciliation", 0, 66, 470, "Small", "text/secondary");
    const nextRow = drawSelected(q, kind, c) + 14;
    queueSummary(q, "Queue row / 2", "ESC-198 \xB7 Conversation C-39", "Product availability needs clarification", "Waiting Human \xB7 7 min", nextRow);
    queueSummary(q, "Queue row / 3", "ESC-201 \xB7 Conversation C-40", "Known delivery-status question", "Assigned \xB7 5 min", nextRow + 102);
    const linkY = nextRow + 216;
    const link = instantiate(q, "Navigation / Restricted Link", void 0, "Agent Run contextual link", 0, linkY, 470);
    if (!link) {
      const l = box(q, "Agent Run contextual link", 0, linkY, 470, 72, "surface/default", "status/restricted", 6);
      flowText(l, "Contextual destination", "Agent Runs  \u2197", 9, "Small", "text/primary", 438);
      flowText(l, "Restriction label", "Contextual / permitted case only", 31, "Caption", "status/restricted", 438);
      flowText(l, "Authorization rule", "Visible link still requires server authorization.", 50, "Caption", "text/secondary", 438);
    }
    const linkHeight = link?.height ?? 72;
    const owner = text(q, "Queue owner", `CASE OWNER \xB7 ${c.owner}`, 0, linkY + linkHeight + 24, 460, "Small", tone(kind).fg);
    q.resize(470, owner.y + owner.height + 14);
    return q;
  }
  function drawHumanDecision(context, kind, c, y) {
    if (kind === "assigned") {
      const native3 = instantiate(context, "Escalation / Human Decision Panel", void 0, "Human Decision", 0, y, CONTENT);
      if (native3) {
        setInstanceText(native3, "Proposal summary", "Decision D-204: review current inventory and an authorized recovery proposal.");
        setInstanceText(native3, "Decision scope", "Human Operator / Order ORD-1042 / current authorization required");
        return native3;
      }
    }
    const panel = box(context, "Human Decision", 0, y, CONTENT, 1, "surface/default", "border/default", 8);
    let cursor = flowText(panel, "Hierarchy label", "HUMAN DECISION", 14, "Label", "status/waiting-human") + 8;
    cursor = flowText(panel, "Decision object", c.decisionNote, cursor, "Small") + 16;
    if (kind === "assigned") {
      button(panel, "Primary decision", "Approve proposed continuation", 18, cursor, 290, true);
      button(panel, "Reject decision", "Reject proposed continuation", 320, cursor, 290);
      button(panel, "Clarification decision", "Request clarification", 622, cursor, 240);
      cursor += 49;
      const target = box(panel, "TARGET M12 resume request / unavailable", 18, cursor, 320, 37, "surface/subtle", "border/default", 6);
      flowText(target, "Contextual action label", "Revalidate \u2192 Resume request", 9, "Small", "text/secondary", 292);
      button(panel, "Close decision", "Close escalation", 350, cursor, 205);
      cursor += 49;
    } else if (kind !== "resume") {
      button(panel, "Primary decision", c.decision, 18, cursor, 320, true);
      button(panel, "Secondary decision", kind === "resolved" ? "View decision history" : "Request clarification", 356, cursor, 240);
      cursor += 49;
    }
    if (kind === "resolved") {
      chip(panel, "Resolved state", "RESOLVED \xB7 effect verified", 18, cursor, 274, "status/success", "status/success-bg");
      chip(panel, "Closed state", "CLOSED \xB7 history retained", 310, cursor, 267, "text/secondary", "surface/subtle");
      cursor += 40;
    }
    if (kind === "resume") cursor = flowText(panel, "Target M12 note", "TARGET M12 \xB7 Not currently implemented \xB7 No mutation replay.", cursor, "Body Strong", "status/pending") + 8;
    else cursor = flowText(panel, "Decision boundary", "Visible action does not grant backend access; current case, policy and revision are checked.", cursor, "Caption", "text/secondary") + 8;
    panel.resize(CONTENT, cursor + 11);
    return panel;
  }
  function drawContext2(main, kind, c) {
    const d = frame(main, "Decision Context", 518, 24, CONTENT, 1, "surface/subtle");
    text(d, "Context title", "ESC-204 \xB7 Decision Context", 0, 0, 650, "Section Heading");
    chip(d, "Case status", c.status, 684, 0, 280, tone(kind).fg, tone(kind).bg);
    text(d, "Selected case relationship", "Selected queue item \u2192 Amina S. \xB7 Conversation C-42 \xB7 Order ORD-1042", 0, 35, 955, "Small", "text/secondary");
    text(d, "Conversation reference", "Open Conversation C-42  \u2197", 0, 64, 290, "Caption", "action/primary");
    text(d, "Order reference", "Open Order ORD-1042  \u2197", 305, 64, 250, "Caption", "action/primary");
    text(d, "Run access", "Agent Run \xB7 permitted case only  \u2197", 585, 64, 370, "Caption", "status/restricted");
    let y = 101;
    const blocks3 = [
      ["Why Automation Stopped", "WHY AUTOMATION STOPPED", [c.reason], "text/primary"],
      ["Confirmed Facts", "CONFIRMED FACTS", c.facts, "status/success", "status/success-bg"],
      ["Uncertain Effect", "UNCERTAIN EFFECT", c.effect, tone(kind).fg, kind === "unknown" || kind === "waiting" ? "status/unknown-bg" : "surface/default"],
      ["Constraints", "CONSTRAINTS", c.constraints, kind === "e02" ? "status/restricted" : "text/secondary", "surface/default"],
      ["Next Safe Step", "NEXT SAFE STEP", [c.safe], tone(kind).fg, tone(kind).bg]
    ];
    for (const [name, label, values, fg, bg] of blocks3) {
      const native3 = name === "Uncertain Effect" && kind === "unknown" ? instantiate(d, "Escalation / Uncertain Effect", void 0, name, 0, y, CONTENT) : void 0;
      const block = native3 ?? infoBlock(d, name, label, values, y, fg, bg);
      y += block.height + GAP;
    }
    const decision = drawHumanDecision(d, kind, c, y);
    d.resize(CONTENT, y + decision.height + 14);
    return d;
  }
  function drawEscalation(screen, variant) {
    const c = copyFor(variant.kind);
    drawStaffChrome(screen);
    const nav = screen.children.find((n) => n.name === "Staff navigation");
    const nested = nav.findAll((n) => n.type === "TEXT" && n.name === "Nested / Conversations / Escalations")[0];
    fill(nested, "action/primary");
    nested.fontName = { family: "Inter", style: "Semi Bold" };
    frame(nav, "Escalations active marker", 24, nested.y + 1, 3, 20, "action/primary");
    const header = screen.children.find((n) => n.name === "Page/context header");
    header.children.find((n) => n.name === "Breadcrumb/page context").characters = "Conversations  /  Escalations  /  ESC-204";
    header.children.find((n) => n.name === "Current active area").characters = "Escalations";
    header.resize(WIDTH - 244, header.height);
    header.children.find((n) => n.name === "Header divider").resize(WIDTH - 244, 1);
    const main = frame(screen, "Escalations Workspace", 244, 72, WIDTH - 244, 1, "surface/subtle");
    const queue = drawQueue(main, variant.kind, c);
    const context = drawContext2(main, variant.kind, c);
    main.resize(WIDTH - 244, Math.max(queue.y + queue.height, context.y + context.height) + 24);
    screen.resize(WIDTH, main.y + main.height);
    nav.resize(nav.width, screen.height);
    nav.children.find((n) => n.name === "Navigation divider").resize(1, screen.height);
    nav.children.find((n) => n.name === "Account/session").y = screen.height - 80;
  }
  function buildEscalations(page) {
    assertWritablePage(page.name);
    const conversations = page.children.find((n) => n.type === "FRAME" && n.name === SECTIONS2.conversations);
    const y = conversations ? conversations.y + conversations.height + 60 : 6100;
    const section = ensureSection(page, SECTIONS2.escalations, 0, y, 3580, 1);
    const staged = [];
    try {
      let rowY = 86, rowHeight = 0;
      for (const [i, variant] of ESCALATION_VARIANTS.entries()) {
        if (i > 0 && i % 2 === 0) {
          rowY += rowHeight + 32;
          rowHeight = 0;
        }
        const screen = frame(section, `${escalationName(variant.key)} / staging`, 24 + i % 2 * 1780, rowY, WIDTH, 900, "surface/default");
        staged.push(screen);
        drawEscalation(screen, variant);
        rowHeight = Math.max(rowHeight, screen.height);
      }
      section.resize(section.width, rowY + rowHeight + 24);
      replaceOwned(section, ESCALATIONS_OWNED, staged);
      return [...ESCALATIONS_OWNED];
    } catch (error) {
      staged.forEach((n) => n.remove());
      throw error;
    }
  }

  // src/builders/orders.ts
  var SCREEN_W = 1760;
  var WORK_W = 1516;
  var INNER_W = 1468;
  var GAP2 = 24;
  var COPY = {
    confirmed: {
      order: "Created",
      reservation: "Confirmed",
      freshness: "Fresh / Current",
      orderNote: "Order ORD-1042 exists. create_order confirmed in the Order record at 10:43.",
      reservationNote: "Inventory reserved \xB7 trusted reservation ref R-1042 at 10:43. This is separate from Order creation.",
      attention: "No active business-effect recovery. A customer-message delivery problem cannot undo this reservation.",
      version: "Order version v7 \xB7 Order source observed 10:43 \xB7 current for this illustration.",
      next: "Inspect Order Delivery",
      nextDetail: "Use the provider observation for fulfillment questions; do not infer shipping from Order creation.",
      escalation: "No active Escalation is asserted for the confirmed business effect.",
      activity: ["10:43 \xB7 Order created \xB7 confirmed.", "10:43 \xB7 Reservation confirmed \xB7 R-1042.", "10:44 \xB7 Customer message delivery failed \xB7 communication only."]
    },
    failed: {
      order: "Created",
      reservation: "Known Failure",
      freshness: "Observed at 10:41",
      orderNote: "Order ORD-1042 exists. create_order confirmed; do not create the same Order again.",
      reservationNote: "Reservation failed \u2014 known result. Inventory is not reserved. No stock hold exists.",
      attention: "Partial outcome: the Order exists, while the reservation is known not to have completed.",
      version: "Order version v7 \xB7 observed 10:43. Inventory last observed 10:41; review the current source before a new proposal.",
      next: "Review current inventory",
      nextDetail: "Choose an authorized recovery path after reviewing current facts. Do not create the same Order again.",
      escalation: "Open Escalation ESC-204 if authorized recovery requires human review.",
      activity: ["10:43 \xB7 Order created \xB7 confirmed.", "10:43 \xB7 Reservation failed \xB7 known result.", "Next \xB7 review inventory and authorized recovery."]
    },
    unknown: {
      order: "Created",
      reservation: "OUTCOME_UNKNOWN",
      freshness: "Requires Revalidation",
      orderNote: "Order ORD-1042 exists. create_order confirmed; this does not confirm a reservation.",
      reservationNote: "Reservation effect may have committed. Confirmation unavailable. Operation RI-1042 retained. RECONCILIATION REQUIRED. NO BLIND RETRY.",
      attention: "Reservation write is locked while the effect is unresolved. Human review is linked to ESC-204.",
      version: "Order version v7 \xB7 observed 10:43. Recheck the authoritative reservation state before continuation.",
      next: "Reconcile authoritative reservation state",
      nextDetail: "Inspect the retained operation and authoritative effect first. Do not retry mutation blindly.",
      escalation: "Open Escalation ESC-204 \xB7 reconciliation / human review required.",
      activity: ["10:43 \xB7 Order created \xB7 confirmed.", "10:43 \xB7 Reservation attempt \xB7 result unknown \xB7 RI-1042.", "Pending \xB7 reconcile the effect; no mutation replay."]
    },
    attention: {
      order: "Needs Attention",
      reservation: "Known Failure",
      freshness: "Observed at 10:41",
      orderNote: "Order ORD-1042 exists. The Order record flags an unresolved business decision for a Human Operator.",
      reservationNote: "Reservation failed \u2014 known result; inventory is not reserved. The human path does not make it unknown.",
      attention: "Confirmed: Order exists and no reservation completed. Unresolved: which authorized recovery the current policy permits.",
      version: "Order version v7 \xB7 observed 10:43. Refresh current Order and inventory facts before a consequential decision.",
      next: "Request authorized handling",
      nextDetail: "Route the known partial outcome to a Human Operator; do not infer approval or repeat an Order write.",
      escalation: "Open Escalation ESC-204 \xB7 human decision pending.",
      activity: ["10:43 \xB7 Order created \xB7 confirmed.", "10:43 \xB7 Reservation failed \xB7 known result.", "Pending \xB7 Human Operator reviews recovery policy."]
    },
    stale: {
      order: "Stale / Conflict",
      reservation: "Confirmed",
      freshness: "Stale",
      orderNote: "Order ORD-1042 exists, but the observed Order version may no longer be current.",
      reservationNote: "Reservation was confirmed in the observed record. This does not establish current inventory availability.",
      attention: "Order version v7 was observed at 10:43; a newer or conflicting revision may exist. Facts are not decision-safe.",
      version: "Observed Order version v7 \xB7 current revision not verified. Refresh and revalidate before any consequential action.",
      next: "Refresh and revalidate",
      nextDetail: "Compare authoritative current Order and inventory facts. Do not automatically replay any write.",
      escalation: "No active Escalation is asserted; route a persistent conflict to authorized human review.",
      activity: ["10:43 \xB7 Order version v7 observed.", "Later \xB7 current revision not verified.", "Next \xB7 refresh, resolve conflict and re-evaluate."]
    },
    e02: {
      order: "Created",
      reservation: "Confirmed",
      freshness: "Requires Revalidation",
      orderNote: "Current known Order State: Created \xB7 verified in Order record. No Order update is claimed.",
      reservationNote: "Reservation remains a separate confirmed fact. E02 is not a reservation failure or unknown effect.",
      attention: "E02 \xB7 automatic update_order mutation is restricted. Requested change: Order ORD-1042 details. No update executed.",
      version: "Order version v7 \xB7 observed 10:43. Recheck current state before any future approved policy path.",
      next: "Request authorized human/policy handling",
      nextDetail: "Do not enable Update Order; the unresolved E02 business policy cannot be bypassed by a visible control.",
      escalation: "Open Escalation ESC-204 \xB7 restricted update / policy handling.",
      activity: ["10:43 \xB7 Order created \xB7 confirmed.", "10:43 \xB7 Reservation confirmed independently.", "E02 \xB7 requested update restricted; no mutation executed."]
    }
  };
  function tone2(state) {
    if (state === "OUTCOME_UNKNOWN") return { fg: "status/unknown", bg: "status/unknown-bg" };
    if (state.includes("Failure")) return { fg: "status/error", bg: "status/error-bg" };
    if (state === "Needs Attention") return { fg: "status/warning", bg: "status/warning-bg" };
    if (state === "Stale / Conflict") return { fg: "status/stale", bg: "status/stale-bg" };
    return { fg: "status/success", bg: "status/success-bg" };
  }
  function flow(parent, name, value, x, y, w, type = "Small", color = "text/primary") {
    const n = text(parent, name, value, x, y, w, type, color);
    return y + n.height;
  }
  function setInstanceText2(instance2, name, value) {
    const node = instance2.findAll((n) => n.type === "TEXT" && n.name === name)[0];
    if (node) node.characters = value;
  }
  function componentOrFallback(parent, source, variant, name, x, y, w, h, heading, meaning, detail, color) {
    const native3 = instantiate(parent, source, variant, name, x, y, w);
    if (native3) return native3;
    const fallback = box(parent, name, x, y, w, h, "surface/default", color, 8);
    flow(fallback, "Component heading", heading, 14, 14, w - 28, "Label", color);
    flow(fallback, "Component meaning", meaning, 14, 50, w - 28, "Body Strong");
    const bottom = flow(fallback, "Component detail", detail, 14, Math.min(106, h - 52), w - 28, "Small", "text/secondary");
    fallback.resize(w, Math.max(h, bottom + 16));
    return fallback;
  }
  function drawOrdersChrome(screen, title) {
    drawStaffChrome(screen, true);
    const nav = screen.children.find((n) => n.name === "Staff navigation");
    const conversations = nav.children.find((n) => n.name === "Primary / Conversations");
    const business = nav.children.find((n) => n.name === "Primary / Business");
    fill(conversations, "surface/default");
    conversations.strokes = [];
    conversations.children.filter((n) => n.name === "Active marker" || n.name === "Current state").forEach((n) => n.remove());
    fill(conversations.children.find((n) => n.name === "Primary label / Conversations"), "text/primary");
    fill(business, "surface/selected");
    stroke(business, "border/interactive");
    frame(business, "Active marker", 0, 5, 3, 26, "action/primary");
    fill(business.children.find((n) => n.name === "Primary label / Business"), "action/primary");
    text(business, "Current state", "\u2022", 184, 8, 16, "Small", "action/primary");
    const nested = nav.findAll((n) => n.type === "TEXT" && n.name === "Nested / Business / Orders")[0];
    fill(nested, "action/primary");
    nested.fontName = { family: "Inter", style: "Semi Bold" };
    frame(nav, "Orders active marker", 24, nested.y + 1, 3, 20, "action/primary");
    const header = screen.children.find((n) => n.name === "Page/context header");
    header.children.find((n) => n.name === "Breadcrumb/page context").characters = `Business  /  Orders  /  ${title}`;
    header.children.find((n) => n.name === "Current active area").characters = "Orders";
    header.resize(WORK_W, header.height);
    header.children.find((n) => n.name === "Header divider").resize(WORK_W, 1);
    return frame(screen, "Orders Workspace", 244, 72, WORK_W, 1, "surface/subtle");
  }
  function finishScreen(screen, main, height) {
    main.resize(WORK_W, Math.max(height, 820));
    screen.resize(SCREEN_W, main.y + main.height);
    const nav = screen.children.find((n) => n.name === "Staff navigation");
    nav.resize(nav.width, screen.height);
    nav.children.find((n) => n.name === "Navigation divider").resize(1, screen.height);
    nav.children.find((n) => n.name === "Account/session").y = screen.height - 80;
  }
  function filter(parent, name, label, value, x, w) {
    const control = box(parent, name, x, 88, w, 67, "surface/default", "border/interactive", 6);
    flow(control, "Persistent label", label, 12, 8, w - 24, "Label", "text/secondary");
    flow(control, "Visible value", value, 12, 31, w - 24, "Small");
  }
  function listRow(parent, y, reference, customer, order, reservation, updated, attention, selected = false) {
    const row = box(parent, `Order row / ${reference}`, 0, y, INNER_W, 76, selected ? "surface/selected" : "surface/default", selected ? "border/interactive" : "border/default", 8);
    if (selected) frame(row, "Selected row marker", 0, 7, 3, 62, "action/primary");
    flow(row, "Order reference", reference, 16, 14, 180, "Body Strong");
    flow(row, "Customer", customer, 211, 16, 186, "Small");
    const o = tone2(order), r = tone2(reservation);
    chip(row, "Order state", order, 412, 21, 210, o.fg, o.bg);
    chip(row, "Reservation state", reservation, 638, 21, 270, r.fg, r.bg);
    flow(row, "Updated", updated, 924, 17, 173, "Small", "text/secondary");
    flow(row, "Attention", attention, 1110, 12, 335, "Small", attention === "None" ? "text/secondary" : "status/warning");
  }
  function drawList2(screen) {
    const main = drawOrdersChrome(screen, "List");
    flow(main, "Page title", "Orders", 24, 24, 700, "Page Title");
    flow(main, "Page subtitle", "North Shop \xB7 inspect Order and Reservation as independent business facts", 24, 64, 1200, "Small", "text/secondary");
    const filters = frame(main, "Orders Filters", 24, 108, INNER_W, 173, "surface/subtle");
    flow(filters, "Filter heading", "FIND AN ORDER", 0, 4, 600, "Label", "text/secondary");
    filter(filters, "Search orders", "SEARCH ORDERS", "Order reference or customer", 0, 400);
    filter(filters, "Order-state filter", "ORDER STATE", "All Order states  \u25BE", 416, 300);
    filter(filters, "Reservation-state filter", "RESERVATION STATE", "All reservation states  \u25BE", 732, 350);
    filter(filters, "Attention filter", "NEEDS REVIEW", "All  \u25BE", 1098, 370);
    const table2 = frame(main, "Orders List", 24, 305, INNER_W, 1, "surface/subtle");
    flow(table2, "List heading", "Orders List \xB7 mixed states", 0, 0, 900, "Section Heading");
    flow(table2, "List explanation", "Each row keeps Order State and Reservation State separate. Select a row to inspect current facts.", 0, 35, 1400, "Small", "text/secondary");
    const header = box(table2, "Column headings", 0, 72, INNER_W, 37, "surface/default", "border/default", 6);
    for (const [name, x, w] of [["ORDER", 16, 180], ["CUSTOMER", 211, 186], ["ORDER STATE", 412, 210], ["RESERVATION STATE", 638, 270], ["UPDATED", 924, 173], ["ATTENTION", 1110, 335]])
      flow(header, `Column / ${name}`, name, x, 9, w, "Label", "text/secondary");
    listRow(table2, 121, "ORD-1042", "Amina S.", "Created", "Confirmed", "10:43 \xB7 current", "None", true);
    listRow(table2, 209, "ORD-1043", "Sample customer B.", "Created", "Failed \xB7 Known Failure", "10:43 \xB7 observed", "Review inventory");
    listRow(table2, 297, "ORD-1044", "Sample customer C.", "Created", "OUTCOME_UNKNOWN", "10:43 \xB7 pending", "Reconcile before retry");
    listRow(table2, 385, "ORD-1045", "Sample customer D.", "Needs Attention", "Known Failure", "10:47 \xB7 review", "Human attention");
    listRow(table2, 473, "ORD-1046", "Sample customer E.", "Stale / Conflict", "Confirmed", "10:43 \xB7 stale", "Refresh facts");
    flow(table2, "List safety note", "Search/filter is scoped to authorized records. A visible Order reference does not grant backend access.", 0, 566, 1380, "Caption", "text/secondary");
    table2.resize(INNER_W, 601);
    finishScreen(screen, main, table2.y + table2.height + 24);
  }
  function statePanel(main, name, spec, x, y) {
    const panel = box(main, name, x, y, 722, 265, "surface/default", "border/default", 8);
    const isOrder = name === "Order State";
    flow(panel, "State hierarchy label", isOrder ? "ORDER STATE \xB7 ORDER RECORD" : "RESERVATION STATE \xB7 STOCK HOLD", 16, 12, 690, "Label", "text/secondary");
    const state = isOrder ? spec.order : spec.reservation;
    const size = isOrder ? { h: 172, source: "Business / Order State" } : { h: 224, source: "Business / Reservation State" };
    const component = componentOrFallback(panel, size.source, `State=${state}`, `${name} component`, 16, 38, 310, size.h, name.toUpperCase(), state, isOrder ? "Order record exists or needs current review." : spec.reservationNote, tone2(state).fg);
    let end = flow(panel, "State explanation", isOrder ? spec.orderNote : spec.reservationNote, 350, 51, 350, "Body Strong");
    end = flow(panel, "State source", isOrder ? "Source: Order record \xB7 observed 10:43" : "Source: reservation result / operation evidence", 350, end + 15, 350, "Small", "text/secondary");
    panel.resize(722, Math.max(265, component.height + 54, end + 18));
    return panel;
  }
  function attentionPanel(main, kind, spec, y) {
    const p = box(main, "Attention and Safety", 24, y, INNER_W, 1, kind === "unknown" ? "status/unknown-bg" : kind === "e02" ? "status/restricted-bg" : kind === "stale" ? "status/stale-bg" : "surface/default", kind === "unknown" ? "status/unknown" : kind === "e02" ? "status/restricted" : "border/default", 8);
    if (kind === "e02") {
      const native3 = instantiate(p, "Business / E02 Restricted", void 0, "E02 Restricted component", 16, 16, 970);
      if (native3) {
        setInstanceText2(native3, "Requested change value", "Change Order ORD-1042 details");
        setInstanceText2(native3, "Known Order state value", "Created / verified in Order record");
      } else componentOrFallback(p, "Business / E02 Restricted", void 0, "E02 Restricted component", 16, 16, 970, 234, "E02 / AUTOMATIC ORDER UPDATE RESTRICTED", "Requested change: Order ORD-1042 details", "update_order unavailable \xB7 route to authorized human/policy handling.", "status/restricted");
      const boundaryEnd = flow(p, "E02 boundary", "Automatic update_order restricted. NOT Permission Denied. NOT Reservation Failure. NOT OUTCOME_UNKNOWN. No update executed.", 1008, 52, 420, "Body Strong", "status/restricted");
      const noteEnd = flow(p, "E02 policy note", "A visible action cannot bypass backend policy. No normal Update Order control is enabled.", 1008, boundaryEnd + 14, 420, "Small", "text/secondary");
      p.resize(INNER_W, Math.max(266, noteEnd + 18));
    } else {
      flow(p, "Attention heading", kind === "confirmed" ? "CURRENT BUSINESS EFFECT" : kind === "unknown" ? "RECONCILIATION REQUIRED" : kind === "stale" ? "STATE SAFETY / STALE" : "NEEDS REVIEW", 18, 16, 800, "Label", kind === "unknown" ? "status/unknown" : kind === "stale" ? "status/stale" : "text/secondary");
      const end = flow(p, "Attention meaning", spec.attention, 18, 45, INNER_W - 36, "Body Strong");
      p.resize(INNER_W, Math.max(100, end + 18));
    }
    return p;
  }
  function customerItemsFreshness(main, spec, y) {
    const customer = componentOrFallback(main, "Business / Customer Summary", void 0, "Customer Summary", 24, y, 470, 268, "CUSTOMER SUMMARY", "Amina S. \xB7 C-1042", "Verified in North Shop \xB7 Conversation C-42.", "status/success");
    const items = box(main, "Order Items", 24 + 470 + 29, y, 470, 268, "surface/default", "border/default", 8);
    flow(items, "Items heading", "ORDER ITEMS", 16, 14, 438, "Label", "text/secondary");
    flow(items, "Product", "Product \xB7 Desk Lamp", 16, 51, 438, "Body Strong");
    flow(items, "Variant", "Variant \xB7 Slate", 16, 84, 438, "Small");
    flow(items, "Quantity", "Quantity \xB7 1", 16, 115, 438, "Small");
    flow(items, "Catalog boundary", "Product record exists \u2260 inventory available.", 16, 158, 438, "Small", "status/info");
    flow(items, "Inventory boundary", "Stock requires current Inventory Status; unavailable \u2260 zero stock.", 16, 199, 438, "Small", "text/secondary");
    const fresh = box(main, "Freshness and Version", 24 + 2 * (470 + 29), y, 470, 268, "surface/default", "border/default", 8);
    const native3 = componentOrFallback(fresh, "Business / Freshness", `State=${spec.freshness}`, "Freshness component", 0, 0, 470, 150, "FRESHNESS", spec.freshness, "Refresh before consequential action when stale.", "status/stale");
    const v = flow(fresh, "Version note", spec.version, 16, native3.height + 16, 438, "Small", "text/secondary");
    fresh.resize(470, Math.max(268, v + 16));
    return y + Math.max(customer.height, items.height, fresh.height);
  }
  function deliveryPanel(main, kind, y) {
    const order = box(main, "Order Delivery", 24, y, 722, 242, "surface/default", "border/default", 8);
    flow(order, "Domain label", "ORDER DELIVERY \xB7 logistics / fulfillment", 16, 13, 680, "Label", "text/secondary");
    if (kind === "confirmed") {
      componentOrFallback(order, "Business / Order Delivery Status", "Example=In Transit", "Order Delivery Status component", 16, 44, 470, 153, "ORDER DELIVERY / DESIGN EXAMPLE", "In Transit \xB7 example only", "Provider status / observed 10:45.", "status/info");
      flow(order, "Order Delivery meaning", "Design/demo value only; not a frozen backend enum. Provider source and observed time govern the claim.", 502, 55, 202, "Small");
    } else {
      const empty = box(order, "No Order Delivery claim", 16, 44, 470, 153, "surface/subtle", "border/default", 8);
      flow(empty, "No claim label", "NO PROVIDER RESULT SHOWN", 14, 16, 442, "Label", "text/secondary");
      flow(empty, "No claim detail", "This scenario makes no claim about current logistics status.", 14, 59, 442, "Small");
      flow(order, "Order Delivery meaning", "Order Delivery comes from an authorized provider read; unavailable is not \u201Cnot shipped\u201D.", 502, 55, 202, "Small");
    }
    const message = box(main, "Message Delivery", 24 + 722 + GAP2, y, 722, 242, "surface/default", "border/default", 8);
    flow(message, "Domain label", "MESSAGE DELIVERY \xB7 customer communication", 16, 13, 680, "Label", "text/secondary");
    if (kind === "confirmed") {
      componentOrFallback(message, "Communication / Message Delivery Status", "State=Delivery Failed", "Message Delivery Status component", 16, 44, 310, 178, "MESSAGE DELIVERY", "Delivery Failed", "Recover communication only.", "status/error");
      flow(message, "Message Delivery meaning", "Customer message failed. Order remains created; Reservation remains confirmed. Retry communication only; never replay reserve_inventory.", 350, 58, 350, "Small");
    } else {
      const empty = box(message, "No Message Delivery claim", 16, 44, 310, 178, "surface/subtle", "border/default", 8);
      flow(empty, "No claim label", "NO MESSAGE RESULT SHOWN", 14, 16, 282, "Label", "text/secondary");
      flow(empty, "No claim detail", "No communication receipt is asserted in this state.", 14, 60, 282, "Small");
      flow(message, "Message Delivery meaning", "Message delivery is transport; it never changes the known Order or Reservation effect.", 350, 58, 350, "Small");
    }
    return y + Math.max(order.height, message.height);
  }
  function nextAndLinks(main, kind, spec, y) {
    const next = box(main, "Next Safe Step", 24, y, INNER_W, 1, "surface/default", "border/interactive", 8);
    flow(next, "Step heading", "NEXT SAFE STEP", 18, 14, 800, "Label", "action/primary");
    const detailEnd = flow(next, "Step explanation", spec.nextDetail, 18, 44, 1010, "Body Strong");
    button(next, "Primary safe action", spec.next, 1056, 30, 390, true);
    next.resize(INNER_W, Math.max(96, detailEnd + 18));
    const relatedY = y + next.height + GAP2;
    const related = box(main, "Related Work", 24, relatedY, INNER_W, 1, "surface/default", "border/default", 8);
    const conversation = box(related, "Related Conversation", 16, 43, 710, 111, "surface/subtle", "border/default", 8);
    flow(conversation, "Conversation reference", "RELATED CONVERSATION \xB7 C-42", 14, 12, 680, "Label", "text/secondary");
    flow(conversation, "Conversation status", "Amina S. \xB7 North Shop \xB7 customer communication context", 14, 37, 680, "Small");
    flow(conversation, "Conversation link", "Open Conversation C-42  \u2197", 14, 72, 680, "Small", "action/primary");
    const escalation = box(related, "Escalation Relationship", 742, 43, 710, 111, "surface/subtle", "border/default", 8);
    flow(escalation, "Escalation heading", "ATTENTION / ESCALATION", 14, 12, 680, "Label", "text/secondary");
    flow(escalation, "Escalation meaning", spec.escalation, 14, 37, 680, "Small");
    if (kind === "unknown" || kind === "attention" || kind === "e02") flow(escalation, "Escalation link", "Open Escalation ESC-204  \u2197", 14, 72, 680, "Small", "action/primary");
    related.resize(INNER_W, 170);
    flow(related, "Related heading", "RELATED RECORDS \xB7 scoped links recheck access", 16, 13, 1200, "Label", "text/secondary");
    const activityY = relatedY + related.height + GAP2;
    const activity = box(main, "Business Effect Activity", 24, activityY, INNER_W, 1, "surface/default", "border/default", 8);
    let cursor = flow(activity, "Activity heading", "BUSINESS EFFECT / ACTIVITY SUMMARY", 18, 14, INNER_W - 36, "Label", "text/secondary") + 12;
    for (const [i, item] of spec.activity.entries()) cursor = flow(activity, `Activity / ${i + 1}`, item, 18, cursor, INNER_W - 36, "Small") + 8;
    activity.resize(INNER_W, cursor + 12);
    return activityY + activity.height;
  }
  function drawDetail(screen, kind) {
    const spec = COPY[kind];
    const main = drawOrdersChrome(screen, "ORD-1042");
    flow(main, "Page title", "Order ORD-1042", 24, 24, 880, "Page Title");
    flow(main, "Page subtitle", "Amina S. \xB7 Desk Lamp / Slate \xB7 North Shop \xB7 authoritative Order and separate Reservation", 24, 65, 1390, "Small", "text/secondary");
    const stateY = 110;
    const order = statePanel(main, "Order State", spec, 24, stateY);
    const reservation = statePanel(main, "Reservation State", spec, 24 + 722 + GAP2, stateY);
    const attentionY = stateY + Math.max(order.height, reservation.height) + GAP2;
    const attention = attentionPanel(main, kind, spec, attentionY);
    const contextBottom = customerItemsFreshness(main, spec, attentionY + attention.height + GAP2);
    const deliveryBottom = deliveryPanel(main, kind, contextBottom + GAP2);
    const bottom = nextAndLinks(main, kind, spec, deliveryBottom + GAP2);
    finishScreen(screen, main, bottom + 24);
  }
  function buildOrders(page) {
    assertWritablePage(page.name);
    const escalations = page.children.find((n) => n.type === "FRAME" && n.name === SECTIONS2.escalations);
    const section = ensureSection(page, SECTIONS2.orders, 0, escalations ? escalations.y + escalations.height + 60 : 1e4, 3580, 1);
    const staged = [];
    try {
      let rowY = 86, rowHeight = 0;
      for (const [i, variant] of ORDER_VARIANTS.entries()) {
        if (i > 0 && i % 2 === 0) {
          rowY += rowHeight + 32;
          rowHeight = 0;
        }
        const screen = frame(section, `${orderName(variant.key)} / staging`, 24 + i % 2 * 1780, rowY, SCREEN_W, 900, "surface/default");
        staged.push(screen);
        if (variant.kind === "list") drawList2(screen);
        else drawDetail(screen, variant.kind);
        rowHeight = Math.max(rowHeight, screen.height);
      }
      section.resize(section.width, rowY + rowHeight + 24);
      replaceOwned(section, ORDERS_OWNED, staged);
      return [...ORDERS_OWNED];
    } catch (error) {
      staged.forEach((n) => n.remove());
      throw error;
    }
  }

  // src/builders/web-chat.ts
  var WIDTH2 = 414;
  var CONTENT2 = 390;
  var REQUIRED = [
    "Customer Message",
    "Business Reply",
    "Composer",
    "Clarification Request",
    "Confirmation Request",
    "Processing",
    "Confirmed Result",
    "Known Failure",
    "Waiting Human",
    "Confirmation Pending",
    "Delivery Failure"
  ];
  var messageCopy = {
    Initial: { reply: "Hello! How can we help you today?" },
    Active: { customer: "I would like one Desk Lamp in Slate.", reply: "I can help with your order, Amina." },
    Clarification: { customer: "I would like one Desk Lamp in Slate.", reply: "Which size would you like?" },
    "Confirmation Required": { customer: "One Desk Lamp in Slate, please.", reply: "Please review the details before placing your order." },
    Processing: { customer: "Please place my order.", reply: "We're checking your request." },
    "Confirmed Result": { customer: "Please place my order.", reply: "Your order update is ready." },
    "Known Failure": { customer: "Please place my order.", reply: "There is an update about your order." },
    "Waiting Human": { customer: "Could someone help me with this?", reply: "A person will review your request." },
    "Confirmation Pending": { customer: "Please place my order.", reply: "We are checking whether your request went through." },
    "Message Delivery Failure": { customer: "Can you send me the update?", reply: "Your order was created and the item was reserved." }
  };
  function instance(parent, component, variant, name, x, y) {
    const result = instantiate(parent, `Web Chat / ${component}`, variant, name, x, y, CONTENT2);
    if (!result) throw new Error(`Missing approved Phase 3C Web Chat component or variant: ${component}${variant ? ` / ${variant}` : ""}. Nothing was replaced.`);
    return result;
  }
  function overrideText(root, name, value) {
    const matches = root.findAll((n) => n.type === "TEXT" && n.name === name);
    if (matches.length !== 1) throw new Error(`Approved component ${root.name} is missing unique text ${name}. Nothing was replaced.`);
    matches[0].characters = value;
  }
  function drawMessage(history, source, y, value) {
    const name = source === "Customer Message" ? "Customer Message" : "Business Reply";
    const node = instance(history, source, void 0, name, 0, y);
    overrideText(node, source === "Customer Message" ? "Message content" : "Reply content", value);
  }
  function guidance(parent, name, value, minHeight, type) {
    const note2 = box(parent, name, 0, 0, CONTENT2, minHeight, "surface/default", "border/default", 8);
    const label = text(note2, name === "Conversation guidance" ? "Guidance" : "Context guidance", value, 15, 17, CONTENT2 - 30, type, type === "Small" ? "text/secondary" : "text/primary");
    note2.resize(CONTENT2, Math.max(minHeight, label.y + label.height + 17));
    return note2;
  }
  function drawScreen(section, variant, x, y) {
    const screen = frame(section, `${webChatName(variant.key)} / staging`, x, y, WIDTH2, 900, "surface/subtle");
    try {
      const header = box(screen, "Service Header", 0, 0, WIDTH2, 72, "surface/default", "border/default", 0);
      text(header, "Service identity", "North Shop", 18, 13, 268, "Section Heading");
      text(header, "Service subtitle", "Customer service", 18, 44, 268, "Caption", "text/secondary");
      const history = frame(screen, "Message History", 12, 88, CONTENT2, 1, "surface/subtle");
      const copy = messageCopy[variant.key];
      let nextY = 0;
      if (copy.customer) {
        drawMessage(history, "Customer Message", nextY, copy.customer);
        nextY += 165;
      }
      drawMessage(history, "Business Reply", nextY, copy.reply);
      if (variant.key === "Message Delivery Failure") {
        const reply = history.children.find((n) => n.name === "Business Reply");
        overrideText(reply, "Timestamp and delivery", "10:44 \xB7 Message not delivered");
      }
      history.resize(CONTENT2, nextY + 153);
      const stateY = history.y + history.height + 18;
      const state = frame(screen, "Customer State", 12, stateY, CONTENT2, 1, "surface/subtle");
      if (variant.component) {
        const card = instance(state, variant.component, void 0, `${variant.component} component`, 0, 0);
        if (variant.key === "Confirmation Required") overrideText(card, "Item details", "Desk Lamp / Slate");
        if (variant.key === "Confirmed Result" || variant.key === "Known Failure") overrideText(card, "Order reference", variant.key === "Known Failure" ? "Order ORD-1042 already exists." : "Order ORD-1042");
        if (variant.key === "Message Delivery Failure") overrideText(card, "State label", "MESSAGE DELIVERY FAILED");
        state.resize(CONTENT2, card.height);
      } else {
        const note2 = guidance(state, "Conversation guidance", variant.key === "Initial" ? "Ask us a question or tell us what you need." : "You can continue the conversation below.", 80, "Body");
        state.resize(CONTENT2, note2.height);
      }
      const composer = frame(screen, "Customer Composer", 12, stateY + state.height + 18, CONTENT2, 1, "surface/subtle");
      if (["Initial", "Active", "Confirmed Result", "Waiting Human"].includes(variant.key)) {
        const ready = instance(composer, "Composer", "State=Ready", "Composer / Ready", 40, 0);
        composer.resize(CONTENT2, ready.height);
      } else {
        const message = variant.key === "Confirmation Required" ? "Choose one of the clear actions above." : variant.key === "Clarification" ? "Send the requested detail above to continue." : variant.key === "Processing" ? "No further action is needed right now." : variant.key === "Known Failure" ? "Need help? Use the action above." : variant.key === "Confirmation Pending" ? "Please wait for confirmation or contact support." : "Retry the message only, or contact support.";
        const note2 = guidance(composer, "Action context", message, 64, "Small");
        composer.resize(CONTENT2, note2.height);
      }
      screen.resize(WIDTH2, composer.y + composer.height + 18);
      return screen;
    } catch (error) {
      screen.remove();
      throw error;
    }
  }
  function buildWebChat(page) {
    assertWritablePage(page.name);
    for (const name of REQUIRED) if (!componentAvailable(`Web Chat / ${name}`, name === "Composer" ? "State=Ready" : void 0, CONTENT2))
      throw new Error(`Missing approved Phase 3C Web Chat component: ${name}. Nothing was replaced.`);
    const orders = page.children.find((n) => n.name === SECTIONS2.orders && n.type === "FRAME");
    const section = ensureSection(page, SECTIONS2.webChat, 0, orders ? orders.y + orders.height + 32 : 0, 2260, 100);
    preflightOwned(section, WEB_CHAT_OWNED);
    const staged = [];
    try {
      let rowY = 76, rowHeight = 0;
      for (const [i, variant] of WEB_CHAT_VARIANTS.entries()) {
        if (i > 0 && i % 5 === 0) {
          rowY += rowHeight + 32;
          rowHeight = 0;
        }
        const screen = drawScreen(section, variant, 24 + i % 5 * 438, rowY);
        staged.push(screen);
        rowHeight = Math.max(rowHeight, screen.height);
      }
      section.resize(2260, rowY + rowHeight + 24);
      replaceOwned(section, WEB_CHAT_OWNED, staged);
      return [...WEB_CHAT_OWNED];
    } catch (error) {
      staged.forEach((n) => n.remove());
      throw error;
    }
  }

  // src/builders/analytics.ts
  var SCREEN_W2 = 1760;
  var WORK_W2 = SCREEN_W2 - 244;
  var INNER_W2 = WORK_W2 - 48;
  var COPY2 = {
    valid: { heading: "VALID HISTORICAL RESULT", explanation: "Observed confirmed-order counts for the selected past period.", chart: "All three example weeks have observed values. The ACTUAL line is continuous.", quality: "Complete coverage for this demo scope; source observed at 10:42." },
    empty: { heading: "VALID EMPTY", explanation: "The trusted query succeeded. No records for this period.", chart: "No chart is drawn: a valid empty result is not a source failure.", quality: "The source responded for the selected scope; no qualifying records were found." },
    incomplete: { heading: "INCOMPLETE DATA", explanation: "Some observed data is present, but one week is missing.", chart: "Week B has no available observation. The ACTUAL series has a visible gap, not a zero point.", quality: "Partial coverage: the observed counts are not a complete period total." },
    stale: { heading: "STALE DATA", explanation: "Historical observations remain visible, but the snapshot may be old.", chart: "The observed ACTUAL series remains continuous. Stale does not mean missing.", quality: "Source observed at 10:42. Refresh before a current operational decision." },
    unavailable: { heading: "DEPENDENCY UNAVAILABLE", explanation: "The trusted historical report source cannot currently return data.", chart: "No chart or substitute zero line is drawn while the source is unavailable.", quality: "No trusted result is available. Try again later or refresh the report." },
    denied: { heading: "PERMISSION DENIED", explanation: "You are not authorized to view this report.", chart: "Protected chart data is not shown.", quality: "Request authorized access. Visible navigation does not grant report access." }
  };
  function native(parent, component, variant, name, x, y, maxWidth) {
    const node = instantiate(parent, `Analytics / ${component}`, variant, name, x, y, maxWidth);
    if (!node) throw new Error(`Missing approved Phase 3C Analytics component or variant: ${component}${variant ? ` / ${variant}` : ""}. Nothing was replaced.`);
    return node;
  }
  function setText(instance2, name, value) {
    const matches = instance2.findAll((n) => n.type === "TEXT" && n.name === name);
    if (matches.length !== 1) throw new Error(`Analytics component ${instance2.name} lacks unique text ${name}. Nothing was replaced.`);
    matches[0].characters = value;
  }
  function action(parent, name, value, x, y, w, primary = false) {
    const button2 = box(parent, name, x, y, w, 44, primary ? "action/primary" : "surface/default", primary ? "action/primary" : "border/interactive", 6);
    const label = text(button2, "Action label", value, 14, 10, w - 28, "Small", primary ? "text/inverse" : "text/primary");
    button2.resize(w, Math.max(44, label.y + label.height + 10));
    return button2;
  }
  function note(parent, name, value, x, y, w, minHeight, tone3 = "text/secondary") {
    const card = box(parent, name, x, y, w, minHeight, "surface/subtle", "border/default", 8);
    const label = text(card, "Explanation", value, 16, 16, w - 32, "Body", tone3);
    card.resize(w, Math.max(minHeight, label.y + label.height + 16));
    return card;
  }
  function chrome(screen) {
    drawStaffChrome(screen, true);
    const nav = screen.children.find((n) => n.name === "Staff navigation");
    const conversations = nav.children.find((n) => n.name === "Primary / Conversations");
    const analytics = nav.children.find((n) => n.name === "Primary / Analytics");
    fill(conversations, "surface/default");
    conversations.strokes = [];
    conversations.children.filter((n) => n.name === "Active marker" || n.name === "Current state").forEach((n) => n.remove());
    fill(conversations.children.find((n) => n.name === "Primary label / Conversations"), "text/primary");
    fill(analytics, "surface/selected");
    stroke(analytics, "border/interactive");
    frame(analytics, "Active marker", 0, 5, 3, 26, "action/primary");
    fill(analytics.children.find((n) => n.name === "Primary label / Analytics"), "action/primary");
    text(analytics, "Current state", "\u2022", 184, 8, 16, "Small", "action/primary");
    nav.findAll((n) => n.type === "TEXT" && n.name === "Account / name")[0].characters = "A. Owner";
    nav.findAll((n) => n.type === "TEXT" && n.name === "Account / status")[0].characters = "Owner \xB7 Session active";
    const header = screen.children.find((n) => n.name === "Page/context header");
    header.children.find((n) => n.name === "Breadcrumb/page context").characters = "Analytics  /  Historical report";
    header.children.find((n) => n.name === "Current active area").characters = "Analytics";
    header.resize(WORK_W2, header.height);
    header.children.find((n) => n.name === "Header divider").resize(WORK_W2, 1);
    return frame(screen, "Analytics Workspace", 244, 72, WORK_W2, 1, "surface/subtle");
  }
  function reportControls(main, y) {
    const area = box(main, "Report Controls", 24, y, INNER_W2, 230, "surface/default", "border/default", 8);
    native(area, "Period Selector", "State=Focus", "Period Selector component", 16, 14, 470);
    const metric = frame(area, "Metric Select", 510, 14, 430, 142, "surface/default");
    const coreSelect = instantiate(metric, "Select", void 0, "Core Select component", 0, 0, 238);
    if (!coreSelect) throw new Error("Approved Phase 3C Core Select cannot be instantiated. Nothing was replaced.");
    setText(coreSelect, "Component name", "METRIC");
    setText(coreSelect, "Usage", "Observed measure");
    setText(coreSelect, "Persistent field label", "Metric");
    setText(coreSelect, "Example value or placeholder", "Confirmed orders  \u25BE");
    setText(coreSelect, "Helper text", "Count \xB7 demo report");
    text(metric, "Metric summary", "Confirmed orders (count)", 252, 48, 170, "Body Strong");
    const scope = box(area, "Business Scope", 964, 14, 488, 102, "surface/subtle", "border/default", 6);
    text(scope, "Scope label", "BUSINESS / DEMO SCOPE", 14, 11, 458, "Label", "text/secondary");
    text(scope, "Scope value", "North Shop \xB7 May \xB7 example values only", 14, 43, 458, "Body Strong");
    const request2 = action(area, "Request Report", "Request historical report", 964, 139, 488, true);
    const helper = text(area, "Report control note", "Selected metric, past period and monthly granularity are explicit. Report authorization is checked by the backend.", 510, request2.y + request2.height + 8, 942, "Small", "text/secondary");
    area.resize(INNER_W2, Math.max(230, 14 + 202 + 14, helper.y + helper.height + 16));
    return area;
  }
  function reportState(main, kind, y) {
    const area = box(main, "Report State", 24, y, INNER_W2, 190, "surface/default", "border/default", 8);
    if (kind === "valid") {
      const banner = box(area, "Valid result banner", 16, 8, 470, 173, "status/success-bg", "status/success", 8);
      text(banner, "State label", COPY2[kind].heading, 16, 17, 438, "Label", "status/success");
      text(banner, "State meaning", COPY2[kind].explanation, 16, 60, 438, "Body Strong");
      text(banner, "State source", "North Shop \xB7 May \xB7 demo report", 16, 125, 438, "Small", "text/secondary");
    } else native(area, kind === "empty" ? "Valid Empty" : kind === "incomplete" ? "Incomplete" : kind === "stale" ? "Stale" : kind === "unavailable" ? "Dependency Unavailable" : "Permission Denied", void 0, "Analytics State component", 16, 8, 470);
    const explanation = text(area, "State explanation", COPY2[kind].explanation, 510, 48, 910, "Body Strong");
    const qualifier = text(area, "Demo qualifier", "DESIGN EXAMPLE \xB7 not live business data", 510, Math.max(105, explanation.y + explanation.height + 16), 910, "Label", "text/secondary");
    area.resize(INNER_W2, Math.max(190, qualifier.y + qualifier.height + 16));
    return area;
  }
  function kpiSummary(main, kind, y) {
    const area = box(main, "KPI Summary", 24, y, INNER_W2, 260, "surface/default", "border/default", 8);
    text(area, "KPI heading", "OBSERVED HISTORICAL KPI", 16, 15, 600, "Section Heading");
    if (kind === "valid" || kind === "incomplete" || kind === "stale") {
      const kpi = native(area, "KPI", "Metric=Orders", "KPI component", 16, 43, 310);
      setText(kpi, "Metric name", kind === "incomplete" ? "Observed orders \xB7 partial" : "Confirmed orders");
      setText(kpi, "Observed value", kind === "incomplete" ? "14 observed" : "24");
      setText(kpi, "Unit", kind === "incomplete" ? "orders in available weeks" : "orders \xB7 count");
      setText(kpi, "Source and completeness", kind === "incomplete" ? "Source: demo report / partial / 10:42" : kind === "stale" ? "Source: demo report / stale / 10:42" : "Source: demo report / complete / 10:42");
      const interpretation = text(area, "KPI interpretation", kind === "incomplete" ? "Available weeks: 8 + 6 observed orders. This is NOT a complete May total." : kind === "stale" ? "24 observed orders in the historical snapshot; refresh before a current decision." : "24 observed confirmed orders across Week A, Week B and Week C.", 355, 77, 1070, "Body Strong");
      const basis = text(area, "KPI basis", "Demo counts only \xB7 not real business data \xB7 period: May", 355, Math.max(130, interpretation.y + interpretation.height + 16), 1070, "Small", "text/secondary");
      area.resize(INNER_W2, Math.max(260, basis.y + basis.height + 16));
    } else note(area, "No KPI result", kind === "empty" ? "No records for this period. No KPI value is presented for the valid empty query." : kind === "unavailable" ? "No trusted metric is available. An outage is not zero business activity." : "Protected metric values are not displayed.", 16, 52, INNER_W2 - 32, 145);
    return area;
  }
  function historicalChart(main, kind, y) {
    const area = box(main, "Historical Chart", 24, y, INNER_W2, 370, "surface/default", "border/default", 8);
    text(area, "Chart heading", "HISTORICAL CHART \xB7 ACTUAL ONLY", 16, 15, 1e3, "Section Heading");
    if (kind === "valid" || kind === "incomplete" || kind === "stale") {
      const variant = kind === "incomplete" ? "State=Missing-data Gap" : kind === "stale" ? "State=Stale Data" : "State=Valid Historical Data";
      const chart = native(area, "Historical Chart", variant, "Historical Chart component", 16, 56, 470);
      setText(chart, "Chart title", "Confirmed orders / demo");
      const context = note(area, "Chart reading", COPY2[kind].chart, 510, 56, 942, 264, kind === "incomplete" ? "status/warning" : kind === "stale" ? "status/stale" : "text/primary");
      const explanation = context.children.find((n) => n.name === "Explanation");
      const source = text(context, "Chart source", "Source: fictional historical report \xB7 period: May \xB7 unit: orders", 16, Math.max(215, explanation.y + explanation.height + 16), 890, "Small", "text/secondary");
      context.resize(context.width, Math.max(context.height, source.y + source.height + 16));
      area.resize(INNER_W2, Math.max(370, context.y + context.height + 16));
    } else note(area, "No chart result", COPY2[kind].chart, 16, 56, INNER_W2 - 32, 264, kind === "denied" ? "status/restricted" : "text/secondary");
    return area;
  }
  function table(main, kind, y) {
    const area = box(main, "Data Table", 24, y, INNER_W2, 490, "surface/default", "border/default", 8);
    text(area, "Table heading", "HISTORICAL DETAIL \xB7 MAY", 16, 15, 1e3, "Section Heading");
    if (kind === "valid" || kind === "incomplete" || kind === "stale") {
      const component = native(area, "Data Table", void 0, "Data Table component", 16, 46, 970);
      setText(component, "Table title", "Confirmed orders by week / demo");
      setText(component, "Table context", "May \xB7 orders (count) \xB7 demo report \xB7 observed 10:42");
      setText(component, "Column 3", "Source");
      const rows = component.findAll((n) => n.type === "FRAME" && /^Observed row [1-3]$/.test(n.name));
      if (rows.length !== 3) throw new Error("Approved Analytics Data Table rows changed. Nothing was replaced.");
      rows.forEach((row, i) => {
        const cells = row.findAll((n) => n.type === "TEXT" && (n.name === "Cell 2" || n.name === "Cell 3" || n.name === "Cell 4"));
        if (cells.length !== 3) throw new Error("Approved Analytics Data Table cells changed. Nothing was replaced.");
        cells.find((n) => n.name === "Cell 2").characters = kind === "incomplete" && i === 1 ? "\u2014" : ["8", "10", "6"][i];
        cells.find((n) => n.name === "Cell 3").characters = "Demo report";
        cells.find((n) => n.name === "Cell 4").characters = kind === "incomplete" && i === 1 ? "Missing" : "Complete";
      });
      setText(component, "Empty label", kind === "incomplete" ? "MISSING OBSERVATION" : kind === "stale" ? "STALE SNAPSHOT NOTE" : "DATA QUALITY NOTE");
      setText(component, "Empty meaning", kind === "incomplete" ? "Week B unavailable; a missing observation is not zero." : kind === "stale" ? "Values remain historical; refresh before a current decision." : "All three selected weeks have observed records.");
      setText(component, "Table note", kind === "incomplete" ? "Partial coverage: no complete May total is claimed." : kind === "stale" ? "Observed 10:42; source snapshot may no longer be current." : "Observed counts are fictional design examples, not live business data.");
      const reading = note(area, "Table reading", kind === "incomplete" ? "Week A: 8 \xB7 Week B: unavailable \xB7 Week C: 6. Do not infer a zero for Week B." : kind === "stale" ? "Week A: 8 \xB7 Week B: 10 \xB7 Week C: 6. These remain observed historical values." : "Week A: 8 \xB7 Week B: 10 \xB7 Week C: 6. Total: 24 observed confirmed orders.", 1010, 46, 442, 210);
      area.resize(INNER_W2, Math.max(490, reading.y + reading.height + 16));
    } else note(area, "No table result", kind === "empty" ? "Valid Empty \xB7 query succeeded \xB7 no records for this period. No rows or zero-filled cells are shown." : kind === "unavailable" ? "Report dependency unavailable \xB7 no trusted rows are returned. Retry when the source is available." : "Permission Denied \xB7 protected report rows are not disclosed. Request authorized access.", 16, 56, INNER_W2 - 32, 390, kind === "denied" ? "status/restricted" : "text/secondary");
    return area;
  }
  function dataQuality(main, kind, y) {
    const area = box(main, "Data Quality", 24, y, INNER_W2, 230, "surface/default", "border/default", 8);
    text(area, "Quality heading", "DATA QUALITY \xB7 FRESHNESS + COMPLETENESS", 16, 15, 1e3, "Section Heading");
    if (kind !== "denied") {
      native(area, "Freshness", kind === "stale" ? "State=Stale" : kind === "unavailable" ? "State=Requires Refresh" : "State=Current", "Freshness component", 16, 55, 470);
      native(area, "Completeness", kind === "incomplete" ? "State=Incomplete" : kind === "unavailable" ? "State=Unavailable" : "State=Complete", "Completeness component", 510, 55, 310);
      const explanation = text(area, "Quality explanation", COPY2[kind].quality, 850, 80, 590, "Body Strong");
      area.resize(INNER_W2, Math.max(230, explanation.y + explanation.height + 16));
    } else note(area, "Protected quality state", COPY2[kind].quality, 16, 58, INNER_W2 - 32, 130, "status/restricted");
    return area;
  }
  function forecastLink(main, y) {
    const area = box(main, "Forecast Contextual Link", 24, y, INNER_W2, 112, "surface/default", "border/default", 8);
    text(area, "Forecast boundary heading", "NEED FUTURE VALUES?", 16, 15, 780, "Label", "text/secondary");
    const boundary = text(area, "Forecast boundary", "Forecasts is a separate nested Analytics destination. This report contains observed history only.", 16, 49, 980, "Small");
    const open = action(area, "Open Forecasts", "Open Forecasts  \u2192", 1090, 31, 362);
    area.resize(INNER_W2, Math.max(112, boundary.y + boundary.height + 16, open.y + open.height + 16));
    return area;
  }
  function finish(screen, main, bottom) {
    main.resize(WORK_W2, bottom + 24);
    screen.resize(SCREEN_W2, main.y + main.height);
    const nav = screen.children.find((n) => n.name === "Staff navigation");
    nav.resize(nav.width, screen.height);
    nav.children.find((n) => n.name === "Navigation divider").resize(1, screen.height);
    nav.children.find((n) => n.name === "Account/session").y = screen.height - 80;
  }
  function drawScreen2(section, variant, x, y) {
    const screen = frame(section, `${analyticsName(variant.key)} / staging`, x, y, SCREEN_W2, 900, "surface/default");
    try {
      const main = chrome(screen);
      text(main, "Page title", "Analytics", 24, 22, 800, "Page Title");
      text(main, "Page subtitle", "Historical business performance \xB7 observed confirmed-order counts only", 24, 64, INNER_W2, "Small", "text/secondary");
      let cursor = 112;
      const controls = reportControls(main, cursor);
      cursor += controls.height + 24;
      const state = reportState(main, variant.kind, cursor);
      cursor += state.height + 24;
      const kpis = kpiSummary(main, variant.kind, cursor);
      cursor += kpis.height + 24;
      const chart = historicalChart(main, variant.kind, cursor);
      cursor += chart.height + 24;
      const details = table(main, variant.kind, cursor);
      cursor += details.height + 24;
      const quality = dataQuality(main, variant.kind, cursor);
      cursor += quality.height + 24;
      const link = forecastLink(main, cursor);
      finish(screen, main, link.y + link.height);
      return screen;
    } catch (error) {
      screen.remove();
      throw error;
    }
  }
  function buildAnalytics(page) {
    assertWritablePage(page.name);
    requireDesignAssets(ANALYTICS_ASSET_REQUIREMENTS);
    const webChat = page.children.find((n) => n.type === "FRAME" && n.name === SECTIONS2.webChat);
    const section = ensureSection(page, SECTIONS2.analytics, 0, webChat ? webChat.y + webChat.height + 32 : 3e4, 3580, 1);
    preflightOwned(section, ANALYTICS_OWNED);
    const staged = [];
    try {
      let rowY = 76, rowHeight = 0;
      for (const [i, variant] of ANALYTICS_VARIANTS.entries()) {
        if (i > 0 && i % 2 === 0) {
          rowY += rowHeight + 32;
          rowHeight = 0;
        }
        const screen = drawScreen2(section, variant, 24 + i % 2 * 1780, rowY);
        staged.push(screen);
        rowHeight = Math.max(rowHeight, screen.height);
      }
      section.resize(3580, rowY + rowHeight + 24);
      replaceOwned(section, ANALYTICS_OWNED, staged);
      return [...ANALYTICS_OWNED];
    } catch (error) {
      staged.forEach((n) => n.remove());
      throw error;
    }
  }

  // src/builders/forecasts.ts
  var SCREEN_W3 = 1760;
  var WORK_W3 = SCREEN_W3 - 244;
  var INNER_W3 = WORK_W3 - 48;
  var COPY3 = {
    "not-ready": {
      title: "MODEL_NOT_READY",
      meaning: "Validated forecast artifact is not ready. No prediction has been produced.",
      next: "Inspect Historical Analytics or wait for validated forecast capability.",
      history: "Authorized historical observations remain useful, but they are not a prediction."
    },
    insufficient: {
      title: "INSUFFICIENT HISTORY",
      meaning: "Some valid history exists, but it is not long enough for forecast eligibility. No prediction was produced.",
      next: "Gather or await sufficient valid history before requesting a forecast.",
      history: "Available observations may be reviewed; a short history is not an incomplete source."
    },
    incomplete: {
      title: "INCOMPLETE HISTORY",
      meaning: "Required historical observations are missing. This is a coverage issue, not merely a short series.",
      next: "Check and recover historical source coverage. Missing intervals are not zero.",
      history: "Coverage has gaps. Do not draw a continuous ACTUAL line across unknown intervals."
    },
    unsupported: {
      title: "UNSUPPORTED HORIZON",
      meaning: "The requested future span is not supported. No predicted value was produced.",
      next: "Choose an approved supported horizon; do not silently shorten the request.",
      history: "Historical observations can still be inspected independently of this rejected horizon."
    },
    unavailable: {
      title: "MODEL UNAVAILABLE",
      meaning: "A validated forecasting capability is conceptually required, but its model or service dependency is unavailable.",
      next: "Check availability and retry only when the dependency is restored; no zero forecast is substituted.",
      history: "Authorized ACTUAL history remains separate from the unavailable model dependency."
    },
    timeout: {
      title: "TIMEOUT",
      meaning: "The forecast request did not complete within its bound. There is no confirmed result.",
      next: "Check request status or use a bounded recovery path; no automatic retry is implied.",
      history: "Previously authorized historical observations are not a completed forecast result."
    },
    denied: {
      title: "PERMISSION DENIED",
      meaning: "The current principal cannot access this forecast.",
      next: "Request authorized access. Visible navigation does not grant backend access.",
      history: "Protected historical values, predicted values and provenance are not shown."
    }
  };
  function native2(parent, component, name, x, y, width) {
    const instance2 = instantiate(parent, component, void 0, name, x, y, width);
    if (!instance2) throw new Error(`Approved Phase 3C Forecast asset cannot be instantiated: Component / ${component}. Nothing was replaced.`);
    return instance2;
  }
  function setText2(instance2, name, value) {
    const matches = instance2.findAll((n) => n.type === "TEXT" && n.name === name);
    if (matches.length !== 1) throw new Error(`Forecast component ${instance2.name} lacks unique text ${name}. Nothing was replaced.`);
    matches[0].characters = value;
  }
  function setRequestField(instance2, label, value) {
    const fields = instance2.findAll((n) => n.type === "FRAME" && n.name === `Request field / ${label}`);
    if (fields.length !== 1) throw new Error(`Forecast Request Summary lacks ${label}. Nothing was replaced.`);
    const values = fields[0].findAll((n) => n.type === "TEXT" && n.name === "Field value");
    if (values.length !== 1) throw new Error(`Forecast Request Summary lacks a unique ${label} value. Nothing was replaced.`);
    values[0].characters = value;
  }
  function explanatoryCard(parent, name, value, x, y, w, minH, tone3 = "text/secondary") {
    const card = box(parent, name, x, y, w, minH, "surface/subtle", "border/default", 8);
    const label = text(card, "Explanation", value, 16, 16, w - 32, "Body", tone3);
    card.resize(w, Math.max(minH, label.y + label.height + 16));
    return card;
  }
  function growToChildren(area) {
    const bottom = Math.max(...area.children.filter((n) => "height" in n).map((n) => n.y + n.height + 16));
    area.resize(area.width, Math.max(area.height, bottom));
  }
  function chrome2(canvas) {
    drawStaffChrome(canvas, true);
    const nav = canvas.children.find((n) => n.name === "Staff navigation");
    const conversations = nav.children.find((n) => n.name === "Primary / Conversations");
    const analytics = nav.children.find((n) => n.name === "Primary / Analytics");
    fill(conversations, "surface/default");
    conversations.strokes = [];
    conversations.children.filter((n) => n.name === "Active marker" || n.name === "Current state").forEach((n) => n.remove());
    fill(conversations.children.find((n) => n.name === "Primary label / Conversations"), "text/primary");
    fill(analytics, "surface/selected");
    stroke(analytics, "border/interactive");
    frame(analytics, "Active marker", 0, 5, 3, 26, "action/primary");
    fill(analytics.children.find((n) => n.name === "Primary label / Analytics"), "action/primary");
    const forecastLink2 = nav.findAll((n) => n.type === "TEXT" && n.name === "Nested / Analytics / Forecasts")[0];
    fill(forecastLink2, "action/primary");
    frame(nav, "Forecasts nested active marker", 25, forecastLink2.y + 2, 3, 18, "action/primary");
    nav.findAll((n) => n.type === "TEXT" && n.name === "Account / name")[0].characters = "A. Owner";
    nav.findAll((n) => n.type === "TEXT" && n.name === "Account / status")[0].characters = "Owner \xB7 Session active";
    const header = canvas.children.find((n) => n.name === "Page/context header");
    header.children.find((n) => n.name === "Breadcrumb/page context").characters = "Analytics  /  Forecasts";
    header.children.find((n) => n.name === "Current active area").characters = "Forecasts";
    header.resize(WORK_W3, header.height);
    header.children.find((n) => n.name === "Header divider").resize(WORK_W3, 1);
    return frame(canvas, "Forecast Workspace", 244, 72, WORK_W3, 1, "surface/subtle");
  }
  function request(main, kind, y) {
    const area = box(main, "Forecast Request Summary", 24, y, INNER_W3, 492, "surface/default", "border/default", 8);
    text(area, "Region heading", "FORECAST REQUEST \xB7 input facts, not a produced result", 16, 14, 1380, "Section Heading");
    const summary = native2(area, FORECAST_ASSETS.request, "Request Summary component", 16, 53, 970);
    setText2(summary, "Target annotation", kind === "ready" ? "TARGET PRODUCT UX / illustrative request only" : "FORECAST REQUEST / no prediction produced");
    setRequestField(summary, "TARGET", kind === "denied" ? "Protected target / not displayed" : "Confirmed-order units / DESIGN EXAMPLE");
    setRequestField(summary, "SCOPE", kind === "denied" ? "Restricted scope" : "North Shop / demo business");
    setRequestField(summary, "CUTOFF", kind === "denied" ? "Not disclosed" : "Last observed point / illustrative");
    setRequestField(summary, "HORIZON", kind === "denied" ? "Not disclosed" : "Requested future span / validate");
    setText2(summary, "Eligibility", kind === "ready" ? "TARGET only: check permission, data, horizon and validated model before execution." : "No forecast result is available in this specimen; validate scope and capability.");
    const side = explanatoryCard(area, "Capability guidance", kind === "not-ready" ? "CURRENT ENGINEERING STATE: M13 has no validated artifact. Request inputs do not imply a forecast run." : kind === "ready" ? "TARGET PRODUCT UX: this is an illustrative request. No real model output, ForecastRun or approved horizon is asserted." : "Conditional design state. Target, horizon and capability must be validated before any real result.", 1006, 53, 446, 212, kind === "not-ready" ? "status/model-not-ready" : "text/secondary");
    const target = native2(area, FORECAST_ASSETS.target, "Target component", 16, 284, 310);
    setText2(target, "Value", kind === "denied" ? "Not displayed" : "Confirmed-order units / demo");
    setText2(target, "Rule", kind === "denied" ? "Authorization required." : "Illustrative measure \xB7 unit: orders.");
    setText2(target, "Scope", kind === "denied" ? "Protected business scope." : "North Shop / fictional scope.");
    native2(area, FORECAST_ASSETS.cutoff, "Cutoff component", 346, 284, 310);
    const horizon = native2(area, FORECAST_ASSETS.horizon, "Horizon component", 676, 284, 310);
    setText2(horizon, "Requested span", kind === "denied" ? "Not displayed" : "Future span / illustrative");
    setText2(horizon, "Eligibility", kind === "unsupported" ? "Unsupported / choose approved span." : "Validate before request.");
    explanatoryCard(area, "Request boundary", "CUTOFF = last observed historical point. PREDICTED begins only after that boundary and only after an eligible validated run.", 1006, Math.max(284, side.y + side.height + 18), 446, 185);
    growToChildren(area);
    return area;
  }
  function availability(main, kind, y) {
    const tall = kind === "not-ready";
    const area = box(main, "Availability State", 24, y, INNER_W3, tall ? 412 : 278, "surface/default", "border/default", 8);
    text(area, "Region heading", "AVAILABILITY / CAPABILITY STATE", 16, 15, 1200, "Section Heading");
    if (kind === "ready") {
      const ready = box(area, "TARGET Ready availability", 16, 53, 1436, 180, "status/pending-bg", "status/pending", 8);
      text(ready, "State label", "TARGET PRODUCT UX \xB7 conditional ready composition", 16, 17, 1380, "Body Strong", "status/pending");
      text(ready, "State meaning", "A ready result requires eligibility, a validated artifact, authorized data and a real completed run. None is asserted here.", 16, 67, 1380, "Body");
      text(ready, "Current boundary", "CURRENT ENGINEERING STATE: MODEL_NOT_READY. The result below is a design example only.", 16, 126, 1380, "Small", "status/model-not-ready");
    } else if (kind === "not-ready") {
      native2(area, FORECAST_ASSETS.notReady, "MODEL_NOT_READY component", 16, 53, 970);
      explanatoryCard(area, "Current safe path", `${COPY3[kind].meaning}

${COPY3[kind].next}`, 1006, 53, 446, 331, "status/model-not-ready");
    } else {
      const asset = {
        insufficient: FORECAST_ASSETS.insufficient,
        incomplete: FORECAST_ASSETS.incomplete,
        unsupported: FORECAST_ASSETS.unsupported,
        unavailable: FORECAST_ASSETS.unavailable,
        timeout: FORECAST_ASSETS.timeout,
        denied: FORECAST_ASSETS.denied
      }[kind];
      native2(area, asset, `${COPY3[kind].title} component`, 16, 53, 470);
      explanatoryCard(area, "State explanation", `${COPY3[kind].meaning}

NEXT SAFE STEP
${COPY3[kind].next}`, 510, 53, 942, 204);
    }
    growToChildren(area);
    return area;
  }
  function historical(main, kind, y) {
    const area = box(main, "Historical Context", 24, y, INNER_W3, 248, "surface/default", "border/default", 8);
    text(area, "Region heading", "HISTORICAL CONTEXT \xB7 ACTUAL is observed, never predicted", 16, 15, 1380, "Section Heading");
    if (kind !== "denied" && kind !== "incomplete") native2(area, FORECAST_ASSETS.actual, "Actual Series component", 16, 55, 470);
    else explanatoryCard(area, kind === "denied" ? "Protected history" : "Incomplete history gap", kind === "denied" ? "Protected historical observations are not displayed without forecast and data authorization." : "Required observations are missing. A gap is not zero and is not drawn as a continuous line.", 16, 55, 470, 157, kind === "denied" ? "status/restricted" : "status/stale");
    const meaning = kind === "ready" ? "Illustrative ACTUAL history ends at the marked cutoff. This is not live business data." : COPY3[kind].history;
    explanatoryCard(area, "Historical reading", `${meaning} ACTUAL is not a prediction.

Open Historical Analytics for authorized observed reports; this Forecast surface does not replace them.`, 510, 55, 942, 157);
    growToChildren(area);
    return area;
  }
  function forecastResult(main, kind, y) {
    const area = box(main, "Forecast Result", 24, y, INNER_W3, kind === "ready" ? 730 : 252, "surface/default", "border/default", 8);
    text(area, "Region heading", kind === "ready" ? "TARGET RESULT \xB7 ACTUAL \u2192 CUTOFF \u2192 PREDICTED" : "FORECAST RESULT \xB7 no prediction produced", 16, 15, 1390, "Section Heading");
    if (kind === "ready") {
      native2(area, FORECAST_ASSETS.chart, "Actual vs Predicted Chart component", 16, 53, 970);
      native2(area, FORECAST_ASSETS.predicted, "Predicted Series component", 998, 53, 470);
      explanatoryCard(area, "Series reading", "ACTUAL = solid, observed, before cutoff. CUTOFF = last observed point. PREDICTED = dashed, future-only, illustrative TARGET UX. No numeric prediction is claimed.", 1006, 234, 446, 205);
      native2(area, FORECAST_ASSETS.result, "Result component", 16, 492, 970);
      explanatoryCard(area, "Result evidence boundary", "A production result would need a real validated run and provenance. This specimen intentionally has no forecast values, intervals, run ID, artifact version or generated timestamp.", 1006, 492, 446, 212, "status/pending");
    } else {
      const card = box(area, "No prediction result", 16, 53, 1436, 168, kind === "denied" ? "status/restricted-bg" : "surface/subtle", kind === "denied" ? "status/restricted" : "border/default", 8);
      text(card, "Result label", `${COPY3[kind].title} \xB7 NO PREDICTION PRODUCED`, 16, 18, 1390, "Body Strong", kind === "denied" ? "status/restricted" : "text/primary");
      const meaning = text(card, "Result meaning", kind === "timeout" ? "The request has no confirmed result. Do not present a stale or partial prediction as complete." : kind === "not-ready" ? "No validated forecast artifact exists in the current engineering state. This is not a zero or valid-empty forecast." : COPY3[kind].meaning, 16, 65, 1390, "Body");
      const next = text(card, "Result next step", COPY3[kind].next, 16, Math.max(122, meaning.y + meaning.height + 12), 1390, "Small", "text/secondary");
      card.resize(card.width, Math.max(card.height, next.y + next.height + 16));
    }
    growToChildren(area);
    return area;
  }
  function evidence(main, kind, y) {
    const area = box(main, "Provenance and Limitations", 24, y, INNER_W3, kind === "ready" ? 322 : 176, "surface/default", "border/default", 8);
    text(area, "Region heading", "PROVENANCE / LIMITATIONS", 16, 14, 1380, "Section Heading");
    if (kind === "ready") {
      const provenance = native2(area, FORECAST_ASSETS.provenance, "Provenance component", 16, 54, 470);
      setText2(provenance, "Source", "Data source: [authorized history, illustrative]");
      setText2(provenance, "Run reference", "Forecast run: [real run only]");
      setText2(provenance, "Model reference", "Validated artifact: [real evidence only]");
      setText2(provenance, "Cutoff", "Cutoff: [last observed point]");
      setText2(provenance, "Time", "Generated time: [real run only]");
      native2(area, FORECAST_ASSETS.limitations, "Limitations component", 510, 54, 470);
      explanatoryCard(area, "Evidence note", "These fields are placeholders for TARGET PRODUCT UX. No model version, dataset hash, confidence interval, prediction accuracy or ForecastRun is being claimed.", 1006, 54, 446, 246, "status/pending");
    } else explanatoryCard(area, "No run provenance", kind === "denied" ? "Protected forecast result and provenance are not disclosed. Request authorized access." : "No completed forecast result exists in this state. Do not invent a run reference, model version or generated time.", 16, 54, 1436, 98);
    growToChildren(area);
    return area;
  }
  function returnLink(main, y) {
    const area = box(main, "Historical Analytics Return", 24, y, INNER_W3, 122, "surface/default", "border/default", 8);
    text(area, "Return heading", "RELATED, NOT INTERCHANGEABLE", 16, 15, 700, "Label", "text/secondary");
    const explanation = text(area, "Return explanation", "Forecasts is nested under Analytics. Historical Analytics shows observed reports; forecast capability and permissions are checked separately.", 16, 52, 1e3, "Small");
    const action2 = box(area, "Open Historical Analytics", 1090, 32, 362, 48, "surface/selected", "border/interactive", 6);
    stroke(action2, "focus/ring");
    action2.strokeWeight = 2;
    const label = text(action2, "Action label", "Open Historical Analytics  \u2192", 14, 12, 334, "Small", "action/primary");
    action2.resize(action2.width, Math.max(48, label.y + label.height + 12));
    area.resize(INNER_W3, Math.max(122, action2.y + action2.height + 16, explanation.y + explanation.height + 16));
    return area;
  }
  function finish2(board, canvas, main, bottom) {
    main.resize(WORK_W3, bottom + 24);
    canvas.resize(SCREEN_W3, main.y + main.height);
    const nav = canvas.children.find((n) => n.name === "Staff navigation");
    nav.resize(nav.width, canvas.height);
    nav.children.find((n) => n.name === "Navigation divider").resize(1, canvas.height);
    nav.children.find((n) => n.name === "Account/session").y = canvas.height - 80;
    board.resize(SCREEN_W3, canvas.y + canvas.height + 12);
  }
  function drawScreen3(section, variant, x, y) {
    const board = frame(section, `${forecastName(variant.key)} / staging`, x, y, SCREEN_W3, 900, "surface/subtle");
    try {
      text(board, "Specimen annotation", variant.kind === "not-ready" ? "CURRENT ENGINEERING STATE \xB7 MODEL_NOT_READY \xB7 no forecast artifact or prediction" : "TARGET PRODUCT UX \xB7 conditional design example \xB7 not current system output", 24, 11, 1700, "Label", variant.kind === "not-ready" ? "status/model-not-ready" : "status/pending");
      const canvas = frame(board, "Staff Screen", 0, 44, SCREEN_W3, 900, "surface/default");
      const main = chrome2(canvas);
      text(main, "Page title", "Forecasts", 24, 22, 850, "Page Title");
      text(main, "Page subtitle", variant.kind === "not-ready" ? "Current capability: no validated forecast artifact \xB7 historical reports remain separate" : variant.kind === "ready" ? "Illustrative future sales outlook \xB7 TARGET design, not a current forecast" : "Conditional forecast state \xB7 no prediction produced", 24, 66, INNER_W3, "Small", "text/secondary");
      let cursor = 112;
      for (const build of [request, availability, historical, forecastResult, evidence]) {
        const region = build(main, variant.kind, cursor);
        cursor += region.height + 24;
      }
      const link = returnLink(main, cursor);
      finish2(board, canvas, main, link.y + link.height);
      return board;
    } catch (error) {
      board.remove();
      throw error;
    }
  }
  function buildForecasts(page) {
    assertWritablePage(page.name);
    requireDesignAssets(FORECAST_ASSET_REQUIREMENTS);
    const analytics = page.children.find((n) => n.type === "FRAME" && n.name === SECTIONS2.analytics);
    const section = ensureSection(page, SECTIONS2.forecasts, 0, analytics ? analytics.y + analytics.height + 32 : 42e3, 3580, 1);
    preflightOwned(section, FORECASTS_OWNED);
    const staged = [];
    try {
      let rowY = 76, rowHeight = 0;
      for (const [i, variant] of FORECAST_VARIANTS.entries()) {
        if (i > 0 && i % 2 === 0) {
          rowY += rowHeight + 32;
          rowHeight = 0;
        }
        const screen = drawScreen3(section, variant, 24 + i % 2 * 1780, rowY);
        staged.push(screen);
        rowHeight = Math.max(rowHeight, screen.height);
      }
      section.resize(3580, rowY + rowHeight + 24);
      replaceOwned(section, FORECASTS_OWNED, staged);
      return [...FORECASTS_OWNED];
    } catch (error) {
      staged.forEach((n) => n.remove());
      throw error;
    }
  }

  // src/inspectors/phase3d.ts
  async function inspectPhase3D() {
    const page = await readPage();
    const designSystem = await inspectDesignSystem();
    const shell = page ? exactFrame(page, SECTIONS2.shell) : void 0;
    const conversations = page ? exactFrame(page, SECTIONS2.conversations) : void 0;
    const escalations = page ? exactFrame(page, SECTIONS2.escalations) : void 0;
    const orders = page ? exactFrame(page, SECTIONS2.orders) : void 0;
    const webChat = page ? exactFrame(page, SECTIONS2.webChat) : void 0;
    const analytics = page ? exactFrame(page, SECTIONS2.analytics) : void 0;
    const forecasts = page ? exactFrame(page, SECTIONS2.forecasts) : void 0;
    const names = conversations ? conversations.children.filter((n) => n.type === "FRAME").map((n) => n.name) : [];
    const escalationNames = escalations ? escalations.children.filter((n) => n.type === "FRAME").map((n) => n.name) : [];
    const orderNames = orders ? orders.children.filter((n) => n.type === "FRAME").map((n) => n.name) : [];
    const webChatNames = webChat ? webChat.children.filter((n) => n.type === "FRAME").map((n) => n.name) : [];
    const analyticsNames = analytics ? analytics.children.filter((n) => n.type === "FRAME").map((n) => n.name) : [];
    const forecastNames = forecasts ? forecasts.children.filter((n) => n.type === "FRAME").map((n) => n.name) : [];
    return {
      pageExists: Boolean(page),
      shellExists: Boolean(shell?.children.some((n) => n.type === "FRAME" && n.name === SHELL_NAME)),
      conversationCount: VARIANTS.filter((v) => names.includes(conversationName(v.key))).length,
      missingVariants: VARIANTS.filter((v) => !names.includes(conversationName(v.key))).map((v) => v.key),
      escalationCount: ESCALATION_VARIANTS.filter((v) => escalationNames.includes(escalationName(v.key))).length,
      missingEscalations: ESCALATION_VARIANTS.filter((v) => !escalationNames.includes(escalationName(v.key))).map((v) => v.key),
      orderCount: ORDER_VARIANTS.filter((v) => orderNames.includes(orderName(v.key))).length,
      missingOrders: ORDER_VARIANTS.filter((v) => !orderNames.includes(orderName(v.key))).map((v) => v.key),
      webChatCount: WEB_CHAT_VARIANTS.filter((v) => webChatNames.includes(webChatName(v.key))).length,
      missingWebChat: WEB_CHAT_VARIANTS.filter((v) => !webChatNames.includes(webChatName(v.key))).map((v) => v.key),
      analyticsCount: ANALYTICS_VARIANTS.filter((v) => analyticsNames.includes(analyticsName(v.key))).length,
      missingAnalytics: ANALYTICS_VARIANTS.filter((v) => !analyticsNames.includes(analyticsName(v.key))).map((v) => v.key),
      forecastCount: FORECAST_VARIANTS.filter((v) => forecastNames.includes(forecastName(v.key))).length,
      missingForecasts: FORECAST_VARIANTS.filter((v) => !forecastNames.includes(forecastName(v.key))).map((v) => v.key),
      designSystem
    };
  }
  function formatInspection(result) {
    const found = result.designSystem.components.filter((c) => c.found).map((c) => c.name);
    return [
      "PHASE 3D INSPECTION \xB7 READ ONLY",
      `03D page: ${result.pageExists ? "EXISTS" : "MISSING"}`,
      `Shared Shell: ${result.shellExists ? "EXISTS" : "MISSING"}`,
      `Conversations variants: ${result.conversationCount}/${VARIANTS.length}`,
      `Escalations variants: ${result.escalationCount}/${ESCALATION_VARIANTS.length}`,
      `Orders variants: ${result.orderCount}/${ORDER_VARIANTS.length}`,
      `Customer Web Chat variants: ${result.webChatCount}/${WEB_CHAT_VARIANTS.length}`,
      `Analytics variants: ${result.analyticsCount}/${ANALYTICS_VARIANTS.length}`,
      `Forecasts variants: ${result.forecastCount}/${FORECAST_VARIANTS.length}`,
      `Phase 3C Design System: ${result.designSystem.pageExists ? "ACCESSIBLE" : "MISSING"}`,
      `Phase 3C relevant components found (${found.length}): ${found.join(", ") || "none"}`,
      `Missing variants: ${result.missingVariants.join(", ") || "none"}`,
      `Missing Escalations: ${result.missingEscalations.join(", ") || "none"}`,
      `Missing Orders: ${result.missingOrders.join(", ") || "none"}`,
      `Missing Customer Web Chat: ${result.missingWebChat.join(", ") || "none"}`,
      `Missing Analytics: ${result.missingAnalytics.join(", ") || "none"}`,
      `Missing Forecasts: ${result.missingForecasts.join(", ") || "none"}`,
      `Asset gaps: ${result.designSystem.gaps.join(", ") || "none"}`
    ].join("\n");
  }
  function formatAssets(report) {
    const analytics = report.components.filter((c) => c.canonicalName.startsWith("Component / Analytics / "));
    const forecasts = report.components.filter((c) => c.canonicalName.startsWith("Component / Forecast / "));
    return [
      "PHASE 3C ASSET INSPECTION \xB7 READ ONLY",
      `Design System page: ${report.pageExists ? "ACCESSIBLE" : "MISSING"}`,
      `Semantic color variables: ${report.variables}`,
      ...report.components.map((c) => `${c.status} \xB7 ${c.canonicalName}${c.type ? ` (${c.type})` : ""} \xB7 active matches: ${c.count} \xB7 section: ${c.section}`),
      "ANALYTICS DESIGN SYSTEM ASSETS \xB7 canonical sections, read only",
      ...analytics.flatMap((c) => [
        `${c.canonicalName}: ${c.status}; section=${c.section}; active matches=${c.count}`,
        ...c.sectionMatches.map((m) => `- source section: type=${m.type}; id=${m.id}; path=${m.path}`),
        ...c.matches.map((m) => `- active source: type=${m.type}; id=${m.id}; path=${m.path}`),
        `- archived matches: ${c.archivedMatches.length} (ignored for generation)`,
        ...c.archivedMatches.map((m) => `  - archived: type=${m.type}; id=${m.id}; path=${m.path}`)
      ]),
      "FORECAST DESIGN SYSTEM ASSETS \xB7 canonical section, read only",
      ...forecasts.flatMap((c) => [
        `${c.canonicalName}: ${c.status}; section=${c.section}; active matches=${c.count}`,
        ...c.matches.map((m) => `- active source: type=${m.type}; id=${m.id}; path=${m.path}`),
        `- archived matches: ${c.archivedMatches.length} (ignored for generation)`,
        ...c.archivedMatches.map((m) => `  - archived: type=${m.type}; id=${m.id}; path=${m.path}`)
      ]),
      ...report.treatments.map((t) => `${t.found ? "FOUND" : "MISSING"} \xB7 ${t.name} treatment`),
      `Gaps: ${report.gaps.join(", ") || "none"}`
    ].join("\n");
  }

  // src/validators/phase3d.ts
  var check = (label, pass, detail) => ({ label, pass, detail });
  var hasNamed = (root, name) => root.findAll((n) => n.name === name).length > 0;
  var hasText = (root, pattern) => allText(root).includes(pattern);
  var namedFrame = (root, name) => root.findAll((n) => n.type === "FRAME" && n.name === name)[0];
  var inside = (child, parent) => [child.x, child.y, child.width, child.height].every(Number.isFinite) && child.x >= 0 && child.y >= 0 && child.width > 0 && child.height > 0 && child.x + child.width <= parent.width + 1 && child.y + child.height <= parent.height + 1;
  var intersects = (a, b) => a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
  function resultComposition(screen, name) {
    const workspace = screen && namedFrame(screen, "Conversation Workspace");
    if (!workspace) return { unique: false, fits: false };
    const matches = workspace.children.filter((n) => n.name === name);
    const region = matches.length === 1 && matches[0].type === "FRAME" ? matches[0] : void 0;
    const semanticFrames = workspace.findAll((n) => (n.type === "FRAME" || n.type === "INSTANCE") && (["Business Action Result", "Delivery State", "Authoritative result", "Business Effect", "Communication", "Known Failure", "Confirmed Business Result", "OUTCOME_UNKNOWN", "Business-result message"].includes(n.name) || n.name.includes("Action Result")));
    const unique = Boolean(region && semanticFrames.length === 1 && semanticFrames[0] === region);
    if (!unique || !region) return { unique, fits: false };
    const children = region.children;
    const composer = workspace.children.find((n) => n.type === "FRAME" && n.name === "Composer");
    const fits5 = inside(region, workspace) && children.length > 0 && children.every((n) => n.type === "TEXT" && n.textAutoResize === "HEIGHT" && inside(n, region)) && children.every((a, i) => children.slice(i + 1).every((b) => !intersects(a, b))) && workspace.children.filter((n) => n !== region && (n.type === "FRAME" || n.type === "INSTANCE")).every((n) => !intersects(region, n)) && Boolean(composer && inside(composer, workspace) && composer.y >= region.y + region.height + 12);
    return { unique, fits: fits5 };
  }
  function validateSharedShell(page) {
    const section = page ? exactFrame(page, SECTIONS2.shell) : void 0;
    const shell = section ? exactFrame(section, SHELL_NAME) : void 0;
    const checks = [check("03D page", Boolean(page && page.name === TARGET_PAGE)), check("Shared Shell frame", Boolean(shell))];
    if (shell) {
      checks.push(check("Staff navigation", hasNamed(shell, "Staff navigation")));
      for (const name of NAV_PRIMARY) checks.push(check(`Primary / ${name}`, hasNamed(shell, `Primary / ${name}`)));
      checks.push(check("Conversations active", hasNamed(shell, "Current state") && hasNamed(shell, "Primary / Conversations")));
      checks.push(check("Business Context", hasNamed(shell, "Business Context")));
      checks.push(check("Breadcrumb/page context", hasNamed(shell, "Breadcrumb/page context")));
      checks.push(check("Account/session", hasNamed(shell, "Account/session")));
      checks.push(check("Main content region", hasNamed(shell, "Main content region")));
      for (const [destination, marker] of [["Audit", "Restricted / permissioned"], ["Agent Runs", "Contextual / restricted"]]) {
        const row = shell.findAll((n) => n.type === "FRAME" && n.name === `Restricted link / Administration / ${destination}`)[0];
        checks.push(check(`${destination} restricted/contextual navigation`, Boolean(row && hasNamed(row, `Access marker / ${destination}`) && allText(row).includes(marker) && !allText(row).includes("Disabled"))));
      }
      checks.push(check("Sidebar business switch / header indicator", hasText(shell, "BUSINESS SWITCH") && hasText(shell, "CURRENT BUSINESS") && hasText(shell, "North Shop")));
      checks.push(check("Backend authorization explanation", hasText(shell, "Visible navigation does not grant backend access.")));
      checks.push(check("No prohibited architecture navigation", PROHIBITED_NAV.every((n) => !hasNamed(shell, `Primary / ${n}`))));
    }
    return { section: "Shared Shell", checks, pass: checks.every((c) => c.pass) };
  }
  function validateConversations(page) {
    const section = page ? exactFrame(page, SECTIONS2.conversations) : void 0;
    const checks = [check("03D page", Boolean(page && page.name === TARGET_PAGE)), check("Conversations section", Boolean(section))];
    const screens = /* @__PURE__ */ new Map();
    if (section) for (const v of VARIANTS) {
      const matches = section.children.filter((n) => n.name === conversationName(v.key));
      const valid = matches.length === 1 && matches[0].type === "FRAME";
      checks.push(check(v.title, valid, valid ? void 0 : `${matches.length} exact FRAME(s)`));
      if (valid) screens.set(v.key, matches[0]);
    }
    for (const [key, screen] of screens) {
      for (const name of ["Staff navigation", "Conversation List", "Conversation Workspace", "Message Thread", "Composer", "Persistent Context Panel", "Customer Context", "Order Context", "Inventory/Freshness", "Active Handler", "Escalation State"]) {
        checks.push(check(`${key} / ${name}`, hasNamed(screen, name)));
      }
      checks.push(check(`${key} / Order vs Reservation`, hasNamed(screen, "Order State label") && hasNamed(screen, "Reservation State label")));
    }
    const any = (name) => [...screens.values()].some((s) => hasNamed(s, name));
    checks.push(check("Agent Status", any("Agent Status")));
    checks.push(check("Human Status", any("Human Status")));
    checks.push(check("Handoff Event", any("Handoff Event")));
    checks.push(check("Business Action Proposal", any("Business Action Proposal")));
    checks.push(check("Business Action Result", any("Business Action Result")));
    checks.push(check("Execution Summary", any("Execution Summary")));
    checks.push(check("Delivery State", any("Delivery State")));
    const handoff = screens.get("Support to Sales Handoff");
    checks.push(check("Handoff does not transfer permissions", Boolean(handoff && hasText(handoff, "Permissions do not transfer"))));
    const proposal = screens.get("Awaiting Confirmation");
    checks.push(check("Proposal is not executed", Boolean(proposal && hasText(proposal, "NOT EXECUTED") && !hasText(proposal, "Reservation confirmed"))));
    checks.push(check("Awaiting customer confirmation / messaging separate", Boolean(proposal && hasText(proposal, "Awaiting customer confirmation before action can proceed") && hasNamed(proposal, "Send message") && !hasText(proposal, "Reply paused while the result is checked"))));
    const confirmed = screens.get("Confirmed Result");
    const confirmedLayout = resultComposition(confirmed, "Business Action Result");
    checks.push(check("Confirmed result region unique", confirmedLayout.unique));
    checks.push(check("Confirmed result layout fits", confirmedLayout.fits));
    checks.push(check("Confirmed effect", Boolean(confirmed && hasText(confirmed, "Reservation confirmed") && confirmedLayout.unique)));
    const failure = screens.get("Known Failure");
    const failureLayout = resultComposition(failure, "Business Action Result");
    checks.push(check("Known failure result region unique", failureLayout.unique));
    checks.push(check("Known failure result layout fits", failureLayout.fits));
    checks.push(check("Known failure \xB7 no hold", Boolean(failure && hasText(failure, "Inventory was not reserved") && !hasText(failure, "Reconcile authoritative state first") && failureLayout.unique)));
    const unknown = screens.get("OUTCOME_UNKNOWN");
    const unknownLayout = resultComposition(unknown, "Business Action Result");
    checks.push(check("OUTCOME_UNKNOWN result region unique", unknownLayout.unique));
    checks.push(check("OUTCOME_UNKNOWN result layout fits", unknownLayout.fits));
    checks.push(check("OUTCOME_UNKNOWN \xB7 reconcile / no blind retry", Boolean(unknown && hasText(unknown, "may have committed") && hasText(unknown, "Reconcile authoritative reservation state") && hasText(unknown, "Do not retry mutation blindly") && unknownLayout.unique)));
    const waiting = screens.get("Waiting Human");
    checks.push(check("Waiting Human", Boolean(waiting && hasText(waiting, "Human decision required"))));
    const delivery = screens.get("Delivery Failure");
    const deliveryLayout = resultComposition(delivery, "Delivery State");
    checks.push(check("Message delivery result region unique", deliveryLayout.unique));
    checks.push(check("Message delivery failure after confirmed effect", Boolean(delivery && deliveryLayout.unique && hasText(delivery, "BUSINESS EFFECT") && hasText(delivery, "COMMUNICATION") && hasText(delivery, "Reservation confirmed") && hasText(delivery, "Message delivery failed") && hasText(delivery, "Retry communication only") && hasText(delivery, "Do not repeat reserve_inventory"))));
    checks.push(check("Message delivery layout fits", deliveryLayout.fits));
    const unavailable = screens.get("Dependency Unavailable");
    checks.push(check("Dependency unavailable is not zero inventory", Boolean(unavailable && hasText(unavailable, "not zero stock"))));
    return { section: "Conversations", checks, pass: checks.every((c) => c.pass) };
  }

  // src/validators/escalations.ts
  var check2 = (label, pass, detail) => ({ label, pass, detail });
  var textHas = (node, value) => allText(node).includes(value);
  var normalizedTexts = (node) => node.findAll((n) => n.type === "TEXT").map((n) => n.characters.toLowerCase().replace(/\s+/g, " ").trim());
  function unknownOutcomeIsSafe(screen) {
    const texts = normalizedTexts(screen);
    const hasLabel = texts.some((value) => value.includes("outcome_unknown"));
    const needsAuthoritativeReconciliation = texts.some((value) => /\b(?:reconciliation (?:is )?required|reconcile|must reconcile|requires reconciliation)\b.{0,100}\bauthoritative (?:reservation )?state\b/.test(value));
    const forbidsBlindRetry = texts.some((value) => /\b(?:no blind retry|do not (?:blindly )?retry|no mutation action here|do not replay|no mutation replay)\b/.test(value));
    return hasLabel && needsAuthoritativeReconciliation && forbidsBlindRetry;
  }
  var contained = (a, p) => [a.x, a.y, a.width, a.height].every(Number.isFinite) && a.x >= 0 && a.y >= 0 && a.width > 0 && a.height > 0 && a.x + a.width <= p.width + 1 && a.y + a.height <= p.height + 1;
  var crosses = (a, b) => a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
  var one = (root, name) => {
    const matches = root.findAll((n) => n.name === name);
    return matches.length === 1 ? matches[0] : void 0;
  };
  var majorBlocks = ["Why Automation Stopped", "Confirmed Facts", "Uncertain Effect", "Constraints", "Next Safe Step", "Human Decision"];
  function layoutFits(screen) {
    const nav = one(screen, "Staff navigation");
    const main = one(screen, "Escalations Workspace");
    const queue = one(screen, "Escalation Queue");
    const context = one(screen, "Decision Context");
    const selected = one(screen, "Selected Queue Item");
    if (!nav || !main || !queue || !context || !selected || nav.type !== "FRAME" || main.type !== "FRAME" || queue.type !== "FRAME" || context.type !== "FRAME") return false;
    if (!contained(nav, screen) || !contained(main, screen) || crosses(nav, main) || !contained(queue, main) || !contained(context, main) || crosses(queue, context) || !contained(selected, queue)) return false;
    const detail = majorBlocks.map((name) => context.children.filter((n) => n.name === name));
    if (detail.some((matches) => matches.length !== 1 || matches[0].type !== "FRAME" && matches[0].type !== "INSTANCE")) return false;
    const ordered2 = detail.map((matches) => matches[0]);
    if (!ordered2.every((n) => contained(n, context)) || !ordered2.every((n, i) => i === 0 || n.y >= ordered2[i - 1].y + ordered2[i - 1].height + 8)) return false;
    const queueCards = ["Selected Queue Item", "Queue row / 2", "Queue row / 3", "Agent Run contextual link"].map((name) => queue.children.filter((n) => n.name === name));
    if (queueCards.some((matches) => matches.length !== 1)) return false;
    const rows = queueCards.map((matches) => matches[0]);
    if (!rows.every((n) => contained(n, queue)) || !rows.every((a, i) => rows.slice(i + 1).every((b) => !crosses(a, b)))) return false;
    const authored = [...ordered2, ...rows].filter((n) => n.type === "FRAME" || n.type === "INSTANCE");
    return authored.every((root) => {
      const texts = root.findAll((n) => n.type === "TEXT");
      return texts.every((n) => {
        const parent = n.parent;
        return parent && "width" in parent && "height" in parent && contained(n, parent);
      }) && texts.every((a, i) => texts.slice(i + 1).every((b) => a.parent !== b.parent || !crosses(a, b)));
    });
  }
  function validateEscalations(page) {
    const section = page ? exactFrame(page, SECTIONS2.escalations) : void 0;
    const checks = [
      check2("03D page", Boolean(page && page.name === TARGET_PAGE)),
      check2("Escalations section", Boolean(section))
    ];
    const screens = /* @__PURE__ */ new Map();
    if (section) for (const v of ESCALATION_VARIANTS) {
      const matches = section.children.filter((n) => n.name === escalationName(v.key));
      const valid = matches.length === 1 && matches[0].type === "FRAME";
      checks.push(check2(v.title, valid, valid ? void 0 : `${matches.length} exact match(es)`));
      if (valid) screens.set(v.key, matches[0]);
    }
    for (const [key, screen] of screens) {
      for (const name of ["Escalation Queue", "Selected Queue Item", "Decision Context", ...majorBlocks]) {
        checks.push(check2(`${key} / ${name}`, Boolean(one(screen, name))));
      }
      checks.push(check2(`${key} / selected drives detail`, textHas(screen, "ESC-204") && textHas(screen, "C-42") && textHas(screen, "ORD-1042")));
      checks.push(check2(`${key} / Conversation + Order + Run links`, textHas(screen, "Open Conversation C-42") && textHas(screen, "Open Order ORD-1042") && textHas(screen, "Agent Run \xB7 permitted case only")));
      checks.push(check2(`${key} / Human owner`, textHas(screen, "Human Operator") || key === "Waiting Assignment" && textHas(screen, "Unassigned")));
      checks.push(check2(`${key} / geometry`, layoutFits(screen)));
      checks.push(check2(`${key} / nested navigation`, textHas(screen, "Conversations") && textHas(screen, "Escalations") && Boolean(one(screen, "Escalations active marker"))));
    }
    const unknown = screens.get("OUTCOME_UNKNOWN");
    checks.push(check2("OUTCOME_UNKNOWN reconciliation / no blind retry", Boolean(unknown && unknownOutcomeIsSafe(unknown))));
    const stale = screens.get("Stale");
    checks.push(check2("Stale facts refresh / revalidation", Boolean(stale && textHas(stale, "observation exists") && textHas(stale, "Refresh authoritative business facts") && textHas(stale, "revalidate"))));
    const auth = screens.get("Authorization Changed");
    checks.push(check2("Authorization Changed rechecks principal / scope", Boolean(auth && textHas(auth, "not automatically Permission Denied") && textHas(auth, "Recheck current principal and scope"))));
    const e02 = screens.get("E02 Restricted");
    checks.push(check2("E02 update_order restricted, not unknown", Boolean(e02 && textHas(e02, "update_order did not execute") && textHas(e02, "Automatic update_order mutation remains restricted") && textHas(e02, "not OUTCOME_UNKNOWN") && textHas(e02, "authorized human/policy handling") && !one(e02, "Approve update"))));
    const resume = screens.get("Resume Pending");
    checks.push(check2("TARGET M12 decision \u2192 revalidation \u2192 request, no replay", Boolean(resume && textHas(resume, "TARGET M12") && textHas(resume, "Not currently implemented") && textHas(resume, "Human decision \u2192 Revalidation \u2192 Controlled Resume request") && textHas(resume, "No mutation replay") && !Boolean(one(resume, "Primary decision")))));
    const resolved = screens.get("Resolved Closed");
    checks.push(check2("Resolved distinct from Closed", Boolean(resolved && Boolean(one(resolved, "Resolved state")) && Boolean(one(resolved, "Closed state")) && textHas(resolved, "RESOLVED \xB7 verified outcome") && textHas(resolved, "CLOSED \xB7 no active work"))));
    const assigned = screens.get("Awaiting Decision");
    checks.push(check2("Contextual human decisions", Boolean(assigned && textHas(assigned, "Approve proposed continuation") && textHas(assigned, "Reject proposed continuation") && textHas(assigned, "Request clarification") && textHas(assigned, "Revalidate \u2192 Resume request") && textHas(assigned, "Close escalation"))));
    return { section: "Escalations", checks, pass: checks.every((c) => c.pass) };
  }
  function formatEscalationValidation(result) {
    return [
      "PHASE 3D ESCALATIONS VALIDATION",
      `${result.pass ? "PASS" : "FAIL"} \xB7 structural and generated-node geometry; manual visual review required.`,
      ...result.checks.map((c) => `${c.label}: ${c.pass ? "PASS" : "FAIL"}${c.detail ? ` (${c.detail})` : ""}`)
    ].join("\n");
  }

  // src/validators/orders.ts
  var check3 = (label, pass, detail) => ({ label, pass, detail });
  var has = (node, value) => Boolean(node && allText(node).includes(value));
  var fits = (n, p) => [n.x, n.y, n.width, n.height].every(Number.isFinite) && n.x >= 0 && n.y >= 0 && n.width > 0 && n.height > 0 && n.x + n.width <= p.width + 1 && n.y + n.height <= p.height + 1;
  var overlaps = (a, b) => a.x < b.x + b.width - 0.5 && b.x < a.x + a.width - 0.5 && a.y < b.y + b.height - 0.5 && b.y < a.y + a.height - 0.5;
  var direct = (root, name) => {
    const matches = root.children.filter((n) => n.name === name);
    return matches.length === 1 ? matches[0] : void 0;
  };
  var descendant = (root, name) => {
    const matches = root.findAll((n) => n.name === name);
    return matches.length === 1 ? matches[0] : void 0;
  };
  var detailBlocks = [
    "Order State",
    "Reservation State",
    "Attention and Safety",
    "Customer Summary",
    "Order Items",
    "Freshness and Version",
    "Order Delivery",
    "Message Delivery",
    "Next Safe Step",
    "Related Work",
    "Business Effect Activity"
  ];
  var expectedStates = {
    "Reservation Confirmed": { order: "Created", reservation: "Confirmed" },
    "Reservation Failed": { order: "Created", reservation: "Known Failure" },
    OUTCOME_UNKNOWN: { order: "Created", reservation: "OUTCOME_UNKNOWN" },
    "Needs Attention": { order: "Needs Attention", reservation: "Known Failure" },
    "Stale Conflict": { order: "Stale / Conflict", reservation: "Confirmed" },
    "E02 Restricted": { order: "Created", reservation: "Confirmed" }
  };
  function geometryFits(screen, list) {
    const nav = direct(screen, "Staff navigation");
    const main = direct(screen, "Orders Workspace");
    if (!nav || nav.type !== "FRAME" || !main || main.type !== "FRAME" || !fits(nav, screen) || !fits(main, screen) || overlaps(nav, main)) return false;
    const names = list ? ["Orders Filters", "Orders List"] : [...detailBlocks];
    const blocks3 = names.map((name) => direct(main, name));
    if (blocks3.some((n) => !n || n.type !== "FRAME" && n.type !== "INSTANCE")) return false;
    const placed = blocks3;
    if (!placed.every((n) => fits(n, main)) || !placed.every((a, i) => placed.slice(i + 1).every((b) => !overlaps(a, b)))) return false;
    if (list) {
      const table2 = direct(main, "Orders List");
      const rows = table2.children.filter((n) => n.name.startsWith("Order row / "));
      if (rows.length < 5 || !rows.every((n) => fits(n, table2)) || !rows.every((a, i) => rows.slice(i + 1).every((b) => !overlaps(a, b)))) return false;
    } else {
      const order = direct(main, "Order State");
      const reserve = direct(main, "Reservation State");
      if (!descendant(order, "Order State component") || !descendant(reserve, "Reservation State component")) return false;
      const next = direct(main, "Next Safe Step");
      if (!descendant(next, "Primary safe action")) return false;
    }
    const texts = main.findAll((n) => n.type === "TEXT");
    return texts.every((n) => {
      const parent = n.parent;
      return parent && "width" in parent && "height" in parent && fits(n, parent);
    }) && texts.every((a, i) => texts.slice(i + 1).every((b) => a.parent !== b.parent || !overlaps(a, b)));
  }
  function validateOrders(page) {
    const section = page ? exactFrame(page, SECTIONS2.orders) : void 0;
    const checks = [
      check3("03D page", Boolean(page && page.name === TARGET_PAGE)),
      check3("Orders section", Boolean(section))
    ];
    const screens = /* @__PURE__ */ new Map();
    if (section) for (const variant of ORDER_VARIANTS) {
      const matches = section.children.filter((n) => n.name === orderName(variant.key));
      const valid = matches.length === 1 && matches[0].type === "FRAME";
      checks.push(check3(variant.title, valid, valid ? void 0 : `${matches.length} exact match(es)`));
      if (valid) screens.set(variant.key, matches[0]);
    }
    for (const [key, screen] of screens) {
      const list = key === "List";
      const main = direct(screen, "Orders Workspace");
      checks.push(check3(`${key} / Business \u2192 Orders navigation`, has(screen, "Business") && has(screen, "Orders") && Boolean(descendant(screen, "Orders active marker"))));
      checks.push(check3(`${key} / geometry`, geometryFits(screen, list)));
      if (list) {
        const filters = main ? direct(main, "Orders Filters") : void 0;
        checks.push(check3("List / search and independent filters", Boolean(filters && filters.type === "FRAME" && ["Search orders", "Order-state filter", "Reservation-state filter", "Attention filter"].every((n) => Boolean(direct(filters, n))))));
        checks.push(check3("List / mixed independent states", has(screen, "Created") && has(screen, "Confirmed") && has(screen, "Known Failure") && has(screen, "OUTCOME_UNKNOWN") && has(screen, "Needs Attention")));
      } else {
        checks.push(check3(`${key} / Order Detail structure`, Boolean(main && detailBlocks.every((n) => Boolean(direct(main, n))))));
        checks.push(check3(`${key} / Customer + Items + Freshness`, has(screen, "Amina S.") && has(screen, "Desk Lamp") && has(screen, "Slate") && has(screen, "Quantity") && has(screen, "version v7")));
        checks.push(check3(`${key} / related Conversation`, has(screen, "Open Conversation C-42")));
        const orderBlock = main ? direct(main, "Order State") : void 0;
        const reservationBlock = main ? direct(main, "Reservation State") : void 0;
        const expected = expectedStates[key];
        checks.push(check3(`${key} / Order and Reservation separate`, Boolean(orderBlock && reservationBlock && orderBlock.type === "FRAME" && reservationBlock.type === "FRAME" && expected && allText(orderBlock).includes(expected.order) && allText(reservationBlock).includes(expected.reservation))));
      }
    }
    const confirmed = screens.get("Reservation Confirmed");
    checks.push(check3("Confirmed reservation independently trusted", has(confirmed, "Order ORD-1042 exists") && has(confirmed, "Inventory reserved") && has(confirmed, "Reservation confirmed")));
    const failed = screens.get("Reservation Failed");
    checks.push(check3("Known Failure is known and has authorized recovery", has(failed, "Reservation failed \u2014 known result") && has(failed, "Inventory is not reserved") && has(failed, "Review current inventory") && has(failed, "authorized recovery") && !Boolean(failed && /reconcil/i.test(allText(failed)))));
    const unknown = screens.get("OUTCOME_UNKNOWN");
    const unknownAction = unknown ? descendant(unknown, "Primary safe action") : void 0;
    const unknownActionText = unknownAction && unknownAction.type === "FRAME" ? allText(unknownAction) : "";
    checks.push(check3("OUTCOME_UNKNOWN reconciles before retry", has(unknown, "Reservation effect may have committed") && has(unknown, "Confirmation unavailable") && has(unknown, "RI-1042") && has(unknown, "RECONCILIATION REQUIRED") && has(unknown, "NO BLIND RETRY") && has(unknown, "Reconcile authoritative reservation state") && !/retry reservation|reserve again|repeat mutation/i.test(unknownActionText)));
    checks.push(check3("OUTCOME_UNKNOWN links Escalation", has(unknown, "Open Escalation ESC-204")));
    const attention = screens.get("Needs Attention");
    checks.push(check3("Needs Human Attention keeps known and unresolved facts separate", has(attention, "Order ORD-1042 exists") && has(attention, "Unresolved:") && has(attention, "Human Operator") && has(attention, "Open Escalation ESC-204")));
    const stale = screens.get("Stale Conflict");
    checks.push(check3("Stale / Conflict requires refresh and revalidation", has(stale, "Stale / Conflict") && has(stale, "current revision not verified") && has(stale, "Refresh and revalidate") && has(stale, "Do not automatically replay")));
    const e02 = screens.get("E02 Restricted");
    const e02Action = e02 ? descendant(e02, "Primary safe action") : void 0;
    const e02ActionText = e02Action && e02Action.type === "FRAME" ? allText(e02Action) : "";
    checks.push(check3("E02 update restricted and separate", has(e02, "update_order") && has(e02, "No update executed") && has(e02, "NOT Permission Denied") && has(e02, "NOT OUTCOME_UNKNOWN") && has(e02, "human/policy handling") && has(e02, "RESERVATION STATE \xB7 STOCK HOLD") && has(e02, "Confirmed") && !/^(?:update order|approve update)$/i.test(e02ActionText.trim())));
    checks.push(check3("Product existence is not inventory availability", ORDER_VARIANTS.filter((v) => v.kind !== "list").every((v) => has(screens.get(v.key), "Product record exists \u2260 inventory available"))));
    checks.push(check3("Unavailable inventory is not zero stock", ORDER_VARIANTS.filter((v) => v.kind !== "list").every((v) => has(screens.get(v.key), "unavailable \u2260 zero stock"))));
    checks.push(check3("Order Delivery remains separate from Message Delivery", Boolean(confirmed && descendant(confirmed, "Order Delivery") && descendant(confirmed, "Message Delivery") && has(confirmed, "ORDER DELIVERY \xB7 logistics") && has(confirmed, "MESSAGE DELIVERY \xB7 customer communication") && has(confirmed, "Retry communication only") && has(confirmed, "Reservation remains confirmed"))));
    return { section: "Orders", checks, pass: checks.every((c) => c.pass) };
  }
  function formatOrdersValidation(result) {
    return [
      "PHASE 3D ORDERS VALIDATION",
      `${result.pass ? "PASS" : "FAIL"} \xB7 structural, semantic and generated-node geometry; manual visual review required.`,
      ...result.checks.map((c) => `${c.label}: ${c.pass ? "PASS" : "FAIL"}${c.detail ? ` (${c.detail})` : ""}`)
    ].join("\n");
  }

  // src/validators/web-chat.ts
  var check4 = (label, pass, detail) => ({ label, pass, detail });
  var fits2 = (n, p) => [n.x, n.y, n.width, n.height].every(Number.isFinite) && n.x >= 0 && n.y >= 0 && n.width > 0 && n.height > 0 && n.x + n.width <= p.width + 1 && n.y + n.height <= p.height + 1;
  var ordered = (a, b, gap = 0) => a.y + a.height + gap <= b.y + 1;
  var direct2 = (parent, name) => {
    const matches = parent.children.filter((n) => n.type === "FRAME" && n.name === name);
    return matches.length === 1 ? matches[0] : void 0;
  };
  var named = (root, name) => {
    if (!root) return void 0;
    const matches = root.findAll((n) => n.name === name);
    return matches.length === 1 ? matches[0] : void 0;
  };
  var has2 = (node, phrase) => Boolean(node && allText(node).includes(phrase));
  var forbidden = /create_order|reserve_inventory|update_order|ToolCall|Agent Run|LangGraph|OUTCOME_UNKNOWN|MODEL_NOT_READY|\bE02\b|\bM12\b|internal confidence|technical handoff|chain-of-thought/i;
  function geometry(screen) {
    if (screen.width < 390 || screen.width > 430 || screen.clipsContent) return false;
    const header = direct2(screen, "Service Header");
    const history = direct2(screen, "Message History");
    const state = direct2(screen, "Customer State");
    const composer = direct2(screen, "Customer Composer");
    if (!header || !history || !state || !composer) return false;
    if (![header, history, state, composer].every((n) => fits2(n, screen))) return false;
    if (!ordered(header, history, 8) || !ordered(history, state, 8) || !ordered(state, composer, 8)) return false;
    const messages = history.children.filter((n) => n.type === "INSTANCE");
    if (!messages.every((n) => fits2(n, history)) || !messages.every((n, i) => i === 0 || ordered(messages[i - 1], n, 8))) return false;
    if (!state.children.every((n) => "width" in n && fits2(n, state))) return false;
    if (!composer.children.every((n) => "width" in n && fits2(n, composer))) return false;
    const actionFrames = screen.findAll((n) => n.type === "FRAME" && /action|confirm order/i.test(n.name) && n.children?.some((c) => c.type === "TEXT" && c.name === "Action label"));
    for (const action2 of actionFrames) {
      const label = action2.children.find((n) => n.type === "TEXT" && n.name === "Action label");
      if (action2.height < 44 || !fits2(label, action2) || label.height > action2.height - 4) return false;
    }
    for (const action2 of actionFrames) {
      const siblings = actionFrames.filter((other) => other !== action2 && other.parent === action2.parent);
      if (siblings.some((other) => action2.y < other.y + other.height - 0.5 && other.y < action2.y + action2.height - 0.5)) return false;
    }
    return true;
  }
  function validateWebChat(page) {
    const section = page ? exactFrame(page, SECTIONS2.webChat) : void 0;
    const checks = [
      check4("03D page", Boolean(page && page.name === TARGET_PAGE)),
      check4("Customer Web Chat section", Boolean(section))
    ];
    const screens = /* @__PURE__ */ new Map();
    for (const variant of WEB_CHAT_VARIANTS) {
      const matches = section?.children.filter((n) => n.name === webChatName(variant.key)) ?? [];
      const valid = matches.length === 1 && matches[0].type === "FRAME";
      checks.push(check4(`Variant / ${variant.key}`, valid, valid ? void 0 : `${matches.length} exact match(es)`));
      if (valid) screens.set(variant.key, matches[0]);
    }
    for (const variant of WEB_CHAT_VARIANTS) {
      const screen = screens.get(variant.key);
      if (!screen) continue;
      checks.push(check4(`${variant.key} / customer structure`, Boolean(direct2(screen, "Service Header") && direct2(screen, "Message History") && direct2(screen, "Customer State") && direct2(screen, "Customer Composer"))));
      checks.push(check4(`${variant.key} / mobile geometry`, geometry(screen)));
      checks.push(check4(`${variant.key} / customer-only surface`, !Boolean(named(screen, "Staff navigation")) && !Boolean(named(screen, "Agent Run")) && !forbidden.test(allText(screen))));
      checks.push(check4(`${variant.key} / Business Reply`, Boolean(named(screen, "Business Reply")) && has2(screen, "Business")));
      if (variant.key !== "Initial") checks.push(check4(`${variant.key} / Customer Message`, Boolean(named(screen, "Customer Message")) && has2(screen, "You")));
      if (variant.component) checks.push(check4(`${variant.key} / Phase 3C ${variant.component}`, named(screen, `${variant.component} component`)?.type === "INSTANCE"));
    }
    for (const key of ["Initial", "Active", "Confirmed Result", "Waiting Human"])
      checks.push(check4(`${key} / Composer`, named(screens.get(key), "Composer / Ready")?.type === "INSTANCE"));
    const clarification = screens.get("Clarification");
    checks.push(check4("Clarification Request / plain-language input", has2(clarification, "Which size would you like?") && has2(clarification, "Send details") && !has2(clarification, "missing parameter")));
    const confirmation = screens.get("Confirmation Required");
    checks.push(check4("Confirmation Request / explicit business authorization", has2(confirmation, "Desk Lamp / Slate") && has2(confirmation, "Quantity: 1") && has2(confirmation, "Confirm order") && has2(confirmation, "Change details") && !Boolean(confirmation && /\bConfirm\b(?! order)/.test(allText(confirmation)))));
    const processing = screens.get("Processing");
    checks.push(check4("Processing / neutral pending result", has2(processing, "We are processing your request.") && has2(processing, "We'll update you here when the result is available.") && !Boolean(processing && /keep (the )?chat open|reservation remains confirmed|order created/i.test(allText(processing)))));
    const confirmed = screens.get("Confirmed Result");
    checks.push(check4("Confirmed Result / independent trusted facts", has2(confirmed, "ORDER") && has2(confirmed, "Order created") && has2(confirmed, "RESERVATION") && has2(confirmed, "Item reserved") && has2(confirmed, "ORD-1042")));
    const failure = screens.get("Known Failure");
    checks.push(check4("Known Failure / existing order and duplicate protection", has2(failure, "Your order was created, but the item was not reserved.") && has2(failure, "Please don't place the same order again.") && has2(failure, "We'll help you with the next step.") && !Boolean(failure && /retry order|reserve again/i.test(allText(failure)))));
    const waiting = screens.get("Waiting Human");
    checks.push(check4("Waiting Human / person, not automated processing", has2(waiting, "A person is reviewing this.") && has2(waiting, "We'll update you here.") && !has2(waiting, "We are processing your request.")));
    const pending = screens.get("Confirmation Pending");
    checks.push(check4("Confirmation Pending / unknown result in customer language", has2(pending, "may have gone through") && has2(pending, "cannot confirm it yet") && has2(pending, "Please do not submit the same request again.") && has2(pending, "We will update you when confirmation is available.") && !Boolean(pending && /OUTCOME_UNKNOWN|Retry order|Reserve again|Submit same request/i.test(allText(pending)))));
    const delivery = screens.get("Message Delivery Failure");
    checks.push(check4("Message Delivery Failure / transport and business effect separate", has2(delivery, "MESSAGE DELIVERY FAILED") && has2(delivery, "Message not delivered") && has2(delivery, "Not delivered") && has2(delivery, "BUSINESS RESULT") && has2(delivery, "Reservation remains confirmed") && has2(delivery, "Retry message") && has2(delivery, "Only your message needs attention.") && !Boolean(delivery && /Retry order|Reserve again|retry reservation/i.test(allText(delivery)))));
    return { section: "Customer Web Chat", checks, pass: checks.every((c) => c.pass) };
  }
  function formatWebChatValidation(result) {
    return [
      "PHASE 3D CUSTOMER WEB CHAT VALIDATION",
      `${result.pass ? "PASS" : "FAIL"} \xB7 structural, semantic and generated-node geometry; manual visual review required.`,
      ...result.checks.map((c) => `${c.label}: ${c.pass ? "PASS" : "FAIL"}${c.detail ? ` (${c.detail})` : ""}`)
    ].join("\n");
  }

  // src/validators/analytics.ts
  var check5 = (label, pass, detail) => ({ label, pass, detail });
  var has3 = (node, value) => Boolean(node && allText(node).includes(value));
  var fits3 = (n, p) => [n.x, n.y, n.width, n.height].every(Number.isFinite) && n.x >= 0 && n.y >= 0 && n.width > 0 && n.height > 0 && n.x + n.width <= p.width + 1 && n.y + n.height <= p.height + 1;
  var direct3 = (parent, name) => {
    if (!parent) return void 0;
    const matches = parent.children.filter((n) => n.type === "FRAME" && n.name === name);
    return matches.length === 1 ? matches[0] : void 0;
  };
  var named2 = (parent, name) => {
    if (!parent) return void 0;
    const matches = parent.findAll((n) => n.name === name);
    return matches.length === 1 ? matches[0] : void 0;
  };
  var chartPartFits = (part, chart) => {
    if (!("width" in part)) return false;
    const outer = chart.absoluteBoundingBox;
    const inner = part.absoluteBoundingBox;
    if (outer && inner) return inner.x >= outer.x - 1 && inner.y >= outer.y - 1 && inner.x + inner.width <= outer.x + outer.width + 1 && inner.y + inner.height <= outer.y + outer.height + 1;
    return fits3(part, chart);
  };
  var blocks = ["Report Controls", "Report State", "KPI Summary", "Historical Chart", "Data Table", "Data Quality", "Forecast Contextual Link"];
  function geometry2(screen) {
    const nav = direct3(screen, "Staff navigation");
    const main = direct3(screen, "Analytics Workspace");
    if (!nav || !main || screen.width !== 1760 || screen.clipsContent || !fits3(nav, screen) || !fits3(main, screen) || nav.x + nav.width > main.x + 1) return false;
    const regions = blocks.map((name) => direct3(main, name));
    if (regions.some((r) => !r)) return false;
    const placed = regions;
    if (!placed.every((r) => fits3(r, main)) || !placed.every((r, i) => i === 0 || r.y >= placed[i - 1].y + placed[i - 1].height + 16)) return false;
    if (!placed.every((r) => r.children.every((n) => !("width" in n) || fits3(n, r)))) return false;
    const chart = direct3(main, "Historical Chart");
    const table2 = direct3(main, "Data Table");
    const quality = direct3(main, "Data Quality");
    if (!chart || !table2 || !quality) return false;
    for (const region of [chart, table2, quality]) {
      const instances = region.children.filter((n) => n.type === "INSTANCE");
      if (!instances.every((n) => fits3(n, region))) return false;
    }
    const chartInstance = named2(chart, "Historical Chart component");
    if (chartInstance?.type === "INSTANCE") {
      const labels = chartInstance.findAll((n) => n.type === "TEXT");
      if (!labels.every((n) => n.parent && "width" in n.parent && fits3(n, n.parent))) return false;
    }
    const forecast = direct3(main, "Forecast Contextual Link");
    const link = named2(forecast, "Open Forecasts");
    const ownTexts = screen.findAll((n) => n.type === "TEXT").filter((n) => {
      if (n.name.startsWith("Manual /")) return false;
      let parent = n.parent;
      while (parent && parent !== screen) {
        if (parent.type === "INSTANCE" || parent.name.startsWith("Manual /")) return false;
        parent = parent.parent;
      }
      return true;
    });
    return Boolean(link && link.type === "FRAME" && link.height >= 44 && fits3(link, forecast)) && ownTexts.every((n) => n.parent && "width" in n.parent && fits3(n, n.parent));
  }
  function chartSemantics(screen, expected) {
    const chartRegion = direct3(direct3(screen, "Analytics Workspace"), "Historical Chart");
    const chart = named2(chartRegion, "Historical Chart component");
    if (expected === "none") return !chart && !named2(chartRegion, "ACTUAL / solid segment 1") && Boolean(named2(chartRegion, "No chart result"));
    if (!chart || chart.type !== "INSTANCE") return false;
    const segments = chart.findAll((n) => /^ACTUAL \/ solid segment [1-4]$/.test(n.name));
    const gap = chart.findAll((n) => n.name === "Missing observation / visible gap");
    const textValue = allText(chart);
    if (![...segments, ...gap].every((n) => chartPartFits(n, chart))) return false;
    if (!textValue.includes("ACTUAL \u2501 solid / observed only") || /PREDICTED|forecast series|future series/i.test(textValue)) return false;
    if (expected === "gap") return segments.length === 2 && gap.length === 1 && textValue.includes("MISSING") && !segments.some((n) => n.name === "ACTUAL / solid segment 2" || n.name === "ACTUAL / solid segment 3");
    return segments.length === 4 && gap.length === 0;
  }
  function validateAnalytics(page) {
    const section = page ? exactFrame(page, SECTIONS2.analytics) : void 0;
    const checks = [
      check5("03D page", Boolean(page && page.name === TARGET_PAGE)),
      check5("Analytics section", Boolean(section))
    ];
    const screens = /* @__PURE__ */ new Map();
    for (const variant of ANALYTICS_VARIANTS) {
      const matches = section?.children.filter((n) => n.name === analyticsName(variant.key)) ?? [];
      const valid2 = matches.length === 1 && matches[0].type === "FRAME";
      checks.push(check5(`Variant / ${variant.key}`, valid2, valid2 ? void 0 : `${matches.length} exact match(es)`));
      if (valid2) screens.set(variant.key, matches[0]);
    }
    for (const variant of ANALYTICS_VARIANTS) {
      const screen = screens.get(variant.key);
      if (!screen) continue;
      const main = direct3(screen, "Analytics Workspace");
      const controls = direct3(main, "Report Controls");
      const kpi = direct3(main, "KPI Summary");
      const chart = direct3(main, "Historical Chart");
      const table2 = direct3(main, "Data Table");
      const quality = direct3(main, "Data Quality");
      checks.push(check5(`${variant.key} / stable structure`, Boolean(main && blocks.every((n) => direct3(main, n)))));
      checks.push(check5(`${variant.key} / geometry`, geometry2(screen)));
      checks.push(check5(`${variant.key} / Analytics active; Forecasts nested`, Boolean(named2(screen, "Primary / Analytics") && named2(screen, "Active marker") && named2(screen, "Nested / Analytics / Forecasts") && named2(main, "Open Forecasts"))));
      checks.push(check5(`${variant.key} / report controls`, Boolean(controls && named2(controls, "Period Selector component")?.type === "INSTANCE" && named2(controls, "Core Select component")?.type === "INSTANCE" && named2(controls, "Metric Select") && has3(controls, "Confirmed orders (count)") && has3(controls, "May / selected") && has3(controls, "Monthly") && named2(controls, "Request Report"))));
      checks.push(check5(`${variant.key} / observed-only boundary`, !/PREDICTED|forecast series|future series|recognized revenue|Sales = 0|Orders = 0/i.test(allText(screen)) && !Boolean(screen.findAll((n) => /Forecast \/ Predicted|PREDICTED|dashed forecast/i.test(n.name)).length)));
      checks.push(check5(`${variant.key} / Forecasts contextual link`, Boolean(named2(main, "Forecast Contextual Link") && named2(main, "Open Forecasts") && has3(main, "separate nested Analytics destination"))));
      checks.push(check5(`${variant.key} / expected regions`, Boolean(kpi && chart && table2 && quality)));
    }
    const valid = screens.get("Valid");
    checks.push(check5("Valid / historical KPI and complete table", has3(valid, "24") && has3(valid, "Week A") && has3(valid, "Week B") && has3(valid, "Week C") && has3(valid, "8") && has3(valid, "10") && has3(valid, "6") && has3(valid, "Complete") && Boolean(named2(valid, "KPI component") && named2(valid, "Data Table component"))));
    checks.push(check5("Valid / continuous ACTUAL chart", Boolean(valid && chartSemantics(valid, "continuous"))));
    checks.push(check5("Valid / freshness and completeness", Boolean(named2(valid, "Freshness component") && named2(valid, "Completeness component") && has3(valid, "Current observed snapshot") && has3(valid, "Source coverage complete"))));
    const empty = screens.get("Valid Empty");
    checks.push(check5("Valid Empty / successful no-record result", has3(empty, "Query succeeded; no records for this period.") && has3(empty, "Not a source failure.") && has3(empty, "No records for this period") && !Boolean(named2(empty, "KPI component") || named2(empty, "Data Table component")) && Boolean(empty && chartSemantics(empty, "none"))));
    const incomplete = screens.get("Incomplete");
    const incompleteTable = direct3(direct3(incomplete, "Analytics Workspace"), "Data Table");
    checks.push(check5("Incomplete / partial, never complete total", has3(incomplete, "Partial coverage") && has3(incomplete, "14 observed") && has3(incomplete, "NOT a complete May total") && has3(incompleteTable, "Week B unavailable") && has3(incompleteTable, "Missing") && has3(incomplete, "Source coverage complete") === false));
    checks.push(check5("Incomplete / visible gap, not zero", Boolean(incomplete && chartSemantics(incomplete, "gap")) && has3(incomplete, "missing observation is not zero") && !Boolean(incomplete && /Week B:\s*0\b/.test(allText(incomplete)))));
    checks.push(check5("Incomplete / freshness and completeness independent", Boolean(named2(incomplete, "Freshness component") && named2(incomplete, "Completeness component") && has3(incomplete, "Partial coverage \u2260 zero activity"))));
    const stale = screens.get("Stale");
    checks.push(check5("Stale / retains observed values and requests refresh", has3(stale, "24") && has3(stale, "Source observed at 10:42") && has3(stale, "Refresh before") && Boolean(named2(stale, "Data Table component")) && Boolean(stale && chartSemantics(stale, "continuous"))));
    const unavailable = screens.get("Dependency Unavailable");
    checks.push(check5("Dependency Unavailable / no substitute zero", has3(unavailable, "DEPENDENCY UNAVAILABLE") && has3(unavailable, "No trusted result") && has3(unavailable, "Try again later") && !Boolean(named2(unavailable, "KPI component") || named2(unavailable, "Data Table component")) && Boolean(unavailable && chartSemantics(unavailable, "none"))));
    checks.push(check5("Dependency Unavailable / unavailable completeness", Boolean(named2(unavailable, "Completeness component")) && has3(unavailable, "No trusted result; do not show zero")));
    const denied = screens.get("Permission Denied");
    checks.push(check5("Permission Denied / no protected report values", has3(denied, "PERMISSION DENIED") && has3(denied, "Request authorized access") && !Boolean(named2(denied, "KPI component") || named2(denied, "Data Table component") || named2(denied, "Freshness component") || named2(denied, "Completeness component")) && Boolean(denied && chartSemantics(denied, "none")) && !Boolean(denied && /\b24\b|\b14 observed\b|Week A:\s*8|\b\d+\s+(?:orders|sales)\b/i.test(allText(denied)))));
    return { section: "Analytics", checks, pass: checks.every((c) => c.pass) };
  }
  function formatAnalyticsValidation(result) {
    return [
      "PHASE 3D ANALYTICS VALIDATION",
      `${result.pass ? "PASS" : "FAIL"} \xB7 structural, semantic and generated-node geometry; manual visual review required.`,
      ...result.checks.map((c) => `${c.label}: ${c.pass ? "PASS" : "FAIL"}${c.detail ? ` (${c.detail})` : ""}`)
    ].join("\n");
  }

  // src/validators/forecasts.ts
  var check6 = (label, pass, detail) => ({ label, pass, detail });
  var fits4 = (n, p) => [n.x, n.y, n.width, n.height].every(Number.isFinite) && n.x >= 0 && n.y >= 0 && n.width > 0 && n.height > 0 && n.x + n.width <= p.width + 1 && n.y + n.height <= p.height + 1;
  var overlaps2 = (a, b) => a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;
  var direct4 = (parent, name) => {
    const matches = parent?.children.filter((n) => n.type === "FRAME" && n.name === name) ?? [];
    return matches.length === 1 ? matches[0] : void 0;
  };
  var named3 = (parent, name) => {
    const matches = parent?.findAll((n) => n.name === name) ?? [];
    return matches.length === 1 ? matches[0] : void 0;
  };
  var has4 = (parent, phrase) => Boolean(parent && allText(parent).includes(phrase));
  var blocks2 = ["Forecast Request Summary", "Availability State", "Historical Context", "Forecast Result", "Provenance and Limitations", "Historical Analytics Return"];
  function chartBounds(node, chart) {
    if (!("width" in node) || !("height" in node)) return void 0;
    let transform = [[1, 0, 0], [0, 1, 0]];
    let current = node;
    while (current !== chart) {
      if (!current || !("parent" in current) || !("width" in current)) return void 0;
      const local = "relativeTransform" in current && current.relativeTransform ? current.relativeTransform : [[1, 0, current.x], [0, 1, current.y]];
      transform = [
        [local[0][0] * transform[0][0] + local[0][1] * transform[1][0], local[0][0] * transform[0][1] + local[0][1] * transform[1][1], local[0][0] * transform[0][2] + local[0][1] * transform[1][2] + local[0][2]],
        [local[1][0] * transform[0][0] + local[1][1] * transform[1][0], local[1][0] * transform[0][1] + local[1][1] * transform[1][1], local[1][0] * transform[0][2] + local[1][1] * transform[1][2] + local[1][2]]
      ];
      current = current.parent;
    }
    const corners = [[0, 0], [node.width, 0], [0, node.height], [node.width, node.height]];
    const xs = corners.map(([x, y]) => transform[0][0] * x + transform[0][1] * y + transform[0][2]);
    const ys = corners.map(([x, y]) => transform[1][0] * x + transform[1][1] * y + transform[1][2]);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  }
  var dashedStroke = (node) => "dashPattern" in node && Array.isArray(node.dashPattern) && node.dashPattern.length > 0;
  function geometry3(board) {
    const canvas = direct4(board, "Staff Screen");
    const nav = direct4(canvas, "Staff navigation");
    const main = direct4(canvas, "Forecast Workspace");
    if (!canvas || !nav || !main || board.width !== 1760 || board.clipsContent || !fits4(canvas, board) || !fits4(nav, canvas) || !fits4(main, canvas) || nav.x + nav.width > main.x + 1) return false;
    const regions = blocks2.map((name) => direct4(main, name));
    if (regions.some((r) => !r)) return false;
    const placed = regions;
    if (!placed.every((r) => fits4(r, main)) || !placed.every((r, i) => i === 0 || r.y >= placed[i - 1].y + placed[i - 1].height + 16)) return false;
    if (!placed.every((r) => r.children.every((n) => !("width" in n) || fits4(n, r)))) return false;
    if (!placed.every((r) => {
      const children = r.children.filter((n) => "width" in n && !n.name.startsWith("Manual /"));
      return children.every((a, i) => children.slice(i + 1).every((b) => !("width" in a && "width" in b && overlaps2(a, b))));
    })) return false;
    const ownTexts = board.findAll((n) => n.type === "TEXT").filter((n) => {
      if (n.name.startsWith("Manual /")) return false;
      let parent = n.parent;
      while (parent && parent !== board) {
        if (parent.type === "INSTANCE" || parent.name.startsWith("Manual /")) return false;
        parent = parent.parent;
      }
      return true;
    });
    return ownTexts.every((n) => n.parent && "width" in n.parent && fits4(n, n.parent));
  }
  function targetChart(board) {
    const chart = named3(direct4(direct4(direct4(board, "Staff Screen"), "Forecast Workspace"), "Forecast Result"), "Actual vs Predicted Chart component");
    if (!chart || chart.type !== "INSTANCE") return false;
    const actual = chart.findAll((n) => /^ACTUAL \/ solid segment [1-4]$/.test(n.name));
    const joints = chart.findAll((n) => /^ACTUAL \/ continuous joint [1-3]$/.test(n.name));
    const predicted = chart.findAll((n) => /^PREDICTED \/ dash \d+$/.test(n.name));
    const cutoff = chart.findAll((n) => n.name === "CUTOFF / vertical marker");
    if (actual.length !== 4 || joints.length !== 3 || predicted.length < 3 || cutoff.length !== 1) return false;
    if (chart.findAll((n) => /^(ACTUAL \/ dash|PREDICTED \/ solid)/i.test(n.name)).length || actual.some(dashedStroke)) return false;
    const dashNumbers = predicted.map((n) => Number(n.name.match(/\d+$/)?.[0])).sort((a, b) => a - b);
    if (!dashNumbers.every((number, i) => number === i + 1)) return false;
    const marks = [...actual, ...joints, ...predicted, cutoff[0]];
    const bounds = marks.map((n) => chartBounds(n, chart));
    if (bounds.some((b) => !b || !fits4(b, chart))) return false;
    const actualBounds = bounds.slice(0, actual.length);
    const predictedBounds = bounds.slice(actual.length + joints.length, -1);
    const cutoffBounds = bounds[bounds.length - 1];
    if (!cutoffBounds || cutoffBounds.height < cutoffBounds.width * 4) return false;
    const cutoffX = cutoffBounds.x + cutoffBounds.width / 2;
    const history = actualBounds;
    const future = predictedBounds.sort((a, b) => a.x - b.x);
    if (!history.every((b) => b.x < cutoffX && b.x + b.width <= cutoffX + 3) || !future.every((b) => b.x >= cutoffX + 2) || !future.every((b, i) => i === 0 || b.x >= future[i - 1].x + future[i - 1].width + 2)) return false;
    const chartText = allText(chart).replace(/\s+/g, " ").toLowerCase();
    if (!/actual\s*[—–-]\s*solid line/.test(chartText) || !/predicted\s*[—–-]\s*dashed line/.test(chartText) || !/cutoff\s*\/\s*last observed/.test(chartText) || !/target product ux/.test(chartText)) return false;
    const labels = chart.findAll((n) => n.type === "TEXT");
    return labels.every((n) => n.parent && "width" in n.parent && fits4(n, n.parent));
  }
  function validateForecasts(page) {
    const section = page ? exactFrame(page, SECTIONS2.forecasts) : void 0;
    const checks = [
      check6("03D page", Boolean(page && page.name === TARGET_PAGE)),
      check6("Forecasts section", Boolean(section))
    ];
    const boards = /* @__PURE__ */ new Map();
    for (const variant of FORECAST_VARIANTS) {
      const matches = section?.children.filter((n) => n.name === forecastName(variant.key)) ?? [];
      const valid = matches.length === 1 && matches[0].type === "FRAME";
      checks.push(check6(`Variant / ${variant.key}`, valid, valid ? void 0 : `${matches.length} exact match(es)`));
      if (valid) boards.set(variant.key, matches[0]);
    }
    for (const variant of FORECAST_VARIANTS) {
      const board = boards.get(variant.key);
      if (!board) continue;
      const canvas = direct4(board, "Staff Screen");
      const main = direct4(canvas, "Forecast Workspace");
      const request2 = direct4(main, "Forecast Request Summary");
      const state = direct4(main, "Availability State");
      const history = direct4(main, "Historical Context");
      const result = direct4(main, "Forecast Result");
      const evidence2 = direct4(main, "Provenance and Limitations");
      const back = direct4(main, "Historical Analytics Return");
      checks.push(check6(`${variant.key} / stable structure`, Boolean(main && blocks2.every((name) => direct4(main, name)))));
      checks.push(check6(`${variant.key} / request target, scope, cutoff and horizon`, Boolean(
        named3(request2, "Request Summary component")?.type === "INSTANCE" && named3(request2, "Target component")?.type === "INSTANCE" && named3(request2, "Cutoff component")?.type === "INSTANCE" && named3(request2, "Horizon component")?.type === "INSTANCE" && ["TARGET", "SCOPE", "CUTOFF", "HORIZON"].every((label) => has4(request2, label)) && (variant.kind === "denied" ? has4(request2, "Not disclosed") : has4(request2, "last observed") && has4(request2, "future span"))
      )));
      checks.push(check6(`${variant.key} / nested navigation and historical return`, Boolean(
        named3(canvas, "Primary / Analytics") && named3(canvas, "Nested / Analytics / Forecasts") && named3(canvas, "Forecasts nested active marker") && named3(back, "Open Historical Analytics") && has4(back, "Historical Analytics")
      )));
      checks.push(check6(`${variant.key} / geometry`, geometry3(board)));
      if (variant.kind !== "ready") {
        const source = allText(board);
        checks.push(check6(`${variant.key} / no fake predicted result`, Boolean(
          result && named3(result, "No prediction result") && !named3(board, "Actual vs Predicted Chart component") && !named3(board, "Predicted Series component") && !named3(board, "Result component") && !named3(board, "Provenance component") && !board.findAll((n) => /^PREDICTED \/ dash \d+$/.test(n.name)).length && !/\b(?:predicted|forecast)(?:\s+(?:value|result))?\s*(?::|=)?\s*\d+(?:[.,]\d+)?\b/i.test(source) && !/\b\d+(?:[.,]\d+)?\s*(?:predicted|forecast)\b/i.test(source)
        )));
      }
      if (variant.kind !== "denied" && variant.kind !== "incomplete")
        checks.push(check6(`${variant.key} / separate ACTUAL context`, named3(history, "Actual Series component")?.type === "INSTANCE" && has4(history, "not a prediction")));
      if (variant.kind === "denied")
        checks.push(check6("Permission Denied / protected result withheld", Boolean(
          has4(state, "PERMISSION DENIED") && has4(request2, "Protected target") && has4(request2, "Restricted scope") && !named3(board, "Actual Series component") && !named3(board, "Predicted Series component") && !named3(board, "Provenance component") && has4(result, "NO PREDICTION PRODUCED") && !/\b\d+(?:[.,]\d+)?\s*(?:orders|sales|predicted|forecast)\b/i.test(allText(board))
        )));
    }
    const ready = boards.get("TARGET Ready");
    const current = boards.get("MODEL_NOT_READY");
    checks.push(check6("TARGET Ready / illustrative and separate from current", has4(ready, "TARGET PRODUCT UX") && has4(ready, "CURRENT ENGINEERING STATE: MODEL_NOT_READY") && has4(ready, "no forecast values")));
    checks.push(check6("TARGET Ready / ACTUAL, cutoff and dashed PREDICTED", Boolean(ready && targetChart(ready) && named3(ready, "Actual Series component")?.type === "INSTANCE" && named3(ready, "Predicted Series component")?.type === "INSTANCE" && named3(ready, "Cutoff component")?.type === "INSTANCE")));
    checks.push(check6("TARGET Ready / provenance and limitations placeholders", Boolean(
      named3(ready, "Provenance component")?.type === "INSTANCE" && named3(ready, "Limitations component")?.type === "INSTANCE" && named3(ready, "Result component")?.type === "INSTANCE" && has4(ready, "[real run only]") && has4(ready, "No model version")
    )));
    checks.push(check6("MODEL_NOT_READY / current and no result", Boolean(
      has4(current, "CURRENT ENGINEERING STATE") && named3(current, "MODEL_NOT_READY component")?.type === "INSTANCE" && has4(current, "No prediction has been produced") && !named3(current, "Predicted Series component") && !named3(current, "Result component")
    )));
    const insufficient = boards.get("Insufficient History");
    const incomplete = boards.get("Incomplete History");
    checks.push(check6("Insufficient History / short but available", has4(insufficient, "not long enough") && named3(insufficient, "Actual Series component")?.type === "INSTANCE"));
    checks.push(check6("Incomplete History / missing coverage, not zero", has4(incomplete, "observations are missing") && has4(incomplete, "gap is not zero") && !named3(incomplete, "Actual Series component")));
    checks.push(check6("Unsupported Horizon / no silent shortening", has4(boards.get("Unsupported Horizon"), "not supported") && has4(boards.get("Unsupported Horizon"), "do not silently shorten")));
    checks.push(check6("Model Unavailable / dependency, not readiness", has4(boards.get("Model Unavailable"), "dependency is unavailable") && !named3(boards.get("Model Unavailable"), "MODEL_NOT_READY component")));
    checks.push(check6("Timeout / no confirmed result", has4(boards.get("Timeout"), "no confirmed result") && has4(boards.get("Timeout"), "no automatic retry")));
    return { section: "Forecasts", checks, pass: checks.every((c) => c.pass) };
  }
  function formatForecastValidation(result) {
    return [
      "PHASE 3D FORECASTS VALIDATION",
      `${result.pass ? "PASS" : "FAIL"} \xB7 structural, semantic and generated-node geometry; manual visual review required.`,
      ...result.checks.map((c) => `${c.label}: ${c.pass ? "PASS" : "FAIL"}${c.detail ? ` (${c.detail})` : ""}`)
    ].join("\n");
  }

  // src/validators/aggregate.ts
  var SECTION_ORDER = [
    ["Shared Staff Shell", SECTIONS2.shell, validateSharedShell],
    ["Conversations", SECTIONS2.conversations, validateConversations],
    ["Escalations", SECTIONS2.escalations, validateEscalations],
    ["Orders", SECTIONS2.orders, validateOrders],
    ["Customer Web Chat", SECTIONS2.webChat, validateWebChat],
    ["Analytics", SECTIONS2.analytics, validateAnalytics],
    ["Forecasts", SECTIONS2.forecasts, validateForecasts]
  ];
  var check7 = (label, pass, detail) => ({ label, pass, detail });
  var byLabel = (result, label) => result.checks.find((c) => c.label === label)?.pass === true;
  var hasInstance = (section, name) => Boolean(section?.findAll((n) => n.type === "INSTANCE" && n.name === name).length);
  var hasBoundColor = (section) => Boolean(section && [section, ...section.findAll(() => true)].some((node) => {
    if (!("fills" in node) || !Array.isArray(node.fills)) return false;
    return [...node.fills, ..."strokes" in node && Array.isArray(node.strokes) ? node.strokes : []].some((paint2) => "boundVariables" in paint2 && Boolean(paint2.boundVariables?.color));
  }));
  function safeChild(name, page, validate) {
    try {
      return validate(page);
    } catch (error) {
      return { section: name, pass: false, checks: [check7("Validator could not inspect canonical section", false, error instanceof Error ? error.message : String(error))] };
    }
  }
  function validatePhase3DAggregate(page, assets) {
    const children = Object.fromEntries(SECTION_ORDER.map(([name, , validate]) => [name, safeChild(name, page, validate)]));
    return aggregatePhase3DResults(page, assets, children);
  }
  function aggregatePhase3DResults(page, assets, children) {
    const sections = SECTION_ORDER.map(([name, canonical]) => {
      const matches = page?.children.filter((n) => n.name === canonical) ?? [];
      const exactFrames = matches.filter((n) => n.type === "FRAME").length;
      const exactOtherTypes = matches.filter((n) => n.type !== "FRAME").map((n) => n.type);
      const validation = children[name];
      return {
        name,
        canonical,
        exactFrames,
        exactOtherTypes,
        validation,
        pass: exactFrames === 1 && exactOtherTypes.length === 0 && validation.pass
      };
    });
    const section = (name) => {
      const entry = sections.find((s) => s.name === name);
      return entry?.exactFrames === 1 && entry.exactOtherTypes.length === 0 ? page?.children.find((n) => n.type === "FRAME" && n.name === entry.canonical) : void 0;
    };
    const result = (name) => sections.find((s) => s.name === name).validation;
    const shell = section("Shared Staff Shell")?.children.find((n) => n.type === "FRAME" && n.name === SHELL_NAME);
    const nav = shell?.findAll((n) => n.type === "FRAME" && n.name === "Staff navigation")[0];
    const primary = nav?.children.filter((n) => n.type === "FRAME" && n.name.startsWith("Primary /")).map((n) => n.name) ?? [];
    const conversations = section("Conversations");
    const owner = (key, label) => {
      const frame2 = conversations?.children.find((n) => n.type === "FRAME" && n.name === conversationName(key));
      return Boolean(frame2 && allText(frame2).includes(label));
    };
    const semanticChecks = [
      check7("Shared Shell / exactly six approved top-level areas", primary.length === NAV_PRIMARY.length && NAV_PRIMARY.every((n) => primary.includes(`Primary / ${n}`))),
      check7("Conversations / Support, Sales and Human ownership", owner("Support Active", "Support Agent") && owner("Sales Active", "Sales Agent") && owner("Human Takeover", "Human Operator")),
      check7("Conversations / 13 variants", VARIANTS.every((v) => byLabel(result("Conversations"), v.title))),
      check7("Escalations / 8 variants", ESCALATION_VARIANTS.every((v) => byLabel(result("Escalations"), v.title))),
      check7("Orders / 7 variants", ORDER_VARIANTS.every((v) => byLabel(result("Orders"), v.title))),
      check7("Customer Web Chat / 10 variants", WEB_CHAT_VARIANTS.every((v) => byLabel(result("Customer Web Chat"), `Variant / ${v.key}`))),
      check7("Analytics / 6 variants", ANALYTICS_VARIANTS.every((v) => byLabel(result("Analytics"), `Variant / ${v.key}`))),
      check7("Forecasts / 8 variants", FORECAST_VARIANTS.every((v) => byLabel(result("Forecasts"), `Variant / ${v.key}`)))
    ];
    const required = [
      ["Shared Staff Shell", ["Audit restricted/contextual navigation", "Agent Runs restricted/contextual navigation", "No prohibited architecture navigation"]],
      ["Conversations", ["Handoff does not transfer permissions", "Proposal is not executed", "Known failure \xB7 no hold", "OUTCOME_UNKNOWN \xB7 reconcile / no blind retry", "Message delivery failure after confirmed effect"]],
      ["Escalations", ["OUTCOME_UNKNOWN reconciliation / no blind retry", "E02 update_order restricted, not unknown", "TARGET M12 decision \u2192 revalidation \u2192 request, no replay", "Resolved distinct from Closed"]],
      ["Orders", ["Known Failure is known and has authorized recovery", "OUTCOME_UNKNOWN reconciles before retry", "Stale / Conflict requires refresh and revalidation", "E02 update restricted and separate", "Order Delivery remains separate from Message Delivery"]],
      ["Customer Web Chat", ["Confirmation Request / explicit business authorization", "Confirmation Pending / unknown result in customer language", "Message Delivery Failure / transport and business effect separate"]],
      ["Analytics", ["Valid Empty / successful no-record result", "Incomplete / visible gap, not zero", "Dependency Unavailable / no substitute zero", "Permission Denied / no protected report values"]],
      ["Forecasts", ["TARGET Ready / illustrative and separate from current", "TARGET Ready / ACTUAL, cutoff and dashed PREDICTED", "MODEL_NOT_READY / current and no result", "Insufficient History / short but available", "Incomplete History / missing coverage, not zero", "Permission Denied / protected result withheld"]]
    ];
    for (const [name, labels] of required) for (const label of labels) semanticChecks.push(check7(`${name} / ${label}`, byLabel(result(name), label)));
    for (const name of ["Conversations", "Escalations", "Orders", "Customer Web Chat", "Analytics", "Forecasts"])
      semanticChecks.push(check7(`${name} / all existing checks`, result(name).pass));
    semanticChecks.push(check7("Shared Staff Shell / all existing checks", result("Shared Staff Shell").pass));
    const geometryChecks = [];
    const geometryCounts = [
      ["Conversations", 8],
      ["Escalations", ESCALATION_VARIANTS.length],
      ["Orders", ORDER_VARIANTS.length],
      ["Customer Web Chat", WEB_CHAT_VARIANTS.length],
      ["Analytics", ANALYTICS_VARIANTS.length],
      ["Forecasts", FORECAST_VARIANTS.length]
    ];
    const geometryLabel = (name, label) => name === "Conversations" ? /result region unique$|result layout fits$|delivery layout fits$/i.test(label) : /(?:^|\/ )geometry$|mobile geometry$|ACTUAL, cutoff and dashed PREDICTED$/.test(label);
    for (const [name, minimum] of geometryCounts) {
      const checks = result(name).checks.filter((c) => geometryLabel(name, c.label));
      geometryChecks.push(check7(
        `${name} / generated-node geometry`,
        sections.find((s) => s.name === name)?.exactFrames === 1 && checks.length >= minimum && checks.every((c) => c.pass),
        `${checks.filter((c) => c.pass).length}/${checks.length} checks; minimum ${minimum}`
      ));
    }
    const representativeSources = [
      "Navigation / Primary Item",
      "Conversation / Message Row",
      "Business / Order State",
      "Business / Reservation State",
      "Web Chat / Confirmation Request",
      "Analytics / Historical Chart",
      "Forecast / Actual vs Predicted Chart"
    ];
    const assetChecks = [
      check7("Phase 3C Design System page", assets.pageExists),
      check7("Phase 3C semantic color variables", assets.variables > 0, `${assets.variables} found`),
      ...representativeSources.map((name) => check7(`Phase 3C source / ${name}`, assets.components.find((c) => c.canonicalName === `Component / ${name}`)?.found === true)),
      check7("Shared Shell / native Phase 3C navigation references", hasInstance(section("Shared Staff Shell"), "Phase 3C / Active Primary Item") && hasInstance(section("Shared Staff Shell"), "Phase 3C / Restricted Link reference")),
      check7("Conversations / native Phase 3C message rows", hasInstance(conversations, "Phase 3C / Customer message") && hasInstance(conversations, "Phase 3C / Business reply")),
      check7("Escalations / native Phase 3C decision assets", hasInstance(section("Escalations"), "Selected Queue Item") && hasInstance(section("Escalations"), "Human Decision") && hasInstance(section("Escalations"), "Uncertain Effect")),
      check7("Customer Web Chat / native Phase 3C confirmation", hasInstance(section("Customer Web Chat"), "Confirmation Request component")),
      check7("Analytics / native Phase 3C historical chart", hasInstance(section("Analytics"), "Historical Chart component")),
      check7("Forecasts / native Phase 3C target chart", hasInstance(section("Forecasts"), "Actual vs Predicted Chart component")),
      ...sections.map((s) => check7(`${s.name} / semantic color binding`, hasBoundColor(section(s.name))))
    ];
    const sourceChecks = [
      check7("03A \u2014 Low-Fi Wireframes / protected", figma.root.children.filter((p) => p.name === "03A \u2014 Low-Fi Wireframes").length === 1),
      check7("03B \u2014 UX Review & Revisions / protected", figma.root.children.filter((p) => p.name === "03B \u2014 UX Review & Revisions").length === 1),
      check7("03C \u2014 Design System / protected", figma.root.children.filter((p) => p.name === "03C \u2014 Design System").length === 1)
    ];
    const semantic2 = semanticChecks.every((c) => c.pass);
    const geometry4 = geometryChecks.every((c) => c.pass);
    const assetUsage = assetChecks.every((c) => c.pass);
    const sourceProtection = sourceChecks.every((c) => c.pass);
    return {
      pass: Boolean(page && page.name === TARGET_PAGE) && sections.every((s) => s.pass) && semantic2 && geometry4 && assetUsage && sourceProtection,
      sections,
      semantic: semantic2,
      geometry: geometry4,
      assetUsage,
      sourceProtection,
      semanticChecks,
      geometryChecks,
      assetChecks,
      sourceChecks
    };
  }
  function formatAggregateValidation(result) {
    const state = (pass) => pass ? "PASS" : "FAIL";
    const p0 = result.sections.slice(1).filter((s) => s.pass).length;
    const lines = [
      "PHASE 3D HIGH-FIDELITY VALIDATION",
      `Page: ${TARGET_PAGE}`,
      "",
      ...result.sections.map((s) => `${s.name}: ${state(s.pass)}`),
      "",
      `P0 high-fi screens: ${p0}/6 ${state(p0 === 6)}`,
      `plus Shared Shell ${state(result.sections[0].pass)}`,
      `Semantic consistency: ${state(result.semantic)}`,
      `Geometry: ${state(result.geometry)}`,
      `Phase 3C asset usage: ${state(result.assetUsage)}`,
      `Source-page protection: ${state(result.sourceProtection)}`,
      `Overall: ${state(result.pass)}`,
      "",
      "Canonical section containers:",
      ...result.sections.map((s) => `- ${s.canonical}: ${s.exactFrames} exact FRAME; ${s.exactOtherTypes.length} exact-name other type(s)${s.exactOtherTypes.length ? ` (${s.exactOtherTypes.join(", ")})` : ""}`),
      "",
      "Semantic consistency:",
      ...result.semanticChecks.map((c) => `- ${c.label}: ${state(c.pass)}`),
      "",
      "Geometry:",
      ...result.geometryChecks.map((c) => `- ${c.label}: ${state(c.pass)}${c.detail ? ` (${c.detail})` : ""}`),
      "",
      "Phase 3C asset usage:",
      ...result.assetChecks.map((c) => `- ${c.label}: ${state(c.pass)}${c.detail ? ` (${c.detail})` : ""}`),
      "",
      "Source-page protection (read-only inspection):",
      ...result.sourceChecks.map((c) => `- ${c.label}: ${state(c.pass)}`),
      ...result.sections.flatMap((s) => ["", `${s.name} existing validator:`, ...s.validation.checks.map((c) => `- ${c.label}: ${state(c.pass)}${c.detail ? ` (${c.detail})` : ""}`)]),
      "",
      "Scope:",
      "structural, semantic and generated-node geometry validation;",
      "manual visual review remains separate and has been performed externally."
    ];
    return lines.join("\n");
  }

  // src/code.ts
  figma.showUI(__html__, { width: 386, height: 890, themeColors: true });
  function output(report, copy = false) {
    figma.ui.postMessage({ type: "report", report, copy });
  }
  async function run(action2) {
    assertFile();
    if (action2 === "inspect-3d") {
      output(formatInspection(await inspectPhase3D()));
      return;
    }
    if (action2 === "inspect-3c") {
      output(formatAssets(await inspectDesignSystem()));
      return;
    }
    if (action2 === "validate-shell") {
      const result = validateSharedShell(await readPage());
      output(`PHASE 3D SHARED SHELL VALIDATION
${result.checks.map((c) => `${c.label}: ${c.pass ? "PASS" : "FAIL"}`).join("\n")}

${result.pass ? "PASS" : "FAIL"} \xB7 structural only; manual review required.`);
      return;
    }
    if (action2 === "validate-conversations") {
      const result = validateConversations(await readPage());
      output(`PHASE 3D CONVERSATIONS VALIDATION
${result.checks.map((c) => `${c.label}: ${c.pass ? "PASS" : "FAIL"}`).join("\n")}

${result.pass ? "PASS" : "FAIL"} \xB7 structural only; manual review required.`);
      return;
    }
    if (action2 === "validate-escalations") {
      output(formatEscalationValidation(validateEscalations(await readPage())));
      return;
    }
    if (action2 === "validate-orders") {
      output(formatOrdersValidation(validateOrders(await readPage())));
      return;
    }
    if (action2 === "validate-web-chat") {
      output(formatWebChatValidation(validateWebChat(await readPage())));
      return;
    }
    if (action2 === "validate-analytics") {
      output(formatAnalyticsValidation(validateAnalytics(await readPage())));
      return;
    }
    if (action2 === "validate-forecasts") {
      output(formatForecastValidation(validateForecasts(await readPage())));
      return;
    }
    if (action2 === "validate-3d" || action2 === "copy-report") {
      const page = await readPage();
      const assets = await inspectDesignSystem();
      output(formatAggregateValidation(validatePhase3DAggregate(page, assets)), action2 === "copy-report");
      return;
    }
    if (action2 === "build-shell" || action2 === "build-conversations" || action2 === "build-escalations" || action2 === "build-orders" || action2 === "build-web-chat" || action2 === "build-analytics" || action2 === "build-forecasts") {
      if (action2 !== "build-shell") {
        const page2 = await readPage();
        const section = page2 ? exactFrame(page2, SECTIONS2.shell) : void 0;
        if (!section || !exactFrame(section, SHELL_NAME)) throw new Error("Build and manually review Shared Staff Shell before building another high-fi section.");
        if (action2 === "build-escalations" || action2 === "build-orders" || action2 === "build-web-chat" || action2 === "build-analytics" || action2 === "build-forecasts") {
          const conversations = page2 ? exactFrame(page2, SECTIONS2.conversations) : void 0;
          if (!conversations || VARIANTS.some((v) => !exactFrame(conversations, conversationName(v.key)))) throw new Error("Build and manually review all 13 Conversations variants before building the next section.");
        }
        if (action2 === "build-orders" || action2 === "build-web-chat" || action2 === "build-analytics" || action2 === "build-forecasts") {
          const escalations = page2 ? exactFrame(page2, SECTIONS2.escalations) : void 0;
          if (!escalations || ESCALATION_VARIANTS.some((v) => !exactFrame(escalations, escalationName(v.key)))) throw new Error("Build and manually review all 8 Escalations variants before building Orders.");
        }
        if (action2 === "build-web-chat" || action2 === "build-analytics" || action2 === "build-forecasts") {
          const orders = page2 ? exactFrame(page2, SECTIONS2.orders) : void 0;
          if (!orders || ORDER_VARIANTS.some((v) => !exactFrame(orders, orderName(v.key)))) throw new Error("Build and manually review all 7 Orders variants before building Customer Web Chat.");
        }
        if (action2 === "build-forecasts") {
          const analytics = page2 ? exactFrame(page2, SECTIONS2.analytics) : void 0;
          if (!analytics || ANALYTICS_VARIANTS.some((v) => !exactFrame(analytics, analyticsName(v.key)))) throw new Error("Build and manually review all 6 Analytics variants before building Forecasts.");
        }
        if (action2 === "build-analytics" || action2 === "build-forecasts") {
          const webChat = page2 ? exactFrame(page2, SECTIONS2.webChat) : void 0;
          if (!webChat || WEB_CHAT_VARIANTS.some((v) => !exactFrame(webChat, webChatName(v.key)))) throw new Error("Build and manually review all 10 Customer Web Chat variants before building Analytics.");
        }
      }
      const assets = await loadDesignAssets();
      await loadFonts();
      const page = await writablePage();
      const names = action2 === "build-shell" ? buildSharedShell(page) : action2 === "build-conversations" ? buildConversations(page) : action2 === "build-escalations" ? buildEscalations(page) : action2 === "build-orders" ? buildOrders(page) : action2 === "build-web-chat" ? buildWebChat(page) : action2 === "build-analytics" ? buildAnalytics(page) : buildForecasts(page);
      output([
        `${action2 === "build-shell" ? "Shared Staff Shell" : action2 === "build-conversations" ? "Conversations High-Fi" : action2 === "build-escalations" ? "Escalations High-Fi" : action2 === "build-orders" ? "Orders High-Fi" : action2 === "build-web-chat" ? "Customer Web Chat High-Fi" : action2 === "build-analytics" ? "Analytics High-Fi" : "Forecasts High-Fi"} built on 03D only.`,
        `Generated frames: ${names.length}.`,
        `Phase 3C assets found: ${assets.components.filter((c) => c.found).length}/${assets.components.length}.`,
        `Asset gaps: ${assets.gaps.join(", ") || "none"}.`,
        "Native instances are used where they fit; narrow screen regions use Phase 3C semantic-token compositions.",
        "Manual visual review is required."
      ].join("\n"));
    }
  }
  figma.ui.onmessage = async (message) => {
    if (message?.type !== "action") return;
    try {
      figma.ui.postMessage({ type: "busy", action: message.action });
      await run(message.action);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      output(`ERROR \xB7 ${detail}
No historical page or Phase 3C source asset was modified.`);
    } finally {
      figma.ui.postMessage({ type: "ready" });
    }
  };
})();

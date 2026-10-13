"use strict";
(() => {
  // src/constants.ts
  var PLUGIN_NAME = "Diploma UX \u2014 Phase 3B";
  var TARGET_PAGE = "03B \u2014 UX Review & Revisions";
  var BASELINE_PAGE = "03A \u2014 Low-Fi Wireframes";
  var TARGET_FILE_NAME = "Diplom \u2014 Multi-Agent Platform UX/UI";
  var TARGET_FILE_KEY = "OFXTN83nFl3RqukrEYQrFy";
  var SECTION_LABELS = {
    escalations: "03 \u2014 Escalations Revised",
    orders: "04 \u2014 Orders Revised",
    webChat: "05 \u2014 Customer Web Chat Revised",
    analytics: "06 \u2014 Analytics Revised",
    forecasts: "07 \u2014 Forecasts Revised",
    walkthroughs: "08 \u2014 Scenario Walkthroughs"
  };

  // src/specs/phase3b-spec.ts
  var panel = (heading, ...lines) => ({ heading, lines });
  var attention = (heading, ...lines) => ({ heading, lines, tone: "attention" });
  var unknownOutcome = (operation) => attention(
    "OUTCOME UNKNOWN (OUTCOME_UNKNOWN) \u2014 confirmation pending",
    "Effect may have committed.",
    "Confirmation unavailable.",
    "Reconciliation required.",
    "DO NOT retry mutation.",
    `Operation: ${operation}`
  );
  var screen = (name, title, subtitle, surface, status2, columns, extras = {}) => ({ name, title, subtitle, surface, status: status2, columns, ...extras });

  // src/builders/analytics.ts
  var controls = panel("Metric / period", "Metric: Sales volume \u25BE", "Period: Last 30 days \u25BE", "Observed / historical data only.");
  var history = panel("Historical chart placeholder", "Time  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2192", "Value   \u2591  \u2592  \u2591  \u2593  \u2592  \u2591", "Actual observations; no predicted values.");
  var table = panel("Historical detail table", "Date        Actual value      Source", "<date>      <value>           <source>");
  var analytics = {
    key: "analytics",
    label: SECTION_LABELS.analytics,
    intro: "Analytics reports observed facts. Missing or unavailable data is never drawn as a zero-value chart.",
    screens: [
      screen("3B / Analytics / Loading", "Analytics", "Loading state keeps metric and period visible.", "staff", "Loading", [[controls, panel("KPI summary", "Loading observed data\u2026")], [panel("Chart / table", "Loading historical result\u2026")]], { references: ["Forecasts"] }),
      screen("3B / Analytics / Valid Result", "Analytics", "Actual historical results with freshness and completeness metadata.", "staff", "Valid Result", [[controls, panel("KPI summary", "Observed sales: <value>", "Compared with prior period: <value>"), history], [table, panel("Data quality", "Completeness: complete", "Freshness: updated <time>"), panel("Related", "Open Forecasts for predicted information.")]], { actions: ["Open Forecasts"], references: ["Forecasts"] }),
      screen("3B / Analytics / Valid Empty", "Analytics", "Valid zero observations are distinct from a failed data load.", "staff", "Valid Empty", [[controls, panel("Result", "No recorded activity for this selected period.", "Source query completed successfully.")], [panel("Data quality", "Completeness: complete", "Freshness: updated <time>")]], { actions: ["Change period"] }),
      screen("3B / Analytics / Incomplete Data", "Analytics", "Partial observed data is labelled incomplete.", "staff", "Incomplete Data", [[controls, attention("Partial result", "Some source records are missing.", "Do not treat this as a complete business total.")], [history, panel("Data quality", "Completeness: incomplete", "Missing range/source: <placeholder>")]], { actions: ["Review missing data"] }),
      screen("3B / Analytics / Stale Data", "Analytics", "Historical data may be valid but out of date.", "staff", "Stale Data", [[controls, attention("Data is stale", "Last successful update: <time>", "Newer activity may not be included.")], [history, table]], { actions: ["Refresh data"] }),
      screen("3B / Analytics / Dependency Unavailable", "Analytics", "Unavailable is not zero.", "staff", "Dependency Unavailable", [[controls, attention("DATA UNAVAILABLE", "The historical data source could not be reached.", "This does NOT mean sales = 0.")], [panel("Chart / table unavailable", "No zero-value chart is displayed."), panel("Next step", "Try again later or contact support.")]], { actions: ["Try loading again"] }),
      screen("3B / Analytics / Permission Denied", "Analytics", "No unauthorized metric details are revealed.", "staff", "Permission Denied", [[attention("Access restricted", "You do not have permission to view this metric.")], [panel("Next step", "Choose an allowed metric or request access.")]], { actions: ["Choose another metric"] })
    ]
  };

  // src/builders/escalations.ts
  var escalations = {
    key: "escalations",
    label: SECTION_LABELS.escalations,
    intro: "Reviewed operator states. Existing manual 03B work is preserved; these are clearly labelled revised variants.",
    screens: [
      screen("3B / Escalations / Queue Revised", "Escalations", "Triage only: status, owner and safe next destination; full investigation lives in Decision Context.", "staff", "Waiting / Assigned / Awaiting Decision", [
        [panel("Queue filters", "Waiting assignment  |  Assigned  |  Awaiting decision", "Stale state  |  Authorization changed  |  Resume pending \u2014 TARGET M12", "OUTCOME_UNKNOWN  |  Reconciliation required  |  Resolved  |  Closed"), panel("Queue rows", "Case E-104  \xB7  Waiting assignment  \xB7  Needs owner", "Case E-105  \xB7  Assigned  \xB7  Decision pending", "Case E-106  \xB7  OUTCOME_UNKNOWN  \xB7  Reconciliation required", "Case E-107  \xB7  Resume pending \u2014 TARGET M12  \xB7  Revalidation required")],
        [panel("Selected case preview", "Reason: reservation confirmation unavailable", "Confirmed: order exists", "Next: open Decision Context for reconciliation"), panel("Cross-screen references", "Conversation \u2192 Escalation", "Escalation \u2192 Conversation", "Escalation \u2192 Order")]
      ], { actions: ["Open decision context"] }),
      screen("3B / Escalations / Decision Context", "Escalations", "Reservation uncertainty example. Read top to bottom before a human decision.", "staff", "Awaiting Decision / Reconciliation Required", [[
        attention("WHY AUTOMATION STOPPED", "reserve_inventory confirmation is unavailable.", "Automation paused to avoid repeating a mutation whose effect may already exist."),
        panel("CONFIRMED FACTS", "Example order ORD-1042 exists.", "create_order \u2014 CONFIRMED.", "Inventory last observed at 10:42; this snapshot does not prove reservation state."),
        attention("UNCERTAIN EFFECT", "reserve_inventory \u2014 OUTCOME_UNKNOWN.", "Confirmation unavailable; effect may already have committed.", "Neither confirmed success nor known failure.", "Operation: <operation reference>"),
        attention("CONSTRAINTS", "Do not retry reservation before reconciliation.", "No blind retry or automatic mutation replay.", "Recheck current authorization before any continuation."),
        panel("NEXT SAFE STEP", "Reconcile the authoritative reservation state.", "Record the result \u2192 then choose a safe continuation.", "If still uncertain, keep the escalation pending."),
        panel("HUMAN DECISION", "Decide on the proposed continuation only after reconciliation.", "Record the decision; revalidation is required before a controlled resume request.")
      ]], { actions: ["After reconciliation: approve proposed continuation", "Reject proposed continuation", "Request clarification", "Revalidate \u2192 Resume request (TARGET M12)", "Close escalation"], annotation: "TARGET M12 \u2014 Resume is a controlled request after human decision and revalidation. No mutation replay.", references: ["Conversation", "Order", "Agent Run (reference only)"] }),
      screen("3B / Escalations / OUTCOME_UNKNOWN", "Escalations", "Unknown mutation outcome is neither success nor confirmed failure.", "staff", "OUTCOME_UNKNOWN / Reconciliation Required", [
        [unknownOutcome("reserve_inventory / <operation reference>"), panel("Known context", "Customer confirmation: recorded.", "Order: created.", "Reservation: not confirmed.")],
        [attention("Required operator path", "Check source-of-truth state using operation/context reference.", "Document reconciliation result.", "Do not issue a blind retry."), panel("Next safe outcome", "If confirmed: communicate without repeating mutation.", "If failed: decide a new authorized action.", "If still unknown: keep pending and escalate.")]
      ], { actions: ["Start reconciliation", "Open linked Order"] }),
      screen("3B / Escalations / Stale", "Escalations", "State changed after the escalation was opened.", "staff", "Stale", [
        [attention("Stale context", "The linked order or inventory state may have changed.", "The original proposal is not a confirmed business effect.")],
        [panel("Recovery", "Refresh source facts.", "Compare old and current state.", "Require a new human decision when conflict remains.")]
      ], { actions: ["Refresh context", "Record conflict"] }),
      screen("3B / Escalations / Authorization Changed", "Escalations", "A role or permission change blocks automatic continuation.", "staff", "Authorization Changed", [
        [attention("Permission gate", "Previous access must not be reused.", "Support \u2192 Sales handoff does not transfer permissions.")],
        [panel("Next decision", "Recheck current actor permissions.", "Route to an authorized human or policy path.")]
      ], { actions: ["Check authorization", "Route to authorized staff"] }),
      screen("3B / Escalations / E02 Update Restricted", "Escalations", "Separate update_order restriction; unrelated to an uncertain reservation outcome.", "staff", "E02 \u2014 UPDATE RESTRICTED", [[
        attention("WHY AUTOMATION STOPPED", "Requested order update cannot proceed automatically.", "E02 restricts update_order; no update is shown as completed."),
        panel("CONFIRMED FACTS", "The existing order remains available for review.", "No successful update_order effect is claimed."),
        attention("CONSTRAINTS", "update_order mutation remains restricted.", "Do not treat this as reservation OUTCOME_UNKNOWN."),
        panel("NEXT SAFE STEP", "Route to human/policy handling.", "The unresolved E02 business policy is not invented here.")
      ]], { actions: ["Open linked Order", "Request human/policy review"] }),
      screen("3B / Escalations / Resume Pending", "Escalations", "Resume is a target concept, not an automatic rerun of a mutation.", "staff", "Resume Pending", [
        [panel("Safe sequence", "Human decision \u2192 Revalidation \u2192 Safe resume request.", "Recheck current facts, permission and operation outcome.")],
        [attention("No mutation replay", "Resume does not mean create_order or reserve_inventory runs again.", "Reconciliation is mandatory when outcome is unknown.")]
      ], { actions: ["Record human decision", "Revalidate \u2192 Resume request (TARGET M12)"], annotation: "TARGET UX \u2014 M12 durable resume is not currently implemented. No mutation replay." }),
      screen("3B / Escalations / Resolved and Closed", "Escalations", "Terminal handling remains explicit and auditable.", "staff", "Resolved / Closed", [
        [panel("Resolved", "Human decision recorded.", "Business effect verified or safely abandoned.", "Customer communication tracked separately.")],
        [panel("Closed", "No pending reconciliation or decision.", "Read-only history and linked Conversation / Order remain available.")]
      ], { references: ["Conversation", "Order"] })
    ]
  };

  // src/builders/forecasts.ts
  var controls2 = panel("Forecast request", "Target: Sales \u25BE", "Cutoff: <last actual date> \u25BE", "Horizon: <future period> \u25BE");
  var provenance = panel("Provenance / limitations", "Model/version: <placeholder>", "Created: <timestamp>", "Source history: <reference>", "Limitations: <model constraints>");
  var forecasts = {
    key: "forecasts",
    label: SECTION_LABELS.forecasts,
    intro: "Predictions are a separate surface from historical Analytics. Current engineering state is MODEL_NOT_READY.",
    screens: [
      screen("3B / Forecasts / TARGET Ready", "Forecasts", "Future target UX; this is not the current implemented engineering result.", "staff", "TARGET Ready", [[controls2, panel("ACTUAL \u2014 historical", "<date>  |  <observed value>", "Values before cutoff only."), panel("PREDICTED \u2014 future", "<future date>  |  <predicted value>", "Values after cutoff only.")], [panel("Actual / predicted chart placeholder", "ACTUAL: solid historical line", "Cutoff: vertical divider", "PREDICTED: dashed future line"), provenance]], { annotation: "TARGET PRODUCT UX \u2014 a ready forecast is a future product state, not current M13 output.", references: ["Analytics"] }),
      screen("3B / Forecasts / MODEL_NOT_READY", "Forecasts", "Current engineering state. No prediction has been produced.", "staff", "MODEL_NOT_READY", [[controls2, attention("CURRENT ENGINEERING STATE", "Forecast is currently unavailable.", "No prediction has been produced.", "This is not zero forecast or a valid empty result.")], [panel("Historical reference", "Open Analytics for observed actuals."), panel("Prediction area", "No predicted chart or zero-value bars are shown.")]], { actions: ["Open Analytics"], annotation: "CURRENT ENGINEERING STATE \u2014 M13 forecast artifact is not ready." }),
      screen("3B / Forecasts / Insufficient History", "Forecasts", "Not enough observed history for this request.", "staff", "Insufficient History", [[controls2, attention("Cannot forecast", "Insufficient historical observations.")], [panel("Next step", "Choose a different target or wait for more history.", "No prediction produced.")]], { actions: ["Open Analytics"] }),
      screen("3B / Forecasts / Unsupported Horizon", "Forecasts", "Request is outside supported horizon.", "staff", "Unsupported Horizon", [[controls2, attention("Unsupported request", "The selected horizon is not supported.", "No prediction produced.")], [panel("Next step", "Choose a supported horizon.")]], { actions: ["Change horizon"] }),
      screen("3B / Forecasts / Model Unavailable", "Forecasts", "Model dependency could not be reached.", "staff", "Model Unavailable", [[controls2, attention("Forecast unavailable", "The model service is unavailable.", "No prediction produced.")], [panel("Next step", "Try again later; historical Analytics remains separate.")]], { actions: ["Open Analytics"] }),
      screen("3B / Forecasts / Timeout", "Forecasts", "A timed-out request is not a zero prediction.", "staff", "Timeout", [[controls2, attention("Request timed out", "No confirmed forecast result is available.")], [panel("Next step", "Check status before a new request.")]], { actions: ["Check status"] }),
      screen("3B / Forecasts / Incomplete History", "Forecasts", "Incomplete historical inputs block a reliable prediction.", "staff", "Incomplete History", [[controls2, attention("Input data incomplete", "Required historical records are missing.", "No prediction produced.")], [panel("Next step", "Review Analytics completeness and source coverage.")]], { actions: ["Open Analytics"] }),
      screen("3B / Forecasts / Permission Denied", "Forecasts", "Prediction access is restricted.", "staff", "Permission Denied", [[attention("Access restricted", "You do not have permission to request this forecast.")], [panel("Next step", "Choose an allowed target or request access.")]], { actions: ["Choose another target"] })
    ]
  };

  // src/builders/orders.ts
  var orders = {
    key: "orders",
    label: SECTION_LABELS.orders,
    intro: "Order creation and inventory reservation are separate outcomes. No generic \u201COrder SUCCESS\u201D state hides a failed or unknown reservation.",
    screens: [
      screen("3B / Orders / List Revised", "Orders", "Scan two independent business states before opening an order.", "staff", "List / mixed outcomes", [
        [panel("Filters and search", "Search order/customer/reference", "Order: Created / Stale / Conflict", "Reservation: Confirmed / Failed / OUTCOME_UNKNOWN")],
        [panel("Order rows", "O-101  |  Order Created  |  Reservation Confirmed", "O-102  |  Order Created  |  Reservation Failed", "O-103  |  Order Created  |  Reservation OUTCOME_UNKNOWN", "O-104  |  Needs human attention")]
      ], { actions: ["Open order detail"], references: ["Conversation"] }),
      screen("3B / Orders / Detail / Reservation Confirmed", "Orders", "Confirmed business effects are shown as separate facts.", "staff", "Order Created / Reservation Confirmed", [
        [panel("ORDER STATE", "Created", "Order reference: <order id>")],
        [panel("RESERVATION STATE", "Confirmed", "Reservation reference: <reservation id>"), panel("NEXT STEP", "Inform customer; track delivery independently.")]
      ], { actions: ["Open Conversation"] }),
      screen("3B / Orders / Detail / Reservation Failed", "Orders", "A partial outcome must not be presented as full success.", "staff", "Order Created / Reservation Failed", [
        [panel("ORDER STATE", "Created", "Order exists; do not create a duplicate.")],
        [attention("RESERVATION STATE", "Failed", "Inventory is not reserved."), attention("NEXT STEP", "Review current inventory.", "Choose an authorized recovery path.")]
      ], { actions: ["Open Escalation", "Contact customer"] }),
      screen("3B / Orders / Detail / OUTCOME_UNKNOWN", "Orders", "Confirmation pending is not confirmed success or confirmed failure.", "staff", "Order Created / Reservation OUTCOME_UNKNOWN", [
        [panel("ORDER STATE", "Created", "Order reference: <order id>"), unknownOutcome("reserve_inventory / <operation reference>")],
        [attention("RESERVATION STATE", "OUTCOME_UNKNOWN", "Effect may have committed."), panel("NEXT STEP", "Reconcile against source of truth.", "Do not retry reserve_inventory until outcome is known.")]
      ], { actions: ["Start reconciliation", "Open Escalation"] }),
      screen("3B / Orders / Needs Human Attention", "Orders", "Operator sees why automation stopped and what is safe to decide.", "staff", "Needs human attention", [
        [panel("Confirmed", "Order creation confirmed."), attention("Unresolved", "Reservation not confirmed or policy gate raised.")],
        [panel("Human path", "Inspect linked Conversation and Escalation.", "Record decision; revalidate before any new mutation.")]
      ], { references: ["Conversation", "Escalation"], actions: ["Review linked case"] }),
      screen("3B / Orders / Stale or Conflict", "Orders", "A changed order requires fresh facts, not an outdated action.", "staff", "Stale / conflicting", [
        [attention("Conflict", "Order detail changed since the previous proposal.", "Do not apply a stale mutation.")],
        [panel("Next step", "Refresh order and reservation state.", "Resolve conflict with an authorized human decision.")]
      ], { actions: ["Refresh current state", "Escalate conflict"] }),
      screen("3B / Orders / E02 Restricted", "Orders", "Restricted update_order behavior is explicit; unresolved policy is not invented.", "staff", "E02 / update_order restricted", [
        [attention("Requested change blocked", "update_order cannot proceed automatically.", "No successful mutation has been shown.")],
        [panel("Next step", "Human / policy handling may be required.", "E02 business policy is unresolved; do not imply an approved path.")]
      ], { actions: ["View restriction details", "Request human review"], annotation: "E02 restriction remains an open business-policy question." }),
      screen("3B / Orders / Delivery Failure Independent", "Orders", "Business effect and customer communication have independent outcomes.", "staff", "Reservation Confirmed / Delivery Failed", [
        [panel("BUSINESS EFFECT", "Reservation confirmed.", "Do not run reserve_inventory again.")],
        [attention("COMMUNICATION", "Customer message delivery failed."), panel("NEXT STEP", "Retry delivery or contact customer; preserve confirmed reservation.")]
      ], { actions: ["Retry message delivery", "Contact customer"] })
    ]
  };

  // src/builders/walkthroughs.ts
  var flow = (title, nodes, note) => screen(
    `3B / Scenario / ${title}`,
    title,
    "Compact conceptual walkthrough; references existing screens without duplicating them.",
    "flow",
    "Scenario walkthrough",
    [[{ ...panel("Flow nodes", ...nodes.map((node, index) => `${index + 1}. ${node}`)), kind: "flow" }], [panel("Safety / result", note)]]
  );
  var walkthroughs = {
    key: "walkthroughs",
    label: SECTION_LABELS.walkthroughs,
    intro: "Six cross-surface checks, not duplicate screens. References: Conversation \u2192 Order; Order \u2192 Conversation; Conversation \u2192 Escalation; Escalation \u2192 Conversation / Order; Conversation \u2192 Agent Run (reference only); Analytics \u2192 Forecasts.",
    screens: [
      flow("1 Product Availability", ["Customer", "Conversation", "Sales", "Product lookup", "Inventory check", "Availability confirmed"], "Availability is confirmed only after inventory check."),
      flow("2 Purchase Successful Reservation", ["Customer confirmation", "create_order", "Order created", "reserve_inventory", "Reservation confirmed", "Customer result"], "create_order and reserve_inventory are separate business effects."),
      flow("3 Purchase Reservation Failure", ["create_order succeeds", "Order exists", "reserve_inventory fails", "Reservation failed", "Partial outcome", "Human attention"], "Do not present generic order success. The order exists but inventory is not reserved."),
      flow("4 Support Sales Handoff", ["Support", "Verified context", "Sales-required mutation", "Handoff", "Sales continues"], "Handoff does NOT transfer permissions. Sales rechecks authorization."),
      flow("5 OUTCOME_UNKNOWN Escalation", ["Mutation attempted", "Confirmation unavailable", "OUTCOME_UNKNOWN", "NO BLIND RETRY", "Reconciliation required", "Escalation", "Human decision", "Revalidation"], "Effect may have committed. M12 Resume is TARGET only; revalidate before any safe continuation."),
      flow("6 Analytics Forecast", ["Owner", "Historical Analytics", "ACTUAL values", "Forecast request", "MODEL_NOT_READY"], "CURRENT: no prediction. TARGET future path: Forecast available \u2192 ACTUAL and PREDICTED shown separately.")
    ]
  };

  // src/builders/web-chat.ts
  var webChat = {
    key: "webChat",
    label: SECTION_LABELS.webChat,
    intro: "Customer-facing only: plain language, no staff sidebar and no internal run/tool/audit terminology.",
    screens: [
      screen("3B / Web Chat / Initial", "Welcome", "A calm entry point with a message field and simple help cue.", "customer", "Initial", [[panel("Welcome", "Hi! What can we help you with today?", "Type your question below.")]], { actions: ["Send message"] }),
      screen("3B / Web Chat / Active", "Conversation", "Customer and assistant messages in a familiar chat layout.", "customer", "Active conversation", [[panel("Messages", "You: Is this product available?", "Assistant: I can check availability for you."), panel("Composer", "Type a reply\u2026")]], { actions: ["Send message"] }),
      screen("3B / Web Chat / Clarification Requested", "Conversation", "Ask for missing details before claiming an answer.", "customer", "Clarification requested", [[panel("Messages", "Assistant: Which size would you like me to check?", "You: <reply>")]], { actions: ["Send details"] }),
      screen("3B / Web Chat / Confirmation Required", "Confirm request", "Customer approval is required before an order or reservation attempt.", "customer", "Confirmation required", [[panel("Request summary", "Item: <product>", "Quantity: <quantity>", "We will only continue after you confirm.")]], { actions: ["Confirm order", "Change details"] }),
      screen("3B / Web Chat / Processing", "Working on it", "The request is being checked; a result has not been confirmed yet.", "customer", "Processing", [[panel("Progress", "We are checking your request.", "We'll update you here when the result is available.")]]),
      screen("3B / Web Chat / Confirmed Result", "Result", "Only confirmed outcomes are described as complete.", "customer", "Confirmed result", [[panel("Your request", "Your order has been created.", "The item is reserved.", "Reference: <order id>")]], { actions: ["View details"] }),
      screen("3B / Web Chat / Known Failure", "Request needs attention", "A known failure is explicit without technical internals.", "customer", "Known failure", [[attention("What happened", "Your order was created, but the item was not reserved.", "Please don't place the same order again."), panel("What happens next", "We will help you with the next step.")]], { actions: ["Ask for help"] }),
      screen("3B / Web Chat / Pending Human", "Waiting for support", "Human follow-up is visible without leaking internal handoff details.", "customer", "Waiting for human", [[panel("We are reviewing this", "A team member will check your request.", "We will update you when we have a confirmed answer.")]], { actions: ["Add a message"] }),
      screen("3B / Web Chat / Confirmation Pending", "Confirmation pending", "Unknown outcome must not be presented as success or final failure.", "customer", "Confirmation pending", [[attention("We are checking the result", "The request may have gone through, but we cannot confirm it yet.", "Please do not submit the same request again."), panel("Next", "We will verify the result and update you.")]], { actions: ["Contact support"] }),
      screen("3B / Web Chat / Delivery or Connection Failure", "Connection issue", "Communication failure is independent of the business action.", "customer", "Delivery / connection failure", [[attention("Message not delivered", "We could not deliver the latest update."), panel("Business result", "Your reservation remains confirmed.", "Reference: <reservation id>"), panel("Next", "Reconnect or contact us for the result; do not place the order again.")]], { actions: ["Reconnect", "Contact support"] })
    ]
  };

  // src/figma-utils.ts
  var gray = (level) => ({ r: level / 255, g: level / 255, b: level / 255 });
  var fill = (level) => ({ type: "SOLID", color: gray(level) });
  function findPageByName(name) {
    return figma.root.children.find((page) => page.name === name);
  }
  async function getTargetPage() {
    if (figma.root.name !== TARGET_FILE_NAME) {
      throw new Error(`Wrong Figma document (${figma.root.name}). Open ${TARGET_FILE_NAME}.`);
    }
    const fileKey = figma.fileKey;
    if (fileKey && fileKey !== TARGET_FILE_KEY) {
      throw new Error(`Wrong Figma file (${fileKey}). Open the specified diploma file.`);
    }
    const page = findPageByName(TARGET_PAGE);
    if (!page) throw new Error(`${TARGET_PAGE} page not found. Nothing was changed.`);
    if (!findPageByName(BASELINE_PAGE)) {
      throw new Error(`${BASELINE_PAGE} baseline page not found. Verify the Figma file first.`);
    }
    await page.loadAsync();
    return page;
  }
  function positionBelowExistingContent(page) {
    const bottoms = page.children.map((node) => node.absoluteBoundingBox).filter((box) => box !== null).map((box) => box.y + box.height);
    return { x: 0, y: Math.max(0, ...bottoms) + 240 };
  }
  async function loadSimpleFonts() {
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    } catch (error) {
      throw new Error(`Inter font could not be loaded: ${String(error)}`);
    }
  }
  function autoFrame(name, width, horizontal = false) {
    const node = figma.createFrame();
    node.name = name;
    node.layoutMode = horizontal ? "HORIZONTAL" : "VERTICAL";
    node.primaryAxisSizingMode = horizontal ? "FIXED" : "AUTO";
    node.counterAxisSizingMode = horizontal ? "AUTO" : "FIXED";
    node.resize(width, 100);
    node.paddingTop = 16;
    node.paddingBottom = 16;
    node.paddingLeft = 16;
    node.paddingRight = 16;
    node.itemSpacing = 10;
    node.fills = [fill(255)];
    node.strokes = [fill(180)];
    node.strokeWeight = 1;
    return node;
  }
  function addText(parent, value, size = 15, bold = false, width) {
    const node = figma.createText();
    parent.appendChild(node);
    node.fontName = { family: "Inter", style: bold ? "Bold" : "Regular" };
    node.characters = value;
    node.fontSize = size;
    node.fills = [fill(35)];
    node.resize(width ?? Math.max(160, parent.width - parent.paddingLeft - parent.paddingRight), 24);
    node.textAutoResize = "HEIGHT";
    return node;
  }
  function addDivider(parent) {
    const line = figma.createRectangle();
    parent.appendChild(line);
    line.name = "Low-fi divider";
    line.resize(Math.max(160, parent.width - parent.paddingLeft - parent.paddingRight), 1);
    line.fills = [fill(190)];
    return line;
  }
  function addChip(parent, label) {
    const chip = autoFrame(`Action / ${label}`, Math.max(160, Math.min(500, label.length * 9 + 32)));
    parent.appendChild(chip);
    chip.paddingTop = 8;
    chip.paddingBottom = 8;
    chip.fills = [fill(238)];
    addText(chip, label, 13, true, chip.width - 32);
    return chip;
  }
  function addPanel(parent, spec, width) {
    const panel2 = autoFrame(`${spec.kind ?? "panel"} / ${spec.heading}`, width);
    parent.appendChild(panel2);
    panel2.fills = [fill(spec.tone === "attention" ? 231 : 247)];
    panel2.strokes = [fill(spec.tone === "attention" ? 100 : 205)];
    addText(panel2, spec.heading, 16, true, width - 32);
    addDivider(panel2);
    for (const line of spec.lines) addText(panel2, line, 13, false, width - 32);
    return panel2;
  }
  function addScreen(parent, spec) {
    const screen2 = autoFrame(spec.name, 1200);
    parent.appendChild(screen2);
    try {
      screen2.paddingTop = 24;
      screen2.paddingBottom = 24;
      screen2.paddingLeft = 24;
      screen2.paddingRight = 24;
      screen2.itemSpacing = 14;
      const surface = spec.surface === "customer" ? "Customer Web Chat" : spec.surface === "flow" ? "Scenario map" : "Staff workspace";
      addText(screen2, `${surface}  /  ${spec.title}`, 24, true, 1152);
      addText(screen2, spec.subtitle, 13, false, 1152);
      addDivider(screen2);
      addPanel(screen2, { heading: `STATE  \u2014  ${spec.status}`, lines: [] }, 1152);
      const body = autoFrame("Screen content", 1152, true);
      screen2.appendChild(body);
      body.paddingTop = 0;
      body.paddingBottom = 0;
      body.paddingLeft = 0;
      body.paddingRight = 0;
      body.itemSpacing = 16;
      body.strokes = [];
      body.fills = [];
      if (spec.surface === "staff") {
        const nav = autoFrame("Staff navigation placeholder", 174);
        body.appendChild(nav);
        nav.fills = [fill(238)];
        for (const item of ["Conversations", "Escalations", "Orders", "Analytics", "Forecasts"]) {
          addText(nav, item, 12, item.toLowerCase() === spec.title.toLowerCase(), 142);
        }
      }
      const contentWidth = spec.surface === "staff" ? 946 : 1152;
      const content = autoFrame("Main content", contentWidth);
      body.appendChild(content);
      content.paddingTop = 0;
      content.paddingBottom = 0;
      content.paddingLeft = 0;
      content.paddingRight = 0;
      content.strokes = [];
      content.fills = [];
      const columns = spec.columns.length || 1;
      const columnWidth = Math.floor((contentWidth - (columns - 1) * 12) / columns);
      const columnRow = autoFrame("Content columns", contentWidth, true);
      content.appendChild(columnRow);
      columnRow.paddingTop = 0;
      columnRow.paddingBottom = 0;
      columnRow.paddingLeft = 0;
      columnRow.paddingRight = 0;
      columnRow.itemSpacing = 12;
      columnRow.strokes = [];
      columnRow.fills = [];
      for (let index = 0; index < columns; index++) {
        const column = autoFrame(`Column ${index + 1}`, columnWidth);
        columnRow.appendChild(column);
        column.paddingTop = 0;
        column.paddingBottom = 0;
        column.paddingLeft = 0;
        column.paddingRight = 0;
        column.strokes = [];
        column.fills = [];
        for (const panel2 of spec.columns[index]) addPanel(column, panel2, columnWidth);
      }
      if (spec.actions?.length) {
        addText(content, "NEXT SAFE ACTION", 12, true, contentWidth);
        for (const action of spec.actions) addChip(content, action);
      }
      if (spec.references?.length) addText(content, `References: ${spec.references.join("  \xB7  ")}`, 12, false, contentWidth);
      if (spec.annotation) addPanel(content, { heading: "ANNOTATION", lines: [spec.annotation] }, contentWidth);
      return screen2;
    } catch (error) {
      screen2.remove();
      throw error;
    }
  }
  function isGeneratedDescendant(node) {
    if (node.type === "TEXT") return true;
    if (node.type === "RECTANGLE") return node.name === "Low-fi divider";
    if (node.type !== "FRAME") return false;
    return node.name === "Screen content" || node.name === "Staff navigation placeholder" || node.name === "Main content" || node.name === "Content columns" || /^Column \d+$/.test(node.name) || /^(panel|table|chart|flow) \/ /.test(node.name) || node.name.startsWith("Action / ");
  }
  async function renderSection(page, spec) {
    if (page.name !== TARGET_PAGE || page.parent !== figma.root) throw new Error("Unsafe target page. Builder stopped.");
    const ownedNames = spec.screens.map((screen2) => screen2.name);
    const ownedSet = new Set(ownedNames);
    if (ownedSet.size !== ownedNames.length || ownedNames.some((name) => !name.startsWith("3B / ") || name.includes("/ Conversations /"))) {
      throw new Error("Invalid or duplicate builder-owned screen names. Nothing was changed.");
    }
    const sectionName = `3B / Plugin / ${spec.label}`;
    const candidates = page.children.filter((node) => node.type === "FRAME" && node.name === sectionName);
    if (candidates.length > 1) throw new Error(`Multiple sections named ${sectionName}. Resolve the ambiguity manually; nothing was changed.`);
    const existing = candidates[0];
    const found = page.findAll((node) => node.type === "FRAME" && ownedSet.has(node.name));
    if (found.some((node) => node.parent !== existing)) {
      throw new Error(`An expected generated screen name exists outside ${sectionName}. Resolve the collision manually; nothing was changed.`);
    }
    const oldScreens = existing?.children.filter((node) => node.type === "FRAME" && ownedSet.has(node.name)) ?? [];
    if (existing && oldScreens.length === 0) {
      throw new Error(`${sectionName} has no recognized builder screens. It may be manual work; nothing was changed.`);
    }
    if (new Set(oldScreens.map((node) => node.name)).size !== oldScreens.length) {
      throw new Error(`Duplicate generated screen names inside ${sectionName}. Resolve manually; nothing was changed.`);
    }
    for (const old of oldScreens) {
      const unknown = old.findAll((node) => !isGeneratedDescendant(node));
      if (unknown.length) {
        throw new Error(`${old.name} contains unrecognized nested layers (${unknown[0].name}). Preserve them manually before rerunning; nothing was changed.`);
      }
    }
    const position = existing ? void 0 : positionBelowExistingContent(page);
    await figma.setCurrentPageAsync(page);
    let root = existing;
    const createdScreens = [];
    try {
      if (!root) {
        root = autoFrame(sectionName, 1240);
        root.x = position.x;
        root.y = position.y;
        root.paddingTop = 20;
        root.paddingBottom = 20;
        root.paddingLeft = 20;
        root.paddingRight = 20;
        root.itemSpacing = 24;
        root.fills = [fill(245)];
        addText(root, spec.label, 28, true, 1200);
        addText(root, spec.intro, 14, false, 1200);
      }
      for (const screen2 of spec.screens) createdScreens.push(addScreen(root, screen2));
      for (const old of oldScreens) old.remove();
      try {
        figma.viewport.scrollAndZoomIntoView([root]);
      } catch {
      }
      return spec.screens.length;
    } catch (error) {
      if (!existing && root) root.remove();
      else for (const created of createdScreens) created.remove();
      throw new Error(`Builder failed; previous generated screens and unrelated layers were kept. ${String(error)}`);
    }
  }

  // src/validators/phase3b.ts
  function snapshot(page) {
    const nodes = page.findAll();
    return {
      names: nodes.map((node) => node.name),
      text: nodes.filter((node) => node.type === "TEXT").map((node) => node.characters)
    };
  }
  var contains = (items, term) => items.some((value) => value.toLowerCase().includes(term.toLowerCase()));
  var exact = (items, name) => items.includes(name);
  var every = (items, names) => names.every((name) => exact(items, name));
  function status(s, required, partialHint) {
    if (every(s.names, required)) return "PASS";
    if (contains(s.names, partialHint)) return "PARTIAL";
    return "FAIL";
  }
  function inspectPage(page) {
    const s = snapshot(page);
    const concepts = [...s.names, ...s.text];
    const conversations = contains(s.names, "Conversations Revised") || contains(s.names, "3B / Conversations /");
    const escalation = status(s, ["3B / Escalations / Queue Revised", "3B / Escalations / Decision Context"], "Escalation");
    const orders2 = status(s, ["3B / Orders / List Revised", "3B / Orders / Detail / Reservation Confirmed"], "Order");
    const simple = (label) => contains(s.names, label) ? "FOUND" : "MISSING";
    return [
      `PHASE 3B INSPECTION \u2014 READ ONLY`,
      `Page: ${TARGET_PAGE}`,
      `Conversations: ${conversations ? "FOUND" : "MISSING"}`,
      `Escalations: ${escalation === "PASS" ? "FOUND" : escalation === "PARTIAL" ? "PARTIAL" : "MISSING"}`,
      `Orders: ${orders2 === "PASS" ? "FOUND" : orders2 === "PARTIAL" ? "PARTIAL" : "MISSING"}`,
      `Web Chat: ${simple("Web Chat")}`,
      `Analytics: ${simple("Analytics")}`,
      `Forecasts: ${simple("Forecast")}`,
      `Walkthroughs: ${simple("Scenario")}`,
      "",
      "Concepts / names:",
      ...["OUTCOME_UNKNOWN", "MODEL_NOT_READY", "E02", "Resume", "Reconciliation"].map((term) => `${term}: ${contains(concepts, term) ? "FOUND" : "MISSING"}`),
      "",
      "Existing manual/AI layers are not changed by inspection."
    ].join("\n");
  }
  function validatePage(page) {
    const s = snapshot(page);
    const concepts = [...s.names, ...s.text];
    const checks = [
      ["Conversations present", contains(s.names, "Conversations Revised") || contains(s.names, "3B / Conversations /") ? "PASS" : "FAIL"],
      ["Escalations Queue present", status(s, ["3B / Escalations / Queue Revised"], "Escalation")],
      ["Escalations Detail present", status(s, ["3B / Escalations / Decision Context"], "Escalation")],
      ["Orders present", status(s, ["3B / Orders / Detail / Reservation Confirmed", "3B / Orders / Detail / Reservation Failed", "3B / Orders / Detail / OUTCOME_UNKNOWN"], "Order")],
      ["Web Chat present", status(s, ["3B / Web Chat / Initial", "3B / Web Chat / Active"], "Web Chat")],
      ["Analytics present", status(s, ["3B / Analytics / Valid Result", "3B / Analytics / Dependency Unavailable"], "Analytics")],
      ["Forecasts present", status(s, ["3B / Forecasts / TARGET Ready", "3B / Forecasts / MODEL_NOT_READY"], "Forecast")],
      ["OUTCOME_UNKNOWN present", contains(concepts, "OUTCOME_UNKNOWN") ? "PASS" : "FAIL"],
      ["MODEL_NOT_READY present", contains(concepts, "MODEL_NOT_READY") ? "PASS" : "FAIL"],
      ["E02 restriction present", contains(concepts, "E02") && contains(concepts, "restricted") ? "PASS" : contains(concepts, "E02") ? "PARTIAL" : "FAIL"],
      ["Order / Reservation separation present", contains(concepts, "ORDER STATE") && contains(concepts, "RESERVATION STATE") ? "PASS" : contains(s.names, "Order") ? "PARTIAL" : "FAIL"]
    ];
    for (let index = 1; index <= 6; index++) {
      checks.push([`Scenario ${index} present`, status(s, [`3B / Scenario / ${[
        "1 Product Availability",
        "2 Purchase Successful Reservation",
        "3 Purchase Reservation Failure",
        "4 Support Sales Handoff",
        "5 OUTCOME_UNKNOWN Escalation",
        "6 Analytics Forecast"
      ][index - 1]}`], SECTION_LABELS.walkthroughs)]);
    }
    const passed = checks.filter(([, result]) => result === "PASS").length;
    const scenarios = checks.slice(-6).filter(([, result]) => result === "PASS").length;
    return [
      "PHASE 3B FIGMA VALIDATION",
      `Page: ${TARGET_PAGE}`,
      `Plugin: ${PLUGIN_NAME}`,
      "",
      ...checks.map(([name, result]) => `${name}: ${result}`),
      "",
      `Scenario Walkthroughs: ${scenarios}/6`,
      `Structural checks: ${passed}/${checks.length} PASS`,
      "Scope: structural presence only; not semantic review or visual approval."
    ].join("\n");
  }

  // src/code.ts
  figma.showUI(__html__, { width: 500, height: 680, themeColors: true });
  var builders = {
    escalations,
    orders,
    webChat,
    analytics,
    forecasts,
    walkthroughs
  };
  var send = (message) => figma.ui.postMessage(message);
  figma.ui.onmessage = async (incoming) => {
    const action = incoming?.action;
    if (!action || !["inspect", "escalations", "orders", "webChat", "analytics", "forecasts", "walkthroughs", "validate"].includes(action)) {
      send({ kind: "result", action: "inspect", ok: false, message: "Unknown command. Nothing was changed." });
      return;
    }
    try {
      const page = await getTargetPage();
      if (action === "inspect") {
        send({ kind: "result", action, ok: true, message: "03B inspected without changes.", report: inspectPage(page) });
        return;
      }
      if (action === "validate") {
        send({ kind: "result", action, ok: true, message: "Structural validation finished.", report: validatePage(page) });
        return;
      }
      const spec = builders[action];
      if (!spec) throw new Error("Builder not found.");
      const before = inspectPage(page);
      await loadSimpleFonts();
      const count = await renderSection(page, spec);
      send({ kind: "result", action, ok: true, message: `${spec.label} completed: ${count} revised frames created/updated. Existing unowned work preserved.`, report: `BEFORE BUILDER
${before}

AFTER BUILDER
${inspectPage(page)}` });
      figma.notify(`${PLUGIN_NAME}: ${spec.label} complete`);
    } catch (error) {
      send({ kind: "result", action, ok: false, message: `${action} stopped: ${error instanceof Error ? error.message : String(error)}` });
    }
  };
})();

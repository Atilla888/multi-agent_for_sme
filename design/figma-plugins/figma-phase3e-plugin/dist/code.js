"use strict";
(() => {
  // src/constants.ts
  var TARGET_PAGE = "03E \u2014 Interactive Prototype";
  var SOURCE_PAGE = "03D \u2014 High-Fidelity Screens";
  var PROTECTED_PAGES = [
    "03A \u2014 Low-Fi Wireframes",
    "03B \u2014 UX Review & Revisions",
    "03C \u2014 Design System",
    SOURCE_PAGE
  ];
  var SOURCES = {
    conversationDefault: { section: "02 \u2014 Conversations", name: "3D / Conversations / Default" },
    conversationSupport: { section: "02 \u2014 Conversations", name: "3D / Conversations / Support Active" },
    conversationSales: { section: "02 \u2014 Conversations", name: "3D / Conversations / Sales Active" },
    conversationHandoff: { section: "02 \u2014 Conversations", name: "3D / Conversations / Support to Sales Handoff" },
    conversationConfirmation: { section: "02 \u2014 Conversations", name: "3D / Conversations / Awaiting Confirmation" },
    conversationProcessing: { section: "02 \u2014 Conversations", name: "3D / Conversations / Processing" },
    conversationConfirmed: { section: "02 \u2014 Conversations", name: "3D / Conversations / Confirmed Result" },
    conversationFailure: { section: "02 \u2014 Conversations", name: "3D / Conversations / Known Failure" },
    conversationUnknown: { section: "02 \u2014 Conversations", name: "3D / Conversations / OUTCOME_UNKNOWN" },
    escalationUnknown: { section: "03 \u2014 Escalations", name: "3D / Escalations / OUTCOME_UNKNOWN" },
    escalationDecision: { section: "03 \u2014 Escalations", name: "3D / Escalations / Awaiting Decision" },
    escalationResume: { section: "03 \u2014 Escalations", name: "3D / Escalations / Resume Pending" },
    orderConfirmed: { section: "04 \u2014 Orders", name: "3D / Orders / Reservation Confirmed" },
    orderFailed: { section: "04 \u2014 Orders", name: "3D / Orders / Reservation Failed" },
    analyticsValid: { section: "06 \u2014 Analytics", name: "3D / Analytics / Valid" },
    forecastNotReady: { section: "07 \u2014 Forecasts", name: "3D / Forecasts / MODEL_NOT_READY" },
    forecastTarget: { section: "07 \u2014 Forecasts", name: "3D / Forecasts / TARGET Ready" },
    chatConfirmation: { section: "05 \u2014 Customer Web Chat", name: "3D / Web Chat / Confirmation Required" },
    chatProcessing: { section: "05 \u2014 Customer Web Chat", name: "3D / Web Chat / Processing" },
    chatConfirmed: { section: "05 \u2014 Customer Web Chat", name: "3D / Web Chat / Confirmed Result" },
    chatDelivery: { section: "05 \u2014 Customer Web Chat", name: "3D / Web Chat / Message Delivery Failure" }
  };
  var FLOW1_BOARD = {
    start: { name: "3E / Flow 01 / START", text: "START \u2014 Flow 1: Product Availability" },
    step1: { name: "3E / Flow 01 / STEP 1", text: "STEP 1 \u2014 Customer asks about product availability" },
    step1Note: { name: "3E / Flow 01 / STEP 1 Note", text: "The conversation contains a product-availability request." },
    continue: { name: "3E / Flow 01 / Continue Scenario", marker: "PROTOTYPE CONTROL", text: "Continue scenario \u2192 Support checks verified context" },
    step2: { name: "3E / Flow 01 / STEP 2", text: "STEP 2 \u2014 Support uses verified Product + Inventory context" },
    productBoundary: { name: "3E / Flow 01 / Product Boundary", text: "Product exists \u2260 Inventory available" },
    inventoryBoundary: { name: "3E / Flow 01 / Inventory Boundary", text: "Observed inventory \u2260 promise of live stock" },
    end: { name: "3E / Flow 01 / END", text: "END \u2014 Flow 1\nSupport Active is the final scenario state." },
    legacyNote: "3E / Flow 01 / Note 1"
  };
  var FLOW2_BOARD = {
    start: { name: "3E / Flow 02 / START", text: "START \u2014 Flow 2: Purchase Success" },
    step1: { name: "3E / Flow 02 / STEP 1", text: "STEP 1 \u2014 Awaiting explicit customer confirmation" },
    proposalBoundary: { name: "3E / Flow 02 / Proposal Boundary", text: "Proposal \u2260 execution. The proposed business action has not executed yet." },
    confirmation: { name: "3E / Flow 02 / Customer Confirmation Received", marker: "PROTOTYPE CONTROL", text: "Customer confirmation received \u2192 Continue" },
    step2: { name: "3E / Flow 02 / STEP 2", text: "STEP 2 \u2014 Authorized business action is processing" },
    processingNote: { name: "3E / Flow 02 / Processing Boundary", text: "This prototype shows intended UX progression, not backend execution. Processing \u2260 confirmed result." },
    processingComplete: { name: "3E / Flow 02 / Business Result Confirmed", marker: "PROTOTYPE CONTROL", text: "Continue scenario \u2192 Business result confirmed" },
    step3: { name: "3E / Flow 02 / STEP 3", text: "STEP 3 \u2014 Business result confirmed" },
    confirmedNote: { name: "3E / Flow 02 / Confirmed Facts", text: "Order created and Reservation confirmed are independently trusted facts in the approved source." },
    orderSource: { name: "3E / Flow 02 / Open Order Source", text: "PRODUCT CONTROL \u2014 Open Order record \u2197" },
    orderControl: { name: "3E / Flow 02 / Open Resulting Order", marker: "PROTOTYPE CONTROL", text: "Open resulting Order" },
    step4: { name: "3E / Flow 02 / STEP 4", text: "STEP 4 \u2014 Order created; reservation confirmed" },
    orderBoundary: { name: "3E / Flow 02 / Order Boundary", text: "Order State \u2260 Reservation State. Reservation confirmation is a separate business fact." },
    deliveryBoundary: { name: "3E / Flow 02 / Delivery Boundary", text: "Message delivery \u2260 business effect. Communication failure must not replay Order or reservation effects." },
    backendBoundary: { name: "3E / Flow 02 / Prototype Boundary", text: "Prototype only: no create_order or reserve_inventory execution, live provider operation, M08 completion, or backend implementation is claimed." },
    end: { name: "3E / Flow 02 / END", text: "END \u2014 Flow 2\nReservation Confirmed is the final scenario state." }
  };
  var FLOW3_BOARD = {
    start: { name: "3E / Flow 03 / START", text: "START \u2014 Flow 3: Reservation Failure" },
    step1: { name: "3E / Flow 03 / STEP 1", text: "STEP 1 \u2014 Reservation failure is known" },
    confirmedFailure: { name: "3E / Flow 03 / Confirmed Failure", text: "The system has a confirmed failure result. The Order record may already exist." },
    knownBoundary: { name: "3E / Flow 03 / Known Boundary", text: "Known Failure \u2260 OUTCOME_UNKNOWN. This reservation result is known, not uncertain." },
    noReconciliation: { name: "3E / Flow 03 / No Reconciliation", text: "No reconciliation is required for a known failed reservation." },
    orderSource: { name: "3E / Flow 03 / Open Order Source", text: "PRODUCT CONTROL \u2014 Open Order record \u2197" },
    orderControl: { name: "3E / Flow 03 / Open Resulting Order", marker: "PROTOTYPE CONTROL", text: "Open resulting Order" },
    step2: { name: "3E / Flow 03 / STEP 2", text: "STEP 2 \u2014 Order exists; reservation failed" },
    orderBoundary: { name: "3E / Flow 03 / Order Boundary", text: "Order State \u2260 Reservation State. Order creation does not imply inventory reservation. Known reservation failure is independently represented." },
    inventoryBoundary: { name: "3E / Flow 03 / Inventory Boundary", text: "Product exists \u2260 Inventory available. Unavailable inventory \u2260 zero stock. Dependency unavailable \u2260 zero stock. No current stock value is claimed here." },
    recovery: { name: "3E / Flow 03 / Safe Recovery", text: "SAFE RECOVERY\nKnown failure allows an authorized next action. Review current inventory and choose an authorized recovery path. No reconciliation is needed because the reservation result is known." },
    end: { name: "3E / Flow 03 / END", text: "END \u2014 Flow 3\nReservation Failed is the final scenario state. Recovery requires a new authorized action; the failed reservation itself is not replayed blindly." }
  };
  var FLOW4_BOARD = {
    start: { name: "3E / Flow 04 / START", text: "START \u2014 Flow 4: Support \u2192 Sales Handoff" },
    step1: { name: "3E / Flow 04 / STEP 1", text: "STEP 1 \u2014 Support owns the conversation" },
    supportNote: { name: "3E / Flow 04 / Support Ownership", text: "Support is the current handler and works only within Support-authorized scope. Ownership \u2260 authorization." },
    requestSource: { name: "3E / Flow 04 / Handoff Request Source", text: "PRODUCT CONTROL \u2014 Request Sales handoff" },
    requestControl: { name: "3E / Flow 04 / Request Sales Handoff", marker: "PROTOTYPE CONTROL", text: "Request Sales handoff \u2192 Continue" },
    step2: { name: "3E / Flow 04 / STEP 2", text: "STEP 2 \u2014 Responsibility is handed from Support to Sales" },
    handlerBoundary: { name: "3E / Flow 04 / Handler Boundary", text: "Previous handler: Support. Next handler: Sales. Handoff changes responsibility, not authorization." },
    contextNote: { name: "3E / Flow 04 / Verified Context", text: "Reason for handoff and verified Customer, Conversation, Order, and Inventory/freshness context remain available. Sales reviews current facts and remaining work." },
    permissionBoundary: { name: "3E / Flow 04 / Permission Boundary", text: "Handoff \u2260 Permission Transfer. The trusted execution layer independently enforces authorization; no restricted mutation is granted by handoff." },
    acceptSource: { name: "3E / Flow 04 / Sales Acceptance Source", text: "PRODUCT CONTROL \u2014 Accept Sales handoff" },
    acceptControl: { name: "3E / Flow 04 / Sales Becomes Handler", marker: "PROTOTYPE CONTROL", text: "Continue scenario \u2192 Sales becomes current handler" },
    step3: { name: "3E / Flow 04 / STEP 3", text: "STEP 3 \u2014 Sales is now the current handler" },
    salesNote: { name: "3E / Flow 04 / Sales Ownership", text: "The conversation context is preserved, but Sales actions remain limited to Sales-authorized capabilities. Intended UX only; no backend execution is claimed." },
    authorizationNote: { name: "3E / Flow 04 / Authorization Boundary", text: "Current Handler changed. Permissions were re-evaluated, not transferred." },
    end: { name: "3E / Flow 04 / END", text: "END \u2014 Flow 4\nSales Active is the final scenario state. Ownership changed from Support to Sales. Authorization remains independently enforced." }
  };
  var FLOW5_BOARD = {
    start: { name: "3E / Flow 05 / START", text: "START \u2014 Flow 5: OUTCOME_UNKNOWN \u2192 Escalation" },
    step1: { name: "3E / Flow 05 / STEP 1", text: "STEP 1 \u2014 Business effect is uncertain" },
    uncertain: { name: "3E / Flow 05 / Uncertain Effect", text: "A mutation may have committed, but confirmation is insufficient. The persisted effect may or may not exist; neither success nor failure is asserted." },
    unknownBoundary: { name: "3E / Flow 05 / Unknown Boundary", text: "OUTCOME_UNKNOWN \u2260 Known Failure. A known failed result permits authorized recovery; an uncertain result requires reconciliation first." },
    noBlindRetry: { name: "3E / Flow 05 / No Blind Retry", text: "Do not blindly retry the mutation." },
    reconcileFirst: { name: "3E / Flow 05 / Reconcile First", text: "Reconcile authoritative business state before any new mutation attempt." },
    escalationSource: { name: "3E / Flow 05 / Open Escalation Source", text: "PRODUCT CONTROL \u2014 Open Escalation" },
    escalationControl: { name: "3E / Flow 05 / Open Reconciliation Escalation", marker: "PROTOTYPE CONTROL", text: "Open reconciliation escalation" },
    step2: { name: "3E / Flow 05 / STEP 2", text: "STEP 2 \u2014 Reconciliation required before retry" },
    reconciliation: { name: "3E / Flow 05 / Reconciliation Required", text: "RECONCILIATION REQUIRED\nDetermine the actual persisted business state before authorizing any repeat mutation. This is a safety check, not a retry or a new mutation." },
    knownBoundary: { name: "3E / Flow 05 / Known Failure Distinction", text: "Known Failure: result known; authorized recovery may be possible. OUTCOME_UNKNOWN: result uncertain; reconciliation required." },
    e02Boundary: { name: "3E / Flow 05 / E02 Distinction", text: "E02 restriction \u2260 OUTCOME_UNKNOWN. E02 is a known policy/capability restriction; OUTCOME_UNKNOWN is an uncertain business effect." },
    m12Boundary: { name: "3E / Flow 05 / M12 Boundary", text: "Flow 5 ends at reconciliation / human review. No automatic replay or resume follows. Controlled Resume belongs to Flow 6 and remains TARGET M12." },
    end: { name: "3E / Flow 05 / END", text: "END \u2014 Flow 5\nReconciliation / human review is the final scenario state. Any later controlled Resume is demonstrated separately in Flow 6 and remains TARGET M12." }
  };
  var FLOW6_BOARD = {
    start: { name: "3E / Flow 06 / START", text: "START \u2014 Flow 6: Human Decision / Resume TARGET" },
    targetBanner: { name: "3E / Flow 06 / TARGET M12 Banner", text: "TARGET M12 \u2014 NOT CURRENTLY IMPLEMENTED" },
    step1: { name: "3E / Flow 06 / STEP 1", text: "STEP 1 \u2014 Human reviews the Decision Context" },
    hierarchyNote: { name: "3E / Flow 06 / Decision Hierarchy", text: "WHY AUTOMATION STOPPED \u2192 CONFIRMED FACTS \u2192 UNCERTAIN EFFECT \u2192 CONSTRAINTS \u2192 NEXT SAFE STEP \u2192 HUMAN DECISION" },
    decisionBoundary: { name: "3E / Flow 06 / Decision Boundary", text: "Human Decision \u2260 Mutation Execution. Selecting a decision records human intent; it does not execute or replay the original mutation." },
    decisionSource: { name: "3E / Flow 06 / Decision Source", text: "PRODUCT CONTROL \u2014 Approved human decision" },
    decisionControl: { name: "3E / Flow 06 / Human Decision Recorded", marker: "PROTOTYPE CONTROL", text: "Human decision recorded \u2192 Continue to revalidation" },
    gate: { name: "3E / Flow 06 / Revalidation Gate", marker: "PROTOTYPE BOUNDARY \u2014 TARGET M12" },
    step2: { name: "3E / Flow 06 / STEP 2", text: "STEP 2 \u2014 Revalidation required before controlled Resume request" },
    principal: { name: "3E / Flow 06 / Principal Check", text: "Re-check current principal and case assignment." },
    scope: { name: "3E / Flow 06 / Scope Check", text: "Re-check business scope; approval does not inherit permissions." },
    authorization: { name: "3E / Flow 06 / Authorization Check", text: "Re-check authorization in the trusted executor; a visible action does not grant access." },
    state: { name: "3E / Flow 06 / State Check", text: "Re-check current business state and relevant facts before any request." },
    revision: { name: "3E / Flow 06 / Revision Check", text: "Re-check revision/version and stale context. Old approval is insufficient if facts changed." },
    replayBoundary: { name: "3E / Flow 06 / Replay Boundary", text: "Revalidation \u2260 Replay. Do not replay the old mutation payload merely because a human approved continuation." },
    unknownBoundary: { name: "3E / Flow 06 / Unknown Prerequisite", text: "Any OUTCOME_UNKNOWN effect must be reconciled before controlled Resume is considered." },
    e02Boundary: { name: "3E / Flow 06 / E02 Boundary", text: "Controlled Resume does not override E02 or domain-policy restrictions. If still unauthorized, Resume must not proceed." },
    resumeControl: { name: "3E / Flow 06 / Controlled Resume Request", marker: "PROTOTYPE CONTROL \u2014 TARGET M12", text: "Request controlled Resume \u2014 TARGET M12" },
    step3: { name: "3E / Flow 06 / STEP 3", text: "STEP 3 \u2014 Controlled Resume request is pending" },
    targetNote: { name: "3E / Flow 06 / Target State", text: "TARGET M12 is intended durable-resume UX, not a current production capability. No mutation is replayed and no new business effect is confirmed." },
    currentTarget: { name: "3E / Flow 06 / Current vs Target", text: "CURRENT: M12 durable human resume is not implemented. TARGET: Decision \u2192 Revalidation \u2192 Controlled Resume request." },
    end: { name: "3E / Flow 06 / END", text: "END \u2014 Flow 6\nResume Pending \u2014 TARGET M12 is the final prototype state. No mutation replay or successful new business effect is demonstrated." }
  };
  var FLOW7_BOARD = {
    start: { name: "3E / Flow 07 / CURRENT START", text: "START \u2014 Flow 7 / CURRENT" },
    step1: { name: "3E / Flow 07 / STEP 1", text: "STEP 1 \u2014 Historical Analytics" },
    analyticsBoundary: { name: "3E / Flow 07 / Analytics Boundary", text: "Analytics = OBSERVED / HISTORICAL. Forecast = PREDICTED / FUTURE. Analytics shows ACTUAL historical values only; a missing observation is not zero. Valid Empty differs from Dependency Unavailable." },
    openSource: { name: "3E / Flow 07 / Open Forecasts Source", text: "PRODUCT CONTROL \u2014 Open Forecasts" },
    openControl: { name: "3E / Flow 07 / Open Forecasts Control", marker: "PROTOTYPE CONTROL \u2014 CURRENT", text: "Open Forecasts" },
    step2: { name: "3E / Flow 07 / STEP 2", text: "STEP 2 \u2014 Forecast requested; validated model artifact not ready" },
    currentBanner: { name: "3E / Flow 07 / CURRENT Banner", text: "CURRENT ENGINEERING STATE \u2014 MODEL_NOT_READY \u2014 NO PREDICTION PRODUCED" },
    notReadyBoundary: { name: "3E / Flow 07 / MODEL_NOT_READY Boundary", text: "MODEL_NOT_READY: no validated forecast artifact exists. No prediction or zero forecast is produced; historical ACTUAL is not substituted. This differs from Valid Empty, Model Unavailable and TARGET Ready." },
    returnSource: { name: "3E / Flow 07 / Return Source", text: "PRODUCT CONTROL \u2014 Open Historical Analytics" },
    returnControl: { name: "3E / Flow 07 / Return Control", marker: "PROTOTYPE CONTROL \u2014 CURRENT", text: "Return to Historical Analytics" },
    currentEnd: { name: "3E / Flow 07 / CURRENT END", text: "END \u2014 Flow 7 / CURRENT\nHistorical Analytics remains available although the model is not ready. No prediction was produced." },
    targetBanner: { name: "3E / Flow 07 / TARGET Banner", text: "TARGET PRODUCT UX \u2014 NOT CURRENTLY AVAILABLE \u2014 DESIGN SPECIMEN ONLY" },
    targetNote: { name: "3E / Flow 07 / TARGET Specimen", text: "TARGET SPECIMEN \u2014 Forecasts TARGET Ready. Illustrative future UX only; no validated production forecast numbers or live M13 result." },
    seriesBoundary: { name: "3E / Flow 07 / Actual Predicted Boundary", text: "ACTUAL \u2260 PREDICTED. ACTUAL is a solid historical series; CUTOFF is the last observed boundary; PREDICTED is a dashed future-only illustrative series. These are distinct data classes." },
    currentTarget: { name: "3E / Flow 07 / Current vs Target", text: "CURRENT: MODEL_NOT_READY; no validated forecast result exists. TARGET: TARGET Ready is illustrative future forecast UX, not the next operational step." },
    m13Boundary: { name: "3E / Flow 07 / M13 Boundary", text: "M13 remains not ready. TARGET Ready is an approved UX target, not evidence of a trained, validated or deployed forecast artifact, measured accuracy, or completed ForecastRun." },
    targetEnd: { name: "3E / Flow 07 / TARGET END", text: "END \u2014 Flow 7 / TARGET SPECIMEN\nTARGET Ready is isolated from the current path and is non-interactive." }
  };
  var FLOW8_BOARD = {
    start: { name: "3E / Flow 08 / PRIMARY START", text: "START \u2014 Flow 8 / Purchase Confirmation" },
    step1: { name: "3E / Flow 08 / STEP 1", text: "STEP 1 \u2014 Customer reviews the proposed order" },
    proposalBoundary: { name: "3E / Flow 08 / Proposal Boundary", text: "Proposal \u2260 Execution. The business action has not executed before the customer explicitly confirms this order." },
    confirmSource: { name: "3E / Flow 08 / Confirm Source", text: "PRODUCT CONTROL \u2014 Customer confirms the proposed order" },
    customerAuthorization: { name: "3E / Flow 08 / Customer Authorization", text: "Customer confirmation is explicit authorization for the proposed action. AI or an operator does not confirm on the customer\u2019s behalf." },
    step2: { name: "3E / Flow 08 / STEP 2", text: "STEP 2 \u2014 Confirmed request is processing" },
    processingBoundary: { name: "3E / Flow 08 / Processing Boundary", text: "Customer authorization was received. Processing \u2260 Confirmed Result; the business result is not yet confirmed." },
    resultControl: { name: "3E / Flow 08 / Business Result Event", marker: "PROTOTYPE CONTROL \u2014 SYSTEM RESULT", text: "Continue scenario \u2192 Business result confirmed" },
    step3: { name: "3E / Flow 08 / STEP 3", text: "STEP 3 \u2014 Business result confirmed" },
    confirmedBoundary: { name: "3E / Flow 08 / Confirmed Facts", text: "The approved customer result distinguishes Order created from Reservation confirmed. This prototype shows intended UX, not backend execution." },
    primaryEnd: { name: "3E / Flow 08 / PRIMARY END", text: "END \u2014 Flow 8 / Purchase Success\nThe customer sees the confirmed result. The prototype does not execute a backend purchase." },
    branch: { name: "3E / Flow 08 / SECONDARY SCENARIO", text: "SECONDARY SCENARIO \u2014 Message delivery failure after confirmed business effect" },
    branchControl: { name: "3E / Flow 08 / Delivery Failure Scenario", marker: "PROTOTYPE CONTROL \u2014 SCENARIO ONLY", text: "Simulate message delivery failure after confirmed business effect" },
    step4: { name: "3E / Flow 08 / STEP 4", text: "STEP 4 \u2014 Customer message was not delivered" },
    deliveryBoundary: { name: "3E / Flow 08 / Delivery Boundary", text: "Message Delivery Failure \u2260 Business Action Failure. Communication transport failed after the business effect was confirmed." },
    businessBoundary: { name: "3E / Flow 08 / Business Effect Boundary", text: "Business effect remains confirmed. The Order must not be created again; the Reservation must not be repeated." },
    noReplay: { name: "3E / Flow 08 / No Replay", text: "Retry message \u2260 repeat Order \u2260 repeat Reservation. Message recovery retries communication only; no create_order, reserve_inventory or update_order replay." },
    retrySource: { name: "3E / Flow 08 / Retry Source", text: "PRODUCT CONTROL \u2014 Retry message only" },
    retryControl: { name: "3E / Flow 08 / Retry Message Control", marker: "PROTOTYPE CONTROL \u2014 MESSAGE ONLY", text: "Retry message delivery only" },
    recoveryNote: { name: "3E / Flow 08 / Recovery Note", text: "For prototype progression, communication retry succeeds and returns to the existing Confirmed Result. The Order and Reservation were never recreated." },
    recoveryEnd: { name: "3E / Flow 08 / RECOVERY END", text: "END \u2014 Flow 8 / Message Recovery\nBusiness state remains the previously confirmed state. Only customer communication was retried." }
  };
  var FLOWS = [
    {
      id: 1,
      title: "Product Availability",
      frames: [
        { key: "default", source: "conversationDefault", label: "Conversation / Default" },
        { key: "support", source: "conversationSupport", label: "Support Active / verified inventory" }
      ],
      edges: [{ from: "default", to: "support", control: FLOW1_BOARD.continue.name }],
      notes: ["Product record existence is not stock availability. Inventory is observed trusted context, not a promise of live stock."]
    },
    {
      id: 2,
      title: "Purchase Success",
      frames: [
        { key: "Awaiting Confirmation", source: "conversationConfirmation", label: "Awaiting Confirmation" },
        { key: "Processing", source: "conversationProcessing", label: "Processing" },
        { key: "Confirmed Result", source: "conversationConfirmed", label: "Confirmed Result" },
        { key: "Reservation Confirmed", source: "orderConfirmed", label: "Order / Reservation Confirmed" }
      ],
      edges: [
        { from: "Awaiting Confirmation", to: "Processing", control: FLOW2_BOARD.confirmation.name },
        { from: "Processing", to: "Confirmed Result", control: FLOW2_BOARD.processingComplete.name },
        { from: "Confirmed Result", to: "Reservation Confirmed", control: "Order link" }
      ],
      notes: ["Customer authorization precedes processing. This prototype demonstrates intended UX progression, not create_order, reserve_inventory, a live provider operation, M08 completion, or backend implementation."]
    },
    {
      id: 3,
      title: "Reservation Failure",
      frames: [
        { key: "Known Failure", source: "conversationFailure", label: "Known Failure" },
        { key: "Reservation Failed", source: "orderFailed", label: "Order / Reservation Failed" }
      ],
      edges: [{ from: "Known Failure", to: "Reservation Failed", control: "Order link" }],
      notes: ["Known failure: the Order exists, reservation failed, and recovery requires a new authorized action."]
    },
    {
      id: 4,
      title: "Support \u2192 Sales Handoff",
      frames: [
        { key: "Support Active", source: "conversationSupport", label: "Support Active" },
        { key: "Handoff", source: "conversationHandoff", label: "Handoff Context" },
        { key: "Sales Active", source: "conversationSales", label: "Sales Active" }
      ],
      edges: [
        { from: "Support Active", to: "Handoff", control: FLOW4_BOARD.requestControl.name },
        { from: "Handoff", to: "Sales Active", control: FLOW4_BOARD.acceptControl.name }
      ],
      notes: ["Previous/current handler, reason, verified context and remaining work remain visible. Handoff never transfers permissions."]
    },
    {
      id: 5,
      title: "OUTCOME_UNKNOWN \u2192 Escalation",
      frames: [
        { key: "Conversation OUTCOME_UNKNOWN", source: "conversationUnknown", label: "Conversation OUTCOME_UNKNOWN" },
        { key: "Escalation Reconciliation", source: "escalationUnknown", label: "Escalation / Reconciliation Required" }
      ],
      edges: [{ from: "Conversation OUTCOME_UNKNOWN", to: "Escalation Reconciliation", control: "Escalation link" }],
      notes: ["Effect may have committed. Reconcile authoritative reservation state before any further mutation; no blind retry."]
    },
    {
      id: 6,
      title: "Human Decision / Resume TARGET",
      frames: [
        { key: "Awaiting Decision", source: "escalationDecision", label: "Awaiting Human Decision" },
        { key: "Resume Pending", source: "escalationResume", label: "Resume Pending / TARGET M12", targetOnly: true }
      ],
      edges: [{ from: "Awaiting Decision", to: "Resume Pending", control: FLOW6_BOARD.decisionControl.name }],
      notes: ["TARGET M12 \u2014 NOT CURRENTLY IMPLEMENTED. The linked state is a target specimen, not a live capability."]
    },
    {
      id: 7,
      title: "Analytics \u2192 Forecasts",
      frames: [
        { key: "Analytics Valid", source: "analyticsValid", label: "Analytics / historical ACTUAL" },
        { key: "MODEL_NOT_READY", source: "forecastNotReady", label: "Forecast / MODEL_NOT_READY" },
        { key: "TARGET Ready", source: "forecastTarget", label: "Forecast / TARGET Ready", targetOnly: true }
      ],
      edges: [
        { from: "Analytics Valid", to: "MODEL_NOT_READY", control: "Open Forecasts" },
        { from: "MODEL_NOT_READY", to: "Analytics Valid", control: "Open Historical Analytics" }
      ],
      notes: ["Current: MODEL_NOT_READY. TARGET PRODUCT UX below is isolated and has no current-state navigation. No predicted values are claimed."]
    },
    {
      id: 8,
      title: "Customer Web Chat",
      frames: [
        { key: "Confirmation Required", source: "chatConfirmation", label: "Confirmation Required" },
        { key: "Processing", source: "chatProcessing", label: "Processing" },
        { key: "Confirmed Result", source: "chatConfirmed", label: "Confirmed Result" },
        { key: "Message Delivery Failure", source: "chatDelivery", label: "Message Delivery Failure" }
      ],
      edges: [
        { from: "Confirmation Required", to: "Processing", control: "Confirm order / focus" },
        { from: "Processing", to: "Confirmed Result", control: FLOW8_BOARD.resultControl.name },
        { from: "Confirmed Result", to: "Message Delivery Failure", control: FLOW8_BOARD.branchControl.name },
        { from: "Message Delivery Failure", to: "Confirmed Result", control: "Retry message action / focus" }
      ],
      notes: ["Secondary message recovery follows an already confirmed business effect. Retry message is communication-only and never repeats an Order or Reservation."]
    }
  ];
  function flowSectionName(id) {
    const flow = FLOWS.find((f) => f.id === id);
    if (!flow) throw new Error(`Unknown flow ${id}`);
    return `${String(id).padStart(2, "0")} \u2014 ${flow.title}`;
  }
  function cloneName(id, key) {
    return `3E / Flow ${String(id).padStart(2, "0")} / ${key}`;
  }
  function assertWritablePageName(name) {
    if (name !== TARGET_PAGE) throw new Error(`Writes are restricted to ${TARGET_PAGE}; got ${name}.`);
  }
  function graphErrors(flow) {
    const errors = [];
    const keys = new Set(flow.frames.map((f) => f.key));
    if (flow.id === 1 && (flow.edges.length !== 1 || flow.edges[0].from !== "default" || flow.edges[0].to !== "support" || flow.edges[0].control !== FLOW1_BOARD.continue.name)) errors.push("Flow 1 must use its external prototype control.");
    if (flow.id === 2 && (flow.edges.length !== 3 || flow.edges[0].from !== "Awaiting Confirmation" || flow.edges[0].to !== "Processing" || flow.edges[0].control !== FLOW2_BOARD.confirmation.name || flow.edges[1].from !== "Processing" || flow.edges[1].to !== "Confirmed Result" || flow.edges[1].control !== FLOW2_BOARD.processingComplete.name || flow.edges[2].from !== "Confirmed Result" || flow.edges[2].to !== "Reservation Confirmed" || flow.edges[2].control !== "Order link")) {
      errors.push("Flow 2 must follow customer confirmation \u2192 processing \u2192 confirmed result \u2192 Reservation Confirmed Order.");
    }
    if (flow.id === 3 && (flow.frames.length !== 2 || flow.frames[0].key !== "Known Failure" || flow.frames[0].source !== "conversationFailure" || flow.frames[1].key !== "Reservation Failed" || flow.frames[1].source !== "orderFailed" || flow.edges.length !== 1 || flow.edges[0].from !== "Known Failure" || flow.edges[0].to !== "Reservation Failed" || flow.edges[0].control !== "Order link")) {
      errors.push("Flow 3 must use exact Known Failure and Reservation Failed sources and a single Open Order progression.");
    }
    if (flow.id === 4 && (flow.frames.length !== 3 || flow.frames[0].key !== "Support Active" || flow.frames[0].source !== "conversationSupport" || flow.frames[1].key !== "Handoff" || flow.frames[1].source !== "conversationHandoff" || flow.frames[2].key !== "Sales Active" || flow.frames[2].source !== "conversationSales" || flow.edges.length !== 2 || flow.edges[0].from !== "Support Active" || flow.edges[0].to !== "Handoff" || flow.edges[0].control !== FLOW4_BOARD.requestControl.name || flow.edges[1].from !== "Handoff" || flow.edges[1].to !== "Sales Active" || flow.edges[1].control !== FLOW4_BOARD.acceptControl.name)) {
      errors.push("Flow 4 must progress Support Active \u2192 Handoff \u2192 Sales Active with external-capable handoff controls.");
    }
    if (flow.id === 5 && (flow.frames.length !== 2 || flow.frames[0].key !== "Conversation OUTCOME_UNKNOWN" || flow.frames[0].source !== "conversationUnknown" || flow.frames[1].key !== "Escalation Reconciliation" || flow.frames[1].source !== "escalationUnknown" || flow.edges.length !== 1 || flow.edges[0].from !== "Conversation OUTCOME_UNKNOWN" || flow.edges[0].to !== "Escalation Reconciliation" || flow.edges[0].control !== "Escalation link")) {
      errors.push("Flow 5 must route Conversation OUTCOME_UNKNOWN directly to Escalation Reconciliation first.");
    }
    if (flow.id === 6 && (flow.frames.length !== 2 || flow.frames[0].key !== "Awaiting Decision" || flow.frames[0].source !== "escalationDecision" || flow.frames[1].key !== "Resume Pending" || flow.frames[1].source !== "escalationResume" || !flow.frames[1].targetOnly || flow.edges.length !== 1 || flow.edges[0].from !== "Awaiting Decision" || flow.edges[0].to !== "Resume Pending" || flow.edges[0].control !== FLOW6_BOARD.decisionControl.name)) {
      errors.push("Flow 6 must use exact Awaiting Decision and Resume Pending TARGET sources with an external revalidation boundary.");
    }
    for (const edge of flow.edges) {
      if (!keys.has(edge.from) || !keys.has(edge.to)) errors.push(`Broken spec edge ${edge.from} \u2192 ${edge.to}`);
      if (flow.frames.find((f) => f.key === edge.to)?.targetOnly && flow.id !== 6) errors.push(`Current path reaches TARGET in flow ${flow.id}`);
      if (flow.id === 5 && edge.from === "Conversation OUTCOME_UNKNOWN" && edge.to !== "Escalation Reconciliation") errors.push("OUTCOME_UNKNOWN bypasses reconciliation");
      if (flow.id === 8 && edge.from === "Message Delivery Failure" && (edge.control !== "Retry message action / focus" || edge.to !== "Confirmed Result")) errors.push("Delivery recovery may replay business mutation");
    }
    if (flow.id === 6 && !flow.notes.join(" ").includes("NOT CURRENTLY IMPLEMENTED")) errors.push("M12 TARGET boundary missing");
    if (flow.id === 7 && (flow.frames.length !== 3 || flow.frames[0].key !== "Analytics Valid" || flow.frames[0].source !== "analyticsValid" || flow.frames[1].key !== "MODEL_NOT_READY" || flow.frames[1].source !== "forecastNotReady" || flow.frames[2].key !== "TARGET Ready" || flow.frames[2].source !== "forecastTarget" || !flow.frames[2].targetOnly || flow.edges.length !== 2 || flow.edges[0].from !== "Analytics Valid" || flow.edges[0].to !== "MODEL_NOT_READY" || flow.edges[0].control !== "Open Forecasts" || flow.edges[1].from !== "MODEL_NOT_READY" || flow.edges[1].to !== "Analytics Valid" || flow.edges[1].control !== "Open Historical Analytics" || !flow.notes.join(" ").includes("MODEL_NOT_READY"))) errors.push("M13 current/TARGET boundary missing or Flow 7 current path is unsafe");
    if (flow.id === 8 && (flow.frames.length !== 4 || flow.frames[0].key !== "Confirmation Required" || flow.frames[0].source !== "chatConfirmation" || flow.frames[1].key !== "Processing" || flow.frames[1].source !== "chatProcessing" || flow.frames[2].key !== "Confirmed Result" || flow.frames[2].source !== "chatConfirmed" || flow.frames[3].key !== "Message Delivery Failure" || flow.frames[3].source !== "chatDelivery" || flow.edges.length !== 4 || flow.edges[0].from !== "Confirmation Required" || flow.edges[0].to !== "Processing" || flow.edges[0].control !== "Confirm order / focus" || flow.edges[1].from !== "Processing" || flow.edges[1].to !== "Confirmed Result" || flow.edges[1].control !== FLOW8_BOARD.resultControl.name || flow.edges[2].from !== "Confirmed Result" || flow.edges[2].to !== "Message Delivery Failure" || flow.edges[2].control !== FLOW8_BOARD.branchControl.name || flow.edges[3].from !== "Message Delivery Failure" || flow.edges[3].to !== "Confirmed Result" || flow.edges[3].control !== "Retry message action / focus"))
      errors.push("Flow 8 must use exact customer screens, explicit confirmation, external result/branch events, and communication-only recovery.");
    return errors;
  }

  // src/source-inspector.ts
  function exactPage(name) {
    const matches = figma.root.children.filter((p) => p.name === name);
    if (matches.length !== 1) return null;
    return matches[0];
  }
  function descendants(node, name) {
    return node.findAll((n) => n.name === name);
  }
  async function inspectSources() {
    const page = exactPage(SOURCE_PAGE);
    const issues = [];
    if (!page) {
      issues.push(`Expected exactly one ${SOURCE_PAGE} page.`);
      return { page: null, findings: [], issues };
    }
    await page.loadAsync();
    const findings = [];
    for (const [key, source] of Object.entries(SOURCES)) {
      const sections = page.children.filter((n) => n.name === source.section && n.type === "FRAME");
      const sectionNameMatches = page.children.filter((n) => n.name === source.section && n.type !== "FRAME");
      if (sections.length !== 1 || sectionNameMatches.length) issues.push(`${source.section}: expected one FRAME, got ${sections.length}; other exact-name types ${sectionNameMatches.map((n) => n.type).join(", ") || "none"}.`);
      const all = sections.flatMap((section) => descendants(section, source.name));
      const exactFrames = all.filter((n) => n.type === "FRAME");
      const otherMatches = all.filter((n) => n.type !== "FRAME");
      const status = exactFrames.length > 1 ? "DUPLICATE" : otherMatches.length ? "WRONG_TYPE" : exactFrames.length === 1 ? "FOUND" : "MISSING";
      findings.push({ key, section: source.section, name: source.name, status, exactFrames, otherMatches, path: `${SOURCE_PAGE} / ${source.section}` });
    }
    return { page, findings, issues };
  }
  function sourceReport(result) {
    const lines = [`03D SOURCE INSPECTION (READ ONLY)`, `Page: ${SOURCE_PAGE}`, ...result.issues];
    for (const finding of result.findings) {
      lines.push(`${finding.status} ${finding.name} | FRAME ${finding.exactFrames.length} | other ${finding.otherMatches.map((n) => n.type).join(", ") || "none"}`);
      for (const n of [...finding.exactFrames, ...finding.otherMatches]) lines.push(`  ${n.type} ${n.name} [${n.id}] ${finding.path} / ${n.name}`);
    }
    return lines.join("\n");
  }

  // src/prototype-utils.ts
  function assertTarget(page) {
    assertWritablePageName(page.name);
    if (figma.currentPage.id !== page.id || figma.currentPage.name !== TARGET_PAGE) throw new Error("Current page is not the exact 03E target.");
  }
  function findUniqueControl(frame, name) {
    const matches = frame.findAll((n) => n.name === name && "setReactionsAsync" in n);
    if (matches.length !== 1) throw new Error(`${frame.name}: expected one reaction-capable existing control named ${name}; found ${matches.length}.`);
    return matches[0];
  }
  function navigateReaction(destinationId) {
    return { trigger: { type: "ON_CLICK" }, actions: [{ type: "NODE", destinationId, navigation: "NAVIGATE", transition: null }] };
  }
  function ownedNames(flow) {
    const prefix = `3E / Flow ${String(flow.id).padStart(2, "0")}`;
    if (flow.id === 1) return [
      ...flow.frames.map((f) => cloneName(flow.id, f.key)),
      FLOW1_BOARD.start.name,
      FLOW1_BOARD.step1.name,
      FLOW1_BOARD.step1Note.name,
      FLOW1_BOARD.continue.name,
      FLOW1_BOARD.step2.name,
      FLOW1_BOARD.productBoundary.name,
      FLOW1_BOARD.inventoryBoundary.name,
      FLOW1_BOARD.end.name,
      FLOW1_BOARD.legacyNote
    ];
    if (flow.id === 2) return [
      ...flow.frames.map((f) => cloneName(flow.id, f.key)),
      ...[
        FLOW2_BOARD.start,
        FLOW2_BOARD.step1,
        FLOW2_BOARD.proposalBoundary,
        FLOW2_BOARD.confirmation,
        FLOW2_BOARD.step2,
        FLOW2_BOARD.processingNote,
        FLOW2_BOARD.processingComplete,
        FLOW2_BOARD.step3,
        FLOW2_BOARD.confirmedNote,
        FLOW2_BOARD.orderSource,
        FLOW2_BOARD.orderControl,
        FLOW2_BOARD.step4,
        FLOW2_BOARD.orderBoundary,
        FLOW2_BOARD.deliveryBoundary,
        FLOW2_BOARD.backendBoundary,
        FLOW2_BOARD.end
      ].map((item) => item.name)
    ];
    if (flow.id === 3) return [
      ...flow.frames.map((f) => cloneName(flow.id, f.key)),
      ...Object.values(FLOW3_BOARD).map((item) => item.name)
    ];
    if (flow.id === 4) return [
      ...flow.frames.map((f) => cloneName(flow.id, f.key)),
      ...Object.values(FLOW4_BOARD).map((item) => item.name)
    ];
    if (flow.id === 5) return [
      ...flow.frames.map((f) => cloneName(flow.id, f.key)),
      ...Object.values(FLOW5_BOARD).map((item) => item.name)
    ];
    if (flow.id === 6) return [
      ...flow.frames.map((f) => cloneName(flow.id, f.key)),
      ...Object.values(FLOW6_BOARD).map((item) => item.name)
    ];
    if (flow.id === 7) return [
      ...flow.frames.map((f) => cloneName(flow.id, f.key)),
      ...Object.values(FLOW7_BOARD).map((item) => item.name)
    ];
    if (flow.id === 8) return [
      ...flow.frames.map((f) => cloneName(flow.id, f.key)),
      ...Object.values(FLOW8_BOARD).map((item) => item.name)
    ];
    return [
      ...flow.frames.map((f) => cloneName(flow.id, f.key)),
      `${prefix} / START`,
      `${prefix} / END`,
      ...flow.notes.map((_, i) => `${prefix} / Note ${i + 1}`),
      ...flow.edges.filter((e) => e.note).map((_, i) => `${prefix} / Edge Note ${i + 1}`)
    ];
  }
  function visualSignature(frame) {
    const lines = [];
    const visit = (node) => {
      lines.push(`${node.type}|${node.name}|${"width" in node ? node.width : ""}|${"height" in node ? node.height : ""}`);
      if (node.type === "TEXT") lines.push(`TEXT:${node.characters}`);
      if (node.type === "INSTANCE") lines.push("INSTANCE");
      if ("fills" in node) lines.push(`FILLS:${JSON.stringify(node.fills)}`);
      if ("children" in node) for (const child of node.children) visit(child);
    };
    for (const child of frame.children) visit(child);
    return `${frame.width}x${frame.height}|${lines.join(";")}`;
  }
  async function loadAnnotationFont() {
    const font = { family: "Inter", style: "Regular" };
    await figma.loadFontAsync(font);
    return font;
  }
  function annotation(page, parent, name, value, x, y, width, font) {
    assertTarget(page);
    const node = figma.createText();
    node.name = name;
    parent.appendChild(node);
    node.fontName = font;
    node.fontSize = 16;
    node.characters = value;
    node.textAutoResize = "HEIGHT";
    node.resize(width, node.height);
    node.x = x;
    node.y = y;
    return node;
  }
  function pageSection(page, name, x, y, width, height) {
    assertTarget(page);
    const matches = page.children.filter((n) => n.name === name);
    if (matches.length > 1 || matches.length === 1 && matches[0].type !== "SECTION") throw new Error(`Ambiguous or wrong-type 03E section: ${name}.`);
    if (matches.length === 1) return matches[0];
    const section = figma.createSection();
    section.name = name;
    section.x = x;
    section.y = y;
    section.resize(width, height);
    return section;
  }
  function inspectOwned(section, flow) {
    const expected = new Set(ownedNames(flow));
    const old = [];
    for (const name of expected) {
      const matches = section.children.filter((n) => n.name === name);
      if (matches.length > 1) throw new Error(`Duplicate plugin-owned 03E node: ${name}. No existing flow was changed.`);
      if (matches.length === 1) old.push(matches[0]);
    }
    return old;
  }

  // src/flow1-validation.ts
  function reactionNodes(frame) {
    return [frame, ...frame.findAll((n) => "reactions" in n)];
  }
  function sourceReactionSignature(source, clone) {
    const originals = reactionNodes(source);
    const copies = reactionNodes(clone);
    if (originals.length !== copies.length) return false;
    const idMap = new Map(originals.map((node, index) => [node.id, copies[index].id]));
    for (let i = 0; i < originals.length; i++) {
      const expected = JSON.parse(JSON.stringify(originals[i].reactions));
      for (const reaction of expected) {
        for (const action of reaction.actions ?? []) if (action.type === "NODE" && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId);
        if (reaction.action?.type === "NODE" && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId);
      }
      if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
    }
    return true;
  }
  function reactionDiagnostic(control3, destinationId, reason) {
    const field = (value) => value === void 0 ? "undefined" : JSON.stringify(value);
    const lines = [
      `FLOW 1 ${control3.parent?.name.endsWith("/ staging") ? "STAGING" : "CANONICAL"} REACTION DIAGNOSTIC`,
      "Expected: ON_CLICK \u2192 NODE/NAVIGATE",
      `Destination: ${destinationId ?? "missing staging Support Active clone"}`,
      "Transition: NONE (null or absent; no animated Transition object)",
      "Actual:",
      `reactions.count=${control3.reactions.length}`
    ];
    control3.reactions.forEach((reaction, index) => {
      lines.push(`reaction[${index}].trigger.type=${field(reaction.trigger?.type)}`);
      lines.push(`reaction[${index}].actions.count=${field(reaction.actions?.length)}`);
      for (const [label4, action] of [
        ...(reaction.actions ?? []).map((item, actionIndex) => [`actions[${actionIndex}]`, item]),
        ...reaction.action ? [["action", reaction.action]] : []
      ]) {
        lines.push(`reaction[${index}].${label4}.type=${field(action.type)}`);
        const nodeAction = action.type === "NODE" ? action : null;
        lines.push(`reaction[${index}].${label4}.navigation=${field(nodeAction?.navigation)}`);
        lines.push(`reaction[${index}].${label4}.destinationId=${field(nodeAction?.destinationId)}`);
        lines.push(`reaction[${index}].${label4}.transition=${field(nodeAction?.transition)}`);
        lines.push(`reaction[${index}].${label4}.transition.type=${field(nodeAction?.transition?.type)}`);
        lines.push(`reaction[${index}].${label4}.transition.duration=${field(nodeAction?.transition?.duration)}`);
        lines.push(`reaction[${index}].${label4}.preserveScrollPosition=${field(nodeAction?.preserveScrollPosition)}`);
      }
    });
    lines.push(`Raw Figma reactions: ${JSON.stringify(control3.reactions)}`);
    lines.push(reason ? `Failure reason: ${reason}` : "Result: PASS");
    return lines.join("\n");
  }
  async function continueReactionIssue(control3, destinationId) {
    const fail = (reason) => reactionDiagnostic(control3, destinationId, reason);
    if (!destinationId) return fail("Fresh staging Support Active clone is missing.");
    if (control3.reactions.length !== 1) return fail(`Expected exactly one reaction; found ${control3.reactions.length}.`);
    const reaction = control3.reactions[0];
    if (reaction.trigger?.type !== "ON_CLICK") return fail(`Expected ON_CLICK trigger; got ${reaction.trigger?.type ?? "missing"}.`);
    if (reaction.actions !== void 0 && reaction.actions.length !== 1) return fail(`Expected exactly one action; found ${reaction.actions.length}.`);
    const actions = reaction.actions === void 0 ? reaction.action ? [reaction.action] : [] : reaction.actions;
    if (actions.length !== 1) return fail("No intended NODE/NAVIGATE action is present.");
    for (const action of [...actions, ...reaction.action && reaction.actions !== void 0 ? [reaction.action] : []]) {
      if (action.type !== "NODE") return fail(`Expected NODE action; got ${action.type}.`);
      if (action.navigation !== "NAVIGATE") return fail(`Expected NAVIGATE; got ${action.navigation}.`);
      if (action.destinationId !== destinationId) return fail(`Expected fresh Support Active destination ${destinationId}; got ${action.destinationId ?? "missing"}.`);
      if (action.transition != null) return fail(`Animated or unrecognized transition ${JSON.stringify(action.transition)} is not allowed.`);
    }
    if (!await figma.getNodeByIdAsync(destinationId)) return fail(`Fresh Support Active destination ${destinationId} does not resolve.`);
    return null;
  }
  async function checkFlowOne(section, sources) {
    const issues = [];
    const clones = /* @__PURE__ */ new Map();
    let broken = 0;
    let visualPass = true;
    let reactionReport = null;
    const expectedNames = /* @__PURE__ */ new Set([
      cloneName(1, "default"),
      cloneName(1, "support"),
      FLOW1_BOARD.start.name,
      FLOW1_BOARD.step1.name,
      FLOW1_BOARD.step1Note.name,
      FLOW1_BOARD.continue.name,
      FLOW1_BOARD.step2.name,
      FLOW1_BOARD.productBoundary.name,
      FLOW1_BOARD.inventoryBoundary.name,
      FLOW1_BOARD.end.name
    ]);
    for (const child of section.children) if (!expectedNames.has(child.name)) issues.push(`Unexpected node in generated Flow 1: ${child.name}`);
    for (const key of ["default", "support"]) {
      const exact = section.children.filter((n) => n.name === cloneName(1, key));
      if (exact.length !== 1 || exact[0].type !== "FRAME") issues.push(`${key}: clone missing/duplicate/wrong type`);
      else clones.set(key, exact[0]);
    }
    for (const item of [
      FLOW1_BOARD.start,
      FLOW1_BOARD.step1,
      FLOW1_BOARD.step1Note,
      FLOW1_BOARD.step2,
      FLOW1_BOARD.productBoundary,
      FLOW1_BOARD.inventoryBoundary,
      FLOW1_BOARD.end
    ]) {
      const matches2 = section.children.filter((n) => n.name === item.name);
      if (matches2.length !== 1 || matches2[0].type !== "TEXT" || matches2[0].characters.trim() !== item.text.trim()) issues.push(`Missing/wrong external annotation: ${item.name}`);
    }
    if (section.children.some((n) => n.name === FLOW1_BOARD.legacyNote)) issues.push("Legacy generic Flow 1 note remains.");
    const first = clones.get("default");
    const second = clones.get("support");
    if (first && second) {
      for (const key of ["default", "support"]) {
        const source = sources.get(key);
        const clone = clones.get(key);
        if (!source || visualSignature(clone) !== visualSignature(source)) {
          issues.push(`Visual-source preservation failed: ${key}`);
          visualPass = false;
        } else {
          if (!sourceReactionSignature(source, clone)) {
            issues.push(`Source reactions changed or Phase 3E reaction added inside ${key} product clone.`);
            broken++;
          }
        }
      }
      if (first.findAll((n) => n.name === "Conversation row / 1").some((n) => "reactions" in n && n.reactions.some((r) => [...r.actions ?? [], ...r.action ? [r.action] : []].some((a) => a.type === "NODE" && a.destinationId === second.id)))) {
        issues.push("Conversation row / 1 has a Phase 3E scenario reaction.");
        broken++;
      }
      const supportText = second.findAll((n) => n.type === "TEXT").map((n) => n.characters).join(" ").toLowerCase();
      if (!supportText.includes("availability")) issues.push("Support Active inventory context missing.");
    }
    const matches = section.children.filter((n) => n.name === FLOW1_BOARD.continue.name);
    if (matches.length !== 1 || matches[0].type !== "FRAME") {
      issues.push("Prototype-only Continue control missing/duplicate/wrong type.");
      broken++;
    } else {
      const control3 = matches[0];
      const labels = control3.findAll((n) => n.type === "TEXT").map((n) => n.characters);
      const visibleFill = control3.fills !== figma.mixed && control3.fills.some((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0);
      const outsideProduct = first && second && control3.x >= first.x + first.width && control3.x + control3.width <= second.x;
      if (!control3.visible || control3.opacity <= 0 || !visibleFill || control3.width < 250 || control3.height < 70 || !outsideProduct || !labels.includes(FLOW1_BOARD.continue.marker) || !labels.includes(FLOW1_BOARD.continue.text)) issues.push("Continue control is not a visible, labeled external prototype control between frames.");
      const reactionIssue = await continueReactionIssue(control3, second?.id);
      reactionReport = reactionDiagnostic(control3, second?.id, null);
      if (reactionIssue) {
        issues.push(reactionIssue);
        broken++;
      }
    }
    for (const clone of clones.values()) for (const node of reactionNodes(clone)) for (const reaction of node.reactions) {
      for (const action of [...reaction.actions ?? [], ...reaction.action ? [reaction.action] : []]) {
        if (action.type === "NODE" && (!action.destinationId || !await figma.getNodeByIdAsync(action.destinationId))) {
          issues.push(`Broken source reaction destination on ${node.name}.`);
          broken++;
        }
      }
    }
    return { issues, broken, clones, visualPass, reactionReport };
  }

  // src/product-availability.ts
  var CANONICAL = flowSectionName(1);
  var STAGING = `${CANONICAL} / staging`;
  var PREVIOUS = `${CANONICAL} / previous`;
  var ARCHIVE = "ARCHIVE \u2014 Flow 1 \u2014 previous prototype with manual content";
  function prototypeControl(page, section, font, x, y) {
    assertTarget(page);
    const control3 = figma.createFrame();
    control3.name = FLOW1_BOARD.continue.name;
    section.appendChild(control3);
    control3.resize(330, 104);
    control3.x = x;
    control3.y = y;
    control3.cornerRadius = 8;
    control3.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
    control3.strokes = [{ type: "SOLID", color: { r: 0.52, g: 0.52, b: 0.52 } }];
    control3.strokeWeight = 1;
    const addLabel = (name, value, top, size) => {
      assertTarget(page);
      const label4 = figma.createText();
      label4.name = name;
      control3.appendChild(label4);
      label4.fontName = font;
      label4.fontSize = size;
      label4.textAutoResize = "HEIGHT";
      label4.resize(302, 24);
      label4.characters = value;
      label4.fills = [{ type: "SOLID", color: { r: 0.24, g: 0.24, b: 0.24 } }];
      label4.x = 14;
      label4.y = top;
    };
    addLabel("Prototype-only marker", FLOW1_BOARD.continue.marker, 11, 11);
    addLabel("Continue scenario label", FLOW1_BOARD.continue.text, 38, 15);
    return control3;
  }
  function matchingSourceReactions(source, old, oldSupportId) {
    const sourceNodes = [source, ...source.findAll((n) => "reactions" in n)];
    const oldNodes = [old, ...old.findAll((n) => "reactions" in n)];
    if (sourceNodes.length !== oldNodes.length) return false;
    const idMap = new Map(sourceNodes.map((node, index) => [node.id, oldNodes[index].id]));
    for (let i = 0; i < sourceNodes.length; i++) {
      const expected = JSON.parse(JSON.stringify(sourceNodes[i].reactions));
      for (const reaction of expected) {
        for (const action of reaction.actions ?? []) if (action.type === "NODE" && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId);
        if (reaction.action?.type === "NODE" && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId);
      }
      if (JSON.stringify(expected) === JSON.stringify(oldNodes[i].reactions)) continue;
      const reactions = oldNodes[i].reactions;
      const isOwnedLegacy = oldNodes[i].name === "Conversation row / 1" && sourceNodes[i].reactions.length === 0 && reactions.length === 1 && reactions[0].trigger?.type === "ON_CLICK" && reactions[0].actions?.length === 1 && !reactions[0].action && reactions[0].actions[0].type === "NODE" && reactions[0].actions[0].navigation === "NAVIGATE" && reactions[0].actions[0].destinationId === oldSupportId;
      if (!isOwnedLegacy) return false;
    }
    return true;
  }
  function hasManualContent(section, sources) {
    const names = /* @__PURE__ */ new Set([
      cloneName(1, "default"),
      cloneName(1, "support"),
      FLOW1_BOARD.start.name,
      FLOW1_BOARD.step1.name,
      FLOW1_BOARD.step1Note.name,
      FLOW1_BOARD.continue.name,
      FLOW1_BOARD.step2.name,
      FLOW1_BOARD.productBoundary.name,
      FLOW1_BOARD.inventoryBoundary.name,
      FLOW1_BOARD.end.name,
      FLOW1_BOARD.legacyNote
    ]);
    if (section.children.some((node) => !names.has(node.name))) return true;
    for (const key of ["default", "support"]) {
      const matches = section.children.filter((n) => n.name === cloneName(1, key));
      const source = sources.get(key);
      if (matches.length !== 1 || matches[0].type !== "FRAME" || !source || visualSignature(matches[0]) !== visualSignature(source)) return true;
      const support = section.children.find((n) => n.name === cloneName(1, "support"));
      if (!support || !matchingSourceReactions(source, matches[0], support.id)) return true;
    }
    for (const item of [
      FLOW1_BOARD.start,
      FLOW1_BOARD.step1,
      FLOW1_BOARD.step1Note,
      FLOW1_BOARD.step2,
      FLOW1_BOARD.productBoundary,
      FLOW1_BOARD.inventoryBoundary,
      FLOW1_BOARD.end
    ]) {
      const matches = section.children.filter((n) => n.name === item.name);
      if (matches.length > 1 || matches.length === 1 && (matches[0].type !== "TEXT" || matches[0].characters.trim() !== item.text.trim())) return true;
    }
    const controls = section.children.filter((n) => n.name === FLOW1_BOARD.continue.name);
    if (controls.length > 1 || controls.length === 1 && (controls[0].type !== "FRAME" || controls[0].children.some((n) => !["Prototype-only marker", "Continue scenario label"].includes(n.name)))) return true;
    return false;
  }
  async function buildProductAvailability(page, _flow, sources, font) {
    assertTarget(page);
    const oldMatches = page.children.filter((n) => n.name === CANONICAL);
    if (oldMatches.length > 1 || oldMatches.length === 1 && oldMatches[0].type !== "SECTION") throw new Error("Flow 1 canonical section is duplicate or wrong type. Nothing was changed.");
    if (page.children.some((n) => n.name === STAGING || n.name === PREVIOUS)) throw new Error("Existing Flow 1 staging/previous section requires manual review. Nothing was changed.");
    const old = oldMatches[0];
    const oldY = old?.y;
    const archive = Boolean(old && hasManualContent(old, sources));
    if (archive && page.children.some((n) => n.name === ARCHIVE)) throw new Error("Flow 1 archive name already exists. Nothing was changed.");
    let staging;
    let committed = false;
    try {
      assertTarget(page);
      staging = figma.createSection();
      staging.name = STAGING;
      staging.x = 0;
      staging.y = 2600;
      staging.resize(3800, 1500);
      const first = sources.get("default").clone();
      first.name = cloneName(1, "default");
      staging.appendChild(first);
      const second = sources.get("support").clone();
      second.name = cloneName(1, "support");
      staging.appendChild(second);
      first.x = 50;
      first.y = 115;
      second.x = first.x + first.width + 440;
      second.y = first.y;
      const top = 5;
      const add = (item, x, y, width = 1500) => {
        annotation(page, staging, item.name, item.text, x, y, width, font);
      };
      add(FLOW1_BOARD.start, first.x, top);
      add(FLOW1_BOARD.step1, first.x, top + 34);
      add(FLOW1_BOARD.step1Note, first.x, top + 68);
      const control3 = prototypeControl(page, staging, font, first.x + first.width + 55, first.y + 280);
      add(FLOW1_BOARD.step2, second.x, top);
      add(FLOW1_BOARD.productBoundary, second.x, second.y + second.height + 28);
      add(FLOW1_BOARD.inventoryBoundary, second.x, second.y + second.height + 63);
      add(FLOW1_BOARD.end, second.x, second.y + second.height + 106);
      await control3.setReactionsAsync([navigateReaction(second.id)]);
      const maxX = Math.max(...staging.children.map((n) => "width" in n ? n.x + n.width : 0));
      const maxY = Math.max(...staging.children.map((n) => "height" in n ? n.y + n.height : 0));
      staging.resize(Math.max(3800, maxX + 55), Math.max(1300, maxY + 55));
      const preflight = await checkFlowOne(staging, sources);
      if (preflight.issues.length) throw new Error(`Flow 1 staging validation failed: ${preflight.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        old.name = PREVIOUS;
      }
      assertTarget(page);
      staging.name = CANONICAL;
      const finalCheck = await checkFlowOne(staging, sources);
      if (finalCheck.issues.length || page.children.filter((n) => n.name === CANONICAL).length !== 1) throw new Error(`Flow 1 canonical validation failed: ${finalCheck.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        if (archive) {
          old.name = ARCHIVE;
          old.y = staging.y + staging.height + 220;
        } else old.remove();
      }
      committed = true;
      return `Built ${CANONICAL}: fresh 03D product clones; validated external Continue control \u2192 Support Active; old section ${archive ? "archived with manual/ambiguous content" : old ? "removed after validation" : "not present"}.
${preflight.reactionReport ?? ""}`;
    } catch (error) {
      if (!committed) {
        if (old && !old.removed && (old.name === PREVIOUS || old.name === ARCHIVE)) {
          assertTarget(page);
          old.name = CANONICAL;
          if (oldY !== void 0) old.y = oldY;
        }
        if (staging && !staging.removed) {
          assertTarget(page);
          staging.remove();
        }
      }
      throw error;
    }
  }

  // src/flow2-validation.ts
  var KEYS = ["Awaiting Confirmation", "Processing", "Confirmed Result", "Reservation Confirmed"];
  var TEXT_ITEMS = [
    FLOW2_BOARD.start,
    FLOW2_BOARD.step1,
    FLOW2_BOARD.proposalBoundary,
    FLOW2_BOARD.step2,
    FLOW2_BOARD.processingNote,
    FLOW2_BOARD.step3,
    FLOW2_BOARD.confirmedNote,
    FLOW2_BOARD.step4,
    FLOW2_BOARD.orderBoundary,
    FLOW2_BOARD.deliveryBoundary,
    FLOW2_BOARD.backendBoundary,
    FLOW2_BOARD.end
  ];
  function reactionNodes2(frame) {
    return [frame, ...frame.findAll((n) => "reactions" in n)];
  }
  function textIn(frame) {
    return frame.findAll((n) => n.type === "TEXT").map((n) => n.characters).join(" ").toLowerCase();
  }
  function visibleOrderLink(frame) {
    const matches = frame.findAll((n) => n.name === "Order link" && n.type === "TEXT");
    if (matches.length !== 1 || !/open\s+order/i.test(matches[0].characters) || typeof matches[0].setReactionsAsync !== "function") return null;
    let current = matches[0];
    while (current && current.id !== frame.parent?.id) {
      if ("visible" in current && !current.visible) return null;
      if ("opacity" in current && current.opacity <= 0) return null;
      if (current.id === frame.id) break;
      current = current.parent;
    }
    return matches[0];
  }
  function sourceReactionsPreserved(source, clone, allowedAddedId) {
    const originals = reactionNodes2(source);
    const copies = reactionNodes2(clone);
    if (originals.length !== copies.length) return false;
    const idMap = new Map(originals.map((node, index) => [node.id, copies[index].id]));
    for (let i = 0; i < originals.length; i++) {
      const expected = JSON.parse(JSON.stringify(originals[i].reactions));
      for (const reaction of expected) {
        for (const action of reaction.actions ?? []) if (action.type === "NODE" && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId);
        if (reaction.action?.type === "NODE" && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId);
      }
      if (copies[i].id === allowedAddedId && expected.length === 0 && copies[i].reactions.length === 1) continue;
      if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
    }
    return true;
  }
  async function expectedReaction(node, destinationId) {
    const reactions = node.reactions;
    if (reactions.length !== 1) return `expected exactly one reaction, found ${reactions.length}`;
    const reaction = reactions[0];
    if (reaction.trigger?.type !== "ON_CLICK") return `expected ON_CLICK, got ${reaction.trigger?.type ?? "missing"}`;
    if (reaction.actions !== void 0 && reaction.actions.length !== 1) return `expected exactly one action, found ${reaction.actions.length}`;
    const actions = reaction.actions === void 0 ? reaction.action ? [reaction.action] : [] : reaction.actions;
    if (actions.length !== 1) return "NODE/NAVIGATE action missing";
    for (const action of [...actions, ...reaction.action && reaction.actions !== void 0 ? [reaction.action] : []]) {
      if (action.type !== "NODE") return `expected NODE, got ${action.type}`;
      if (action.navigation !== "NAVIGATE") return `expected NAVIGATE, got ${action.navigation}`;
      if (action.destinationId !== destinationId) return `expected destination ${destinationId}, got ${action.destinationId ?? "missing"}`;
      if (action.transition != null) return `animated transition ${JSON.stringify(action.transition)} is forbidden`;
    }
    if (!await figma.getNodeByIdAsync(destinationId)) return `destination ${destinationId} is broken`;
    return null;
  }
  function externalControl(section, name, marker, label4, from, to) {
    const matches = section.children.filter((n) => n.name === name);
    if (matches.length !== 1 || matches[0].type !== "FRAME") return null;
    const control3 = matches[0];
    const text = control3.findAll((n) => n.type === "TEXT").map((n) => n.characters);
    const ownedLabels = control3.children.length === 2 && control3.children.filter((n) => n.name === "Prototype-only marker" && n.type === "TEXT").length === 1 && control3.children.filter((n) => n.name === "Continue scenario label" && n.type === "TEXT").length === 1;
    const fill = control3.fills !== figma.mixed && control3.fills.some((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0);
    if (!control3.visible || control3.opacity <= 0 || !fill || !ownedLabels || control3.width < 250 || control3.height < 70 || control3.x < from.x + from.width || control3.x + control3.width > to.x || !text.includes(marker) || !text.includes(label4)) return null;
    return control3;
  }
  async function checkFlowTwo(section, sources) {
    const issues = [];
    const checks = [];
    let broken = 0;
    const record = (name, passed, detail2 = name) => {
      checks.push({ name, passed });
      if (!passed) issues.push(detail2);
    };
    const allowed = /* @__PURE__ */ new Set([
      ...KEYS.map((key) => cloneName(2, key)),
      ...TEXT_ITEMS.map((item) => item.name),
      FLOW2_BOARD.confirmation.name,
      FLOW2_BOARD.processingComplete.name,
      FLOW2_BOARD.orderSource.name,
      FLOW2_BOARD.orderControl.name
    ]);
    record("Generated-node ownership", section.children.every((n) => allowed.has(n.name)), "Unexpected node inside generated Flow 2 section.");
    const clones = /* @__PURE__ */ new Map();
    for (const key of KEYS) {
      const exact = section.children.filter((n) => n.name === cloneName(2, key));
      if (exact.length === 1 && exact[0].type === "FRAME") clones.set(key, exact[0]);
      record(`${key} source`, exact.length === 1 && exact[0].type === "FRAME" && Boolean(sources.get(key)) && visualSignature(exact[0]) === visualSignature(sources.get(key)), `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`);
    }
    for (const item of TEXT_ITEMS) {
      const exact = section.children.filter((n) => n.name === item.name);
      record(item.name, exact.length === 1 && exact[0].type === "TEXT" && exact[0].characters.trim() === item.text.trim(), `Missing/wrong external annotation: ${item.name}`);
    }
    const [awaiting, processing, confirmed, order] = KEYS.map((key) => clones.get(key));
    if (!awaiting || !processing || !confirmed || !order) return { issues, broken, checks, strategy: null };
    record("Left-to-right scenario sequence", awaiting.x + awaiting.width < processing.x && processing.x + processing.width < confirmed.x && confirmed.x + confirmed.width < order.x, "Scenario frames are not ordered Awaiting \u2192 Processing \u2192 Confirmed \u2192 Order.");
    const confirmation = externalControl(
      section,
      FLOW2_BOARD.confirmation.name,
      FLOW2_BOARD.confirmation.marker,
      FLOW2_BOARD.confirmation.text,
      awaiting,
      processing
    );
    record("Explicit customer-confirmation boundary", Boolean(confirmation), "Visible external customer-confirmation control missing or misplaced.");
    if (confirmation) {
      const error = await expectedReaction(confirmation, processing.id);
      record("Customer confirmation \u2192 Processing", !error, error ?? void 0);
      if (error) broken++;
    }
    const processingControl = externalControl(
      section,
      FLOW2_BOARD.processingComplete.name,
      FLOW2_BOARD.processingComplete.marker,
      FLOW2_BOARD.processingComplete.text,
      processing,
      confirmed
    );
    record("External processing-result boundary", Boolean(processingControl), "Visible external business-result control missing or misplaced.");
    if (processingControl) {
      const error = await expectedReaction(processingControl, confirmed.id);
      record("Processing \u2192 Confirmed Result", !error, error ?? void 0);
      if (error) broken++;
    }
    const productLink = visibleOrderLink(confirmed);
    const externalMatches = section.children.filter((n) => n.name === FLOW2_BOARD.orderControl.name);
    const productLabel = section.children.filter((n) => n.name === FLOW2_BOARD.orderSource.name);
    let strategy = null;
    if (externalMatches.length === 0 && productLabel.length === 1 && productLabel[0].type === "TEXT" && productLabel[0].characters === FLOW2_BOARD.orderSource.text && productLink && visibleOrderLink(sources.get("Confirmed Result"))?.reactions.length === 0) {
      strategy = "PRODUCT CONTROL";
      const error = await expectedReaction(productLink, order.id);
      record("Open Order navigation", !error, error ?? void 0);
      if (error) broken++;
    } else if (externalMatches.length === 1 && productLabel.length === 0) {
      strategy = "PROTOTYPE CONTROL";
      const control3 = externalControl(
        section,
        FLOW2_BOARD.orderControl.name,
        FLOW2_BOARD.orderControl.marker,
        FLOW2_BOARD.orderControl.text,
        confirmed,
        order
      );
      record("External Open Order control", Boolean(control3), "Visible external Open Order control missing or misplaced.");
      if (control3) {
        const error = await expectedReaction(control3, order.id);
        record("Open Order navigation", !error, error ?? void 0);
        if (error) broken++;
      }
    } else record("Open Order navigation", false, "Open Order progression is missing, duplicated, or has ambiguous ownership.");
    for (const key of KEYS) {
      const source = sources.get(key);
      const clone = clones.get(key);
      const exception = key === "Confirmed Result" && strategy === "PRODUCT CONTROL" ? productLink?.id : void 0;
      record(
        `${key} source reactions`,
        source ? sourceReactionsPreserved(source, clone, exception) : false,
        `${key}: source reactions changed or unauthorized Phase 3E reaction added inside product clone.`
      );
      for (const node of reactionNodes2(clone)) for (const reaction of node.reactions) {
        for (const action of [...reaction.actions ?? [], ...reaction.action ? [reaction.action] : []]) {
          if (action.type === "NODE" && (!action.destinationId || !await figma.getNodeByIdAsync(action.destinationId))) {
            issues.push(`Broken inherited/product reaction destination on ${node.name}.`);
            broken++;
          }
        }
      }
    }
    const proposal = textIn(awaiting);
    const pending = textIn(processing);
    const result = textIn(confirmed);
    const detail = textIn(order);
    record("Proposal \u2260 execution", proposal.includes("confirm") && (proposal.includes("proposed") || proposal.includes("proposal")) && (proposal.includes("not executed") || proposal.includes("before action")), "Awaiting source does not show a pre-execution proposal/confirmation boundary.");
    record(
      "Processing \u2260 confirmed",
      pending.includes("processing") && (pending.includes("pending") || pending.includes("not yet known")),
      "Processing source does not show a pending, unconfirmed result."
    );
    record(
      "Confirmed business facts",
      result.includes("order") && result.includes("reservation confirmed"),
      "Confirmed Result source lacks independent Order and confirmed reservation facts."
    );
    record("Order State \u2260 Reservation State", detail.includes("order state") && detail.includes("reservation state") && detail.includes("created") && detail.includes("confirmed"), "Order detail lacks separate Created Order and Confirmed Reservation states.");
    record(
      "Message delivery \u2260 business effect",
      section.children.some((n) => n.name === FLOW2_BOARD.deliveryBoundary.name && n.type === "TEXT" && n.characters === FLOW2_BOARD.deliveryBoundary.text),
      "Message delivery/business effect boundary missing."
    );
    return { issues, broken, checks, strategy };
  }

  // src/purchase-success.ts
  var CANONICAL2 = flowSectionName(2);
  var STAGING2 = `${CANONICAL2} / staging`;
  var PREVIOUS2 = `${CANONICAL2} / previous`;
  var ARCHIVE2 = "ARCHIVE \u2014 Flow 2 \u2014 previous prototype with manual or ambiguous content";
  var KEYS2 = ["Awaiting Confirmation", "Processing", "Confirmed Result", "Reservation Confirmed"];
  function prototypeControl2(page, section, font, item, x, y) {
    assertTarget(page);
    const control3 = figma.createFrame();
    control3.name = item.name;
    section.appendChild(control3);
    control3.resize(330, 104);
    control3.x = x;
    control3.y = y;
    control3.cornerRadius = 8;
    control3.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
    control3.strokes = [{ type: "SOLID", color: { r: 0.52, g: 0.52, b: 0.52 } }];
    control3.strokeWeight = 1;
    const addLabel = (name, value, top, size) => {
      assertTarget(page);
      const label4 = figma.createText();
      label4.name = name;
      control3.appendChild(label4);
      label4.fontName = font;
      label4.fontSize = size;
      label4.textAutoResize = "HEIGHT";
      label4.resize(302, 24);
      label4.characters = value;
      label4.fills = [{ type: "SOLID", color: { r: 0.24, g: 0.24, b: 0.24 } }];
      label4.x = 14;
      label4.y = top;
    };
    addLabel("Prototype-only marker", item.marker, 11, 11);
    addLabel("Continue scenario label", item.text, 38, 15);
    return control3;
  }
  async function buildPurchaseSuccess(page, sources, font) {
    assertTarget(page);
    const oldMatches = page.children.filter((n) => n.name === CANONICAL2);
    if (oldMatches.length > 1 || oldMatches.length === 1 && oldMatches[0].type !== "SECTION") throw new Error("Flow 2 canonical section is duplicate or wrong type. Nothing was changed.");
    if (page.children.some((n) => n.name === STAGING2 || n.name === PREVIOUS2)) throw new Error("Existing Flow 2 staging/previous section requires manual review. Nothing was changed.");
    const old = oldMatches[0];
    const oldY = old?.y;
    const initialY = old?.y ?? Math.max(4800, ...page.children.filter((n) => n.type === "SECTION" && n.name !== "09 \u2014 Prototype Validation").map((n) => n.y + n.height + 180));
    const oldCheck = old ? await checkFlowTwo(old, sources) : null;
    const archive = Boolean(old && oldCheck?.issues.length);
    if (archive && page.children.some((n) => n.name === ARCHIVE2)) throw new Error("Flow 2 archive name already exists. Nothing was changed.");
    let staging;
    let committed = false;
    try {
      assertTarget(page);
      staging = figma.createSection();
      staging.name = STAGING2;
      staging.x = old?.x ?? 0;
      staging.y = initialY;
      staging.resize(8200, 1900);
      const clones = /* @__PURE__ */ new Map();
      for (const key of KEYS2) {
        assertTarget(page);
        const clone = sources.get(key).clone();
        clone.name = cloneName(2, key);
        staging.appendChild(clone);
        clones.set(key, clone);
      }
      let cursor = 50;
      for (const key of KEYS2) {
        const clone = clones.get(key);
        clone.x = cursor;
        clone.y = 150;
        cursor += clone.width + 440;
      }
      const awaiting = clones.get("Awaiting Confirmation");
      const processing = clones.get("Processing");
      const confirmed = clones.get("Confirmed Result");
      const order = clones.get("Reservation Confirmed");
      const add = (item, x, y, width = 1500) => {
        annotation(page, staging, item.name, item.text, x, y, width, font);
      };
      add(FLOW2_BOARD.start, awaiting.x, 5);
      add(FLOW2_BOARD.step1, awaiting.x, 40);
      add(FLOW2_BOARD.proposalBoundary, awaiting.x, 75);
      add(FLOW2_BOARD.step2, processing.x, 40);
      add(FLOW2_BOARD.processingNote, processing.x, 75);
      add(FLOW2_BOARD.step3, confirmed.x, 40);
      add(FLOW2_BOARD.confirmedNote, confirmed.x, 75);
      add(FLOW2_BOARD.step4, order.x, 40);
      add(FLOW2_BOARD.orderBoundary, order.x, order.y + order.height + 30);
      add(FLOW2_BOARD.deliveryBoundary, order.x, order.y + order.height + 65);
      add(FLOW2_BOARD.backendBoundary, awaiting.x, Math.max(...Array.from(clones.values(), (n) => n.y + n.height)) + 100, 3e3);
      add(FLOW2_BOARD.end, order.x, order.y + order.height + 115);
      const confirmation = prototypeControl2(
        page,
        staging,
        font,
        FLOW2_BOARD.confirmation,
        awaiting.x + awaiting.width + 55,
        awaiting.y + 280
      );
      const completed = prototypeControl2(
        page,
        staging,
        font,
        FLOW2_BOARD.processingComplete,
        processing.x + processing.width + 55,
        processing.y + 280
      );
      await confirmation.setReactionsAsync([navigateReaction(processing.id)]);
      await completed.setReactionsAsync([navigateReaction(confirmed.id)]);
      const approvedOrderLink = visibleOrderLink(sources.get("Confirmed Result"));
      const clonedOrderLink = visibleOrderLink(confirmed);
      const productLink = approvedOrderLink && approvedOrderLink.reactions.length === 0 && clonedOrderLink && clonedOrderLink.reactions.length === 0;
      if (productLink && clonedOrderLink) {
        add(FLOW2_BOARD.orderSource, confirmed.x, confirmed.y + confirmed.height + 30);
        await clonedOrderLink.setReactionsAsync([navigateReaction(order.id)]);
      } else {
        const control3 = prototypeControl2(
          page,
          staging,
          font,
          FLOW2_BOARD.orderControl,
          confirmed.x + confirmed.width + 55,
          confirmed.y + 280
        );
        await control3.setReactionsAsync([navigateReaction(order.id)]);
      }
      const maxX = Math.max(...staging.children.map((n) => "width" in n ? n.x + n.width : 0));
      const maxY = Math.max(...staging.children.map((n) => "height" in n ? n.y + n.height : 0));
      staging.resize(Math.max(8200, maxX + 70), Math.max(1900, maxY + 70));
      const preflight = await checkFlowTwo(staging, sources);
      if (preflight.issues.length) throw new Error(`Flow 2 staging validation failed: ${preflight.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        old.name = PREVIOUS2;
      }
      assertTarget(page);
      staging.name = CANONICAL2;
      const finalCheck = await checkFlowTwo(staging, sources);
      if (finalCheck.issues.length || page.children.filter((n) => n.name === CANONICAL2).length !== 1) throw new Error(`Flow 2 canonical validation failed: ${finalCheck.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        if (archive) {
          old.name = ARCHIVE2;
          old.y = staging.y + staging.height + 220;
        } else old.remove();
      }
      committed = true;
      return `Built ${CANONICAL2}: four fresh 03D clones; Customer confirmation \u2192 Processing: PROTOTYPE CONTROL; Processing \u2192 Confirmed Result: PROTOTYPE CONTROL; Open Order \u2192 Reservation Confirmed: ${preflight.strategy}; old section ${archive ? "archived" : old ? "removed after validation" : "not present"}.`;
    } catch (error) {
      if (!committed) {
        if (old && !old.removed && (old.name === PREVIOUS2 || old.name === ARCHIVE2)) {
          assertTarget(page);
          old.name = CANONICAL2;
          if (oldY !== void 0) old.y = oldY;
        }
        if (staging && !staging.removed) {
          assertTarget(page);
          staging.remove();
        }
      }
      throw error;
    }
  }

  // src/flow3-validation.ts
  var KEYS3 = ["Known Failure", "Reservation Failed"];
  var ANNOTATIONS = [
    FLOW3_BOARD.start,
    FLOW3_BOARD.step1,
    FLOW3_BOARD.confirmedFailure,
    FLOW3_BOARD.knownBoundary,
    FLOW3_BOARD.noReconciliation,
    FLOW3_BOARD.step2,
    FLOW3_BOARD.orderBoundary,
    FLOW3_BOARD.inventoryBoundary,
    FLOW3_BOARD.recovery,
    FLOW3_BOARD.end
  ];
  function reactionNodes3(frame) {
    return [frame, ...frame.findAll((n) => "reactions" in n)];
  }
  function copyReactionsPreserved(source, clone, added) {
    const originals = reactionNodes3(source);
    const copies = reactionNodes3(clone);
    if (originals.length !== copies.length) return false;
    const idMap = new Map(originals.map((node, index) => [node.id, copies[index].id]));
    for (let i = 0; i < originals.length; i++) {
      const expected = JSON.parse(JSON.stringify(originals[i].reactions));
      for (const reaction of expected) {
        for (const action of reaction.actions ?? []) if (action.type === "NODE" && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId);
        if (reaction.action?.type === "NODE" && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId);
      }
      if (copies[i].id === added && expected.length === 0 && copies[i].reactions.length === 1) continue;
      if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
    }
    return true;
  }
  async function reactionError(node, destinationId) {
    if (node.reactions.length !== 1) return `expected one Open Order reaction, found ${node.reactions.length}`;
    const reaction = node.reactions[0];
    if (reaction.trigger?.type !== "ON_CLICK") return "Open Order trigger must be ON_CLICK";
    if (reaction.actions !== void 0 && reaction.actions.length !== 1) return "Open Order must have exactly one action";
    const actions = reaction.actions === void 0 ? reaction.action ? [reaction.action] : [] : reaction.actions;
    if (actions.length !== 1) return "Open Order NODE action missing";
    for (const action of [...actions, ...reaction.action && reaction.actions !== void 0 ? [reaction.action] : []]) {
      if (action.type !== "NODE" || action.navigation !== "NAVIGATE") return "Open Order must use NODE/NAVIGATE";
      if (action.destinationId !== destinationId) return `Open Order destination must be fresh Reservation Failed ${destinationId}`;
      if (action.transition != null) return "Open Order animation is forbidden";
    }
    if (!await figma.getNodeByIdAsync(destinationId)) return "Open Order destination is broken";
    return null;
  }
  function externalControl2(section, from, to) {
    const matches = section.children.filter((n) => n.name === FLOW3_BOARD.orderControl.name);
    if (matches.length !== 1 || matches[0].type !== "FRAME") return null;
    const control3 = matches[0];
    const labels = control3.children;
    if (!control3.visible || control3.opacity <= 0 || control3.width < 250 || control3.height < 70 || control3.x < from.x + from.width || control3.x + control3.width > to.x || labels.length !== 2 || labels.filter((n) => n.name === "Prototype-only marker" && n.type === "TEXT" && n.characters === FLOW3_BOARD.orderControl.marker).length !== 1 || labels.filter((n) => n.name === "Continue scenario label" && n.type === "TEXT" && n.characters === FLOW3_BOARD.orderControl.text).length !== 1 || control3.fills === figma.mixed || !control3.fills.some((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0)) return null;
    return control3;
  }
  function textIn2(frame) {
    return frame.findAll((n) => n.type === "TEXT").map((n) => n.characters).join(" ").toLowerCase();
  }
  async function checkFlowThree(section, sources) {
    const issues = [];
    const checks = [];
    let broken = 0;
    const record = (name, ok, detail = name) => {
      checks.push({ name, passed: ok });
      if (!ok) issues.push(detail);
    };
    const allowed = /* @__PURE__ */ new Set([
      ...KEYS3.map((key) => cloneName(3, key)),
      ...ANNOTATIONS.map((a) => a.name),
      FLOW3_BOARD.orderSource.name,
      FLOW3_BOARD.orderControl.name
    ]);
    record("Generated-node ownership", section.children.every((n) => allowed.has(n.name)), "Unexpected node inside generated Flow 3 section.");
    const clones = /* @__PURE__ */ new Map();
    for (const key of KEYS3) {
      const exact = section.children.filter((n) => n.name === cloneName(3, key));
      if (exact.length === 1 && exact[0].type === "FRAME") clones.set(key, exact[0]);
      record(
        `${key} source`,
        exact.length === 1 && exact[0].type === "FRAME" && Boolean(sources.get(key)) && visualSignature(exact[0]) === visualSignature(sources.get(key)),
        `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`
      );
    }
    for (const item of ANNOTATIONS) {
      const exact = section.children.filter((n) => n.name === item.name);
      record(
        item.name,
        exact.length === 1 && exact[0].type === "TEXT" && exact[0].characters.trim() === item.text.trim(),
        `Missing/wrong external annotation: ${item.name}`
      );
    }
    const conversation = clones.get("Known Failure");
    const order = clones.get("Reservation Failed");
    if (!conversation || !order) return { issues, broken, checks, strategy: null };
    record(
      "Left-to-right known-failure scenario",
      conversation.x + conversation.width < order.x,
      "Known Failure and Reservation Failed frames are not ordered left to right."
    );
    const conversationText = textIn2(conversation);
    const orderText = textIn2(order);
    record(
      "Known Failure \u2260 OUTCOME_UNKNOWN",
      conversationText.includes("reservation failed") && conversationText.includes("inventory was not reserved") && !conversationText.includes("outcome_unknown") && orderText.includes("known failure") && orderText.includes("reservation failed") && !orderText.includes("outcome_unknown"),
      "Approved clones do not show a confirmed, known reservation failure distinct from OUTCOME_UNKNOWN."
    );
    record(
      "No reconciliation requirement",
      !/reconciliation required|must reconcile|reconcile authoritative/i.test(conversationText + " " + orderText),
      "Known-failure product copy incorrectly requires reconciliation."
    );
    record(
      "Order State \u2260 Reservation State",
      orderText.includes("order state") && orderText.includes("reservation state") && orderText.includes("created") && orderText.includes("known failure"),
      "Order detail lacks separate Created Order and Known Failure reservation states."
    );
    record(
      "Safe authorized recovery",
      conversationText.includes("review current inventory") && orderText.includes("review current inventory") && orderText.includes("authorized recovery"),
      "Approved source lacks safe, authorized recovery guidance."
    );
    const allExternal = section.children.filter((n) => n.type === "TEXT").map((n) => n.characters).join(" ");
    const unsafeRetry = /retry(?:\s+reservation)?\s+automatically|automatic\s+(?:mutation\s+)?retry|reserve\s+again|repeat\s+mutation/i;
    record(
      "No automatic retry",
      !unsafeRetry.test(allExternal) && !unsafeRetry.test(conversationText + " " + orderText),
      "Flow 3 implies an automatic mutation retry."
    );
    const productLink = visibleOrderLink(conversation);
    const sourceLink = sources.get("Known Failure") && visibleOrderLink(sources.get("Known Failure"));
    const externalMatches = section.children.filter((n) => n.name === FLOW3_BOARD.orderControl.name);
    const productLabels = section.children.filter((n) => n.name === FLOW3_BOARD.orderSource.name);
    let strategy = null;
    if (externalMatches.length === 0 && productLabels.length === 1 && productLabels[0].type === "TEXT" && productLabels[0].characters === FLOW3_BOARD.orderSource.text && productLink && sourceLink && sourceLink.reactions.length === 0) {
      strategy = "PRODUCT CONTROL";
      const error = await reactionError(productLink, order.id);
      record("Open Order navigation", !error, error ?? void 0);
      if (error) broken++;
    } else if (externalMatches.length === 1 && productLabels.length === 0) {
      strategy = "PROTOTYPE CONTROL";
      const control3 = externalControl2(section, conversation, order);
      record("External Open Order control", Boolean(control3), "Visible external Open Order control missing or misplaced.");
      if (control3) {
        const error = await reactionError(control3, order.id);
        record("Open Order navigation", !error, error ?? void 0);
        if (error) broken++;
      }
    } else record("Open Order navigation", false, "Open Order progression is missing, duplicate, or ambiguous.");
    for (const key of KEYS3) {
      const source = sources.get(key);
      const clone = clones.get(key);
      const exception = key === "Known Failure" && strategy === "PRODUCT CONTROL" ? productLink?.id : void 0;
      record(
        `${key} source reactions`,
        Boolean(source) && copyReactionsPreserved(source, clone, exception),
        `${key}: source reactions changed or unauthorized Phase 3E reaction added inside product clone.`
      );
    }
    let destinationsValid = true;
    for (const clone of clones.values()) for (const node of reactionNodes3(clone)) for (const reaction of node.reactions) {
      for (const action of [...reaction.actions ?? [], ...reaction.action ? [reaction.action] : []]) {
        if (action.type !== "NODE") continue;
        const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
        if (!dest || /OUTCOME_UNKNOWN|Reconciliation Required|Processing|Reservation Confirmed|Retry Reservation|automatic retry|Reserve Again|Repeat Mutation/i.test(dest.name)) {
          destinationsValid = false;
          broken++;
        }
      }
    }
    for (const control3 of externalMatches) for (const reaction of "reactions" in control3 ? control3.reactions : []) {
      for (const action of [...reaction.actions ?? [], ...reaction.action ? [reaction.action] : []]) {
        if (action.type !== "NODE") continue;
        const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
        if (!dest || /OUTCOME_UNKNOWN|Reconciliation Required|Processing|Reservation Confirmed|Retry Reservation|automatic retry|Reserve Again|Repeat Mutation/i.test(dest.name)) {
          destinationsValid = false;
          broken++;
        }
      }
    }
    record("Broken destinations", destinationsValid, "Flow 3 contains a broken or prohibited destination.");
    record(
      "Explicit END",
      section.children.some((n) => n.name === FLOW3_BOARD.end.name && n.type === "TEXT" && n.characters.includes("Reservation Failed is the final scenario state.")),
      "END does not explicitly identify Reservation Failed as the final state."
    );
    return { issues, broken, checks, strategy };
  }

  // src/reservation-failure.ts
  var CANONICAL3 = flowSectionName(3);
  var STAGING3 = `${CANONICAL3} / staging`;
  var PREVIOUS3 = `${CANONICAL3} / previous`;
  var ARCHIVE3 = "ARCHIVE \u2014 Flow 3 \u2014 previous prototype with manual or ambiguous content";
  function prototypeControl3(page, section, font, x, y) {
    assertTarget(page);
    const control3 = figma.createFrame();
    control3.name = FLOW3_BOARD.orderControl.name;
    section.appendChild(control3);
    control3.resize(330, 104);
    control3.x = x;
    control3.y = y;
    control3.cornerRadius = 8;
    control3.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
    control3.strokes = [{ type: "SOLID", color: { r: 0.52, g: 0.52, b: 0.52 } }];
    control3.strokeWeight = 1;
    const label4 = (name, value, top, size) => {
      assertTarget(page);
      const text = figma.createText();
      text.name = name;
      control3.appendChild(text);
      text.fontName = font;
      text.fontSize = size;
      text.textAutoResize = "HEIGHT";
      text.resize(302, 24);
      text.characters = value;
      text.fills = [{ type: "SOLID", color: { r: 0.24, g: 0.24, b: 0.24 } }];
      text.x = 14;
      text.y = top;
    };
    label4("Prototype-only marker", FLOW3_BOARD.orderControl.marker, 11, 11);
    label4("Continue scenario label", FLOW3_BOARD.orderControl.text, 38, 15);
    return control3;
  }
  async function buildReservationFailure(page, sources, font) {
    assertTarget(page);
    const oldMatches = page.children.filter((n) => n.name === CANONICAL3);
    if (oldMatches.length > 1 || oldMatches.length === 1 && oldMatches[0].type !== "SECTION")
      throw new Error("Flow 3 canonical section is duplicate or wrong type. Nothing was changed.");
    if (page.children.some((n) => n.name === STAGING3 || n.name === PREVIOUS3))
      throw new Error("Existing Flow 3 staging/previous section requires manual review. Nothing was changed.");
    const old = oldMatches[0];
    const oldY = old?.y;
    const initialY = old?.y ?? Math.max(7e3, ...page.children.filter((n) => n.type === "SECTION" && n.name !== "09 \u2014 Prototype Validation").map((n) => n.y + n.height + 180));
    const prior = old ? await checkFlowThree(old, sources) : null;
    const archive = Boolean(old && prior?.issues.length);
    if (archive && page.children.some((n) => n.name === ARCHIVE3)) throw new Error("Flow 3 archive name already exists. Nothing was changed.");
    let staging;
    let committed = false;
    try {
      assertTarget(page);
      staging = figma.createSection();
      staging.name = STAGING3;
      staging.x = old?.x ?? 0;
      staging.y = initialY;
      staging.resize(4200, 1900);
      const conversation = sources.get("Known Failure").clone();
      conversation.name = cloneName(3, "Known Failure");
      staging.appendChild(conversation);
      conversation.x = 50;
      conversation.y = 190;
      const order = sources.get("Reservation Failed").clone();
      order.name = cloneName(3, "Reservation Failed");
      staging.appendChild(order);
      order.x = conversation.x + conversation.width + 450;
      order.y = 190;
      if (visualSignature(conversation) !== visualSignature(sources.get("Known Failure")) || visualSignature(order) !== visualSignature(sources.get("Reservation Failed"))) throw new Error("Fresh 03D clone visual mismatch.");
      const add = (item, x, y, width = 1600) => {
        annotation(page, staging, item.name, item.text, x, y, width, font);
      };
      add(FLOW3_BOARD.start, conversation.x, 5);
      add(FLOW3_BOARD.step1, conversation.x, 40);
      add(FLOW3_BOARD.confirmedFailure, conversation.x, 75);
      add(FLOW3_BOARD.knownBoundary, conversation.x, 110);
      add(FLOW3_BOARD.noReconciliation, conversation.x, 145);
      add(FLOW3_BOARD.step2, order.x, 40);
      add(FLOW3_BOARD.orderBoundary, order.x, 75, Math.max(1500, order.width));
      const below = Math.max(conversation.y + conversation.height, order.y + order.height) + 35;
      add(FLOW3_BOARD.inventoryBoundary, order.x, below, Math.max(1600, order.width));
      add(FLOW3_BOARD.recovery, order.x, below + 65, Math.max(1600, order.width));
      add(FLOW3_BOARD.end, order.x, below + 165, Math.max(1600, order.width));
      const sourceLink = visibleOrderLink(sources.get("Known Failure"));
      const clonedLink = visibleOrderLink(conversation);
      const useProduct = Boolean(sourceLink && sourceLink.reactions.length === 0 && clonedLink && clonedLink.reactions.length === 0);
      if (useProduct && clonedLink) {
        add(FLOW3_BOARD.orderSource, conversation.x, below);
        await clonedLink.setReactionsAsync([navigateReaction(order.id)]);
      } else {
        const control3 = prototypeControl3(
          page,
          staging,
          font,
          conversation.x + conversation.width + 55,
          conversation.y + 280
        );
        await control3.setReactionsAsync([navigateReaction(order.id)]);
      }
      const maxX = Math.max(...staging.children.map((n) => "width" in n ? n.x + n.width : 0));
      const maxY = Math.max(...staging.children.map((n) => "height" in n ? n.y + n.height : 0));
      staging.resize(Math.max(4200, maxX + 80), Math.max(1900, maxY + 80));
      const preflight = await checkFlowThree(staging, sources);
      if (preflight.issues.length) throw new Error(`Flow 3 staging validation failed: ${preflight.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        old.name = PREVIOUS3;
      }
      assertTarget(page);
      staging.name = CANONICAL3;
      const finalCheck = await checkFlowThree(staging, sources);
      if (finalCheck.issues.length || page.children.filter((n) => n.name === CANONICAL3).length !== 1)
        throw new Error(`Flow 3 canonical validation failed: ${finalCheck.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        if (archive) {
          old.name = ARCHIVE3;
          old.y = staging.y + staging.height + 220;
        } else old.remove();
      }
      committed = true;
      return `Built ${CANONICAL3}: two fresh 03D clones; Open Order \u2192 Reservation Failed: ${preflight.strategy}; old section ${archive ? "archived" : old ? "removed after validation" : "not present"}.`;
    } catch (error) {
      if (!committed) {
        if (old && !old.removed && (old.name === PREVIOUS3 || old.name === ARCHIVE3)) {
          assertTarget(page);
          old.name = CANONICAL3;
          if (oldY !== void 0) old.y = oldY;
        }
        if (staging && !staging.removed) {
          assertTarget(page);
          staging.remove();
        }
      }
      throw error;
    }
  }

  // src/flow4-validation.ts
  var KEYS4 = ["Support Active", "Handoff", "Sales Active"];
  var ANNOTATIONS2 = [
    FLOW4_BOARD.start,
    FLOW4_BOARD.step1,
    FLOW4_BOARD.supportNote,
    FLOW4_BOARD.step2,
    FLOW4_BOARD.handlerBoundary,
    FLOW4_BOARD.contextNote,
    FLOW4_BOARD.permissionBoundary,
    FLOW4_BOARD.step3,
    FLOW4_BOARD.salesNote,
    FLOW4_BOARD.authorizationNote,
    FLOW4_BOARD.end
  ];
  function reactionNodes4(frame) {
    return [frame, ...frame.findAll((n) => "reactions" in n)];
  }
  function textIn3(frame) {
    return frame.findAll((n) => n.type === "TEXT").map((n) => n.characters).join(" ").toLowerCase();
  }
  function namedText(frame, name) {
    const contexts = frame.children.filter((n) => n.type === "FRAME" && n.name === "Persistent Context Panel");
    if (contexts.length !== 1) return null;
    const matches = contexts[0].findAll((n) => n.type === "TEXT" && n.name === name);
    return matches.length === 1 ? matches[0].characters.trim() : null;
  }
  function approvedHandoffControl(frame, step) {
    const acceptedName = step === "request" ? /^(Request Sales handoff|Handoff to Sales|Request Sales involvement|Sales handoff action)$/i : /^(Accept handoff|Accept Sales handoff|Take ownership|Sales ownership action)$/i;
    const acceptedLabel = step === "request" ? /^(request sales handoff|handoff to sales|request sales involvement)$/i : /^(accept(?: sales)? handoff|take ownership)$/i;
    const matches = frame.findAll((n) => n.type === "TEXT" && acceptedName.test(n.name) && acceptedLabel.test(n.characters.trim()) && typeof n.setReactionsAsync === "function");
    if (matches.length !== 1) return null;
    let current = matches[0];
    while (current) {
      if ("visible" in current && !current.visible) return null;
      if ("opacity" in current && current.opacity <= 0) return null;
      if (current.id === frame.id) break;
      current = current.parent;
    }
    return matches[0];
  }
  function sourceReactionsPreserved2(source, clone, added) {
    const originals = reactionNodes4(source);
    const copies = reactionNodes4(clone);
    if (originals.length !== copies.length) return false;
    const idMap = new Map(originals.map((node, index) => [node.id, copies[index].id]));
    for (let i = 0; i < originals.length; i++) {
      const expected = JSON.parse(JSON.stringify(originals[i].reactions));
      for (const reaction of expected) {
        for (const action of reaction.actions ?? []) if (action.type === "NODE" && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId);
        if (reaction.action?.type === "NODE" && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId);
      }
      if (copies[i].id === added && expected.length === 0 && copies[i].reactions.length === 1) continue;
      if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
    }
    return true;
  }
  async function reactionError2(node, destinationId) {
    if (node.reactions.length !== 1) return `expected one progression reaction, found ${node.reactions.length}`;
    const reaction = node.reactions[0];
    if (reaction.trigger?.type !== "ON_CLICK") return "Progression trigger must be ON_CLICK";
    if (reaction.actions !== void 0 && reaction.actions.length !== 1) return "Progression must have exactly one action";
    const actions = reaction.actions === void 0 ? reaction.action ? [reaction.action] : [] : reaction.actions;
    if (actions.length !== 1) return "Progression NODE action missing";
    for (const action of [...actions, ...reaction.action && reaction.actions !== void 0 ? [reaction.action] : []]) {
      if (action.type !== "NODE" || action.navigation !== "NAVIGATE") return "Progression must use NODE/NAVIGATE";
      if (action.destinationId !== destinationId) return `Progression destination must be fresh clone ${destinationId}`;
      if (action.transition != null) return "Animated progression is forbidden";
    }
    if (!await figma.getNodeByIdAsync(destinationId)) return "Progression destination is broken";
    return null;
  }
  function externalControl3(section, item, from, to) {
    const matches = section.children.filter((n) => n.name === item.name);
    if (matches.length !== 1 || matches[0].type !== "FRAME") return null;
    const control3 = matches[0];
    if (!control3.visible || control3.opacity <= 0 || control3.width < 250 || control3.height < 70 || control3.x < from.x + from.width || control3.x + control3.width > to.x || control3.children.length !== 2 || control3.children.filter((n) => n.name === "Prototype-only marker" && n.type === "TEXT" && n.characters === item.marker).length !== 1 || control3.children.filter((n) => n.name === "Continue scenario label" && n.type === "TEXT" && n.characters === item.text).length !== 1 || control3.fills === figma.mixed || !control3.fills.some((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0)) return null;
    return control3;
  }
  async function checkFlowFour(section, sources) {
    const issues = [];
    const checks = [];
    let broken = 0;
    const strategies = { request: null, accept: null };
    const record = (name, ok, detail = name) => {
      checks.push({ name, passed: ok });
      if (!ok) issues.push(detail);
    };
    const allowed = /* @__PURE__ */ new Set([
      ...KEYS4.map((key) => cloneName(4, key)),
      ...ANNOTATIONS2.map((a) => a.name),
      FLOW4_BOARD.requestSource.name,
      FLOW4_BOARD.requestControl.name,
      FLOW4_BOARD.acceptSource.name,
      FLOW4_BOARD.acceptControl.name
    ]);
    record("Generated-node ownership", section.children.every((n) => allowed.has(n.name)), "Unexpected node inside generated Flow 4 section.");
    const clones = /* @__PURE__ */ new Map();
    for (const key of KEYS4) {
      const exact = section.children.filter((n) => n.name === cloneName(4, key));
      if (exact.length === 1 && exact[0].type === "FRAME") clones.set(key, exact[0]);
      record(
        `${key} source`,
        exact.length === 1 && exact[0].type === "FRAME" && Boolean(sources.get(key)) && visualSignature(exact[0]) === visualSignature(sources.get(key)),
        `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`
      );
    }
    for (const item of ANNOTATIONS2) {
      const exact = section.children.filter((n) => n.name === item.name);
      record(
        item.name,
        exact.length === 1 && exact[0].type === "TEXT" && exact[0].characters.trim() === item.text.trim(),
        `Missing/wrong external annotation: ${item.name}`
      );
    }
    const support = clones.get("Support Active");
    const handoff = clones.get("Handoff");
    const sales = clones.get("Sales Active");
    if (!support || !handoff || !sales) return { issues, broken, checks, strategies };
    record("Required Support \u2192 Handoff \u2192 Sales sequence", support.x + support.width < handoff.x && handoff.x + handoff.width < sales.x, "Flow 4 must pass through Handoff between Support and Sales.");
    const supportText = textIn3(support);
    const handoffText = textIn3(handoff);
    const salesText = textIn3(sales);
    record(
      "Support current handler",
      namedText(support, "Handler name") === "Support Agent" && supportText.includes("support agent active") && supportText.includes("does not perform sales writes"),
      "Support Active must identify Support as current handler without Sales-write authority."
    );
    record("Previous handler Support", handoffText.includes("support agent \u2192 sales agent") && handoffText.includes("reason:"), "Handoff must identify previous Support handler and handoff reason.");
    record("Next handler Sales", handoffText.includes("support agent \u2192 sales agent") && namedText(handoff, "Handler name") === "Sales Agent", "Handoff must identify Sales as next handler.");
    const contextNames = ["Customer identity", "Order heading", "Availability", "Freshness"];
    const commonFacts = contextNames.every((name) => {
      const values = [support, handoff, sales].map((frame) => namedText(frame, name));
      return values[0] !== null && values.every((value) => value === values[0]);
    });
    const threadContent = [support, handoff, sales].map((frame) => {
      const matches = frame.findAll((n) => n.type === "FRAME" && n.name === "Message Thread");
      return matches.length === 1 ? matches[0].findAll((n) => n.type === "TEXT").map((n) => n.characters).join("|") : null;
    });
    const commonConversation = threadContent[0] !== null && threadContent.every((value) => value === threadContent[0]);
    record(
      "Context preserved",
      commonFacts && commonConversation && handoffText.includes("verified customer and order context carried forward") && handoffText.includes("remaining: sales reviews current facts"),
      "Customer/Order/Inventory context, reason, or remaining work was lost at handoff."
    );
    record(
      "Handoff \u2260 Permission Transfer",
      handoffText.includes("permissions do not transfer") && !/handoff grants? (?:new |sales |support )?permissions?|permissions? (?:are |is )?transferred by handoff|inherits? (?:support|sales) permissions?/i.test(handoffText),
      "Handoff incorrectly implies permission transfer or automatic grant."
    );
    record(
      "Sales current handler",
      namedText(sales, "Handler name") === "Sales Agent" && salesText.includes("sales agent active") && salesText.includes("sales owns the current case"),
      "Sales Active must identify Sales as final current handler."
    );
    record(
      "Authorization independently enforced",
      supportText.includes("does not perform sales writes") && salesText.includes("requires trusted authorization") && handoffText.includes("permissions do not transfer") && !/handoff grants? (?:new |sales |support )?permissions?|bypass(?:es)? (?:tool executor |backend )?authorization/i.test(
        section.children.filter((n) => n.type === "TEXT").map((n) => n.characters).join(" ")
      ),
      "Flow 4 claims implicit permission escalation or bypasses independent authorization."
    );
    const steps = [
      {
        key: "request",
        from: support,
        to: handoff,
        source: sources.get("Support Active"),
        item: FLOW4_BOARD.requestControl,
        sourceItem: FLOW4_BOARD.requestSource,
        label: "Support \u2192 Handoff navigation"
      },
      {
        key: "accept",
        from: handoff,
        to: sales,
        source: sources.get("Handoff"),
        item: FLOW4_BOARD.acceptControl,
        sourceItem: FLOW4_BOARD.acceptSource,
        label: "Handoff \u2192 Sales Active navigation"
      }
    ];
    const allowedAdded = /* @__PURE__ */ new Map();
    for (const step of steps) {
      const product = approvedHandoffControl(step.from, step.key);
      const approvedSource = approvedHandoffControl(step.source, step.key);
      const controls = section.children.filter((n) => n.name === step.item.name);
      const labels = section.children.filter((n) => n.name === step.sourceItem.name);
      let chosen = null;
      if (controls.length === 0 && labels.length === 1 && labels[0].type === "TEXT" && labels[0].characters === step.sourceItem.text && product && approvedSource && approvedSource.reactions.length === 0) {
        strategies[step.key] = "PRODUCT CONTROL";
        chosen = product;
        allowedAdded.set(step.from.name, product.id);
      } else if (controls.length === 1 && labels.length === 0) {
        strategies[step.key] = "PROTOTYPE CONTROL";
        chosen = externalControl3(section, step.item, step.from, step.to);
        record(`${step.label} external control`, Boolean(chosen), `${step.label}: visible external control missing or misplaced.`);
      }
      if (!chosen) record(step.label, false, `${step.label}: progression is missing or semantically ambiguous.`);
      else {
        const error = await reactionError2(chosen, step.to.id);
        record(step.label, !error, error ?? void 0);
        if (error) broken++;
      }
    }
    for (const key of KEYS4) {
      const source = sources.get(key);
      const clone = clones.get(key);
      record(
        `${key} source reactions`,
        Boolean(source) && sourceReactionsPreserved2(source, clone, allowedAdded.get(clone.name)),
        `${key}: inherited reactions changed or Phase 3E progression was attached to unrelated product UI.`
      );
    }
    let destinationsValid = true;
    for (const clone of clones.values()) for (const node of reactionNodes4(clone)) for (const reaction of node.reactions) {
      for (const action of [...reaction.actions ?? [], ...reaction.action ? [reaction.action] : []]) {
        if (action.type === "NODE" && (!action.destinationId || !await figma.getNodeByIdAsync(action.destinationId))) {
          destinationsValid = false;
          broken++;
        }
      }
    }
    record("Broken destinations", destinationsValid, "Flow 4 contains a broken reaction destination.");
    record(
      "Explicit END",
      section.children.some((n) => n.name === FLOW4_BOARD.end.name && n.type === "TEXT" && n.characters.includes("Sales Active is the final scenario state.")),
      "END does not explicitly identify Sales Active as the final state."
    );
    return { issues, broken, checks, strategies };
  }

  // src/support-sales-handoff.ts
  var CANONICAL4 = flowSectionName(4);
  var STAGING4 = `${CANONICAL4} / staging`;
  var PREVIOUS4 = `${CANONICAL4} / previous`;
  var ARCHIVE4 = "ARCHIVE \u2014 Flow 4 \u2014 previous prototype with manual or ambiguous content";
  var KEYS5 = ["Support Active", "Handoff", "Sales Active"];
  function prototypeControl4(page, section, font, item, x, y) {
    assertTarget(page);
    const control3 = figma.createFrame();
    control3.name = item.name;
    section.appendChild(control3);
    control3.resize(330, 104);
    control3.x = x;
    control3.y = y;
    control3.cornerRadius = 8;
    control3.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
    control3.strokes = [{ type: "SOLID", color: { r: 0.52, g: 0.52, b: 0.52 } }];
    control3.strokeWeight = 1;
    const label4 = (name, value, top, size) => {
      assertTarget(page);
      const text = figma.createText();
      text.name = name;
      control3.appendChild(text);
      text.fontName = font;
      text.fontSize = size;
      text.textAutoResize = "HEIGHT";
      text.resize(302, 24);
      text.characters = value;
      text.fills = [{ type: "SOLID", color: { r: 0.24, g: 0.24, b: 0.24 } }];
      text.x = 14;
      text.y = top;
    };
    label4("Prototype-only marker", item.marker, 11, 11);
    label4("Continue scenario label", item.text, 38, 15);
    return control3;
  }
  async function buildSupportSalesHandoff(page, sources, font) {
    assertTarget(page);
    const oldMatches = page.children.filter((n) => n.name === CANONICAL4);
    if (oldMatches.length > 1 || oldMatches.length === 1 && oldMatches[0].type !== "SECTION")
      throw new Error("Flow 4 canonical section is duplicate or wrong type. Nothing was changed.");
    if (page.children.some((n) => n.name === STAGING4 || n.name === PREVIOUS4))
      throw new Error("Existing Flow 4 staging/previous section requires manual review. Nothing was changed.");
    const old = oldMatches[0];
    const oldY = old?.y;
    const initialY = old?.y ?? Math.max(9200, ...page.children.filter((n) => n.type === "SECTION" && n.name !== "09 \u2014 Prototype Validation").map((n) => n.y + n.height + 180));
    const prior = old ? await checkFlowFour(old, sources) : null;
    const archive = Boolean(old && prior?.issues.length);
    if (archive && page.children.some((n) => n.name === ARCHIVE4)) throw new Error("Flow 4 archive name already exists. Nothing was changed.");
    let staging;
    let committed = false;
    try {
      assertTarget(page);
      staging = figma.createSection();
      staging.name = STAGING4;
      staging.x = old?.x ?? 0;
      staging.y = initialY;
      staging.resize(6400, 1900);
      const clones = /* @__PURE__ */ new Map();
      for (const key of KEYS5) {
        assertTarget(page);
        const clone = sources.get(key).clone();
        clone.name = cloneName(4, key);
        staging.appendChild(clone);
        clones.set(key, clone);
        if (visualSignature(clone) !== visualSignature(sources.get(key))) throw new Error(`Fresh 03D clone visual mismatch: ${key}.`);
      }
      let cursor = 50;
      for (const key of KEYS5) {
        const clone = clones.get(key);
        clone.x = cursor;
        clone.y = 200;
        cursor += clone.width + 450;
      }
      const support = clones.get("Support Active");
      const handoff = clones.get("Handoff");
      const sales = clones.get("Sales Active");
      const add = (item, x, y, width = 1600) => {
        annotation(page, staging, item.name, item.text, x, y, width, font);
      };
      add(FLOW4_BOARD.start, support.x, 5);
      add(FLOW4_BOARD.step1, support.x, 40);
      add(FLOW4_BOARD.supportNote, support.x, 75);
      add(FLOW4_BOARD.step2, handoff.x, 40);
      add(FLOW4_BOARD.handlerBoundary, handoff.x, 75);
      add(FLOW4_BOARD.contextNote, handoff.x, 110);
      add(FLOW4_BOARD.permissionBoundary, handoff.x, 145);
      add(FLOW4_BOARD.step3, sales.x, 40);
      add(FLOW4_BOARD.salesNote, sales.x, 75);
      add(FLOW4_BOARD.authorizationNote, sales.x, 110);
      const below = Math.max(...Array.from(clones.values(), (n) => n.y + n.height)) + 40;
      add(FLOW4_BOARD.end, sales.x, below);
      const attach = async (from, source, to, step, sourceNote, controlItem) => {
        const approved = approvedHandoffControl(source, step);
        const copy = approvedHandoffControl(from, step);
        if (approved && approved.reactions.length === 0 && copy && copy.reactions.length === 0) {
          add(sourceNote, from.x, below);
          await copy.setReactionsAsync([navigateReaction(to.id)]);
          return "PRODUCT CONTROL";
        }
        const control3 = prototypeControl4(
          page,
          staging,
          font,
          controlItem,
          from.x + from.width + 55,
          from.y + 280
        );
        await control3.setReactionsAsync([navigateReaction(to.id)]);
        return "PROTOTYPE CONTROL";
      };
      const request = await attach(
        support,
        sources.get("Support Active"),
        handoff,
        "request",
        FLOW4_BOARD.requestSource,
        FLOW4_BOARD.requestControl
      );
      const accept = await attach(
        handoff,
        sources.get("Handoff"),
        sales,
        "accept",
        FLOW4_BOARD.acceptSource,
        FLOW4_BOARD.acceptControl
      );
      const maxX = Math.max(...staging.children.map((n) => "width" in n ? n.x + n.width : 0));
      const maxY = Math.max(...staging.children.map((n) => "height" in n ? n.y + n.height : 0));
      staging.resize(Math.max(6400, maxX + 80), Math.max(1900, maxY + 80));
      const preflight = await checkFlowFour(staging, sources);
      if (preflight.issues.length) throw new Error(`Flow 4 staging validation failed: ${preflight.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        old.name = PREVIOUS4;
      }
      assertTarget(page);
      staging.name = CANONICAL4;
      const finalCheck = await checkFlowFour(staging, sources);
      if (finalCheck.issues.length || page.children.filter((n) => n.name === CANONICAL4).length !== 1)
        throw new Error(`Flow 4 canonical validation failed: ${finalCheck.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        if (archive) {
          old.name = ARCHIVE4;
          old.y = staging.y + staging.height + 220;
        } else old.remove();
      }
      committed = true;
      return `Built ${CANONICAL4}: three fresh 03D clones; Support \u2192 Handoff: ${request}; Handoff \u2192 Sales: ${accept}; old section ${archive ? "archived" : old ? "removed after validation" : "not present"}.`;
    } catch (error) {
      if (!committed) {
        if (old && !old.removed && (old.name === PREVIOUS4 || old.name === ARCHIVE4)) {
          assertTarget(page);
          old.name = CANONICAL4;
          if (oldY !== void 0) old.y = oldY;
        }
        if (staging && !staging.removed) {
          assertTarget(page);
          staging.remove();
        }
      }
      throw error;
    }
  }

  // src/flow5-validation.ts
  var KEYS6 = ["Conversation OUTCOME_UNKNOWN", "Escalation Reconciliation"];
  var ANNOTATIONS3 = [
    FLOW5_BOARD.start,
    FLOW5_BOARD.step1,
    FLOW5_BOARD.uncertain,
    FLOW5_BOARD.unknownBoundary,
    FLOW5_BOARD.noBlindRetry,
    FLOW5_BOARD.reconcileFirst,
    FLOW5_BOARD.step2,
    FLOW5_BOARD.reconciliation,
    FLOW5_BOARD.knownBoundary,
    FLOW5_BOARD.e02Boundary,
    FLOW5_BOARD.m12Boundary,
    FLOW5_BOARD.end
  ];
  var HIERARCHY = [
    "Why Automation Stopped",
    "Confirmed Facts",
    "Uncertain Effect",
    "Constraints",
    "Next Safe Step",
    "Human Decision"
  ];
  function reactionNodes5(frame) {
    return [frame, ...frame.findAll((n) => "reactions" in n)];
  }
  function allText(node) {
    return [node.type === "TEXT" ? node.characters : "", ..."findAll" in node ? node.findAll((n) => n.type === "TEXT").map((n) => n.characters) : []].join(" ").toLowerCase();
  }
  function uniqueDescendant(frame, name) {
    const matches = frame.findAll((n) => n.name === name);
    return matches.length === 1 ? matches[0] : null;
  }
  function visibleEscalationLink(frame) {
    const matches = frame.findAll((n) => n.name === "Escalation link" && n.type === "TEXT");
    if (matches.length !== 1 || !/^open\s+escalation\b/i.test(matches[0].characters.trim()) || typeof matches[0].setReactionsAsync !== "function") return null;
    let current = matches[0];
    while (current) {
      if ("visible" in current && !current.visible) return null;
      if ("opacity" in current && current.opacity <= 0) return null;
      if (current.id === frame.id) break;
      current = current.parent;
    }
    return matches[0];
  }
  function sourceReactionsPreserved3(source, clone, added) {
    const originals = reactionNodes5(source);
    const copies = reactionNodes5(clone);
    if (originals.length !== copies.length) return false;
    const idMap = new Map(originals.map((node, index) => [node.id, copies[index].id]));
    for (let i = 0; i < originals.length; i++) {
      const expected = JSON.parse(JSON.stringify(originals[i].reactions));
      for (const reaction of expected) {
        for (const action of reaction.actions ?? []) if (action.type === "NODE" && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId);
        if (reaction.action?.type === "NODE" && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId);
      }
      if (copies[i].id === added && expected.length === 0 && copies[i].reactions.length === 1) continue;
      if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
    }
    return true;
  }
  async function reactionError3(node, destinationId) {
    if (node.reactions.length !== 1) return `expected one Open Escalation reaction, found ${node.reactions.length}`;
    const reaction = node.reactions[0];
    if (reaction.trigger?.type !== "ON_CLICK") return "Open Escalation trigger must be ON_CLICK";
    if (reaction.actions !== void 0 && reaction.actions.length !== 1) return "Open Escalation must have exactly one action";
    const actions = reaction.actions === void 0 ? reaction.action ? [reaction.action] : [] : reaction.actions;
    if (actions.length !== 1) return "Open Escalation NODE action missing";
    for (const action of [...actions, ...reaction.action && reaction.actions !== void 0 ? [reaction.action] : []]) {
      if (action.type !== "NODE" || action.navigation !== "NAVIGATE") return "Open Escalation must use NODE/NAVIGATE";
      if (action.destinationId !== destinationId) return `Open Escalation destination must be fresh Escalation Reconciliation ${destinationId}`;
      if (action.transition != null) return "Open Escalation animation is forbidden";
    }
    if (!await figma.getNodeByIdAsync(destinationId)) return "Open Escalation destination is broken";
    return null;
  }
  function externalControl4(section, from, to) {
    const matches = section.children.filter((n) => n.name === FLOW5_BOARD.escalationControl.name);
    if (matches.length !== 1 || matches[0].type !== "FRAME") return null;
    const control3 = matches[0];
    if (!control3.visible || control3.opacity <= 0 || control3.width < 250 || control3.height < 70 || control3.x < from.x + from.width || control3.x + control3.width > to.x || control3.children.length !== 2 || control3.children.filter((n) => n.name === "Prototype-only marker" && n.type === "TEXT" && n.characters === FLOW5_BOARD.escalationControl.marker).length !== 1 || control3.children.filter((n) => n.name === "Continue scenario label" && n.type === "TEXT" && n.characters === FLOW5_BOARD.escalationControl.text).length !== 1 || control3.fills === figma.mixed || !control3.fills.some((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0)) return null;
    return control3;
  }
  async function checkFlowFive(section, sources) {
    const issues = [];
    const checks = [];
    let broken = 0;
    const record = (name, ok, detail = name) => {
      checks.push({ name, passed: ok });
      if (!ok) issues.push(detail);
    };
    const allowed = /* @__PURE__ */ new Set([
      ...KEYS6.map((key) => cloneName(5, key)),
      ...ANNOTATIONS3.map((a) => a.name),
      FLOW5_BOARD.escalationSource.name,
      FLOW5_BOARD.escalationControl.name
    ]);
    record("Generated-node ownership", section.children.every((n) => allowed.has(n.name)), "Unexpected node inside generated Flow 5 section.");
    const clones = /* @__PURE__ */ new Map();
    for (const key of KEYS6) {
      const exact = section.children.filter((n) => n.name === cloneName(5, key));
      if (exact.length === 1 && exact[0].type === "FRAME") clones.set(key, exact[0]);
      record(
        `${key} source`,
        exact.length === 1 && exact[0].type === "FRAME" && Boolean(sources.get(key)) && visualSignature(exact[0]) === visualSignature(sources.get(key)),
        `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`
      );
    }
    for (const item of ANNOTATIONS3) {
      const exact = section.children.filter((n) => n.name === item.name);
      record(
        item.name,
        exact.length === 1 && exact[0].type === "TEXT" && exact[0].characters.trim() === item.text.trim(),
        `Missing/wrong external annotation: ${item.name}`
      );
    }
    const conversation = clones.get("Conversation OUTCOME_UNKNOWN");
    const escalation = clones.get("Escalation Reconciliation");
    if (!conversation || !escalation) return { issues, broken, checks, strategy: null };
    record(
      "Left-to-right reconciliation path",
      conversation.x + conversation.width < escalation.x,
      "Conversation OUTCOME_UNKNOWN must precede Escalation Reconciliation."
    );
    const result = uniqueDescendant(conversation, "Business Action Result");
    const resultText = result ? allText(result) : "";
    const resultState = result && "findAll" in result ? result.findAll((n) => n.type === "TEXT" && n.name === "Result state") : [];
    record(
      "Uncertain business effect",
      resultState.length === 1 && resultState[0].characters.trim() === "OUTCOME_UNKNOWN" && resultText.includes("reservation may have committed") && resultText.includes("confirmation unavailable") && !/reservation (?:failed|confirmed)\b/i.test(resultText),
      "Conversation must show an uncertain effect, not Known Failure, success, or timeout-only meaning."
    );
    record("OUTCOME_UNKNOWN \u2260 Known Failure", resultText.includes("outcome_unknown") && !resultText.includes("known failure"), "Conversation result incorrectly collapses OUTCOME_UNKNOWN into Known Failure.");
    record("No blind retry", resultText.includes("do not retry mutation blindly") && resultText.includes("required before any mutation retry"), "Conversation lacks no-blind-retry protection.");
    record("Reconcile before mutation", resultText.includes("reconcile authoritative reservation state") && resultText.includes("required before any mutation retry"), "Conversation lacks reconciliation-before-mutation semantics.");
    record(
      "E02 \u2260 OUTCOME_UNKNOWN",
      resultState.length === 1 && resultState[0].characters.trim() !== "E02 Restricted" && section.children.some((n) => n.name === FLOW5_BOARD.e02Boundary.name && n.type === "TEXT" && n.characters === FLOW5_BOARD.e02Boundary.text),
      "E02 policy restriction was confused with uncertain business effect."
    );
    const contexts = escalation.findAll((n) => n.name === "Decision Context" && n.type === "FRAME");
    const context = contexts.length === 1 ? contexts[0] : null;
    const blocks = context ? HIERARCHY.map((name) => context.children.filter((n) => n.name === name)) : [];
    const hierarchy = Boolean(context && blocks.every((group) => group.length === 1 && (group[0].type === "FRAME" || group[0].type === "INSTANCE")) && blocks.every((group, i) => i === 0 || group[0].y > blocks[i - 1][0].y));
    record(
      "Decision Context hierarchy",
      hierarchy,
      "Decision Context must retain Why \u2192 Confirmed \u2192 Uncertain \u2192 Constraints \u2192 Next Safe Step \u2192 Human Decision in order."
    );
    const confirmed = hierarchy ? allText(blocks[1][0]) : "";
    const uncertain = hierarchy ? allText(blocks[2][0]) : "";
    const constraints = hierarchy ? allText(blocks[3][0]) : "";
    const next = hierarchy ? allText(blocks[4][0]) : "";
    const human = hierarchy ? allText(blocks[5][0]) : "";
    record(
      "Confirmed Facts \u2260 Uncertain Effect",
      confirmed.includes("order ord-1042 exists") && confirmed.includes("create_order") && confirmed.includes("confirmed") && !confirmed.includes("reservation confirmed") && uncertain.includes("outcome_unknown") && uncertain.includes("may have committed") && uncertain.includes("confirmation unavailable"),
      "Confirmed Order facts and uncertain reservation effect are not independently represented."
    );
    record(
      "Reconciliation Required",
      uncertain.includes("reconciliation required") && next.includes("reconcile authoritative reservation state") && constraints.includes("do not retry reserve_inventory"),
      "Escalation lacks authoritative-state reconciliation before any retry."
    );
    record(
      "Human review / safe next step",
      human.includes("human decision") && human.includes("request reconciliation") && human.includes("retry remain unavailable"),
      "Human review or safe next-step boundary is missing."
    );
    const contextText = context ? allText(context) : "";
    record(
      "Context preserved",
      contextText.includes("conversation c-42") && contextText.includes("order ord-1042") && contextText.includes("agent run") && allText(escalation).includes("human operator") && confirmed.includes("customer amina s. verified"),
      "Escalation lost Conversation, Order, Agent Run, human owner, or verified facts."
    );
    const allContent = section.children.filter((n) => n.type === "TEXT").map((n) => n.characters).join(" ") + " " + allText(conversation) + " " + allText(escalation);
    record(
      "No automatic replay",
      !/(?:reconciliation|human review|human decision)\s+(?:automatically|immediately)\s+(?:retries|replays|resumes)|(?:retry|replay)\s+(?:reserve_inventory|create_order|update_order|mutation)\s+automatically/i.test(allContent),
      "Flow 5 implies automatic mutation retry or replay after reconciliation."
    );
    record(
      "M12 kept outside Flow 5",
      !/resume pending|target m12/i.test(allText(conversation) + " " + allText(escalation)) && section.children.some((n) => n.name === FLOW5_BOARD.m12Boundary.name && n.type === "TEXT" && n.characters === FLOW5_BOARD.m12Boundary.text),
      "Flow 5 enters Resume Pending / TARGET M12 or lacks its explicit boundary."
    );
    const sourceLink = sources.get("Conversation OUTCOME_UNKNOWN") && visibleEscalationLink(sources.get("Conversation OUTCOME_UNKNOWN"));
    const productLink = visibleEscalationLink(conversation);
    const externalMatches = section.children.filter((n) => n.name === FLOW5_BOARD.escalationControl.name);
    const productLabels = section.children.filter((n) => n.name === FLOW5_BOARD.escalationSource.name);
    let strategy = null;
    if (externalMatches.length === 0 && productLabels.length === 1 && productLabels[0].type === "TEXT" && productLabels[0].characters === FLOW5_BOARD.escalationSource.text && sourceLink && sourceLink.reactions.length === 0 && productLink) {
      strategy = "PRODUCT CONTROL";
      const error = await reactionError3(productLink, escalation.id);
      record("Open Escalation navigation", !error, error ?? void 0);
      if (error) broken++;
    } else if (externalMatches.length === 1 && productLabels.length === 0) {
      strategy = "PROTOTYPE CONTROL";
      const control3 = externalControl4(section, conversation, escalation);
      record("External Open Escalation control", Boolean(control3), "Visible external escalation control missing or misplaced.");
      if (control3) {
        const error = await reactionError3(control3, escalation.id);
        record("Open Escalation navigation", !error, error ?? void 0);
        if (error) broken++;
      }
    } else record("Open Escalation navigation", false, "Open Escalation progression is missing, duplicate, or ambiguous.");
    for (const key of KEYS6) {
      const source = sources.get(key);
      const clone = clones.get(key);
      const exception = key === "Conversation OUTCOME_UNKNOWN" && strategy === "PRODUCT CONTROL" ? productLink?.id : void 0;
      record(
        `${key} source reactions`,
        Boolean(source) && sourceReactionsPreserved3(source, clone, exception),
        `${key}: source reactions changed or unauthorized Phase 3E progression attached to product UI.`
      );
    }
    let destinationsValid = true;
    const forbidden = /Processing|Confirmed Result|Reservation Confirmed|Known Failure|E02 Restricted|Resume Pending|TARGET M12|Retry Mutation|Retry Reservation|Reserve Again|create_order again|reserve_inventory again|update_order again/i;
    for (const clone of clones.values()) for (const node of reactionNodes5(clone)) for (const reaction of node.reactions) {
      for (const action of [...reaction.actions ?? [], ...reaction.action ? [reaction.action] : []]) {
        if (action.type !== "NODE") continue;
        const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
        if (!dest || forbidden.test(dest.name)) {
          destinationsValid = false;
          broken++;
        }
      }
    }
    record(
      "Broken / prohibited destinations",
      destinationsValid,
      "Flow 5 contains a broken or prohibited Processing, Confirmed, retry, Known Failure, E02, or Resume destination."
    );
    record(
      "Explicit END",
      section.children.some((n) => n.name === FLOW5_BOARD.end.name && n.type === "TEXT" && n.characters.includes("Reconciliation / human review is the final scenario state.")),
      "END does not explicitly identify reconciliation / human review as the endpoint."
    );
    return { issues, broken, checks, strategy };
  }

  // src/unknown-escalation.ts
  var CANONICAL5 = flowSectionName(5);
  var STAGING5 = `${CANONICAL5} / staging`;
  var PREVIOUS5 = `${CANONICAL5} / previous`;
  var ARCHIVE5 = "ARCHIVE \u2014 Flow 5 \u2014 previous prototype with manual or ambiguous content";
  function prototypeControl5(page, section, font, x, y) {
    assertTarget(page);
    const control3 = figma.createFrame();
    control3.name = FLOW5_BOARD.escalationControl.name;
    section.appendChild(control3);
    control3.resize(330, 104);
    control3.x = x;
    control3.y = y;
    control3.cornerRadius = 8;
    control3.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
    control3.strokes = [{ type: "SOLID", color: { r: 0.52, g: 0.52, b: 0.52 } }];
    control3.strokeWeight = 1;
    const label4 = (name, value, top, size) => {
      assertTarget(page);
      const text = figma.createText();
      text.name = name;
      control3.appendChild(text);
      text.fontName = font;
      text.fontSize = size;
      text.textAutoResize = "HEIGHT";
      text.resize(302, 24);
      text.characters = value;
      text.fills = [{ type: "SOLID", color: { r: 0.24, g: 0.24, b: 0.24 } }];
      text.x = 14;
      text.y = top;
    };
    label4("Prototype-only marker", FLOW5_BOARD.escalationControl.marker, 11, 11);
    label4("Continue scenario label", FLOW5_BOARD.escalationControl.text, 38, 15);
    return control3;
  }
  async function buildUnknownEscalation(page, sources, font) {
    assertTarget(page);
    const oldMatches = page.children.filter((n) => n.name === CANONICAL5);
    if (oldMatches.length > 1 || oldMatches.length === 1 && oldMatches[0].type !== "SECTION")
      throw new Error("Flow 5 canonical section is duplicate or wrong type. Nothing was changed.");
    if (page.children.some((n) => n.name === STAGING5 || n.name === PREVIOUS5))
      throw new Error("Existing Flow 5 staging/previous section requires manual review. Nothing was changed.");
    const old = oldMatches[0];
    const oldY = old?.y;
    const initialY = old?.y ?? Math.max(11600, ...page.children.filter((n) => n.type === "SECTION" && n.name !== "09 \u2014 Prototype Validation").map((n) => n.y + n.height + 180));
    const prior = old ? await checkFlowFive(old, sources) : null;
    const archive = Boolean(old && prior?.issues.length);
    if (archive && page.children.some((n) => n.name === ARCHIVE5)) throw new Error("Flow 5 archive name already exists. Nothing was changed.");
    let staging;
    let committed = false;
    try {
      assertTarget(page);
      staging = figma.createSection();
      staging.name = STAGING5;
      staging.x = old?.x ?? 0;
      staging.y = initialY;
      staging.resize(4400, 2100);
      const conversation = sources.get("Conversation OUTCOME_UNKNOWN").clone();
      conversation.name = cloneName(5, "Conversation OUTCOME_UNKNOWN");
      staging.appendChild(conversation);
      conversation.x = 50;
      conversation.y = 340;
      const escalation = sources.get("Escalation Reconciliation").clone();
      escalation.name = cloneName(5, "Escalation Reconciliation");
      staging.appendChild(escalation);
      escalation.x = conversation.x + conversation.width + 450;
      escalation.y = 340;
      if (visualSignature(conversation) !== visualSignature(sources.get("Conversation OUTCOME_UNKNOWN")) || visualSignature(escalation) !== visualSignature(sources.get("Escalation Reconciliation")))
        throw new Error("Fresh 03D OUTCOME_UNKNOWN clone visual mismatch.");
      const add = (item, x, y, width = 1600) => {
        annotation(page, staging, item.name, item.text, x, y, width, font);
      };
      add(FLOW5_BOARD.start, conversation.x, 5);
      add(FLOW5_BOARD.step1, conversation.x, 40);
      add(FLOW5_BOARD.uncertain, conversation.x, 75);
      add(FLOW5_BOARD.unknownBoundary, conversation.x, 130);
      add(FLOW5_BOARD.noBlindRetry, conversation.x, 185);
      add(FLOW5_BOARD.reconcileFirst, conversation.x, 220);
      add(FLOW5_BOARD.step2, escalation.x, 40, escalation.width);
      add(FLOW5_BOARD.reconciliation, escalation.x, 75, escalation.width);
      add(FLOW5_BOARD.knownBoundary, escalation.x, 150, escalation.width);
      add(FLOW5_BOARD.e02Boundary, escalation.x, 205, escalation.width);
      add(FLOW5_BOARD.m12Boundary, escalation.x, 260, escalation.width);
      const below = Math.max(conversation.y + conversation.height, escalation.y + escalation.height) + 40;
      add(FLOW5_BOARD.end, escalation.x, below, escalation.width);
      const sourceLink = visibleEscalationLink(sources.get("Conversation OUTCOME_UNKNOWN"));
      const clonedLink = visibleEscalationLink(conversation);
      if (sourceLink && sourceLink.reactions.length === 0 && clonedLink && clonedLink.reactions.length === 0) {
        add(FLOW5_BOARD.escalationSource, conversation.x, below);
        await clonedLink.setReactionsAsync([navigateReaction(escalation.id)]);
      } else {
        const control3 = prototypeControl5(
          page,
          staging,
          font,
          conversation.x + conversation.width + 55,
          conversation.y + 280
        );
        await control3.setReactionsAsync([navigateReaction(escalation.id)]);
      }
      const maxX = Math.max(...staging.children.map((n) => "width" in n ? n.x + n.width : 0));
      const maxY = Math.max(...staging.children.map((n) => "height" in n ? n.y + n.height : 0));
      staging.resize(Math.max(4400, maxX + 80), Math.max(2100, maxY + 80));
      const preflight = await checkFlowFive(staging, sources);
      if (preflight.issues.length) throw new Error(`Flow 5 staging validation failed: ${preflight.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        old.name = PREVIOUS5;
      }
      assertTarget(page);
      staging.name = CANONICAL5;
      const finalCheck = await checkFlowFive(staging, sources);
      if (finalCheck.issues.length || page.children.filter((n) => n.name === CANONICAL5).length !== 1)
        throw new Error(`Flow 5 canonical validation failed: ${finalCheck.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        if (archive) {
          old.name = ARCHIVE5;
          old.y = staging.y + staging.height + 220;
        } else old.remove();
      }
      committed = true;
      return `Built ${CANONICAL5}: two fresh 03D clones; Open Escalation \u2192 Reconciliation: ${preflight.strategy}; old section ${archive ? "archived" : old ? "removed after validation" : "not present"}.`;
    } catch (error) {
      if (!committed) {
        if (old && !old.removed && (old.name === PREVIOUS5 || old.name === ARCHIVE5)) {
          assertTarget(page);
          old.name = CANONICAL5;
          if (oldY !== void 0) old.y = oldY;
        }
        if (staging && !staging.removed) {
          assertTarget(page);
          staging.remove();
        }
      }
      throw error;
    }
  }

  // src/flow6-validation.ts
  var KEYS7 = ["Awaiting Decision", "Resume Pending"];
  var TOP_NOTES = [
    FLOW6_BOARD.start,
    FLOW6_BOARD.step1,
    FLOW6_BOARD.hierarchyNote,
    FLOW6_BOARD.decisionBoundary,
    FLOW6_BOARD.step3,
    FLOW6_BOARD.targetNote,
    FLOW6_BOARD.currentTarget,
    FLOW6_BOARD.end
  ];
  var GATE_NOTES = [
    FLOW6_BOARD.step2,
    FLOW6_BOARD.principal,
    FLOW6_BOARD.scope,
    FLOW6_BOARD.authorization,
    FLOW6_BOARD.state,
    FLOW6_BOARD.revision,
    FLOW6_BOARD.replayBoundary,
    FLOW6_BOARD.unknownBoundary,
    FLOW6_BOARD.e02Boundary
  ];
  var GATE_LABELS = [
    "STEP 2 revalidation",
    "Principal revalidation",
    "Business scope revalidation",
    "Authorization revalidation",
    "Business-state revalidation",
    "Revision/stale revalidation",
    "Revalidation / Replay boundary",
    "OUTCOME_UNKNOWN boundary",
    "E02 safety boundary"
  ];
  var HIERARCHY2 = [
    "Why Automation Stopped",
    "Confirmed Facts",
    "Uncertain Effect",
    "Constraints",
    "Next Safe Step",
    "Human Decision"
  ];
  function reactionNodes6(frame) {
    return [frame, ...frame.findAll((n) => "reactions" in n)];
  }
  function allText2(node) {
    return [node.type === "TEXT" ? node.characters : "", ..."findAll" in node ? node.findAll((n) => n.type === "TEXT").map((n) => n.characters) : []].join(" ").toLowerCase();
  }
  function approvedDecisionControl(frame) {
    const matches = frame.findAll((n) => n.type === "FRAME" && (n.name === "Primary decision" || n.name === "Primary decision / focus") && n.findAll((child) => child.type === "TEXT").some((child) => /approve proposed continuation/i.test(child.characters)) && typeof n.setReactionsAsync === "function");
    const usable = matches.filter((node) => {
      let current = node;
      while (current) {
        if ("visible" in current && !current.visible) return false;
        if ("opacity" in current && current.opacity <= 0) return false;
        if (current !== node && current.type === "INSTANCE") return false;
        if (current.id === frame.id) break;
        current = current.parent;
      }
      return true;
    });
    return usable.length === 1 ? usable[0] : null;
  }
  function sourceReactionsPreserved4(source, clone, added) {
    const originals = reactionNodes6(source);
    const copies = reactionNodes6(clone);
    if (originals.length !== copies.length) return false;
    const idMap = new Map(originals.map((node, index) => [node.id, copies[index].id]));
    for (let i = 0; i < originals.length; i++) {
      const expected = JSON.parse(JSON.stringify(originals[i].reactions));
      for (const reaction of expected) {
        for (const action of reaction.actions ?? []) if (action.type === "NODE" && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId);
        if (reaction.action?.type === "NODE" && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId);
      }
      if (copies[i].id === added && expected.length === 0 && copies[i].reactions.length === 1) continue;
      if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
    }
    return true;
  }
  async function reactionError4(node, destinationId) {
    if (node.reactions.length !== 1) return `expected one progression reaction, found ${node.reactions.length}`;
    const reaction = node.reactions[0];
    if (reaction.trigger?.type !== "ON_CLICK") return "Progression trigger must be ON_CLICK";
    if (reaction.actions !== void 0 && reaction.actions.length !== 1) return "Progression must have exactly one action";
    const actions = reaction.actions === void 0 ? reaction.action ? [reaction.action] : [] : reaction.actions;
    if (actions.length !== 1) return "Progression NODE action missing";
    for (const action of [...actions, ...reaction.action && reaction.actions !== void 0 ? [reaction.action] : []]) {
      if (action.type !== "NODE" || action.navigation !== "NAVIGATE") return "Progression must use NODE/NAVIGATE";
      if (action.destinationId !== destinationId) return `Progression destination must be ${destinationId}`;
      if (action.transition != null) return "Animated progression is forbidden";
    }
    if (!await figma.getNodeByIdAsync(destinationId)) return "Progression destination is broken";
    return null;
  }
  function labeledControl(node, item) {
    if (!node || node.type !== "FRAME" || node.name !== item.name || !node.visible || node.opacity <= 0 || node.width < 250 || node.height < 70 || node.children.length !== 2 || node.children.filter((n) => n.name === "Prototype-only marker" && n.type === "TEXT" && n.characters === item.marker).length !== 1 || node.children.filter((n) => n.name === "Continue scenario label" && n.type === "TEXT" && n.characters === item.text).length !== 1 || node.fills === figma.mixed || !node.fills.some((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0)) return false;
    return true;
  }
  async function checkFlowSix(section, sources) {
    const issues = [];
    const checks = [];
    let broken = 0;
    const record = (name, ok, detail = name) => {
      checks.push({ name, passed: ok });
      if (!ok) issues.push(detail);
    };
    const allowed = /* @__PURE__ */ new Set([
      ...KEYS7.map((key) => cloneName(6, key)),
      ...TOP_NOTES.map((item) => item.name),
      FLOW6_BOARD.targetBanner.name,
      FLOW6_BOARD.decisionSource.name,
      FLOW6_BOARD.decisionControl.name,
      FLOW6_BOARD.gate.name
    ]);
    record("Generated-node ownership", section.children.every((n) => allowed.has(n.name)), "Unexpected node inside generated Flow 6 section.");
    const clones = /* @__PURE__ */ new Map();
    for (const key of KEYS7) {
      const exact = section.children.filter((n) => n.name === cloneName(6, key));
      if (exact.length === 1 && exact[0].type === "FRAME") clones.set(key, exact[0]);
      record(
        `${key} source`,
        exact.length === 1 && exact[0].type === "FRAME" && Boolean(sources.get(key)) && visualSignature(exact[0]) === visualSignature(sources.get(key)),
        `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`
      );
    }
    for (const item of TOP_NOTES) {
      const exact = section.children.filter((n) => n.name === item.name);
      record(
        item.name,
        exact.length === 1 && exact[0].type === "TEXT" && exact[0].characters.trim() === item.text.trim(),
        `Missing/wrong external annotation: ${item.name}`
      );
    }
    const bannerNodes = section.children.filter((n) => n.name === FLOW6_BOARD.targetBanner.name);
    const banner2 = bannerNodes.length === 1 && bannerNodes[0].type === "FRAME" ? bannerNodes[0] : null;
    record(
      "TARGET M12 explicit",
      Boolean(banner2 && banner2.visible && banner2.opacity > 0 && banner2.width >= 1200 && banner2.height >= 60 && banner2.fills !== figma.mixed && banner2.fills.some((p) => p.type === "SOLID" && p.visible !== false) && banner2.children.filter((n) => n.type === "TEXT" && n.characters === FLOW6_BOARD.targetBanner.text && typeof n.fontSize === "number" && n.fontSize >= 24).length === 1),
      "Large visible TARGET M12 / not-current banner is missing."
    );
    const gateNodes = section.children.filter((n) => n.name === FLOW6_BOARD.gate.name);
    const gate = gateNodes.length === 1 && gateNodes[0].type === "FRAME" ? gateNodes[0] : null;
    record(
      "Revalidation required",
      Boolean(gate && gate.visible && gate.opacity > 0 && gate.width >= 680 && gate.height >= 700 && gate.fills !== figma.mixed && gate.fills.some((p) => p.type === "SOLID" && p.visible !== false) && gate.children.filter((n) => n.name === "Prototype-only marker" && n.type === "TEXT" && n.characters === FLOW6_BOARD.gate.marker).length === 1),
      "Visible external Revalidation Gate is missing or too small."
    );
    for (const [index, item] of GATE_NOTES.entries()) {
      const exact = gate?.children.filter((n) => n.name === item.name) ?? [];
      record(
        GATE_LABELS[index],
        exact.length === 1 && exact[0].type === "TEXT" && exact[0].characters.trim() === item.text.trim(),
        `Missing/wrong Revalidation Gate check: ${item.name}`
      );
    }
    const resumeMatches = gate?.children.filter((n) => n.name === FLOW6_BOARD.resumeControl.name) ?? [];
    const resumeControl = resumeMatches.length === 1 && labeledControl(resumeMatches[0], FLOW6_BOARD.resumeControl) ? resumeMatches[0] : null;
    record(
      "Controlled Resume request",
      Boolean(resumeControl && gate && resumeControl.y > Math.max(...GATE_NOTES.map((item) => {
        const note = gate.children.find((n) => n.name === item.name);
        return note && "height" in note ? note.y + note.height : 0;
      })) && resumeControl.y + resumeControl.height <= gate.height),
      "Controlled Resume request must be a visible prototype-only control after all revalidation checks."
    );
    const decision = clones.get("Awaiting Decision");
    const target = clones.get("Resume Pending");
    if (!decision || !target || !gate) return { issues, broken, checks, strategy: null };
    record(
      "Decision \u2192 Revalidation \u2192 Resume Pending sequence",
      decision.x + decision.width < gate.x && gate.x + gate.width < target.x && decision.y > (banner2?.y ?? -1),
      "Flow 6 must visibly place Revalidation Gate between Decision and Resume Pending."
    );
    const contexts = decision.findAll((n) => n.name === "Decision Context" && n.type === "FRAME");
    const context = contexts.length === 1 ? contexts[0] : null;
    const blocks = context ? HIERARCHY2.map((name) => context.children.filter((n) => n.name === name)) : [];
    const hierarchy = Boolean(context && blocks.every((group) => group.length === 1 && (group[0].type === "FRAME" || group[0].type === "INSTANCE")) && blocks.every((group, i) => i === 0 || group[0].y > blocks[i - 1][0].y));
    record(
      "Decision Context hierarchy",
      hierarchy,
      "Decision Context must retain Why \u2192 Confirmed \u2192 Uncertain \u2192 Constraints \u2192 Next Safe Step \u2192 Human Decision in order."
    );
    const decisionText = hierarchy ? allText2(blocks[5][0]) : "";
    record(
      "Human Decision \u2260 Mutation Execution",
      hierarchy && decisionText.includes("approve proposed continuation") && (decisionText.includes("current authorization required") || decisionText.includes("backend authorization")) && !/executed mutation|mutation executed|reservation confirmed/i.test(decisionText),
      "Human decision must record intent without executing or replaying a mutation."
    );
    const targetText = allText2(target);
    record(
      "CURRENT vs TARGET separation",
      targetText.includes("resume pending") && targetText.includes("target m12") && targetText.includes("not currently implemented") && section.children.some((n) => n.name === FLOW6_BOARD.currentTarget.name && n.type === "TEXT" && n.characters === FLOW6_BOARD.currentTarget.text),
      "TARGET M12 is incorrectly represented as a current capability."
    );
    record(
      "No confirmed business effect",
      targetText.includes("no new reservation or order effect is claimed") && targetText.includes("no mutation replay") && !targetText.includes("reservation confirmed"),
      "Resume Pending incorrectly claims mutation replay or a newly confirmed business effect."
    );
    record(
      "OUTCOME_UNKNOWN reconciliation prerequisite",
      gate.children.some((child) => child.name === FLOW6_BOARD.unknownBoundary.name && child.type === "TEXT" && child.characters === FLOW6_BOARD.unknownBoundary.text) && targetText.includes("any prior outcome_unknown must be reconciled"),
      "Unknown effect may reach controlled Resume without reconciliation."
    );
    record("E02 not bypassed", gate.children.some((n) => n.name === FLOW6_BOARD.e02Boundary.name && n.type === "TEXT" && n.characters === FLOW6_BOARD.e02Boundary.text), "Controlled Resume would bypass E02/domain policy.");
    const sourceAction = sources.get("Awaiting Decision") && approvedDecisionControl(sources.get("Awaiting Decision"));
    const productAction = approvedDecisionControl(decision);
    const externalMatches = section.children.filter((n) => n.name === FLOW6_BOARD.decisionControl.name);
    const sourceLabels = section.children.filter((n) => n.name === FLOW6_BOARD.decisionSource.name);
    let strategy = null;
    if (externalMatches.length === 0 && sourceLabels.length === 1 && sourceLabels[0].type === "TEXT" && sourceLabels[0].characters === FLOW6_BOARD.decisionSource.text && sourceAction && sourceAction.reactions.length === 0 && productAction) {
      strategy = "PRODUCT CONTROL";
      const error = await reactionError4(productAction, gate.id);
      record("Human decision progression", !error, error ?? void 0);
      if (error) broken++;
    } else if (externalMatches.length === 1 && sourceLabels.length === 0) {
      strategy = "PROTOTYPE CONTROL";
      const control3 = labeledControl(externalMatches[0], FLOW6_BOARD.decisionControl) ? externalMatches[0] : null;
      record("External human decision control", Boolean(control3 && control3.x >= decision.x + decision.width && control3.x + control3.width <= gate.x), "Visible external human decision control missing or misplaced.");
      if (control3) {
        const error = await reactionError4(control3, gate.id);
        record("Human decision progression", !error, error ?? void 0);
        if (error) broken++;
      }
    } else record("Human decision progression", false, "Decision progression is missing or attached to an ambiguous product node.");
    if (resumeControl) {
      const error = await reactionError4(resumeControl, target.id);
      record("Exact Resume Pending destination", !error, error ?? void 0);
      if (error) broken++;
    }
    for (const key of KEYS7) {
      const source = sources.get(key);
      const clone = clones.get(key);
      const exception = key === "Awaiting Decision" && strategy === "PRODUCT CONTROL" ? productAction?.id : void 0;
      record(
        `${key} source reactions`,
        Boolean(source) && sourceReactionsPreserved4(source, clone, exception),
        `${key}: source reactions changed or Phase 3E progression attached to unrelated product UI.`
      );
    }
    const boardText = section.children.filter((n) => n.type === "TEXT").map((n) => n.characters).join(" ") + " " + allText2(gate) + " " + allText2(decision) + " " + targetText;
    record(
      "No mutation replay",
      targetText.includes("no mutation replay") && gate.children.some((n) => n.name === FLOW6_BOARD.replayBoundary.name && n.type === "TEXT" && n.characters === FLOW6_BOARD.replayBoundary.text) && !/resume execution now|retry mutation now|run again|repeat mutation|revalidation automatically (?:retries|replays|resumes)/i.test(boardText),
      "Flow 6 implies direct execution or mutation replay."
    );
    let destinationsValid = true;
    const forbidden = /Processing|Confirmed Result|Reservation Confirmed|Retry Mutation|Repeat Mutation|create_order|update_order|reserve_inventory/i;
    for (const clone of clones.values()) for (const node of reactionNodes6(clone)) for (const reaction of node.reactions) {
      for (const action of [...reaction.actions ?? [], ...reaction.action ? [reaction.action] : []]) {
        if (action.type !== "NODE") continue;
        const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
        if (!dest || forbidden.test(dest.name) || clone === decision && dest.id === target.id) {
          destinationsValid = false;
          broken++;
        }
      }
    }
    record(
      "Broken / prohibited destinations",
      destinationsValid,
      "Decision or Resume Pending links directly to execution, confirmed effect, replay, or bypasses revalidation."
    );
    record(
      "Explicit END",
      section.children.some((n) => n.name === FLOW6_BOARD.end.name && n.type === "TEXT" && n.characters.includes("Resume Pending \u2014 TARGET M12 is the final prototype state.")),
      "END must identify Resume Pending \u2014 TARGET M12 with no mutation replay."
    );
    return { issues, broken, checks, strategy };
  }

  // src/human-resume-target.ts
  var CANONICAL6 = flowSectionName(6);
  var STAGING6 = `${CANONICAL6} / staging`;
  var PREVIOUS6 = `${CANONICAL6} / previous`;
  var ARCHIVE6 = "ARCHIVE \u2014 Flow 6 \u2014 previous prototype with manual or ambiguous content";
  function label(page, parent, name, value, x, y, width, size, font) {
    assertTarget(page);
    const text = figma.createText();
    text.name = name;
    parent.appendChild(text);
    text.fontName = font;
    text.fontSize = size;
    text.textAutoResize = "HEIGHT";
    text.resize(width, 24);
    text.characters = value;
    text.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    text.x = x;
    text.y = y;
    return text;
  }
  function control(page, parent, font, item, x, y, width = 330) {
    assertTarget(page);
    const node = figma.createFrame();
    node.name = item.name;
    parent.appendChild(node);
    node.resize(width, 104);
    node.x = x;
    node.y = y;
    node.cornerRadius = 8;
    node.fills = [{ type: "SOLID", color: { r: 0.94, g: 0.94, b: 0.94 } }];
    node.strokes = [{ type: "SOLID", color: { r: 0.44, g: 0.44, b: 0.44 } }];
    node.strokeWeight = 1;
    label(page, node, "Prototype-only marker", item.marker, 14, 12, width - 28, 11, font);
    label(page, node, "Continue scenario label", item.text, 14, 40, width - 28, 15, font);
    return node;
  }
  function targetBanner(page, section, font) {
    assertTarget(page);
    const banner2 = figma.createFrame();
    banner2.name = FLOW6_BOARD.targetBanner.name;
    section.appendChild(banner2);
    banner2.resize(1600, 72);
    banner2.x = 50;
    banner2.y = 40;
    banner2.cornerRadius = 8;
    banner2.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }];
    banner2.strokes = [{ type: "SOLID", color: { r: 0.28, g: 0.28, b: 0.28 } }];
    banner2.strokeWeight = 2;
    label(page, banner2, "TARGET M12 label", FLOW6_BOARD.targetBanner.text, 20, 19, 1550, 26, font);
    return banner2;
  }
  function revalidationGate(page, section, font, x, y) {
    assertTarget(page);
    const gate = figma.createFrame();
    gate.name = FLOW6_BOARD.gate.name;
    section.appendChild(gate);
    gate.resize(780, 790);
    gate.x = x;
    gate.y = y;
    gate.cornerRadius = 8;
    gate.fills = [{ type: "SOLID", color: { r: 0.94, g: 0.94, b: 0.94 } }];
    gate.strokes = [{ type: "SOLID", color: { r: 0.36, g: 0.36, b: 0.36 } }];
    gate.strokeWeight = 2;
    label(page, gate, "Prototype-only marker", FLOW6_BOARD.gate.marker, 22, 17, 730, 16, font);
    const rows = [
      { item: FLOW6_BOARD.step2, y: 60, size: 19 },
      { item: FLOW6_BOARD.principal, y: 112, size: 15 },
      { item: FLOW6_BOARD.scope, y: 160, size: 15 },
      { item: FLOW6_BOARD.authorization, y: 208, size: 15 },
      { item: FLOW6_BOARD.state, y: 268, size: 15 },
      { item: FLOW6_BOARD.revision, y: 316, size: 15 },
      { item: FLOW6_BOARD.replayBoundary, y: 376, size: 15 },
      { item: FLOW6_BOARD.unknownBoundary, y: 448, size: 15 },
      { item: FLOW6_BOARD.e02Boundary, y: 520, size: 15 }
    ];
    for (const row of rows) label(page, gate, row.item.name, row.item.text, 22, row.y, 736, row.size, font);
    const request = control(page, gate, font, FLOW6_BOARD.resumeControl, 22, 650, 736);
    return { gate, request };
  }
  async function buildHumanResumeTarget(page, sources, font) {
    assertTarget(page);
    const oldMatches = page.children.filter((n) => n.name === CANONICAL6);
    if (oldMatches.length > 1 || oldMatches.length === 1 && oldMatches[0].type !== "SECTION")
      throw new Error("Flow 6 canonical section is duplicate or wrong type. Nothing was changed.");
    if (page.children.some((n) => n.name === STAGING6 || n.name === PREVIOUS6))
      throw new Error("Existing Flow 6 staging/previous section requires manual review. Nothing was changed.");
    const old = oldMatches[0];
    const oldY = old?.y;
    const initialY = old?.y ?? Math.max(13800, ...page.children.filter((n) => n.type === "SECTION" && n.name !== "09 \u2014 Prototype Validation").map((n) => n.y + n.height + 180));
    const prior = old ? await checkFlowSix(old, sources) : null;
    const archive = Boolean(old && prior?.issues.length);
    if (archive && page.children.some((n) => n.name === ARCHIVE6)) throw new Error("Flow 6 archive name already exists. Nothing was changed.");
    let staging;
    let committed = false;
    try {
      assertTarget(page);
      staging = figma.createSection();
      staging.name = STAGING6;
      staging.x = old?.x ?? 0;
      staging.y = initialY;
      staging.resize(5800, 1900);
      const decision = sources.get("Awaiting Decision").clone();
      decision.name = cloneName(6, "Awaiting Decision");
      staging.appendChild(decision);
      decision.x = 50;
      decision.y = 350;
      const target = sources.get("Resume Pending").clone();
      target.name = cloneName(6, "Resume Pending");
      staging.appendChild(target);
      const gateX = decision.x + decision.width + 500;
      target.x = gateX + 780 + 500;
      target.y = 350;
      if (visualSignature(decision) !== visualSignature(sources.get("Awaiting Decision")) || visualSignature(target) !== visualSignature(sources.get("Resume Pending")))
        throw new Error("Fresh 03D Human Decision / Resume Pending clone visual mismatch.");
      const add = (item, x, y, width = 1700) => {
        annotation(page, staging, item.name, item.text, x, y, width, font);
      };
      add(FLOW6_BOARD.start, decision.x, 5);
      targetBanner(page, staging, font);
      add(FLOW6_BOARD.step1, decision.x, 130);
      add(FLOW6_BOARD.hierarchyNote, decision.x, 168);
      add(FLOW6_BOARD.decisionBoundary, decision.x, 225);
      add(FLOW6_BOARD.step3, target.x, 130, target.width);
      add(FLOW6_BOARD.targetNote, target.x, 168, target.width);
      add(FLOW6_BOARD.currentTarget, target.x, 230, target.width);
      const { gate, request } = revalidationGate(page, staging, font, gateX, 350);
      const below = Math.max(decision.y + decision.height, target.y + target.height, gate.y + gate.height) + 40;
      add(FLOW6_BOARD.end, target.x, below, target.width);
      const sourceAction = approvedDecisionControl(sources.get("Awaiting Decision"));
      const clonedAction = approvedDecisionControl(decision);
      if (sourceAction && sourceAction.reactions.length === 0 && clonedAction && clonedAction.reactions.length === 0) {
        add(FLOW6_BOARD.decisionSource, decision.x, below);
        await clonedAction.setReactionsAsync([navigateReaction(gate.id)]);
      } else {
        const decisionControl = control(
          page,
          staging,
          font,
          FLOW6_BOARD.decisionControl,
          decision.x + decision.width + 55,
          decision.y + 280
        );
        await decisionControl.setReactionsAsync([navigateReaction(gate.id)]);
      }
      await request.setReactionsAsync([navigateReaction(target.id)]);
      const maxX = Math.max(...staging.children.map((n) => "width" in n ? n.x + n.width : 0));
      const maxY = Math.max(...staging.children.map((n) => "height" in n ? n.y + n.height : 0));
      staging.resize(Math.max(5800, maxX + 80), Math.max(1900, maxY + 80));
      const preflight = await checkFlowSix(staging, sources);
      if (preflight.issues.length) throw new Error(`Flow 6 staging validation failed: ${preflight.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        old.name = PREVIOUS6;
      }
      assertTarget(page);
      staging.name = CANONICAL6;
      const finalCheck = await checkFlowSix(staging, sources);
      if (finalCheck.issues.length || page.children.filter((n) => n.name === CANONICAL6).length !== 1)
        throw new Error(`Flow 6 canonical validation failed: ${finalCheck.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        if (archive) {
          old.name = ARCHIVE6;
          old.y = staging.y + staging.height + 220;
        } else old.remove();
      }
      committed = true;
      return `Built ${CANONICAL6}: two fresh 03D clones; Decision \u2192 Revalidation Gate: ${preflight.strategy}; Controlled Resume request \u2192 Resume Pending: PROTOTYPE CONTROL; old section ${archive ? "archived" : old ? "removed after validation" : "not present"}.`;
    } catch (error) {
      if (!committed) {
        if (old && !old.removed && (old.name === PREVIOUS6 || old.name === ARCHIVE6)) {
          assertTarget(page);
          old.name = CANONICAL6;
          if (oldY !== void 0) old.y = oldY;
        }
        if (staging && !staging.removed) {
          assertTarget(page);
          staging.remove();
        }
      }
      throw error;
    }
  }

  // src/flow7-validation.ts
  var KEYS8 = ["Analytics Valid", "MODEL_NOT_READY", "TARGET Ready"];
  var NOTES = [
    FLOW7_BOARD.start,
    FLOW7_BOARD.step1,
    FLOW7_BOARD.analyticsBoundary,
    FLOW7_BOARD.step2,
    FLOW7_BOARD.notReadyBoundary,
    FLOW7_BOARD.currentEnd,
    FLOW7_BOARD.targetNote,
    FLOW7_BOARD.seriesBoundary,
    FLOW7_BOARD.currentTarget,
    FLOW7_BOARD.m13Boundary,
    FLOW7_BOARD.targetEnd
  ];
  function allText3(node) {
    return [node.type === "TEXT" ? node.characters : "", ..."findAll" in node ? node.findAll((n) => n.type === "TEXT").map((n) => n.characters) : []].join(" ").toLowerCase();
  }
  function reactionNodes7(frame) {
    return [frame, ...frame.findAll((n) => "reactions" in n)];
  }
  function uniqueNamed(frame, name) {
    const matches = frame.findAll((n) => n.name === name);
    return matches.length === 1 ? matches[0] : null;
  }
  function hasNamed(frame, name) {
    return frame.findAll((n) => n.name === name).length > 0;
  }
  function approvedForecastControl(frame, name) {
    const candidates = frame.findAll((n) => n.type === "FRAME" && n.name === name && n.findAll((child) => child.type === "TEXT").some((child) => child.characters.trim().toLowerCase().startsWith(name.toLowerCase())) && typeof n.setReactionsAsync === "function");
    const usable = candidates.filter((node) => {
      let current = node;
      while (current) {
        if ("visible" in current && !current.visible) return false;
        if ("opacity" in current && current.opacity <= 0) return false;
        if (current !== node && current.type === "INSTANCE") return false;
        if (current.id === frame.id) break;
        current = current.parent;
      }
      return true;
    });
    return usable.length === 1 ? usable[0] : null;
  }
  function sourceReactionsPreserved5(source, clone, added) {
    const originals = reactionNodes7(source);
    const copies = reactionNodes7(clone);
    if (originals.length !== copies.length) return false;
    const idMap = new Map(originals.map((node, index) => [node.id, copies[index].id]));
    for (let i = 0; i < originals.length; i++) {
      const expected = JSON.parse(JSON.stringify(originals[i].reactions));
      for (const reaction of expected) {
        for (const action of reaction.actions ?? []) if (action.type === "NODE" && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId);
        if (reaction.action?.type === "NODE" && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId);
      }
      if (copies[i].id === added && expected.length === 0 && copies[i].reactions.length === 1) continue;
      if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
    }
    return true;
  }
  async function reactionError5(node, destinationId) {
    if (node.reactions.length !== 1) return `Expected one progression reaction, found ${node.reactions.length}`;
    const reaction = node.reactions[0];
    if (reaction.trigger?.type !== "ON_CLICK") return "Progression trigger must be ON_CLICK";
    if (reaction.actions !== void 0 && reaction.actions.length !== 1) return "Progression requires exactly one action";
    const actions = reaction.actions === void 0 ? reaction.action ? [reaction.action] : [] : reaction.actions;
    if (actions.length !== 1) return "Progression NODE action missing";
    for (const action of [...actions, ...reaction.action && reaction.actions !== void 0 ? [reaction.action] : []]) {
      if (action.type !== "NODE" || action.navigation !== "NAVIGATE") return "Progression must use NODE/NAVIGATE";
      if (action.destinationId !== destinationId) return `Progression destination must be ${destinationId}`;
      if (action.transition != null) return "Animated progression is forbidden";
    }
    if (!await figma.getNodeByIdAsync(destinationId)) return "Progression destination is broken";
    return null;
  }
  function externalControl5(node, item) {
    return Boolean(node && node.type === "FRAME" && node.name === item.name && node.visible && node.opacity > 0 && node.width >= 250 && node.height >= 70 && node.children.length === 2 && node.children.filter((n) => n.name === "Prototype-only marker" && n.type === "TEXT" && n.characters === item.marker).length === 1 && node.children.filter((n) => n.name === "Continue scenario label" && n.type === "TEXT" && n.characters === item.text).length === 1 && node.fills !== figma.mixed && node.fills.some((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0));
  }
  async function checkFlowSeven(section, sources) {
    const issues = [];
    const checks = [];
    let broken = 0;
    const strategies = { open: null, back: null, target: "NON-INTERACTIVE SPECIMEN" };
    const record = (name, passed, detail = name) => {
      checks.push({ name, passed });
      if (!passed) issues.push(detail);
    };
    const allowed = /* @__PURE__ */ new Set([...KEYS8.map((key) => cloneName(7, key)), ...Object.values(FLOW7_BOARD).map((item) => item.name)]);
    record("Generated-node ownership", section.children.every((n) => allowed.has(n.name)), "Unexpected node inside generated Flow 7 section.");
    const clones = /* @__PURE__ */ new Map();
    for (const key of KEYS8) {
      const exact = section.children.filter((n) => n.name === cloneName(7, key));
      const source = sources.get(key);
      if (exact.length === 1 && exact[0].type === "FRAME") clones.set(key, exact[0]);
      record(
        `${key} source`,
        exact.length === 1 && exact[0].type === "FRAME" && Boolean(source) && visualSignature(exact[0]) === visualSignature(source),
        `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`
      );
    }
    for (const item of NOTES) {
      const exact = section.children.filter((n) => n.name === item.name);
      record(
        item.name,
        exact.length === 1 && exact[0].type === "TEXT" && exact[0].characters.trim() === item.text.trim(),
        `Missing/wrong external annotation: ${item.name}`
      );
    }
    for (const [item, label4] of [
      [FLOW7_BOARD.currentBanner, "CURRENT ENGINEERING STATE"],
      [FLOW7_BOARD.targetBanner, "TARGET PRODUCT UX explicit"]
    ]) {
      const matches = section.children.filter((n) => n.name === item.name);
      const banner2 = matches.length === 1 && matches[0].type === "FRAME" ? matches[0] : null;
      record(
        label4,
        Boolean(banner2 && banner2.visible && banner2.opacity > 0 && banner2.width >= 1400 && banner2.height >= 70 && banner2.fills !== figma.mixed && banner2.fills.some((p) => p.type === "SOLID" && p.visible !== false) && banner2.children.filter((n) => n.type === "TEXT" && n.characters === item.text && typeof n.fontSize === "number" && n.fontSize >= 24).length === 1),
        `${label4} must have a large visible external banner.`
      );
    }
    const analytics = clones.get("Analytics Valid");
    const notReady = clones.get("MODEL_NOT_READY");
    const target = clones.get("TARGET Ready");
    if (!analytics || !notReady || !target) return { issues, broken, checks, strategies };
    const analyticsText = allText3(analytics);
    const currentText = allText3(notReady);
    const targetText = allText3(target);
    record(
      "Analytics observed-only",
      analyticsText.includes("valid historical result") && analyticsText.includes("actual only") && analyticsText.includes("observed") && Boolean(uniqueNamed(analytics, "Historical Chart")) && !hasNamed(analytics, "Predicted Series component"),
      "Analytics must show historical ACTUAL observations, not a predicted series."
    );
    record("No predicted data in Analytics", !/predicted\s*(?:value|result|series)\s*[:=]\s*\d/i.test(analyticsText) && !hasNamed(analytics, "Actual vs Predicted Chart component"), "Analytics contains a predicted/future result.");
    record(
      "MODEL_NOT_READY \u2260 zero forecast",
      currentText.includes("model_not_ready") && currentText.includes("no validated forecast artifact exists") && currentText.includes("not a zero or valid-empty forecast") && !/model_not_ready\s*(?:=|is|means)\s*(?:a\s*)?zero(?:\s+forecast)?/i.test(currentText),
      "MODEL_NOT_READY must not be treated as zero or Valid Empty."
    );
    record(
      "MODEL_NOT_READY \u2260 Model Unavailable",
      section.children.some((n) => n.name === FLOW7_BOARD.notReadyBoundary.name && n.type === "TEXT" && n.characters === FLOW7_BOARD.notReadyBoundary.text) && !/model_not_ready\s*(?:=|is|means)\s*model unavailable|model unavailable\s*(?:=|is|means)\s*model_not_ready/i.test(currentText),
      "MODEL_NOT_READY must remain distinct from Model Unavailable."
    );
    record(
      "No fake prediction",
      currentText.includes("no prediction produced") && !hasNamed(notReady, "Predicted Series component") && !hasNamed(notReady, "Actual vs Predicted Chart component") && !/predicted\s*(?:value|result|series)\s*[:=]\s*\d/i.test(currentText),
      "Current MODEL_NOT_READY must not show invented predicted values."
    );
    const result = uniqueNamed(target, "Forecast Result");
    const reading = result && "findAll" in result ? result.findAll((n) => n.name === "Series reading") : [];
    const series = reading.length === 1 ? allText3(reading[0]) : "";
    record(
      "ACTUAL solid historical semantics",
      /actual\s*=\s*solid,\s*observed,\s*before cutoff/i.test(series),
      "TARGET ACTUAL must be solid historical data before cutoff."
    );
    record(
      "CUTOFF boundary semantics",
      /cutoff\s*=\s*last observed point/i.test(series),
      "TARGET CUTOFF must mark the last observed point."
    );
    record(
      "PREDICTED dashed future semantics",
      /predicted\s*=\s*dashed,\s*future-only/i.test(series) && Boolean(uniqueNamed(target, "Predicted Series component")),
      "TARGET PREDICTED must be dashed, future-only and illustrative."
    );
    record(
      "TARGET Ready provenance placeholders",
      Boolean(uniqueNamed(target, "Request Summary component")) && Boolean(uniqueNamed(target, "Provenance component")) && Boolean(uniqueNamed(target, "Limitations component")) && targetText.includes("forecast run: [real run only]") && targetText.includes("validated artifact: [real evidence only]"),
      "TARGET request/provenance/limitations placeholders must be preserved."
    );
    record(
      "TARGET Ready illustrative only",
      targetText.includes("target product ux") && targetText.includes("current engineering state: model_not_ready") && targetText.includes("design example only") && !/forecast model (?:trained|validated|deployed)\s*[:=]\s*yes/i.test(targetText),
      "TARGET Ready must not claim a validated live M13 result."
    );
    const currentBanner = section.children.find((n) => n.name === FLOW7_BOARD.currentBanner.name);
    const targetBanner2 = section.children.find((n) => n.name === FLOW7_BOARD.targetBanner.name);
    const currentBottom = Math.max(
      analytics.y + analytics.height,
      notReady.y + notReady.height,
      currentBanner && "height" in currentBanner ? currentBanner.y + currentBanner.height : 0
    );
    record(
      "TARGET Ready isolated from current",
      analytics.x + analytics.width < notReady.x && target.y >= currentBottom + 220 && Boolean(targetBanner2 && "y" in targetBanner2 && targetBanner2.y >= currentBottom + 80 && targetBanner2.y + targetBanner2.height < target.y),
      "TARGET Ready must be spatially separated below CURRENT with a visible boundary."
    );
    record(
      "ACTUAL \u2260 PREDICTED",
      section.children.some((n) => n.name === FLOW7_BOARD.seriesBoundary.name && n.type === "TEXT" && n.characters === FLOW7_BOARD.seriesBoundary.text),
      "ACTUAL and PREDICTED must be explicitly distinguished outside product UI."
    );
    record(
      "M13 not ready",
      section.children.some((n) => n.name === FLOW7_BOARD.m13Boundary.name && n.type === "TEXT" && n.characters === FLOW7_BOARD.m13Boundary.text),
      "M13 remains not ready and TARGET does not establish implementation."
    );
    const progressionPass = { open: false, back: false };
    for (const spec of [
      {
        key: "open",
        source: analytics,
        original: sources.get("Analytics Valid"),
        name: "Open Forecasts",
        sourceNote: FLOW7_BOARD.openSource,
        external: FLOW7_BOARD.openControl,
        dest: notReady,
        label: "Analytics \u2192 Forecasts navigation"
      },
      {
        key: "back",
        source: notReady,
        original: sources.get("MODEL_NOT_READY"),
        name: "Open Historical Analytics",
        sourceNote: FLOW7_BOARD.returnSource,
        external: FLOW7_BOARD.returnControl,
        dest: analytics,
        label: "Return to Analytics"
      }
    ]) {
      const sourceAction = approvedForecastControl(spec.original, spec.name);
      const productAction = approvedForecastControl(spec.source, spec.name);
      const sourceLabels = section.children.filter((n) => n.name === spec.sourceNote.name);
      const externalMatches = section.children.filter((n) => n.name === spec.external.name);
      let progression = null;
      if (sourceAction && sourceAction.reactions.length === 0 && productAction && sourceLabels.length === 1 && sourceLabels[0].type === "TEXT" && sourceLabels[0].characters === spec.sourceNote.text && externalMatches.length === 0) {
        strategies[spec.key] = "PRODUCT CONTROL";
        progression = productAction;
      } else if (sourceLabels.length === 0 && externalMatches.length === 1 && externalControl5(externalMatches[0], spec.external)) {
        strategies[spec.key] = "PROTOTYPE CONTROL";
        progression = externalMatches[0];
        record(
          `${spec.label} external control`,
          progression.visible && progression.x >= analytics.x + analytics.width && progression.x + progression.width <= notReady.x,
          `${spec.label}: external control must be visible between current frames.`
        );
      } else record(`${spec.label} strategy`, false, `${spec.label}: product/external control strategy is missing or ambiguous.`);
      const error = progression ? await reactionError5(progression, spec.dest.id) : "Progression control missing";
      record(spec.label, !error, error ?? void 0);
      progressionPass[spec.key] = !error;
      if (error) broken++;
      record(
        `${spec.source.name} source reactions`,
        sourceReactionsPreserved5(
          spec.original,
          spec.source,
          strategies[spec.key] === "PRODUCT CONTROL" ? productAction?.id : void 0
        ),
        `${spec.source.name}: legitimate source reactions changed or progression attached to unrelated product UI.`
      );
    }
    record(
      "Exact MODEL_NOT_READY destination",
      progressionPass.open,
      "Open Forecasts must lead to fresh MODEL_NOT_READY."
    );
    record(
      "CURRENT path closed safely",
      section.children.some((n) => n.name === FLOW7_BOARD.currentEnd.name && n.type === "TEXT" && n.characters === FLOW7_BOARD.currentEnd.text) && progressionPass.back,
      "CURRENT must return to Historical Analytics without prediction."
    );
    record(
      "TARGET specimen entry",
      section.children.filter((n) => n.name.toLowerCase().includes("target entry")).length === 0,
      "TARGET entry must remain a non-interactive specimen."
    );
    record(
      "TARGET source reactions",
      sourceReactionsPreserved5(sources.get("TARGET Ready"), target),
      "TARGET Ready source reactions were changed."
    );
    let validDestinations = true;
    let noCurrentTarget = true;
    const forbidden = /TARGET Ready|Model Unavailable|Processing|Confirmed Result|Reservation Confirmed|Retry|Refresh|Generate/i;
    for (const clone of [analytics, notReady]) for (const node of reactionNodes7(clone)) for (const reaction of node.reactions) {
      for (const action of [...reaction.actions ?? [], ...reaction.action ? [reaction.action] : []]) {
        if (action.type !== "NODE") continue;
        const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
        if (!dest || forbidden.test(dest.name) || dest.id === target.id) {
          validDestinations = false;
          broken++;
          if (dest && (dest.id === target.id || /TARGET Ready/i.test(dest.name))) noCurrentTarget = false;
        }
      }
    }
    record(
      "No current \u2192 TARGET progression",
      noCurrentTarget,
      "Current MODEL_NOT_READY must not navigate to TARGET Ready."
    );
    record(
      "Broken / prohibited destinations",
      validDestinations,
      "Current path has a broken or prohibited destination."
    );
    return { issues, broken, checks, strategies };
  }

  // src/analytics-forecasts.ts
  var CANONICAL7 = flowSectionName(7);
  var STAGING7 = `${CANONICAL7} / staging`;
  var PREVIOUS7 = `${CANONICAL7} / previous`;
  var ARCHIVE7 = "ARCHIVE \u2014 Flow 7 \u2014 previous prototype with manual or ambiguous content";
  function label2(page, parent, name, value, x, y, width, size, font) {
    assertTarget(page);
    const text = figma.createText();
    text.name = name;
    parent.appendChild(text);
    text.fontName = font;
    text.fontSize = size;
    text.textAutoResize = "HEIGHT";
    text.resize(width, 24);
    text.characters = value;
    text.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    text.x = x;
    text.y = y;
    return text;
  }
  function banner(page, section, font, item, x, y, width) {
    assertTarget(page);
    const node = figma.createFrame();
    node.name = item.name;
    section.appendChild(node);
    node.resize(width, 82);
    node.x = x;
    node.y = y;
    node.cornerRadius = 8;
    node.fills = [{ type: "SOLID", color: { r: 0.86, g: 0.86, b: 0.86 } }];
    node.strokes = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
    node.strokeWeight = 2;
    label2(page, node, "Prototype state label", item.text, 20, 20, width - 40, 26, font);
    return node;
  }
  function externalControl6(page, section, font, item, x, y) {
    assertTarget(page);
    const node = figma.createFrame();
    node.name = item.name;
    section.appendChild(node);
    node.resize(410, 104);
    node.x = x;
    node.y = y;
    node.cornerRadius = 8;
    node.fills = [{ type: "SOLID", color: { r: 0.94, g: 0.94, b: 0.94 } }];
    node.strokes = [{ type: "SOLID", color: { r: 0.44, g: 0.44, b: 0.44 } }];
    node.strokeWeight = 1;
    label2(page, node, "Prototype-only marker", item.marker, 14, 12, 380, 11, font);
    label2(page, node, "Continue scenario label", item.text, 14, 40, 380, 15, font);
    return node;
  }
  async function buildAnalyticsForecasts(page, sources, font) {
    assertTarget(page);
    const oldMatches = page.children.filter((n) => n.name === CANONICAL7);
    if (oldMatches.length > 1 || oldMatches.length === 1 && oldMatches[0].type !== "SECTION")
      throw new Error("Flow 7 canonical section is duplicate or wrong type. Nothing was changed.");
    if (page.children.some((n) => n.name === STAGING7 || n.name === PREVIOUS7))
      throw new Error("Existing Flow 7 staging/previous section requires manual review. Nothing was changed.");
    const old = oldMatches[0];
    const oldY = old?.y;
    const initialY = old?.y ?? Math.max(22500, ...page.children.filter((n) => n.type === "SECTION" && n.name !== "09 \u2014 Prototype Validation").map((n) => n.y + n.height + 180));
    const prior = old ? await checkFlowSeven(old, sources) : null;
    const archive = Boolean(old && prior?.issues.length);
    if (archive && page.children.some((n) => n.name === ARCHIVE7)) throw new Error("Flow 7 archive name already exists. Nothing was changed.");
    let staging;
    let committed = false;
    try {
      assertTarget(page);
      staging = figma.createSection();
      staging.name = STAGING7;
      staging.x = old?.x ?? 0;
      staging.y = initialY;
      staging.resize(4800, 2500);
      const analytics = sources.get("Analytics Valid").clone();
      analytics.name = cloneName(7, "Analytics Valid");
      staging.appendChild(analytics);
      analytics.x = 50;
      analytics.y = 420;
      const notReady = sources.get("MODEL_NOT_READY").clone();
      notReady.name = cloneName(7, "MODEL_NOT_READY");
      staging.appendChild(notReady);
      notReady.x = analytics.x + analytics.width + 520;
      notReady.y = 420;
      const target = sources.get("TARGET Ready").clone();
      target.name = cloneName(7, "TARGET Ready");
      staging.appendChild(target);
      const currentBottom = Math.max(analytics.y + analytics.height, notReady.y + notReady.height);
      target.x = 50;
      target.y = currentBottom + 490;
      for (const [key, clone] of [["Analytics Valid", analytics], ["MODEL_NOT_READY", notReady], ["TARGET Ready", target]]) {
        if (visualSignature(clone) !== visualSignature(sources.get(key)))
          throw new Error(`Fresh 03D ${key} clone visual mismatch.`);
      }
      const add = (item, x, y, width = 1700) => {
        annotation(page, staging, item.name, item.text, x, y, width, font);
      };
      add(FLOW7_BOARD.start, analytics.x, 10);
      add(FLOW7_BOARD.step1, analytics.x, 120);
      add(FLOW7_BOARD.analyticsBoundary, analytics.x, 175);
      add(FLOW7_BOARD.step2, notReady.x, 120);
      banner(page, staging, font, FLOW7_BOARD.currentBanner, notReady.x, 235, 1700);
      add(FLOW7_BOARD.notReadyBoundary, notReady.x, 335);
      add(FLOW7_BOARD.currentEnd, notReady.x, currentBottom + 60);
      banner(page, staging, font, FLOW7_BOARD.targetBanner, 50, currentBottom + 280, 2300);
      add(FLOW7_BOARD.targetNote, target.x + target.width + 100, target.y + 55);
      add(FLOW7_BOARD.seriesBoundary, target.x + target.width + 100, target.y + 155);
      add(FLOW7_BOARD.currentTarget, target.x + target.width + 100, target.y + 285);
      add(FLOW7_BOARD.m13Boundary, target.x + target.width + 100, target.y + 410);
      add(FLOW7_BOARD.targetEnd, target.x, target.y + target.height + 55);
      const openSource = approvedForecastControl(sources.get("Analytics Valid"), "Open Forecasts");
      const openClone = approvedForecastControl(analytics, "Open Forecasts");
      if (openSource && openSource.reactions.length === 0 && openClone && openClone.reactions.length === 0) {
        add(FLOW7_BOARD.openSource, analytics.x, 355);
        await openClone.setReactionsAsync([navigateReaction(notReady.id)]);
      } else {
        const control3 = externalControl6(
          page,
          staging,
          font,
          FLOW7_BOARD.openControl,
          analytics.x + analytics.width + 55,
          analytics.y + 330
        );
        await control3.setReactionsAsync([navigateReaction(notReady.id)]);
      }
      const returnSource = approvedForecastControl(sources.get("MODEL_NOT_READY"), "Open Historical Analytics");
      const returnClone = approvedForecastControl(notReady, "Open Historical Analytics");
      if (returnSource && returnSource.reactions.length === 0 && returnClone && returnClone.reactions.length === 0) {
        add(FLOW7_BOARD.returnSource, notReady.x, 355);
        await returnClone.setReactionsAsync([navigateReaction(analytics.id)]);
      } else {
        const control3 = externalControl6(
          page,
          staging,
          font,
          FLOW7_BOARD.returnControl,
          analytics.x + analytics.width + 55,
          analytics.y + 490
        );
        await control3.setReactionsAsync([navigateReaction(analytics.id)]);
      }
      const maxX = Math.max(...staging.children.map((n) => "width" in n ? n.x + n.width : 0));
      const maxY = Math.max(...staging.children.map((n) => "height" in n ? n.y + n.height : 0));
      staging.resize(Math.max(4800, maxX + 80), Math.max(2500, maxY + 80));
      const preflight = await checkFlowSeven(staging, sources);
      if (preflight.issues.length) throw new Error(`Flow 7 staging validation failed: ${preflight.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        old.name = PREVIOUS7;
      }
      assertTarget(page);
      staging.name = CANONICAL7;
      const finalCheck = await checkFlowSeven(staging, sources);
      if (finalCheck.issues.length || page.children.filter((n) => n.name === CANONICAL7).length !== 1)
        throw new Error(`Flow 7 canonical validation failed: ${finalCheck.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        if (archive) {
          old.name = ARCHIVE7;
          old.y = staging.y + staging.height + 220;
        } else old.remove();
      }
      committed = true;
      return `Built ${CANONICAL7}: three fresh 03D clones; Analytics \u2192 Forecasts: ${preflight.strategies.open}; Forecasts \u2192 Analytics: ${preflight.strategies.back}; TARGET entry: NON-INTERACTIVE SPECIMEN; old section ${archive ? "archived" : old ? "removed after validation" : "not present"}.`;
    } catch (error) {
      if (!committed) {
        if (old && !old.removed && (old.name === PREVIOUS7 || old.name === ARCHIVE7)) {
          assertTarget(page);
          old.name = CANONICAL7;
          if (oldY !== void 0) old.y = oldY;
        }
        if (staging && !staging.removed) {
          assertTarget(page);
          staging.remove();
        }
      }
      throw error;
    }
  }

  // src/flow8-validation.ts
  var KEYS9 = ["Confirmation Required", "Processing", "Confirmed Result", "Message Delivery Failure"];
  var NOTES2 = [
    FLOW8_BOARD.start,
    FLOW8_BOARD.step1,
    FLOW8_BOARD.proposalBoundary,
    FLOW8_BOARD.confirmSource,
    FLOW8_BOARD.customerAuthorization,
    FLOW8_BOARD.step2,
    FLOW8_BOARD.processingBoundary,
    FLOW8_BOARD.step3,
    FLOW8_BOARD.confirmedBoundary,
    FLOW8_BOARD.primaryEnd,
    FLOW8_BOARD.branch,
    FLOW8_BOARD.step4,
    FLOW8_BOARD.deliveryBoundary,
    FLOW8_BOARD.businessBoundary,
    FLOW8_BOARD.noReplay,
    FLOW8_BOARD.recoveryNote,
    FLOW8_BOARD.recoveryEnd
  ];
  function allText4(node) {
    return [node.type === "TEXT" ? node.characters : "", ..."findAll" in node ? node.findAll((n) => n.type === "TEXT").map((n) => n.characters) : []].join(" ").toLowerCase();
  }
  function reactionNodes8(frame) {
    return [frame, ...frame.findAll((n) => "reactions" in n)];
  }
  function approvedCustomerControl(frame, name, label4) {
    const matches = frame.findAll((n) => n.type === "FRAME" && n.name === name && n.width >= 200 && n.height >= 44 && n.findAll((child) => child.type === "TEXT" && child.name === "Action label").some((child) => child.characters.trim().toLowerCase() === label4.toLowerCase()) && typeof n.setReactionsAsync === "function");
    const visible = matches.filter((node) => {
      let current = node;
      while (current) {
        if ("visible" in current && !current.visible) return false;
        if ("opacity" in current && current.opacity <= 0) return false;
        if (current.id === frame.id) break;
        current = current.parent;
      }
      return true;
    });
    return visible.length === 1 ? visible[0] : null;
  }
  function sourceReactionsPreserved6(source, clone, added) {
    const originals = reactionNodes8(source);
    const copies = reactionNodes8(clone);
    if (originals.length !== copies.length) return false;
    const idMap = new Map(originals.map((node, index) => [node.id, copies[index].id]));
    for (let i = 0; i < originals.length; i++) {
      const expected = JSON.parse(JSON.stringify(originals[i].reactions));
      for (const reaction of expected) {
        for (const action of reaction.actions ?? []) if (action.type === "NODE" && action.destinationId && idMap.has(action.destinationId)) action.destinationId = idMap.get(action.destinationId);
        if (reaction.action?.type === "NODE" && reaction.action.destinationId && idMap.has(reaction.action.destinationId)) reaction.action.destinationId = idMap.get(reaction.action.destinationId);
      }
      if (copies[i].id === added && expected.length === 0 && copies[i].reactions.length === 1) continue;
      if (JSON.stringify(expected) !== JSON.stringify(copies[i].reactions)) return false;
    }
    return true;
  }
  async function reactionError6(node, destinationId) {
    if (node.reactions.length !== 1) return `Expected one progression reaction, found ${node.reactions.length}`;
    const reaction = node.reactions[0];
    if (reaction.trigger?.type !== "ON_CLICK") return "Progression trigger must be ON_CLICK";
    if (reaction.actions !== void 0 && reaction.actions.length !== 1) return "Progression requires exactly one action";
    const actions = reaction.actions === void 0 ? reaction.action ? [reaction.action] : [] : reaction.actions;
    if (actions.length !== 1) return "Progression NODE action missing";
    for (const action of [...actions, ...reaction.action && reaction.actions !== void 0 ? [reaction.action] : []]) {
      if (action.type !== "NODE" || action.navigation !== "NAVIGATE") return "Progression must use NODE/NAVIGATE";
      if (action.destinationId !== destinationId) return `Progression destination must be ${destinationId}`;
      if (action.transition != null) return "Animated progression is forbidden";
    }
    if (!await figma.getNodeByIdAsync(destinationId)) return "Progression destination is broken";
    return null;
  }
  function externalControl7(node, item) {
    return Boolean(node && node.type === "FRAME" && node.name === item.name && node.visible && node.opacity > 0 && node.width >= 300 && node.height >= 75 && node.children.length === 2 && node.children.filter((n) => n.name === "Prototype-only marker" && n.type === "TEXT" && n.characters === item.marker).length === 1 && node.children.filter((n) => n.name === "Continue scenario label" && n.type === "TEXT" && n.characters === item.text).length === 1 && node.fills !== figma.mixed && node.fills.some((p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0));
  }
  function withinMobileFrame(node, frame) {
    let x = 0, y = 0;
    let current = node;
    while (current && current.id !== frame.id) {
      if (!("x" in current && "y" in current)) return false;
      x += current.x;
      y += current.y;
      current = current.parent;
    }
    return Boolean(current && x >= 0 && y >= 0 && x + node.width <= frame.width + 1 && y + node.height <= frame.height + 1);
  }
  async function checkFlowEight(section, sources) {
    const issues = [];
    const checks = [];
    let broken = 0;
    let retryStrategy = null;
    const record = (name, passed, detail = name) => {
      checks.push({ name, passed });
      if (!passed) issues.push(detail);
    };
    const allowed = /* @__PURE__ */ new Set([...KEYS9.map((key) => cloneName(8, key)), ...Object.values(FLOW8_BOARD).map((item) => item.name)]);
    record("Generated-node ownership", section.children.every((n) => allowed.has(n.name)), "Unexpected node inside generated Flow 8 section.");
    const clones = /* @__PURE__ */ new Map();
    for (const key of KEYS9) {
      const exact = section.children.filter((n) => n.name === cloneName(8, key));
      const source = sources.get(key);
      if (exact.length === 1 && exact[0].type === "FRAME") clones.set(key, exact[0]);
      record(
        `${key} source`,
        exact.length === 1 && exact[0].type === "FRAME" && Boolean(source) && visualSignature(exact[0]) === visualSignature(source),
        `${key}: fresh 03D clone missing, duplicate, wrong type, or visually changed.`
      );
    }
    for (const item of NOTES2) {
      const exact = section.children.filter((n) => n.name === item.name);
      record(
        item.name,
        exact.length === 1 && exact[0].type === "TEXT" && exact[0].characters.trim() === item.text.trim(),
        `Missing/wrong external annotation: ${item.name}`
      );
    }
    const confirmation = clones.get("Confirmation Required");
    const processing = clones.get("Processing");
    const confirmed = clones.get("Confirmed Result");
    const delivery = clones.get("Message Delivery Failure");
    if (!confirmation || !processing || !confirmed || !delivery) return { issues, broken, checks, retryStrategy };
    const confirmationText = allText4(confirmation);
    const processingText = allText4(processing);
    const confirmedText = allText4(confirmed);
    const deliveryText = allText4(delivery);
    const forbiddenCustomer = /\b(?:toolcall|tool executor|agent run|langgraph|outcome_unknown|e02|m12|internal confidence|authorization logic|transport failure|mutation committed|idempotency)\b|revision\s*(?:id|#)/i;
    record(
      "Customer-only surface",
      [...clones.values()].every((frame) => !forbiddenCustomer.test(allText4(frame))) && [...clones.values()].every((frame) => frame.findAll((n) => n.name === "Staff navigation").length === 0),
      "Customer Web Chat product UI exposes internal/staff terminology."
    );
    record(
      "Proposal \u2260 Execution",
      confirmationText.includes("confirmation required") && confirmationText.includes("if you confirm, we will place this order") && !confirmationText.includes("order created") && section.children.some((n) => n.name === FLOW8_BOARD.proposalBoundary.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.proposalBoundary.text),
      "Confirmation Required must remain a proposal before customer authorization."
    );
    const sourceConfirm = approvedCustomerControl(sources.get("Confirmation Required"), "Confirm order / focus", "Confirm order");
    const confirm = approvedCustomerControl(confirmation, "Confirm order / focus", "Confirm order");
    record(
      "Explicit Confirm order",
      Boolean(sourceConfirm && confirm && sourceConfirm.reactions.length === 0 && section.children.some((n) => n.name === FLOW8_BOARD.confirmSource.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.confirmSource.text)),
      "Visible approved Confirm order PRODUCT CONTROL is missing, ambiguous or pre-reactive."
    );
    const confirmError = confirm ? await reactionError6(confirm, processing.id) : "Confirm order PRODUCT CONTROL missing";
    record("Confirm order \u2192 Processing", !confirmError, confirmError ?? void 0);
    if (confirmError) broken++;
    record(
      "Customer authorization before Processing",
      !confirmError && confirmation.x + confirmation.width < processing.x && section.children.some((n) => n.name === FLOW8_BOARD.customerAuthorization.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.customerAuthorization.text),
      "Processing must follow explicit customer authorization, never AI or operator self-confirmation."
    );
    record("Change details preserved", Boolean(confirmation.findAll((n) => n.name === "Change details action").length === 1 && confirmationText.includes("change details")), "Approved Change details action was lost.");
    record(
      "Processing \u2260 Confirmed Result",
      processingText.includes("processing") && processingText.includes("no further action is needed") && !processingText.includes("order created") && !processingText.includes("item reserved") && section.children.some((n) => n.name === FLOW8_BOARD.processingBoundary.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.processingBoundary.text),
      "Processing must not claim a confirmed business effect or invent a customer completion action."
    );
    const resultMatches = section.children.filter((n) => n.name === FLOW8_BOARD.resultControl.name);
    const resultControl = resultMatches.length === 1 && externalControl7(resultMatches[0], FLOW8_BOARD.resultControl) ? resultMatches[0] : null;
    record(
      "Processing \u2192 Confirmed Result external control",
      Boolean(resultControl && resultControl.x >= processing.x + processing.width && resultControl.x + resultControl.width <= confirmed.x),
      "System-result progression must use a visible external prototype control."
    );
    const resultError = resultControl ? await reactionError6(resultControl, confirmed.id) : "System-result progression control missing";
    record("Processing \u2192 Confirmed Result", !resultError, resultError ?? void 0);
    if (resultError) broken++;
    record(
      "Confirmed business result",
      confirmedText.includes("order created") && confirmedText.includes("item reserved") && confirmedText.includes("order ord-1042"),
      "Confirmed Result must present distinct customer-safe Order and Reservation facts."
    );
    record(
      "Primary END",
      section.children.some((n) => n.name === FLOW8_BOARD.primaryEnd.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.primaryEnd.text),
      "Purchase-success END annotation is missing."
    );
    const branchMatches = section.children.filter((n) => n.name === FLOW8_BOARD.branchControl.name);
    const branchControl = branchMatches.length === 1 && externalControl7(branchMatches[0], FLOW8_BOARD.branchControl) ? branchMatches[0] : null;
    record(
      "Message-delivery branch",
      Boolean(branchControl && delivery.y > Math.max(
        confirmation.y + confirmation.height,
        processing.y + processing.height,
        confirmed.y + confirmed.height
      ) + 300 && branchControl.y > confirmed.y + confirmed.height && branchControl.y + branchControl.height < delivery.y && section.children.some((n) => n.name === FLOW8_BOARD.branch.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.branch.text)),
      "Delivery failure branch must start externally after an already confirmed business effect."
    );
    const branchError = branchControl ? await reactionError6(branchControl, delivery.id) : "Delivery-failure branch control missing";
    record("Confirmed Result \u2192 Message Delivery Failure", !branchError, branchError ?? void 0);
    if (branchError) broken++;
    record(
      "Business effect remains confirmed",
      deliveryText.includes("reservation remains confirmed") && deliveryText.includes("your order was created") && deliveryText.includes("not delivered") && section.children.some((n) => n.name === FLOW8_BOARD.businessBoundary.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.businessBoundary.text),
      "Delivery failure must retain the known confirmed business effect."
    );
    record(
      "Message Delivery Failure \u2260 Business Action Failure",
      deliveryText.includes("only your message needs attention") && section.children.some((n) => n.name === FLOW8_BOARD.deliveryBoundary.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.deliveryBoundary.text),
      "Communication failure must not become Order or Reservation failure."
    );
    const sourceRetry = approvedCustomerControl(sources.get("Message Delivery Failure"), "Retry message action / focus", "Retry message");
    const retry = approvedCustomerControl(delivery, "Retry message action / focus", "Retry message");
    const retrySourceNotes = section.children.filter((n) => n.name === FLOW8_BOARD.retrySource.name);
    const retryMatches = section.children.filter((n) => n.name === FLOW8_BOARD.retryControl.name);
    let retryControl = null;
    if (sourceRetry && sourceRetry.reactions.length === 0 && retry && retrySourceNotes.length === 1 && retrySourceNotes[0].type === "TEXT" && retrySourceNotes[0].characters === FLOW8_BOARD.retrySource.text && retryMatches.length === 0) {
      retryStrategy = "PRODUCT CONTROL";
      retryControl = retry;
    } else if (retrySourceNotes.length === 0 && retryMatches.length === 1 && externalControl7(retryMatches[0], FLOW8_BOARD.retryControl)) {
      retryStrategy = "PROTOTYPE CONTROL";
      retryControl = retryMatches[0];
      record(
        "External Retry message control",
        retryControl.visible && retryControl.x >= delivery.x + delivery.width,
        "Fallback Retry message control must be visible outside customer product UI."
      );
    } else record("Retry message strategy", false, "Message retry source is missing or ambiguous.");
    const retryError = retryControl ? await reactionError6(retryControl, confirmed.id) : "Retry message progression missing";
    record("Retry message only", !retryError && Boolean(retryStrategy), retryError ?? "Retry message source unresolved");
    if (retryError) broken++;
    record(
      "Recovery to existing Confirmed Result",
      !retryError && section.children.some((n) => n.name === FLOW8_BOARD.recoveryNote.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.recoveryNote.text),
      "Communication retry must return to the existing confirmed business state only."
    );
    record(
      "Message recovery END",
      section.children.some((n) => n.name === FLOW8_BOARD.recoveryEnd.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.recoveryEnd.text),
      "Message-recovery END annotation is missing."
    );
    record(
      "No duplicate Order",
      section.children.some((n) => n.name === FLOW8_BOARD.noReplay.name && n.type === "TEXT" && n.characters === FLOW8_BOARD.noReplay.text) && !/create_order again|repeat(?: the)? order|duplicate order creation/i.test(deliveryText),
      "Message retry would create a duplicate Order."
    );
    record(
      "No duplicate Reservation",
      !/reserve_inventory again|repeat(?: the)? reservation|duplicate reservation attempt/i.test(deliveryText),
      "Message retry would repeat the Reservation."
    );
    for (const key of KEYS9) {
      const source = sources.get(key);
      const clone = clones.get(key);
      const added = key === "Confirmation Required" ? confirm?.id : key === "Message Delivery Failure" && retryStrategy === "PRODUCT CONTROL" ? retry?.id : void 0;
      record(
        `${key} source reactions`,
        sourceReactionsPreserved6(source, clone, added),
        `${key}: source reactions changed or unrelated customer UI received scenario progression.`
      );
    }
    const controls = [
      confirm,
      retry,
      section.children.find((n) => n.name === FLOW8_BOARD.resultControl.name),
      section.children.find((n) => n.name === FLOW8_BOARD.branchControl.name)
    ].filter((n) => Boolean(n && n.type === "FRAME"));
    record(
      "Mobile geometry",
      [...clones.values()].every((frame) => frame.width >= 390 && frame.width <= 430 && frame.height >= 500) && Boolean(confirm && withinMobileFrame(confirm, confirmation)) && Boolean(retryStrategy !== "PRODUCT CONTROL" || retry && withinMobileFrame(retry, delivery)) && controls.every((node) => node === confirm || node === retry || node.parent?.id === section.id),
      "Mobile frame/touch-target geometry or external annotation placement is invalid."
    );
    let validDestinations = true;
    let noReplay = true;
    const forbidden = /create_order|reserve_inventory|update_order|repeat (?:order|reservation)|retry (?:order|reservation)/i;
    for (const [key, frame] of clones) for (const node of reactionNodes8(frame)) for (const reaction of node.reactions) {
      for (const action of [...reaction.actions ?? [], ...reaction.action ? [reaction.action] : []]) {
        if (action.type !== "NODE") continue;
        const dest = action.destinationId ? await figma.getNodeByIdAsync(action.destinationId) : null;
        const unsafe = !dest || forbidden.test(dest.name) || key === "Message Delivery Failure" && /Processing|Confirmation Required/i.test(dest.name) || key === "Confirmation Required" && /Confirmed Result|Message Delivery Failure/i.test(dest.name) || key === "Confirmed Result" && dest.id === delivery.id;
        if (unsafe) {
          validDestinations = false;
          broken++;
          if (dest && (forbidden.test(dest.name) || key === "Message Delivery Failure" && /Processing|Confirmation Required/i.test(dest.name))) noReplay = false;
        }
      }
    }
    record(
      "No business mutation replay",
      noReplay && validDestinations && Boolean(retryControl && !confirmError && !resultError && !branchError && !retryError),
      "Message recovery replays or implies another business mutation."
    );
    record(
      "Broken / prohibited destinations",
      validDestinations,
      "Web Chat flow contains a broken destination, confirmation bypass or prohibited replay."
    );
    return { issues, broken, checks, retryStrategy };
  }

  // src/customer-web-chat.ts
  var CANONICAL8 = flowSectionName(8);
  var STAGING8 = `${CANONICAL8} / staging`;
  var PREVIOUS8 = `${CANONICAL8} / previous`;
  var ARCHIVE8 = "ARCHIVE \u2014 Flow 8 \u2014 previous prototype with manual or ambiguous content";
  function label3(page, parent, name, value, x, y, width, size, font) {
    assertTarget(page);
    const text = figma.createText();
    text.name = name;
    parent.appendChild(text);
    text.fontName = font;
    text.fontSize = size;
    text.textAutoResize = "HEIGHT";
    text.resize(width, 24);
    text.characters = value;
    text.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    text.x = x;
    text.y = y;
    return text;
  }
  function control2(page, section, font, item, x, y, width = 410) {
    assertTarget(page);
    const node = figma.createFrame();
    node.name = item.name;
    section.appendChild(node);
    node.resize(width, 104);
    node.x = x;
    node.y = y;
    node.cornerRadius = 8;
    node.fills = [{ type: "SOLID", color: { r: 0.94, g: 0.94, b: 0.94 } }];
    node.strokes = [{ type: "SOLID", color: { r: 0.44, g: 0.44, b: 0.44 } }];
    node.strokeWeight = 1;
    label3(page, node, "Prototype-only marker", item.marker, 14, 12, width - 28, 11, font);
    label3(page, node, "Continue scenario label", item.text, 14, 40, width - 28, 15, font);
    return node;
  }
  async function buildCustomerWebChat(page, sources, font) {
    assertTarget(page);
    const sourceConfirm = approvedCustomerControl(sources.get("Confirmation Required"), "Confirm order / focus", "Confirm order");
    if (!sourceConfirm || sourceConfirm.reactions.length !== 0)
      throw new Error("Approved visible Confirm order PRODUCT CONTROL is missing, ambiguous or already reactive. Nothing was changed.");
    const oldMatches = page.children.filter((n) => n.name === CANONICAL8);
    if (oldMatches.length > 1 || oldMatches.length === 1 && oldMatches[0].type !== "SECTION")
      throw new Error("Flow 8 canonical section is duplicate or wrong type. Nothing was changed.");
    if (page.children.some((n) => n.name === STAGING8 || n.name === PREVIOUS8))
      throw new Error("Existing Flow 8 staging/previous section requires manual review. Nothing was changed.");
    const old = oldMatches[0];
    const oldY = old?.y;
    const initialY = old?.y ?? Math.max(3e4, ...page.children.filter((n) => n.type === "SECTION" && n.name !== "09 \u2014 Prototype Validation").map((n) => n.y + n.height + 180));
    const prior = old ? await checkFlowEight(old, sources) : null;
    const archive = Boolean(old && prior?.issues.length);
    if (archive && page.children.some((n) => n.name === ARCHIVE8)) throw new Error("Flow 8 archive name already exists. Nothing was changed.");
    let staging;
    let committed = false;
    try {
      assertTarget(page);
      staging = figma.createSection();
      staging.name = STAGING8;
      staging.x = old?.x ?? 0;
      staging.y = initialY;
      staging.resize(3600, 2600);
      const keys = ["Confirmation Required", "Processing", "Confirmed Result", "Message Delivery Failure"];
      const clones = /* @__PURE__ */ new Map();
      for (const key of keys) {
        const clone = sources.get(key).clone();
        clone.name = cloneName(8, key);
        staging.appendChild(clone);
        clones.set(key, clone);
        if (visualSignature(clone) !== visualSignature(sources.get(key)))
          throw new Error(`Fresh 03D Web Chat ${key} clone visual mismatch.`);
      }
      const confirmation = clones.get("Confirmation Required");
      const processing = clones.get("Processing");
      const confirmed = clones.get("Confirmed Result");
      const delivery = clones.get("Message Delivery Failure");
      confirmation.x = 50;
      confirmation.y = 330;
      processing.x = 950;
      processing.y = 330;
      confirmed.x = 1850;
      confirmed.y = 330;
      const currentBottom = Math.max(
        confirmation.y + confirmation.height,
        processing.y + processing.height,
        confirmed.y + confirmed.height
      );
      delivery.x = 1850;
      delivery.y = currentBottom + 620;
      const add = (item, x, y, width = 820) => {
        annotation(page, staging, item.name, item.text, x, y, width, font);
      };
      add(FLOW8_BOARD.start, confirmation.x, 10);
      add(FLOW8_BOARD.step1, confirmation.x, 110);
      add(FLOW8_BOARD.proposalBoundary, confirmation.x, 165);
      add(FLOW8_BOARD.customerAuthorization, confirmation.x, 240);
      add(FLOW8_BOARD.confirmSource, confirmation.x, 290);
      add(FLOW8_BOARD.step2, processing.x, 110);
      add(FLOW8_BOARD.processingBoundary, processing.x, 165);
      add(FLOW8_BOARD.step3, confirmed.x, 110);
      add(FLOW8_BOARD.confirmedBoundary, confirmed.x, 165);
      add(FLOW8_BOARD.primaryEnd, confirmed.x, currentBottom + 60);
      add(FLOW8_BOARD.branch, confirmed.x, currentBottom + 280, 1300);
      add(FLOW8_BOARD.step4, delivery.x, delivery.y - 85);
      add(FLOW8_BOARD.deliveryBoundary, delivery.x + delivery.width + 110, delivery.y + 55, 1080);
      add(FLOW8_BOARD.businessBoundary, delivery.x + delivery.width + 110, delivery.y + 160, 1080);
      add(FLOW8_BOARD.noReplay, delivery.x + delivery.width + 110, delivery.y + 295, 1080);
      add(FLOW8_BOARD.recoveryNote, delivery.x, delivery.y + delivery.height + 65, 1270);
      add(FLOW8_BOARD.recoveryEnd, delivery.x, delivery.y + delivery.height + 155, 1270);
      const confirm = approvedCustomerControl(confirmation, "Confirm order / focus", "Confirm order");
      if (!confirm || confirm.reactions.length) throw new Error("Fresh clone lacks the approved Confirm order action.");
      await confirm.setReactionsAsync([navigateReaction(processing.id)]);
      const resultControl = control2(
        page,
        staging,
        font,
        FLOW8_BOARD.resultControl,
        processing.x + processing.width + 32,
        processing.y + 300
      );
      await resultControl.setReactionsAsync([navigateReaction(confirmed.id)]);
      const branchControl = control2(
        page,
        staging,
        font,
        FLOW8_BOARD.branchControl,
        confirmed.x,
        currentBottom + 385,
        570
      );
      await branchControl.setReactionsAsync([navigateReaction(delivery.id)]);
      const sourceRetry = approvedCustomerControl(sources.get("Message Delivery Failure"), "Retry message action / focus", "Retry message");
      const clonedRetry = approvedCustomerControl(delivery, "Retry message action / focus", "Retry message");
      if (sourceRetry && sourceRetry.reactions.length === 0 && clonedRetry && clonedRetry.reactions.length === 0) {
        add(FLOW8_BOARD.retrySource, delivery.x, delivery.y - 35);
        await clonedRetry.setReactionsAsync([navigateReaction(confirmed.id)]);
      } else {
        const retryControl = control2(
          page,
          staging,
          font,
          FLOW8_BOARD.retryControl,
          delivery.x + delivery.width + 110,
          delivery.y + 440,
          520
        );
        await retryControl.setReactionsAsync([navigateReaction(confirmed.id)]);
      }
      const maxX = Math.max(...staging.children.map((n) => "width" in n ? n.x + n.width : 0));
      const maxY = Math.max(...staging.children.map((n) => "height" in n ? n.y + n.height : 0));
      staging.resize(Math.max(3600, maxX + 80), Math.max(2600, maxY + 80));
      const preflight = await checkFlowEight(staging, sources);
      if (preflight.issues.length) throw new Error(`Flow 8 staging validation failed: ${preflight.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        old.name = PREVIOUS8;
      }
      assertTarget(page);
      staging.name = CANONICAL8;
      const finalCheck = await checkFlowEight(staging, sources);
      if (finalCheck.issues.length || page.children.filter((n) => n.name === CANONICAL8).length !== 1)
        throw new Error(`Flow 8 canonical validation failed: ${finalCheck.issues.join("; ")}`);
      if (old) {
        assertTarget(page);
        if (archive) {
          old.name = ARCHIVE8;
          old.y = staging.y + staging.height + 220;
        } else old.remove();
      }
      committed = true;
      return `Built ${CANONICAL8}: four fresh 03D clones; Confirm order: PRODUCT CONTROL; Processing result: PROTOTYPE CONTROL; delivery branch: PROTOTYPE CONTROL; Retry message: ${preflight.retryStrategy}; old section ${archive ? "archived" : old ? "removed after validation" : "not present"}.`;
    } catch (error) {
      if (!committed) {
        if (old && !old.removed && (old.name === PREVIOUS8 || old.name === ARCHIVE8)) {
          assertTarget(page);
          old.name = CANONICAL8;
          if (oldY !== void 0) old.y = oldY;
        }
        if (staging && !staging.removed) {
          assertTarget(page);
          staging.remove();
        }
      }
      throw error;
    }
  }

  // src/builders.ts
  async function inspectPrototypeApi() {
    const inspection = await inspectSources();
    const candidate = inspection.findings.find((f) => f.status === "FOUND")?.exactFrames[0];
    const reactions = Boolean(candidate && typeof candidate.setReactionsAsync === "function");
    const page = exactPage(TARGET_PAGE) ?? inspection.page;
    const startsReadable = Boolean(page && "flowStartingPoints" in page);
    return [
      "PROTOTYPE API (READ ONLY)",
      `Create reactions: ${reactions ? "SUPPORTED (runtime setter found)" : "UNSUPPORTED / no inspectable FRAME setter"}`,
      `Navigation destinations: ${reactions ? "SUPPORTED via NODE destinationId (not yet smoke-tested)" : "UNSUPPORTED"}`,
      `Back action: ${reactions ? "SUPPORTED by Reaction API; not used by builders" : "UNSUPPORTED"}`,
      `Overlay action: ${reactions ? "SUPPORTED by Reaction API; not needed or used" : "UNSUPPORTED"}`,
      `Read flow starts: ${startsReadable ? "SUPPORTED" : "UNSUPPORTED"}`,
      "Write formal flow starts: UNSUPPORTED (PageNode.flowStartingPoints is read-only)",
      "Any setReactionsAsync rejection aborts the staged flow and preserves the prior approved flow."
    ].join("\n");
  }
  function sourceControlCheck(source, control3) {
    findUniqueControl(source, control3);
  }
  function sourceHasReactions(source) {
    return source.findAll((n) => "reactions" in n && n.reactions.length > 0).length > 0 || source.reactions.length > 0;
  }
  function layout(flow, key, normalIndex, normalHeight) {
    if (flow.id === 7 && key === "target") return { x: 1750, y: normalHeight + 300 };
    if (flow.id === 8 && key === "delivery") return { x: 50, y: normalHeight + 300 };
    if (flow.id === 8 && key === "recovered") return { x: 600, y: normalHeight + 300 };
    return { x: 50 + normalIndex * (flow.id === 8 ? 540 : 1710), y: 115 };
  }
  function setupStaticSections(page, font) {
    assertTarget(page);
    const principles = pageSection(page, "00 \u2014 Prototype Principles", 0, 0, 1600, 410);
    const principlesName = "3E / Principles / Summary";
    if (!principles.children.some((n) => n.name === principlesName)) {
      annotation(
        page,
        principles,
        principlesName,
        "03D is the canonical visual source. 03E contains prototype copies. No feature or backend implementation is claimed. Interactions demonstrate intended UX only. M12 Resume and M13 ready Forecast remain TARGET. OUTCOME_UNKNOWN requires reconciliation without blind retry. Message retry never replays a business mutation.",
        35,
        60,
        1490,
        font
      );
    }
    pageSection(page, "09 \u2014 Prototype Validation", 0, 2e4, 1600, 240);
  }
  async function buildFlow(id) {
    const flow = FLOWS.find((f) => f.id === id);
    if (!flow) throw new Error(`Unknown flow ${id}.`);
    const graph = graphErrors(flow);
    if (graph.length) throw new Error(`Unsafe flow specification: ${graph.join("; ")}`);
    const inspection = await inspectSources();
    if (inspection.issues.length && id !== 2 && id !== 3 && id !== 4 && id !== 5 && id !== 6 && id !== 7 && id !== 8) throw new Error(`03D source sections invalid: ${inspection.issues.join("; ")}. Nothing was changed.`);
    const sources = /* @__PURE__ */ new Map();
    for (const item of flow.frames) {
      const result = inspection.findings.find((f) => f.key === item.source);
      if (!result || result.status !== "FOUND") throw new Error(`03D preflight ${item.source}: ${result?.status ?? "MISSING"}. Nothing was changed.`);
      sources.set(item.key, result.exactFrames[0]);
    }
    if (id !== 1 && id !== 2 && id !== 3 && id !== 4 && id !== 5 && id !== 6 && id !== 7 && id !== 8) for (const edge of flow.edges) sourceControlCheck(sources.get(edge.from), edge.control);
    if (id !== 1 && id !== 2 && id !== 3 && id !== 4 && id !== 5 && id !== 6 && id !== 7 && id !== 8) for (const source of sources.values()) {
      if (sourceHasReactions(source)) throw new Error(`${source.name} already has source reactions. Refusing to clone cross-page links.`);
    }
    if (!sources.values().next().value?.setReactionsAsync) throw new Error("Prototype reaction API unavailable. Nothing was changed.");
    const font = await loadAnnotationFont();
    const existingPage = exactPage(TARGET_PAGE);
    if (figma.root.children.filter((p) => p.name === TARGET_PAGE).length > 1) throw new Error(`Duplicate ${TARGET_PAGE} pages. Nothing was changed.`);
    if (existingPage) await existingPage.loadAsync();
    const existingSection = existingPage?.children.find((n) => n.name === flowSectionName(id));
    if (existingSection && existingSection.type !== "SECTION") throw new Error("03E flow section has wrong type. Nothing was changed.");
    for (const name of ["00 \u2014 Prototype Principles", "09 \u2014 Prototype Validation"]) {
      const matches = existingPage?.children.filter((n) => n.name === name) ?? [];
      if (matches.length > 1 || matches.length === 1 && matches[0].type !== "SECTION") throw new Error(`Invalid 03E section ${name}. Nothing was changed.`);
    }
    const page = existingPage ?? figma.createPage();
    if (!existingPage) page.name = TARGET_PAGE;
    await figma.setCurrentPageAsync(page);
    assertTarget(page);
    if (id === 1) {
      const result = await buildProductAvailability(page, flow, sources, font);
      setupStaticSections(page, font);
      return result;
    }
    if (id === 2) {
      const result = await buildPurchaseSuccess(page, sources, font);
      setupStaticSections(page, font);
      return result;
    }
    if (id === 3) {
      const result = await buildReservationFailure(page, sources, font);
      setupStaticSections(page, font);
      return result;
    }
    if (id === 4) {
      const result = await buildSupportSalesHandoff(page, sources, font);
      setupStaticSections(page, font);
      return result;
    }
    if (id === 5) {
      const result = await buildUnknownEscalation(page, sources, font);
      setupStaticSections(page, font);
      return result;
    }
    if (id === 6) {
      const result = await buildHumanResumeTarget(page, sources, font);
      setupStaticSections(page, font);
      return result;
    }
    if (id === 7) {
      const result = await buildAnalyticsForecasts(page, sources, font);
      setupStaticSections(page, font);
      return result;
    }
    if (id === 8) {
      const result = await buildCustomerWebChat(page, sources, font);
      setupStaticSections(page, font);
      return result;
    }
    const previous = existingSection ? inspectOwned(existingSection, flow) : [];
    const sectionWasNew = !existingSection;
    let section;
    const staged = [];
    try {
      section = pageSection(page, flowSectionName(id), 0, 400 + id * 2200, 2300, 1500);
      const clones = /* @__PURE__ */ new Map();
      let normalIndex = 0;
      let normalHeight = 900;
      for (const item of flow.frames) {
        assertTarget(page);
        const source = sources.get(item.key);
        const clone = source.clone();
        clone.name = `STAGING / ${cloneName(id, item.key)}`;
        section.appendChild(clone);
        staged.push(clone);
        clones.set(item.key, clone);
        if (!item.targetOnly && !(flow.id === 8 && ["delivery", "recovered"].includes(item.key))) normalHeight = Math.max(normalHeight, clone.height);
      }
      for (const item of flow.frames) {
        const clone = clones.get(item.key);
        const isBranch = item.targetOnly || flow.id === 8 && ["delivery", "recovered"].includes(item.key);
        const at = layout(flow, item.key, normalIndex, normalHeight);
        clone.x = at.x;
        clone.y = at.y;
        if (!isBranch) normalIndex++;
        if (visualSignature(clone) !== visualSignature(sources.get(item.key))) throw new Error(`Visual clone mismatch: ${item.source}.`);
      }
      for (const edge of flow.edges) {
        assertTarget(page);
        const from = findUniqueControl(clones.get(edge.from), edge.control);
        const to = clones.get(edge.to);
        await from.setReactionsAsync([navigateReaction(to.id)]);
        const action = from.reactions[0]?.actions?.[0];
        if (!action || action.type !== "NODE" || action.destinationId !== to.id) throw new Error(`Reaction write did not persist: ${edge.from} \u2192 ${edge.to}.`);
      }
      const prefix = `3E / Flow ${String(id).padStart(2, "0")}`;
      const first = clones.get(flow.frames[0].key);
      const normalFrames = flow.frames.filter((f) => !f.targetOnly);
      const endFrame = clones.get(normalFrames[normalFrames.length - 1].key);
      staged.push(annotation(page, section, `STAGING / ${prefix} / START`, `START \u2014 Flow ${id}: ${flow.title}`, first.x, 35, 1450, font));
      staged.push(annotation(page, section, `STAGING / ${prefix} / END`, `END \u2014 Flow ${id} / scenario specimen`, endFrame.x, endFrame.y + endFrame.height + 30, 1450, font));
      flow.notes.forEach((note, i) => staged.push(annotation(page, section, `STAGING / ${prefix} / Note ${i + 1}`, note, 50, normalHeight + 160 + i * 60, 1460, font)));
      let noteIndex = 0;
      for (const edge of flow.edges) if (edge.note) {
        noteIndex++;
        const from = clones.get(edge.from);
        staged.push(annotation(page, section, `STAGING / ${prefix} / Edge Note ${noteIndex}`, edge.note, from.x, from.y + from.height + 65, Math.min(from.width, 1450), font));
      }
      const maxX = Math.max(...section.children.map((n) => "width" in n ? n.x + n.width : 0));
      const maxY = Math.max(...section.children.map((n) => "height" in n ? n.y + n.height : 0));
      section.resize(Math.max(1600, maxX + 80), Math.max(750, maxY + 90));
      setupStaticSections(page, font);
      for (const old of previous) {
        assertTarget(page);
        old.remove();
      }
      for (const node of staged) node.name = node.name.replace(/^STAGING \/ /, "");
      return `Built ${flowSectionName(id)}: ${flow.frames.length} approved 03D clones; ${flow.edges.length} real reactions. Formal start-point API is read-only; START annotation added.`;
    } catch (error) {
      for (const node of staged) if (!node.removed) {
        assertTarget(page);
        node.remove();
      }
      if (sectionWasNew && section && !section.removed && section.children.length === 0) {
        assertTarget(page);
        section.remove();
      }
      throw error;
    }
  }

  // src/validator.ts
  async function validatePrototype() {
    const lines = ["PHASE 3E INTERACTIVE PROTOTYPE VALIDATION", `Page: ${TARGET_PAGE}`];
    let passed = true;
    let incomplete = false;
    let broken = 0;
    const sourceInspection = await inspectSources();
    const sourcePass = sourceInspection.issues.length === 0 && sourceInspection.findings.length > 0 && sourceInspection.findings.every((f) => f.status === "FOUND");
    lines.push(`03D source inspection: ${sourcePass ? "PASS" : "FAIL"}`);
    if (!sourcePass) passed = false;
    const api = await inspectPrototypeApi();
    lines.push(`Prototype API: ${api.includes("Create reactions: SUPPORTED") ? "PARTIAL (reactions supported; formal starts read-only)" : "BLOCKED"}`);
    if (!api.includes("Create reactions: SUPPORTED")) passed = false;
    const page = exactPage(TARGET_PAGE);
    if (!page) {
      lines.push("03E page: MISSING", "Overall: FAIL", "Scope: structure/reaction checks only; no backend implementation claim.");
      return { report: lines.join("\n"), passed: false };
    }
    await page.loadAsync();
    const principles = page.children.filter((n) => n.name === "00 \u2014 Prototype Principles" && n.type === "SECTION");
    const validation = page.children.filter((n) => n.name === "09 \u2014 Prototype Validation" && n.type === "SECTION");
    const sectionNames = new Set(page.children.map((n) => n.name));
    const structurePass = principles.length === 1 && validation.length === 1;
    lines.push(`Principles/Validation sections: ${structurePass ? "PASS" : "FAIL"}`);
    if (!structurePass) passed = false;
    const sourceMap = new Map(sourceInspection.findings.map((f) => [f.key, f.exactFrames[0]]));
    let visualPass = true;
    for (const flow of FLOWS) {
      const issues = graphErrors(flow);
      const sectionMatches = page.children.filter((n) => n.name === flowSectionName(flow.id));
      if (sectionMatches.length === 0) {
        lines.push(`Flow ${flow.id} \u2014 ${flow.title}: NOT BUILT`);
        incomplete = true;
        continue;
      }
      if (sectionMatches.length !== 1 || sectionMatches[0].type !== "SECTION") {
        lines.push(`Flow ${flow.id} \u2014 ${flow.title}: FAIL (section missing/duplicate/wrong type)`);
        passed = false;
        continue;
      }
      const section = sectionMatches[0];
      let flowTwoChecks = [];
      let flowTwoStrategy = null;
      let flowThreeChecks = [];
      let flowThreeStrategy = null;
      let flowThreeBroken = 0;
      let flowFourChecks = [];
      let flowFourStrategies = { request: null, accept: null };
      let flowFourBroken = 0;
      let flowFiveChecks = [];
      let flowFiveStrategy = null;
      let flowFiveBroken = 0;
      let flowSixChecks = [];
      let flowSixStrategy = null;
      let flowSixBroken = 0;
      let flowSevenChecks = [];
      let flowSevenStrategies = { open: null, back: null, target: "NON-INTERACTIVE SPECIMEN" };
      let flowSevenBroken = 0;
      let flowEightChecks = [];
      let flowEightRetry = null;
      let flowEightBroken = 0;
      const clones = /* @__PURE__ */ new Map();
      for (const item of flow.frames) {
        const exact = section.children.filter((n) => n.name === cloneName(flow.id, item.key));
        if (exact.length !== 1 || exact[0].type !== "FRAME") issues.push(`${item.key}: clone missing/duplicate/wrong type`);
        else clones.set(item.key, exact[0]);
      }
      for (const name of ownedNames(flow)) if (section.children.filter((n) => n.name === name).length > 1) issues.push(`Duplicate plugin-owned ${name}`);
      const prefix = `3E / Flow ${String(flow.id).padStart(2, "0")}`;
      if (flow.id !== 1 && flow.id !== 3 && flow.id !== 4 && flow.id !== 5 && flow.id !== 6 && flow.id !== 7 && flow.id !== 8 && (section.children.filter((n) => n.name === `${prefix} / START`).length !== 1 || section.children.filter((n) => n.name === `${prefix} / END`).length !== 1)) issues.push("START/END annotation missing");
      if (clones.size === flow.frames.length) {
        for (const item of flow.frames) {
          const source = sourceMap.get(item.source);
          if (!source || visualSignature(clones.get(item.key)) !== visualSignature(source)) {
            issues.push(`Visual-source preservation failed: ${item.key}`);
            visualPass = false;
          }
        }
        if (flow.id === 1) {
          const one = await checkFlowOne(section, /* @__PURE__ */ new Map([["default", sourceMap.get("conversationDefault")], ["support", sourceMap.get("conversationSupport")]]));
          issues.push(...one.issues);
          broken += one.broken;
        } else if (flow.id === 2) {
          const two = await checkFlowTwo(section, new Map(flow.frames.map((item) => [item.key, sourceMap.get(item.source)])));
          issues.push(...two.issues);
          broken += two.broken;
          flowTwoChecks = two.checks;
          flowTwoStrategy = two.strategy;
        } else if (flow.id === 3) {
          const three = await checkFlowThree(section, new Map(flow.frames.map((item) => [item.key, sourceMap.get(item.source)])));
          issues.push(...three.issues);
          broken += three.broken;
          flowThreeChecks = three.checks;
          flowThreeStrategy = three.strategy;
          flowThreeBroken = three.broken;
        } else if (flow.id === 4) {
          const four = await checkFlowFour(section, new Map(flow.frames.map((item) => [item.key, sourceMap.get(item.source)])));
          issues.push(...four.issues);
          broken += four.broken;
          flowFourChecks = four.checks;
          flowFourStrategies = four.strategies;
          flowFourBroken = four.broken;
        } else if (flow.id === 5) {
          const five = await checkFlowFive(section, new Map(flow.frames.map((item) => [item.key, sourceMap.get(item.source)])));
          issues.push(...five.issues);
          broken += five.broken;
          flowFiveChecks = five.checks;
          flowFiveStrategy = five.strategy;
          flowFiveBroken = five.broken;
        } else if (flow.id === 6) {
          const six = await checkFlowSix(section, new Map(flow.frames.map((item) => [item.key, sourceMap.get(item.source)])));
          issues.push(...six.issues);
          broken += six.broken;
          flowSixChecks = six.checks;
          flowSixStrategy = six.strategy;
          flowSixBroken = six.broken;
        } else if (flow.id === 7) {
          const seven = await checkFlowSeven(section, new Map(flow.frames.map((item) => [item.key, sourceMap.get(item.source)])));
          issues.push(...seven.issues);
          broken += seven.broken;
          flowSevenChecks = seven.checks;
          flowSevenStrategies = seven.strategies;
          flowSevenBroken = seven.broken;
        } else if (flow.id === 8) {
          const eight = await checkFlowEight(section, new Map(flow.frames.map((item) => [item.key, sourceMap.get(item.source)])));
          issues.push(...eight.issues);
          broken += eight.broken;
          flowEightChecks = eight.checks;
          flowEightRetry = eight.retryStrategy;
          flowEightBroken = eight.broken;
        } else for (const edge of flow.edges) {
          try {
            const control3 = findUniqueControl(clones.get(edge.from), edge.control);
            const reactions = control3.reactions;
            const valid = reactions.length === 1 && reactions[0].trigger?.type === "ON_CLICK" && reactions[0].actions?.length === 1 && reactions[0].actions[0].type === "NODE" && reactions[0].actions[0].navigation === "NAVIGATE" && reactions[0].actions[0].destinationId === clones.get(edge.to).id;
            if (!valid) {
              issues.push(`Missing/wrong reaction ${edge.from} \u2192 ${edge.to}`);
              broken++;
            }
          } catch (error) {
            issues.push(String(error));
            broken++;
          }
        }
        if (flow.id !== 1 && flow.id !== 2 && flow.id !== 3 && flow.id !== 4 && flow.id !== 5 && flow.id !== 6 && flow.id !== 7 && flow.id !== 8) {
          const permitted = /* @__PURE__ */ new Map();
          for (const edge of flow.edges) {
            try {
              permitted.set(findUniqueControl(clones.get(edge.from), edge.control).id, clones.get(edge.to).id);
            } catch {
            }
          }
          for (const clone of clones.values()) {
            for (const node of [clone, ...clone.findAll((n) => "reactions" in n)]) {
              for (const reaction of node.reactions) for (const action of reaction.actions ?? []) {
                if (action.type !== "NODE" || !action.destinationId || permitted.get(node.id) !== action.destinationId) {
                  issues.push(`Prohibited/broken destination on ${node.name}`);
                  broken++;
                }
              }
            }
          }
        }
      }
      lines.push(`Flow ${flow.id} \u2014 ${flow.title}: ${issues.length ? "FAIL" : "PASS"}`);
      if (flow.id === 2) {
        for (const check of flowTwoChecks) lines.push(`  ${check.name}: ${check.passed ? "PASS" : "FAIL"}`);
        lines.push("  Customer confirmation \u2192 Processing source: PROTOTYPE CONTROL");
        lines.push("  Processing \u2192 Confirmed Result source: PROTOTYPE CONTROL");
        lines.push(`  Open Order source: ${flowTwoStrategy ?? "UNRESOLVED"}`);
      }
      if (flow.id === 3) {
        for (const check of flowThreeChecks) lines.push(`  ${check.name}: ${check.passed ? "PASS" : "FAIL"}`);
        lines.push(`  Open Order source: ${flowThreeStrategy ?? "UNRESOLVED"}`);
        lines.push(`  Flow 3 broken destinations: ${flowThreeBroken}`);
      }
      if (flow.id === 4) {
        for (const check of flowFourChecks) lines.push(`  ${check.name}: ${check.passed ? "PASS" : "FAIL"}`);
        lines.push(`  Support \u2192 Handoff source: ${flowFourStrategies.request ?? "UNRESOLVED"}`);
        lines.push(`  Handoff \u2192 Sales source: ${flowFourStrategies.accept ?? "UNRESOLVED"}`);
        lines.push(`  Flow 4 broken destinations: ${flowFourBroken}`);
      }
      if (flow.id === 5) {
        for (const check of flowFiveChecks) lines.push(`  ${check.name}: ${check.passed ? "PASS" : "FAIL"}`);
        lines.push(`  Open Escalation source: ${flowFiveStrategy ?? "UNRESOLVED"}`);
        lines.push(`  Flow 5 broken destinations: ${flowFiveBroken}`);
      }
      if (flow.id === 6) {
        for (const check of flowSixChecks) lines.push(`  ${check.name}: ${check.passed ? "PASS" : "FAIL"}`);
        lines.push(`  Human Decision progression source: ${flowSixStrategy ?? "UNRESOLVED"}`);
        lines.push("  Controlled Resume request source: PROTOTYPE CONTROL");
        lines.push(`  Flow 6 broken destinations: ${flowSixBroken}`);
      }
      if (flow.id === 7) {
        for (const check of flowSevenChecks) lines.push(`  ${check.name}: ${check.passed ? "PASS" : "FAIL"}`);
        lines.push(`  Analytics \u2192 Forecasts source: ${flowSevenStrategies.open ?? "UNRESOLVED"}`);
        lines.push(`  Forecasts \u2192 Analytics source: ${flowSevenStrategies.back ?? "UNRESOLVED"}`);
        lines.push(`  TARGET specimen entry: ${flowSevenStrategies.target}`);
        lines.push(`  Flow 7 broken destinations: ${flowSevenBroken}`);
      }
      if (flow.id === 8) {
        for (const check of flowEightChecks) lines.push(`  ${check.name}: ${check.passed ? "PASS" : "FAIL"}`);
        const eightPass = (name) => flowEightChecks.some((check) => check.name === name && check.passed);
        lines.push(`  Confirm order source: ${eightPass("Explicit Confirm order") && eightPass("Confirm order \u2192 Processing") ? "PRODUCT CONTROL" : "UNRESOLVED"}`);
        lines.push(`  Processing \u2192 Confirmed Result source: ${eightPass("Processing \u2192 Confirmed Result") ? "PROTOTYPE CONTROL" : "UNRESOLVED"}`);
        lines.push(`  Delivery failure branch source: ${eightPass("Message-delivery branch") && eightPass("Confirmed Result \u2192 Message Delivery Failure") ? "PROTOTYPE CONTROL" : "UNRESOLVED"}`);
        lines.push(`  Message retry source: ${flowEightRetry ?? "UNRESOLVED"}`);
        lines.push(`  Flow 8 broken destinations: ${flowEightBroken}`);
      }
      for (const issue of issues) lines.push(`  - ${issue}`);
      if (issues.length) passed = false;
    }
    const protectedPass = PROTECTED_PAGES.every((n) => Boolean(exactPage(n)));
    lines.push(`Source-page protection: ${protectedPass ? "PASS (guards and page presence)" : "FAIL"}`);
    if (!protectedPass) passed = false;
    lines.push(`Visual-source preservation: ${visualPass ? "PASS" : "FAIL"}`);
    lines.push(`Broken/prohibited destinations: ${broken}`);
    lines.push(`Overall: ${passed ? incomplete ? "INCOMPLETE" : "PASS" : "FAIL"}`);
    lines.push("Scope: structure, clone equivalence and prototype reactions; not backend execution, usability or manual visual approval.");
    return { report: lines.join("\n"), passed: passed && !incomplete };
  }

  // src/code.ts
  var lastReport = "No validation report yet. Run Validate Prototype first.";
  var busy = false;
  figma.showUI(__html__, { width: 560, height: 740, themeColors: true });
  figma.ui.onmessage = async (message) => {
    if (busy) return;
    busy = true;
    figma.ui.postMessage({ type: "busy", value: true });
    try {
      if (message.type === "inspect-sources") {
        figma.ui.postMessage({ type: "report", text: sourceReport(await inspectSources()) });
      } else if (message.type === "inspect-api") {
        figma.ui.postMessage({ type: "report", text: await inspectPrototypeApi() });
      } else if (message.type === "build-flow") {
        figma.ui.postMessage({ type: "report", text: await buildFlow(message.id) });
      } else if (message.type === "validate") {
        const result = await validatePrototype();
        lastReport = result.report;
        figma.ui.postMessage({ type: "report", text: result.report });
      } else if (message.type === "copy-report") {
        figma.ui.postMessage({ type: "copy", text: lastReport });
      }
    } catch (error) {
      figma.ui.postMessage({ type: "report", text: `BLOCKED: ${error instanceof Error ? error.message : String(error)}
No protected page was written.` });
    } finally {
      busy = false;
      figma.ui.postMessage({ type: "busy", value: false });
    }
  };
})();

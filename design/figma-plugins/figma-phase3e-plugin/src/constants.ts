export const FILE_KEY = 'OFXTN83nFl3RqukrEYQrFy';
export const TARGET_PAGE = '03E — Interactive Prototype';
export const SOURCE_PAGE = '03D — High-Fidelity Screens';
export const PROTECTED_PAGES = [
  '03A — Low-Fi Wireframes',
  '03B — UX Review & Revisions',
  '03C — Design System',
  SOURCE_PAGE,
] as const;

export type SourceKey =
  | 'conversationDefault' | 'conversationSupport' | 'conversationSales' | 'conversationHandoff'
  | 'conversationConfirmation' | 'conversationProcessing' | 'conversationConfirmed'
  | 'conversationFailure' | 'conversationUnknown' | 'escalationUnknown'
  | 'escalationDecision' | 'escalationResume' | 'orderConfirmed' | 'orderFailed'
  | 'analyticsValid' | 'forecastNotReady' | 'forecastTarget'
  | 'chatConfirmation' | 'chatProcessing' | 'chatConfirmed' | 'chatDelivery';

export const SOURCES: Record<SourceKey, { section: string; name: string }> = {
  conversationDefault: { section: '02 — Conversations', name: '3D / Conversations / Default' },
  conversationSupport: { section: '02 — Conversations', name: '3D / Conversations / Support Active' },
  conversationSales: { section: '02 — Conversations', name: '3D / Conversations / Sales Active' },
  conversationHandoff: { section: '02 — Conversations', name: '3D / Conversations / Support to Sales Handoff' },
  conversationConfirmation: { section: '02 — Conversations', name: '3D / Conversations / Awaiting Confirmation' },
  conversationProcessing: { section: '02 — Conversations', name: '3D / Conversations / Processing' },
  conversationConfirmed: { section: '02 — Conversations', name: '3D / Conversations / Confirmed Result' },
  conversationFailure: { section: '02 — Conversations', name: '3D / Conversations / Known Failure' },
  conversationUnknown: { section: '02 — Conversations', name: '3D / Conversations / OUTCOME_UNKNOWN' },
  escalationUnknown: { section: '03 — Escalations', name: '3D / Escalations / OUTCOME_UNKNOWN' },
  escalationDecision: { section: '03 — Escalations', name: '3D / Escalations / Awaiting Decision' },
  escalationResume: { section: '03 — Escalations', name: '3D / Escalations / Resume Pending' },
  orderConfirmed: { section: '04 — Orders', name: '3D / Orders / Reservation Confirmed' },
  orderFailed: { section: '04 — Orders', name: '3D / Orders / Reservation Failed' },
  analyticsValid: { section: '06 — Analytics', name: '3D / Analytics / Valid' },
  forecastNotReady: { section: '07 — Forecasts', name: '3D / Forecasts / MODEL_NOT_READY' },
  forecastTarget: { section: '07 — Forecasts', name: '3D / Forecasts / TARGET Ready' },
  chatConfirmation: { section: '05 — Customer Web Chat', name: '3D / Web Chat / Confirmation Required' },
  chatProcessing: { section: '05 — Customer Web Chat', name: '3D / Web Chat / Processing' },
  chatConfirmed: { section: '05 — Customer Web Chat', name: '3D / Web Chat / Confirmed Result' },
  chatDelivery: { section: '05 — Customer Web Chat', name: '3D / Web Chat / Message Delivery Failure' },
};

export type Edge = { from: string; to: string; control: string; note?: string };
export type FlowSpec = {
  id: number;
  title: string;
  frames: readonly { key: string; source: SourceKey; label: string; targetOnly?: boolean }[];
  edges: readonly Edge[];
  notes: readonly string[];
};

export const FLOW1_BOARD = {
  start: { name: '3E / Flow 01 / START', text: 'START — Flow 1: Product Availability' },
  step1: { name: '3E / Flow 01 / STEP 1', text: 'STEP 1 — Customer asks about product availability' },
  step1Note: { name: '3E / Flow 01 / STEP 1 Note', text: 'The conversation contains a product-availability request.' },
  continue: { name: '3E / Flow 01 / Continue Scenario', marker: 'PROTOTYPE CONTROL', text: 'Continue scenario → Support checks verified context' },
  step2: { name: '3E / Flow 01 / STEP 2', text: 'STEP 2 — Support uses verified Product + Inventory context' },
  productBoundary: { name: '3E / Flow 01 / Product Boundary', text: 'Product exists ≠ Inventory available' },
  inventoryBoundary: { name: '3E / Flow 01 / Inventory Boundary', text: 'Observed inventory ≠ promise of live stock' },
  end: { name: '3E / Flow 01 / END', text: 'END — Flow 1\nSupport Active is the final scenario state.' },
  legacyNote: '3E / Flow 01 / Note 1',
} as const;

export const FLOW2_BOARD = {
  start: { name: '3E / Flow 02 / START', text: 'START — Flow 2: Purchase Success' },
  step1: { name: '3E / Flow 02 / STEP 1', text: 'STEP 1 — Awaiting explicit customer confirmation' },
  proposalBoundary: { name: '3E / Flow 02 / Proposal Boundary', text: 'Proposal ≠ execution. The proposed business action has not executed yet.' },
  confirmation: { name: '3E / Flow 02 / Customer Confirmation Received', marker: 'PROTOTYPE CONTROL', text: 'Customer confirmation received → Continue' },
  step2: { name: '3E / Flow 02 / STEP 2', text: 'STEP 2 — Authorized business action is processing' },
  processingNote: { name: '3E / Flow 02 / Processing Boundary', text: 'This prototype shows intended UX progression, not backend execution. Processing ≠ confirmed result.' },
  processingComplete: { name: '3E / Flow 02 / Business Result Confirmed', marker: 'PROTOTYPE CONTROL', text: 'Continue scenario → Business result confirmed' },
  step3: { name: '3E / Flow 02 / STEP 3', text: 'STEP 3 — Business result confirmed' },
  confirmedNote: { name: '3E / Flow 02 / Confirmed Facts', text: 'Order created and Reservation confirmed are independently trusted facts in the approved source.' },
  orderSource: { name: '3E / Flow 02 / Open Order Source', text: 'PRODUCT CONTROL — Open Order record ↗' },
  orderControl: { name: '3E / Flow 02 / Open Resulting Order', marker: 'PROTOTYPE CONTROL', text: 'Open resulting Order' },
  step4: { name: '3E / Flow 02 / STEP 4', text: 'STEP 4 — Order created; reservation confirmed' },
  orderBoundary: { name: '3E / Flow 02 / Order Boundary', text: 'Order State ≠ Reservation State. Reservation confirmation is a separate business fact.' },
  deliveryBoundary: { name: '3E / Flow 02 / Delivery Boundary', text: 'Message delivery ≠ business effect. Communication failure must not replay Order or reservation effects.' },
  backendBoundary: { name: '3E / Flow 02 / Prototype Boundary', text: 'Prototype only: no create_order or reserve_inventory execution, live provider operation, M08 completion, or backend implementation is claimed.' },
  end: { name: '3E / Flow 02 / END', text: 'END — Flow 2\nReservation Confirmed is the final scenario state.' },
} as const;

export const FLOW3_BOARD = {
  start: { name: '3E / Flow 03 / START', text: 'START — Flow 3: Reservation Failure' },
  step1: { name: '3E / Flow 03 / STEP 1', text: 'STEP 1 — Reservation failure is known' },
  confirmedFailure: { name: '3E / Flow 03 / Confirmed Failure', text: 'The system has a confirmed failure result. The Order record may already exist.' },
  knownBoundary: { name: '3E / Flow 03 / Known Boundary', text: 'Known Failure ≠ OUTCOME_UNKNOWN. This reservation result is known, not uncertain.' },
  noReconciliation: { name: '3E / Flow 03 / No Reconciliation', text: 'No reconciliation is required for a known failed reservation.' },
  orderSource: { name: '3E / Flow 03 / Open Order Source', text: 'PRODUCT CONTROL — Open Order record ↗' },
  orderControl: { name: '3E / Flow 03 / Open Resulting Order', marker: 'PROTOTYPE CONTROL', text: 'Open resulting Order' },
  step2: { name: '3E / Flow 03 / STEP 2', text: 'STEP 2 — Order exists; reservation failed' },
  orderBoundary: { name: '3E / Flow 03 / Order Boundary', text: 'Order State ≠ Reservation State. Order creation does not imply inventory reservation. Known reservation failure is independently represented.' },
  inventoryBoundary: { name: '3E / Flow 03 / Inventory Boundary', text: 'Product exists ≠ Inventory available. Unavailable inventory ≠ zero stock. Dependency unavailable ≠ zero stock. No current stock value is claimed here.' },
  recovery: { name: '3E / Flow 03 / Safe Recovery', text: 'SAFE RECOVERY\nKnown failure allows an authorized next action. Review current inventory and choose an authorized recovery path. No reconciliation is needed because the reservation result is known.' },
  end: { name: '3E / Flow 03 / END', text: 'END — Flow 3\nReservation Failed is the final scenario state. Recovery requires a new authorized action; the failed reservation itself is not replayed blindly.' },
} as const;

export const FLOW4_BOARD = {
  start: { name: '3E / Flow 04 / START', text: 'START — Flow 4: Support → Sales Handoff' },
  step1: { name: '3E / Flow 04 / STEP 1', text: 'STEP 1 — Support owns the conversation' },
  supportNote: { name: '3E / Flow 04 / Support Ownership', text: 'Support is the current handler and works only within Support-authorized scope. Ownership ≠ authorization.' },
  requestSource: { name: '3E / Flow 04 / Handoff Request Source', text: 'PRODUCT CONTROL — Request Sales handoff' },
  requestControl: { name: '3E / Flow 04 / Request Sales Handoff', marker: 'PROTOTYPE CONTROL', text: 'Request Sales handoff → Continue' },
  step2: { name: '3E / Flow 04 / STEP 2', text: 'STEP 2 — Responsibility is handed from Support to Sales' },
  handlerBoundary: { name: '3E / Flow 04 / Handler Boundary', text: 'Previous handler: Support. Next handler: Sales. Handoff changes responsibility, not authorization.' },
  contextNote: { name: '3E / Flow 04 / Verified Context', text: 'Reason for handoff and verified Customer, Conversation, Order, and Inventory/freshness context remain available. Sales reviews current facts and remaining work.' },
  permissionBoundary: { name: '3E / Flow 04 / Permission Boundary', text: 'Handoff ≠ Permission Transfer. The trusted execution layer independently enforces authorization; no restricted mutation is granted by handoff.' },
  acceptSource: { name: '3E / Flow 04 / Sales Acceptance Source', text: 'PRODUCT CONTROL — Accept Sales handoff' },
  acceptControl: { name: '3E / Flow 04 / Sales Becomes Handler', marker: 'PROTOTYPE CONTROL', text: 'Continue scenario → Sales becomes current handler' },
  step3: { name: '3E / Flow 04 / STEP 3', text: 'STEP 3 — Sales is now the current handler' },
  salesNote: { name: '3E / Flow 04 / Sales Ownership', text: 'The conversation context is preserved, but Sales actions remain limited to Sales-authorized capabilities. Intended UX only; no backend execution is claimed.' },
  authorizationNote: { name: '3E / Flow 04 / Authorization Boundary', text: 'Current Handler changed. Permissions were re-evaluated, not transferred.' },
  end: { name: '3E / Flow 04 / END', text: 'END — Flow 4\nSales Active is the final scenario state. Ownership changed from Support to Sales. Authorization remains independently enforced.' },
} as const;

export const FLOW5_BOARD = {
  start: { name: '3E / Flow 05 / START', text: 'START — Flow 5: OUTCOME_UNKNOWN → Escalation' },
  step1: { name: '3E / Flow 05 / STEP 1', text: 'STEP 1 — Business effect is uncertain' },
  uncertain: { name: '3E / Flow 05 / Uncertain Effect', text: 'A mutation may have committed, but confirmation is insufficient. The persisted effect may or may not exist; neither success nor failure is asserted.' },
  unknownBoundary: { name: '3E / Flow 05 / Unknown Boundary', text: 'OUTCOME_UNKNOWN ≠ Known Failure. A known failed result permits authorized recovery; an uncertain result requires reconciliation first.' },
  noBlindRetry: { name: '3E / Flow 05 / No Blind Retry', text: 'Do not blindly retry the mutation.' },
  reconcileFirst: { name: '3E / Flow 05 / Reconcile First', text: 'Reconcile authoritative business state before any new mutation attempt.' },
  escalationSource: { name: '3E / Flow 05 / Open Escalation Source', text: 'PRODUCT CONTROL — Open Escalation' },
  escalationControl: { name: '3E / Flow 05 / Open Reconciliation Escalation', marker: 'PROTOTYPE CONTROL', text: 'Open reconciliation escalation' },
  step2: { name: '3E / Flow 05 / STEP 2', text: 'STEP 2 — Reconciliation required before retry' },
  reconciliation: { name: '3E / Flow 05 / Reconciliation Required', text: 'RECONCILIATION REQUIRED\nDetermine the actual persisted business state before authorizing any repeat mutation. This is a safety check, not a retry or a new mutation.' },
  knownBoundary: { name: '3E / Flow 05 / Known Failure Distinction', text: 'Known Failure: result known; authorized recovery may be possible. OUTCOME_UNKNOWN: result uncertain; reconciliation required.' },
  e02Boundary: { name: '3E / Flow 05 / E02 Distinction', text: 'E02 restriction ≠ OUTCOME_UNKNOWN. E02 is a known policy/capability restriction; OUTCOME_UNKNOWN is an uncertain business effect.' },
  m12Boundary: { name: '3E / Flow 05 / M12 Boundary', text: 'Flow 5 ends at reconciliation / human review. No automatic replay or resume follows. Controlled Resume belongs to Flow 6 and remains TARGET M12.' },
  end: { name: '3E / Flow 05 / END', text: 'END — Flow 5\nReconciliation / human review is the final scenario state. Any later controlled Resume is demonstrated separately in Flow 6 and remains TARGET M12.' },
} as const;

export const FLOW6_BOARD = {
  start: { name: '3E / Flow 06 / START', text: 'START — Flow 6: Human Decision / Resume TARGET' },
  targetBanner: { name: '3E / Flow 06 / TARGET M12 Banner', text: 'TARGET M12 — NOT CURRENTLY IMPLEMENTED' },
  step1: { name: '3E / Flow 06 / STEP 1', text: 'STEP 1 — Human reviews the Decision Context' },
  hierarchyNote: { name: '3E / Flow 06 / Decision Hierarchy', text: 'WHY AUTOMATION STOPPED → CONFIRMED FACTS → UNCERTAIN EFFECT → CONSTRAINTS → NEXT SAFE STEP → HUMAN DECISION' },
  decisionBoundary: { name: '3E / Flow 06 / Decision Boundary', text: 'Human Decision ≠ Mutation Execution. Selecting a decision records human intent; it does not execute or replay the original mutation.' },
  decisionSource: { name: '3E / Flow 06 / Decision Source', text: 'PRODUCT CONTROL — Approved human decision' },
  decisionControl: { name: '3E / Flow 06 / Human Decision Recorded', marker: 'PROTOTYPE CONTROL', text: 'Human decision recorded → Continue to revalidation' },
  gate: { name: '3E / Flow 06 / Revalidation Gate', marker: 'PROTOTYPE BOUNDARY — TARGET M12' },
  step2: { name: '3E / Flow 06 / STEP 2', text: 'STEP 2 — Revalidation required before controlled Resume request' },
  principal: { name: '3E / Flow 06 / Principal Check', text: 'Re-check current principal and case assignment.' },
  scope: { name: '3E / Flow 06 / Scope Check', text: 'Re-check business scope; approval does not inherit permissions.' },
  authorization: { name: '3E / Flow 06 / Authorization Check', text: 'Re-check authorization in the trusted executor; a visible action does not grant access.' },
  state: { name: '3E / Flow 06 / State Check', text: 'Re-check current business state and relevant facts before any request.' },
  revision: { name: '3E / Flow 06 / Revision Check', text: 'Re-check revision/version and stale context. Old approval is insufficient if facts changed.' },
  replayBoundary: { name: '3E / Flow 06 / Replay Boundary', text: 'Revalidation ≠ Replay. Do not replay the old mutation payload merely because a human approved continuation.' },
  unknownBoundary: { name: '3E / Flow 06 / Unknown Prerequisite', text: 'Any OUTCOME_UNKNOWN effect must be reconciled before controlled Resume is considered.' },
  e02Boundary: { name: '3E / Flow 06 / E02 Boundary', text: 'Controlled Resume does not override E02 or domain-policy restrictions. If still unauthorized, Resume must not proceed.' },
  resumeControl: { name: '3E / Flow 06 / Controlled Resume Request', marker: 'PROTOTYPE CONTROL — TARGET M12', text: 'Request controlled Resume — TARGET M12' },
  step3: { name: '3E / Flow 06 / STEP 3', text: 'STEP 3 — Controlled Resume request is pending' },
  targetNote: { name: '3E / Flow 06 / Target State', text: 'TARGET M12 is intended durable-resume UX, not a current production capability. No mutation is replayed and no new business effect is confirmed.' },
  currentTarget: { name: '3E / Flow 06 / Current vs Target', text: 'CURRENT: M12 durable human resume is not implemented. TARGET: Decision → Revalidation → Controlled Resume request.' },
  end: { name: '3E / Flow 06 / END', text: 'END — Flow 6\nResume Pending — TARGET M12 is the final prototype state. No mutation replay or successful new business effect is demonstrated.' },
} as const;

export const FLOW7_BOARD = {
  start: { name: '3E / Flow 07 / CURRENT START', text: 'START — Flow 7 / CURRENT' },
  step1: { name: '3E / Flow 07 / STEP 1', text: 'STEP 1 — Historical Analytics' },
  analyticsBoundary: { name: '3E / Flow 07 / Analytics Boundary', text: 'Analytics = OBSERVED / HISTORICAL. Forecast = PREDICTED / FUTURE. Analytics shows ACTUAL historical values only; a missing observation is not zero. Valid Empty differs from Dependency Unavailable.' },
  openSource: { name: '3E / Flow 07 / Open Forecasts Source', text: 'PRODUCT CONTROL — Open Forecasts' },
  openControl: { name: '3E / Flow 07 / Open Forecasts Control', marker: 'PROTOTYPE CONTROL — CURRENT', text: 'Open Forecasts' },
  step2: { name: '3E / Flow 07 / STEP 2', text: 'STEP 2 — Forecast requested; validated model artifact not ready' },
  currentBanner: { name: '3E / Flow 07 / CURRENT Banner', text: 'CURRENT ENGINEERING STATE — MODEL_NOT_READY — NO PREDICTION PRODUCED' },
  notReadyBoundary: { name: '3E / Flow 07 / MODEL_NOT_READY Boundary', text: 'MODEL_NOT_READY: no validated forecast artifact exists. No prediction or zero forecast is produced; historical ACTUAL is not substituted. This differs from Valid Empty, Model Unavailable and TARGET Ready.' },
  returnSource: { name: '3E / Flow 07 / Return Source', text: 'PRODUCT CONTROL — Open Historical Analytics' },
  returnControl: { name: '3E / Flow 07 / Return Control', marker: 'PROTOTYPE CONTROL — CURRENT', text: 'Return to Historical Analytics' },
  currentEnd: { name: '3E / Flow 07 / CURRENT END', text: 'END — Flow 7 / CURRENT\nHistorical Analytics remains available although the model is not ready. No prediction was produced.' },
  targetBanner: { name: '3E / Flow 07 / TARGET Banner', text: 'TARGET PRODUCT UX — NOT CURRENTLY AVAILABLE — DESIGN SPECIMEN ONLY' },
  targetNote: { name: '3E / Flow 07 / TARGET Specimen', text: 'TARGET SPECIMEN — Forecasts TARGET Ready. Illustrative future UX only; no validated production forecast numbers or live M13 result.' },
  seriesBoundary: { name: '3E / Flow 07 / Actual Predicted Boundary', text: 'ACTUAL ≠ PREDICTED. ACTUAL is a solid historical series; CUTOFF is the last observed boundary; PREDICTED is a dashed future-only illustrative series. These are distinct data classes.' },
  currentTarget: { name: '3E / Flow 07 / Current vs Target', text: 'CURRENT: MODEL_NOT_READY; no validated forecast result exists. TARGET: TARGET Ready is illustrative future forecast UX, not the next operational step.' },
  m13Boundary: { name: '3E / Flow 07 / M13 Boundary', text: 'M13 remains not ready. TARGET Ready is an approved UX target, not evidence of a trained, validated or deployed forecast artifact, measured accuracy, or completed ForecastRun.' },
  targetEnd: { name: '3E / Flow 07 / TARGET END', text: 'END — Flow 7 / TARGET SPECIMEN\nTARGET Ready is isolated from the current path and is non-interactive.' },
} as const;

export const FLOW8_BOARD = {
  start: { name: '3E / Flow 08 / PRIMARY START', text: 'START — Flow 8 / Purchase Confirmation' },
  step1: { name: '3E / Flow 08 / STEP 1', text: 'STEP 1 — Customer reviews the proposed order' },
  proposalBoundary: { name: '3E / Flow 08 / Proposal Boundary', text: 'Proposal ≠ Execution. The business action has not executed before the customer explicitly confirms this order.' },
  confirmSource: { name: '3E / Flow 08 / Confirm Source', text: 'PRODUCT CONTROL — Customer confirms the proposed order' },
  customerAuthorization: { name: '3E / Flow 08 / Customer Authorization', text: 'Customer confirmation is explicit authorization for the proposed action. AI or an operator does not confirm on the customer’s behalf.' },
  step2: { name: '3E / Flow 08 / STEP 2', text: 'STEP 2 — Confirmed request is processing' },
  processingBoundary: { name: '3E / Flow 08 / Processing Boundary', text: 'Customer authorization was received. Processing ≠ Confirmed Result; the business result is not yet confirmed.' },
  resultControl: { name: '3E / Flow 08 / Business Result Event', marker: 'PROTOTYPE CONTROL — SYSTEM RESULT', text: 'Continue scenario → Business result confirmed' },
  step3: { name: '3E / Flow 08 / STEP 3', text: 'STEP 3 — Business result confirmed' },
  confirmedBoundary: { name: '3E / Flow 08 / Confirmed Facts', text: 'The approved customer result distinguishes Order created from Reservation confirmed. This prototype shows intended UX, not backend execution.' },
  primaryEnd: { name: '3E / Flow 08 / PRIMARY END', text: 'END — Flow 8 / Purchase Success\nThe customer sees the confirmed result. The prototype does not execute a backend purchase.' },
  branch: { name: '3E / Flow 08 / SECONDARY SCENARIO', text: 'SECONDARY SCENARIO — Message delivery failure after confirmed business effect' },
  branchControl: { name: '3E / Flow 08 / Delivery Failure Scenario', marker: 'PROTOTYPE CONTROL — SCENARIO ONLY', text: 'Simulate message delivery failure after confirmed business effect' },
  step4: { name: '3E / Flow 08 / STEP 4', text: 'STEP 4 — Customer message was not delivered' },
  deliveryBoundary: { name: '3E / Flow 08 / Delivery Boundary', text: 'Message Delivery Failure ≠ Business Action Failure. Communication transport failed after the business effect was confirmed.' },
  businessBoundary: { name: '3E / Flow 08 / Business Effect Boundary', text: 'Business effect remains confirmed. The Order must not be created again; the Reservation must not be repeated.' },
  noReplay: { name: '3E / Flow 08 / No Replay', text: 'Retry message ≠ repeat Order ≠ repeat Reservation. Message recovery retries communication only; no create_order, reserve_inventory or update_order replay.' },
  retrySource: { name: '3E / Flow 08 / Retry Source', text: 'PRODUCT CONTROL — Retry message only' },
  retryControl: { name: '3E / Flow 08 / Retry Message Control', marker: 'PROTOTYPE CONTROL — MESSAGE ONLY', text: 'Retry message delivery only' },
  recoveryNote: { name: '3E / Flow 08 / Recovery Note', text: 'For prototype progression, communication retry succeeds and returns to the existing Confirmed Result. The Order and Reservation were never recreated.' },
  recoveryEnd: { name: '3E / Flow 08 / RECOVERY END', text: 'END — Flow 8 / Message Recovery\nBusiness state remains the previously confirmed state. Only customer communication was retried.' },
} as const;

export const FLOWS: readonly FlowSpec[] = [
  {
    id: 1, title: 'Product Availability',
    frames: [
      { key: 'default', source: 'conversationDefault', label: 'Conversation / Default' },
      { key: 'support', source: 'conversationSupport', label: 'Support Active / verified inventory' },
    ],
    edges: [{ from: 'default', to: 'support', control: FLOW1_BOARD.continue.name }],
    notes: ['Product record existence is not stock availability. Inventory is observed trusted context, not a promise of live stock.'],
  },
  {
    id: 2, title: 'Purchase Success',
    frames: [
      { key: 'Awaiting Confirmation', source: 'conversationConfirmation', label: 'Awaiting Confirmation' },
      { key: 'Processing', source: 'conversationProcessing', label: 'Processing' },
      { key: 'Confirmed Result', source: 'conversationConfirmed', label: 'Confirmed Result' },
      { key: 'Reservation Confirmed', source: 'orderConfirmed', label: 'Order / Reservation Confirmed' },
    ],
    edges: [
      { from: 'Awaiting Confirmation', to: 'Processing', control: FLOW2_BOARD.confirmation.name },
      { from: 'Processing', to: 'Confirmed Result', control: FLOW2_BOARD.processingComplete.name },
      { from: 'Confirmed Result', to: 'Reservation Confirmed', control: 'Order link' },
    ],
    notes: ['Customer authorization precedes processing. This prototype demonstrates intended UX progression, not create_order, reserve_inventory, a live provider operation, M08 completion, or backend implementation.'],
  },
  {
    id: 3, title: 'Reservation Failure',
    frames: [
      { key: 'Known Failure', source: 'conversationFailure', label: 'Known Failure' },
      { key: 'Reservation Failed', source: 'orderFailed', label: 'Order / Reservation Failed' },
    ],
    edges: [{ from: 'Known Failure', to: 'Reservation Failed', control: 'Order link' }],
    notes: ['Known failure: the Order exists, reservation failed, and recovery requires a new authorized action.'],
  },
  {
    id: 4, title: 'Support → Sales Handoff',
    frames: [
      { key: 'Support Active', source: 'conversationSupport', label: 'Support Active' },
      { key: 'Handoff', source: 'conversationHandoff', label: 'Handoff Context' },
      { key: 'Sales Active', source: 'conversationSales', label: 'Sales Active' },
    ],
    edges: [
      { from: 'Support Active', to: 'Handoff', control: FLOW4_BOARD.requestControl.name },
      { from: 'Handoff', to: 'Sales Active', control: FLOW4_BOARD.acceptControl.name },
    ],
    notes: ['Previous/current handler, reason, verified context and remaining work remain visible. Handoff never transfers permissions.'],
  },
  {
    id: 5, title: 'OUTCOME_UNKNOWN → Escalation',
    frames: [
      { key: 'Conversation OUTCOME_UNKNOWN', source: 'conversationUnknown', label: 'Conversation OUTCOME_UNKNOWN' },
      { key: 'Escalation Reconciliation', source: 'escalationUnknown', label: 'Escalation / Reconciliation Required' },
    ],
    edges: [{ from: 'Conversation OUTCOME_UNKNOWN', to: 'Escalation Reconciliation', control: 'Escalation link' }],
    notes: ['Effect may have committed. Reconcile authoritative reservation state before any further mutation; no blind retry.'],
  },
  {
    id: 6, title: 'Human Decision / Resume TARGET',
    frames: [
      { key: 'Awaiting Decision', source: 'escalationDecision', label: 'Awaiting Human Decision' },
      { key: 'Resume Pending', source: 'escalationResume', label: 'Resume Pending / TARGET M12', targetOnly: true },
    ],
    edges: [{ from: 'Awaiting Decision', to: 'Resume Pending', control: FLOW6_BOARD.decisionControl.name }],
    notes: ['TARGET M12 — NOT CURRENTLY IMPLEMENTED. The linked state is a target specimen, not a live capability.'],
  },
  {
    id: 7, title: 'Analytics → Forecasts',
    frames: [
      { key: 'Analytics Valid', source: 'analyticsValid', label: 'Analytics / historical ACTUAL' },
      { key: 'MODEL_NOT_READY', source: 'forecastNotReady', label: 'Forecast / MODEL_NOT_READY' },
      { key: 'TARGET Ready', source: 'forecastTarget', label: 'Forecast / TARGET Ready', targetOnly: true },
    ],
    edges: [
      { from: 'Analytics Valid', to: 'MODEL_NOT_READY', control: 'Open Forecasts' },
      { from: 'MODEL_NOT_READY', to: 'Analytics Valid', control: 'Open Historical Analytics' },
    ],
    notes: ['Current: MODEL_NOT_READY. TARGET PRODUCT UX below is isolated and has no current-state navigation. No predicted values are claimed.'],
  },
  {
    id: 8, title: 'Customer Web Chat',
    frames: [
      { key: 'Confirmation Required', source: 'chatConfirmation', label: 'Confirmation Required' },
      { key: 'Processing', source: 'chatProcessing', label: 'Processing' },
      { key: 'Confirmed Result', source: 'chatConfirmed', label: 'Confirmed Result' },
      { key: 'Message Delivery Failure', source: 'chatDelivery', label: 'Message Delivery Failure' },
    ],
    edges: [
      { from: 'Confirmation Required', to: 'Processing', control: 'Confirm order / focus' },
      { from: 'Processing', to: 'Confirmed Result', control: FLOW8_BOARD.resultControl.name },
      { from: 'Confirmed Result', to: 'Message Delivery Failure', control: FLOW8_BOARD.branchControl.name },
      { from: 'Message Delivery Failure', to: 'Confirmed Result', control: 'Retry message action / focus' },
    ],
    notes: ['Secondary message recovery follows an already confirmed business effect. Retry message is communication-only and never repeats an Order or Reservation.'],
  },
] as const;

export function flowSectionName(id: number): string {
  const flow = FLOWS.find(f => f.id === id);
  if (!flow) throw new Error(`Unknown flow ${id}`);
  return `${String(id).padStart(2, '0')} — ${flow.title}`;
}
export function cloneName(id: number, key: string): string {
  return `3E / Flow ${String(id).padStart(2, '0')} / ${key}`;
}
export function assertWritablePageName(name: string): void {
  if (name !== TARGET_PAGE) throw new Error(`Writes are restricted to ${TARGET_PAGE}; got ${name}.`);
}
export function graphErrors(flow: FlowSpec): string[] {
  const errors: string[] = [];
  const keys = new Set(flow.frames.map(f => f.key));
  if (flow.id === 1 && (flow.edges.length !== 1 || flow.edges[0].from !== 'default' || flow.edges[0].to !== 'support' || flow.edges[0].control !== FLOW1_BOARD.continue.name)) errors.push('Flow 1 must use its external prototype control.');
  if (flow.id === 2 && (flow.edges.length !== 3 ||
    flow.edges[0].from !== 'Awaiting Confirmation' || flow.edges[0].to !== 'Processing' || flow.edges[0].control !== FLOW2_BOARD.confirmation.name ||
    flow.edges[1].from !== 'Processing' || flow.edges[1].to !== 'Confirmed Result' || flow.edges[1].control !== FLOW2_BOARD.processingComplete.name ||
    flow.edges[2].from !== 'Confirmed Result' || flow.edges[2].to !== 'Reservation Confirmed' || flow.edges[2].control !== 'Order link')) {
    errors.push('Flow 2 must follow customer confirmation → processing → confirmed result → Reservation Confirmed Order.');
  }
  if (flow.id === 3 && (flow.frames.length !== 2 || flow.frames[0].key !== 'Known Failure' || flow.frames[0].source !== 'conversationFailure' ||
    flow.frames[1].key !== 'Reservation Failed' || flow.frames[1].source !== 'orderFailed' || flow.edges.length !== 1 ||
    flow.edges[0].from !== 'Known Failure' || flow.edges[0].to !== 'Reservation Failed' || flow.edges[0].control !== 'Order link')) {
    errors.push('Flow 3 must use exact Known Failure and Reservation Failed sources and a single Open Order progression.');
  }
  if (flow.id === 4 && (flow.frames.length !== 3 || flow.frames[0].key !== 'Support Active' || flow.frames[0].source !== 'conversationSupport' ||
    flow.frames[1].key !== 'Handoff' || flow.frames[1].source !== 'conversationHandoff' ||
    flow.frames[2].key !== 'Sales Active' || flow.frames[2].source !== 'conversationSales' || flow.edges.length !== 2 ||
    flow.edges[0].from !== 'Support Active' || flow.edges[0].to !== 'Handoff' || flow.edges[0].control !== FLOW4_BOARD.requestControl.name ||
    flow.edges[1].from !== 'Handoff' || flow.edges[1].to !== 'Sales Active' || flow.edges[1].control !== FLOW4_BOARD.acceptControl.name)) {
    errors.push('Flow 4 must progress Support Active → Handoff → Sales Active with external-capable handoff controls.');
  }
  if (flow.id === 5 && (flow.frames.length !== 2 || flow.frames[0].key !== 'Conversation OUTCOME_UNKNOWN' || flow.frames[0].source !== 'conversationUnknown' ||
    flow.frames[1].key !== 'Escalation Reconciliation' || flow.frames[1].source !== 'escalationUnknown' ||
    flow.edges.length !== 1 || flow.edges[0].from !== 'Conversation OUTCOME_UNKNOWN' ||
    flow.edges[0].to !== 'Escalation Reconciliation' || flow.edges[0].control !== 'Escalation link')) {
    errors.push('Flow 5 must route Conversation OUTCOME_UNKNOWN directly to Escalation Reconciliation first.');
  }
  if (flow.id === 6 && (flow.frames.length !== 2 || flow.frames[0].key !== 'Awaiting Decision' || flow.frames[0].source !== 'escalationDecision' ||
    flow.frames[1].key !== 'Resume Pending' || flow.frames[1].source !== 'escalationResume' || !flow.frames[1].targetOnly ||
    flow.edges.length !== 1 || flow.edges[0].from !== 'Awaiting Decision' || flow.edges[0].to !== 'Resume Pending' ||
    flow.edges[0].control !== FLOW6_BOARD.decisionControl.name)) {
    errors.push('Flow 6 must use exact Awaiting Decision and Resume Pending TARGET sources with an external revalidation boundary.');
  }
  for (const edge of flow.edges) {
    if (!keys.has(edge.from) || !keys.has(edge.to)) errors.push(`Broken spec edge ${edge.from} → ${edge.to}`);
    if (flow.frames.find(f => f.key === edge.to)?.targetOnly && flow.id !== 6) errors.push(`Current path reaches TARGET in flow ${flow.id}`);
    if (flow.id === 5 && edge.from === 'Conversation OUTCOME_UNKNOWN' && edge.to !== 'Escalation Reconciliation') errors.push('OUTCOME_UNKNOWN bypasses reconciliation');
    if (flow.id === 8 && edge.from === 'Message Delivery Failure' && (edge.control !== 'Retry message action / focus' || edge.to !== 'Confirmed Result')) errors.push('Delivery recovery may replay business mutation');
  }
  if (flow.id === 6 && !flow.notes.join(' ').includes('NOT CURRENTLY IMPLEMENTED')) errors.push('M12 TARGET boundary missing');
  if (flow.id === 7 && (flow.frames.length !== 3 || flow.frames[0].key !== 'Analytics Valid' || flow.frames[0].source !== 'analyticsValid' ||
    flow.frames[1].key !== 'MODEL_NOT_READY' || flow.frames[1].source !== 'forecastNotReady' ||
    flow.frames[2].key !== 'TARGET Ready' || flow.frames[2].source !== 'forecastTarget' || !flow.frames[2].targetOnly ||
    flow.edges.length !== 2 || flow.edges[0].from !== 'Analytics Valid' || flow.edges[0].to !== 'MODEL_NOT_READY' ||
    flow.edges[0].control !== 'Open Forecasts' || flow.edges[1].from !== 'MODEL_NOT_READY' ||
    flow.edges[1].to !== 'Analytics Valid' || flow.edges[1].control !== 'Open Historical Analytics' ||
    !flow.notes.join(' ').includes('MODEL_NOT_READY'))) errors.push('M13 current/TARGET boundary missing or Flow 7 current path is unsafe');
  if (flow.id === 8 && (flow.frames.length !== 4 || flow.frames[0].key !== 'Confirmation Required' || flow.frames[0].source !== 'chatConfirmation' ||
    flow.frames[1].key !== 'Processing' || flow.frames[1].source !== 'chatProcessing' ||
    flow.frames[2].key !== 'Confirmed Result' || flow.frames[2].source !== 'chatConfirmed' ||
    flow.frames[3].key !== 'Message Delivery Failure' || flow.frames[3].source !== 'chatDelivery' ||
    flow.edges.length !== 4 || flow.edges[0].from !== 'Confirmation Required' || flow.edges[0].to !== 'Processing' || flow.edges[0].control !== 'Confirm order / focus' ||
    flow.edges[1].from !== 'Processing' || flow.edges[1].to !== 'Confirmed Result' || flow.edges[1].control !== FLOW8_BOARD.resultControl.name ||
    flow.edges[2].from !== 'Confirmed Result' || flow.edges[2].to !== 'Message Delivery Failure' || flow.edges[2].control !== FLOW8_BOARD.branchControl.name ||
    flow.edges[3].from !== 'Message Delivery Failure' || flow.edges[3].to !== 'Confirmed Result' || flow.edges[3].control !== 'Retry message action / focus'))
    errors.push('Flow 8 must use exact customer screens, explicit confirmation, external result/branch events, and communication-only recovery.');
  return errors;
}

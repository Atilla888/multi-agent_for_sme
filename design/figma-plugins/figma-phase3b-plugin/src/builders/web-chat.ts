import { SECTION_LABELS } from '../constants';
import { attention, panel, screen } from '../specs/phase3b-spec';
import type { SectionSpec } from '../types';

export const webChat: SectionSpec = {
  key: 'webChat', label: SECTION_LABELS.webChat,
  intro: 'Customer-facing only: plain language, no staff sidebar and no internal run/tool/audit terminology.',
  screens: [
    screen('3B / Web Chat / Initial', 'Welcome', 'A calm entry point with a message field and simple help cue.', 'customer', 'Initial', [[panel('Welcome', 'Hi! What can we help you with today?', 'Type your question below.')]], { actions: ['Send message'] }),
    screen('3B / Web Chat / Active', 'Conversation', 'Customer and assistant messages in a familiar chat layout.', 'customer', 'Active conversation', [[panel('Messages', 'You: Is this product available?', 'Assistant: I can check availability for you.'), panel('Composer', 'Type a reply…')]], { actions: ['Send message'] }),
    screen('3B / Web Chat / Clarification Requested', 'Conversation', 'Ask for missing details before claiming an answer.', 'customer', 'Clarification requested', [[panel('Messages', 'Assistant: Which size would you like me to check?', 'You: <reply>')]], { actions: ['Send details'] }),
    screen('3B / Web Chat / Confirmation Required', 'Confirm request', 'Customer approval is required before an order or reservation attempt.', 'customer', 'Confirmation required', [[panel('Request summary', 'Item: <product>', 'Quantity: <quantity>', 'We will only continue after you confirm.')]], { actions: ['Confirm order', 'Change details'] }),
    screen('3B / Web Chat / Processing', 'Working on it', 'The request is being checked; a result has not been confirmed yet.', 'customer', 'Processing', [[panel('Progress', 'We are checking your request.', "We'll update you here when the result is available.")]]),
    screen('3B / Web Chat / Confirmed Result', 'Result', 'Only confirmed outcomes are described as complete.', 'customer', 'Confirmed result', [[panel('Your request', 'Your order has been created.', 'The item is reserved.', 'Reference: <order id>')]], { actions: ['View details'] }),
    screen('3B / Web Chat / Known Failure', 'Request needs attention', 'A known failure is explicit without technical internals.', 'customer', 'Known failure', [[attention('What happened', 'Your order was created, but the item was not reserved.', "Please don't place the same order again."), panel('What happens next', 'We will help you with the next step.')]], { actions: ['Ask for help'] }),
    screen('3B / Web Chat / Pending Human', 'Waiting for support', 'Human follow-up is visible without leaking internal handoff details.', 'customer', 'Waiting for human', [[panel('We are reviewing this', 'A team member will check your request.', 'We will update you when we have a confirmed answer.')]], { actions: ['Add a message'] }),
    screen('3B / Web Chat / Confirmation Pending', 'Confirmation pending', 'Unknown outcome must not be presented as success or final failure.', 'customer', 'Confirmation pending', [[attention('We are checking the result', 'The request may have gone through, but we cannot confirm it yet.', 'Please do not submit the same request again.'), panel('Next', 'We will verify the result and update you.')]], { actions: ['Contact support'] }),
    screen('3B / Web Chat / Delivery or Connection Failure', 'Connection issue', 'Communication failure is independent of the business action.', 'customer', 'Delivery / connection failure', [[attention('Message not delivered', 'We could not deliver the latest update.'), panel('Business result', 'Your reservation remains confirmed.', 'Reference: <reservation id>'), panel('Next', 'Reconnect or contact us for the result; do not place the order again.')]], { actions: ['Reconnect', 'Contact support'] }),
  ],
};

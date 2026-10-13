import { SECTION_LABELS } from '../constants';
import { attention, panel, screen } from '../specs/phase3b-spec';
import type { SectionSpec } from '../types';

const controls = panel('Forecast request', 'Target: Sales ▾', 'Cutoff: <last actual date> ▾', 'Horizon: <future period> ▾');
const provenance = panel('Provenance / limitations', 'Model/version: <placeholder>', 'Created: <timestamp>', 'Source history: <reference>', 'Limitations: <model constraints>');

export const forecasts: SectionSpec = {
  key: 'forecasts', label: SECTION_LABELS.forecasts,
  intro: 'Predictions are a separate surface from historical Analytics. Current engineering state is MODEL_NOT_READY.',
  screens: [
    screen('3B / Forecasts / TARGET Ready', 'Forecasts', 'Future target UX; this is not the current implemented engineering result.', 'staff', 'TARGET Ready', [[controls, panel('ACTUAL — historical', '<date>  |  <observed value>', 'Values before cutoff only.'), panel('PREDICTED — future', '<future date>  |  <predicted value>', 'Values after cutoff only.')], [panel('Actual / predicted chart placeholder', 'ACTUAL: solid historical line', 'Cutoff: vertical divider', 'PREDICTED: dashed future line'), provenance]], { annotation: 'TARGET PRODUCT UX — a ready forecast is a future product state, not current M13 output.', references: ['Analytics'] }),
    screen('3B / Forecasts / MODEL_NOT_READY', 'Forecasts', 'Current engineering state. No prediction has been produced.', 'staff', 'MODEL_NOT_READY', [[controls, attention('CURRENT ENGINEERING STATE', 'Forecast is currently unavailable.', 'No prediction has been produced.', 'This is not zero forecast or a valid empty result.')], [panel('Historical reference', 'Open Analytics for observed actuals.'), panel('Prediction area', 'No predicted chart or zero-value bars are shown.')]], { actions: ['Open Analytics'], annotation: 'CURRENT ENGINEERING STATE — M13 forecast artifact is not ready.' }),
    screen('3B / Forecasts / Insufficient History', 'Forecasts', 'Not enough observed history for this request.', 'staff', 'Insufficient History', [[controls, attention('Cannot forecast', 'Insufficient historical observations.')], [panel('Next step', 'Choose a different target or wait for more history.', 'No prediction produced.')]], { actions: ['Open Analytics'] }),
    screen('3B / Forecasts / Unsupported Horizon', 'Forecasts', 'Request is outside supported horizon.', 'staff', 'Unsupported Horizon', [[controls, attention('Unsupported request', 'The selected horizon is not supported.', 'No prediction produced.')], [panel('Next step', 'Choose a supported horizon.')]], { actions: ['Change horizon'] }),
    screen('3B / Forecasts / Model Unavailable', 'Forecasts', 'Model dependency could not be reached.', 'staff', 'Model Unavailable', [[controls, attention('Forecast unavailable', 'The model service is unavailable.', 'No prediction produced.')], [panel('Next step', 'Try again later; historical Analytics remains separate.')]], { actions: ['Open Analytics'] }),
    screen('3B / Forecasts / Timeout', 'Forecasts', 'A timed-out request is not a zero prediction.', 'staff', 'Timeout', [[controls, attention('Request timed out', 'No confirmed forecast result is available.')], [panel('Next step', 'Check status before a new request.')]], { actions: ['Check status'] }),
    screen('3B / Forecasts / Incomplete History', 'Forecasts', 'Incomplete historical inputs block a reliable prediction.', 'staff', 'Incomplete History', [[controls, attention('Input data incomplete', 'Required historical records are missing.', 'No prediction produced.')], [panel('Next step', 'Review Analytics completeness and source coverage.')]], { actions: ['Open Analytics'] }),
    screen('3B / Forecasts / Permission Denied', 'Forecasts', 'Prediction access is restricted.', 'staff', 'Permission Denied', [[attention('Access restricted', 'You do not have permission to request this forecast.')], [panel('Next step', 'Choose an allowed target or request access.')]], { actions: ['Choose another target'] }),
  ],
};

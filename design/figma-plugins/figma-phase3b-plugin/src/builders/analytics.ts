import { SECTION_LABELS } from '../constants';
import { attention, panel, screen } from '../specs/phase3b-spec';
import type { SectionSpec } from '../types';

const controls = panel('Metric / period', 'Metric: Sales volume ▾', 'Period: Last 30 days ▾', 'Observed / historical data only.');
const history = panel('Historical chart placeholder', 'Time  ─────────────────────────→', 'Value   ░  ▒  ░  ▓  ▒  ░', 'Actual observations; no predicted values.');
const table = panel('Historical detail table', 'Date        Actual value      Source', '<date>      <value>           <source>');

export const analytics: SectionSpec = {
  key: 'analytics', label: SECTION_LABELS.analytics,
  intro: 'Analytics reports observed facts. Missing or unavailable data is never drawn as a zero-value chart.',
  screens: [
    screen('3B / Analytics / Loading', 'Analytics', 'Loading state keeps metric and period visible.', 'staff', 'Loading', [[controls, panel('KPI summary', 'Loading observed data…')], [panel('Chart / table', 'Loading historical result…')]], { references: ['Forecasts'] }),
    screen('3B / Analytics / Valid Result', 'Analytics', 'Actual historical results with freshness and completeness metadata.', 'staff', 'Valid Result', [[controls, panel('KPI summary', 'Observed sales: <value>', 'Compared with prior period: <value>'), history], [table, panel('Data quality', 'Completeness: complete', 'Freshness: updated <time>'), panel('Related', 'Open Forecasts for predicted information.')]], { actions: ['Open Forecasts'], references: ['Forecasts'] }),
    screen('3B / Analytics / Valid Empty', 'Analytics', 'Valid zero observations are distinct from a failed data load.', 'staff', 'Valid Empty', [[controls, panel('Result', 'No recorded activity for this selected period.', 'Source query completed successfully.')], [panel('Data quality', 'Completeness: complete', 'Freshness: updated <time>')]], { actions: ['Change period'] }),
    screen('3B / Analytics / Incomplete Data', 'Analytics', 'Partial observed data is labelled incomplete.', 'staff', 'Incomplete Data', [[controls, attention('Partial result', 'Some source records are missing.', 'Do not treat this as a complete business total.')], [history, panel('Data quality', 'Completeness: incomplete', 'Missing range/source: <placeholder>')]], { actions: ['Review missing data'] }),
    screen('3B / Analytics / Stale Data', 'Analytics', 'Historical data may be valid but out of date.', 'staff', 'Stale Data', [[controls, attention('Data is stale', 'Last successful update: <time>', 'Newer activity may not be included.')], [history, table]], { actions: ['Refresh data'] }),
    screen('3B / Analytics / Dependency Unavailable', 'Analytics', 'Unavailable is not zero.', 'staff', 'Dependency Unavailable', [[controls, attention('DATA UNAVAILABLE', 'The historical data source could not be reached.', 'This does NOT mean sales = 0.')], [panel('Chart / table unavailable', 'No zero-value chart is displayed.'), panel('Next step', 'Try again later or contact support.')]], { actions: ['Try loading again'] }),
    screen('3B / Analytics / Permission Denied', 'Analytics', 'No unauthorized metric details are revealed.', 'staff', 'Permission Denied', [[attention('Access restricted', 'You do not have permission to view this metric.')], [panel('Next step', 'Choose an allowed metric or request access.')]], { actions: ['Choose another metric'] }),
  ],
};

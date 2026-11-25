import { parseLocalDate } from './dates';
import type { WorkSearchActivity } from './insights-types';

function formatReportDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatWorkSearchReport(
  weekLabel: string,
  activities: WorkSearchActivity[]
): string {
  const header = `Work Search Activities — Week of ${weekLabel}\n`;
  if (activities.length === 0) {
    return (
      header +
      '\nNo activities logged for this week. Add applications, interviews, or outreach in Groundwork.'
    );
  }

  const lines = activities.map((a, i) => {
    const role = a.role ? ` — ${a.role}` : '';
    const detail = a.detail ? ` (${a.detail})` : '';
    return `${i + 1}. ${formatReportDate(a.date)} — ${a.companyName} — ${a.method} — ${a.activityType}${role}${detail}`;
  });

  return header + '\n' + lines.join('\n');
}

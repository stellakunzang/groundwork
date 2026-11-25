import { parseLocalDate, startOfDay } from './dates';

const GHOSTABLE_STATUSES = new Set(['applied', 'active', 'waiting']);

type CompanyLike = {
  id: string;
  status: string;
  status_changed_at: string | null;
  created_at: string | null;
};

type InteractionLike = {
  company_id: string;
  date: string;
  type: string;
};

type MessageLike = {
  company_id: string;
  date: string;
};

/** True when a live pipeline company has had no meaningful activity for 2+ months. */
export function isGhosted(
  company: CompanyLike,
  interactions: InteractionLike[],
  messages: MessageLike[] = [],
  now = new Date()
): boolean {
  if (!GHOSTABLE_STATUSES.has(company.status)) return false;

  const companyInteractions = interactions.filter((i) => i.company_id === company.id);
  if (companyInteractions.some((i) => i.type.toLowerCase() === 'rejection')) {
    return false;
  }

  const activityDates: string[] = companyInteractions.map((i) => i.date);
  for (const m of messages) {
    if (m.company_id === company.id) activityDates.push(m.date);
  }

  const fallback = company.status_changed_at ?? company.created_at;
  if (fallback) activityDates.push(fallback);

  if (activityDates.length === 0) return false;

  const last = activityDates.reduce((a, b) => (a > b ? a : b));
  const cutoff = startOfDay(now);
  cutoff.setMonth(cutoff.getMonth() - 2);

  return startOfDay(parseLocalDate(last)) < cutoff;
}

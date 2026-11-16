import { db } from '@/src/db/db';
import { companies, interactions, contacts, messages } from '@/src/db/schema';
import {
  getCompletedWeekRange,
  isDateInRange,
  daysSince,
  parseLocalDate,
  startOfDay,
} from './dates';
import { isInterviewType } from './interview-types';
import type {
  WorkSearchActivity,
  WeekWin,
  ActionItem,
  MomentumStats,
  SourceInsight,
  InsightsData,
} from './insights-types';

export type {
  WorkSearchActivity,
  WeekWin,
  ActionItem,
  MomentumStats,
  SourceInsight,
  InsightsData,
} from './insights-types';

const NETWORKING_TYPES = new Set(['coffee_chat', 'informational', 'follow_up']);

const INTERACTION_LABELS: Record<string, string> = {
  application: 'Applied',
  screen: 'Phone screen',
  technical: 'Technical interview',
  behavioral: 'Behavioral interview',
  onsite: 'Onsite interview',
  panel: 'Panel interview',
  offer: 'Offer received',
  rejection: 'Rejection',
  coffee_chat: 'Coffee chat',
  informational: 'Informational interview',
  follow_up: 'Follow-up',
};

const ACTIVITY_METHOD: Record<string, string> = {
  application: 'Online application',
  screen: 'Phone interview',
  technical: 'Video/phone interview',
  behavioral: 'Video/phone interview',
  onsite: 'In-person or video interview',
  panel: 'Video/phone interview',
  offer: 'Employer contact',
  rejection: 'Employer contact',
  coffee_chat: 'Networking — coffee chat',
  informational: 'Networking — informational',
  follow_up: 'Follow-up contact',
};

function interactionLabel(type: string): string {
  const key = type.toLowerCase().replace(/\s+/g, '_');
  return INTERACTION_LABELS[key] ?? type;
}

function activityMethod(type: string): string {
  const key = type.toLowerCase().replace(/\s+/g, '_');
  return ACTIVITY_METHOD[key] ?? 'Job search activity';
}

function latestActivityDate(
  companyId: string,
  companyInteractions: (typeof interactions.$inferSelect)[],
  companyMessages: (typeof messages.$inferSelect)[]
): string | null {
  const dates: string[] = [];
  for (const i of companyInteractions) {
    if (i.company_id === companyId) dates.push(i.date);
  }
  for (const m of companyMessages) {
    if (m.company_id === companyId) dates.push(m.date);
  }
  if (dates.length === 0) return null;
  return dates.sort((a, b) => parseLocalDate(b).getTime() - parseLocalDate(a).getTime())[0];
}

function toDateOnly(dateStr: string): string {
  return dateStr.slice(0, 10);
}

const PRE_APPLICATION_STATUSES = new Set(['interested', 'watchlist']);

/** When a company counts as having applied, and on what date. */
function getApplicationDate(
  company: (typeof companies.$inferSelect)
): string | null {
  if (PRE_APPLICATION_STATUSES.has(company.status)) return null;
  if (company.status !== 'applied') return null;
  return company.status_changed_at ?? company.created_at;
}

type CompanyRow = typeof companies.$inferSelect;
type InteractionRow = typeof interactions.$inferSelect;
type ContactRow = typeof contacts.$inferSelect;
type MessageRow = typeof messages.$inferSelect;

function collectWeekEvents(
  allCompanies: CompanyRow[],
  allInteractions: InteractionRow[],
  allContacts: ContactRow[],
  allMessages: MessageRow[],
  start: Date,
  end: Date,
  options: { includeActivities: boolean; includeWins: boolean }
): { activities: WorkSearchActivity[]; wins: WeekWin[] } {
  const companyMap = new Map(allCompanies.map((c) => [c.id, c]));
  const activities: WorkSearchActivity[] = [];
  const wins: WeekWin[] = [];
  const winIds = new Set<string>();

  const addActivity = (activity: WorkSearchActivity) => {
    if (options.includeActivities) activities.push(activity);
  };

  const addWin = (win: WeekWin) => {
    if (!options.includeWins || winIds.has(win.id)) return;
    winIds.add(win.id);
    wins.push(win);
  };

  // Applications via company status
  for (const c of allCompanies) {
    const appliedAt = getApplicationDate(c);
    if (!appliedAt || !isDateInRange(appliedAt, start, end)) continue;

    const hasAppInteraction = allInteractions.some(
      (i) =>
        i.company_id === c.id &&
        i.type.toLowerCase() === 'application' &&
        isDateInRange(i.date, start, end)
    );
    if (!hasAppInteraction) {
      const date = toDateOnly(appliedAt);
      addActivity({
        id: `applied-${c.id}`,
        date,
        companyName: c.name,
        companyId: c.id,
        role: c.role,
        activityType: 'Job application submitted',
        method: 'Online application',
      });
      addWin({
        id: `win-applied-${c.id}`,
        date,
        label: `Applied to ${c.name}`,
        detail: c.role ?? undefined,
        companyId: c.id,
        companyName: c.name,
      });
    }
  }

  for (const i of allInteractions) {
    if (!isDateInRange(i.date, start, end)) continue;
    const company = companyMap.get(i.company_id);
    if (!company) continue;

    const typeKey = i.type.toLowerCase().replace(/\s+/g, '_');
    addActivity({
      id: `interaction-${i.id}`,
      date: i.date,
      companyName: company.name,
      companyId: company.id,
      role: company.role,
      activityType: interactionLabel(i.type),
      method: activityMethod(i.type),
      detail: i.person_name
        ? `with ${i.person_name}${i.person_title ? ` (${i.person_title})` : ''}`
        : undefined,
    });

    if (typeKey === 'application') {
      addWin({
        id: `win-int-app-${i.id}`,
        date: i.date,
        label: `Applied to ${company.name}`,
        detail: company.role ?? undefined,
        companyId: company.id,
        companyName: company.name,
      });
    } else if (isInterviewType(typeKey)) {
      addWin({
        id: `win-int-${i.id}`,
        date: i.date,
        label: `${interactionLabel(i.type)} at ${company.name}`,
        detail: i.person_name ? `with ${i.person_name}` : undefined,
        companyId: company.id,
        companyName: company.name,
      });
    } else if (NETWORKING_TYPES.has(typeKey)) {
      addWin({
        id: `win-net-${i.id}`,
        date: i.date,
        label: `${interactionLabel(i.type)} — ${company.name}`,
        companyId: company.id,
        companyName: company.name,
      });
    } else if (typeKey === 'offer') {
      addWin({
        id: `win-offer-${i.id}`,
        date: i.date,
        label: `Offer from ${company.name}!`,
        companyId: company.id,
        companyName: company.name,
      });
    }
  }

  for (const m of allMessages) {
    if (m.direction !== 'sent' || !isDateInRange(m.date, start, end)) continue;
    const company = companyMap.get(m.company_id);
    if (!company) continue;

    addActivity({
      id: `message-${m.id}`,
      date: m.date,
      companyName: company.name,
      companyId: company.id,
      role: company.role,
      activityType: 'Outreach / follow-up',
      method: 'Email or written contact',
      detail: m.body.length > 60 ? m.body.slice(0, 60).trimEnd() + '…' : m.body,
    });
    addWin({
      id: `win-msg-${m.id}`,
      date: m.date,
      label: `Outreach to ${company.name}`,
      companyId: company.id,
      companyName: company.name,
    });
  }

  for (const c of allContacts) {
    if (!c.created_at || !isDateInRange(c.created_at, start, end)) continue;
    const company = c.company_id ? companyMap.get(c.company_id) : null;
    const companyName = company?.name ?? 'Independent contact';

    addActivity({
      id: `contact-${c.id}`,
      date: toDateOnly(c.created_at),
      companyName,
      companyId: company?.id ?? c.id,
      role: company?.role ?? c.title,
      activityType: 'Networking — new contact',
      method: 'Professional networking',
      detail: `${c.name}${c.title ? `, ${c.title}` : ''}`,
    });
    addWin({
      id: `win-contact-${c.id}`,
      date: toDateOnly(c.created_at),
      label: `Connected with ${c.name}`,
      detail: company ? `at ${company.name}` : c.title ?? undefined,
      companyId: company?.id,
      companyName: company?.name,
    });
  }

  activities.sort(
    (a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
  );
  wins.sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );

  return { activities, wins };
}

export async function getInsightsData(): Promise<InsightsData> {
  const reportWeek = getCompletedWeekRange(1);
  const currentWeek = getCompletedWeekRange(0);

  const [allCompanies, allInteractions, allContacts, allMessages] =
    await Promise.all([
      db.select().from(companies),
      db.select().from(interactions),
      db.select().from(contacts),
      db.select().from(messages),
    ]);

  const companyMap = new Map(allCompanies.map((c) => [c.id, c]));

  const { activities: workSearchActivities } = collectWeekEvents(
    allCompanies,
    allInteractions,
    allContacts,
    allMessages,
    reportWeek.start,
    reportWeek.end,
    { includeActivities: true, includeWins: false }
  );

  const { wins: weekWins } = collectWeekEvents(
    allCompanies,
    allInteractions,
    allContacts,
    allMessages,
    currentWeek.start,
    currentWeek.end,
    { includeActivities: false, includeWins: true }
  );

  // --- Action items ---
  const actionItems: ActionItem[] = [];
  const now = startOfDay(new Date());

  // Thank-you notes not sent (interviews in last 14 days)
  for (const i of allInteractions) {
    if (!isInterviewType(i.type) || i.thank_you_sent) continue;
    const days = daysSince(i.date);
    if (days === null || days > 14) continue;
    const company = companyMap.get(i.company_id);
    if (!company) continue;

    actionItems.push({
      id: `thankyou-${i.id}`,
      priority: days <= 3 ? 'high' : 'medium',
      label: `Send thank-you note`,
      detail: `${interactionLabel(i.type)} at ${company.name}${i.person_name ? ` with ${i.person_name}` : ''} — ${days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`}`,
      companyId: company.id,
      companyName: company.name,
    });
  }

  // Unanswered received messages
  for (const company of allCompanies) {
    const companyMsgs = allMessages
      .filter((m) => m.company_id === company.id)
      .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
    const latest = companyMsgs[0];
    if (latest?.direction === 'received') {
      const days = daysSince(latest.date);
      if (days !== null && days <= 14) {
        actionItems.push({
          id: `reply-${company.id}`,
          priority: days <= 2 ? 'high' : 'medium',
          label: `Reply to ${company.name}`,
          detail: `Message received ${days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`} — follow up while it's fresh`,
          companyId: company.id,
          companyName: company.name,
        });
      }
    }
  }

  // Stale active/waiting pipelines
  for (const c of allCompanies) {
    if (c.status !== 'active' && c.status !== 'waiting') continue;
    const last = latestActivityDate(c.id, allInteractions, allMessages);
    const days = daysSince(last ?? c.status_changed_at ?? c.updated_at);
    if (days !== null && days >= 7) {
      actionItems.push({
        id: `stale-${c.id}`,
        priority: 'medium',
        label: `Check in with ${c.name}`,
        detail: `Status is "${c.status}" but no activity in ${days} days — a brief follow-up keeps you top of mind`,
        companyId: c.id,
        companyName: c.name,
      });
    }
  }

  // Interested but never applied (14+ days)
  for (const c of allCompanies) {
    if (c.status !== 'interested') continue;
    const days = daysSince(c.created_at);
    if (days === null || days < 14) continue;
    const hasApplied =
      allInteractions.some(
        (i) => i.company_id === c.id && i.type.toLowerCase() === 'application'
      ) || c.status_changed_at;
    if (!hasApplied) {
      actionItems.push({
        id: `interested-${c.id}`,
        priority: 'low',
        label: `Apply or decide on ${c.name}`,
        detail: `Interested for ${days} days — apply, reach out, or move to watchlist`,
        companyId: c.id,
        companyName: c.name,
      });
    }
  }

  // Warm connections to revisit
  for (const c of allCompanies) {
    if (!c.would_reapply && c.status !== 'watchlist') continue;
    const last = latestActivityDate(c.id, allInteractions, allMessages);
    const days = daysSince(last ?? c.updated_at);
    if (days !== null && days >= 30) {
      actionItems.push({
        id: `warm-${c.id}`,
        priority: 'low',
        label: `Revisit ${c.name}`,
        detail: c.outcome_notes
          ? `Warm connection — ${c.outcome_notes.slice(0, 80)}${c.outcome_notes.length > 80 ? '…' : ''}`
          : 'Marked as would reapply — check for new openings',
        companyId: c.id,
        companyName: c.name,
      });
    }
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  actionItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // --- Momentum stats ---
  const totalInterviews = allInteractions.filter((i) =>
    isInterviewType(i.type)
  ).length;

  const peopleNames = new Set<string>();
  for (const i of allInteractions) {
    if (i.person_name) peopleNames.add(i.person_name.toLowerCase());
  }
  for (const c of allContacts) {
    peopleNames.add(c.name.toLowerCase());
  }

  const messagesSent = allMessages.filter((m) => m.direction === 'sent').length;
  const stillWarm = allCompanies.filter((c) => c.would_reapply).length;
  const activeInPipeline = allCompanies.filter((c) =>
    ['interested', 'applied', 'active', 'waiting', 'offer'].includes(c.status)
  ).length;

  const countEventsInRange = (rangeStart: Date, rangeEnd: Date) => {
    let count = 0;
    for (const i of allInteractions) {
      if (isDateInRange(i.date, rangeStart, rangeEnd)) count++;
    }
    for (const m of allMessages) {
      if (isDateInRange(m.date, rangeStart, rangeEnd)) count++;
    }
    for (const c of allCompanies) {
      if (c.status_changed_at && isDateInRange(c.status_changed_at, rangeStart, rangeEnd))
        count++;
    }
    return count;
  };

  const last30End = endOfDayHelper(now);
  const last30Start = new Date(now);
  last30Start.setDate(last30Start.getDate() - 30);
  const prior30End = new Date(last30Start);
  prior30End.setMilliseconds(-1);
  const prior30Start = new Date(last30Start);
  prior30Start.setDate(prior30Start.getDate() - 30);

  const momentum: MomentumStats = {
    totalInterviews,
    peopleMet: peopleNames.size,
    messagesSent,
    companiesExplored: allCompanies.length,
    stillWarm,
    activeInPipeline,
    activityLast30Days: countEventsInRange(last30Start, last30End),
    activityPrior30Days: countEventsInRange(prior30Start, prior30End),
  };

  // --- Source insights ---
  const sourceMap = new Map<string, { applications: number; interviews: number }>();
  for (const c of allCompanies) {
    const source = c.source?.trim() || 'Unknown';
    if (!sourceMap.has(source)) sourceMap.set(source, { applications: 0, interviews: 0 });
    const entry = sourceMap.get(source)!;
    if (['applied', 'active', 'waiting', 'offer', 'rejected'].includes(c.status)) {
      entry.applications++;
    }
    const companyInterviews = allInteractions.filter(
      (i) => i.company_id === c.id && isInterviewType(i.type)
    );
    entry.interviews += companyInterviews.length;
  }

  const sourceInsights: SourceInsight[] = [...sourceMap.entries()]
    .map(([source, data]) => ({ source, ...data }))
    .filter((s) => s.applications > 0 || s.interviews > 0)
    .sort((a, b) => b.interviews - a.interviews || b.applications - a.applications);

  const stillWarmCompanies = allCompanies
    .filter((c) => c.would_reapply)
    .map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      outcomeNotes: c.outcome_notes,
    }));

  return {
    reportWeekLabel: reportWeek.label,
    currentWeekLabel: currentWeek.label,
    workSearchActivities,
    weekWins,
    actionItems,
    momentum,
    sourceInsights,
    stillWarmCompanies,
  };
}

function endOfDayHelper(d: Date): Date {
  const out = new Date(d);
  out.setHours(23, 59, 59, 999);
  return out;
}

'use client';

interface Interaction {
  id: string;
  date: string;
  type: string;
  person_name: string | null;
  person_title: string | null;
  summary: string | null;
}

interface Message {
  id: string;
  date: string;
  direction: string;
  body: string;
}

interface TimelineEvent {
  id: string;
  date: Date;
  kind: 'added' | 'interaction' | 'message' | 'status';
  label: string;
  sublabel?: string;
  detail?: string;
  dot: string; // tailwind bg color class
}

interface Props {
  companyCreatedAt: string | null;
  companyUpdatedAt: string | null;
  companyStatus: string;
  statusChangedAt: string | null;
  interactions: Interaction[];
  messages: Message[];
}

const INTERACTION_LABELS: Record<string, string> = {
  application: 'Applied',
  screen: 'Phone Screen',
  technical: 'Technical Interview',
  behavioral: 'Behavioral Interview',
  onsite: 'Onsite Interview',
  panel: 'Panel Interview',
  offer: 'Offer Received',
  rejection: 'Rejection',
  coffee_chat: 'Coffee Chat',
  informational: 'Informational',
  follow_up: 'Follow-up',
};

const INTERACTION_DOT: Record<string, string> = {
  application: 'bg-persimmon-400',
  screen: 'bg-blue-400',
  technical: 'bg-blue-500',
  behavioral: 'bg-blue-400',
  onsite: 'bg-amber-400',
  panel: 'bg-amber-400',
  offer: 'bg-emerald-400',
  rejection: 'bg-zinc-500',
  coffee_chat: 'bg-amber-500',
  informational: 'bg-amber-500',
  follow_up: 'bg-sky-400',
};

// date-only strings (YYYY-MM-DD) are parsed as UTC by the Date constructor,
// which shifts them back a day in US timezones. Appending T00:00:00 forces local time.
function parseDate(s: string): Date {
  return s.length === 10 ? new Date(s + 'T00:00:00') : new Date(s);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function elapsed(days: number): string {
  if (days === 0) return 'same day';
  if (days === 1) return '1 day later';
  if (days < 7) return `${days} days later`;
  const weeks = Math.round(days / 7);
  if (weeks === 1) return '1 week later';
  if (weeks < 5) return `${weeks} weeks later`;
  const months = Math.round(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} later`;
}

const PRE_APPLICATION_STATUSES = new Set(['interested', 'watchlist']);

const STATUS_DISPLAY: Record<string, string> = {
  interested: 'Interested',
  applied: 'Applied',
  active: 'Active',
  waiting: 'Waiting',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  watchlist: 'Watchlist',
};

const STATUS_EVENT_DOT: Record<string, string> = {
  interested: 'bg-zinc-500',
  applied: 'bg-persimmon-400',
  active: 'bg-sky-400',
  waiting: 'bg-amber-400',
  offer: 'bg-emerald-400',
  rejected: 'bg-rose-500/90',
  withdrawn: 'bg-zinc-500',
  watchlist: 'bg-amber-400',
};

function hasInteractionType(interactions: Interaction[], t: string): boolean {
  const tNorm = t.toLowerCase();
  return interactions.some((i) => i.type.toLowerCase() === tNorm);
}

export default function Timeline({
  companyCreatedAt,
  companyUpdatedAt,
  companyStatus,
  statusChangedAt,
  interactions,
  messages,
}: Props) {
  const events: TimelineEvent[] = [];

  const hasApplicationInteraction = interactions.some(
    (i) => i.type.toLowerCase() === 'application'
  );

  const shouldShowStatusEvent = (() => {
    if (!statusChangedAt) return false;
    const s = companyStatus.toLowerCase();
    if (s === 'interested') return false;
    if (s === 'applied' && hasApplicationInteraction) return false;
    if (s === 'rejected' && hasInteractionType(interactions, 'rejection')) return false;
    if (s === 'offer' && hasInteractionType(interactions, 'offer')) return false;
    return true;
  })();

  if (companyCreatedAt && !hasApplicationInteraction) {
    // Only treat creation as "Applied" when status was set post-application at insert
    // time. If status_changed_at is present, a separate event captures when they
    // actually applied. If the record was later updated but status_changed_at is
    // missing, fall back to the pre-application label.
    const wasUpdatedAfterCreation =
      companyUpdatedAt != null &&
      companyCreatedAt != null &&
      companyUpdatedAt !== companyCreatedAt;
    const appliedAtCreation =
      !PRE_APPLICATION_STATUSES.has(companyStatus) &&
      !statusChangedAt &&
      !wasUpdatedAfterCreation;
    const creationLabel = appliedAtCreation
      ? 'Applied'
      : statusChangedAt && companyStatus.toLowerCase() === 'applied'
        ? 'Interested'
        : 'Added to tracker';
    events.push({
      id: 'added',
      date: parseDate(companyCreatedAt),
      kind: 'added',
      label: creationLabel,
      dot: appliedAtCreation ? 'bg-persimmon-400' : 'bg-zinc-500',
    });
  }

  for (const i of interactions) {
    const typeKey = i.type.toLowerCase().replace(/\s+/g, '_');
    const label = INTERACTION_LABELS[typeKey] ?? i.type;
    const sublabel = i.person_name
      ? `${i.person_name}${i.person_title ? ` · ${i.person_title}` : ''}`
      : undefined;
    events.push({
      id: i.id,
      date: parseDate(i.date),
      kind: 'interaction',
      label,
      sublabel,
      detail: i.summary ?? undefined,
      dot: INTERACTION_DOT[typeKey] ?? 'bg-zinc-400',
    });
  }

  for (const m of messages) {
    const preview = m.body.length > 80 ? m.body.slice(0, 80).trimEnd() + '…' : m.body;
    events.push({
      id: m.id,
      date: parseDate(m.date),
      kind: 'message',
      label: m.direction === 'sent' ? 'Message sent' : 'Message received',
      detail: preview,
      dot: 'bg-amber-400',
    });
  }

  if (shouldShowStatusEvent && statusChangedAt) {
    const sKey = companyStatus.toLowerCase();
    const title = STATUS_DISPLAY[sKey] ?? companyStatus;
    // For applied, show "Applied" to mirror the application interaction label
    const label = sKey === 'applied' ? 'Applied' : `Status: ${title}`;
    events.push({
      id: 'status',
      date: new Date(statusChangedAt),
      kind: 'status',
      label,
      dot: STATUS_EVENT_DOT[sKey] ?? 'bg-persimmon-400',
    });
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-900 rounded-lg shadow p-6">
      <h2 className="font-display text-2xl font-semibold text-zinc-100 mb-6">Timeline</h2>
      <ol className="relative">
        {events.map((event, idx) => {
          const prev = idx > 0 ? events[idx - 1] : null;
          const gap = prev ? daysBetween(prev.date, event.date) : null;
          const isLast = idx === events.length - 1;

          return (
            <li key={event.id} className="flex gap-4">
              {/* Left: connector line + dot */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${event.dot}`} />
                {!isLast && <div className="w-px flex-1 bg-zinc-700 my-1" />}
              </div>

              {/* Right: content */}
              <div className={`pb-6 ${isLast ? '' : ''}`}>
                <p className="text-xs text-zinc-500 font-mono">{formatDate(event.date)}</p>
                {gap !== null && gap > 0 && (
                  <p className="text-xs text-zinc-600 italic mb-0.5">{elapsed(gap)}</p>
                )}
                <p className="text-sm font-medium text-zinc-100">{event.label}</p>
                {event.sublabel && (
                  <p className="text-xs text-zinc-400 mt-0.5">{event.sublabel}</p>
                )}
                {event.detail && (
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{event.detail}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

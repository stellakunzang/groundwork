'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { InsightsData } from '@/src/lib/insights-types';
import { formatWorkSearchReport } from '@/src/lib/insights-report';
import { formatShortDate } from '@/src/lib/dates';

type Props = InsightsData;

const PRIORITY_STYLES = {
  high: 'border-rose-800/60 bg-rose-950/30',
  medium: 'border-amber-800/50 bg-amber-950/25',
  low: 'border-zinc-700 bg-zinc-800/40',
};

const PRIORITY_LABELS = {
  high: 'Do today',
  medium: 'This week',
  low: 'When you can',
};

function StatCard({
  value,
  label,
  sub,
}: {
  value: number | string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <p className="font-display text-4xl font-light text-persimmon-300">{value}</p>
      <p className="text-sm font-medium text-zinc-200 mt-1">{label}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function MomentumDashboard({
  reportWeekLabel,
  currentWeekLabel,
  workSearchActivities,
  weekWins,
  actionItems,
  momentum,
  sourceInsights,
  stillWarmCompanies,
}: Props) {
  const [copied, setCopied] = useState(false);
  const reportText = formatWorkSearchReport(reportWeekLabel, workSearchActivities);

  const activityDelta = momentum.activityLast30Days - momentum.activityPrior30Days;
  const activityTrend =
    activityDelta > 0
      ? `↑ ${activityDelta} more than prior 30 days`
      : activityDelta < 0
        ? `${Math.abs(activityDelta)} fewer than prior 30 days`
        : 'Same as prior 30 days';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the textarea
    }
  };

  return (
    <div className="space-y-10">
      {/* Momentum hero */}
      <section>
        <p className="text-sm text-zinc-500 mb-4 tracking-wide">
          The numbers that matter — effort, connections, and momentum
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard value={momentum.totalInterviews} label="Interviews" sub="practice reps" />
          <StatCard value={momentum.peopleMet} label="People met" sub="your network" />
          <StatCard value={momentum.messagesSent} label="Messages sent" sub="outreach" />
          <StatCard value={momentum.companiesExplored} label="Companies explored" />
          <StatCard value={momentum.stillWarm} label="Still warm" sub="would reapply" />
          <StatCard
            value={momentum.activityLast30Days}
            label="Activities (30d)"
            sub={activityTrend}
          />
        </div>
      </section>

      <section className="bg-zinc-900 border border-persimmon-800/40 rounded-lg p-6 shadow-[0_0_24px_rgba(255,77,154,0.12)]">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-zinc-100">
              Weekly activity report
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {reportWeekLabel}
              <span className="text-zinc-600 ml-2">(last completed Sunday–Saturday)</span>
            </p>
            <p className="text-xs text-zinc-500 mt-2">
              A copy-paste log of applications, interviews, and outreach from that week.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 px-4 py-2 text-sm font-medium text-zinc-950 bg-persimmon-300 hover:bg-persimmon-200 rounded-md transition-colors"
          >
            {copied ? 'Copied!' : 'Copy report'}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full border ${
              workSearchActivities.length >= 3
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                : 'bg-amber-950/40 text-amber-300 border-amber-800'
            }`}
          >
            {workSearchActivities.length} activit{workSearchActivities.length === 1 ? 'y' : 'ies'} logged
          </span>
          {workSearchActivities.length < 3 && (
            <span className="text-xs text-amber-400/90">
              Three or more entries makes a solid week.
            </span>
          )}
        </div>

        <textarea
          readOnly
          value={reportText}
          rows={Math.min(12, Math.max(4, workSearchActivities.length + 3))}
          className="w-full px-4 py-3 bg-zinc-950 text-zinc-300 text-sm font-mono border border-zinc-700 rounded-md resize-y focus:outline-none focus:border-persimmon-600"
          onFocus={(e) => e.target.select()}
        />
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Week wins */}
        <section className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h2 className="font-display text-2xl font-semibold text-zinc-100 mb-1">
            Wins this week
          </h2>
          <p className="text-sm text-zinc-500 mb-5">
            {currentWeekLabel}
            <span className="text-zinc-600 ml-2">(current Sun – Sat week)</span>
          </p>

          {weekWins.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">
              No wins logged yet for this week. Applications show up when status is set to{' '}
              <span className="text-zinc-400">Applied</span> (on create or when you update a lead).
              <Link href="/companies/new" className="text-persimmon-400 hover:text-persimmon-300 ml-1">
                Open a new chapter →
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {weekWins.map((win) => (
                <li key={win.id} className="flex gap-3">
                  <span className="text-persimmon-400 mt-0.5">✦</span>
                  <div>
                    <p className="text-sm text-zinc-100">
                      {win.companyId ? (
                        <Link
                          href={`/companies/${win.companyId}`}
                          className="hover:text-persimmon-300 transition-colors"
                        >
                          {win.label}
                        </Link>
                      ) : (
                        win.label
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      {formatShortDate(win.date)}
                      {win.detail ? ` · ${win.detail}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Action items */}
        <section className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h2 className="font-display text-2xl font-semibold text-zinc-100 mb-1">
            Action items
          </h2>
          <p className="text-sm text-zinc-500 mb-5">Follow-ups and next steps</p>

          {actionItems.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">
              You&apos;re caught up — nothing urgent on your list.
            </p>
          ) : (
            <ul className="space-y-3">
              {actionItems.slice(0, 8).map((item) => (
                <li
                  key={item.id}
                  className={`rounded-lg border p-3 ${PRIORITY_STYLES[item.priority]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-100">
                      {item.companyId ? (
                        <Link
                          href={`/companies/${item.companyId}`}
                          className="hover:text-persimmon-300 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        item.label
                      )}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 shrink-0">
                      {PRIORITY_LABELS[item.priority]}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Source insights */}
        <section className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h2 className="font-display text-2xl font-semibold text-zinc-100 mb-1">
            What&apos;s working
          </h2>
          <p className="text-sm text-zinc-500 mb-5">Sources that led to interviews</p>

          {sourceInsights.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">Add a source when creating companies to track this.</p>
          ) : (
            <ul className="space-y-4">
              {sourceInsights.slice(0, 6).map((s) => {
                const maxInterviews = Math.max(...sourceInsights.map((x) => x.interviews), 1);
                const width = s.interviews > 0 ? (s.interviews / maxInterviews) * 100 : 0;
                return (
                  <li key={s.source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-200">{s.source}</span>
                      <span className="text-zinc-500 font-mono text-xs">
                        {s.interviews} interview{s.interviews !== 1 ? 's' : ''} · {s.applications} applied
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-persimmon-500 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Still warm */}
        <section className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h2 className="font-display text-2xl font-semibold text-zinc-100 mb-1">
            Still warm
          </h2>
          <p className="text-sm text-zinc-500 mb-5">
            Connections worth keeping alive — rejections aren&apos;t the whole story
          </p>

          {stillWarmCompanies.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">
              Mark &ldquo;Would reapply&rdquo; on companies where the door stayed open.
            </p>
          ) : (
            <ul className="space-y-3">
              {stillWarmCompanies.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/companies/${c.id}`}
                    className="block hover:bg-zinc-800/50 -mx-2 px-2 py-2 rounded-md transition-colors"
                  >
                    <p className="text-sm font-medium text-zinc-100">
                      {c.name}
                      {c.role && <span className="text-zinc-500 font-normal"> · {c.role}</span>}
                    </p>
                    {c.outcomeNotes && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{c.outcomeNotes}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

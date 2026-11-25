'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  role: string | null;
  status: string;
  comp_range: string | null;
  stack: string | null;
  remote_policy: string | null;
  company_stage: string | null;
  source: string | null;
  careers_url: string | null;
  notes: string | null;
  outcome_notes: string | null;
  would_reapply: boolean | null;
  status_changed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  ghosted?: boolean;
}

const STATUS_ORDER = [
  'offer',
  'active',
  'waiting',
  'applied',
  'ghosted',
  'rejected',
  'interested',
  'withdrawn',
  'watchlist',
];

const STATUS_LABELS: Record<string, string> = {
  interested: 'Interested',
  applied: 'Applied',
  active: 'Active',
  waiting: 'Waiting',
  offer: 'Offer',
  ghosted: 'Ghosted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  watchlist: 'Watchlist',
};

const STATUS_COLORS: Record<string, string> = {
  interested: 'bg-zinc-800 text-zinc-400 border-zinc-600',
  applied: 'bg-persimmon-900/40 text-persimmon-300 border-persimmon-700',
  active: 'bg-teal-900/40 text-teal-300 border-teal-700',
  waiting: 'bg-amber-900/40 text-amber-300 border-amber-700',
  offer: 'bg-persimmon-900/50 text-persimmon-200 border-persimmon-500',
  ghosted: 'bg-stone-900/70 text-stone-400 border-stone-600',
  rejected: 'bg-red-950/55 text-red-200 border-red-800/70',
  withdrawn: 'bg-slate-900/40 text-slate-500 border-slate-700',
  watchlist: 'bg-amber-900/40 text-amber-300 border-amber-700',
};

function groupStatus(company: Company): string {
  if (company.ghosted) return 'ghosted';
  return company.status || 'applied';
}

function sortDate(company: Company): string {
  return company.status_changed_at ?? company.updated_at ?? company.created_at ?? '';
}

function byNewest(a: Company, b: Company): number {
  return sortDate(b).localeCompare(sortDate(a));
}

function CompanyCard({ company }: { company: Company }) {
  const status = groupStatus(company);
  return (
    <Link
      href={`/companies/${company.id}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-persimmon-700/60 hover:shadow-[0_0_16px_rgba(255,77,154,0.22)] transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">{company.name}</h3>
          {company.role && <p className="text-sm text-zinc-400 mt-1">{company.role}</p>}
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded border whitespace-nowrap ${
            STATUS_COLORS[status] || STATUS_COLORS.applied
          }`}
        >
          {STATUS_LABELS[status] || status}
        </span>
      </div>

      {company.comp_range && (
        <div className="text-sm text-zinc-400 mb-2">
          <span className="font-medium">Comp:</span> {company.comp_range}
        </div>
      )}

      {company.stack && (
        <div className="text-sm text-zinc-400 mb-2">
          <span className="font-medium">Stack:</span> {company.stack}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {company.remote_policy && (
          <span className="px-2 py-1 text-xs bg-zinc-800 text-zinc-300 rounded">
            {company.remote_policy}
          </span>
        )}
        {company.would_reapply && (
          <span className="px-2 py-1 text-xs bg-amber-900/40 text-amber-400 rounded">
            Would reapply
          </span>
        )}
      </div>

      {company.notes && (
        <p className="text-sm text-zinc-500 mt-3 line-clamp-2">{company.notes}</p>
      )}
    </Link>
  );
}

function OfferCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="offer-spotlight block p-6 sm:p-8 transition-transform duration-200 hover:scale-[1.01]"
    >
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="offer-sparkle text-persimmon-300 text-sm">✦</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-persimmon-300">
              Offer received
            </span>
            <span className="offer-sparkle text-teal-300 text-sm" style={{ animationDelay: '0.4s' }}>
              ✦
            </span>
          </div>
          <h3 className="font-display text-3xl sm:text-4xl font-semibold text-gradient leading-tight">
            {company.name}
          </h3>
          {company.role && (
            <p className="mt-2 text-lg text-zinc-300">{company.role}</p>
          )}
          {company.comp_range && (
            <p className="mt-3 text-sm text-zinc-400">
              <span className="text-zinc-500">Comp</span> {company.comp_range}
            </p>
          )}
          {company.outcome_notes && (
            <p className="mt-4 text-sm text-zinc-400 line-clamp-3 max-w-2xl">
              {company.outcome_notes}
            </p>
          )}
        </div>
        <span className="shrink-0 self-start px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-md border border-persimmon-500/70 bg-persimmon-900/40 text-persimmon-200">
          Offer
        </span>
      </div>
    </Link>
  );
}

function OfferSpotlight({ companies }: { companies: Company[] }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-display text-lg text-gradient">You got the offer</h2>
        <span className="text-xs text-persimmon-400/80">{companies.length}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-persimmon-700/60 via-persimmon-500/25 to-transparent" />
      </div>
      <div className="space-y-4">
        {companies.map((company) => (
          <OfferCard key={company.id} company={company} />
        ))}
      </div>
    </section>
  );
}

export default function PipelineView({ companies }: { companies: Company[] }) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const groupedCompanies = companies.reduce(
    (acc, company) => {
      const status = groupStatus(company);
      if (!acc[status]) acc[status] = [];
      acc[status].push(company);
      return acc;
    },
    {} as Record<string, Company[]>
  );

  for (const list of Object.values(groupedCompanies)) {
    list.sort(byNewest);
  }

  const sections = (
    selectedStatus ? [selectedStatus] : STATUS_ORDER
  ).filter((status) => (groupedCompanies[status]?.length ?? 0) > 0);

  const totalVisible = sections.reduce(
    (sum, status) => sum + (groupedCompanies[status]?.length ?? 0),
    0
  );

  return (
    <div>
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedStatus(null)}
          className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
            selectedStatus === null
              ? 'bg-persimmon-300 text-zinc-950 border-persimmon-300'
              : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
          }`}
        >
          All ({companies.length})
        </button>
        {STATUS_ORDER.map((status) => {
          const count = groupedCompanies[status]?.length || 0;
          if (count === 0) return null;
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                selectedStatus === status
                  ? STATUS_COLORS[status]
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              {STATUS_LABELS[status] || status} ({count})
            </button>
          );
        })}
      </div>

      {totalVisible === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-3xl text-zinc-400 italic mb-2">
            ❝ Your story hasn&apos;t started yet ❞
          </p>
          <p className="text-zinc-500 text-sm mb-6">Open the first chapter to begin your quest.</p>
          <Link
            href="/companies/new"
            className="inline-block px-5 py-2.5 text-sm font-medium text-zinc-950 bg-persimmon-300 hover:bg-persimmon-200 rounded-md transition-colors"
          >
            📖 Open a New Chapter
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((status) => {
            const list = groupedCompanies[status] || [];
            if (status === 'offer') {
              return <OfferSpotlight key={status} companies={list} />;
            }
            return (
              <section key={status}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
                    {STATUS_LABELS[status] || status}
                  </h2>
                  <span className="text-xs text-zinc-600">{list.length}</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

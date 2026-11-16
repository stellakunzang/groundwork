import { db } from '@/src/db/db';
import { companies } from '@/src/db/schema';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WatchlistPage() {
  const allCompanies = await db.select().from(companies);
  const watchlistCompanies = allCompanies.filter(
    (c) => c.would_reapply || c.status === 'watchlist'
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="font-display text-4xl font-light italic text-zinc-100">Watchlist</h2>
        <p className="text-sm text-zinc-500 mt-1 tracking-wide">
          Companies you marked to watch or would reapply to
        </p>
      </div>

      {watchlistCompanies.length === 0 ? (
        <div className="bg-zinc-900 rounded-lg p-10 text-center">
          <p className="font-display text-3xl font-light italic text-zinc-400 mb-2">
            No companies on your watchlist yet
          </p>
          <p className="text-zinc-500 text-sm mb-6">
            Mark &ldquo;Would reapply (watchlist)&rdquo; on a company, or set status to Watchlist.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-persimmon-300 text-zinc-950 rounded-md hover:bg-persimmon-200 text-sm font-medium transition-colors"
          >
            Back to home
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 bg-amber-950/40 border border-amber-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-300 mb-1">
              Automated careers page monitoring (coming soon)
            </h3>
            <p className="text-sm text-amber-400/80">
              This will watch these companies&apos; careers pages and notify you when a matching role
              appears.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {watchlistCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="block bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-persimmon-700/60 hover:shadow-[0_0_16px_rgba(255,77,154,0.22)] transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">{company.name}</h3>
                    {company.role && (
                      <p className="text-sm text-zinc-400 mt-1">{company.role}</p>
                    )}
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-amber-900/40 text-amber-300 border border-amber-700 rounded">
                    Watchlist
                  </span>
                </div>

                {company.careers_url ? (
                  <div className="text-sm text-persimmon-400 hover:underline mb-2 truncate">
                    {company.careers_url}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500 mb-2">No careers URL added yet</div>
                )}

                {company.outcome_notes && (
                  <p className="text-sm text-zinc-400 line-clamp-2 mt-2">
                    {company.outcome_notes}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

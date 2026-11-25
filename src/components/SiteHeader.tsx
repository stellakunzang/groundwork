import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="bg-zinc-900 shimmer-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <Link href="/" className="group">
              <h1 className="font-display text-5xl font-light italic text-gradient leading-none">
                Groundwork
              </h1>
              <p className="text-[11px] tracking-[0.28em] text-zinc-500 uppercase mt-2">
                ✦ where every quest begins ✦
              </p>
            </Link>

            <nav className="flex gap-3 items-center">
              <Link
                href="/insights"
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
              >
                Momentum
              </Link>
              <Link
                href="/contacts"
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
              >
                Contacts
              </Link>
              <Link
                href="/watchlist"
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
              >
                Watchlist
              </Link>
              <Link
                href="/companies/new"
                className="px-4 py-2 text-sm font-medium text-zinc-950 bg-persimmon-300 hover:bg-persimmon-200 rounded-md transition-colors"
              >
                📖 Open a New Chapter
              </Link>
            </nav>
          </div>
        </div>
    </header>
  );
}

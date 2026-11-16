import { getInsightsData } from '@/src/lib/insights';
import MomentumDashboard from '@/src/components/insights/MomentumDashboard';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const data = await getInsightsData();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="font-display text-4xl font-light italic text-zinc-100">Momentum</h2>
        <p className="text-sm text-zinc-500 mt-1 tracking-wide">
          Your search by the numbers — effort, conversations, and what happened this week
        </p>
      </div>

      <MomentumDashboard {...data} />
    </main>
  );
}

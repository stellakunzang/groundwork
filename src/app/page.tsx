import { db } from '@/src/db/db';
import { companies, interactions, messages } from '@/src/db/schema';
import { isGhosted } from '@/src/lib/ghosted';
import PipelineView from '@/src/components/pipeline/PipelineView';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [allCompanies, allInteractions, allMessages] = await Promise.all([
    db.select().from(companies),
    db.select().from(interactions),
    db.select().from(messages),
  ]);

  const companiesWithGhosted = allCompanies.map((company) => ({
    ...company,
    ghosted: isGhosted(company, allInteractions, allMessages),
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PipelineView companies={companiesWithGhosted} />
    </main>
  );
}

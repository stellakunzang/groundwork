import { db } from '@/src/db/db';
import { companies, interactions, contacts, debriefs, messages } from '@/src/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import CompanyDetailView from '@/src/components/CompanyDetailView';

export const dynamic = 'force-dynamic';

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [company] = await db.select().from(companies).where(eq(companies.id, id));

  if (!company) {
    notFound();
  }

  const companyInteractions = await db
    .select()
    .from(interactions)
    .where(eq(interactions.company_id, id));

  const companyContacts = await db
    .select()
    .from(contacts)
    .where(eq(contacts.company_id, id));

  const interactionIds = companyInteractions.map((i) => i.id);
  const [companyDebriefs, companyMessages] = await Promise.all([
    interactionIds.length > 0
      ? db.select().from(debriefs).where(inArray(debriefs.interaction_id, interactionIds))
      : Promise.resolve([]),
    db.select().from(messages).where(eq(messages.company_id, id)),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CompanyDetailView
        company={company}
        interactions={companyInteractions}
        contacts={companyContacts}
        debriefs={companyDebriefs}
        messages={companyMessages}
      />
    </main>
  );
}

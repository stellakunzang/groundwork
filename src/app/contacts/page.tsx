import { db } from '@/src/db/db';
import { contacts, companies } from '@/src/db/schema';
import ContactList from '@/src/components/contacts/ContactList';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const allContacts = await db.select().from(contacts);
  const allCompanies = await db.select().from(companies);

  const companyMap = allCompanies.reduce((acc, company) => {
    acc[company.id] = company.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="font-display text-4xl font-light italic text-zinc-100">Contacts</h2>
        <p className="text-sm text-zinc-500 mt-1 tracking-wide">The allies you&apos;ve met along the way</p>
      </div>
      <ContactList contacts={allContacts} companies={allCompanies} companyMap={companyMap} />
    </main>
  );
}

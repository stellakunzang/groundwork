import { db } from './db'
import {
  companies,
  interactions,
  contacts,
  debriefs,
  messages,
  watchlist_checks,
} from './schema'
import { randomUUID } from 'crypto'

/**
 * Fictional sample drawn from Parks and Recreation.
 * Refuses to touch a database that already has companies unless SEED_FORCE=1.
 */
async function seed() {
  const existing = await db.select({ id: companies.id }).from(companies)
  if (existing.length > 0 && process.env.SEED_FORCE !== '1') {
    console.log('Database already has companies. Refusing to seed.')
    console.log('Set SEED_FORCE=1 to replace existing rows with the sample.')
    return
  }

  if (process.env.SEED_FORCE === '1') {
    console.log('SEED_FORCE=1 — replacing existing rows')
    await db.delete(watchlist_checks)
    await db.delete(messages)
    await db.delete(debriefs)
    await db.delete(interactions)
    await db.delete(contacts)
    await db.delete(companies)
  }

  console.log('Seeding database...')

  const gryzzlId = randomUUID()
  const veryGoodId = randomUUID()
  const entertainmentId = randomUUID()
  const sweetumsId = randomUUID()
  const rentASwagId = randomUUID()

  const companiesData = [
    {
      id: gryzzlId,
      name: 'Gryzzl',
      role: 'Senior Software Engineer',
      status: 'active',
      comp_range: '$180k–$220k',
      stack: 'TypeScript, React, PostgreSQL',
      remote_policy: 'Hybrid — Pawnee campus or remote',
      company_stage: 'Growth',
      source: 'Referral',
      notes:
        'They put a Gryzzl Box on every block in Pawnee and now need people to build what shows up on it.',
      interviewed: true,
      created_at: '2026-10-20T12:00:00.000Z',
      status_changed_at: '2026-11-10T12:00:00.000Z',
      updated_at: '2026-11-12T12:00:00.000Z',
    },
    {
      id: veryGoodId,
      name: 'Very Good Building Company',
      role: 'Generalist',
      status: 'offer',
      comp_range: 'Enough',
      stack: 'Wood, breakfast, the occasional spreadsheet',
      remote_policy: 'On-site, shop hours',
      company_stage: 'Private',
      source: 'Coffee chat',
      notes:
        'The entire interview was conducted in a woodshop. Ron asked if the candidate could be left alone.',
      outcome_notes: 'Offer is a handshake and a set of shop keys.',
      interviewed: true,
      created_at: '2026-10-01T12:00:00.000Z',
      status_changed_at: '2026-11-14T12:00:00.000Z',
      updated_at: '2026-11-14T12:00:00.000Z',
    },
    {
      id: entertainmentId,
      name: 'Entertainment 720',
      role: 'Head of Vibes',
      status: 'rejected',
      comp_range: 'Mostly equity, some club soda',
      stack: 'Parties, loose ideas',
      remote_policy: 'Wherever the party is',
      company_stage: 'Pre-seed',
      source: 'Recruiter Outreach',
      notes: 'Business in the front, party in the back. The company did not survive the back.',
      outcome_notes:
        'Folded before a final round. Tom said the vibes were immaculate anyway.',
      would_reapply: false,
      interviewed: true,
      created_at: '2026-09-01T12:00:00.000Z',
      status_changed_at: '2026-09-28T12:00:00.000Z',
      updated_at: '2026-09-28T12:00:00.000Z',
    },
    {
      id: sweetumsId,
      name: 'Sweetums',
      role: 'Software Engineer, Internal Tools',
      status: 'applied',
      comp_range: '$140k–$160k',
      stack: 'Java, a lot of sugar',
      remote_policy: 'On-site, Pawnee plant',
      company_stage: 'Private',
      source: 'Direct Application',
      notes: 'Candy conglomerate. The office smells like syrup. Nobody has written back.',
      would_reapply: true,
      created_at: '2026-08-03T12:00:00.000Z',
      status_changed_at: '2026-08-03T12:00:00.000Z',
      updated_at: '2026-08-03T12:00:00.000Z',
    },
    {
      id: rentASwagId,
      name: 'Rent-A-Swag',
      role: 'Founding Engineer',
      status: 'watchlist',
      stack: 'Unknown, allegedly "the cloud"',
      remote_policy: 'Remote, dress code is not',
      company_stage: 'Idea',
      source: 'LinkedIn',
      notes:
        'Clothing rental. Not hiring engineers yet. Tom insists they will be extremely hiring by spring.',
      created_at: '2026-11-01T12:00:00.000Z',
      status_changed_at: '2026-11-01T12:00:00.000Z',
      updated_at: '2026-11-01T12:00:00.000Z',
    },
  ]

  await db.insert(companies).values(companiesData)
  for (const company of companiesData) {
    console.log(`  added company: ${company.name}`)
  }

  await db.insert(contacts).values([
    {
      id: randomUUID(),
      name: 'Ben Wyatt',
      company_id: gryzzlId,
      title: 'Director of Operations',
      relationship: 'Interviewed with',
      notes: 'Likes a small, boring design. Has opinions about calendars.',
      created_at: '2026-11-10T12:00:00.000Z',
      updated_at: '2026-11-10T12:00:00.000Z',
    },
    {
      id: randomUUID(),
      name: 'Ron Swanson',
      company_id: veryGoodId,
      title: 'Owner',
      relationship: 'Offer conversation',
      notes: 'Does not believe in meetings. Breakfast food is a love language.',
      created_at: '2026-11-14T12:00:00.000Z',
      updated_at: '2026-11-14T12:00:00.000Z',
    },
    {
      id: randomUUID(),
      name: 'Tom Haverford',
      company_id: entertainmentId,
      title: 'Co-founder',
      relationship: 'Recruiter contact',
      notes: 'Still texts. The company does not.',
      created_at: '2026-09-18T12:00:00.000Z',
      updated_at: '2026-09-18T12:00:00.000Z',
    },
  ])

  const gryzzlInterviewId = randomUUID()
  await db.insert(interactions).values([
    {
      id: gryzzlInterviewId,
      company_id: gryzzlId,
      date: '2026-11-10',
      type: 'technical',
      person_name: 'Ben Wyatt',
      person_title: 'Director of Operations',
      duration: '45 min',
      summary:
        'System design for local recommendations. Ben kept the scope small, which helped.',
      thank_you_sent: true,
    },
    {
      id: randomUUID(),
      company_id: veryGoodId,
      date: '2026-11-14',
      type: 'offer',
      person_name: 'Ron Swanson',
      person_title: 'Owner',
      summary: 'Handshake offer. The shop keys were already on the bench.',
    },
    {
      id: randomUUID(),
      company_id: entertainmentId,
      date: '2026-09-18',
      type: 'screen',
      person_name: 'Tom Haverford',
      person_title: 'Co-founder',
      duration: '20 min',
      summary: 'Mostly a tour of a mood board. Jean-Ralphio walked in halfway through.',
    },
    {
      id: randomUUID(),
      company_id: sweetumsId,
      date: '2026-08-03',
      type: 'application',
      summary: 'Applied online for an internal-tools role at the plant.',
    },
  ])

  await db.insert(debriefs).values({
    id: randomUUID(),
    interaction_id: gryzzlInterviewId,
    went_well: 'Talked through a boring, reliable design. Ben liked that it was boring.',
    caught_off_guard: 'A question about calendars. He has a system.',
    do_differently: 'Draw the data model before talking.',
    learned_about_company: 'The Pawnee office is mostly snack tables and Gryzzl Boxes.',
    energy_check: 'High. Would take the job.',
  })

  await db.insert(messages).values({
    id: randomUUID(),
    company_id: gryzzlId,
    date: '2026-11-12',
    direction: 'sent',
    body: 'Ben — thanks for the conversation on Tuesday. I liked how small you kept the recommendation service. Happy to talk through the data model whenever it is useful.\n\n— A candidate who has never been to Pawnee',
  })

  console.log('Database seeded.')
  console.log('  Companies: 5')
  console.log('  Contacts: 3')
  console.log('  Interactions: 4')
  console.log('  Debriefs: 1')
  console.log('  Messages: 1')
}

seed()
  .catch(error => {
    console.error('Error seeding database:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })

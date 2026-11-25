import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Companies table
export const companies = sqliteTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role'),
  status: text('status').notNull().default('interested'), // interested | applied | active | waiting | offer | rejected | withdrawn | watchlist
  comp_range: text('comp_range'),
  stack: text('stack'),
  remote_policy: text('remote_policy'),
  company_stage: text('company_stage'),
  source: text('source'),
  careers_url: text('careers_url'),
  notes: text('notes'),
  outcome_notes: text('outcome_notes'),
  would_reapply: integer('would_reapply', { mode: 'boolean' }).default(false),
  interviewed: integer('interviewed', { mode: 'boolean' }).default(false),
  status_changed_at: text('status_changed_at'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Interactions table
export const interactions = sqliteTable('interactions', {
  id: text('id').primaryKey(),
  company_id: text('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  type: text('type').notNull(), // application | screen | technical | onsite | offer | rejection | etc
  person_name: text('person_name'),
  person_title: text('person_title'),
  duration: text('duration'),
  summary: text('summary'),
  thank_you_sent: integer('thank_you_sent', { mode: 'boolean' }).default(false),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Debriefs table
export const debriefs = sqliteTable('debriefs', {
  id: text('id').primaryKey(),
  interaction_id: text('interaction_id')
    .notNull()
    .unique()
    .references(() => interactions.id, { onDelete: 'cascade' }),
  went_well: text('went_well'),
  caught_off_guard: text('caught_off_guard'),
  do_differently: text('do_differently'),
  learned_about_company: text('learned_about_company'),
  energy_check: text('energy_check'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Contacts table
export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company_id: text('company_id').references(() => companies.id, { onDelete: 'set null' }),
  title: text('title'),
  email: text('email'),
  linkedin_url: text('linkedin_url'),
  relationship: text('relationship'),
  notes: text('notes'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Messages table (copy-paste correspondence log)
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  company_id: text('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  direction: text('direction').notNull(), // 'sent' | 'received'
  body: text('body').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Watchlist checks table
export const watchlist_checks = sqliteTable('watchlist_checks', {
  id: text('id').primaryKey(),
  company_id: text('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  checked_at: text('checked_at').default(sql`CURRENT_TIMESTAMP`),
  jobs_found: text('jobs_found'), // JSON array of job postings found
  matched: integer('matched', { mode: 'boolean' }).default(false),
  notified: integer('notified', { mode: 'boolean' }).default(false),
});

import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/src/db/db';
import {
  companies,
  contacts,
  debriefs,
  interactions,
  messages,
  watchlist_checks,
} from '@/src/db/schema';
import { DELETE, GET, PATCH, POST } from '@/src/app/api/companies/route';
import { POST as createInteraction } from '@/src/app/api/interactions/route';

async function reset() {
  await db.delete(watchlist_checks);
  await db.delete(messages);
  await db.delete(debriefs);
  await db.delete(interactions);
  await db.delete(contacts);
  await db.delete(companies);
}

function jsonRequest(path: string, method: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(reset);

describe('companies API', () => {
  it('creates a company and lists it', async () => {
    const created = await POST(
      jsonRequest('/api/companies', 'POST', {
        name: 'Gryzzl',
        role: 'Senior Software Engineer',
        status: 'interested',
      })
    );
    expect(created.status).toBe(201);
    const company = await created.json();

    const listed = await GET();
    const all = await listed.json();
    expect(all).toEqual([
      expect.objectContaining({
        id: company.id,
        name: 'Gryzzl',
        status: 'interested',
      }),
    ]);
  });

  it('stamps status_changed_at on a status change and ignores a client-supplied stamp', async () => {
    const created = await POST(
      jsonRequest('/api/companies', 'POST', { name: 'Sweetums', status: 'interested' })
    );
    const company = await created.json();
    expect(company.status_changed_at).toBeNull();

    const patched = await PATCH(
      jsonRequest('/api/companies', 'PATCH', {
        id: company.id,
        status: 'applied',
        status_changed_at: null,
        created_at: '1999-01-01T00:00:00.000Z',
      })
    );
    expect(patched.status).toBe(200);
    const saved = await patched.json();

    expect(saved.status).toBe('applied');
    expect(saved.status_changed_at).toEqual(expect.any(String));
    expect(saved.created_at).not.toBe('1999-01-01T00:00:00.000Z');
  });

  it('requires an id to update or delete', async () => {
    const patched = await PATCH(jsonRequest('/api/companies', 'PATCH', { name: 'Nope' }));
    expect(patched.status).toBe(400);

    const removed = await DELETE(new Request('http://localhost/api/companies'));
    expect(removed.status).toBe(400);
  });
});

describe('interactions API', () => {
  it('marks the company as interviewed when the log entry is an interview', async () => {
    const created = await POST(
      jsonRequest('/api/companies', 'POST', { name: 'Gryzzl', status: 'active' })
    );
    const company = await created.json();
    expect(company.interviewed).toBeFalsy();

    const logged = await createInteraction(
      jsonRequest('/api/interactions', 'POST', {
        company_id: company.id,
        date: '2026-11-10',
        type: 'technical',
        person_name: 'Ben Wyatt',
        summary: 'System design',
      })
    );
    expect(logged.status).toBe(201);

    const [saved] = await db.select().from(companies);
    expect(saved.interviewed).toBe(true);
  });

  it('does not mark a company interviewed for an application log', async () => {
    const created = await POST(
      jsonRequest('/api/companies', 'POST', { name: 'Sweetums', status: 'applied' })
    );
    const company = await created.json();

    const logged = await createInteraction(
      jsonRequest('/api/interactions', 'POST', {
        company_id: company.id,
        date: '2026-08-03',
        type: 'application',
        summary: 'Applied online',
      })
    );
    expect(logged.status).toBe(201);

    const [saved] = await db.select().from(companies);
    expect(saved.interviewed).toBeFalsy();
  });
});

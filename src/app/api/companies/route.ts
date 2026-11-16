import { NextResponse } from 'next/server';
import { db } from '@/src/db/db';
import { companies } from '@/src/db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

// GET all companies
export async function GET() {
  try {
    const allCompanies = await db.select().from(companies);
    return NextResponse.json(allCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

// POST create new company
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const initialStatus = (data as { status?: string }).status ?? 'interested';
    const newCompany = {
      id: randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_changed_at:
        initialStatus !== 'interested' ? new Date().toISOString() : null,
    };

    await db.insert(companies).values(newCompany);
    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}

// PATCH update company
export async function PATCH(request: Request) {
  try {
    const { id, ...data } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    const [current] = await db.select().from(companies).where(eq(companies.id, id));
    if (!current) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const statusInPayload = 'status' in data;
    const statusChanged =
      statusInPayload && (data as { status?: string }).status !== current.status;

    // Server-owned fields — never accept from client (stale null would wipe applied date)
    const { status_changed_at: _ignored, created_at: _created, ...clientData } = data as Record<
      string,
      unknown
    >;

    const updated: Record<string, unknown> = {
      ...clientData,
      updated_at: new Date().toISOString(),
    };
    if (statusChanged) {
      updated.status_changed_at = new Date().toISOString();
    }

    await db.update(companies).set(updated).where(eq(companies.id, id));

    const [saved] = await db.select().from(companies).where(eq(companies.id, id));
    return NextResponse.json(saved);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

// DELETE company
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    await db.delete(companies).where(eq(companies.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}

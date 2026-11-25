import { NextResponse } from 'next/server';
import { db } from '@/src/db/db';
import { companies, interactions } from '@/src/db/schema';
import { isInterviewType } from '@/src/lib/interview-types';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

// POST create new interaction
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newInteraction = {
      id: randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };

    await db.insert(interactions).values(newInteraction);

    if (isInterviewType(newInteraction.type) && newInteraction.company_id) {
      await db
        .update(companies)
        .set({ interviewed: true, updated_at: new Date().toISOString() })
        .where(eq(companies.id, newInteraction.company_id));
    }

    return NextResponse.json(newInteraction, { status: 201 });
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 });
  }
}

// PATCH update interaction
export async function PATCH(request: Request) {
  try {
    const { id, ...data } = await request.json();

    await db.update(interactions).set(data).where(eq(interactions.id, id));
    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error('Error updating interaction:', error);
    return NextResponse.json({ error: 'Failed to update interaction' }, { status: 500 });
  }
}

// DELETE interaction
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Interaction ID required' }, { status: 400 });
    }

    await db.delete(interactions).where(eq(interactions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting interaction:', error);
    return NextResponse.json({ error: 'Failed to delete interaction' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/src/db/db';
import { debriefs } from '@/src/db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

// POST create new debrief
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newDebrief = {
      id: randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.insert(debriefs).values(newDebrief);
    return NextResponse.json(newDebrief, { status: 201 });
  } catch (error) {
    console.error('Error creating debrief:', error);
    return NextResponse.json({ error: 'Failed to create debrief' }, { status: 500 });
  }
}

// PATCH update debrief
export async function PATCH(request: Request) {
  try {
    const { id, ...data } = await request.json();

    const updated = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    await db.update(debriefs).set(updated).where(eq(debriefs.id, id));
    return NextResponse.json({ id, ...updated });
  } catch (error) {
    console.error('Error updating debrief:', error);
    return NextResponse.json({ error: 'Failed to update debrief' }, { status: 500 });
  }
}

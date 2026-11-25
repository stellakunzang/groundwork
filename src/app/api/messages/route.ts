import { db } from '@/src/db/db';
import { messages } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('company_id');
  if (!companyId) {
    return NextResponse.json({ error: 'company_id required' }, { status: 400 });
  }
  const rows = await db.select().from(messages).where(eq(messages.company_id, companyId));
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const { company_id, date, direction, body } = await request.json();
  if (!company_id || !date || !direction || !body) {
    return NextResponse.json({ error: 'company_id, date, direction, and body are required' }, { status: 400 });
  }
  const [row] = await db
    .insert(messages)
    .values({ id: randomUUID(), company_id, date, direction, body })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { id, date, direction, body } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }
  const updates: Partial<{ date: string; direction: string; body: string }> = {};
  if (date !== undefined) updates.date = date;
  if (direction !== undefined) updates.direction = direction;
  if (body !== undefined) updates.body = body;
  const [row] = await db.update(messages).set(updates).where(eq(messages.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }
  await db.delete(messages).where(eq(messages.id, id));
  return NextResponse.json({ ok: true });
}

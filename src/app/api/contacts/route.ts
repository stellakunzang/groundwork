import { NextResponse } from 'next/server';
import { db } from '@/src/db/db';
import { contacts } from '@/src/db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

// GET all contacts
export async function GET() {
  try {
    const allContacts = await db.select().from(contacts);
    return NextResponse.json(allContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

// POST create new contact
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newContact = {
      id: randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.insert(contacts).values(newContact);
    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

// PATCH update contact
export async function PATCH(request: Request) {
  try {
    const { id, ...data } = await request.json();

    const updated = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    await db.update(contacts).set(updated).where(eq(contacts.id, id));
    return NextResponse.json({ id, ...updated });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

// DELETE contact
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    }

    await db.delete(contacts).where(eq(contacts.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}

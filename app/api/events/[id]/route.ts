import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID.' }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `SELECT id, title, category, TO_CHAR(event_date, 'YYYY-MM-DD') AS event_date,
              venue, ticket_price, capacity, organizer_name, description
       FROM events WHERE id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    return NextResponse.json({ event: result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('GET /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch event.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden: Organizer administrator session required to update events.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      title,
      category = 'Corporate Summit',
      event_date,
      venue,
      ticket_price = 0,
      capacity = 150,
      organizer_name = 'Aurelia Live Productions',
      description,
    } = body;

    if (!title || !event_date || !venue || !description) {
      return NextResponse.json(
        { error: 'Validation error: title, event_date, venue, and description are required.' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE events
       SET title = $1, category = $2, event_date = $3, venue = $4,
           ticket_price = $5, capacity = $6, organizer_name = $7, description = $8
       WHERE id = $9
       RETURNING id, title, category, TO_CHAR(event_date, 'YYYY-MM-DD') AS event_date, venue, ticket_price, capacity, organizer_name, description`,
      [
        title.trim(),
        category.trim(),
        event_date,
        venue.trim(),
        Number(ticket_price) || 0,
        Math.max(1, Number(capacity) || 150),
        organizer_name.trim(),
        description.trim(),
        eventId,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Production updated successfully.', event: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update event.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden: Organizer administrator session required to delete events.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID.' }, { status: 400 });
  }

  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [eventId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event removed successfully.' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete event.' }, { status: 500 });
  }
}

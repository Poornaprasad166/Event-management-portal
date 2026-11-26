import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, title, category, TO_CHAR(event_date, 'YYYY-MM-DD') AS event_date,
             venue, ticket_price, capacity, organizer_name, description
      FROM events ORDER BY event_date ASC
    `);
    return NextResponse.json({ events: result.rows }, { status: 200 });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ error: 'Failed to retrieve events.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden: Organizer administrator session required to publish events.' },
      { status: 403 }
    );
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

    if (Number.isNaN(Date.parse(event_date))) {
      return NextResponse.json(
        { error: 'Validation error: event_date must be a valid YYYY-MM-DD date.' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO events (title, category, event_date, venue, ticket_price, capacity, organizer_name, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
      ]
    );

    return NextResponse.json(
      { message: 'Production created successfully.', event: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ error: 'Failed to create event.' }, { status: 500 });
  }
}

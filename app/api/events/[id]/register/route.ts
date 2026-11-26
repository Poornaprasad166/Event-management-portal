import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized: Please sign in before booking an event pass.' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID.' }, { status: 400 });
  }

  let ticketTier = 'Standard Pass';
  try {
    const body = await request.json();
    if (body?.ticket_tier === 'VIP All-Access') {
      ticketTier = 'VIP All-Access';
    }
  } catch {
    // Default to Standard Pass if no body provided
  }

  try {
    const eventCheck = await pool.query(
      'SELECT id, capacity FROM events WHERE id = $1',
      [eventId]
    );
    if (eventCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS booked FROM registrations WHERE event_id = $1',
      [eventId]
    );
    if (countRes.rows[0].booked >= eventCheck.rows[0].capacity) {
      return NextResponse.json(
        { error: 'Event capacity reached: All delegate passes are sold out.' },
        { status: 409 }
      );
    }

    const existing = await pool.query(
      'SELECT id FROM registrations WHERE event_id = $1 AND user_email = $2',
      [eventId, session.email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Duplicate booking prevented: A pass is already issued for this email.' },
        { status: 409 }
      );
    }

    const bookingCode = `AUR-${eventId}-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertRes = await pool.query(
      `INSERT INTO registrations (event_id, user_email, user_name, company_or_org, ticket_tier, booking_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, event_id, user_email, user_name, company_or_org, ticket_tier, booking_code, registered_at`,
      [eventId, session.email, session.name, session.organization, ticketTier, bookingCode]
    );

    return NextResponse.json(
      {
        message: 'Delegate pass confirmed!',
        registration: insertRes.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/events/[id]/register error:', error);
    return NextResponse.json({ error: 'Failed to process pass booking.' }, { status: 500 });
  }
}

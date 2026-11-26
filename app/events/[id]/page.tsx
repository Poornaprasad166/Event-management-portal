import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pool, EventRecord, RegistrationRecord } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import RegisterButton from './RegisterButton';

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    notFound();
  }

  const eventRes = await pool.query<EventRecord>(
    `SELECT id, title, category, TO_CHAR(event_date, 'YYYY-MM-DD') AS event_date,
            venue, ticket_price, capacity, organizer_name, description
     FROM events WHERE id = $1`,
    [eventId]
  );

  const event = eventRes.rows[0];
  if (!event) {
    notFound();
  }

  const participantsRes = await pool.query<RegistrationRecord>(
    `SELECT id, event_id, user_email, user_name, company_or_org, ticket_tier, booking_code, registered_at
     FROM registrations WHERE event_id = $1 ORDER BY registered_at DESC`,
    [eventId]
  );

  const session = await getServerSession();
  const userBooking = session
    ? participantsRes.rows.find((p) => p.user_email === session.email)
    : undefined;

  const price = Number(event.ticket_price);
  const soldOut = participantsRes.rows.length >= event.capacity;

  return (
    <div>
      <Link href="/events" style={{ color: '#4f46e5', fontWeight: 600 }}>
        &larr; Back to Event Showcase
      </Link>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge">{event.category}</span>
            <span className="badge-gold badge">{event.event_date}</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {price === 0 ? 'Complimentary Entry' : `₹${price.toLocaleString('en-IN')} / Delegate`}
          </span>
        </div>

        <h1 style={{ marginTop: '0.75rem', fontSize: '1.85rem' }}>{event.title}</h1>
        <p style={{ color: '#475569', fontWeight: 600, marginTop: '0.3rem' }}>
          Venue: {event.venue} &bull; Produced by {event.organizer_name}
        </p>

        <p style={{ marginTop: '1rem', color: '#1e293b', fontSize: '1rem' }}>{event.description}</p>

        <div style={{ marginTop: '1rem', fontSize: '0.88rem', color: '#475569' }}>
          <strong>Venue Capacity:</strong> {participantsRes.rows.length} booked out of {event.capacity} total seats
        </div>

        <RegisterButton
          eventId={event.id}
          isLoggedIn={Boolean(session)}
          alreadyRegistered={Boolean(userBooking)}
          existingCode={userBooking?.booking_code}
          ticketPrice={price}
          soldOut={soldOut}
        />
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.85rem' }}>
          Confirmed Delegate &amp; Guest Manifest ({participantsRes.rows.length})
        </h2>
        {participantsRes.rows.length === 0 ? (
          <p style={{ color: '#64748b' }}>No delegates booked yet. Be the first to reserve a pass.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Delegate Name</th>
                  <th>Organization</th>
                  <th>Pass Tier</th>
                </tr>
              </thead>
              <tbody>
                {participantsRes.rows.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: '#4f46e5' }}>{p.booking_code}</td>
                    <td>{p.user_name}</td>
                    <td>{p.company_or_org}</td>
                    <td>
                      <span className="badge">{p.ticket_tier}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

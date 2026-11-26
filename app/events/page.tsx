import Link from 'next/link';
import { pool, EventRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getEvents(): Promise<EventRecord[]> {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.category,
        TO_CHAR(e.event_date, 'YYYY-MM-DD') AS event_date,
        e.venue,
        e.ticket_price,
        e.capacity,
        e.organizer_name,
        e.description,
        COUNT(r.id)::int AS registered_count
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY e.id
      ORDER BY e.event_date ASC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div>
      <section className="hero-banner">
        <div style={{ maxWidth: '640px' }}>
          <span className="badge-gold badge" style={{ marginBottom: '0.75rem' }}>
            BENGALURU &bull; MUMBAI &bull; HYDERABAD
          </span>
          <h1 style={{ fontSize: '2rem', lineHeight: 1.2, marginBottom: '0.6rem' }}>
            Curated Flagship Summits, Concerts &amp; Brand Expos
          </h1>
          <p style={{ color: '#e0e7ff', fontSize: '0.98rem' }}>
            Produced by Aurelia Live Productions. Reserve corporate delegate passes, manage venue capacity, and track real-time attendee rosters.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/events" className="btn btn-gold">
            + Launch New Event
          </Link>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem' }}>Upcoming Productions ({events.length})</h2>
        <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Live Ticket Inventory</span>
      </div>

      {events.length === 0 ? (
        <div className="card">
          <p>No active productions scheduled. Sign in to the Organizer Console to publish your first event.</p>
        </div>
      ) : (
        <div className="grid">
          {events.map((event) => {
            const booked = Number(event.registered_count || 0);
            const remaining = Math.max(0, event.capacity - booked);
            const price = Number(event.ticket_price);

            return (
              <div
                key={event.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge">{event.category}</span>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                      {price === 0 ? 'Complimentary' : `₹${price.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
                    {event.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    Date: {event.event_date}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                    Venue: {event.venue}
                  </p>

                  <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '1.1rem' }}>
                    {event.description}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: '#475569',
                      marginBottom: '0.65rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <span>Producer: {event.organizer_name}</span>
                    <span style={{ fontWeight: 700, color: remaining > 0 ? '#059669' : '#dc2626' }}>
                      {remaining} / {event.capacity} Seats Left
                    </span>
                  </div>

                  <Link href={`/events/${event.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                    Book Delegate Pass &amp; Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

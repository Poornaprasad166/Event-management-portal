import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import { pool, EventRecord } from '@/lib/db';
import AdminEventManager from './AdminEventManager';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const admin = await requireAdminSession();

  if (!admin) {
    redirect('/login');
  }

  let events: EventRecord[] = [];
  try {
    const result = await pool.query<EventRecord>(`
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
    events = result.rows;
  } catch (error) {
    console.error('Failed to load events in admin console:', error);
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <span className="badge-gold badge">ORGANIZER OPERATIONS CONSOLE</span>
        <h1 style={{ marginTop: '0.4rem' }}>Production &amp; Ticketing Management</h1>
        <p style={{ color: '#475569' }}>
          Producer: <strong>{admin.name}</strong> ({admin.organization}) &bull; Full CRUD &amp; Capacity Control
        </p>
      </div>
      <AdminEventManager initialEvents={events} />
    </div>
  );
}

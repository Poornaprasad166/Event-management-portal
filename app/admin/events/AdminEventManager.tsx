'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { EventRecord } from '@/lib/db';

export default function AdminEventManager({ initialEvents }: { initialEvents: EventRecord[] }) {
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>(initialEvents);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Corporate Summit');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [ticketPrice, setTicketPrice] = useState('1499');
  const [capacity, setCapacity] = useState('200');
  const [organizerName, setOrganizerName] = useState('Aurelia Live Productions');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalBookings = events.reduce((acc, ev) => acc + Number(ev.registered_count || 0), 0);
  const projectedRevenue = events.reduce(
    (acc, ev) => acc + Number(ev.registered_count || 0) * Number(ev.ticket_price || 0),
    0
  );

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setCategory('Corporate Summit');
    setEventDate('');
    setVenue('');
    setTicketPrice('1499');
    setCapacity('200');
    setOrganizerName('Aurelia Live Productions');
    setDescription('');
  }

  function startEdit(ev: EventRecord) {
    setEditingId(ev.id);
    setTitle(ev.title);
    setCategory(ev.category || 'Corporate Summit');
    setEventDate(ev.event_date);
    setVenue(ev.venue);
    setTicketPrice(String(ev.ticket_price ?? 0));
    setCapacity(String(ev.capacity ?? 150));
    setOrganizerName(ev.organizer_name || 'Aurelia Live Productions');
    setDescription(ev.description);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !eventDate.trim() || !venue.trim() || !description.trim()) {
      setError('Title, Event Date, Venue, and Production Brief are required.');
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = editingId ? `/api/events/${editingId}` : '/api/events';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          event_date: eventDate,
          venue: venue.trim(),
          ticket_price: Number(ticketPrice) || 0,
          capacity: Number(capacity) || 100,
          organizer_name: organizerName.trim() || 'Aurelia Live Productions',
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Operation failed.');
        setSubmitting(false);
        return;
      }

      if (editingId) {
        setEvents((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...data.event, registered_count: item.registered_count || 0 }
              : item
          )
        );
        setSuccess('Production details updated successfully.');
      } else {
        setEvents((prev) => [...prev, { ...data.event, registered_count: 0 }]);
        setSuccess('New production published to live catalog.');
      }

      resetForm();
      router.refresh();
    } catch {
      setError('Network error while saving production.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to delete event.');
        return;
      }

      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      setSuccess('Event cancelled and removed from catalog.');
      if (editingId === id) resetForm();
      router.refresh();
    } catch {
      setError('Network error while deleting event.');
    }
  }

  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Active Productions</div>
          <div className="kpi-value">{events.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Confirmed Delegate Bookings</div>
          <div className="kpi-value">{totalBookings}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Gross Ticket Revenue</div>
          <div className="kpi-value">₹{projectedRevenue.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
            {editingId ? `Edit Production #${editingId}` : 'Publish New Event Production'}
          </h2>

          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="title">Event / Production Title</label>
                <input
                  id="title"
                  type="text"
                  className="form-control"
                  placeholder="e.g., Global FinTech Leaders Conclave 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Event Format / Category</label>
                <select
                  id="category"
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Corporate Summit">Corporate Summit</option>
                  <option value="Concert & Gala">Concert &amp; Gala</option>
                  <option value="Trade Exhibition">Trade Exhibition</option>
                  <option value="Brand Launch">Brand Launch</option>
                  <option value="Executive Workshop">Executive Workshop</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="eventDate">Event Date</label>
                <input
                  id="eventDate"
                  type="date"
                  className="form-control"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ticketPrice">Ticket Price (INR)</label>
                <input
                  id="ticketPrice"
                  type="number"
                  min="0"
                  step="1"
                  className="form-control"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">Venue Seat Capacity</label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  className="form-control"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="venue">Venue &amp; City</label>
                <input
                  id="venue"
                  type="text"
                  className="form-control"
                  placeholder="e.g., Taj West End Ballroom, Bengaluru"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="organizerName">Client / Production House</label>
                <input
                  id="organizerName"
                  type="text"
                  className="form-control"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Production Scope &amp; Agenda</label>
              <textarea
                id="description"
                rows={3}
                className="form-control"
                placeholder="Describe keynote sessions, hospitality inclusions, stage setup, and audience profile..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Production'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
            Production Schedule &amp; Inventory ({events.length})
          </h2>
          {events.length === 0 ? (
            <p style={{ color: '#64748b' }}>No events in portfolio yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Production</th>
                    <th>Date &amp; Venue</th>
                    <th>Pass Price</th>
                    <th>Bookings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{ev.title}</div>
                        <span className="badge">{ev.category}</span>
                      </td>
                      <td>
                        <div>{ev.event_date}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{ev.venue}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ₹{Number(ev.ticket_price).toLocaleString('en-IN')}
                      </td>
                      <td>
                        {ev.registered_count || 0} / {ev.capacity}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => startEdit(ev)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDelete(ev.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

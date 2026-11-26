'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterButton({
  eventId,
  isLoggedIn,
  alreadyRegistered,
  existingCode,
  ticketPrice,
  soldOut,
}: {
  eventId: number;
  isLoggedIn: boolean;
  alreadyRegistered: boolean;
  existingCode?: string;
  ticketPrice: number;
  soldOut: boolean;
}) {
  const router = useRouter();
  const [ticketTier, setTicketTier] = useState<'Standard Pass' | 'VIP All-Access'>('Standard Pass');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    alreadyRegistered ? 'success' : 'idle'
  );
  const [message, setMessage] = useState(
    alreadyRegistered
      ? `Pass Confirmed! Booking Reference: ${existingCode || 'Confirmed'}`
      : ''
  );

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_tier: ticketTier }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Booking failed.');
        return;
      }

      setStatus('success');
      setMessage(
        `${data.message} Booking ID: ${data.registration?.booking_code || 'CONFIRMED'}`
      );
      router.refresh();
    } catch {
      setStatus('error');
      setMessage('Network error occurred while confirming booking.');
    }
  }

  return (
    <form onSubmit={handleRegister} style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
      {message && (
        <div className={status === 'error' ? 'alert-error' : 'alert-success'}>
          {message}
        </div>
      )}

      {status !== 'success' && !soldOut && (
        <div className="form-group" style={{ maxWidth: '340px' }}>
          <label htmlFor="ticketTier">Select Pass Tier</label>
          <select
            id="ticketTier"
            className="form-control"
            value={ticketTier}
            onChange={(e) => setTicketTier(e.target.value as 'Standard Pass' | 'VIP All-Access')}
          >
            <option value="Standard Pass">
              Standard Delegate Pass ({ticketPrice === 0 ? 'Free' : `₹${ticketPrice.toLocaleString('en-IN')}`})
            </option>
            <option value="VIP All-Access">
              VIP All-Access + Lounge ({ticketPrice === 0 ? 'Free' : `₹${(ticketPrice * 1.5).toLocaleString('en-IN')}`})
            </option>
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || status === 'success' || (soldOut && status !== 'success')}
        className="btn btn-primary"
      >
        {status === 'loading'
          ? 'Issuing E-Ticket...'
          : status === 'success'
          ? 'E-Ticket Issued'
          : soldOut
          ? 'Sold Out'
          : isLoggedIn
          ? 'Reserve & Issue Pass'
          : 'Sign In to Book Pass'}
      </button>
    </form>
  );
}

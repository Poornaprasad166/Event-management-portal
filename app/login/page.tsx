'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('Poorna Prasad D R');
  const [email, setEmail] = useState('poorna@aurelialive.in');
  const [organization, setOrganization] = useState('Aurelia Live Productions');
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, organization, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      router.push(role === 'admin' ? '/admin/events' : '/events');
      router.refresh();
    } catch {
      setError('Network error while establishing session.');
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <span className="badge">AURELIA WORKSPACE ACCESS</span>
      <h1 style={{ marginTop: '0.6rem', marginBottom: '0.35rem', fontSize: '1.6rem' }}>
        Sign In to Event Operations
      </h1>
      <p style={{ color: '#475569', marginBottom: '1.4rem', fontSize: '0.92rem' }}>
        Authenticate as an Event Organizer Admin to launch &amp; manage productions, or as a Corporate Delegate to book passes.
      </p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Business / Delegate Email</label>
          <input
            id="email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organization">Company / Brand Name</label>
          <input
            id="organization"
            type="text"
            className="form-control"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Access Role</label>
          <select
            id="role"
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
          >
            <option value="admin">Event Organizer / Producer (Admin CRUD &amp; Revenue Console)</option>
            <option value="user">Client / Ticket Buyer (Browse &amp; Book Event Passes)</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Authenticating...' : 'Enter Workspace'}
        </button>
      </form>
    </div>
  );
}

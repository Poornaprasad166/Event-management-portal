'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify({ email, name, organization, role, password }),
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
        Delegates can sign in with their details to book passes. Organizer Admins must verify with their administrator password.
      </p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            className="form-control"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as 'admin' | 'user');
              setPassword('');
              setError('');
            }}
          >
            <option value="user">Client / Ticket Buyer (Browse &amp; Book Event Passes)</option>
            <option value="admin">Event Organizer / Producer (Admin Console)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="form-control"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder={role === 'admin' ? 'Enter admin email' : 'Enter your email address'}
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
            placeholder="e.g., Acme Corp or Independent Delegate"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
        </div>

        {role === 'admin' && (
          <div className="form-group">
            <label htmlFor="password">Organizer Admin Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter organizer admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Authenticating...' : 'Enter Workspace'}
        </button>
      </form>
    </div>
  );
}
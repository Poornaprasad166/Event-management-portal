import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aurelia Live | Commercial Event Management & Ticketing Portal',
  description: 'End-to-end corporate event operations, ticketing, and organizer workspace.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <Link href="/events" className="brand-wrap">
            <span className="nav-brand">AURELIA LIVE</span>
            <span className="nav-tagline">Events &amp; Production Agency</span>
          </Link>
          <div className="nav-links">
            <Link href="/events">Event Showcase</Link>
            <Link href="/admin/events">Organizer Console</Link>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge-gold badge">
                  {session.name} &bull; {session.role === 'admin' ? 'ORGANIZER ADMIN' : 'DELEGATE'}
                </span>
                <Link href="/login" style={{ fontSize: '0.82rem', color: '#cbd5e1', textDecoration: 'underline' }}>
                  Switch Account
                </Link>
              </div>
            ) : (
              <Link href="/login" className="btn btn-gold">
                Organizer / Client Sign In
              </Link>
            )}
          </div>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}

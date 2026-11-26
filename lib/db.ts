import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const connectionString = process.env.POSTGRESQL_URI;

if (!connectionString) {
  console.warn('Warning: POSTGRESQL_URI is not configured in environment variables.');
}

export const pool =
  global.pgPool ??
  new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export interface EventRecord {
  id: number;
  title: string;
  category: string;
  event_date: string;
  venue: string;
  ticket_price: string | number;
  capacity: number;
  organizer_name: string;
  description: string;
  registered_count?: number;
}

export interface RegistrationRecord {
  id: number;
  event_id: number;
  user_email: string;
  user_name: string;
  company_or_org: string;
  ticket_tier: string;
  booking_code: string;
  registered_at?: string;
}

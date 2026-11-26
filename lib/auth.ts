import { cookies } from 'next/headers';

export interface SessionUser {
  email: string;
  name: string;
  organization: string;
  role: 'admin' | 'user';
}

const SESSION_COOKIE = 'aurelia_event_session';

export function encodeSession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user)).toString('base64url');
}

export function decodeSession(token: string): SessionUser | null {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.email === 'string' &&
      typeof parsed.name === 'string' &&
      (parsed.role === 'admin' || parsed.role === 'user')
    ) {
      return {
        email: parsed.email,
        name: parsed.name,
        organization: parsed.organization || 'Aurelia Client',
        role: parsed.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function requireAdminSession(): Promise<SessionUser | null> {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return null;
  }
  return session;
}

export { SESSION_COOKIE };

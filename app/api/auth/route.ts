import { NextRequest, NextResponse } from 'next/server';
import { encodeSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, organization, role } = body;

    if (!email || !name || (role !== 'admin' && role !== 'user')) {
      return NextResponse.json(
        { error: 'Valid name, email, and role (admin or user) are required.' },
        { status: 400 }
      );
    }

    const token = encodeSession({
      email: email.trim(),
      name: name.trim(),
      organization: (organization || 'Independent Client').trim(),
      role,
    });

    const response = NextResponse.json(
      { message: 'Session established', user: { email, name, organization, role } },
      { status: 200 }
    );

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid authentication payload.' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Signed out' }, { status: 200 });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

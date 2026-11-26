import { NextRequest, NextResponse } from 'next/server';
import { encodeSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, organization, role, password } = body;

    if (!email || !name || (role !== 'admin' && role !== 'user')) {
      return NextResponse.json(
        { error: 'Valid name, email, and role are required.' },
        { status: 400 }
      );
    }

    if (role === 'admin') {
      const validAdminEmail = process.env.ADMIN_EMAIL || 'admin@aurelialive.in';
      const validAdminPass = process.env.ADMIN_PASSWORD || 'Aurelia@2026';

      if (email.trim().toLowerCase() !== validAdminEmail.toLowerCase() || password !== validAdminPass) {
        return NextResponse.json(
          { error: 'Invalid organizer administrator credentials.' },
          { status: 401 }
        );
      }
    }

    const token = encodeSession({
      email: email.trim(),
      name: name.trim(),
      organization: (organization || 'Independent Delegate').trim(),
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
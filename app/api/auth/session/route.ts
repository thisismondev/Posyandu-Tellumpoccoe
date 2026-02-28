import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/session';

/**
 * API endpoint untuk check session validity
 * Digunakan oleh client-side session monitor
 */
export async function GET() {
  try {
    const { valid, user, session } = await validateSession();

    if (!valid) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Session expired or invalid',
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user?.id,
        email: user?.email,
      },
      expiresAt: session?.expires_at,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to check session',
      },
      { status: 500 },
    );
  }
}

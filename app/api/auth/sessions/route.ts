import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getIPsByUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get all IPs this user has logged in from
    const sessions = await getIPsByUser(decoded.userId);

    return NextResponse.json({
      activeSessions: sessions.map(session => ({
        ip: session.ip_address,
        loginCount: session.login_count,
        lastLogin: session.last_login,
        isCurrentSession: session.ip_address === (request.headers.get('x-forwarded-for') || 'unknown'),
      }))
    });
  } catch (error) {
    console.error('[v0] Sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Logout user - clear the token
    const response = NextResponse.json({
      success: true,
      message: 'All sessions logged out'
    });

    response.cookies.delete('auth_token');
    return response;
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

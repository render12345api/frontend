import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getDeviceFingerprints } from '@/lib/db';

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

    // Get user's trusted devices
    const devices = await getDeviceFingerprints(decoded.userId);

    return NextResponse.json({
      trustedDevices: devices.map(d => ({
        fingerprint: d.fingerprint,
        browser: d.browser,
        deviceName: d.device_name,
        lastUsed: d.last_used,
        isTrusted: d.is_trusted,
      }))
    });
  } catch (error) {
    console.error('[v0] Device verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

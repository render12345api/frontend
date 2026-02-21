import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getDeviceFingerprints, saveDeviceFingerprint, trackUserIP } from '@/lib/db';
import { verifyPassword, createJWT } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if database URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('[v0] DATABASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error: DATABASE_URL not set' },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get client IP and user agent for device tracking
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Generate device fingerprint from browser/device info
    const fingerprintData = `${userAgent}|${ipAddress}`;
    const deviceFingerprint = crypto.createHash('sha256').update(fingerprintData).digest('hex');
    
    // Extract device info
    const browserMatch = userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera)\/[\d.]+/) || [];
    const browser = browserMatch[1] || 'Unknown';
    const deviceName = userAgent.includes('Mobile') ? 'Mobile' : userAgent.includes('Tablet') ? 'Tablet' : 'Desktop';

    console.log('[v0] Login from IP:', ipAddress, 'Device:', deviceName, 'Browser:', browser);

    // Check if this device is already trusted
    const existingDevices = await getDeviceFingerprints(user.id);
    const isNewDevice = !existingDevices.some(d => d.fingerprint === deviceFingerprint);
    
    if (isNewDevice) {
      console.log('[v0] New device detected for user:', user.email);
      // Save the new device fingerprint
      await saveDeviceFingerprint(user.id, deviceFingerprint, deviceName, browser);
      // Return response indicating device verification needed (optional verification step)
    }

    // Track IP for this login
    await trackUserIP(user.id, ipAddress, userAgent);

    const token = createJWT(String(user.id));

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
        },
        isNewDevice: isNewDevice,
        deviceInfo: {
          fingerprint: deviceFingerprint,
          browser: browser,
          deviceType: deviceName,
          ip: ipAddress,
        }
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[v0] Login error - Message:', errorMessage);
    console.error('[v0] Login error - Stack:', errorStack);
    console.error('[v0] Login error - Full error:', error);
    
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed. Check DATABASE_URL configuration.' },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('PROTOCOL') || errorMessage.includes('SSL')) {
      return NextResponse.json(
        { error: 'Database SSL configuration error.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Login failed. Please try again.', details: errorMessage },
      { status: 500 }
    );
  }
}

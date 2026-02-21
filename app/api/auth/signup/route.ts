import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, trackUserIP, countAccountsByIP } from '@/lib/db';
import { hashPassword, generateUserSecret, createJWT } from '@/lib/auth';

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

    const { email, password, confirmPassword } = await request.json();

    // Validation
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get client IP
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check for VPN/Proxy detection (basic check)
    const vpnKeywords = ['vpn', 'proxy', 'tor', 'hide', 'privacy'];
    const isVpnLikely = vpnKeywords.some(keyword => userAgent.toLowerCase().includes(keyword));

    // Check if too many accounts from same IP
    const accountCountFromIP = await countAccountsByIP(ipAddress);
    if (accountCountFromIP >= 3) {
      console.log('[v0] Multiple accounts detected from IP:', ipAddress);
      return NextResponse.json(
        { error: 'Too many accounts created from this IP address. Please try again later or contact support.' },
        { status: 429 }
      );
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create user with 5000 free credits
    console.log('[v0] Starting user creation for:', email);
    const passwordHash = await hashPassword(password);
    console.log('[v0] Password hash created');
    const userSecret = generateUserSecret();
    console.log('[v0] User secret generated, calling createUser...');
    const user = await createUser(email, passwordHash, userSecret, 5000);
    console.log('[v0] createUser returned:', user);

    if (!user || !user.id) {
      console.error('[v0] User creation failed - returned:', user);
      return NextResponse.json(
        { error: 'Failed to create user account - database error' },
        { status: 500 }
      );
    }

    console.log('[v0] User created successfully with ID:', user.id);
    
    // Track user IP
    await trackUserIP(user.id, ipAddress, userAgent);
    console.log('[v0] IP tracked for user:', ipAddress, 'VPN detected:', isVpnLikely);

    // Create JWT - convert ID to string if it's a number
    const token = createJWT(String(user.id));

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
        },
      },
      { status: 201 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[v0] ===== SIGNUP ERROR =====');
    console.error('[v0] Error Type:', error?.constructor?.name);
    console.error('[v0] Error Message:', errorMessage);
    console.error('[v0] Error Stack:', errorStack);
    console.error('[v0] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.error('[v0] NODE_ENV:', process.env.NODE_ENV);
    console.error('[v0] ========================');
    
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed. DATABASE_URL may not be set or database is unreachable.' },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('PROTOCOL') || errorMessage.includes('SSL')) {
      return NextResponse.json(
        { error: 'Database SSL configuration error.' },
        { status: 500 }
      );
    }

    if (errorMessage.includes('table') || errorMessage.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Database schema not initialized. Run migration script.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create account. Check server logs.' },
      { status: 500 }
    );
  }
}

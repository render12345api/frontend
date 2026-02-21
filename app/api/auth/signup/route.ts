import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { hashPassword, generateUserSecret, createJWT } from '@/lib/auth';

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

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const userSecret = generateUserSecret();
    const user = await createUser(email, passwordHash, userSecret, 100);

    if (!user || !user.id) {
      console.error('[v0] User creation returned invalid result:', user);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create JWT
    const token = createJWT(user.id);

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
    console.error('[v0] Signup error - Message:', errorMessage);
    console.error('[v0] Signup error - Stack:', errorStack);
    console.error('[v0] Signup error - Full error:', error);
    
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed. Check DATABASE_URL configuration.' },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('PROTOCOL') || errorMessage.includes('SSL')) {
      return NextResponse.json(
        { error: 'Database SSL configuration error. Ensure DATABASE_URL has correct SSL settings.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.', details: errorMessage },
      { status: 500 }
    );
  }
}

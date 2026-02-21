import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { deductCredits, recordTransaction, isBlacklisted, getUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { phoneNumber, messageCount, delay } = await request.json();
    const userId = String(decoded.userId);

    // Validate inputs
    if (!phoneNumber || !messageCount || messageCount <= 0) {
      return NextResponse.json(
        { error: 'Invalid phone number or message count' },
        { status: 400 }
      );
    }

    console.log('[v0] Credit deduction request - Phone:', phoneNumber, 'Messages:', messageCount);

    // Check if phone number is blocked
    const isBlocked = await isBlacklisted(phoneNumber);
    if (isBlocked) {
      console.log('[v0] Phone number is blocked:', phoneNumber);
      return NextResponse.json(
        { error: 'This phone number is protected and cannot receive messages' },
        { status: 403 }
      );
    }

    // Get user to check credits
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate credits needed (1 credit = 1 message)
    const creditsNeeded = messageCount;
    console.log('[v0] Credits needed:', creditsNeeded, 'Available:', user.credits);

    // Check if user has enough credits
    if (user.credits < creditsNeeded) {
      console.log('[v0] Insufficient credits');
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: creditsNeeded,
          available: user.credits,
          upgrade: true
        },
        { status: 402 }
      );
    }

    // Deduct credits
    const result = await deductCredits(userId, creditsNeeded);
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      );
    }

    // Record transaction
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await recordTransaction(
      userId,
      'launch',
      creditsNeeded,
      phoneNumber,
      messageCount,
      ipAddress as string,
      `SMS burst launch - ${messageCount} messages to ${phoneNumber}`
    );

    console.log('[v0] Credits deducted successfully. Remaining:', result.credits);

    return NextResponse.json({
      success: true,
      creditsDeducted: creditsNeeded,
      creditsRemaining: result.credits,
      message: 'Credits deducted. Ready to launch.'
    });
  } catch (error) {
    console.error('[v0] Credit deduction error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { blockPhoneNumber, unblockPhoneNumber, getBlockedNumbers } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MASTER_API_KEY = process.env.MASTER_API_KEY || '';

function validateAdminKey(key: string): boolean {
  return key === MASTER_API_KEY && MASTER_API_KEY !== '';
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey || !validateAdminKey(apiKey)) {
      console.log('[v0] Invalid admin API key attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { phoneNumber, reason, action = 'block' } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    console.log('[v0] Admin action:', action, 'Phone:', phoneNumber, 'Reason:', reason);

    if (action === 'block') {
      await blockPhoneNumber(phoneNumber, reason || 'Admin blocked');
      return NextResponse.json({
        success: true,
        message: `Phone number ${phoneNumber} has been blocked`
      });
    } else if (action === 'unblock') {
      await unblockPhoneNumber(phoneNumber);
      return NextResponse.json({
        success: true,
        message: `Phone number ${phoneNumber} has been unblocked`
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[v0] Admin block error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey || !validateAdminKey(apiKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    const blockedNumbers = await getBlockedNumbers(Math.min(limit, 1000));

    return NextResponse.json({
      success: true,
      blockedNumbers,
      count: blockedNumbers.length
    });
  } catch (error) {
    console.error('[v0] Get blocked numbers error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { getTransactionHistory } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = String(decoded.userId);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

    console.log('[v0] Fetching transaction history for user:', userId);

    const transactions = await getTransactionHistory(userId, Math.min(limit, 100));

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('[v0] Transaction history error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

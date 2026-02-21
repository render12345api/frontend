import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { addCredits, recordCreditTransaction, getUser } from '@/lib/db';

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

    const { planId, credits, amount } = await request.json();

    if (!planId || !credits || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await getUser(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // In production, integrate with Stripe or payment gateway
    // For now, we'll record the transaction and provide WhatsApp link
    
    // Add credits to user account
    await addCredits(decoded.userId, credits);

    // Record transaction
    await recordCreditTransaction(
      decoded.userId,
      credits,
      'purchase',
      `${credits} credits purchased (Plan: ${planId})`
    );

    // Generate payment link (WhatsApp)
    const whatsappMessage = encodeURIComponent(
      `Hi, I want to buy ${credits} credits for ₹${Math.round(amount * 83)}. Order: ${decoded.userId}-${Date.now()}`
    );
    const whatsappLink = `https://wa.me/919876543210?text=${whatsappMessage}`;

    return NextResponse.json({
      success: true,
      message: `Credits added! Please complete payment via WhatsApp: ${whatsappLink}`,
      credits,
      whatsappLink,
    });
  } catch (error) {
    console.error('[v0] Error processing purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

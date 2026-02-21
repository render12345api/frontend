import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { deductCredits, recordCreditTransaction, getCampaigns } from '@/lib/db';

export const dynamic = 'force-dynamic';

const RENDER_API_KEY = process.env.RENDER_API_KEY || '';
// Credit calculation: 10 credits per 1000 messages
const CREDITS_PER_1K_MESSAGES = 10;

function calculateCreditsNeeded(messageCount: number): number {
  return Math.ceil((messageCount / 1000) * CREDITS_PER_1K_MESSAGES);
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Render deploy request started');
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      console.error('[v0] No auth token found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      console.error('[v0] Invalid JWT token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    console.log('[v0] User authenticated:', decoded.userId);

    const { campaignId, renderServiceId, messageCount } = await request.json();

    if (!campaignId || !renderServiceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate message count
    const messages = Number(messageCount) || 0;
    if (messages <= 0) {
      return NextResponse.json(
        { error: 'Message count must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate credits needed
    const creditsNeeded = calculateCreditsNeeded(messages);
    console.log('[v0] Messages:', messages, 'Credits needed:', creditsNeeded);

    // Check if user has enough credits
    const campaigns = await getCampaigns(decoded.userId);
    const campaign = campaigns.find((c) => c.id === campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Deduct credits based on message count
    const result = await deductCredits(decoded.userId, creditsNeeded);
    if (!result) {
      return NextResponse.json(
        { error: 'Insufficient credits. Required: ' + creditsNeeded },
        { status: 400 }
      );
    }

    // Record transaction
    await recordCreditTransaction(
      decoded.userId,
      creditsNeeded,
      'deduction',
      `Campaign deployment: ${campaign.name} (${messages.toLocaleString()} messages)`
    );

    // Update campaign status to 'deploying'
    const { updateCampaignStatus } = await import('@/lib/db');
    await updateCampaignStatus(campaignId, 'deploying');

    // Call Render API
    try {
      const renderResponse = await fetch(
        `https://api.render.com/v1/services/${renderServiceId}/deploys`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      const renderData = await renderResponse.json();

      if (!renderResponse.ok) {
        console.error('[v0] Render API error:', renderData);
        // Refund credits if deployment fails
        await deductCredits(decoded.userId, -creditsNeeded);
        await recordCreditTransaction(
          decoded.userId,
          creditsNeeded,
          'purchase',
          `Refund: Deployment failed for ${campaign.name}`
        );
        await updateCampaignStatus(campaignId, 'failed');

        return NextResponse.json(
          { error: 'Deployment failed. Credits refunded.' },
          { status: 500 }
        );
      }

      // Update campaign status to 'running' and store deployment ID
      await updateCampaignStatus(campaignId, 'running', renderData.id);

      return NextResponse.json({
        success: true,
        message: 'Deployment initiated successfully',
        messageCount: messages,
        creditsDeducted: creditsNeeded,
        deploymentId: renderData.id
      });
    } catch (renderError) {
      console.error('[v0] Render deployment error:', renderError);

      // Refund credits on error
      await deductCredits(decoded.userId, -creditsNeeded);
      await recordCreditTransaction(
        decoded.userId,
        creditsNeeded,
        'purchase',
        `Refund: Deployment error for ${campaign.name}`
      );
      await updateCampaignStatus(campaignId, 'error');

      return NextResponse.json(
        { error: 'Deployment error. Credits refunded.' },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error deploying:', errorMessage);
    console.error('[v0] Stack trace:', error instanceof Error ? error.stack : '');
    
    if (errorMessage.includes('database') || errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

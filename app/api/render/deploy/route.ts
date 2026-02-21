import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { deductCredits, recordCreditTransaction, getCampaigns } from '@/lib/db';

const RENDER_API_KEY = process.env.RENDER_API_KEY || '';
const CREDIT_COST_PER_DEPLOYMENT = 10;

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

    const { campaignId, renderServiceId } = await request.json();

    if (!campaignId || !renderServiceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const campaigns = await getCampaigns(decoded.userId);
    const campaign = campaigns.find((c) => c.id === campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Deduct credits
    const result = await deductCredits(decoded.userId, CREDIT_COST_PER_DEPLOYMENT);
    if (!result) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      );
    }

    // Record transaction
    await recordCreditTransaction(
      decoded.userId,
      CREDIT_COST_PER_DEPLOYMENT,
      'deduction',
      `Campaign deployment: ${campaign.name}`
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
        await deductCredits(decoded.userId, -CREDIT_COST_PER_DEPLOYMENT);
        await recordCreditTransaction(
          decoded.userId,
          CREDIT_COST_PER_DEPLOYMENT,
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
        creditsDeducted: CREDIT_COST_PER_DEPLOYMENT,
        deploymentId: renderData.id
      });
    } catch (renderError) {
      console.error('[v0] Render deployment error:', renderError);

      // Refund credits on error
      await deductCredits(decoded.userId, -CREDIT_COST_PER_DEPLOYMENT);
      await recordCreditTransaction(
        decoded.userId,
        CREDIT_COST_PER_DEPLOYMENT,
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

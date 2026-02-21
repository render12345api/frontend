'use client';

import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', { credentials: 'include' });
      if (response.ok) {
        const { campaigns } = await response.json();
        setCampaigns(campaigns);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="neumorphic-card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email.split('@')[0]}!</h1>
        <p className="text-muted-foreground">Manage your Render services and monitor your campaigns</p>
      </div>

      {/* Credits Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neumorphic-card bg-card">
          <div className="text-sm text-muted-foreground mb-2">Available Credits</div>
          <div className="text-4xl font-bold text-primary mb-4">{user?.credits}</div>
          <Link href="/dashboard/billing" className="text-sm text-secondary hover:text-secondary/80 transition font-medium">
            Buy more credits →
          </Link>
        </div>

        <div className="neumorphic-card bg-card">
          <div className="text-sm text-muted-foreground mb-2">Active Campaigns</div>
          <div className="text-4xl font-bold text-primary mb-4">{campaigns.filter(c => c.status === 'active').length}</div>
          <Link href="/dashboard/campaigns" className="text-sm text-secondary hover:text-secondary/80 transition font-medium">
            View all campaigns →
          </Link>
        </div>

        <div className="neumorphic-card bg-card">
          <div className="text-sm text-muted-foreground mb-2">Quick Actions</div>
          <div className="flex gap-2 mt-4">
            <Link href="/dashboard/campaigns/new" className="flex-1 neumorphic-button bg-primary text-primary-foreground text-sm">
              New Campaign
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="neumorphic-card bg-card">
        <h2 className="text-2xl font-bold mb-6">Recent Campaigns</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📱</div>
            <p className="text-muted-foreground mb-6">No campaigns yet. Create your first one!</p>
            <Link href="/dashboard/campaigns/new" className="neumorphic-button bg-primary text-primary-foreground inline-block">
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.slice(0, 4).map((campaign) => (
              <div key={campaign.id} className="p-4 border border-border rounded-2xl hover:border-primary/50 transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg">{campaign.name}</h3>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      campaign.status === 'active'
                        ? 'bg-primary/20 text-primary'
                        : campaign.status === 'pending'
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                <div className="text-xs text-muted-foreground">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export default function CampaignsPage() {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/20 text-primary';
      case 'pending':
        return 'bg-secondary/20 text-secondary';
      case 'failed':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage your Render service deployments</p>
        </div>
        <Link href="/dashboard/campaigns/new" className="neumorphic-button bg-primary text-primary-foreground">
          New Campaign
        </Link>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="neumorphic-card bg-card text-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="neumorphic-card bg-card text-center py-16">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-xl font-bold mb-2">No campaigns yet</h2>
          <p className="text-muted-foreground mb-6">Create your first campaign to launch a Render service</p>
          <Link href="/dashboard/campaigns/new" className="neumorphic-button bg-primary text-primary-foreground inline-block">
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="neumorphic-card bg-card hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold truncate">{campaign.name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{campaign.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(campaign.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button className="neumorphic-button bg-card text-foreground border border-border text-sm opacity-0 group-hover:opacity-100 transition">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

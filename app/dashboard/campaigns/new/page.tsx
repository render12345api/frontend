'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateCampaignPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [renderServiceId, setRenderServiceId] = useState('');
  const [messageCount, setMessageCount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Calculate credits needed (10 credits per 1000 messages)
  const creditsNeeded = messageCount ? Math.ceil((Number(messageCount) / 1000) * 10) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!messageCount || Number(messageCount) <= 0) {
        throw new Error('Please enter a valid message count');
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          renderServiceId,
          messageCount: Number(messageCount),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const { error: errMsg } = await response.json();
        throw new Error(errMsg);
      }

      router.push('/dashboard/campaigns');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create campaign';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/campaigns" className="text-sm text-primary hover:underline mb-4 inline-block">
          ← Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create Campaign</h1>
        <p className="text-muted-foreground">Launch a new Render service with SMSBurst</p>
      </div>

      {/* Form Card */}
      <div className="neumorphic-card bg-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-bold mb-3">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Amazing Service"
              required
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border neumorphic-inset focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-2">Give your campaign a memorable name</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-3">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your service does..."
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border neumorphic-inset focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">Provide details about your service</p>
          </div>

          {/* Render Service ID */}
          <div>
            <label className="block text-sm font-bold mb-3">Render Service ID</label>
            <input
              type="text"
              value={renderServiceId}
              onChange={(e) => setRenderServiceId(e.target.value)}
              placeholder="srv_xxxxxxxxxxxxx"
              required
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border neumorphic-inset focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-foreground font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Find this in your Render dashboard under Service Settings
            </p>
          </div>

          {/* Message Count */}
          <div>
            <label className="block text-sm font-bold mb-3">Number of Messages</label>
            <input
              type="number"
              value={messageCount}
              onChange={(e) => setMessageCount(e.target.value)}
              placeholder="e.g., 5000"
              min="1"
              required
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border neumorphic-inset focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Total SMS messages you plan to send in this campaign
            </p>
          </div>

          {/* Credit Cost Preview */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="text-sm font-medium mb-1">
              Cost: <span className="text-primary font-bold">{creditsNeeded || '—'} Credits</span>
            </div>
            <p className="text-xs text-muted-foreground">
              10 credits per 1,000 messages • {messageCount ? `${Number(messageCount).toLocaleString()} messages` : 'Enter message count to see cost'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 neumorphic-button bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
            <Link href="/dashboard/campaigns" className="flex-1 neumorphic-button bg-card text-foreground border-2 border-border font-medium text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Info Section */}
      <div className="mt-8 neumorphic-card bg-card/50 border border-border">
        <h3 className="font-bold mb-4">How it works</h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="text-primary font-bold flex-shrink-0">1</span>
            <span>Fill in your campaign details, Render service ID, and message count</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold flex-shrink-0">2</span>
            <span>Credits are calculated based on message count (10 credits per 1,000 messages)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold flex-shrink-0">3</span>
            <span>Your service launches on Render automatically</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold flex-shrink-0">4</span>
            <span>Monitor your campaign status from the dashboard</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

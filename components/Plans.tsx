'use client';

import { useAuth } from '@/lib/useAuth';
import Image from 'next/image';
import { useState } from 'react';

export default function Plans() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    { id: 'free', name: 'Free', credits: 5000, price: 0, description: 'Perfect for testing' },
    { id: 'starter', name: 'Starter', credits: 25000, price: 9, currency: '₹', popular: true, description: 'For regular users' },
    { id: 'pro', name: 'Pro', credits: 50000, price: 25, currency: '₹', description: 'For power users' },
  ];

  const handlePurchase = async (planId: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan || plan.price === 0) {
        alert('Free plan cannot be purchased');
        return;
      }

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          credits: plan.credits,
          amount: plan.price,
          currency: plan.currency,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setSelectedPlan('payment');
      } else {
        alert('Purchase initialization failed');
      }
    } catch (error) {
      console.error('[v0] Purchase error:', error);
      alert('Error processing purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedPlan === 'payment') {
    return (
      <div className="neumorphic-card bg-card max-w-lg mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
          <p className="text-muted-foreground mb-6">Scan the QR code below to complete your payment</p>
          
          <div className="bg-background/50 p-8 rounded-xl mb-6 flex justify-center">
            <Image
              src="/qr.png"
              alt="Payment QR Code"
              width={300}
              height={300}
              className="w-64 h-64 object-contain"
            />
          </div>

          <p className="text-sm text-muted-foreground mb-4">After payment, your credits will be added automatically</p>
          
          <button
            onClick={() => setSelectedPlan(null)}
            className="neumorphic-button bg-primary text-primary-foreground w-full"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">1 credit = 1 SMS message. Select the plan that fits your needs.</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`neumorphic-card transition-all relative ${
              plan.popular 
                ? 'bg-primary text-primary-foreground ring-2 ring-primary scale-105' 
                : 'bg-card'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-foreground text-primary text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="pt-2">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-sm ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'} mb-4`}>
                {plan.description}
              </p>

              <div className="my-6">
                <div className="text-4xl font-bold mb-1">{plan.credits.toLocaleString()}</div>
                <div className={`text-sm ${plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  SMS Credits
                </div>
              </div>

              <div className="mb-6">
                <div className={`text-3xl font-bold ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`}>
                  {plan.price === 0 ? 'FREE' : `${plan.currency}${plan.price}`}
                </div>
              </div>

              {plan.id === 'free' ? (
                <button
                  disabled
                  className="w-full neumorphic-button bg-muted text-muted-foreground disabled:opacity-50"
                >
                  Included
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={isProcessing && selectedPlan === plan.id}
                  className={`w-full neumorphic-button font-medium transition-all ${
                    plan.popular
                      ? 'bg-primary-foreground text-primary disabled:opacity-50'
                      : 'bg-secondary text-secondary-foreground disabled:opacity-50'
                  }`}
                >
                  {isProcessing && selectedPlan === plan.id ? 'Processing...' : 'Buy Now'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="neumorphic-card bg-card/50 border border-border">
        <h3 className="font-bold mb-3">What is included?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ All modes (Normal, Burst, Flood)</li>
          <li>✓ Custom delay settings</li>
          <li>✓ Real-time terminal logs</li>
          <li>✓ Stop attack feature</li>
          <li>✓ Protected number checking</li>
          <li>✓ Automatic credit refunds on errors</li>
        </ul>
      </div>
    </div>
  );
}

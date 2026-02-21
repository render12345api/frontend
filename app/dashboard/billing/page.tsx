'use client';

import { useAuth } from '@/lib/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'deduction' | 'purchase';
  description: string;
  created_at: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const creditPlans = [
    { id: 'basic', name: 'Basic', messages: 12000, credits: 120, price: 9, currency: '₹', popular: false },
    { id: 'pro', name: 'Pro', messages: 36000, credits: 360, price: 29, currency: '₹', popular: true },
    { id: 'enterprise', name: 'Enterprise', messages: 55000, credits: 550, price: 49, currency: '₹', popular: false },
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/credits/transactions', { credentials: 'include' });
      if (response.ok) {
        const { transactions } = await response.json();
        setTransactions(transactions);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      const plan = creditPlans.find(p => p.id === planId);
      if (!plan) return;

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          credits: plan.credits,
          messages: plan.messages,
          amount: plan.price,
          currency: plan.currency,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const { message } = await response.json();
        alert(message || 'Please complete payment via the WhatsApp link provided');
        await fetchTransactions();
      } else {
        alert('Purchase initialization failed');
      }
    } catch (error) {
      console.error('[v0] Purchase error:', error);
      alert('Error processing purchase');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing & Credits</h1>
        <p className="text-muted-foreground">Manage your account credits and billing</p>
      </div>

      {/* Current Balance */}
      <div className="neumorphic-card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <div className="text-sm text-muted-foreground mb-2">Current Balance</div>
        <div className="text-5xl font-bold text-primary">{user?.credits}</div>
        <p className="text-sm text-muted-foreground mt-3">Credits available for campaigns</p>
      </div>

      {/* Credit Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Choose a Credit Package</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPlans.map((plan) => (
            <div
              key={plan.id}
              className={`neumorphic-card transition-all ${
                plan.popular ? 'bg-primary text-primary-foreground ring-2 ring-primary scale-105' : 'bg-card'
              }`}
            >
              {plan.popular && (
                <div className="text-sm font-bold mb-3 bg-primary-foreground/20 w-fit px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-1">{plan.messages.toLocaleString()}</div>
              <div className={`text-sm mb-6 ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                Messages
              </div>

              <div className={`text-3xl font-bold mb-2 ${plan.popular ? 'text-primary-foreground' : 'text-primary'}`}>
                {plan.currency}{plan.price}
              </div>

              <div className={`text-xs mb-6 ${plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {plan.credits} credits
              </div>

              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={isProcessing && selectedPlan === plan.id}
                className={`w-full neumorphic-button font-medium transition-all ${
                  plan.popular
                    ? 'bg-primary-foreground text-primary disabled:opacity-50'
                    : 'bg-secondary text-secondary-foreground disabled:opacity-50'
                }`}
              >
                {isProcessing && selectedPlan === plan.id ? 'Processing...' : 'Buy Credits'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
        {isLoading ? (
          <div className="neumorphic-card bg-card text-center py-8">
            <div className="w-6 h-6 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-muted-foreground text-sm">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="neumorphic-card bg-card text-center py-12">
            <div className="text-3xl mb-3">📊</div>
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="neumorphic-card bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-bold">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-bold">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-bold">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-bold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-primary/5 transition">
                      <td className="py-3 px-4 text-sm">{tx.description}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            tx.transaction_type === 'purchase'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-destructive/20 text-destructive'
                          }`}
                        >
                          {tx.transaction_type === 'purchase' ? '+ Purchase' : '- Deduction'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-bold ${
                        tx.transaction_type === 'purchase' ? 'text-primary' : 'text-destructive'
                      }`}>
                        {tx.transaction_type === 'purchase' ? '+' : '-'}{tx.amount}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="neumorphic-card bg-card/50 border border-border">
        <h3 className="font-bold mb-3">Need Help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Have questions about our pricing or need a custom plan? Our team is here to help.
        </p>
        <button className="neumorphic-button bg-primary text-primary-foreground text-sm">
          Contact Support
        </button>
      </div>
    </div>
  );
}

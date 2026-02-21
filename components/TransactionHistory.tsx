'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';

interface Transaction {
  id: number;
  transaction_type: 'launch' | 'purchase' | 'refund';
  credits_amount: number;
  phone_number: string | null;
  message_count: number | null;
  status: string;
  description: string;
  created_at: string;
}

export default function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('[v0] Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'launch':
        return '🚀';
      case 'purchase':
        return '💳';
      case 'refund':
        return '↩️';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'launch':
        return 'text-red-500';
      case 'purchase':
        return 'text-green-500';
      case 'refund':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="neumorphic-card bg-card">
      <h2 className="text-2xl font-bold mb-6">Transaction History</h2>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/50 transition">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl">{getTransactionIcon(transaction.transaction_type)}</span>
                <div className="flex-1">
                  <p className="font-medium capitalize">{transaction.transaction_type}</p>
                  {transaction.phone_number && (
                    <p className="text-xs text-muted-foreground">
                      {transaction.message_count} messages to {transaction.phone_number}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className={`text-right ${getTransactionColor(transaction.transaction_type)}`}>
                <p className="font-bold">
                  {transaction.transaction_type === 'launch' ? '-' : '+'}
                  {transaction.credits_amount}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

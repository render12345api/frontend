'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CreditWarningProps {
  requiredCredits: number;
  availableCredits: number;
}

export default function CreditWarning({ requiredCredits, availableCredits }: CreditWarningProps) {
  const isInsufficient = availableCredits < requiredCredits;

  if (!isInsufficient) return null;

  return (
    <div className="neumorphic-card bg-red-500/10 border border-red-500/30">
      <div className="flex gap-4">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-bold text-red-500 mb-1">Insufficient Credits</h3>
          <p className="text-sm text-muted-foreground mb-3">
            You need <span className="font-bold text-foreground">{requiredCredits} credits</span> but only have <span className="font-bold text-foreground">{availableCredits}</span>.
          </p>
          <Link href="/dashboard?tab=plans" className="text-red-500 hover:text-red-600 font-medium text-sm">
            Upgrade your plan →
          </Link>
        </div>
      </div>
    </div>
  );
}

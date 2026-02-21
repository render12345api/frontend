'use client';

import { useAuth } from '@/lib/useAuth';
import { useState } from 'react';
import Panel from '@/components/Panel';
import Plans from '@/components/Plans';
import Contact from '@/components/Contact';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('panel');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="neumorphic-card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email.split('@')[0]}!</h1>
        <p className="text-muted-foreground">Available Credits: <span className="text-primary font-bold text-xl">{user?.credits}</span></p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'panel', label: 'Panel', icon: '⚙️' },
          { id: 'plans', label: 'Plans', icon: '💳' },
          { id: 'contact', label: 'Contact', icon: '📧' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'panel' && <Panel />}
        {activeTab === 'plans' && <Plans />}
        {activeTab === 'contact' && <Contact />}
      </div>
    </div>
  );
}

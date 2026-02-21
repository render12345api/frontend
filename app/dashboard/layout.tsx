'use client';

import { useAuth } from '@/lib/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: '🏠' },
    { label: 'Campaigns', href: '/dashboard/campaigns', icon: '📱' },
    { label: 'Billing', href: '/dashboard/billing', icon: '💳' },
    { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      {/* Top Bar - Desktop */}
      <div className="hidden md:block sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">SMSBurst</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{user.email.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div className="text-sm font-medium">{user.email}</div>
                <div className="text-xs text-muted-foreground">{user.credits} Credits</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-4 px-2 text-center transition ${
                  isActive
                    ? 'text-primary neumorphic-button-active'
                    : 'text-muted-foreground'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold text-primary">SMSBurst</div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-primary">{user.credits} Credits</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm hover:bg-primary/30 transition"
              title="Logout"
            >
              ⌄
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Content Padding */}
      <div className="md:hidden pt-16"></div>
    </div>
  );
}

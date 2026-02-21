'use client';

import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DeviceManagement from '@/components/DeviceManagement';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile & Security</h1>
        <p className="text-muted-foreground">Manage your account settings and devices</p>
      </div>

      {/* Device Management Section */}
      <DeviceManagement />

      <div className="max-w-2xl space-y-8">
      {/* Account Information */}
      <div className="neumorphic-card bg-card">
        <h2 className="text-xl font-bold mb-6">Account Information</h2>
        <div className="space-y-4">
          <div className="p-4 border border-border rounded-xl bg-background/50">
            <label className="text-sm text-muted-foreground block mb-1">Email Address</label>
            <div className="text-lg font-medium">{user?.email}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-xl bg-background/50">
              <label className="text-sm text-muted-foreground block mb-1">Available Credits</label>
              <div className="text-2xl font-bold text-primary">{user?.credits}</div>
            </div>

            <div className="p-4 border border-border rounded-xl bg-background/50">
              <label className="text-sm text-muted-foreground block mb-1">Member Since</label>
              <div className="text-lg font-medium">2024</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="neumorphic-card bg-card">
        <h2 className="text-xl font-bold mb-6">API Access</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use your API key to access SMSBurst programmatically. Keep it secret!
          </p>
          <div className="p-4 border border-border rounded-xl bg-background/50 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">sk_live_••••••••••••••••</span>
              <button className="text-primary hover:text-primary/80 transition text-xs font-bold">
                Copy
              </button>
            </div>
          </div>
          <button className="text-sm text-primary hover:underline">Regenerate Key</button>
        </div>
      </div>

      {/* Security */}
      <div className="neumorphic-card bg-card">
        <h2 className="text-xl font-bold mb-6">Security</h2>
        <div className="space-y-4">
          <button className="w-full p-4 text-left border border-border rounded-xl hover:bg-primary/5 transition">
            <div className="font-medium mb-1">Change Password</div>
            <div className="text-sm text-muted-foreground">Update your login password</div>
          </button>

          <button className="w-full p-4 text-left border border-border rounded-xl hover:bg-primary/5 transition">
            <div className="font-medium mb-1">Two-Factor Authentication</div>
            <div className="text-sm text-muted-foreground">Enable 2FA for added security</div>
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="neumorphic-card bg-card">
        <h2 className="text-xl font-bold mb-6">Preferences</h2>
        <div className="space-y-4">
          <label className="flex items-center p-3 border border-border rounded-xl cursor-pointer hover:bg-primary/5 transition">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="ml-3 text-sm">Email notifications for campaigns</span>
          </label>

          <label className="flex items-center p-3 border border-border rounded-xl cursor-pointer hover:bg-primary/5 transition">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="ml-3 text-sm">Low credit alerts</span>
          </label>

          <label className="flex items-center p-3 border border-border rounded-xl cursor-pointer hover:bg-primary/5 transition">
            <input type="checkbox" className="w-4 h-4" />
            <span className="ml-3 text-sm">Marketing emails</span>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="neumorphic-card bg-destructive/5 border-2 border-destructive/20">
        <h2 className="text-xl font-bold mb-6 text-destructive">Danger Zone</h2>
        <div className="space-y-3">
          <button className="w-full p-4 text-left border-2 border-destructive/20 rounded-xl hover:bg-destructive/10 transition">
            <div className="font-medium text-destructive mb-1">Delete Account</div>
            <div className="text-sm text-destructive/70">Permanently delete your account and all data</div>
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full neumorphic-button bg-destructive text-destructive-foreground disabled:opacity-50"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

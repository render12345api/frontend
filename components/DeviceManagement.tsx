'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';

interface Device {
  fingerprint: string;
  browser: string;
  deviceName: string;
  lastUsed: string;
  isTrusted: boolean;
}

interface Session {
  ip: string;
  loginCount: number;
  lastLogin: string;
  isCurrentSession: boolean;
}

export default function DeviceManagement() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDevicesAndSessions();
  }, []);

  const fetchDevicesAndSessions = async () => {
    try {
      const [devicesRes, sessionsRes] = await Promise.all([
        fetch('/api/auth/verify-device', { credentials: 'include' }),
        fetch('/api/auth/sessions', { credentials: 'include' })
      ]);

      if (devicesRes.ok) {
        const data = await devicesRes.json();
        setDevices(data.trustedDevices || []);
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.activeSessions || []);
      }
    } catch (err) {
      console.error('[v0] Error fetching devices/sessions:', err);
      setError('Failed to load device information');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="neumorphic-card bg-card p-8 text-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-muted-foreground">Loading device information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="neumorphic-card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <h2 className="text-2xl font-bold mb-2">Device & Session Management</h2>
        <p className="text-muted-foreground">Manage your trusted devices and login sessions. Any new device will require fresh authentication.</p>
      </div>

      {error && (
        <div className="neumorphic-card bg-red-500/10 border border-red-500/30 p-4">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      )}

      {/* Trusted Devices */}
      <div className="neumorphic-card bg-card">
        <h3 className="text-xl font-bold mb-4">Trusted Devices</h3>
        {devices.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No trusted devices yet. Login from a device to register it.</p>
        ) : (
          <div className="space-y-3">
            {devices.map((device, idx) => (
              <div key={idx} className="p-4 border border-border rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">
                    <span>
                      {device.deviceName === 'Mobile' ? '📱' : device.deviceName === 'Tablet' ? '📱' : '💻'}
                    </span>
                    {device.deviceName} • {device.browser}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last used: {new Date(device.lastUsed).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {device.fingerprint.substring(0, 16)}...
                  </p>
                </div>
                {device.isTrusted && (
                  <div className="px-3 py-1 bg-green-500/20 text-green-600 rounded text-xs font-bold">
                    Verified
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="neumorphic-card bg-card">
        <h3 className="text-xl font-bold mb-4">Active Login Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No active sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, idx) => (
              <div key={idx} className="p-4 border border-border rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">
                    🌐 {session.ip}
                    {session.isCurrentSession && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        Current Session
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last login: {new Date(session.lastLogin).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total logins: {session.loginCount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="neumorphic-card bg-blue-500/10 border border-blue-500/30 p-4">
        <p className="text-sm text-foreground">
          <span className="font-bold">Security Note:</span> Each login from a new device or IP address is automatically tracked. 
          This helps protect your account from unauthorized access. Your credentials are never shared across devices.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import Terminal from './Terminal';
import CreditWarning from './CreditWarning';

export default function Panel() {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [delay, setDelay] = useState('1');
  const [messages, setMessages] = useState('');
  const [mode, setMode] = useState('Normal');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Calculate credits needed
  const creditsNeeded = messages ? Math.ceil(Number(messages)) : 0;
  const hasEnoughCredits = user && user.credits >= creditsNeeded;

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleLaunch = async () => {
    setError('');
    setLogs([]);
    
    // Validation
    if (!phone || !messages || !delay) {
      setError('Please fill in all required fields');
      return;
    }

    const phoneNum = String(phone).replace(/\D/g, '');
    if (phoneNum.length < 10) {
      setError('Invalid phone number');
      return;
    }

    const msgCount = Number(messages);
    if (msgCount <= 0) {
      setError('Message count must be greater than 0');
      return;
    }

    const delayNum = Number(delay);
    if (delayNum < 0) {
      setError('Delay cannot be negative');
      return;
    }

    // Credit check - clientside first
    if (!hasEnoughCredits) {
      setError(`Insufficient credits. Need ${creditsNeeded}, you have ${user?.credits || 0}`);
      return;
    }

    setIsLoading(true);
    setIsRunning(true);
    addLog(`Preparing SMS burst: ${msgCount} messages to ${phone}`);
    addLog(`Delay: ${delayNum}s | Mode: ${mode}`);

    try {
      // Step 1: Validate and deduct credits
      addLog('Validating phone number and checking credits...');
      const deductResponse = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNum,
          messageCount: msgCount,
          delay: delayNum,
        }),
        credentials: 'include',
      });

      if (!deductResponse.ok) {
        const errorData = await deductResponse.json();
        if (errorData.error === 'This phone number is protected and cannot receive messages') {
          addLog('ERROR: Number is protected/blocked');
          setError(errorData.error);
          setIsRunning(false);
          return;
        }
        throw new Error(errorData.error || 'Failed to validate and deduct credits');
      }

      const deductData = await deductResponse.json();
      addLog(`Credits check passed | Deducted: ${deductData.creditsDeducted} | Remaining: ${deductData.creditsRemaining}`);
      addLog('Connecting to Render API...');

      // Step 2: Launch attack via Render API
      addLog('Launching SMS burst to Render API...');
      const launchResponse = await fetch('https://sms-burst-api-2.onrender.com/api/job/start', {
        method: 'POST',
        headers: {
          'X-API-Key': 'render12345',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targets: [phoneNum],
          mode: mode,
          delay: delayNum,
          max_requests: msgCount,
        }),
      });

      if (!launchResponse.ok) {
        const errorData = await launchResponse.json();
        addLog(`Error: ${errorData.error || 'Failed to launch attack'}`);
        throw new Error(errorData.error || 'Failed to launch attack');
      }

      const launchData = await launchResponse.json();
      setJobId(launchData.id);
      addLog(`SUCCESS: Attack started! Job ID: ${launchData.id}`);
      addLog(`Sending ${msgCount} messages to ${phone} with ${delayNum}s delay`);
      addLog(`Status: ${launchData.status || 'Running'}`);
      addLog(`Mode: ${mode} | Requests: ${msgCount}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addLog(`Error: ${errorMessage}`);
      setIsRunning(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!jobId) return;

    try {
      addLog('Stopping attack...');
      const stopResponse = await fetch('https://sms-burst-api-2.onrender.com/api/job/stop', {
        method: 'POST',
        headers: {
          'X-API-Key': 'render12345',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: jobId }),
      });

      if (stopResponse.ok) {
        addLog('Attack stopped');
        setIsRunning(false);
        setJobId(null);
      } else {
        throw new Error('Failed to stop attack');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop';
      addLog(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error and Warning Messages */}
      {error && (
        <div className="neumorphic-card bg-red-500/10 border border-red-500/30 p-4">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      )}

      {creditsNeeded > 0 && !hasEnoughCredits && (
        <CreditWarning requiredCredits={creditsNeeded} availableCredits={user?.credits || 0} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Card */}
          <div className="neumorphic-card bg-card space-y-4">
            <h2 className="text-xl font-bold mb-4">Launch SMS Burst</h2>

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number (e.g., 9999999999)"
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              disabled={isRunning}
            />
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              disabled={isRunning}
            >
              <option value="Normal">Normal</option>
              <option value="Burst">Burst</option>
              <option value="Flood">Flood</option>
            </select>
          </div>

          {/* Delay Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Delay (seconds)</label>
            <input
              type="number"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              placeholder="Delay between requests"
              min="0.1"
              step="0.1"
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              disabled={isRunning}
            />
          </div>

          {/* Messages Count Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Number of Messages</label>
            <input
              type="number"
              value={messages}
              onChange={(e) => setMessages(e.target.value)}
              placeholder="How many SMS to send"
              min="1"
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              disabled={isRunning}
            />
          </div>

          {/* Credits Info */}
          <div className={`p-4 rounded-xl border ${
            hasEnoughCredits 
              ? 'bg-primary/5 border-primary/20' 
              : 'bg-destructive/5 border-destructive/20'
          }`}>
            <div className="text-sm font-medium mb-1">
              Credits Needed: <span className="text-primary font-bold">{creditsNeeded}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Available: {user?.credits || 0} credits (1 message = 1 credit)
            </div>
            {!hasEnoughCredits && (
              <div className="text-xs text-destructive mt-2 font-medium">
                Insufficient credits. Upgrade your plan to continue.
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleLaunch}
              disabled={isLoading || isRunning || !hasEnoughCredits}
              className="flex-1 neumorphic-button bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : isRunning ? 'Running...' : 'Launch Burst'}
            </button>
            {isRunning && (
              <button
                onClick={handleStop}
                className="flex-1 neumorphic-button bg-destructive text-destructive-foreground font-medium"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Credits & Stats */}
      <div className="space-y-4">
        {/* Credits Card */}
        <div className="neumorphic-card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
          <h3 className="font-bold mb-3">Account Balance</h3>
          <div className="text-3xl font-bold text-primary mb-2">{user?.credits || 0}</div>
          <p className="text-xs text-muted-foreground mb-3">Credits available</p>
          <button className="w-full neumorphic-button bg-primary text-primary-foreground text-sm">
            Buy Credits
          </button>
        </div>

        {/* Stats Card */}
        <div className="neumorphic-card bg-card">
          <h3 className="font-bold mb-3">Burst Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target:</span>
              <span className="font-mono font-bold">{phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Messages:</span>
              <span className="font-bold">{messages || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delay:</span>
              <span className="font-bold">{delay || '0'}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode:</span>
              <span className="font-bold text-primary">{mode}</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        {isRunning && (
          <div className="neumorphic-card bg-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-green-600">Running</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {jobId && `Job ID: ${jobId}`}
            </p>
          </div>
        )}
      </div>
      </div>

      {/* Terminal */}
      <Terminal logs={logs} isRunning={isRunning} />
    </div>
  );
}

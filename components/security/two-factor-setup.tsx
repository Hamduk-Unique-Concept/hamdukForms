'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/app/providers';
import { ShieldAlert, Copy, Check } from 'lucide-react';

interface TwoFactorSetupProps {
  onSetupComplete?: () => void;
}

export default function TwoFactorSetup({ onSetupComplete }: TwoFactorSetupProps) {
  const { session } = useAuth();
  const [step, setStep] = useState<'start' | 'qr' | 'verify' | 'backup'>('start');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enabled2FA, setEnabled2FA] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/security/2fa/setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setStep('qr');
      }
    } catch (error) {
      console.error('Error starting 2FA setup:', error);
      alert('Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      alert('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/security/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (response.ok) {
        const data = await response.json();
        setBackupCodes(data.backupCodes);
        setStep('backup');
      } else {
        alert('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      alert('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setEnabled2FA(true);
      onSetupComplete?.();
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      alert('Failed to enable 2FA');
    }
  };

  const copyBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (enabled2FA) {
    return (
      <Card className="p-6 bg-green-50 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">2FA Enabled</h3>
            <p className="text-sm text-green-700 mt-1">
              Your account is now protected with two-factor authentication
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-6">
        <ShieldAlert className="w-6 h-6 text-blue-600 mt-1" />
        <div>
          <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-600">
            Add an extra layer of security to your account
          </p>
        </div>
      </div>

      {step === 'start' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            2FA adds an extra security layer by requiring a code from your phone in addition to
            your password.
          </p>
          <Button onClick={handleStartSetup} disabled={loading} className="w-full">
            {loading ? 'Setting up...' : 'Set Up 2FA'}
          </Button>
        </div>
      )}

      {step === 'qr' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3">Scan with your authenticator app</p>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              {qrCode ? (
                <img src={qrCode} alt="2FA QR code" className="mx-auto h-48 w-48" />
              ) : (
                <p className="text-xs text-gray-600">QR code loading...</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Use Google Authenticator, Microsoft Authenticator, or Authy to scan the code
          </p>
          <Button
            onClick={() => setStep('verify')}
            className="w-full"
          >
            I've Scanned the Code
          </Button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Verification Code</label>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>
          <Button onClick={handleVerify} disabled={loading} className="w-full">
            {loading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </div>
      )}

      {step === 'backup' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-900 mb-3">Save your backup codes</p>
            <p className="text-xs text-yellow-700 mb-4">
              Store these codes somewhere safe. You can use them to access your account if you lose
              access to your authenticator app.
            </p>
            <div className="bg-white p-3 rounded border border-yellow-200 mb-3">
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyBackupCodes}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" /> Copy Codes
                </>
              )}
            </Button>
          </div>

          <Button onClick={handleComplete} className="w-full">
            I've Saved the Codes
          </Button>
        </div>
      )}
    </Card>
  );
}

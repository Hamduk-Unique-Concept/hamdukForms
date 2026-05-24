'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Mail, Twitter } from 'lucide-react';

interface ReferralWidgetProps {
  referralCode: string;
  referralUrl: string;
  onCopied?: () => void;
}

export default function ReferralWidget({ referralCode, referralUrl, onCopied }: ReferralWidgetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    onCopied?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Join Hamduk Forms and get 10% discount on your first month! Use code: ${referralCode} - ${referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareEmail = () => {
    const subject = 'You have been referred to Hamduk Forms!';
    const body = `I'm using Hamduk Forms for my forms and I think you'd love it! Use my referral code for 10% off: ${referralCode}\n\n${referralUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareTwitter = () => {
    const text = `Check out Hamduk Forms - get 10% off with my referral code! ${referralCode} ${referralUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
      <h3 className="font-semibold text-lg mb-4">Your Referral Link</h3>
      
      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
        <p className="text-sm text-gray-600 mb-2">Your unique referral code:</p>
        <p className="font-mono text-lg font-bold text-purple-600">{referralCode}</p>
        <p className="text-xs text-gray-500 mt-2 break-all">{referralUrl}</p>
      </div>

      <div className="space-y-2">
        <Button onClick={handleCopy} className="w-full" variant="outline">
          <Copy className="w-4 h-4 mr-2" />
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <Button onClick={shareWhatsApp} size="sm" variant="outline">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button onClick={shareEmail} size="sm" variant="outline">
            <Mail className="w-4 h-4" />
          </Button>
          <Button onClick={shareTwitter} size="sm" variant="outline">
            <Twitter className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

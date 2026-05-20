'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReferralWidget from '@/components/billing/referral-widget';
import { Users, DollarSign, TrendingUp, Mail } from 'lucide-react';

interface ReferralCode {
  id: string;
  code: string;
  uses_count: number;
  total_commission_earned: number;
}

interface ReferralStats {
  totalReferred: number;
  totalEarned: number;
  codes: ReferralCode[];
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralUrl, setReferralUrl] = useState('');

  useEffect(() => {
    fetchStats();
    generateCode();
  }, []);

  const fetchStats = async () => {
    try {
      const orgId = localStorage.getItem('organizationId') || '';
      const res = await fetch(`/api/referrals/stats?organizationId=${orgId}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('[v0] Failed to fetch referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      const orgId = localStorage.getItem('organizationId') || '';
      const res = await fetch('/api/referrals/generate', {
        method: 'POST',
        body: JSON.stringify({ organizationId: orgId }),
      });
      const data = await res.json();
      setReferralCode(data.code);
      setReferralUrl(data.url);
    } catch (error) {
      console.error('[v0] Failed to generate referral code:', error);
    }
  };

  const handlePayoutRequest = async () => {
    const orgId = localStorage.getItem('organizationId') || '';
    try {
      await fetch('/api/referrals/payout-request', {
        method: 'POST',
        body: JSON.stringify({ organizationId: orgId }),
      });
      alert('Payout request submitted. Admin will contact you shortly.');
    } catch (error) {
      console.error('[v0] Payout request failed:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading referral data...</div>;
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-gray-600">Earn 10% commission for every referral that converts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Referred</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalReferred || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Commissions Earned</p>
              <p className="text-3xl font-bold mt-2">${(stats?.totalEarned || 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Commission Rate</p>
              <p className="text-3xl font-bold mt-2">10%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Referral Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ReferralWidget referralCode={referralCode} referralUrl={referralUrl} />

        {/* Payout Section */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Request Payout</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Pending Balance</p>
            <p className="text-2xl font-bold">${(stats?.totalEarned || 0).toFixed(2)}</p>
          </div>
          <Button onClick={handlePayoutRequest} className="w-full" disabled={!stats?.totalEarned}>
            <Mail className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
          <p className="text-xs text-gray-500 mt-2">Payouts are processed within 5-7 business days</p>
        </Card>
      </div>

      {/* Referred Users Table */}
      {stats && stats.codes.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Your Referral Codes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Uses</th>
                  <th className="text-left p-2">Commission</th>
                </tr>
              </thead>
              <tbody>
                {stats.codes.map((code) => (
                  <tr key={code.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono font-semibold">{code.code}</td>
                    <td className="p-2">{code.uses_count}</td>
                    <td className="p-2">${(code.total_commission_earned || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

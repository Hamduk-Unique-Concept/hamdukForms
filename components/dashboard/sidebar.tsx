'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { session } = useAuth();
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  useEffect(() => {
    if (!session?.access_token) {
      setShowUpgradeBanner(false);
      return;
    }

    const orgId = localStorage.getItem('organizationId');
    if (!orgId || orgId === 'null') {
      setShowUpgradeBanner(true);
      return;
    }

    fetch(`/api/billing/subscription?organizationId=${orgId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const planName = String(payload?.data?.plan?.name || '').toLowerCase();
        const subscriptionStatus = String(payload?.data?.subscription?.status || '').toLowerCase();
        setShowUpgradeBanner(!subscriptionStatus || planName === 'free');
      })
      .catch(() => setShowUpgradeBanner(true));
  }, [session?.access_token]);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/forms', label: 'Forms', icon: '📝' },
    { href: '/dashboard/responses', label: 'Responses', icon: '📬' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
    { href: '/dashboard/integrations', label: 'Integrations', icon: '🔗' },
    { href: '/dashboard/team', label: 'Team', icon: '👥' },
    { href: '/dashboard/referrals', label: 'Referrals', icon: '🤝' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      <Link href="/dashboard" className="flex items-center mb-8">
        <div className="text-2xl font-bold text-primary">Hamduk</div>
      </Link>

      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
              pathname === link.href
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <span className="text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-gray-200 space-y-3">
        {showUpgradeBanner && (
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white">
            <p className="text-xs font-semibold mb-2">Unlock Premium Features</p>
            <p className="text-xs opacity-90 mb-3">Upgrade to Pro to get AI, webhooks, and more</p>
            <Link href="/pricing" className="block">
              <button className="w-full px-3 py-1.5 bg-white text-purple-600 text-xs rounded font-semibold hover:bg-gray-100 transition-colors">
                View Plans
              </button>
            </Link>
          </div>
        )}

        <Link href="/dashboard/billing" className="block">
          <button className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Manage Billing
          </button>
        </Link>
      </div>
    </div>
  );
}

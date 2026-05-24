'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const settingsList = [
    { href: '/dashboard/settings/profile', label: 'Profile', icon: '👤' },
    { href: '/dashboard/settings/account', label: 'Account', icon: '⚙️' },
    { href: '/dashboard/settings/billing', label: 'Billing', icon: '💳' },
    { href: '/dashboard/settings/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/dashboard/settings/integrations', label: 'Integrations', icon: '🔗' },
    { href: '/dashboard/settings/security', label: 'Security', icon: '🔐' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsList.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold">{item.label}</h3>
              <p className="text-sm text-gray-600 mt-2">Manage your {item.label.toLowerCase()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

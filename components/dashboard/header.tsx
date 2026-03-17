'use client';

import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          {user?.email}
        </div>
        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
          {user?.email?.[0].toUpperCase()}
        </div>
        <Link href="/dashboard/settings/profile">
          <Button variant="outline" size="sm">Profile</Button>
        </Link>
        <Link href="/auth/logout">
          <Button variant="ghost" size="sm">Logout</Button>
        </Link>
      </div>
    </header>
  );
}

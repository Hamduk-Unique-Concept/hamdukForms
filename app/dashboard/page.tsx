'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/stats-card';
import { useAuth } from '../providers';

interface DashboardStats {
  forms: any[];
  responses: any[];
  members: number;
}

export default function DashboardPage() {
  const { user, session } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ forms: [], responses: [], members: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    const orgId = localStorage.getItem('organizationId');
    if (!orgId || orgId === 'null') {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/forms?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).then((response) => response.json()).catch(() => ({ forms: [] })),
      fetch(`/api/responses?organizationId=${orgId}&limit=100`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).then((response) => response.json()).catch(() => ({ responses: [] })),
      fetch(`/api/team/invite?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).then((response) => response.json()).catch(() => ({ members: [] })),
    ])
      .then(([formsData, responsesData, membersData]) => {
        setStats({
          forms: Array.isArray(formsData.forms) ? formsData.forms : [],
          responses: Array.isArray(responsesData.responses) ? responsesData.responses : [],
          members: Array.isArray(membersData.members) ? Math.max(membersData.members.length, 1) : 1,
        });
      })
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const computed = useMemo(() => {
    const totalResponses = stats.responses.length;
    const completed = stats.responses.filter((response) => (response.status || 'completed') === 'completed').length;
    return {
      totalForms: stats.forms.length,
      totalResponses,
      completionRate: totalResponses ? Math.round((completed / totalResponses) * 100) : 0,
      recentForms: stats.forms.slice(0, 3),
    };
  }, [stats]);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {displayName}!</h1>
        <p className="text-gray-600">Manage your forms, responses, and analytics in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard label="Total Forms" value={loading ? '...' : String(computed.totalForms)} change="All forms" />
        <StatsCard label="Total Responses" value={loading ? '...' : String(computed.totalResponses)} change="Latest submissions" />
        <StatsCard label="Completion Rate" value={loading ? '...' : `${computed.completionRate}%`} change="Completed responses" />
        <StatsCard label="Workspace Members" value={loading ? '...' : String(stats.members)} change={stats.members === 1 ? 'You' : 'Active members'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Get Started</h2>
          <p className="text-gray-600 mb-6">Create your next hybrid form and start collecting responses.</p>
          <Link href="/dashboard/forms/create">
            <Button className="w-full">Create New Form</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Referrals</h2>
          <p className="text-gray-600 mb-6">Share Hamduk and track your referral rewards.</p>
          <Link href="/dashboard/referrals">
            <Button variant="outline" className="w-full">Open Referrals</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Forms</h2>
            <Link href="/dashboard/forms">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {computed.recentForms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No forms yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {computed.recentForms.map((form) => (
                <Link
                  key={form.id}
                  href={`/dashboard/forms/${form.id}`}
                  className="block rounded-md border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <p className="font-medium">{form.title || form.name || 'Untitled form'}</p>
                  <p className="text-xs text-gray-500">{form.is_published ? 'Published' : 'Draft'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

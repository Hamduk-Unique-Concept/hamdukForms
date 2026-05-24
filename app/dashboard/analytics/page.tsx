'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormRow {
  id: string;
  name?: string | null;
  total_views?: number | null;
  total_responses?: number | null;
}

interface ResponseRow {
  id: string;
  form_id: string;
  status?: string | null;
}

export default function AnalyticsPage() {
  const { session } = useAuth();
  const [forms, setForms] = useState<FormRow[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      }).then(async (response) => (response.ok ? response.json() : { forms: [] })),
      fetch(`/api/responses?organizationId=${orgId}&limit=100`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load analytics');
        return data;
      }),
    ])
      .then(([formsData, responsesData]) => {
        setForms(Array.isArray(formsData.forms) ? formsData.forms : []);
        setResponses(Array.isArray(responsesData.responses) ? responsesData.responses : []);
      })
      .catch((err) => setError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const stats = useMemo(() => {
    const totalViews = forms.reduce((sum, form) => sum + Number(form.total_views || 0), 0);
    const totalResponses = responses.length;
    const completedResponses = responses.filter((response) => (response.status || 'completed') === 'completed').length;
    const completionRate = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

    const responsesByForm = responses.reduce((acc: Record<string, number>, response) => {
      acc[response.form_id] = (acc[response.form_id] || 0) + 1;
      return acc;
    }, {});

    const topForms = forms
      .map((form) => ({
        ...form,
        responseCount: responsesByForm[form.id] || Number(form.total_responses || 0),
      }))
      .sort((a, b) => b.responseCount - a.responseCount)
      .slice(0, 5);

    return { totalViews, totalResponses, completionRate, topForms };
  }, [forms, responses]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600 mt-2">Get insights from your form data</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-lg bg-white p-12 shadow">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Could not load analytics</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-600 font-medium">Total Views</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">Across {forms.length} forms</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-600 font-medium">Total Responses</h3>
              <p className="text-3xl font-bold mt-2">{stats.totalResponses.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">Latest 100 submissions</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-600 font-medium">Completion Rate</h3>
              <p className="text-3xl font-bold mt-2">{stats.completionRate}%</p>
              <p className="text-sm text-gray-500 mt-2">Completed submissions</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Top Forms</h3>
              <Link href="/dashboard/forms">
                <Button variant="outline" size="sm">View Forms</Button>
              </Link>
            </div>

            {stats.topForms.length === 0 ? (
              <div className="py-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No analytics data</h3>
                <p className="text-gray-600 mb-6">Analytics will appear here once you receive responses</p>
                <Link href="/dashboard/forms/create">
                  <Button>Create Your First Form</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between rounded-md border border-gray-200 p-4">
                    <div>
                      <p className="font-medium">{form.name || 'Untitled form'}</p>
                      <p className="text-sm text-gray-500">{Number(form.total_views || 0).toLocaleString()} views</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{form.responseCount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">responses</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

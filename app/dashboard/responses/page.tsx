'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface FormResponse {
  id: string;
  form_id: string;
  submitter_email?: string | null;
  submitter_name?: string | null;
  response_data: Record<string, any>;
  status?: string | null;
  created_at: string;
  form?: { id: string; name?: string | null; slug?: string | null } | null;
}

function formatValue(value: any) {
  if (Array.isArray(value)) return value.join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return value || '-';
}

export default function ResponsesPage() {
  const { session } = useAuth();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

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

    fetch(`/api/responses?organizationId=${orgId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load responses');
        setResponses(Array.isArray(data.responses) ? data.responses : []);
      })
      .catch((err) => setError(err.message || 'Failed to load responses'))
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const filteredResponses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return responses;

    return responses.filter((response) => {
      const haystack = [
        response.form?.name,
        response.submitter_name,
        response.submitter_email,
        response.status,
        JSON.stringify(response.response_data || {}),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [responses, search]);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Responses</h1>
          <p className="text-gray-600 mt-2">View all form responses and submissions</p>
        </div>
        <Link href="/dashboard/forms/create">
          <Button>Create Form</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b p-4">
          <Input
            placeholder="Search responses"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Could not load responses</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">Inbox</div>
            <h3 className="text-xl font-semibold mb-2">No responses yet</h3>
            <p className="text-gray-600 mb-6">Responses from your forms will appear here</p>
            <Link href="/dashboard/forms/create">
              <Button>Create Your First Form</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Form</th>
                  <th className="px-4 py-3 text-left font-medium">Respondent</th>
                  <th className="px-4 py-3 text-left font-medium">Response</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((response) => {
                  const entries = Object.entries(response.response_data || {}).slice(0, 3);
                  return (
                    <tr key={response.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {response.form?.name || 'Untitled form'}
                      </td>
                      <td className="px-4 py-3">
                        <div>{response.submitter_name || 'Anonymous'}</div>
                        {response.submitter_email && (
                          <div className="text-xs text-gray-500">{response.submitter_email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {entries.length === 0 ? (
                          '-'
                        ) : (
                          <div className="space-y-1">
                            {entries.map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {formatValue(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          {response.status || 'completed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(response.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

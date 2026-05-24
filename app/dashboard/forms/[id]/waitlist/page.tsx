'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, UserPlus } from 'lucide-react';

interface WaitlistEntry {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  waitlist_position: number;
  status: string;
  promoted_at?: string | null;
  promotion_expires_at?: string | null;
  created_at: string;
}

export default function FormWaitlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session } = useAuth();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyEntry, setBusyEntry] = useState<string | null>(null);

  const fetchEntries = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/waitlist/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [session?.access_token]);

  const promoteEntry = async (entryId?: string) => {
    if (!session?.access_token) return;
    setBusyEntry(entryId || 'next');
    try {
      const response = await fetch('/api/waitlist/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(entryId ? { entryId } : { formId: id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to promote waitlist entry');
      await fetchEntries();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to promote waitlist entry');
    } finally {
      setBusyEntry(null);
    }
  };

  const removeEntry = async (entryId: string) => {
    if (!session?.access_token) return;
    setBusyEntry(entryId);
    try {
      const response = await fetch(`/api/waitlist/${entryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to remove waitlist entry');
      await fetchEntries();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove waitlist entry');
    } finally {
      setBusyEntry(null);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const haystack = `${entry.email} ${entry.name || ''} ${entry.phone || ''} ${entry.status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const waitingCount = entries.filter((entry) => entry.status === 'waiting').length;
  const promotedCount = entries.filter((entry) => entry.status === 'promoted').length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/forms/${id}`} className="text-primary hover:underline mb-4 inline-block">
          Back to form
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Waitlist</h1>
            <p className="text-gray-600">Manage people waiting for slots, seats, or inventory.</p>
          </div>
          <Button onClick={() => promoteEntry()} disabled={busyEntry === 'next' || waitingCount === 0}>
            {busyEntry === 'next' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Promote Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-3xl font-bold mt-2">{entries.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Waiting</p>
          <p className="text-3xl font-bold mt-2">{waitingCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Promoted</p>
          <p className="text-3xl font-bold mt-2">{promotedCount}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, phone, or status"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No waitlist entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Position</th>
                  <th className="p-2">Person</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Joined</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-semibold">#{entry.waitlist_position}</td>
                    <td className="p-2">
                      <p className="font-medium">{entry.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{entry.email}</p>
                      {entry.phone && <p className="text-xs text-gray-500">{entry.phone}</p>}
                    </td>
                    <td className="p-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          entry.status === 'promoted'
                            ? 'bg-green-100 text-green-700'
                            : entry.status === 'removed'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {entry.status}
                      </span>
                      {entry.promotion_expires_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Expires {new Date(entry.promotion_expires_at).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="p-2">{new Date(entry.created_at).toLocaleDateString()}</td>
                    <td className="p-2">
                      <div className="flex justify-end gap-2">
                        {entry.status === 'waiting' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => promoteEntry(entry.id)}
                            disabled={busyEntry === entry.id}
                          >
                            Promote
                          </Button>
                        )}
                        {entry.status !== 'removed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeEntry(entry.id)}
                            disabled={busyEntry === entry.id}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

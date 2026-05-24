'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers';
import { Loader2 } from 'lucide-react';

export default function FormsPage() {
  const { session } = useAuth();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    const orgId = localStorage.getItem('organizationId');
    if (!orgId || orgId === 'null') {
      setForms([]);
      setLoading(false);
      return;
    }

    fetch(`/api/forms?organizationId=${orgId}`)
      .then(r => r.json())
      .then(data => setForms(data.forms || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Forms</h1>
          <p className="text-gray-600 mt-2">Manage and create your forms</p>
        </div>
        <Link href="/dashboard/forms/create">
          <Button>Create New Form</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : forms.length === 0 ? (
          <div className="p-6 text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No forms yet</h3>
            <p className="text-gray-600 mb-6">Create your first form to get started</p>
            <Link href="/dashboard/forms/create">
              <Button>Create Your First Form</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {forms.map((form) => (
              <div key={form.id} className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{form.name || 'Untitled Form'}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {form.is_published ? '🟢 Published' : '⚪ Draft'} ·
                    Created {new Date(form.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/dashboard/forms/${form.id}`}>
                  <Button variant="outline" size="sm">Open</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

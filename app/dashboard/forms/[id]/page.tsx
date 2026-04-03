'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers';
import { Copy, Eye, Loader2, Trash2, Files } from 'lucide-react';

interface FormData {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_published: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export default function FormDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { session } = useAuth();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session?.access_token && params.id) {
      fetchForm();
    }
  }, [session?.access_token, params.id]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Form not found or you do not have access');
      }

      const data = await response.json();
      setForm(data.form);

      // Fetch the actual publish link if published
      if (data.form.is_published) {
        const publishRes = await fetch(`/api/forms/publish?formId=${data.form.id}`);
        const publishData = await publishRes.json();
        if (publishData.publishableUrl) {
          setShareUrl(publishData.publishableUrl);
        }
      }
    } catch (error: any) {
      console.error('[v0] Error fetching form:', error);
      alert(error.message);
      router.push('/dashboard/forms');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!form) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/forms/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ formId: form.id, action: 'publish' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setForm({ ...form, is_published: true });
      setShareUrl(data.publishableUrl);
      alert('Form published successfully!');
    } catch (error: any) {
      console.error('[v0] Publish error:', error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!form) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/forms/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ formId: form.id, action: 'unpublish' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setForm({ ...form, is_published: false });
      setShareUrl('');
      alert('Form unpublished successfully');
    } catch (error: any) {
      console.error('[v0] Unpublish error:', error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDuplicate = async () => {
    if (!form) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/forms/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ formId: form.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert('Form duplicated successfully');
      router.push(`/dashboard/forms/${data.newFormId}`);
    } catch (error: any) {
      console.error('[v0] Duplicate error:', error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form || !confirm('Are you sure you want to delete this form?')) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/forms/${form.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete form');

      alert('Form deleted successfully');
      router.push('/dashboard/forms');
    } catch (error: any) {
      console.error('[v0] Delete error:', error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-8">
        <p className="text-red-600">Form not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/forms" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Forms
        </Link>
        <h1 className="text-3xl font-bold">{form.name || 'Untitled Form'}</h1>
        <p className="text-gray-600 mt-1">{form.description || 'No description'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 font-medium">Status</h3>
          <p className="text-3xl font-bold mt-2">
            {form.is_published ? '🟢 Published' : '⚪ Draft'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 font-medium">Created</h3>
          <p className="text-lg font-medium mt-2">
            {new Date(form.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 font-medium">Last Updated</h3>
          <p className="text-lg font-medium mt-2">
            {new Date(form.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Publish/Share Section */}
      {form.is_published && shareUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Share Your Form</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-2 border rounded-lg bg-white"
            />
            <Button onClick={handleCopyLink} className="gap-2">
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Share this link with others to let them fill out your form
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Form Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href={`/dashboard/forms/${form.id}/edit`}>
            <Button className="w-full" variant="outline">
              Edit Form
            </Button>
          </Link>

          <Link href={`/forms/${form.slug}`} target="_blank">
            <Button className="w-full gap-2" variant="outline">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          </Link>

          {form.is_published ? (
            <Button
              onClick={handleUnpublish}
              disabled={actionLoading}
              variant="outline"
              className="w-full"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unpublish'}
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={actionLoading}
              variant="outline"
              className="w-full"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish'}
            </Button>
          )}

          <Link href={`/dashboard/forms/${form.id}/responses`}>
            <Button className="w-full" variant="outline">
              Responses
            </Button>
          </Link>

          <Link href={`/dashboard/forms/${form.id}/settings`}>
            <Button className="w-full" variant="outline">
              Settings
            </Button>
          </Link>

          <Button
            onClick={handleDuplicate}
            disabled={actionLoading}
            variant="outline"
            className="w-full gap-2"
          >
            <Files className="w-4 h-4" />
            Duplicate
          </Button>

          <Button
            onClick={handleDelete}
            disabled={actionLoading}
            variant="destructive"
            className="w-full gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Form Details */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Form Details</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Form ID</p>
            <p className="font-mono text-sm break-all">{form.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Slug</p>
            <p className="font-medium">{form.slug}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Organization ID</p>
            <p className="font-mono text-sm">{form.organization_id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
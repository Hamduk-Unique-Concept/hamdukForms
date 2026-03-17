'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FormDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/dashboard/forms" className="text-primary hover:underline">
          ← Back to Forms
        </Link>
        <h1 className="text-3xl font-bold mt-4">Form Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Form Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 font-medium">Total Views</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 font-medium">Responses</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 font-medium">Completion Rate</h3>
          <p className="text-3xl font-bold mt-2">0%</p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Form Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href={`/dashboard/forms/${params.id}/edit`}>
            <Button className="w-full" variant="outline">
              Edit Form
            </Button>
          </Link>
          <Link href={`/dashboard/forms/${params.id}/branding`}>
            <Button className="w-full" variant="outline">
              Branding
            </Button>
          </Link>
          <Link href={`/dashboard/forms/${params.id}/responses`}>
            <Button className="w-full" variant="outline">
              Responses
            </Button>
          </Link>
          <Link href={`/dashboard/forms/${params.id}/analytics`}>
            <Button className="w-full" variant="outline">
              Analytics
            </Button>
          </Link>
          <Link href={`/dashboard/forms/${params.id}/settings`}>
            <Button className="w-full" variant="outline">
              Settings
            </Button>
          </Link>
          <Button className="w-full" variant="outline">
            Share
          </Button>
          <Button className="w-full" variant="outline">
            Duplicate
          </Button>
          <Button className="w-full" variant="destructive">
            Delete
          </Button>
        </div>
      </div>

      {/* Form Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Form Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Form Name</p>
              <p className="font-medium">Sample Form</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Form Type</p>
              <p className="font-medium">Contact</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  Published
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fields</p>
              <p className="font-medium">0</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Form URL</p>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.hamduk.com'}/forms/${params.id}`}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
              />
              <Button variant="outline">Copy</Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Quick Share</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Copy Link
              </Button>
              <Button variant="outline" className="flex-1">
                QR Code
              </Button>
              <Button variant="outline" className="flex-1">
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

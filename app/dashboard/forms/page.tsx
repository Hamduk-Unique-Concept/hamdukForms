'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FormsPage() {
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

      {/* Forms Table/Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-6">Create your first form to get started collecting responses</p>
          <Link href="/dashboard/forms/create">
            <Button>Create Your First Form</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

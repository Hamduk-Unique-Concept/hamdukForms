'use client';

import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600 mt-2">Get insights from your form data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 font-medium">Total Views</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-2">No views yet</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 font-medium">Total Responses</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-gray-500 mt-2">No responses yet</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 font-medium">Completion Rate</h3>
          <p className="text-3xl font-bold mt-2">0%</p>
          <p className="text-sm text-gray-500 mt-2">No data</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No analytics data</h3>
        <p className="text-gray-600 mb-6">Analytics will appear here once you receive responses</p>
        <Button>Create Your First Form</Button>
      </div>
    </div>
  );
}

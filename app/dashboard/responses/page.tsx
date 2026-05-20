'use client';

import { Button } from '@/components/ui/button';
import FeatureGate from '@/components/billing/feature-gate';

function ResponsesPageContent() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Responses</h1>
        <p className="text-gray-600 mt-2">View all form responses and submissions</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-12 text-center">
          <div className="text-4xl mb-4">📬</div>
          <h3 className="text-xl font-semibold mb-2">No responses yet</h3>
          <p className="text-gray-600 mb-6">Responses from your forms will appear here</p>
          <Button>Create Your First Form</Button>
        </div>
      </div>
    </div>
  );
}

export default function ResponsesPage() {
  return (
    <FeatureGate featureKey="response_filtering" featureName="Advanced Response Management">
      <ResponsesPageContent />
    </FeatureGate>
  );
}

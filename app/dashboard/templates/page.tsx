'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import FeatureGate from '@/components/billing/feature-gate';

function TemplatesPageContent() {
  const templates = [
    {
      id: 'contact',
      name: 'Contact Form',
      description: 'Simple contact form with name, email, and message',
      icon: '📧',
      fields: 4,
    },
    {
      id: 'survey',
      name: 'Customer Survey',
      description: 'Gather customer feedback and satisfaction ratings',
      icon: '📋',
      fields: 6,
    },
    {
      id: 'registration',
      name: 'Event Registration',
      description: 'Register attendees for events with custom fields',
      icon: '✍️',
      fields: 7,
    },
    {
      id: 'application',
      name: 'Job Application',
      description: 'Collect job applications with resume uploads',
      icon: '📄',
      fields: 8,
    },
    {
      id: 'payment',
      name: 'Order Form',
      description: 'Collect orders with payment collection',
      icon: '💳',
      fields: 6,
    },
    {
      id: 'feedback',
      name: 'Product Feedback',
      description: 'Gather user feedback and suggestions',
      icon: '💬',
      fields: 5,
    },
    {
      id: 'quiz',
      name: 'Quiz',
      description: 'Create interactive quizzes with scoring',
      icon: '❓',
      fields: 10,
    },
    {
      id: 'appointment',
      name: 'Appointment Booking',
      description: 'Schedule appointments with date and time selection',
      icon: '📅',
      fields: 5,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Form Templates</h1>
        <p className="text-gray-600 mt-2">Choose from professionally designed templates to get started quickly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <p className="text-xs text-gray-500 mb-6">{template.fields} fields</p>
              <Link href={`/dashboard/forms/create?template=${template.id}`}>
                <Button className="w-full">Use Template</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Custom Template?</h3>
        <p className="text-gray-700 mb-4">
          Start from scratch with a blank form or create your own template to use across your team.
        </p>
        <Link href="/dashboard/forms/create">
          <Button>Create Blank Form</Button>
        </Link>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <FeatureGate featureKey="form_templates" featureName="Form Templates Library">
      <TemplatesPageContent />
    </FeatureGate>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Code2, Zap, Shield, FileJson, Settings } from 'lucide-react';

export default function DocumentationPage() {
  const docs = [
    {
      title: 'Getting Started',
      description: 'Learn how to create your first form and collect responses',
      icon: <BookOpen className="w-6 h-6" />,
      items: [
        { label: 'Create a Form', href: '#' },
        { label: 'Publish Your Form', href: '#' },
        { label: 'Share with Others', href: '#' },
      ],
    },
    {
      title: 'Form Building',
      description: 'Master form creation with fields, logic, and customization',
      icon: <Zap className="w-6 h-6" />,
      items: [
        { label: 'Available Field Types', href: '#' },
        { label: 'Conditional Logic', href: '#' },
        { label: 'Form Settings', href: '#' },
        { label: 'Themes & Branding', href: '#' },
      ],
    },
    {
      title: 'API Documentation',
      description: 'Integrate Hamduk Forms with your applications',
      icon: <Code2 className="w-6 h-6" />,
      items: [
        { label: 'API Reference', href: '/documentation/api' },
        { label: 'Authentication', href: '#' },
        { label: 'Webhooks', href: '#' },
        { label: 'Code Examples', href: '#' },
      ],
    },
    {
      title: 'Integrations',
      description: 'Connect with tools you already use',
      icon: <Settings className="w-6 h-6" />,
      items: [
        { label: 'Google Drive', href: '#' },
        { label: 'Notion', href: '#' },
        { label: 'Zapier', href: '#' },
        { label: 'All Integrations', href: '#' },
      ],
    },
    {
      title: 'Security',
      description: 'Understand how we protect your data',
      icon: <Shield className="w-6 h-6" />,
      items: [
        { label: 'Data Encryption', href: '#' },
        { label: 'Two-Factor Authentication', href: '#' },
        { label: 'GDPR Compliance', href: '#' },
        { label: 'Privacy Policy', href: '#' },
      ],
    },
    {
      title: 'Analytics',
      description: 'Track and analyze your form responses',
      icon: <FileJson className="w-6 h-6" />,
      items: [
        { label: 'Response Analytics', href: '#' },
        { label: 'Export Data', href: '#' },
        { label: 'Reports', href: '#' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Hamduk Forms. From getting started to advanced integrations.
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {docs.map((doc, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-blue-600 mb-4">{doc.icon}</div>
              <h2 className="text-xl font-bold mb-2">{doc.title}</h2>
              <p className="text-gray-600 text-sm mb-6">{doc.description}</p>
              <ul className="space-y-2">
                {doc.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a href={item.href} className="text-blue-600 hover:underline text-sm">
                      → {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">For Developers</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/documentation/api" className="text-blue-600 hover:underline">API Reference</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Webhooks Guide</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">SDK Libraries</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 hover:underline">FAQ</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Contact Support</a></li>
                <li><a href="#" className="text-blue-600 hover:underline">Community Forum</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help. Reach out anytime.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="default">Contact Support</Button>
            <Button variant="outline">View FAQ</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/stats-card';
import { useAuth } from '../providers';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-gray-600">Manage your forms, responses, and analytics in one place.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          label="Total Forms" 
          value="0"
          change="+0% from last month"
        />
        <StatsCard 
          label="Total Responses" 
          value="0"
          change="+0% from last month"
        />
        <StatsCard 
          label="Completion Rate" 
          value="0%"
          change="0% change"
        />
        <StatsCard 
          label="Workspace Members" 
          value="1"
          change="You"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Get Started</h2>
          <p className="text-gray-600 mb-6">Create your first form and start collecting responses.</p>
          <Link href="/dashboard/forms/create">
            <Button className="w-full">Create New Form</Button>
          </Link>
        </div>

        {/* Recent Forms */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Forms</h2>
            <Link href="/dashboard/forms">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600">No forms yet. Create one to get started!</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white">
                ✨
              </div>
            </div>
            <div>
              <h3 className="font-semibold">40+ Field Types</h3>
              <p className="text-sm text-gray-600">Build any form with our extensive field library</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white">
                🎨
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Full Customization</h3>
              <p className="text-sm text-gray-600">White-label your forms with custom branding</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white">
                📊
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Advanced Analytics</h3>
              <p className="text-sm text-gray-600">Get insights from your form responses</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white">
                💰
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Payment Collection</h3>
              <p className="text-sm text-gray-600">Accept Stripe and Paystack payments</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white">
                🤖
              </div>
            </div>
            <div>
              <h3 className="font-semibold">AI Integration</h3>
              <p className="text-sm text-gray-600">Leverage AI for insights and automation</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-white">
                🔗
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Integrations</h3>
              <p className="text-sm text-gray-600">Connect with 100+ apps via Zapier & Make</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

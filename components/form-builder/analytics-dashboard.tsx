'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart, TrendingUp, Users, Clock, Zap } from 'lucide-react';

interface AnalyticsDashboardProps {
  formId: string;
  formData?: any;
}

export default function AnalyticsDashboard({ formId, formData = {} }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState('7d');

  // Mock data - in real implementation, fetch from API
  const stats = {
    totalSubmissions: 1234,
    completionRate: 78.5,
    avgTimeToComplete: 3.5,
    dropoffRate: 21.5,
    submissionsOverTime: [
      { date: 'Mon', submissions: 120 },
      { date: 'Tue', submissions: 150 },
      { date: 'Wed', submissions: 98 },
      { date: 'Thu', submissions: 220 },
      { date: 'Fri', submissions: 280 },
      { date: 'Sat', submissions: 90 },
      { date: 'Sun', submissions: 95 },
    ],
    deviceBreakdown: [
      { name: 'Mobile', value: 52 },
      { name: 'Desktop', value: 38 },
      { name: 'Tablet', value: 10 },
    ],
    dropoffByField: [
      { field: 'Email', dropoff: 2.3 },
      { field: 'Phone', dropoff: 5.1 },
      { field: 'Address', dropoff: 8.7 },
      { field: 'Payment', dropoff: 15.3 },
    ],
    topSources: [
      { source: 'Direct', count: 340 },
      { source: 'Google', count: 280 },
      { source: 'Social', count: 210 },
      { source: 'Email', count: 180 },
      { source: 'Other', count: 244 },
    ],
  };

  const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {trend && <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
          </p>}
        </div>
        <Icon className="w-8 h-8 text-blue-500 opacity-20" />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Zap}
          label="Total Submissions"
          value={stats.totalSubmissions.toLocaleString()}
          trend={12.5}
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          trend={3.2}
        />
        <StatCard
          icon={Clock}
          label="Avg. Time (min)"
          value={stats.avgTimeToComplete.toFixed(1)}
          trend={-1.8}
        />
        <StatCard
          icon={Users}
          label="Dropoff Rate"
          value={`${stats.dropoffRate}%`}
          trend={-2.1}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dropoff">Dropoff</TabsTrigger>
          <TabsTrigger value="device">Device</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">Submissions Over Time</h3>
            <div className="flex items-end justify-between h-64 gap-2">
              {stats.submissionsOverTime.map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-blue-500 rounded-t" style={{
                    height: `${(point.submissions / 300) * 100}%`,
                  }}></div>
                  <span className="text-xs text-gray-600">{point.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-4">Completion Funnel</h3>
              <div className="space-y-3">
                {[
                  { step: 'Started', value: 1500, pct: 100 },
                  { step: 'Completed', value: 1234, pct: 82 },
                  { step: 'Submitted', value: 1200, pct: 80 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.step}</span>
                      <span className="text-gray-600">{item.value.toLocaleString()} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-4">Response Time Distribution</h3>
              <div className="space-y-2 text-sm">
                {[
                  { range: '< 1 min', count: 180, pct: 15 },
                  { range: '1-5 min', count: 650, pct: 53 },
                  { range: '5-10 min', count: 280, pct: 23 },
                  { range: '> 10 min', count: 124, pct: 10 },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.range}</span>
                    <span className="font-medium">{item.count} ({item.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dropoff" className="space-y-6 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">Field-Level Dropoff Rate</h3>
            <div className="space-y-4">
              {stats.dropoffByField.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.field}</span>
                    <span className="text-red-600 font-medium">{item.dropoff.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${item.dropoff}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4">💡 Tip: High dropoff on "Payment" field? Consider simplifying the checkout flow.</p>
          </div>
        </TabsContent>

        <TabsContent value="device" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-4">Device Breakdown</h3>
              <div className="space-y-3">
                {stats.deviceBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-4">Browser Distribution</h3>
              <div className="space-y-2 text-sm">
                {[
                  { browser: 'Chrome', pct: 58 },
                  { browser: 'Safari', pct: 22 },
                  { browser: 'Firefox', pct: 12 },
                  { browser: 'Other', pct: 8 },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.browser}</span>
                    <span className="font-medium">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">Traffic Sources</h3>
            <div className="space-y-4">
              {stats.topSources.map((item, i) => {
                const maxCount = Math.max(...stats.topSources.map(s => s.count));
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.source}</span>
                      <span>{item.count} ({((item.count / stats.totalSubmissions) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-6 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">Latest Responses</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Submitted At</th>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Time Spent</th>
                    <th className="text-left py-2 px-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">2 mins ago</td>
                      <td className="py-2 px-2">John Doe</td>
                      <td className="py-2 px-2">john@example.com</td>
                      <td className="py-2 px-2">3m 45s</td>
                      <td className="py-2 px-2"><span className="text-blue-600">Google</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded font-medium text-sm">
              View All Responses →
            </button>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">Export & Reports</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left font-medium">
                📊 Export as CSV
              </button>
              <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left font-medium">
                📄 Export as Excel
              </button>
              <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left font-medium">
                📑 Export as PDF Report
              </button>
              <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left font-medium">
                🔗 Get Shareable Link
              </button>
              <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left font-medium">
                📧 Schedule Email Report
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

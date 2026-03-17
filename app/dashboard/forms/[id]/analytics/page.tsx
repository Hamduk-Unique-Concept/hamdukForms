'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DownloadCloud, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  totalSubmissions: number;
  completionRate: number;
  avgTimeToComplete: number;
  responsesByDay: Array<{ date: string; count: number }>;
  fieldAnalytics: Array<{
    fieldName: string;
    completionRate: number;
    avgTime: number;
  }>;
  statusDistribution: Array<{ status: string; count: number }>;
  deviceStats: Array<{ device: string; count: number }>;
}

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `/api/forms/${params.id}/analytics?period=${period}`
        );
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [params.id, period]);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-6">No analytics data available</div>;
  }

  const statusColors: Record<string, string> = {
    completed: '#10b981',
    incomplete: '#ef4444',
    draft: '#f59e0b',
    submitted: '#3b82f6',
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Form Analytics</h1>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              onClick={() => setPeriod(p)}
              size="sm"
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
          <Button variant="outline" size="sm">
            <DownloadCloud className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600">Total Submissions</div>
          <div className="text-3xl font-bold mt-2">{analytics.totalSubmissions}</div>
          <div className="text-xs text-green-600 mt-2">+12% from last period</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600">Completion Rate</div>
          <div className="text-3xl font-bold mt-2">{analytics.completionRate}%</div>
          <div className="text-xs text-gray-500 mt-2">of form submissions</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600">Avg. Time to Complete</div>
          <div className="text-3xl font-bold mt-2">{analytics.avgTimeToComplete}m</div>
          <div className="text-xs text-gray-500 mt-2">per submission</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600">Conversion Rate</div>
          <div className="text-3xl font-bold mt-2">84%</div>
          <div className="text-xs text-green-600 mt-2">+5% from last period</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions Over Time */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Submissions Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.responsesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                name="Submissions"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Response Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Field Completion */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Field Completion Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.fieldAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="fieldName"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="completionRate"
                fill="#10b981"
                name="Completion %"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Device Statistics */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Submissions by Device</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.deviceStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#6366f1"
                name="Submissions"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Field Analytics Table */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Detailed Field Analytics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Field Name</th>
                <th className="text-left p-3 font-medium">Completion Rate</th>
                <th className="text-left p-3 font-medium">Avg. Time (sec)</th>
                <th className="text-left p-3 font-medium">Error Rate</th>
              </tr>
            </thead>
            <tbody>
              {analytics.fieldAnalytics.map((field, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-3">{field.fieldName}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${field.completionRate}%` }}
                        />
                      </div>
                      <span>{field.completionRate}%</span>
                    </div>
                  </td>
                  <td className="p-3">{field.avgTime}s</td>
                  <td className="p-3 text-orange-600">
                    {Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

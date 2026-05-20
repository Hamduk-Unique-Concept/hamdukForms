'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Eye } from 'lucide-react';
import FeatureGate from '@/components/billing/feature-gate';

interface Report {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'responses' | 'custom';
  createdAt: string;
  status: 'ready' | 'generating';
}

function ReportsPageContent({ params }: { params: { id: string } }) {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Summary - March 2026',
      type: 'summary',
      createdAt: '2026-03-15',
      status: 'ready',
    },
    {
      id: '2',
      name: 'Detailed Response Analysis',
      type: 'detailed',
      createdAt: '2026-03-10',
      status: 'ready',
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'responses'>('summary');
  const [generating, setGenerating] = useState(false);

  const handleCreateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        `/api/forms/${params.id}/reports`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: reportType }),
        }
      );

      if (response.ok) {
        const report = await response.json();
        setReports([report, ...reports]);
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Failed to create report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const response = await fetch(
        `/api/forms/${params.id}/reports/${reportId}/download`
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Create New Report
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold mb-4">Create New Report</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="summary">Monthly Summary</option>
                <option value="detailed">Detailed Analysis</option>
                <option value="responses">All Responses Export</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateReport}
                disabled={generating}
                className="flex-1"
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {reports.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No reports yet. Create one to get started.
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{report.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.type === 'summary' && 'Summary Report'}
                    {report.type === 'detailed' && 'Detailed Analysis'}
                    {report.type === 'responses' && 'Response Export'}
                    {' •'} Created {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-px-2 py-1 rounded text-xs font-medium ${
                        report.status === 'ready'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {report.status === 'ready' ? 'Ready' : 'Generating...'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      /* Open preview */
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" /> Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(report.id)}
                  >
                    <Download className="w-4 h-4 mr-1" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      /* Send email */
                    }}
                  >
                    <Mail className="w-4 h-4 mr-1" /> Email
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h3 className="font-semibold mb-3">Scheduled Reports</h3>
        <p className="text-sm text-gray-600 mb-4">
          Set up automatic report generation and delivery to your email.
        </p>
        <Button variant="outline">Configure Schedule</Button>
      </Card>
    </div>
  );
}

export default function ReportsPage({ params }: { params: { id: string } }) {
  return (
    <FeatureGate featureKey="form_reports" featureName="Form Reports">
      <ReportsPageContent params={params} />
    </FeatureGate>
  );
}

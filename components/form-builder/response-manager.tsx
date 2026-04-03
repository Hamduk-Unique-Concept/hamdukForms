'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, Trash2, Archive, Tag, MessageSquare, Eye, Edit3 } from 'lucide-react';

interface ResponseManagerProps {
  formId: string;
  responses?: any[];
}

export default function ResponseManager({ formId, responses = [] }: ResponseManagerProps) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponses, setSelectedResponses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date');

  const mockResponses = [
    {
      id: '1',
      submittedAt: '2024-04-03 10:15 AM',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'new',
      score: null,
      comments: 2,
      tags: ['important'],
    },
    {
      id: '2',
      submittedAt: '2024-04-03 09:45 AM',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'reviewed',
      score: 85,
      comments: 0,
      tags: ['qualified'],
    },
    {
      id: '3',
      submittedAt: '2024-04-02 03:20 PM',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      status: 'approved',
      score: 92,
      comments: 1,
      tags: ['approved', 'vip'],
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  const toggleSelectResponse = (id: string) => {
    setSelectedResponses(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedResponses(
      selectedResponses.length === mockResponses.length ? [] : mockResponses.map(r => r.id)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">Responses ({mockResponses.length})</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="collaboration">Team</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          {/* Filters & Actions */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-64 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by name, email, or field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 px-0"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="date">Newest First</option>
              <option value="name">Name A-Z</option>
              <option value="status">Status</option>
            </select>

            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedResponses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm font-medium">{selectedResponses.length} selected</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Tag className="w-4 h-4" />
                  Tag
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Archive className="w-4 h-4" />
                  Archive
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Responses Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedResponses.length === mockResponses.length && mockResponses.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="p-3 text-left font-medium">Submitted</th>
                  <th className="p-3 text-left font-medium">Respondent</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Score</th>
                  <th className="p-3 text-left font-medium">Comments</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockResponses.map(response => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedResponses.includes(response.id)}
                        onChange={() => toggleSelectResponse(response.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3 text-gray-600">{response.submittedAt}</td>
                    <td className="p-3">
                      <div className="font-medium">{response.name}</div>
                      <div className="text-gray-600">{response.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(response.status)}`}>
                        {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      {response.score !== null ? (
                        <span className="font-medium">{response.score}%</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                        <MessageSquare className="w-4 h-4" />
                        {response.comments}
                      </button>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button className="p-1 hover:bg-gray-200 rounded" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Showing 3 of {mockResponses.length} responses</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['New', 'Reviewed', 'Approved', 'Rejected'].map((status, i) => (
              <div key={status} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  {status}
                  <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                    {i === 0 ? 1 : i === 1 ? 1 : i === 2 ? 1 : 0}
                  </span>
                </h3>
                <div className="space-y-2">
                  {i === 0 && <div className="bg-white rounded-lg p-3 border border-blue-300 cursor-move">
                    <p className="font-medium text-sm">John Doe</p>
                    <p className="text-xs text-gray-600">john@example.com</p>
                  </div>}
                  {i === 1 && <div className="bg-white rounded-lg p-3 border border-yellow-300 cursor-move">
                    <p className="font-medium text-sm">Jane Smith</p>
                    <p className="text-xs text-gray-600">jane@example.com</p>
                  </div>}
                  {i === 2 && <div className="bg-white rounded-lg p-3 border border-green-300 cursor-move">
                    <p className="font-medium text-sm">Bob Wilson</p>
                    <p className="text-xs text-gray-600">bob@example.com</p>
                  </div>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">💡 Drag responses between columns to change status</p>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Team Members & Permissions</h3>
            <div className="space-y-3">
              {[
                { name: 'You', email: 'your@email.com', role: 'Owner' },
                { name: 'Sarah', email: 'sarah@company.com', role: 'Editor' },
                { name: 'Mike', email: 'mike@company.com', role: 'Reviewer' },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-gray-600">{member.email}</p>
                  </div>
                  <select defaultValue={member.role} className="text-sm px-2 py-1 border border-gray-300 rounded">
                    <option>Viewer</option>
                    <option>Reviewer</option>
                    <option>Editor</option>
                    <option>Admin</option>
                  </select>
                </div>
              ))}
            </div>
            <Button className="mt-4 w-full gap-2">
              + Invite Team Member
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Activity Log</h3>
            <div className="space-y-2 text-sm">
              {[
                { user: 'You', action: 'Added comment on Response #1', time: '5 mins ago' },
                { user: 'Sarah', action: 'Changed status to "Approved"', time: '2 hours ago' },
                { user: 'Mike', action: 'Viewed Response #2', time: '4 hours ago' },
              ].map((log, i) => (
                <div key={i} className="flex justify-between py-2 border-b text-gray-600">
                  <div>
                    <span className="font-medium">{log.user}</span>
                    <span> {log.action}</span>
                  </div>
                  <span className="text-xs text-gray-500">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6 mt-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
            <h3 className="font-semibold mb-3">🤖 AI-Powered Insights</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm font-medium">📊 Response Summary</p>
                <p className="text-xs text-gray-600 mt-1">
                  {mockResponses.length} responses received. Most respondents are from {Math.random() > 0.5 ? 'desktop' : 'mobile'} devices.
                  Completion rate is {Math.floor(Math.random() * 40 + 60)}%. Consider simplifying the phone number field to reduce dropoff.
                </p>
              </div>

              <div className="bg-white rounded-lg p-3">
                <p className="text-sm font-medium">🎯 Key Themes</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Performance', 'Pricing', 'Support', 'Features'].map((theme, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3">
                <p className="text-sm font-medium">😊 Sentiment Analysis</p>
                <div className="flex gap-2 mt-2">
                  {[
                    { label: 'Positive', pct: 65 },
                    { label: 'Neutral', pct: 25 },
                    { label: 'Negative', pct: 10 },
                  ].map((item, i) => (
                    <div key={i} className="flex-1">
                      <p className="text-xs mb-1">{item.label}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{item.pct}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2">
                ✨ Get Detailed AI Report
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

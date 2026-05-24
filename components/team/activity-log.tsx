'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  FileText, Users, Edit2, Trash2, Share2, 
  Lock, Settings, Download, Clock, User 
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'share' | 'access' | 'export';
  user: string;
  action: string;
  target: string;
  timestamp: string;
  details?: Record<string, any>;
}

interface ActivityLogProps {
  formId?: string;
  organizationId?: string;
  limit?: number;
}

const ACTIVITY_ICONS: Record<string, any> = {
  create: FileText,
  update: Edit2,
  delete: Trash2,
  share: Share2,
  access: Users,
  export: Download,
};

const ACTIVITY_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  share: 'bg-purple-100 text-purple-700',
  access: 'bg-yellow-100 text-yellow-700',
  export: 'bg-indigo-100 text-indigo-700',
};

export default function ActivityLog({
  formId,
  organizationId,
  limit = 50,
}: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const params = new URLSearchParams();
        if (formId) params.append('formId', formId);
        if (organizationId) params.append('organizationId', organizationId);
        params.append('limit', limit.toString());
        if (filter) params.append('type', filter);

        const response = await fetch(`/api/activity-log?${params}`);
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [formId, organizationId, limit, filter]);

  const getActivityIcon = (type: string) => {
    const Icon = ACTIVITY_ICONS[type] || Clock;
    return Icon;
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading activity log...</div>;
  }

  const filteredActivities = filter
    ? activities.filter((a) => a.type === filter)
    : activities;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Activity Log</h2>
        <select
          value={filter || ''}
          onChange={(e) => setFilter(e.target.value || null)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Activities</option>
          <option value="create">Created</option>
          <option value="update">Updated</option>
          <option value="delete">Deleted</option>
          <option value="share">Shared</option>
          <option value="access">Accessed</option>
          <option value="export">Exported</option>
        </select>
      </div>

      {filteredActivities.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          {filter ? 'No activities of this type' : 'No activity yet'}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);

            return (
              <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${ACTIVITY_COLORS[activity.type]}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {activity.target}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleDateString()}{' '}
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{activity.user}</span>
                    </div>

                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

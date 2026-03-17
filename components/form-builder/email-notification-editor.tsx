'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

interface EmailNotification {
  id: string;
  type: 'admin' | 'respondent' | 'custom';
  recipient: string;
  subject: string;
  templateType: 'default' | 'custom';
  customTemplate?: string;
  triggerOn: 'submission' | 'approval' | 'payment_received';
  enabled: boolean;
}

interface EmailNotificationEditorProps {
  notifications: EmailNotification[];
  onChange: (notifications: EmailNotification[]) => void;
}

export default function EmailNotificationEditor({
  notifications,
  onChange,
}: EmailNotificationEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNotif, setNewNotif] = useState<Partial<EmailNotification>>({});

  const addNotification = () => {
    const notification: EmailNotification = {
      id: `notif-${Date.now()}`,
      type: 'admin',
      recipient: '',
      subject: 'New Form Submission',
      templateType: 'default',
      triggerOn: 'submission',
      enabled: true,
    };
    onChange([...notifications, notification]);
    setNewNotif({});
  };

  const updateNotification = (id: string, updates: Partial<EmailNotification>) => {
    onChange(
      notifications.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const removeNotification = (id: string) => {
    onChange(notifications.filter((n) => n.id !== id));
  };

  return (
    <div>
      <h3 className="font-semibold mb-4 text-sm">Email Notifications</h3>
      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card key={notif.id} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={notif.enabled}
                      onChange={(e) =>
                        updateNotification(notif.id, { enabled: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Enabled
                  </label>
                </div>
                <select
                  value={notif.type}
                  onChange={(e) =>
                    updateNotification(notif.id, { type: e.target.value as any })
                  }
                  className="w-full text-xs px-2 py-1 border rounded"
                >
                  <option value="admin">Admin Notification</option>
                  <option value="respondent">Respondent Confirmation</option>
                  <option value="custom">Custom</option>
                </select>
                <Input
                  placeholder="Recipient email"
                  value={notif.recipient}
                  onChange={(e) =>
                    updateNotification(notif.id, { recipient: e.target.value })
                  }
                  size="sm"
                  className="text-xs"
                />
                <Input
                  placeholder="Email subject"
                  value={notif.subject}
                  onChange={(e) =>
                    updateNotification(notif.id, { subject: e.target.value })
                  }
                  size="sm"
                  className="text-xs"
                />
                <select
                  value={notif.triggerOn}
                  onChange={(e) =>
                    updateNotification(notif.id, { triggerOn: e.target.value as any })
                  }
                  className="w-full text-xs px-2 py-1 border rounded"
                >
                  <option value="submission">On Submission</option>
                  <option value="approval">On Approval</option>
                  <option value="payment_received">On Payment Received</option>
                </select>
              </div>
              <button
                onClick={() => removeNotification(notif.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </Card>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addNotification}
          className="w-full"
        >
          <Plus size={16} className="mr-1" /> Add Email Notification
        </Button>
      </div>
    </div>
  );
}

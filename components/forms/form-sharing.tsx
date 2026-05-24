'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Copy, Link2, Lock, Globe, Users } from 'lucide-react';

interface ShareSettings {
  isPublic: boolean;
  allowPublicResponses: boolean;
  shareableLink: string;
  permissions: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
}

interface FormSharingProps {
  formId: string;
  settings?: ShareSettings;
  onSettingsChange?: (settings: ShareSettings) => void;
}

export default function FormSharing({
  formId,
  settings,
  onSettingsChange,
}: FormSharingProps) {
  const [shareSettings, setShareSettings] = useState<ShareSettings>(
    settings || {
      isPublic: false,
      allowPublicResponses: false,
      shareableLink: `${window.location.origin}/forms/${formId}`,
      permissions: {
        canView: [],
        canEdit: [],
        canDelete: [],
      },
    }
  );

  const [copied, setCopied] = useState(false);
  const [permissionEmail, setPermissionEmail] = useState('');
  const [permissionType, setPermissionType] = useState<'view' | 'edit' | 'delete'>('view');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareSettings.shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublicToggle = () => {
    const updated = {
      ...shareSettings,
      isPublic: !shareSettings.isPublic,
    };
    setShareSettings(updated);
    onSettingsChange?.(updated);
  };

  const handleAddPermission = () => {
    if (!permissionEmail.trim()) return;

    const updated = { ...shareSettings };
    if (permissionType === 'view' && !updated.permissions.canView.includes(permissionEmail)) {
      updated.permissions.canView.push(permissionEmail);
    } else if (permissionType === 'edit' && !updated.permissions.canEdit.includes(permissionEmail)) {
      updated.permissions.canEdit.push(permissionEmail);
    } else if (permissionType === 'delete' && !updated.permissions.canDelete.includes(permissionEmail)) {
      updated.permissions.canDelete.push(permissionEmail);
    }

    setShareSettings(updated);
    onSettingsChange?.(updated);
    setPermissionEmail('');
  };

  const handleRemovePermission = (email: string, type: 'view' | 'edit' | 'delete') => {
    const updated = { ...shareSettings };
    updated.permissions[type === 'view' ? 'canView' : type === 'edit' ? 'canEdit' : 'canDelete'] =
      updated.permissions[type === 'view' ? 'canView' : type === 'edit' ? 'canEdit' : 'canDelete'].filter(
        (e) => e !== email
      );
    setShareSettings(updated);
    onSettingsChange?.(updated);
  };

  return (
    <div className="space-y-6">
      {/* Public Sharing */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Public Sharing
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Allow anyone with the link to access this form
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shareSettings.isPublic}
              onChange={handlePublicToggle}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">
              {shareSettings.isPublic ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {shareSettings.isPublic && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Shareable Link</label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={shareSettings.shareableLink}
                  readOnly
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="min-w-fit"
                >
                  {copied ? 'Copied!' : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shareSettings.allowPublicResponses}
                onChange={(e) => {
                  const updated = {
                    ...shareSettings,
                    allowPublicResponses: e.target.checked,
                  };
                  setShareSettings(updated);
                  onSettingsChange?.(updated);
                }}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Allow public responses</span>
            </label>
          </div>
        )}
      </Card>

      {/* Granular Permissions */}
      <Card className="p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5" />
          Granular Permissions
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Grant Access</label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={permissionEmail}
                onChange={(e) => setPermissionEmail(e.target.value)}
                placeholder="user@example.com"
              />
              <select
                value={permissionType}
                onChange={(e) => setPermissionType(e.target.value as any)}
                className="px-3 py-2 border rounded-lg text-sm min-w-fit"
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
              </select>
              <Button onClick={handleAddPermission}>
                <Users className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Permission Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['canView', 'canEdit', 'canDelete'] as const).map((permission) => {
            const type =
              permission === 'canView' ? 'view' : permission === 'canEdit' ? 'edit' : 'delete';
            const emails = shareSettings.permissions[permission];

            return (
              <div key={permission} className="space-y-2">
                <h4 className="text-sm font-medium capitalize">
                  {type === 'view' ? 'Viewers' : type === 'edit' ? 'Editors' : 'Deleters'}
                </h4>
                <div className="space-y-2">
                  {emails.length === 0 ? (
                    <p className="text-xs text-gray-500">No one yet</p>
                  ) : (
                    emails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs"
                      >
                        <span>{email}</span>
                        <button
                          onClick={() => handleRemovePermission(email, type)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Restriction */}
      <Card className="p-6 border-2 border-red-200 bg-red-50">
        <h3 className="font-semibold flex items-center gap-2 mb-2 text-red-700">
          <Lock className="w-5 h-5" />
          Privacy
        </h3>
        <p className="text-sm text-red-600">
          Forms with sensitive data should not be shared publicly. Use role-based permissions
          for internal team access.
        </p>
      </Card>
    </div>
  );
}

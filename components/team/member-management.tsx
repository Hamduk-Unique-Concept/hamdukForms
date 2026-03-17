'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, X, Edit2, Check, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

interface MemberManagementProps {
  members: TeamMember[];
  onMemberAdded?: (member: TeamMember) => void;
  onMemberRemoved?: (memberId: string) => void;
  onRoleChanged?: (memberId: string, role: string) => void;
}

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full access and team management' },
  { value: 'editor', label: 'Editor', description: 'Can create and edit forms' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

export default function MemberManagement({
  members,
  onMemberAdded,
  onMemberRemoved,
  onRoleChanged,
}: MemberManagementProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (response.ok) {
        const member = await response.json();
        onMemberAdded?.(member);
        setInviteEmail('');
        setShowInvite(false);
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onMemberRemoved?.(memberId);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const handleSaveRole = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editingRole }),
      });

      if (response.ok) {
        onRoleChanged?.(memberId, editingRole);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'editor':
        return 'bg-blue-100 text-blue-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {showInvite && (
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold mb-4">Invite Team Member</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                {ROLES.find((r) => r.value === inviteRole)?.description}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleInviteMember}
                disabled={loading || !inviteEmail.trim()}
              >
                Send Invite
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowInvite(false);
                  setInviteEmail('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team Members ({members.length})</h3>
        {!showInvite && (
          <Button onClick={() => setShowInvite(true)}>
            <Plus className="w-4 h-4 mr-1" /> Invite Member
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {members.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No team members yet. Invite someone to get started.
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{member.name || member.email}</h4>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(
                        member.status
                      )}`}
                    >
                      {member.status}
                    </span>
                    {editingId === member.id ? (
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="text-xs px-2 py-1 border rounded"
                      >
                        {ROLES.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${getRoleColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {editingId === member.id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveRole(member.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(member.id);
                        setEditingRole(member.role);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

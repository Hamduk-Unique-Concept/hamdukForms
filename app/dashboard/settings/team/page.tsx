'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemberManagement from '@/components/team/member-management';
import ActivityLog from '@/components/team/activity-log';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, LogOut, Shield } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch('/api/team/members');
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members || []);
          setCurrentUser(data.currentUser);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading team data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Team & Collaboration</h1>
        <p className="text-gray-600">
          Manage team members, permissions, and collaboration settings
        </p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">
            <Users className="w-4 h-4 mr-2" /> Members
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="w-4 h-4 mr-2" /> Permissions
          </TabsTrigger>
          <TabsTrigger value="activity">
            <LogOut className="w-4 h-4 mr-2" /> Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-600">Total Members</div>
                <div className="text-3xl font-bold">{members.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Admins</div>
                <div className="text-3xl font-bold">
                  {members.filter((m) => m.role === 'admin').length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Pending Invites</div>
                <div className="text-3xl font-bold">
                  {members.filter((m) => m.status === 'pending').length}
                </div>
              </div>
            </div>
          </Card>

          <MemberManagement
            members={members}
            onMemberAdded={(member) => setMembers([...members, member])}
            onMemberRemoved={(memberId) =>
              setMembers(members.filter((m) => m.id !== memberId))
            }
            onRoleChanged={(memberId, role) => {
              setMembers(
                members.map((m) =>
                  m.id === memberId ? { ...m, role: role as any } : m
                )
              );
            }}
          />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Permission Levels</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Admin</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Full access to all forms</li>
                  <li>✓ Manage team members</li>
                  <li>✓ Access billing and settings</li>
                  <li>✓ Create and delete forms</li>
                  <li>✓ Manage integrations</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Editor</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Create and edit forms</li>
                  <li>✓ View form responses</li>
                  <li>✓ Manage collaborators on own forms</li>
                  <li>✗ Cannot delete forms</li>
                  <li>✗ Cannot access billing</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Viewer</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ View forms and responses</li>
                  <li>✓ Export data</li>
                  <li>✓ Access analytics</li>
                  <li>✗ Cannot edit forms</li>
                  <li>✗ Cannot manage team</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold mb-2">Custom Permissions</h3>
            <p className="text-sm text-gray-700 mb-4">
              For enterprise teams needing granular permission control, custom roles are available
              on the Enterprise plan.
            </p>
            <Button variant="outline">Learn More</Button>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityLog organizationId={currentUser?.id} limit={100} />
        </TabsContent>
      </Tabs>

      {currentUser && (
        <Card className="p-6 bg-gray-50">
          <h3 className="font-semibold mb-2">Your Account</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Email:</span> {currentUser.email}
            </p>
            <p>
              <span className="font-medium">Role:</span> {currentUser.role}
            </p>
            <p>
              <span className="font-medium">Joined:</span>{' '}
              {new Date(currentUser.joinedAt).toLocaleDateString()}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

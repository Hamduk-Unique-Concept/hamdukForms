'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/app/providers';
import { Loader2 } from 'lucide-react';

export default function TeamPage() {
  const { user, session } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendInvite = async () => {
    if (!email.trim()) {
      setMessage('Please enter an email address');
      return;
    }

    if (!session?.access_token) {
      setMessage('You must be logged in to send invites');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      console.log('[v0] Sending invite to:', email);
      console.log('[v0] Token exists:', !!session.access_token);
      
      const organizationId = localStorage.getItem('organizationId') || '';
      
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email,
          role,
          organizationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.message || 'Failed to send invite'}`);
        return;
      }

      setMessage(`Invitation sent to ${email}`);
      setEmail('');
      setRole('member');
    } catch (error: any) {
      console.error('[v0] Invite error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <p className="text-gray-600 mt-2">Invite and manage team members</p>
      </div>

      {/* Invite Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Invite Team Members</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <Button 
              onClick={handleSendInvite}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invite'
              )}
            </Button>
          </div>
          {message && (
            <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Team Members</h2>
        </div>
        <div className="divide-y">
          <div className="p-6 flex justify-between items-center">
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-gray-600">Owner</p>
            </div>
            <span className="text-sm text-gray-500">You</span>
          </div>
        </div>
      </div>
    </div>
  );
}

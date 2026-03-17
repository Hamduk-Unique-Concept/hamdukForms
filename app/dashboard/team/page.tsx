'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/app/providers';

export default function TeamPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <p className="text-gray-600 mt-2">Invite and manage team members</p>
      </div>

      {/* Invite Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Invite Team Members</h2>
        <div className="flex gap-4">
          <Input
            type="email"
            placeholder="Enter email address"
            className="flex-1"
          />
          <Button>Send Invite</Button>
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

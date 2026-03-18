'use client';

import { useState } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertCircle, Trash2 } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deleteEmail, setDeleteEmail] = useState('');

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to change password');
      alert('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmail !== user?.email) {
      alert('Please enter your email correctly');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete account');
      window.location.href = '/auth/login';
    } catch (error) {
      alert('Error deleting account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account security and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>

        {/* Email Verification Section */}
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6">Email Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
              />
            </div>
            <p className="text-xs text-gray-600">
              Your email is verified and cannot be changed here. Contact support if you need to update it.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-2xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-red-900 mb-2">Danger Zone</h2>
              <p className="text-sm text-red-800 mb-6">
                These actions cannot be undone. Please proceed with caution.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and all associated data.
                  </AlertDialogDescription>
                  <div className="my-4 space-y-2">
                    <label className="text-sm font-medium">
                      Type your email to confirm: <span className="text-red-600">{user?.email}</span>
                    </label>
                    <Input
                      type="email"
                      value={deleteEmail}
                      onChange={(e) => setDeleteEmail(e.target.value)}
                      placeholder="Confirm your email"
                    />
                  </div>
                  <div className="flex gap-3">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteEmail !== user?.email || loading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {loading ? 'Deleting...' : 'Delete Account'}
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

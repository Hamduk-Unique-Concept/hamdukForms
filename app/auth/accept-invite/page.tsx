'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your invitation...');
  const [organizationName, setOrganizationName] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing invitation token');
      return;
    }

    acceptInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    try {
      const response = await fetch('/api/team/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.message || 'Failed to accept invitation');
        return;
      }

      setOrganizationName(data.organizationName);
      setStatus('success');
      setMessage('Invitation accepted! Redirecting to dashboard...');

      setTimeout(() => {
        router.push(`/dashboard`);
      }, 2000);
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while processing your invitation');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Accepting Invitation</h2>
              <p className="text-gray-600 mt-2">{message}</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invitation Accepted!</h2>
              <p className="text-gray-600 mt-2">
                You've successfully joined {organizationName}
              </p>
              <p className="text-sm text-gray-500 mt-3">{message}</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Error</h2>
              <p className="text-gray-600 mt-2">{message}</p>
            </div>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Go to Login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Processing Invitation...</h2>
        </div>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center">
          <AlertTriangle className="w-16 h-16 text-red-600" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        {error.digest && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded break-all">
            Error ID: {error.digest}
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

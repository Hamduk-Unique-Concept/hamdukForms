'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/app/providers';
import { CheckCircle, Loader2, QrCode, Search, XCircle } from 'lucide-react';

interface CheckInPageProps {
  params: Promise<{ form_id: string }>;
}

interface TicketRow {
  id: string;
  ticket_number: string;
  checked_in: boolean;
}

interface ScanResult {
  status: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  attendeeName?: string;
  ticketType?: string;
}

const QUEUE_KEY = 'hamduk_offline_checkins';

function extractTicketNumber(rawValue: string) {
  try {
    const parsedUrl = new URL(rawValue);
    const parts = parsedUrl.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || rawValue;
  } catch {
    const parts = rawValue.split('/').filter(Boolean);
    return parts[parts.length - 1] || rawValue;
  }
}

function getQueuedTickets(formId: string) {
  if (typeof window === 'undefined') return [];
  const allQueues = JSON.parse(localStorage.getItem(QUEUE_KEY) || '{}');
  return Array.isArray(allQueues[formId]) ? allQueues[formId] : [];
}

function setQueuedTickets(formId: string, tickets: string[]) {
  const allQueues = JSON.parse(localStorage.getItem(QUEUE_KEY) || '{}');
  allQueues[formId] = tickets;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(allQueues));
}

export default function CheckInPage({ params }: CheckInPageProps) {
  const { session } = useAuth();
  const [formId, setFormId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [manualTicket, setManualTicket] = useState('');
  const [loading, setLoading] = useState(true);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);
  const scannerRef = useRef<any>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    params.then((resolved) => setFormId(resolved.form_id));
  }, [params]);

  const fetchTickets = useCallback(async () => {
    if (!formId || !session?.access_token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets?formId=${formId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load tickets');
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      setQueuedCount(getQueuedTickets(formId).length);
    } catch (error) {
      console.error('Load check-in tickets error:', error);
      setScanResult({
        status: 'error',
        title: 'Could not load tickets',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [formId, session?.access_token]);

  const checkInTicket = useCallback(async (ticketNumber: string, fromQueue = false) => {
    if (!formId || !session?.access_token || busyRef.current) return;

    const normalizedTicket = extractTicketNumber(ticketNumber.trim());
    if (!normalizedTicket) return;

    if (!navigator.onLine && !fromQueue) {
      const queuedTickets = Array.from(new Set([...getQueuedTickets(formId), normalizedTicket]));
      setQueuedTickets(formId, queuedTickets);
      setQueuedCount(queuedTickets.length);
      setScanResult({
        status: 'warning',
        title: 'Queued offline',
        message: 'This check-in will sync when the connection returns.',
      });
      return;
    }

    busyRef.current = true;
    setProcessing(true);
    try {
      const validateResponse = await fetch(`/api/tickets/validate/${encodeURIComponent(normalizedTicket)}`);
      const validation = await validateResponse.json();

      if (!validateResponse.ok || !validation.valid) {
        throw new Error(validation.message || 'Invalid ticket');
      }

      if (validation.checked_in) {
        setScanResult({
          status: 'warning',
          title: 'Already checked in',
          message: validation.checked_in_at
            ? `Checked in at ${new Date(validation.checked_in_at).toLocaleString()}`
            : 'This ticket has already been used.',
          attendeeName: validation.attendee_name,
          ticketType: validation.ticket_type,
        });
        return;
      }

      const response = await fetch(`/api/tickets/checkin/${encodeURIComponent(normalizedTicket)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to check in ticket');

      setScanResult({
        status: 'success',
        title: 'Checked in',
        message: data.ticket?.ticket_number || normalizedTicket,
        attendeeName: data.ticket?.attendee_name || validation.attendee_name,
        ticketType: data.ticket?.ticket_type || validation.ticket_type,
      });
      await fetchTickets();
    } catch (error) {
      setScanResult({
        status: 'error',
        title: 'Check-in failed',
        message: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setProcessing(false);
      setTimeout(() => {
        busyRef.current = false;
      }, 1200);
    }
  }, [fetchTickets, formId, session?.access_token]);

  const syncQueue = useCallback(async () => {
    if (!formId || !navigator.onLine) return;
    const queuedTickets = getQueuedTickets(formId);
    if (queuedTickets.length === 0) return;

    for (const ticketNumber of queuedTickets) {
      await checkInTicket(ticketNumber, true);
    }
    setQueuedTickets(formId, []);
    setQueuedCount(0);
  }, [checkInTicket, formId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    window.addEventListener('online', syncQueue);
    return () => window.removeEventListener('online', syncQueue);
  }, [syncQueue]);

  const startScanner = async () => {
    setScannerError(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => null);
      }

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          checkInTicket(decodedText);
        },
        () => undefined
      );
      setScannerReady(true);
    } catch (error) {
      console.error('Scanner start error:', error);
      setScannerError('Camera scanner could not start. Use manual lookup or check browser camera permission.');
      setScannerReady(false);
    }
  };

  const stopScanner = async () => {
    await scannerRef.current?.stop?.().catch(() => null);
    scannerRef.current = null;
    setScannerReady(false);
  };

  useEffect(() => {
    return () => {
      scannerRef.current?.stop?.().catch(() => null);
    };
  }, []);

  const checkedInCount = tickets.filter((ticket) => ticket.checked_in).length;

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Check-In Login</h1>
          <p className="text-gray-600 mb-4">Sign in to scan and validate tickets.</p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <p className="text-sm text-gray-500">Event Check-In</p>
          <h1 className="text-3xl font-bold">Ticket Scanner</h1>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold">{tickets.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Checked In</p>
            <p className="text-2xl font-bold">{checkedInCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-2xl font-bold">{tickets.length - checkedInCount}</p>
          </div>
        </div>

        {queuedCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            {queuedCount} offline check-in{queuedCount === 1 ? '' : 's'} queued.
            <button onClick={syncQueue} className="ml-2 font-semibold underline">
              Sync now
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Camera Scanner
            </h2>
            <Button variant="outline" onClick={scannerReady ? stopScanner : startScanner}>
              {scannerReady ? 'Stop Camera' : 'Start Camera'}
            </Button>
          </div>
          <div id="qr-reader" className="w-full overflow-hidden rounded-lg border border-gray-200" />
          {scannerError && <p className="text-sm text-red-600">{scannerError}</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Manual Lookup
          </h2>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              checkInTicket(manualTicket);
              setManualTicket('');
            }}
          >
            <Input
              value={manualTicket}
              onChange={(event) => setManualTicket(event.target.value)}
              placeholder="Enter ticket number"
            />
            <Button type="submit" disabled={processing || !manualTicket.trim()}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check In'}
            </Button>
          </form>
        </div>

        {scanResult && (
          <div
            className={`rounded-lg border p-4 ${
              scanResult.status === 'success'
                ? 'bg-green-50 border-green-200 text-green-900'
                : scanResult.status === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
                  : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.status === 'success' ? (
                <CheckCircle className="w-6 h-6 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 mt-0.5" />
              )}
              <div>
                <h3 className="font-semibold">{scanResult.title}</h3>
                <p className="text-sm">{scanResult.message}</p>
                {(scanResult.attendeeName || scanResult.ticketType) && (
                  <p className="text-sm mt-2">
                    {scanResult.attendeeName || 'Guest'} · {scanResult.ticketType || 'General Admission'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}

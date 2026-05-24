'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, RotateCcw, Search } from 'lucide-react';

interface RefundRow {
  id: string;
  reason?: string;
  amount?: number;
  status: string;
  gateway_status?: string;
  gateway_refund_id?: string;
  dispute_status?: string;
  respondent_email?: string;
  created_at: string;
  processed_at?: string;
    payment?: {
      id: string;
      amount: number;
      currency: string;
      payment_provider?: string;
      payment_id?: string;
      status: string;
      customer_email?: string;
      customer_name?: string;
  };
}

export default function RefundsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session } = useAuth();
  const [refunds, setRefunds] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualRefund, setManualRefund] = useState({
    paymentId: '',
    amount: '',
    reason: '',
  });

  const fetchRefunds = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/refunds?formId=${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      setRefunds(Array.isArray(data.refunds) ? data.refunds : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [session?.access_token]);

  const submitRefund = async (refundRequestId: string, action: 'process' | 'approve' | 'reject') => {
    if (!session?.access_token) return;
    setProcessing(refundRequestId);
    try {
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action,
          refundRequestId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to process refund');
      await fetchRefunds();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process refund');
    } finally {
      setProcessing(null);
    }
  };

  const createRefundRequest = async () => {
    if (!session?.access_token) return;
    setProcessing('manual');
    try {
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'request',
          paymentId: manualRefund.paymentId,
          formId: id,
          organizationId: localStorage.getItem('organizationId'),
          amount: manualRefund.amount ? Number(manualRefund.amount) : undefined,
          reason: manualRefund.reason || 'Refund requested',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to request refund');
      setManualOpen(false);
      setManualRefund({ paymentId: '', amount: '', reason: '' });
      await fetchRefunds();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to request refund');
    } finally {
      setProcessing(null);
    }
  };

  const filteredRefunds = refunds.filter((refund) => {
    const haystack = `${refund.reason || ''} ${refund.respondent_email || ''} ${refund.payment?.customer_name || ''} ${refund.payment?.customer_email || ''} ${refund.status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/forms/${id}`} className="text-primary hover:underline mb-3 inline-block">
            Back to form
          </Link>
          <h1 className="text-3xl font-bold">Refunds</h1>
          <p className="text-gray-600">Process refunds and track dispute status.</p>
        </div>
        <Button onClick={() => setManualOpen((value) => !value)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          New Refund
        </Button>
      </div>

      {manualOpen && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Create Refund Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Payment ID"
              value={manualRefund.paymentId}
              onChange={(event) => setManualRefund((prev) => ({ ...prev, paymentId: event.target.value }))}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={manualRefund.amount}
              onChange={(event) => setManualRefund((prev) => ({ ...prev, amount: event.target.value }))}
            />
            <Input
              className="md:col-span-2"
              placeholder="Reason"
              value={manualRefund.reason}
              onChange={(event) => setManualRefund((prev) => ({ ...prev, reason: event.target.value }))}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={createRefundRequest} disabled={processing === 'manual'}>
              {processing === 'manual' ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => setManualOpen(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search refunds by email, reason, or status"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredRefunds.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No refund requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Request</th>
                  <th className="p-2">Payment</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <p className="font-medium">{refund.reason || 'Refund request'}</p>
                      <p className="text-xs text-gray-500">{refund.respondent_email || refund.payment?.customer_email || '-'}</p>
                      {refund.dispute_status && (
                        <p className="text-xs text-gray-500 mt-1">Dispute: {refund.dispute_status}</p>
                      )}
                    </td>
                    <td className="p-2">
                      <p className="font-mono text-xs">{refund.payment?.payment_id || '-'}</p>
                      <p className="text-xs text-gray-500 capitalize">{refund.payment?.payment_provider || 'manual'}</p>
                    </td>
                    <td className="p-2">₦{Number(refund.amount || refund.payment?.amount || 0).toLocaleString()}</td>
                    <td className="p-2">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs capitalize">
                        {refund.status}
                      </span>
                      {refund.gateway_status && (
                        <p className="text-xs text-gray-500 mt-1">{refund.gateway_status}</p>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {refund.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => submitRefund(refund.id, 'process')}
                              disabled={processing === refund.id}
                            >
                              Process
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => submitRefund(refund.id, 'reject')}
                              disabled={processing === refund.id}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {refund.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => submitRefund(refund.id, 'process')}
                            disabled={processing === refund.id}
                          >
                            Execute Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

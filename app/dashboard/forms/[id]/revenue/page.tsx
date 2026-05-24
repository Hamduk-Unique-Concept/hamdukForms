'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Loader2, TrendingUp, Wallet } from 'lucide-react';

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface GatewayPoint {
  gateway: string;
  revenue: number;
}

interface TransactionRow {
  id: string;
  amount: number;
  currency: string;
  payment_provider?: string;
  status: string;
  paid_at?: string;
  created_at: string;
  customer_email?: string;
  customer_name?: string;
  description?: string;
  payment_id?: string;
}

export default function RevenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<any>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualPayment, setManualPayment] = useState({
    amount: '',
    currency: 'NGN',
    customerEmail: '',
    customerName: '',
    description: '',
    paymentProvider: 'bank_transfer',
    paymentMethodOverride: 'bank_transfer',
  });

  useEffect(() => {
    const fetchRevenue = async () => {
      if (!session?.access_token) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics/revenue/${id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await response.json();
        setRevenue(data);
      } catch (error) {
        console.error('Revenue load error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [id, session?.access_token]);

  const handleManualSave = async () => {
    if (!session?.access_token) return;
    setManualSaving(true);
    try {
      const response = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          organizationId: localStorage.getItem('organizationId'),
          formId: id,
          amount: Number(manualPayment.amount),
          currency: manualPayment.currency,
          customerEmail: manualPayment.customerEmail || undefined,
          customerName: manualPayment.customerName || undefined,
          description: manualPayment.description || undefined,
          paymentProvider: manualPayment.paymentProvider,
          paymentMethodOverride: manualPayment.paymentMethodOverride,
          status: 'completed',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to record payment');
      setManualOpen(false);
      setManualPayment({
        amount: '',
        currency: 'NGN',
        customerEmail: '',
        customerName: '',
        description: '',
        paymentProvider: 'bank_transfer',
        paymentMethodOverride: 'bank_transfer',
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to record payment');
    } finally {
      setManualSaving(false);
    }
  };

  const downloadCsv = () => {
    const rows = (revenue?.recentTransactions || []) as TransactionRow[];
    const csv = [
      ['reference', 'amount', 'currency', 'provider', 'status', 'paid_at', 'customer_email', 'customer_name', 'description'].join(','),
      ...rows.map((row) => [
        row.payment_id || row.id,
        row.amount,
        row.currency,
        row.payment_provider || '',
        row.status,
        row.paid_at || row.created_at,
        row.customer_email || '',
        row.customer_name || '',
        (row.description || '').replaceAll(',', ' '),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = Number(revenue?.totalRevenue || 0);
  const totalTransactions = Number(revenue?.totalTransactions || 0);
  const averageOrderValue = Number(revenue?.averageOrderValue || 0);
  const refundRate = Number(revenue?.refundRate || 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/forms/${id}`} className="text-primary hover:underline mb-3 inline-block">
            Back to form
          </Link>
          <h1 className="text-3xl font-bold">Revenue</h1>
          <p className="text-gray-600">Track form revenue, refunds, and payment channels.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadCsv} disabled={!revenue?.recentTransactions?.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setManualOpen((value) => !value)}>
            <Wallet className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {manualOpen && (
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Record Manual Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Amount"
              value={manualPayment.amount}
              onChange={(event) => setManualPayment((prev) => ({ ...prev, amount: event.target.value }))}
            />
            <Input
              placeholder="Currency"
              value={manualPayment.currency}
              onChange={(event) => setManualPayment((prev) => ({ ...prev, currency: event.target.value }))}
            />
            <Input
              placeholder="Customer email"
              value={manualPayment.customerEmail}
              onChange={(event) => setManualPayment((prev) => ({ ...prev, customerEmail: event.target.value }))}
            />
            <Input
              placeholder="Customer name"
              value={manualPayment.customerName}
              onChange={(event) => setManualPayment((prev) => ({ ...prev, customerName: event.target.value }))}
            />
            <Input
              className="md:col-span-2"
              placeholder="Description"
              value={manualPayment.description}
              onChange={(event) => setManualPayment((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleManualSave} disabled={manualSaving}>
              {manualSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => setManualOpen(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">₦{totalRevenue.toLocaleString()}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-3xl font-bold mt-2">₦{averageOrderValue.toLocaleString()}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-3xl font-bold mt-2">{totalTransactions}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-gray-600">Refund Rate</p>
              <p className="text-3xl font-bold mt-2">{refundRate}%</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue by Gateway
              </h2>
              <div className="space-y-3">
                {(revenue?.revenueByGateway || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No completed payments yet.</p>
                ) : (
                  (revenue.revenueByGateway as GatewayPoint[]).map((item) => (
                    <div key={item.gateway} className="flex items-center justify-between">
                      <span className="capitalize">{item.gateway}</span>
                      <span className="font-medium">₦{Number(item.revenue || 0).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-4">Revenue by Day</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {(revenue?.revenueByDay || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No data yet.</p>
                ) : (
                  (revenue.revenueByDay as RevenuePoint[]).map((point) => (
                    <div key={point.date} className="flex items-center justify-between text-sm">
                      <span>{point.date}</span>
                      <span>₦{Number(point.revenue || 0).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="font-semibold mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Reference</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Gateway</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(revenue?.recentTransactions || []).length === 0 ? (
                    <tr>
                      <td className="p-4 text-center text-gray-500" colSpan={5}>
                        No transactions yet.
                      </td>
                    </tr>
                  ) : (
                    (revenue.recentTransactions as TransactionRow[]).map((row) => (
                      <tr key={row.id} className="border-b">
                        <td className="p-2 font-mono">{row.payment_id || row.id}</td>
                        <td className="p-2">
                          <p>{row.customer_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{row.customer_email || '-'}</p>
                        </td>
                        <td className="p-2">₦{Number(row.amount || 0).toLocaleString()}</td>
                        <td className="p-2 capitalize">{row.payment_provider || 'manual'}</td>
                        <td className="p-2">
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
